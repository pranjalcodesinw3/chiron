// The two networks CHIRON runs on. CHAIN selects one (robinhood-testnet | arbitrum-sepolia);
// RPC_URL, CHAIN_ID, ACCOUNT_ADDRESS and ASSAY_ADDRESS still override single fields. In the CVM,
// CHAIN comes from the compose file, so the network is part of the measurement.
import type { Address } from 'viem';

export type ChainKey = 'robinhood-testnet' | 'arbitrum-sepolia';

export interface ChainPreset {
  key: ChainKey;
  id: number;
  name: string;
  rpc: string;
  /** eth_call at past blocks (refusal replay); the default RPC where it already keeps history. */
  archiveRpc: string;
  explorer: string;
  /** The live AgentAccount the agent, keeper and CVM default to. */
  account: Address;
  /** First block worth scanning for the account's events. */
  deployBlock: bigint;
  /** The Assay holding the gateway signer and receipt keys the account checks. */
  assay: Address;
  usdg: Address;
  /** The asset the agent buys with USDG through the account's allowlisted v4 pool. */
  asset: { symbol: string; address: Address };
  v4Quoter: Address;
}

export const CHAINS: Record<ChainKey, ChainPreset> = {
  // contracts/deployments/46630.json and docs/e2e/robinhood-testnet-agent-account.md
  'robinhood-testnet': {
    key: 'robinhood-testnet',
    id: 46630,
    name: 'Robinhood Chain Testnet',
    rpc: 'https://rpc.testnet.chain.robinhood.com',
    archiveRpc: 'https://rpc.testnet.chain.robinhood.com',
    explorer: 'https://explorer.testnet.chain.robinhood.com',
    account: '0xFaaAa4d1ee944d317b10233505D8c57425C53b55',
    deployBlock: 127033401n,
    assay: '0xcF4a98E21D4180b32B9726ef3d0A550A69973f9d',
    usdg: '0x7E955252E15c84f5768B83c41a71F9eba181802F',
    asset: { symbol: 'TSLA', address: '0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E' },
    v4Quoter: '0x8dc178efb8111bb0973dd9d722ebeff267c98f94',
  },
  // contracts/deployments/421614-account.json
  'arbitrum-sepolia': {
    key: 'arbitrum-sepolia',
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    archiveRpc: 'https://arbitrum-sepolia.gateway.tenderly.co',
    explorer: 'https://sepolia.arbiscan.io',
    account: '0x5EaE79705e7581709947930BaBE3a9Ba3d55164D',
    deployBlock: 315956000n,
    assay: '0x2C8B2587AC69BB7bB804ced9ebC2c08D0EEFB6c4',
    usdg: '0xFFC95faa3d63Cde504a05B567C600B78C0b41892',
    asset: { symbol: 'WETH', address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73' },
    v4Quoter: '0x7de51022d70a725b508085468052e25e22b5c4c9',
  },
};

const ALIASES: Record<string, ChainKey> = {
  'robinhood-testnet': 'robinhood-testnet', robinhood: 'robinhood-testnet', rhc: 'robinhood-testnet', '46630': 'robinhood-testnet',
  'arbitrum-sepolia': 'arbitrum-sepolia', arbitrum: 'arbitrum-sepolia', arb: 'arbitrum-sepolia', '421614': 'arbitrum-sepolia',
};

/** CHAIN wins; otherwise a CHAIN_ID of a known network; otherwise Arbitrum Sepolia (the default the live CVM was measured with). */
export function resolveChain(env: Record<string, string | undefined> = process.env): ChainPreset {
  const raw = (env.CHAIN ?? '').trim().toLowerCase();
  if (raw) {
    const k = ALIASES[raw];
    if (!k) throw new Error(`CHAIN=${raw} is not one of ${Object.keys(CHAINS).join(', ')}`);
    return CHAINS[k];
  }
  const id = (env.CHAIN_ID ?? '').trim();
  return CHAINS[ALIASES[id] ?? 'arbitrum-sepolia'];
}

export const active: ChainPreset = resolveChain();
