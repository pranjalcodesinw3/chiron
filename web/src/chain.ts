import { createConfig, http } from 'wagmi';
import { createPublicClient, defineChain, keccak256, toHex, type Address, type Hex } from 'viem';

/// CHIRON is live on two networks. `?chain=robinhood` (or `rhc`) reads Robinhood Chain testnet,
/// `?chain=arbitrum` reads Arbitrum Sepolia; VITE_CHAIN sets the default (arbitrum-sepolia). Chosen once
/// per page load; the header's selector reloads with the other value. chain.test.ts holds the
/// addresses to contracts/deployments/{421614-account,46630}.json.
export type ChainKey = 'arbitrum-sepolia' | 'robinhood-testnet';

interface Net {
  key: ChainKey;
  short: string;
  id: number;
  name: string;
  rpc: string;
  /** eth_call at past blocks, for replaying a mined refusal. */
  archiveRpc: string;
  explorerName: string;
  explorerUrl: string;
  /** Blockscout v2 API: indexes reverted calls, which emit no log. */
  blockscoutApi: string;
  /** Blockscout's raw trace carries revert output where the public RPC keeps no history. */
  rawTrace: boolean;
  account: Address;
  factory: Address;
  verifier: Address;
  usdg: Address;
  asset: { symbol: string; address: Address };
  deployBlock: bigint;
}

export const NETS: Record<ChainKey, Net> = {
  'arbitrum-sepolia': {
    key: 'arbitrum-sepolia',
    short: 'Arbitrum',
    id: 421614,
    name: 'Arbitrum Sepolia',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    // Most Arbitrum Sepolia nodes prune old state; this gateway answers eth_call at any past block.
    archiveRpc: 'https://arbitrum-sepolia.gateway.tenderly.co',
    explorerName: 'Arbiscan',
    explorerUrl: 'https://sepolia.arbiscan.io',
    blockscoutApi: 'https://arbitrum-sepolia.blockscout.com/api/v2',
    rawTrace: false,
    account: '0x5EaE79705e7581709947930BaBE3a9Ba3d55164D',
    factory: '0xC767f515c0232572e0ADC78AF1098faa1c073347',
    verifier: '0x3c19C10E5C9a82D01ED79E5c6026D73B9b2CAF8c',
    usdg: '0xFFC95faa3d63Cde504a05B567C600B78C0b41892',
    asset: { symbol: 'WETH', address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73' },
    deployBlock: 315956395n,
  },
  'robinhood-testnet': {
    key: 'robinhood-testnet',
    short: 'Robinhood Chain',
    id: 46630,
    name: 'Robinhood Chain Testnet',
    rpc: 'https://rpc.testnet.chain.robinhood.com',
    archiveRpc: 'https://rpc.testnet.chain.robinhood.com',
    explorerName: 'Robinhood Chain explorer',
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    blockscoutApi: 'https://explorer.testnet.chain.robinhood.com/api/v2',
    rawTrace: true,
    // The account with the attested TSLA buys and the mined refusals (docs/e2e/robinhood-testnet-agent-account.md).
    account: '0x9c69A43F16E994Ce45e9EE896E2D01369b0Aaa6D',
    factory: '0xA5b57CA7961A96E75E3Ed1915F5677382d44F24e',
    verifier: '0x3c19C10E5C9a82D01ED79E5c6026D73B9b2CAF8c',
    usdg: '0x3500DaF0ADcE615A0bEF108FF0751ABb34b1FfCC',
    asset: { symbol: 'TSLA', address: '0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E' },
    deployBlock: 127033401n,
  },
};

export function parseChainKey(raw: string | null | undefined): ChainKey | undefined {
  const k = (raw ?? '').trim().toLowerCase();
  if (['robinhood', 'robinhood-testnet', 'rhc', '46630'].includes(k)) return 'robinhood-testnet';
  if (['arbitrum', 'arbitrum-sepolia', 'arb', '421614'].includes(k)) return 'arbitrum-sepolia';
  return undefined;
}

const fromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
export const NET_KEY: ChainKey =
  parseChainKey(fromUrl?.get('chain') ?? fromUrl?.get('net')) ?? parseChainKey(import.meta.env.VITE_CHAIN as string | undefined) ?? 'arbitrum-sepolia';
export const net = NETS[NET_KEY];
// The page accent follows the selected network (tokens.css [data-chain]).
if (typeof document !== 'undefined') document.documentElement.dataset.chain = NET_KEY;
export const otherNet = NETS[NET_KEY === 'robinhood-testnet' ? 'arbitrum-sepolia' : 'robinhood-testnet'];

export const ACCOUNT: Address = net.account;
export const FACTORY: Address = net.factory;
export const VERIFIER: Address = net.verifier;
export const USDG: Address = net.usdg;
export const ASSET: Address = net.asset.address;
export const ASSET_SYMBOL = net.asset.symbol;
/** Kept for callers written against the Arbitrum deployment. */
export const WETH: Address = NETS['arbitrum-sepolia'].asset.address;
export const DEPLOY_BLOCK = net.deployBlock;
/** Phala's inference gateway measurement; the spike admitted a quote carrying it, then the owner withdrew it. */
export const GATEWAY_MEASUREMENT: Hex = '0xfd34caabef222327146cb5c059810f08bf7c41adb6cc48312be21cc228020149';
export const MODEL_ID = 'phala/qwen3.8-27b-uncensored';
const MODEL_IDS = [MODEL_ID, 'meta-llama/llama-3.3-70b-instruct', 'llama3-3-70b'];
export const MODELS: Record<string, string> = Object.fromEntries(MODEL_IDS.map((m) => [keccak256(toHex(m)), m]));
export const modelName = (hash: string) => MODELS[hash.toLowerCase()];

const envRpc = (import.meta.env.VITE_RPC_URL as string | undefined)?.trim();
const RPC = (NET_KEY === 'arbitrum-sepolia' ? envRpc : (import.meta.env.VITE_RHC_RPC_URL as string | undefined)?.trim()) || net.rpc;

export const chain = defineChain({
  id: net.id,
  name: net.name,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: { default: { name: net.explorerName, url: net.explorerUrl } },
  contracts: { multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' } },
});

export const wagmiConfig = createConfig({
  chains: [chain],
  multiInjectedProviderDiscovery: true,
  transports: { [chain.id]: http(undefined, { batch: { batchSize: 30, wait: 16 } }) },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}

export const archive = createPublicClient({ chain, transport: http(net.archiveRpc) });

export const BLOCKSCOUT_API = net.blockscoutApi;
/** Set where the public RPC keeps no history, so a refusal's revert output comes from the explorer's raw trace. */
export const RAW_TRACE = net.rawTrace ? (hash: string) => `${net.blockscoutApi}/transactions/${hash}/raw-trace` : undefined;

const explorerAt = (url: string) => ({
  address: (a: string) => `${url}/address/${a}`,
  tx: (h: string) => `${url}/tx/${h}`,
  block: (n: bigint | number) => `${url}/block/${n.toString()}`,
});
export const explorer = explorerAt(net.explorerUrl);

/** The same page on the other network (drops ?account, which names an account on this one). */
export function hrefFor(key: ChainKey): string {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  p.delete('account');
  p.delete('net');
  p.set('chain', key === 'robinhood-testnet' ? 'robinhood' : 'arbitrum');
  return `?${p.toString()}`;
}
