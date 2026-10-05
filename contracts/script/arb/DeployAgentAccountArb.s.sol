// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {Assay} from "../../src/Assay.sol";
import {AgentAccount} from "../../src/AgentAccount.sol";
import {AgentAccountFactory} from "../../src/AgentAccountFactory.sol";
import {ArbVenue, IWETH} from "./ArbVenue.sol";

/// Chiron on Arbitrum Sepolia (421614): Assay on Paxos USDG, the WETH/USDG pool on Uniswap's v4
/// PoolManager, the factory, one account, and the owner's configuration. The Stylus Verifier and
/// ReceiptVerifier are passed in; both are already activated on 421614.
///
///   forge script script/arb/DeployAgentAccountArb.s.sol --rpc-url arbitrum_sepolia --broadcast \
///     --private-key "$(cat ../demo/keys/deployer.key)"
///
/// Env (required): VERIFIER, RECEIPT_VERIFIER, GATEWAY_MEASUREMENT (from a fresh gateway quote
///   read through the Verifier), MODEL_ID, SERVED_MODEL_ID, PROVIDER.
/// Env (optional): DEPLOYER (defaults to the script sender), PRIVATE_KEY, USDG_PER_WETH (raw USDG
///   per 1e18 WETH, default 2600e6: a price we choose, not a market price), WETH_LIQUIDITY
///   (default 0.004e18), ACCOUNT_WETH (default 0.002e18), ACCOUNT_USDG (default 20e6),
///   CHANNEL_DEPOSIT (default 5e6), AGENT_MEASUREMENT (approve now; otherwise run
///   approveMeasurement() once the agent CVM has booted).
/// The deployer must hold the USDG (faucet.paxos.com) and the ETH it wraps. It is the owner.
contract DeployAgentAccountArb is Script {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    struct Deployment {
        address deployer;
        address assay;
        address factory;
        address account;
        uint256 channelId;
        uint128 liquidity;
        uint160 sqrtPriceX96;
        bytes32 poolId;
        uint256 block;
    }

    // Live-cycle limits, raw units. Band 1 is up to 2 USDG, band 2 up to 10, and the agent alone
    // may spend 5 USDG per rolling 24 h. WETH bands are the same dollar size at 2,600 USDG/WETH.
    uint128 internal constant USDG_PER_TRADE = 10e6;
    uint128 internal constant USDG_DAILY = 5e6;
    uint128 internal constant USDG_APPROVAL_ABOVE = 2e6;
    uint128 internal constant WETH_PER_TRADE = 0.004e18;
    uint128 internal constant WETH_DAILY = 0.002e18;
    uint128 internal constant WETH_APPROVAL_ABOVE = 0.0008e18;

    function run() external returns (Deployment memory d) {
        d = deploy(msg.sender);
        _record(d);
    }

    function _start(address deployer) internal {
        uint256 key = vm.envOr("PRIVATE_KEY", uint256(0));
        if (key != 0) vm.startBroadcast(key);
        else vm.startBroadcast(deployer);
    }

    function deploy(address sender) public returns (Deployment memory d) {
        require(block.chainid == ArbVenue.CHAIN_ID, "not Arbitrum Sepolia");
        require(ArbVenue.POOL_MANAGER.codehash == ArbVenue.POOL_MANAGER_CODEHASH, "PoolManager code changed");
        d.deployer = vm.envOr("DEPLOYER", sender);
        address verifier = vm.envAddress("VERIFIER");
        address receiptVerifier = vm.envAddress("RECEIPT_VERIFIER");
        bytes32 gatewayM = vm.envBytes32("GATEWAY_MEASUREMENT");
        bytes32 model = keccak256(bytes(vm.envString("MODEL_ID")));
        bytes32 served = keccak256(bytes(vm.envString("SERVED_MODEL_ID")));
        address provider = vm.envAddress("PROVIDER");
        uint256 usdgPerWeth = vm.envOr("USDG_PER_WETH", uint256(2600e6));
        uint256 wethLiquidity = vm.envOr("WETH_LIQUIDITY", uint256(0.004e18));
        uint256 accountWeth = vm.envOr("ACCOUNT_WETH", uint256(0.002e18));
        uint256 accountUsdg = vm.envOr("ACCOUNT_USDG", uint256(20e6));
        uint128 channelDeposit = uint128(vm.envOr("CHANNEL_DEPOSIT", uint256(5e6)));
        bytes32 agentM = vm.envOr("AGENT_MEASUREMENT", bytes32(0));
        require(verifier.code.length != 0 && receiptVerifier.code.length != 0, "Stylus verifiers not deployed");
        uint256 usdgNeeded = wethLiquidity * usdgPerWeth / 1e18 + 1e6 + accountUsdg;
        require(IERC20(ArbVenue.USDG).balanceOf(d.deployer) >= usdgNeeded, "deployer needs faucet USDG");
        require(d.deployer.balance > wethLiquidity + accountWeth, "deployer needs ETH to wrap");

        _start(d.deployer);
        IWETH(ArbVenue.WETH).deposit{value: wethLiquidity + accountWeth}();
        bytes32[] memory approved = new bytes32[](1);
        approved[0] = gatewayM;
        Assay assay = new Assay(ArbVenue.USDG, verifier, receiptVerifier, approved, 86400, 3600, 3600);
        (PoolKey memory key, uint128 liquidity) =
            ArbVenue.createAndFund(ArbVenue.USDG, ArbVenue.WETH, usdgPerWeth, wethLiquidity, d.deployer);
        AgentAccountFactory factory =
            new AgentAccountFactory(verifier, receiptVerifier, address(assay), ArbVenue.POOL_MANAGER, ArbVenue.USDG);
        AgentAccount account = AgentAccount(factory.createAccount(d.deployer));
        account.setLimits(ArbVenue.USDG, AgentAccount.Limits(true, USDG_PER_TRADE, USDG_DAILY, USDG_APPROVAL_ABOVE));
        account.setLimits(ArbVenue.WETH, AgentAccount.Limits(true, WETH_PER_TRADE, WETH_DAILY, WETH_APPROVAL_ABOVE));
        account.setPool(key, true);
        account.setModel(model, [served, model, bytes32(0), bytes32(0)], gatewayM);
        if (agentM != bytes32(0)) account.setMeasurement(agentM, true);
        IERC20(ArbVenue.USDG).transfer(address(account), accountUsdg);
        if (accountWeth != 0) IERC20(ArbVenue.WETH).transfer(address(account), accountWeth);
        d.channelId = account.openInferenceChannel(provider, channelDeposit);
        vm.stopBroadcast();

        d.assay = address(assay);
        d.factory = address(factory);
        d.account = address(account);
        d.liquidity = liquidity;
        d.poolId = PoolId.unwrap(key.toId());
        d.block = block.number;
        _readBack(d, key, gatewayM, model, accountUsdg - channelDeposit, accountWeth);
    }

    /// Every step's read-back; the script fails rather than record a half-configured deploy.
    function _readBack(
        Deployment memory d,
        PoolKey memory key,
        bytes32 gatewayM,
        bytes32 model,
        uint256 usdgLeft,
        uint256 wethLeft
    ) internal {
        Assay assay = Assay(d.assay);
        require(address(assay.usdg()) == ArbVenue.USDG && assay.approvedMeasurement(gatewayM), "Assay wiring");
        (uint160 sqrtP,,,) = IPoolManager(ArbVenue.POOL_MANAGER).getSlot0(key.toId());
        uint128 liq = IPoolManager(ArbVenue.POOL_MANAGER).getLiquidity(key.toId());
        require(sqrtP != 0 && liq == d.liquidity, "pool state");
        d.sqrtPriceX96 = sqrtP;
        AgentAccount a = AgentAccount(d.account);
        require(a.owner() == d.deployer && address(a.poolManager()) == ArbVenue.POOL_MANAGER, "account wiring");
        require(a.allowedPool(key.toId()) && a.requestedModelHash() == model && a.gatewayMeasurement() == gatewayM, "policy");
        (bool allowed,,,) = a.limits(ArbVenue.USDG);
        require(allowed, "limits");
        require(IERC20(ArbVenue.USDG).balanceOf(d.account) == usdgLeft, "usdg deposit");
        require(IERC20(ArbVenue.WETH).balanceOf(d.account) == wethLeft, "weth deposit");
        require(IERC20(ArbVenue.USDG).allowance(d.account, d.assay) == 0, "allowance reset");
        (address chAgent,,,,,,,,,) = assay.channels(d.channelId);
        require(chAgent == d.account, "channel agent");
        console.log("Assay", d.assay);
        console.log("AgentAccountFactory", d.factory);
        console.log("AgentAccount", d.account);
        console.log("inference channel", d.channelId);
    }

    function _record(Deployment memory d) internal {
        string memory c = "contracts";
        vm.serializeAddress(c, "Assay", d.assay);
        vm.serializeAddress(c, "AgentAccountFactory", d.factory);
        vm.serializeAddress(c, "AgentAccount", d.account);
        vm.serializeAddress(c, "PoolManager", ArbVenue.POOL_MANAGER);
        vm.serializeAddress(c, "PositionManager", ArbVenue.POSITION_MANAGER);
        vm.serializeAddress(c, "WETH", ArbVenue.WETH);
        vm.serializeAddress(c, "USDG", ArbVenue.USDG);
        vm.serializeAddress(c, "Verifier", vm.envAddress("VERIFIER"));
        c = vm.serializeAddress(c, "ReceiptVerifier", vm.envAddress("RECEIPT_VERIFIER"));
        string memory p = "pool";
        vm.serializeBytes32(p, "poolId", d.poolId);
        vm.serializeUint(p, "sqrtPriceX96", d.sqrtPriceX96);
        p = vm.serializeUint(p, "liquidity", d.liquidity);
        string memory r = "root";
        vm.serializeUint(r, "chainId", ArbVenue.CHAIN_ID);
        vm.serializeAddress(r, "deployer", d.deployer);
        vm.serializeUint(r, "block", d.block);
        vm.serializeUint(r, "inferenceChannelId", d.channelId);
        vm.serializeString(r, "transactions", "broadcast/DeployAgentAccountArb.s.sol/421614/run-latest.json");
        vm.serializeString(r, "pool", p);
        r = vm.serializeString(r, "contracts", c);
        vm.writeJson(r, "deployments/421614-account.json");
    }

    /// Once the agent CVM has booted: approve its measurement, read from its first quote.
    function approveMeasurement(address account, bytes32 measurement) external {
        _start(msg.sender);
        AgentAccount(account).setMeasurement(measurement, true);
        vm.stopBroadcast();
        require(AgentAccount(account).approvedMeasurement(measurement), "not approved");
    }
}
