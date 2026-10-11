import type { Address } from 'viem';
import { explorer, net } from '../chain';
import { fmtWhen } from '../lib/format';
import type { AccountLog, GateRow } from '../pages/account/gateRows';
import { useReceiptCheck } from '../pages/account/receiptCheck';
import { Chip, chipLabel, toneForTag } from './Chip';

function ReceiptChip({ account, row, logs }: { account: Address; row: GateRow; logs: AccountLog[] }) {
  const s = useReceiptCheck(account, row, logs);
  if (!s) return null;
  if (s.state === 'checking') return <Chip tone="neutral">Checking receipt</Chip>;
  if (s.state === 'verified') return <Chip tone="ok" title={s.checks.map((c) => c.name).join(', ')}>Receipt verified</Chip>;
  return <Chip tone="bad" title={s.reason ?? s.checks.filter((c) => !c.ok).map((c) => c.name).join(', ')}>Receipt not verified</Chip>;
}

/** The account's own record, newest first: what the gate let through and what it turned away. */
export function GateLog({ rows, recheck }: { rows: GateRow[]; recheck?: { account: Address; logs: AccountLog[] } }) {
  return (
    <ul className="feed">
      {rows.map((r) => {
        const refused = r.tone === 'refuse';
        return (
          <li key={r.key} id={`row-${r.key}`} className={refused ? 'feed-row is-refused' : 'feed-row'}>
            <div className="feed-status">
              <Chip tone={toneForTag(r.tag, refused)}>{chipLabel(r.tag, refused)}</Chip>
            </div>
            <div className="feed-main">
              <p className="feed-title">{r.title}</p>
              <p className="feed-sub">
                {r.sub}
              </p>
              {recheck && r.receipt && (
                <div className="feed-check">
                  <ReceiptChip account={recheck.account} row={r} logs={recheck.logs} />
                </div>
              )}
            </div>
            <div className="feed-meta">
              <a className="link-mono" href={explorer.tx(r.tx)} target="_blank" rel="noreferrer" title={`Open on ${net.explorerName}`}>
                {r.tx.slice(0, 6)}…{r.tx.slice(-4)} ↗
              </a>
              <span className="feed-time">{r.time !== undefined ? fmtWhen(r.time) : `block ${r.block.toLocaleString('en-US')}`}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
