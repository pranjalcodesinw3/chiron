// Live reads on Robinhood Chain testnet (46630): the attested TSLA buy verifies, and the mined over-cap
// and revoked-agent transactions explain as refusals (docs/e2e/robinhood-testnet-agent-account.md).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { accountState, chironClient, explainRefusal, netFor, verifyReceipt } from '../src/chain.js';

const net = netFor('robinhood-testnet');
const c = chironClient(undefined, net);

describe('Robinhood Chain testnet', () => {
  it('the client is on 46630', async () => {
    assert.equal(await c.getChainId(), 46630);
  });
  it('verify_receipt passes on the first attested TSLA buy', async () => {
    const r = await verifyReceipt(c, '0xe50522661b55c797071b56e43aaf2bc91d37c9745a295ff6a5976883dd4ddfa2');
    assert.equal(r.verified, true, JSON.stringify(r));
  });
  it('explain_refusal decodes the mined over-cap trade', async () => {
    const r = await explainRefusal(c, '0xb1adb7231fbd38b77489769d7db754b30f36fa9b1ba97bf14f51980f3b12528c');
    assert.equal(r.reverted, true);
    assert.equal((r as { error: string }).error, 'ExceedsPerTradeCap', JSON.stringify(r));
  });
  it('explain_refusal decodes the revoked agent trade as NotAgent', async () => {
    const r = await explainRefusal(c, '0xc0b2e5bc95048ad424a246277a819dfad0238b394ba4bf08cf9dc0231c7e1e08');
    assert.equal((r as { error: string }).error, 'NotAgent', JSON.stringify(r));
  });
  it('account_state reads the Paxos USDG account', async () => {
    const s = await accountState(c, '0xFaaAa4d1ee944d317b10233505D8c57425C53b55');
    assert.equal(s.chain, 'robinhood-testnet');
    assert.match(s.agent, /^0x[0-9a-fA-F]{40}$/);
  });
});
