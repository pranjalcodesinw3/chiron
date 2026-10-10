import { useQuery } from '@tanstack/react-query';
import { decodeErrorResult, decodeFunctionData, parseEventLogs, toFunctionSelector, type Address, type Hex, type PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';
import { archive, BLOCKSCOUT_API, chain, DEPLOY_BLOCK, modelName } from '../../chain';
import { accountAbi } from '../../abi/AgentAccount.generated';
import { fmtToken, fmtWhen, short } from '../../lib/format';

export type GateRow = {
  key: string;
  tone: 'ok' | 'refuse';
  title: string;
  sub: string;
  tag: string;
  tx: Hex;
  block: bigint;
  order: number;
  time?: bigint;
  /** What a trade row's receipt hash is recomputed from: the recorded hashes and the tx whose calldata carries the receipt. */
  receipt?: { requestHash: Hex; responseHash: Hex; served: Hex; carrierTx: Hex };
};

export type TokenInfo = { address: Address; symbol: string; decimals: number };

/** One reverted transaction to the account. */
export type Refusal = {
  hash: Hex;
  block: bigint;
  position: number;
  time: bigint;
  from: Address;
  method: string;
  selector?: Hex;
  errorArgs: { name: string; value: string }[];
  input: Hex;
};

// A decoded event, loosely typed: getContractEvents returns a union over every event in the ABI.
export type AccountLog = {
  eventName: string;
  args: Record<string, unknown>;
  blockNumber: bigint;
  logIndex: number;
  transactionHash: Hex;
};

export const modelLabel = (hash: string) => (modelName(hash) ? `${modelName(hash)} (${short(hash)})` : `hash ${short(hash)}`);

const ERROR_SELECTORS = new Map<string, { name: string; argNames: string[] }>(
  accountAbi
    .filter((x) => x.type === 'error')
    .map((x) => [
      toFunctionSelector(`${x.name}(${x.inputs.map((i) => i.type).join(',')})`).toLowerCase(),
      { name: x.name, argNames: x.inputs.map((i) => i.name) },
    ]),
);

/** The custom error a revert selector names in the account's ABI, or undefined. */
export const decodeRevertSelector = (selector: string) => ERROR_SELECTORS.get(selector.toLowerCase());

export const REFUSAL_GLOSS: Record<string, string> = {
  NotAgent: 'Caller is not the admitted agent',
  ExceedsPerTradeCap: 'Trade above the per-trade cap',
  DailyCapExceeded: 'Trade above the daily cap',
  NeedsApproval: 'Trade above the approval line, the owner decides',
  MeasurementNotApproved: 'Code the owner has not approved',
  StaleRefBlock: 'Quote bound to a block more than 256 blocks old',
  QuoteAlreadyUsed: 'Quote already spent once',
  ModelMismatch: 'Served model differs from the owner pin',
  ProposalNotPending: 'Proposal already settled',
  ProposalExpired: 'Proposal lifetime ran out',
  AgentExpired: 'Agent attestation expired',
  PoolNotAllowed: 'Pool outside the owner allow list',
  TokenNotAllowed: 'Token the owner has not allowed',
  IsPaused: 'Account paused by the owner',
  ReceiptInvalid: 'Model receipt did not verify',
  ReceiptAlreadyUsed: 'Model receipt already spent',
  AgentIsOwner: 'Agent key is the owner key',
};

const tokenOf = (tokens: TokenInfo[], a: string) => tokens.find((t) => t.address.toLowerCase() === a.toLowerCase());
const amount = (tokens: TokenInfo[], a: string, v: bigint) => {
  const t = tokenOf(tokens, a);
  return t ? `${fmtToken(v, t.decimals)} ${t.symbol}` : `${v.toString()} of ${short(a)}`;
};

/** Trade summary from execute()/propose() calldata: "1.00 USDG into WETH". Undefined for any other call. */
function tradeFromInput(input: Hex, tokens: TokenInfo[]): string | undefined {
  try {
    const d = decodeFunctionData({ abi: accountAbi, data: input });
    if (d.functionName !== 'execute' && d.functionName !== 'propose' && d.functionName !== 'approveTrade') return undefined;
    const t = (d.functionName === 'approveTrade' ? d.args[1] : d.args[0]) as {
      key: { currency0: Address; currency1: Address };
      zeroForOne: boolean;
      amountIn: bigint;
    };
    const [a, b] = t.zeroForOne ? [t.key.currency0, t.key.currency1] : [t.key.currency1, t.key.currency0];
    return `${amount(tokens, a, t.amountIn)} into ${tokenOf(tokens, b)?.symbol ?? short(b)}`;
  } catch {
    return undefined;
  }
}

export function refusalRow(r: Refusal, tokens: TokenInfo[]): GateRow {
  const err = r.selector ? decodeRevertSelector(r.selector) : undefined;
  const name = err?.name ?? 'reverted';
  const trade = tradeFromInput(r.input, tokens);
  const args = r.errorArgs.map((a) => `${a.name} ${a.value}`).join(', ');
  return {
    key: `ref-${r.hash}`,
    tone: 'refuse',
    title: err ? (REFUSAL_GLOSS[name] ?? `${r.method}() refused`) : `${r.method}() reverted, no reason returned`,
    sub: [`${r.method}() from ${short(r.from)}`, trade, args ? `${name}(${args})` : undefined].filter(Boolean).join(' · '),
    tag: err ? `${name}()` : 'REVERTED',
    tx: r.hash,
    block: r.block,
    order: r.position,
    time: r.time,
  };
}

const TAGS = new Set(['TradeExecuted', 'TradeProposed', 'TradeRejected', 'ProposalCancelled', 'AgentRegistered', 'AgentRevoked', 'MeasurementSet', 'ModelSet']);

/** Account events and reverted calls, merged into one newest-first list. Pure: unit-tested. */
export function buildGateRows(logs: AccountLog[], refusals: Refusal[], times: Map<bigint, bigint>, tokens: TokenInfo[]): GateRow[] {
  const rows: GateRow[] = [];
  for (const l of logs) {
    if (!TAGS.has(l.eventName)) continue;
    const a = l.args as Record<string, any>;
    const base = { key: `${l.transactionHash}-${l.logIndex}`, tx: l.transactionHash, block: l.blockNumber, order: l.logIndex, time: times.get(l.blockNumber), tone: 'ok' as const };
    switch (l.eventName) {
      case 'TradeExecuted': {
        const via = (a.proposalId as bigint) > 0n;
        rows.push({
          ...base,
          title: `${via ? `Proposal ${a.proposalId} approved: ` : ''}${amount(tokens, a.tokenIn, a.amountIn)} into ${amount(tokens, a.tokenOut, a.amountOut)}`,
          sub: `Trade ${a.tradeId} · model ${modelLabel(a.servedModelHash)}`,
          tag: via ? 'APPROVED' : 'EXECUTED',
          receipt: {
            requestHash: a.requestHash,
            responseHash: a.responseHash,
            served: a.servedModelHash,
            carrierTx: via ? (logs.find((x) => x.eventName === 'TradeProposed' && (x.args as Record<string, unknown>).proposalId === a.proposalId)?.transactionHash ?? l.transactionHash) : l.transactionHash,
          },
        });
        break;
      }
      case 'TradeProposed': {
        const t = a.trade as { key: { currency0: Address; currency1: Address }; zeroForOne: boolean; amountIn: bigint };
        const from = t.zeroForOne ? t.key.currency0 : t.key.currency1;
        rows.push({ ...base, title: `Proposal ${a.proposalId}: ${amount(tokens, from, t.amountIn)} above the approval line`, sub: `Waits for the owner · model ${modelLabel(a.servedModelHash)}`, tag: 'PROPOSED' });
        break;
      }
      case 'TradeRejected':
        rows.push({ ...base, title: `Proposal ${a.proposalId} rejected by the owner`, sub: 'Closed without a trade', tag: 'REJECTED' });
        break;
      case 'ProposalCancelled':
        rows.push({ ...base, title: `Proposal ${a.proposalId} cancelled`, sub: 'Closed without a trade', tag: 'CANCELLED' });
        break;
      case 'AgentRegistered':
        rows.push({ ...base, title: `Agent ${short(a.agent)} admitted: its Intel TDX quote verified on chain`, sub: `Code ${short(a.measurement)} · key expires ${fmtWhen(a.expiry)}`, tag: 'ADMITTED' });
        break;
      case 'AgentRevoked':
        rows.push({ ...base, title: `Agent ${short(a.agent)} revoked`, sub: 'Its key can no longer trade', tag: 'REVOKED' });
        break;
      case 'MeasurementSet':
        rows.push({ ...base, title: `Owner ${a.approved ? 'approved' : 'withdrew'} code ${short(a.measurement)}`, sub: a.approved ? 'An agent running it can be admitted' : 'An agent running it is turned away', tag: a.approved ? 'APPROVED CODE' : 'WITHDRAWN' });
        break;
      case 'ModelSet':
        rows.push({ ...base, title: `Model pinned: ${modelName(a.requestedModelHash) ?? short(a.requestedModelHash)}`, sub: 'Every trade must carry a receipt from this model', tag: 'PINNED' });
        break;
    }
  }
  for (const r of refusals) rows.push(refusalRow(r, tokens));
  return rows.sort((x, y) => (x.block === y.block ? y.order - x.order : x.block < y.block ? 1 : -1));
}

/** Revert data of a mined, reverted call: replayed one block before it on the archive node. */
export async function replayRevert(tx: { from: Address; to: Address | null; input: Hex; value: bigint }, block: bigint): Promise<Hex | undefined> {
  try {
    await archive.call({ account: tx.from, to: tx.to ?? undefined, data: tx.input, value: tx.value, blockNumber: block - 1n });
  } catch (e) {
    for (let cur = e as { data?: unknown; cause?: unknown } | undefined; cur; cur = cur.cause as typeof cur) {
      if (typeof cur.data === 'string' && cur.data.startsWith('0x') && cur.data.length >= 10) return cur.data as Hex;
    }
  }
  return undefined;
}

/** A reverted call decoded against the account ABI. */
export async function readRefusal(c: PublicClient, hash: Hex): Promise<Refusal> {
  const [tx, rc] = await Promise.all([c.getTransaction({ hash }), c.getTransactionReceipt({ hash })]);
  const [data, blk] = await Promise.all([replayRevert(tx, rc.blockNumber), c.getBlock({ blockNumber: rc.blockNumber })]);
  let errorArgs: Refusal['errorArgs'] = [];
  if (data) {
    try {
      const err = decodeErrorResult({ abi: accountAbi, data });
      const names = decodeRevertSelector(data.slice(0, 10))?.argNames ?? [];
      errorArgs = (err.args ?? []).map((v, i) => ({ name: names[i] ?? `arg${i}`, value: String(v) }));
    } catch {
      // revert data outside the account ABI: the row says so
    }
  }
  let method = 'call';
  try {
    method = decodeFunctionData({ abi: accountAbi, data: tx.input }).functionName;
  } catch {
    // not an account function
  }
  return { hash, block: rc.blockNumber, position: rc.transactionIndex, time: blk.timestamp, from: tx.from, method, selector: data?.slice(0, 10) as Hex | undefined, errorArgs, input: tx.input };
}

/** Reverted calls to the account: Blockscout's index enumerates them (a revert emits no log), the chain decodes them. */
export async function readRefusals(c: PublicClient, account: Address): Promise<Refusal[]> {
  const hashes: Hex[] = [];
  let url: string | undefined = `${BLOCKSCOUT_API}/addresses/${account}/transactions?filter=to`;
  for (let page = 0; url && page < 5; page++) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Blockscout ${r.status}`);
    const j: { items: { hash: Hex; status: string }[]; next_page_params: Record<string, string> | null } = await r.json();
    for (const t of j.items) if (t.status === 'error') hashes.push(t.hash);
    url = j.next_page_params ? `${BLOCKSCOUT_API}/addresses/${account}/transactions?filter=to&${new URLSearchParams(j.next_page_params)}` : undefined;
  }
  return Promise.all(hashes.map((h) => readRefusal(c, h)));
}

const blockTimes = new Map<bigint, bigint>();
async function timesFor(c: PublicClient, blocks: bigint[]) {
  await Promise.all(blocks.filter((b) => !blockTimes.has(b)).map(async (b) => blockTimes.set(b, (await c.getBlock({ blockNumber: b })).timestamp)));
  return blockTimes;
}

export type GateLogData = { head: bigint; logs: AccountLog[]; times: Map<bigint, bigint>; refusals: Refusal[]; refusalsError?: string };

/** Every account event from the deploy block to the head (one bounded getLogs), plus the reverted calls. */
export function useGateLog(account: Address) {
  const client = usePublicClient({ chainId: chain.id });
  return useQuery({
    queryKey: ['gatelog', account],
    enabled: !!client,
    refetchInterval: 20_000,
    retry: 1,
    queryFn: async (): Promise<GateLogData> => {
      const c = client as PublicClient;
      const head = await c.getBlockNumber();
      const refusalsP = readRefusals(c, account).then(
        (refusals) => ({ refusals, refusalsError: undefined as string | undefined }),
        (e: unknown) => ({ refusals: [] as Refusal[], refusalsError: e instanceof Error ? e.message : String(e) }),
      );
      // Unfiltered getLogs. getContractEvents sends every event topic in one OR, and this RPC rejects that body.
      const raw = await c.getLogs({ address: account, fromBlock: DEPLOY_BLOCK, toBlock: head });
      const logs = parseEventLogs({ abi: accountAbi, logs: raw }) as unknown as AccountLog[];
      const times = await timesFor(c, [...new Set(logs.map((l) => l.blockNumber))]);
      // ponytail: one hung archive replay must not block the trade list. Drop refusals after 12s.
      const refusals = await Promise.race([
        refusalsP,
        new Promise<{ refusals: Refusal[]; refusalsError: string }>((resolve) => {
          setTimeout(() => resolve({ refusals: [], refusalsError: 'refusal index timed out' }), 12_000);
        }),
      ]);
      return { head, logs, times, ...refusals };
    },
  });
}
