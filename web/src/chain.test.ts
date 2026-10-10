import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACCOUNT, FACTORY, NETS, parseChainKey, USDG, VERIFIER, WETH } from './chain';

const arb = JSON.parse(readFileSync(new URL('../../contracts/deployments/421614-account.json', import.meta.url), 'utf8'));
const rhc = JSON.parse(readFileSync(new URL('../../contracts/deployments/46630.json', import.meta.url), 'utf8'));
const lc = (a: string) => a.toLowerCase();

describe('chain constants match the deployment records', () => {
  it('Arbitrum Sepolia is the default and matches 421614-account.json', () => {
    const c = arb.contracts;
    expect([ACCOUNT, FACTORY, VERIFIER, USDG, WETH].map(lc)).toEqual([c.AgentAccount, c.AgentAccountFactory, c.Verifier, c.USDG, c.WETH].map(lc));
  });
  it('Robinhood Chain testnet matches 46630.json', () => {
    const n = NETS['robinhood-testnet'];
    const c = rhc.contracts;
    expect(n.id).toBe(rhc.chainId);
    expect([n.account, n.factory, n.verifier, n.usdg, n.asset.address].map(lc)).toEqual([c.AgentAccount, c.AgentAccountFactory, c.Verifier, c.TestUSDG, c.TSLA].map(lc));
  });
  it('parses the chain selector', () => {
    expect(parseChainKey('robinhood')).toBe('robinhood-testnet');
    expect(parseChainKey('rhc')).toBe('robinhood-testnet');
    expect(parseChainKey('arbitrum')).toBe('arbitrum-sepolia');
    expect(parseChainKey('base')).toBeUndefined();
  });
});
