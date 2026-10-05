// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {FullMath} from "@uniswap/v4-core/src/libraries/FullMath.sol";

interface IPermit2Approve {
    function approve(address token, address spender, uint160 amount, uint48 expiration) external;
}

interface IPositionManager {
    function modifyLiquidities(bytes calldata unlockData, uint256 deadline) external payable;
    function nextTokenId() external view returns (uint256);
}

interface IWETH {
    function deposit() external payable;
}

/// The Arbitrum Sepolia venue: Uniswap's v4 deployment on 421614 (docs.uniswap.org deployments,
/// each address read back with `cast code`), canonical WETH, Paxos USDG, and a hookless
/// WETH/USDG pool we create and fund. Shared by the deploy script and the fork test so both run
/// the same code.
library ArbVenue {
    uint256 internal constant CHAIN_ID = 421614;
    address internal constant POOL_MANAGER = 0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317;
    address internal constant POSITION_MANAGER = 0xAc631556d3d4019C95769033B5E719dD77124BAc;
    address internal constant STATE_VIEW = 0x9D467FA9062b6e9B1a46E26007aD82db116c67cB;
    address internal constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address internal constant WETH = 0x980B62Da83eFf3D4576C647993b0c1D7faf17c73;
    /// Paxos Global Dollar on Arbitrum Sepolia (faucet.paxos.com lists it), 6 decimals.
    address internal constant USDG = 0xFFC95faa3d63Cde504a05B567C600B78C0b41892;
    /// Runtime code hash of the PoolManager at POOL_MANAGER, read 2026-10-05 (`cast codehash`).
    bytes32 internal constant POOL_MANAGER_CODEHASH = 0x790926015bb866adc59a6619aaddd47273949f6b3a4e4b43efc9eab8a9c93cdb;
    uint24 internal constant FEE = 3000;
    int24 internal constant TICK_SPACING = 60;

    // v4-periphery src/libraries/Actions.sol
    uint8 internal constant MINT_POSITION = 0x02;
    uint8 internal constant SETTLE_PAIR = 0x0d;

    uint256 internal constant Q96 = 1 << 96;

    function poolKey(address usdg, address asset) internal pure returns (PoolKey memory) {
        (address c0, address c1) = usdg < asset ? (usdg, asset) : (asset, usdg);
        return PoolKey(Currency.wrap(c0), Currency.wrap(c1), FEE, TICK_SPACING, IHooks(address(0)));
    }

    /// sqrt(currency1 / currency0) in Q64.96 for a price of `usdgPerAsset` raw USDG per 1e18
    /// raw asset (an 18-decimal asset such as WETH).
    function sqrtPriceX96(PoolKey memory k, address usdg, uint256 usdgPerAsset) internal pure returns (uint160) {
        (uint256 a0, uint256 a1) = Currency.unwrap(k.currency0) == usdg ? (usdgPerAsset, uint256(1e18)) : (uint256(1e18), usdgPerAsset);
        return uint160(Math.sqrt(FullMath.mulDiv(a1, 1 << 192, a0)));
    }

    function fullRangeTicks() internal pure returns (int24 lower, int24 upper) {
        upper = (TickMath.MAX_TICK / TICK_SPACING) * TICK_SPACING;
        lower = -upper;
    }

    /// Liquidity a full-range position gets from at most amount0 and amount1 at sqrtP
    /// (v4-periphery LiquidityAmounts.getLiquidityForAmounts), less 0.01% for rounding.
    function fullRangeLiquidity(uint160 sqrtP, uint256 amount0, uint256 amount1) internal pure returns (uint128) {
        (int24 lower, int24 upper) = fullRangeTicks();
        uint256 sa = TickMath.getSqrtPriceAtTick(lower);
        uint256 sb = TickMath.getSqrtPriceAtTick(upper);
        uint256 l0 = FullMath.mulDiv(amount0, FullMath.mulDiv(sqrtP, sb, Q96), sb - sqrtP);
        uint256 l1 = FullMath.mulDiv(amount1, Q96, sqrtP - sa);
        uint256 l = (l0 < l1 ? l0 : l1) * 9999 / 10000;
        require(l > 0 && l <= type(uint128).max, "liquidity");
        return uint128(l);
    }

    /// Mint a full-range position through the PositionManager, paying via Permit2.
    function mintFullRange(PoolKey memory k, uint128 liquidity, uint256 amount0Max, uint256 amount1Max, address owner)
        internal
        returns (uint256 tokenId)
    {
        address c0 = Currency.unwrap(k.currency0);
        address c1 = Currency.unwrap(k.currency1);
        IERC20(c0).approve(PERMIT2, amount0Max);
        IERC20(c1).approve(PERMIT2, amount1Max);
        uint48 expiration = uint48(block.timestamp + 1 hours);
        IPermit2Approve(PERMIT2).approve(c0, POSITION_MANAGER, uint160(amount0Max), expiration);
        IPermit2Approve(PERMIT2).approve(c1, POSITION_MANAGER, uint160(amount1Max), expiration);

        (int24 lower, int24 upper) = fullRangeTicks();
        bytes[] memory params = new bytes[](2);
        params[0] = abi.encode(k, lower, upper, uint256(liquidity), uint128(amount0Max), uint128(amount1Max), owner, bytes(""));
        params[1] = abi.encode(k.currency0, k.currency1);
        tokenId = IPositionManager(POSITION_MANAGER).nextTokenId();
        IPositionManager(POSITION_MANAGER).modifyLiquidities(
            abi.encode(abi.encodePacked(MINT_POSITION, SETTLE_PAIR), params), block.timestamp + 1 hours
        );
    }

    /// Initialise the pool at `usdgPerAsset` and add full-range liquidity from `assetAmount`
    /// and the matching USDG. Returns the liquidity minted.
    function createAndFund(address usdg, address asset, uint256 usdgPerAsset, uint256 assetAmount, address owner)
        internal
        returns (PoolKey memory k, uint128 liquidity)
    {
        k = poolKey(usdg, asset);
        uint160 sqrtP = sqrtPriceX96(k, usdg, usdgPerAsset);
        IPoolManager(POOL_MANAGER).initialize(k, sqrtP);
        uint256 usdgAmount = FullMath.mulDivRoundingUp(assetAmount, usdgPerAsset, 1e18) + 1;
        (uint256 a0, uint256 a1) = Currency.unwrap(k.currency0) == usdg ? (usdgAmount, assetAmount) : (assetAmount, usdgAmount);
        liquidity = fullRangeLiquidity(sqrtP, a0, a1);
        mintFullRange(k, liquidity, a0, a1, owner);
    }
}
