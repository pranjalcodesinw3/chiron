import type { ReactNode } from 'react';

/** Status system, semantic colors only: ok = done or verified, warn = waiting on the owner, bad = refused or failed, neutral = admin. */
export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

/** Status always carries its word; the color only reinforces it. */
export function Chip({ tone, children, title }: { tone: Tone; children: ReactNode; title?: string }) {
  return (
    <span className={`chip chip-${tone}`} title={title}>
      <span className="chip-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

const TAG_TONE: Record<string, Tone> = {
  EXECUTED: 'ok',
  APPROVED: 'ok',
  ADMITTED: 'ok',
  PROPOSED: 'warn',
  REVOKED: 'neutral',
  WITHDRAWN: 'neutral',
  REJECTED: 'neutral',
  CANCELLED: 'neutral',
  PINNED: 'neutral',
  'APPROVED CODE': 'neutral',
};

export const toneForTag = (tag: string, refused: boolean): Tone => (refused ? 'bad' : TAG_TONE[tag] ?? 'neutral');

/** Short chip label: a refusal shows "Refused", the error name goes beside it. */
export const chipLabel = (tag: string, refused: boolean) =>
  refused ? 'Refused' : tag === 'APPROVED CODE' ? 'Code approved' : tag.charAt(0) + tag.slice(1).toLowerCase();
