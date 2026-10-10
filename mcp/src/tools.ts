import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { accountState, CHAIN_KEYS, chironClient, explainRefusal, netFor, verifyReceipt } from './chain.js';

const hash = z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'a 32-byte hex transaction hash');
const addr = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'a 20-byte hex address');
const chain = z.enum(CHAIN_KEYS).optional().describe('robinhood-testnet (46630) or arbitrum-sepolia (421614); defaults to the server CHIRON_CHAIN, else arbitrum-sepolia');
const json = (v: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(v, null, 2) }] });

/** The three Chiron tools on one server; stdio (server.ts) and Streamable HTTP (api/mcp.ts) both serve it. */
export function buildServer(rpcUrl?: string): McpServer {
  // A custom RPC URL applies to the server's default chain only; a tool call naming the other chain uses its public RPC.
  const def = netFor();
  const clientFor = (key?: string) => { const n = netFor(key ?? def.key); return chironClient(n.key === def.key ? rpcUrl : undefined, n); };
  const server = new McpServer({ name: 'chiron', version: '0.1.0' });
  server.registerTool(
    'verify_receipt',
    {
      description: 'Verify a Chiron trade on Robinhood Chain testnet (46630) or Arbitrum Sepolia (421614). Recomputes the receipt hash from chain data, checks the recorded model hash against the account model pin. verified is false unless every check passes.',
      inputSchema: { tx_hash: hash, expected_served_model_hash: hash.optional(), chain },
    },
    async ({ tx_hash, expected_served_model_hash, chain: k }) => json(await verifyReceipt(clientFor(k), tx_hash as `0x${string}`, { expectedServed: expected_served_model_hash as `0x${string}` | undefined })),
  );

  server.registerTool(
    'account_state',
    { description: 'Read a Chiron AgentAccount: agent, measurement, expiry, caps and recent trades.', inputSchema: { account: addr, chain } },
    async ({ account, chain: k }) => json(await accountState(clientFor(k), account as `0x${string}`)),
  );

  server.registerTool(
    'explain_refusal',
    { description: 'Explain in plain words why a reverted Chiron account transaction was refused (decodes the custom error).', inputSchema: { tx_hash: hash, chain } },
    async ({ tx_hash, chain: k }) => json(await explainRefusal(clientFor(k), tx_hash as `0x${string}`)),
  );
  return server;
}
