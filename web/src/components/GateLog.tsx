import { Link } from 'react-router-dom';
import { explorer } from '../chain';
import { fmtWhen } from '../lib/format';
import type { GateRow } from '../pages/account/gateRows';

/** The account's own record, newest first: what the gate let through (amber dot) and what it turned away (red ring). */
export function GateLog({ rows }: { rows: GateRow[] }) {
  return (
    <ol className="log">
      {rows.map((r, i) => (
        <li key={r.key} className={r.tone === 'refuse' ? 'refuse' : undefined} style={{ ['--i' as string]: Math.min(i, 10) }}>
          <span className="dot" aria-hidden="true" />
          <div className="log-main">
            <Link to={`/verify?tx=${r.tx}`} className="log-title">{r.title}</Link>
            <p className="log-sub">
              {r.sub}
              {r.time !== undefined && <> · {fmtWhen(r.time)}</>}
            </p>
          </div>
          <a className="log-tag" href={explorer.tx(r.tx)} target="_blank" rel="noreferrer" title="Open on Arbiscan">
            {r.tag}
          </a>
        </li>
      ))}
    </ol>
  );
}
