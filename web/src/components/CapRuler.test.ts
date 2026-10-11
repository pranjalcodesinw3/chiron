import { describe, expect, it } from 'vitest';
import { groupMarks } from './CapRuler';

describe('groupMarks', () => {
  it('keeps every mark at its true amount and folds same-lane neighbours into a count', () => {
    const marks = [
      { x: 300, kind: 'refused' },
      { x: 300, kind: 'refused' },
      { x: 300, kind: 'executed' },
      { x: 100, kind: 'refused' },
    ];
    const g = groupMarks(marks);
    expect(g.map((d) => d.m.x).sort()).toEqual([100, 300, 300]);
    expect(g.find((d) => d.m.kind === 'refused' && d.m.x === 300)!.extra).toBe(1);
    expect(g.find((d) => d.m.kind === 'executed')!.extra).toBe(0);
  });
  it('draws marks 18px or more apart separately', () => {
    expect(groupMarks([{ x: 0, kind: 'refused' }, { x: 18, kind: 'refused' }]).length).toBe(2);
  });
});
