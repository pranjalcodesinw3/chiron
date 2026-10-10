import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACCOUNT, FACTORY, USDG, VERIFIER, WETH } from './chain';

const deploy = JSON.parse(readFileSync(new URL('../../contracts/deployments/421614-account.json', import.meta.url), 'utf8'));

describe('chain constants match the deployment record', () => {
  it('addresses', () => {
    const c = deploy.contracts;
    expect([ACCOUNT, FACTORY, VERIFIER, USDG, WETH].map((a) => a.toLowerCase())).toEqual(
      [c.AgentAccount, c.AgentAccountFactory, c.Verifier, c.USDG, c.WETH].map((a: string) => a.toLowerCase()),
    );
  });
});
