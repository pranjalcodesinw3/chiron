import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAINS, resolveChain } from '../src/chains.ts';

test('CHAIN selects the network; default stays Arbitrum Sepolia', () => {
  assert.equal(resolveChain({}).id, 421614);
  assert.equal(resolveChain({ CHAIN: 'robinhood-testnet' }).id, 46630);
  assert.equal(resolveChain({ CHAIN: 'rhc' }).id, 46630);
  assert.equal(resolveChain({ CHAIN: 'arbitrum-sepolia' }).id, 421614);
  assert.equal(resolveChain({ CHAIN_ID: '46630' }).key, 'robinhood-testnet');
  assert.throws(() => resolveChain({ CHAIN: 'base' }));
});

test('presets match the deployment records', () => {
  const rhc = JSON.parse(readFileSync(new URL('../../contracts/deployments/46630.json', import.meta.url), 'utf8'));
  assert.equal(rhc.chainId, CHAINS['robinhood-testnet'].id);
  assert.equal(rhc.contracts.TSLA.toLowerCase(), CHAINS['robinhood-testnet'].asset.address.toLowerCase());
  const arb = readFileSync(new URL('../../contracts/deployments/421614-account.json', import.meta.url), 'utf8').toLowerCase();
  assert.ok(arb.includes(CHAINS['arbitrum-sepolia'].account.toLowerCase()));
});

test('Robinhood Chain preset is the 46630.json account, Assay and testUSDG', () => {
  const rhc = JSON.parse(readFileSync(new URL('../../contracts/deployments/46630.json', import.meta.url), 'utf8'));
  const p = CHAINS['robinhood-testnet'];
  assert.deepEqual([p.account, p.assay, p.usdg].map((a) => a.toLowerCase()), [rhc.contracts.AgentAccount, rhc.contracts.Assay, rhc.contracts.TestUSDG].map((a: string) => a.toLowerCase()));
});
