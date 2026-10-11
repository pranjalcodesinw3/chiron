import { describe, expect, it } from 'vitest';
import type { Address, Hex } from 'viem';
import { currentAdmission, type GateRow } from './gateRows';

const Z = '0x0000000000000000000000000000000000000000' as Address;
const A = '0x71f1000000000000000000000000000000003461' as Address;
const B = '0x79a5000000000000000000000000000000006b79' as Address;
const row = (tag: string, agent: Address): GateRow => ({ key: tag + agent, tone: 'ok', title: '', sub: '', tag, tx: '0x01' as Hex, block: 1n, order: 0, agent });

describe('currentAdmission (rows newest first)', () => {
  it('returns the admission of the agent admitted now', () => {
    expect(currentAdmission([row('ADMITTED', A)], A, Z)?.agent).toBe(A);
  });
  it('returns nothing after admit then revoke', () => {
    expect(currentAdmission([row('REVOKED', A), row('ADMITTED', A)], Z, Z)).toBeUndefined();
    expect(currentAdmission([row('REVOKED', A), row('ADMITTED', A)], A, Z)).toBeUndefined();
  });
  it('returns nothing when the newest admission is another agent', () => {
    expect(currentAdmission([row('ADMITTED', B)], A, Z)).toBeUndefined();
  });
});
