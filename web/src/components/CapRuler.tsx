import { useEffect, useRef, useState } from 'react';
import type { GateRow } from '../pages/account/gateRows';
import type { TokenRow } from '../pages/account/read';
import { fmtToken } from '../lib/format';

type Kind = 'executed' | 'approved' | 'refused';
type Mark = { n: number; x: number; kind: Kind; row: GateRow; amount: bigint };

const H = 162;
const PAD = 24;
const TRACK_Y = 40;
const TRACK_H = 66;
const LANE: Record<Kind, number> = { executed: 13, approved: 33, refused: 53 };
const WORD: Record<Kind, string> = { executed: 'executed', approved: 'executed after owner approval', refused: 'refused' };

/** Every trade attempt on the lead token, numbered, on one axis against the approval line and the per-trade cap. */
export function CapRuler({ token, rows }: { token: TokenRow; rows: GateRow[] }) {
  // Drawn at the container's real width so chart text stays at its CSS size (13px) on phones.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(960);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = W < 560;
  const d = token.decimals;
  const n = (v: bigint) => Number(v) / 10 ** d;
  const above = n(token.limits.approvalAbove);
  const cap = n(token.limits.perTrade);
  const attempts = rows
    .filter((r) => r.spend && r.spend.token.toLowerCase() === token.address.toLowerCase() && r.tag !== 'PROPOSED')
    .slice()
    .reverse(); // oldest first, so numbers follow time
  const max = Math.max(cap * 1.3, ...attempts.map((r) => n(r.spend!.amount) * 1.08), 1e-9);
  const sx = (v: number) => PAD + (Math.min(v, max) / max) * (W - 2 * PAD);
  const marks: Mark[] = attempts.map((r, i) => ({
    n: i + 1,
    row: r,
    amount: r.spend!.amount,
    x: sx(n(r.spend!.amount)),
    kind: r.tone === 'refuse' ? 'refused' : r.tag === 'APPROVED' ? 'approved' : 'executed',
  }));
  // Marks stay at their true amount. Calls in one lane closer than 18px share one drawn mark with a "+k" count;
  // the numbered list below still gives every call its own line (one line per call on phones).
  const drawn = groupMarks(marks);
  /** "just over the cap" when an amount sits within 0.1% above a line it crossed. */
  const edge = (v: bigint) => {
    const a = n(v);
    if (a > cap && a - cap <= cap * 0.001) return `, ${fmtToken(v - token.limits.perTrade, d)} over the cap`;
    if (a > above && a - above <= above * 0.001) return `, ${fmtToken(v - token.limits.approvalAbove, d)} over the approval line`;
    return '';
  };
  const ticks = [0, above, cap].filter((v, i, a) => a.indexOf(v) === i);
  const zones = [
    { a: sx(0), b: sx(above), t: 'executes', c: '' },
    { a: sx(above), b: sx(cap), t: 'owner approves', c: '' },
    { a: sx(cap), b: W - PAD, t: 'reverts', c: ' z-label-bad' },
  ];

  return (
    <figure className="ruler">
      <figcaption className="ruler-head">
        <h3 className="ruler-title">Every {token.symbol} trade attempt against the caps</h3>
        <p className="hint">Each numbered mark is one call at the amount it tried to spend.</p>
      </figcaption>
      <div ref={box} className="ruler-box">
        <svg width={W} height={narrow ? H - 30 : H} viewBox={`0 0 ${W} ${narrow ? H - 30 : H}`} role="img" aria-label={`${token.symbol}: owner approves above ${above}, per-trade cap ${cap}. ${marks.length} attempts, listed below the chart.`}>
          <rect className="z-ok" x={zones[0].a} y={TRACK_Y} width={zones[0].b - zones[0].a} height={TRACK_H} rx="4" />
          <rect className="z-warn" x={zones[1].a} y={TRACK_Y} width={zones[1].b - zones[1].a} height={TRACK_H} />
          <rect className="z-bad" x={zones[2].a} y={TRACK_Y} width={zones[2].b - zones[2].a} height={TRACK_H} rx="4" />
          <line className="l-warn" x1={sx(above)} x2={sx(above)} y1={TRACK_Y - 12} y2={TRACK_Y + TRACK_H} />
          <line className="l-bad" x1={sx(cap)} x2={sx(cap)} y1={TRACK_Y - 12} y2={TRACK_Y + TRACK_H} />
          <text className="l-text" x={sx(above)} y={TRACK_Y - 18} textAnchor="middle">{narrow ? '' : 'approve above '}{fmtToken(token.limits.approvalAbove, d)}</text>
          <text className="l-text l-text-bad" x={sx(cap)} y={TRACK_Y - 18} textAnchor="middle">cap {fmtToken(token.limits.perTrade, d)}</text>
          {drawn.map(({ m, extra }) => (
            <g key={m.row.key} className={`mk mk-${m.kind}`}>
              <circle cx={m.x} cy={TRACK_Y + LANE[m.kind]} r="9" />
              <text x={m.x} y={TRACK_Y + LANE[m.kind] + 4} textAnchor="middle">{m.n}</text>
              {extra > 0 && <text className="mk-more" x={m.x + 12} y={TRACK_Y + LANE[m.kind] - 6}>+{extra}</text>}
            </g>
          ))}
          <line className="axis" x1={PAD} x2={W - PAD} y1={TRACK_Y + TRACK_H + 8} y2={TRACK_Y + TRACK_H + 8} />
          {ticks.map((t) => (
            <g key={t}>
              <line className="axis" x1={sx(t)} x2={sx(t)} y1={TRACK_Y + TRACK_H + 4} y2={TRACK_Y + TRACK_H + 12} />
              <text className="tick" x={sx(t)} y={TRACK_Y + TRACK_H + 27} textAnchor={t === 0 ? 'start' : 'middle'}>{t === 0 ? '0' : t.toLocaleString('en-US', { maximumFractionDigits: 6 })}</text>
            </g>
          ))}
          {!narrow &&
            zones.map((z) => z.b - z.a > 70 && (
              <text key={z.t} className={`z-label${z.c}`} x={(z.a + z.b) / 2} y={TRACK_Y + TRACK_H + 48} textAnchor="middle">{z.t}</text>
            ))}
        </svg>
      </div>
      {narrow && <p className="zone-key"><span>executes up to {fmtToken(token.limits.approvalAbove, d)}</span><span>owner approves up to {fmtToken(token.limits.perTrade, d)}</span><span className="bad">reverts past the cap</span></p>}
      {marks.length ? (
        <ol className={`attempts${narrow ? ' attempts-compact' : ''}`}>
          {marks.map((m) => (
            <li key={m.row.key}>
              <span className={`an an-${m.kind}`} aria-hidden="true">{m.n}</span>
              <span className="tnum attempt-amt">{fmtToken(m.amount, d)} {token.symbol}</span>
              <span className={`attempt-word w-${m.kind}`}>{WORD[m.kind]}{edge(m.amount)}</span>
              {m.kind === 'refused' && !narrow && <span className="hint">{m.row.title.toLowerCase()}</span>}
            </li>
          ))}
        </ol>
      ) : (
        <p className="hint">No trade attempt on {token.symbol} yet; the zones show what the contract would do.</p>
      )}
    </figure>
  );
}

/** Group marks that share an outcome lane and sit within 18px, so none covers another; x is never moved. */
export function groupMarks<M extends { x: number; kind: string }>(marks: M[]): { m: M; extra: number }[] {
  const out: { m: M; extra: number }[] = [];
  for (const kind of [...new Set(marks.map((m) => m.kind))]) {
    const lane = marks.filter((m) => m.kind === kind).sort((a, b) => a.x - b.x);
    for (const m of lane) {
      const last = out.length && out[out.length - 1].m.kind === kind ? out[out.length - 1] : undefined;
      if (last && m.x - last.m.x < 18) last.extra++;
      else out.push({ m, extra: 0 });
    }
  }
  return out;
}
