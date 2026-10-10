import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAddress, isAddress, parseEventLogs, type Address } from 'viem';
import { useConnection, useSwitchChain, useWriteContract } from 'wagmi';
import { ACCOUNT, chain, explorer, FACTORY, modelName } from '../chain';
import { factoryAbi } from '../abi/AgentAccount.generated';
import { GateLog } from '../components/GateLog';
import { HexValue, Stamp } from '../components/Stamp';
import { Wallet } from '../components/Wallet';
import { useAtBlock } from '../hooks/useAtBlock';
import { useTx } from '../hooks/useTx';
import { fmtCountdown, fmtToken, short } from '../lib/format';
import { OwnerActions } from './account/OwnerActions';
import { buildGateRows, useGateLog, type AccountLog } from './account/gateRows';
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
        <button className="btn line" type="button" disabled={tx.busy} onClick={click}>
          {tx.state.phase === 'signing' ? 'Confirm in the wallet' : tx.state.phase === 'mining' ? 'Waiting for the receipt' : wrongChain ? `Switch to ${chain.name}` : 'Create my account'}
        </button>
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

function AgentFact({ snap, now }: { snap: Snapshot; now: bigint }) {
  if (snap.agent === ZERO_ADDR) return <><b>empty</b><span className="small">no key can trade</span></>;
  const left = Number(snap.agentExpiry - now);
  return (
    <>
      <HexValue value={snap.agent} href={explorer.address(snap.agent)} />
      <span className="small">{left > 0 ? `admitted, ${fmtCountdown(left)} left` : 'attestation expired'}</span>
    </>
  );
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
    document.title = `Chiron: agent account ${short(account)}`;
  }, [account]);

  const snapQ = useAtBlock(['account', account], (c, b) => readAccount(c, account, b));
  const log = useGateLog(account);
  const snap = snapQ.data?.value;
  const trades = useMemo(
    () => (log.data ? buildGateRows(log.data.logs, [], log.data.times, snap?.tokens ?? []).filter((r) => ['EXECUTED', 'APPROVED', 'PROPOSED', 'REJECTED', 'CANCELLED'].includes(r.tag)) : undefined),
    [log.data, snap],
  );

  return (
    <>
      <header className="page-head">
        <h1 className="t-display">The owner sets the allowance; the agent trades only inside it.</h1>
        <p className="lede">
          Each trade event on this account names the model that decided it. Figures below are live reads from {chain.name}.
        </p>
        <p className="small">
          Before the agent&apos;s key can sign, a contract verifies its Intel TDX quote against the code the owner approved.
        </p>
        <p className="small">
          <HexValue value={account} head={10} tail={8} href={explorer.address(account)} />
          {snapQ.data && <> · <Stamp block={snapQ.data.block} /></>}
        </p>
      </header>

      {snapQ.isError && (
        <div className="alarm" role="alert">
          <b>Could not read the account.</b>
          <span>{String(snapQ.error).split('\n')[0].slice(0, 160)}</span>
          <button className="textbtn" type="button" onClick={() => snapQ.refetch()}>Read again</button>
        </div>
      )}

      <dl className="facts" aria-busy={!snap}>
        <div><dt>Owner</dt><dd>{snap ? <HexValue value={snap.owner} href={explorer.address(snap.owner)} /> : '…'}</dd></div>
        <div><dt>Agent</dt><dd>{snap && snapQ.data ? <AgentFact snap={snap} now={snapQ.data.timestamp} /> : '…'}</dd></div>
        <div>
          <dt>Approved code</dt>
          <dd>{!snap ? '…' : snap.approved.length ? snap.approved.map((m) => <HexValue key={m} value={m} head={6} tail={4} />) : <><b>none</b><span className="small">no agent can be admitted</span></>}</dd>
        </div>
        <div><dt>Pinned model</dt><dd>{snap ? <b>{modelName(snap.requestedModelHash) ?? short(snap.requestedModelHash)}</b> : '…'}</dd></div>
        <div><dt>Status</dt><dd>{snap ? <b>{snap.paused ? 'paused by the owner' : 'open'}</b> : '…'}</dd></div>
      </dl>

      <section className="block" aria-labelledby="caps-h">
        <div className="block-head">
          <h2 id="caps-h" className="t-section">Caps the agent cannot cross</h2>
        </div>
        <div className="table-wrap">
          <table className="caps">
            <thead>
              <tr><th>Token</th><th>Per trade</th><th>Used in 24 h</th><th>Owner approves above</th><th>Held</th></tr>
            </thead>
            <tbody>
              {(snap?.tokens ?? []).map((t) => (
                <tr key={t.address}>
                  <th scope="row"><a href={explorer.address(t.address)} target="_blank" rel="noreferrer">{t.symbol}</a></th>
                  <td className="tnum">{t.limits.allowed ? fmtToken(t.limits.perTrade, t.decimals) : 'not tradable'}</td>
                  <td className="tnum">{fmtToken(t.used, t.decimals)} of {fmtToken(t.limits.daily, t.decimals)}</td>
                  <td className="tnum">{t.limits.allowed ? fmtToken(t.limits.approvalAbove, t.decimals) : '–'}</td>
                  <td className="tnum">{fmtToken(t.balance, t.decimals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="block" aria-labelledby="trades-h">
        <div className="block-head">
          <h2 id="trades-h" className="t-section">Trades, each with the model that made it</h2>
          {snap && <span className="small tnum">{snap.tradeCount.toString()} executed · {snap.proposalCount.toString()} proposed</span>}
        </div>
        {!trades || !log.data ? (
          <p className="small">Reading the account&apos;s trades.</p>
        ) : trades.length ? (
          <div className="panel"><GateLog rows={trades} /></div>
        ) : (
          <NoTrades logs={log.data.logs} />
        )}
      </section>

      <details className="block owner">
        <summary className="t-section">Owner controls</summary>
        {snap && snapQ.data && <OwnerActions snap={snap} refetch={() => snapQ.refetch()} now={snapQ.data.timestamp} />}
        <CreateAccount />
      </details>
    </>
  );
}
