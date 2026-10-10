import { createConfig, http } from 'wagmi';
import { createPublicClient, defineChain, keccak256, toHex, type Address, type Hex } from 'viem';

// The live deployment, contracts/deployments/421614-account.json (chain.test.ts holds these to that file).
export const ACCOUNT: Address = '0x5EaE79705e7581709947930BaBE3a9Ba3d55164D';
export const FACTORY: Address = '0xC767f515c0232572e0ADC78AF1098faa1c073347';
export const VERIFIER: Address = '0x3c19C10E5C9a82D01ED79E5c6026D73B9b2CAF8c';
export const USDG: Address = '0xFFC95faa3d63Cde504a05B567C600B78C0b41892';
export const WETH: Address = '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73';
export const DEPLOY_BLOCK = 315956395n;
/** Phala's inference gateway measurement; the spike admitted a quote carrying it, then the owner withdrew it. */
export const GATEWAY_MEASUREMENT: Hex = '0xfd34caabef222327146cb5c059810f08bf7c41adb6cc48312be21cc228020149';
export const MODEL_ID = 'phala/qwen3.8-27b-uncensored';
export const MODELS: Record<string, string> = { [keccak256(toHex(MODEL_ID))]: MODEL_ID };
export const modelName = (hash: string) => MODELS[hash.toLowerCase()];

const RPC = (import.meta.env.VITE_RPC_URL as string | undefined)?.trim() || 'https://sepolia-rollup.arbitrum.io/rpc';
// Most Arbitrum Sepolia nodes prune old state; this gateway answers eth_call at any past block, so a mined
// refusal can be replayed for its revert data.
const ARCHIVE_RPC = 'https://arbitrum-sepolia.gateway.tenderly.co';

export const chain = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: { default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' } },
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

export const archive = createPublicClient({ chain, transport: http(ARCHIVE_RPC) });

/** Blockscout indexes reverted calls, which emit no log; it is the only way to enumerate them. */
export const BLOCKSCOUT_API = 'https://arbitrum-sepolia.blockscout.com/api/v2';

const EXPLORER = 'https://sepolia.arbiscan.io';
export const explorer = {
  address: (a: string) => `${EXPLORER}/address/${a}`,
  tx: (h: string) => `${EXPLORER}/tx/${h}`,
  block: (n: bigint | number) => `${EXPLORER}/block/${n.toString()}`,
};
