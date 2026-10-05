// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {AgentAccount} from "../src/AgentAccount.sol";
import {Assay} from "../src/Assay.sol";
import {DeployAgentAccountArb} from "../script/arb/DeployAgentAccountArb.s.sol";
import {ArbVenue} from "../script/arb/ArbVenue.sol";
import {AgentQuoteVerifier} from "./mocks/AgentQuoteVerifier.sol";
import {MockReceiptVerifier} from "./mocks/MockReceiptVerifier.sol";
import {ArbSysDouble} from "./mocks/ArbSysDouble.sol";

/// Arbitrum Sepolia fork: Paxos USDG, canonical WETH, Uniswap's v4 PoolManager and
/// PositionManager, and the deploy script itself. Doubles only where the fork cannot execute the
/// real thing: the two Stylus verifiers (WASM) and ArbSys (0x64 is a precompile, `0xfe` to the EVM).
///
///   ARB_SEPOLIA_FORK_URL=https://sepolia-rollup.arbitrum.io/rpc forge test --match-path test/AgentAccountArbFork.t.sol
contract AgentAccountArbForkTest is Test {
    bytes32 internal constant AGENT_M = keccak256("chiron-agent-cvm-image");
    bytes32 internal constant GATEWAY_M = keccak256("phala-gateway-image");
    string internal constant MODEL_ID = "deepseek/deepseek-chat-v3-0324";
    string internal constant SERVED_ID = "deepseek-ai/DeepSeek-V3-0324";
    bytes32 internal constant RECEIPT_KEY = keccak256("phala-receipt-ed25519-pubkey");

    address internal deployer = makeAddr("arb-deployer");
    address internal provider = makeAddr("arb-provider");
    address internal agent = makeAddr("arb-agent");
    AgentQuoteVerifier internal verifier;
    MockReceiptVerifier internal receiptVerifier;
    DeployAgentAccountArb.Deployment internal d;
    AgentAccount internal account;
    PoolKey internal key;
    IERC20 internal weth = IERC20(ArbVenue.WETH);
    IERC20 internal usdg = IERC20(ArbVenue.USDG);
    uint256 internal n;

    modifier forked() {
        string memory url = vm.envOr("ARB_SEPOLIA_FORK_URL", string(""));
        if (bytes(url).length == 0) {
            vm.skip(true);
            return;
        }
        // The block before the live deploy: from 315,956,395 on, the WETH/USDG pool this script
        // creates exists on 421614 and initialize() reverts PoolAlreadyInitialized.
        vm.createSelectFork(url, vm.envOr("ARB_SEPOLIA_FORK_BLOCK", uint256(315_956_394)));
        assertEq(block.chainid, ArbVenue.CHAIN_ID);
        _deployViaScript();
        _;
    }

    function _deployViaScript() internal {
        vm.etch(address(0x64), address(new ArbSysDouble()).code);
        verifier = new AgentQuoteVerifier();
        receiptVerifier = new MockReceiptVerifier();
        vm.setEnv("VERIFIER", vm.toString(address(verifier)));
        vm.setEnv("RECEIPT_VERIFIER", vm.toString(address(receiptVerifier)));
        vm.setEnv("GATEWAY_MEASUREMENT", vm.toString(GATEWAY_M));
        vm.setEnv("MODEL_ID", MODEL_ID);
        vm.setEnv("SERVED_MODEL_ID", SERVED_ID);
        vm.setEnv("PROVIDER", vm.toString(provider));
        vm.setEnv("AGENT_MEASUREMENT", vm.toString(AGENT_M));
        vm.setEnv("PRIVATE_KEY", "0");
        deal(ArbVenue.USDG, deployer, 100e6); // what one Paxos faucet claim gives
        vm.deal(deployer, 0.05 ether);
        DeployAgentAccountArb script = new DeployAgentAccountArb();
        d = script.deploy(deployer);
        account = AgentAccount(d.account);
        key = ArbVenue.poolKey(ArbVenue.USDG, ArbVenue.WETH);

        verifier.setKeysetMeasurement(GATEWAY_M);
        Assay(d.assay).registerReceiptKey(hex"01", hex"02", block.number - 1, RECEIPT_KEY);
        account.registerAgent(abi.encode(agent, AGENT_M, account.attestNonce(block.number - 1)), block.number - 1);
    }

    function _trade(bool buy, uint128 amountIn, uint128 minOut) internal returns (uint256 out) {
        bool usdgIs0 = Currency.unwrap(key.currency0) == ArbVenue.USDG;
        AgentAccount.Trade memory t =
            AgentAccount.Trade(key, buy ? usdgIs0 : !usdgIs0, amountIn, minOut, uint64(block.timestamp + 600));
        n++;
        receiptVerifier.setNext(
            true, keccak256(bytes(MODEL_ID)), keccak256(bytes(SERVED_ID)), keccak256(abi.encode("q", n)), keccak256(abi.encode("r", n))
        );
        vm.prank(agent);
        (, out) = account.execute(t, AgentAccount.Receipt(RECEIPT_KEY, "", ""));
    }

    function test_fork_deployScript_readBack() public forked {
        assertEq(account.owner(), deployer);
        assertEq(address(account.poolManager()), ArbVenue.POOL_MANAGER);
        assertEq(account.agent(), agent);
        assertEq(usdg.balanceOf(d.account), 15e6);
        assertEq(weth.balanceOf(d.account), 0.002e18);
        assertGt(d.liquidity, 0);
        // 0.004 WETH in the pool less the 0.01% rounding margin, 0.002 in the account
        assertLt(weth.balanceOf(deployer), 0.000001e18);
        // 100 from the faucet, 10.4 to the pool, 20 to the account
        assertGt(usdg.balanceOf(deployer), 69e6);
    }

    function test_fork_poolManagerCodePinned() public forked {
        assertEq(ArbVenue.POOL_MANAGER.codehash, ArbVenue.POOL_MANAGER_CODEHASH);
    }

    function test_fork_swapWETH_throughPoolManager() public forked {
        uint256 u0 = usdg.balanceOf(d.account);
        uint256 w0 = weth.balanceOf(d.account);
        // 1 USDG at 2,600 USDG per WETH, 0.3% fee, about 10% of the pool's USDG side: well under 1/2600 WETH
        uint256 bought = _trade(true, 1e6, 0.0003e18);
        assertEq(usdg.balanceOf(d.account), u0 - 1e6);
        assertEq(weth.balanceOf(d.account), w0 + bought);
        assertLt(bought, uint256(1e18) / 2600);

        uint256 sold = _trade(false, uint128(bought), 0.9e6);
        assertEq(weth.balanceOf(d.account), w0);
        assertEq(usdg.balanceOf(d.account), u0 - 1e6 + sold);
        assertLt(sold, 1e6);
        assertEq(account.tradeCount(), 2);
    }

    function test_fork_wethPassesCorporateActionCheck_unknownAgentRefused() public forked {
        // WETH has no ERC-8056 hooks; the staticcalls fail and the trade goes through
        _trade(true, 1e6, 1);
        AgentAccount.Trade memory t = AgentAccount.Trade(key, true, 1e6, 1, uint64(block.timestamp + 600));
        vm.prank(makeAddr("stranger"));
        vm.expectRevert(AgentAccount.NotAgent.selector);
        account.execute(t, AgentAccount.Receipt(RECEIPT_KEY, "", ""));
    }
}
