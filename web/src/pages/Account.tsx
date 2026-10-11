import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import type { PublicClient } from 'viem';
import { Link, useSearchParams } from 'react-router-dom';
import { getAddress, isAddress, parseEventLogs, type Address } from 'viem';
import { useConnection, useSwitchChain, useWriteContract } from 'wagmi';
import { ACCOUNT, ASSET_SYMBOL, chain, explorer, FACTORY, modelName, net } from '../chain';
import { Chip, type Tone } from '../components/Chip';
import { CapRuler, markNumbers } from '../components/CapRuler';
import { factoryAbi } from '../abi/AgentAccount.generated';
import { GateLog } from '../components/GateLog';
import { HexValue, Stamp } from '../components/Stamp';
import { Wallet } from '../components/Wallet';
import { useAtBlock } from '../hooks/useAtBlock';
import { useTx } from '../hooks/useTx';
import { fmtCountdown, fmtToken, fmtWhen, short } from '../lib/format';
import { OwnerActions } from './account/OwnerActions';
import { buildGateRows, currentAdmission, useGateLog, type AccountLog, type GateRow } from './account/gateRows';
import { latestPin, recheck } from './account/receiptCheck';
import { readAccount, ZERO_ADDR, type Snapshot } from './account/read';

function CreateAccount() {
  const conn = useConnection();
  const { mutate: switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const tx = useTx(() => {});
  const [made, setMade] = useState<Address>();
  const wrongChain = conn.isConnected && conn.chainId !== chain.id;

  async function click() {
    if (wrongChain) return switchChain({ chainId: chain.id });
    const receipt = await tx.run('Create account', () =>
      writeContractAsync({ address: FACTORY, abi: factoryAbi, functionName: 'createAccount', args: [conn.address as Address], chainId: chain.id }),
    );
    const [created] = receipt ? parseEventLogs({ abi: factoryAbi, eventName: 'AccountCreated', logs: receipt.logs }) : [];
    if (created) setMade(created.args.account);
  }

  return (
    <div className="create">
      <p className="small">Any wallet can deploy its own account from the factory. Only that wallet controls it.</p>
      {conn.isConnected ? (
        <>
        <p className="sign-summary"><b>What you sign:</b> a new account owned by your wallet on {chain.name}, with no funds, no agent and no caps until you set them.</p>
        <button className="btn" type="button" disabled={tx.busy} onClick={click}>
          {tx.state.phase === 'signing' ? 'Confirm in the wallet' : tx.state.phase === 'mining' ? 'Waiting for the receipt' : wrongChain ? `Switch to ${chain.name}` : 'Create my account'}
        </button>
        </>
      ) : (
        <Wallet />
      )}
      {made && (
        <p className="small">
          Created <Link to={`/?account=${made}`}>{short(made)}</Link>.
        </p>
      )}
    </div>
  );
}

function agentState(snap: Snapshot, now: bigint): { tone: Tone; label: string; detail: string } {
  if (snap.agent === ZERO_ADDR) return { tone: 'neutral', label: 'No agent', detail: 'no key can trade until one is admitted' };
  const left = Number(snap.agentExpiry - now);
  return left > 0 ? { tone: 'ok', label: 'Admitted', detail: `${fmtCountdown(left)} left on its quote` } : { tone: 'warn', label: 'Expired', detail: 'attestation expired' };
}

/** One of the four checks a trade passes, with its live state. */
function Gate({ n, label, value, foot, refused }: { n: number; label: string; value: ReactNode; foot?: ReactNode; refused?: number }) {
  return (
    <li className="gate">
      <span className="gate-n" aria-hidden="true">{n}</span>
      <span className="gate-label">{label}</span>
      <span className="gate-value tnum">{value}</span>
      {foot && <span className="gate-foot">{foot}</span>}
      {refused !== undefined && (
        <span className="gate-refused">{refused ? <Chip tone="bad">{refused} refused here</Chip> : <span className="hint">none refused here</span>}</span>
      )}
    </li>
  );
}

/** Which of the four checks a custom error belongs to (index 0-3), or undefined for errors outside the gate (e.g. a settled proposal). */
const STEP_OF: Record<string, number> = {
  NotAgent: 0, AgentExpired: 0, QuoteAlreadyUsed: 0, StaleRefBlock: 0, AgentIsOwner: 0, ProposerNotCurrentAgent: 0,
  MeasurementNotApproved: 1,
  ExceedsPerTradeCap: 2, DailyCapExceeded: 2, NeedsApproval: 2, TokenNotAllowed: 2, PoolNotAllowed: 2, CorporateActionPending: 2, IsPaused: 2,
  ModelMismatch: 3, ReceiptInvalid: 3, ReceiptKeyNotRegistered: 3, GatewayMeasurementMismatch: 3, ReceiptKeyExpired: 3, ReceiptAlreadyUsed: 3, ModelNotSet: 3,
};

/** Rechecks every trade receipt in the browser; shares the cache key the feed's per-row chips read. */
function useRecheckAll(account: Address, rows: GateRow[], logs: AccountLog[] | undefined, enabled: boolean) {
  const client = usePublicClient({ chainId: chain.id });
  const pin = logs ? latestPin(logs) : undefined;
  const qs = useQueries({
    queries: rows.map((row) => ({
      queryKey: ['receipt-check', account, row.key],
      enabled: enabled && !!client && !!pin,
      staleTime: Infinity,
      retry: 1,
      queryFn: () => recheck(client as PublicClient, account, row, pin!),
    })),
  });
  const done = qs.filter((q) => q.data || q.isError).length;
  const verified = qs.filter((q) => q.data?.state === 'verified').length;
  const unreadable = qs.filter((q) => q.isError).length;
  const firstBad = rows.find((_, i) => qs[i].data?.state === 'not-verified' || qs[i].isError);
  return { total: rows.length, done, verified, unreadable, firstBad, running: enabled && done < rows.length };
}

/** Why the trade list is empty, from the account's own last agent event. */
function NoTrades({ logs }: { logs: AccountLog[] }) {
  const last = [...logs].reverse().find((l) => l.eventName === 'AgentRevoked' || l.eventName === 'AgentRegistered');
  if (last?.eventName === 'AgentRevoked')
    return (
      <p className="empty">
        No trade has gone through this account. The owner revoked agent {short(String(last.args.agent))} at block{' '}
        <a href={explorer.block(last.blockNumber)} target="_blank" rel="noreferrer">{last.blockNumber.toLocaleString('en-US')}</a>, so the
        next trade can only come from a newly admitted key, and it will appear here with its model.
      </p>
    );
  if (last) return <p className="empty">No trade yet. Agent {short(String(last.args.agent))} is admitted; its first trade will appear here with its model.</p>;
  return <p className="empty">No trade yet. The account has never admitted an agent, so nothing can trade from it.</p>;
}

export function Account() {
  const [params] = useSearchParams();
  const raw = params.get('account') ?? '';
  const account: Address = isAddress(raw) ? getAddress(raw) : ACCOUNT;
  useEffect(() => {
    document.title = `Chiron on ${net.short}: agent account ${short(account)}`;
  }, [account]);

  const snapQ = useAtBlock(['account', account], (c, b) => readAccount(c, account, b));
  const log = useGateLog(account);
  const snap = snapQ.data?.value;
  const now = snapQ.data?.timestamp;
  const agent = snap && now !== undefined ? agentState(snap, now) : undefined;
  const lead = snap?.tokens.find((t) => t.limits.allowed) ?? snap?.tokens[0];
  const pending = snap?.proposals.filter((p) => p.status === 'Pending').length;

  const activity = useMemo(
    () => (log.data ? buildGateRows(log.data.logs, log.data.refusals, log.data.times, snap?.tokens ?? []) : undefined),
    [log.data, snap],
  );
  const tradeRows = useMemo(() => (activity ?? []).filter((r) => r.receipt), [activity]);
  const [allEvents, setAllEvents] = useState(false);
  const isCore = (r: GateRow) => r.tone === 'refuse' || ['EXECUTED', 'APPROVED', 'PROPOSED', 'REJECTED', 'CANCELLED', 'REVOKED', 'WITHDRAWN'].includes(r.tag);
  const hidden = activity ? activity.filter((r) => !isCore(r)).length : 0;
  const shown = activity?.filter((r) => allEvents || isCore(r));
  const refusedRows = activity?.filter((r) => r.tone === 'refuse');
  const stepRefused = refusedRows ? [0, 1, 2, 3].map((i) => refusedRows.filter((r) => STEP_OF[r.tag.replace('()', '')] === i).length) : undefined;

  const served = useMemo(() => {
    const pin = log.data ? latestPin(log.data.logs) : undefined;
    return [...new Set((pin?.accepted ?? []).map((h) => modelName(h) ?? short(h)))];
  }, [log.data]);
  const [checking, setChecking] = useState(false);
  // Trust link only for the agent that is admitted now: newest admission, not followed by a revoke, naming snap.agent.
  const lastRevoke = activity?.find((r) => r.tag === 'REVOKED');
  const admitIsCurrent = !!(activity && snap && currentAdmission(activity, snap.agent, ZERO_ADDR));
  const admitted = admitIsCurrent && activity && snap ? currentAdmission(activity, snap.agent, ZERO_ADDR) : undefined;
  const revoked = !admitIsCurrent && snap && snap.agent === ZERO_ADDR ? lastRevoke : undefined;
  const blockedRows = lead && refusedRows ? refusedRows.filter((r) => r.spend && r.spend.token.toLowerCase() === lead.address.toLowerCase()) : undefined;
  const blocked = blockedRows ? blockedRows.reduce((a, r) => a + r.spend!.amount, 0n) : undefined;
  const left = lead ? (lead.limits.daily > lead.used ? lead.limits.daily - lead.used : 0n) : undefined;
  const rc = useRecheckAll(account, tradeRows, log.data?.logs, checking);
  const nothing = !!activity && tradeRows.length === 0;

  return (
    <>
      <section className="sheet" aria-labelledby="hero-h">
        <div className="hero">
          <div className="hero-copy">
            <div className="trust-row">
              <span className={`netbadge ${net.key}`}><span className={`dot ${net.key}`} aria-hidden="true" />{net.name} · chain {net.id}</span>
              {admitted && (
                <a className="link trust-link" href={explorer.tx(admitted.tx)} target="_blank" rel="noreferrer">
                  Agent TDX quote verified on chain{admitted.time !== undefined ? `, ${fmtWhen(admitted.time)}` : ''} ↗
                </a>
              )}
              {revoked && (
                <a className="link trust-link trust-off" href={explorer.tx(revoked.tx)} target="_blank" rel="noreferrer">
                  No agent admitted now; the last one was revoked{revoked.time !== undefined ? ` ${fmtWhen(revoked.time)}` : ''} ↗
                </a>
              )}
            </div>
            <div className="lead">
              <span className="lead-value tnum">{snap ? snap.tradeCount.toString() : '…'}</span>
              <span className="lead-label">trades the agent executed inside the owner&apos;s caps</span>
            </div>
            <p className="lead-sub">
              {refusedRows && <Chip tone={refusedRows.length ? 'bad' : 'neutral'}>{refusedRows.length} {refusedRows.length === 1 ? 'call' : 'calls'} refused</Chip>}
              {blocked !== undefined && lead && blocked > 0n && <span>{blockedRows!.length} of them asked for {fmtToken(blocked, lead.decimals)} {lead.symbol}, none of it spent.</span>}
              {left !== undefined && lead && <span>{fmtToken(left, lead.decimals)} {lead.symbol} left in today&apos;s cap.</span>}
            </p>
            <h1 id="hero-h" className="t-display">Each trade needs a verified agent, approved code, room under the cap and a model receipt.</h1>
            <p className="lede">
              Its key is admitted only after a contract verifies its Intel TDX quote against approved code, and every trade records the model that
              decided it. Here the agent buys {ASSET_SYMBOL} with {lead?.symbol ?? 'USDG'}.
            </p>
            <div className="hero-id">
              <span className="id-label">Account</span>
              <HexValue value={account} head={10} tail={8} href={explorer.address(account)} />
              {snapQ.data && <span><span className="stamp-dot" aria-hidden="true" /><Stamp block={snapQ.data.block} label={`${chain.name}, block`} /></span>}
            </div>
          </div>
          <div className="hero-action">
            {nothing ? (
              <>
                <button className="btn btn-ghost btn-lg" type="button" disabled>Recheck every receipt</button>
                <p className="hint">No trade on this account yet, so there is no receipt to recheck.</p>
              </>
            ) : (
              <>
                <button className="btn primary btn-lg" type="button" disabled={!activity || rc.running} onClick={() => setChecking(true)}>
                  {rc.running ? `Rechecking ${rc.done} of ${rc.total}` : checking ? 'Recheck again' : 'Recheck every receipt'}
                </button>
                {checking && !rc.running ? (
                  <p className="verdict">
                    <Chip tone={rc.verified === rc.total ? 'ok' : rc.verified + rc.unreadable === rc.total ? 'warn' : 'bad'}>{rc.verified} of {rc.total} receipts verified</Chip>
                    {rc.unreadable > 0 && <Chip tone="warn">{rc.unreadable} could not be read</Chip>}
                    {rc.firstBad ? (
                      <a className="link" href={`#row-${rc.firstBad.key}`}>Go to the first one that failed</a>
                    ) : (
                      <span className="hint">recomputed in this browser from calldata</span>
                    )}
                  </p>
                ) : (
                  <p className="hint">Recomputes each trade&apos;s inference receipt from calldata and compares it with what the chain recorded. Nothing is signed.</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="gates-wrap">
          <h2 className="gates-title">Where every call is checked, and how many were turned away at each step</h2>
          <ol className="gates" aria-busy={!snap}>
            <Gate n={1} label="Agent quote verified" value={agent ? <Chip tone={agent.tone}>{agent.label}</Chip> : '…'} foot={agent?.detail} refused={stepRefused?.[0]} />
            <Gate
              n={2}
              label="Code approved by the owner"
              value={snap ? <>{snap.approved.length}<span className="gate-unit"> measurements approved</span></> : '…'}
              foot={snap ? (snap.approved.length ? 'the agent must run one of these' : 'no agent can be admitted') : undefined}
              refused={stepRefused?.[1]}
            />
            <Gate
              n={3}
              label={lead ? `Inside the ${lead.symbol} caps` : 'Inside the caps'}
              value={lead ? <>{fmtToken(lead.used, lead.decimals)} / {fmtToken(lead.limits.daily, lead.decimals)}<span className="gate-unit">{lead.symbol}</span></> : '…'}
              foot={lead && left !== undefined ? <>spent in 24 h, {fmtToken(left, lead.decimals)} left today{lead.used > 0n && <span className="bar" style={{ ['--p' as string]: lead.limits.daily ? Math.min(1, Number(lead.used) / Number(lead.limits.daily)) : 0 }} />}</> : undefined}
              refused={stepRefused?.[2]}
            />
            <Gate
              n={4}
              label="Model receipt recorded"
              value={snap ? <>{snap.tradeCount.toString()}<span className="gate-unit"> trades through</span></> : '…'}
              foot={pending ? `${pending} waiting for the owner` : 'none waiting for the owner'}
              refused={stepRefused?.[3]}
            />
          </ol>
          {refusedRows && stepRefused && refusedRows.length > stepRefused.reduce((a, b) => a + b, 0) && (
            <p className="hint gates-note">
              {refusedRows.length - stepRefused.reduce((a, b) => a + b, 0)} more refused after the checks:{' '}
              {[...new Set(refusedRows.filter((r) => STEP_OF[r.tag.replace('()', '')] === undefined).map((r) => r.title.toLowerCase()))].join(', ')}.
            </p>
          )}
        </div>
        {lead && activity && <div className="ruler-wrap"><CapRuler token={lead} rows={activity} /></div>}
      </section>

      {snapQ.isError && (
        <div className="alarm" role="alert">
          <b>Could not read the account.</b>
          <span>{String(snapQ.error).split('\n')[0].slice(0, 160)}</span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => snapQ.refetch()}>Read again</button>
        </div>
      )}

      <div className="columns">
        <aside className="side" aria-label="Policy">
          <section className="panel">
            <div className="panel-head">
              <h2 className="t-section">Policy</h2>
              {snap && <Chip tone={snap.paused ? 'warn' : 'ok'}>{snap.paused ? 'Paused' : 'Open'}</Chip>}
            </div>
            <dl className="kv">
              <div><dt>Owner</dt><dd>{snap ? <HexValue value={snap.owner} href={explorer.address(snap.owner)} /> : '…'}</dd></div>
              <div>
                <dt>Pinned model</dt>
                <dd>
                  <span className="kv-strong">{snap ? modelName(snap.requestedModelHash) ?? short(snap.requestedModelHash) : '…'}</span>
                  
                  {snap && served.some((n) => n !== modelName(snap.requestedModelHash)) && <span className="hint served">served as {served.join(', ')}</span>}
                </dd>
              </div>
              <div><dt>Agent key</dt><dd>{snap ? snap.agent === ZERO_ADDR ? <span className="hint">none</span> : <HexValue value={snap.agent} href={explorer.address(snap.agent)} /> : '…'}</dd></div>
              <div>
                <dt>Approved code</dt>
                <dd>
                  {!snap ? '…' : snap.approved.length ? (
                    <details className="codes">
                      <summary>{snap.approved.length} approved</summary>
                      {snap.approved.map((m) => <HexValue key={m} value={m} head={6} tail={4} />)}
                    </details>
                  ) : <span className="hint">none</span>}
                </dd>
              </div>
            </dl>
            <h3 className="sub-head">Caps the agent cannot cross</h3>
            <div className="caps">
              {(snap?.tokens ?? []).map((t) => (
                <div className="cap" key={t.address}>
                  <div className="cap-head">
                    <a className="cap-token" href={explorer.address(t.address)} target="_blank" rel="noreferrer">{t.symbol}</a>
                    {t.limits.allowed ? <span className="cap-held tnum">holds {fmtToken(t.balance, t.decimals)}</span> : <Chip tone="neutral">Not tradable</Chip>}
                  </div>
                  {t.limits.allowed && (
                    <dl className="cap-grid">
                      <div><dt>Per trade</dt><dd className="tnum">{fmtToken(t.limits.perTrade, t.decimals)}</dd></div>
                      <div><dt>24 h used</dt><dd className="tnum">{fmtToken(t.used, t.decimals)} / {fmtToken(t.limits.daily, t.decimals)}</dd></div>
                      <div><dt>Owner approves above</dt><dd className="tnum">{fmtToken(t.limits.approvalAbove, t.decimals)}</dd></div>
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="ledger" aria-labelledby="trades-h">
          <div className="ledger-head">
            <h2 id="trades-h" className="t-section">Activity</h2>
            <div className="ledger-tools">
              <span className="hint">{allEvents ? 'Every account event' : 'Trades, refusals and key changes'}, newest first</span>
              {hidden > 0 && (
                <button className="btn btn-ghost btn-sm" type="button" aria-pressed={allEvents} onClick={() => setAllEvents((v) => !v)}>
                  {allEvents ? 'Hide renewals and setup' : `Show ${hidden} renewals and setup`}
                </button>
              )}
            </div>
          </div>
          {!shown || !log.data ? (
            <p className="empty">Reading the account&apos;s trades.</p>
          ) : shown.length ? (
            <GateLog rows={shown} marks={lead && activity ? markNumbers(lead, activity) : undefined} recheck={checking ? { account, logs: log.data.logs } : undefined} />
          ) : (
            <NoTrades logs={log.data.logs} />
          )}
          {log.data?.refusalsError && <p className="note">Refusals are enumerated by the explorer, which did not answer ({log.data.refusalsError}).</p>}
        </section>
      </div>

      <details className="owner">
        <summary className="t-section">Owner controls <span className="hint">deposit, caps, approve code, create an account</span></summary>
        {snap && snapQ.data && <OwnerActions snap={snap} refetch={() => snapQ.refetch()} now={snapQ.data.timestamp} />}
        <CreateAccount />
      </details>
    </>
  );
}
