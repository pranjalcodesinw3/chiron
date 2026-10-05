import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { accountState, chironClient, explainRefusal, verifyReceipt } from '../src/chain.js';

// The live AgentAccount on Arbitrum Sepolia (contracts/deployments/421614-account.json).
const ACCOUNT = '0x5EaE79705e7581709947930BaBE3a9Ba3d55164D';
const USDG = '0xFFC95faa3d63Cde504a05B567C600B78C0b41892';
// A trade, a reverted over-cap execute and the served model hash on that account, supplied once the
// operator agent has run: CHIRON_TRADE_TX, CHIRON_OVERCAP_TX, CHIRON_SERVED_HASH.
const TRADE = process.env.CHIRON_TRADE_TX as `0x${string}` | undefined;
const OVERCAP = process.env.CHIRON_OVERCAP_TX as `0x${string}` | undefined;
const SERVED = process.env.CHIRON_SERVED_HASH as `0x${string}` | undefined;
const c = chironClient(process.env.CHIRON_RPC_URL);

describe('account_state on Arbitrum Sepolia', () => {
  it('reads the deployed account and its owner limits from the chain', async () => {
    assert.equal(await c.getChainId(), 421614);
    const s = await accountState(c, ACCOUNT);
    assert.equal(s.account, ACCOUNT);
    assert.ok(s.caps.length > 0, 'the deploy configured at least one token limit');
    const usdg = s.caps.find((k) => k.token.toLowerCase() === USDG.toLowerCase());
    assert.ok(usdg?.allowed, 'Paxos USDG is allowed on the account');
  });
});

const live = TRADE && OVERCAP && SERVED ? {} : { skip: 'set CHIRON_TRADE_TX, CHIRON_OVERCAP_TX and CHIRON_SERVED_HASH' };

describe('verify_receipt', live, () => {
  it('verifies the real successful trade, every check listed and passing', async () => {
    const r = await verifyReceipt(c, TRADE!, { expectedServed: SERVED });
    console.log(JSON.stringify(r.checks.map((k) => [k.name, k.ok])));
    assert.ok(r.checks.length >= 6);
    assert.ok(r.checks.every((k) => k.ok));
    assert.equal(r.verified, true);
  });

  it('is not verified when one field is tampered (different model hash)', async () => {
    const bad = `0x${'11'.repeat(32)}` as const;
    const r = await verifyReceipt(c, TRADE!, { expectedServed: bad });
    assert.equal(r.checks.find((k) => k.name === 'served_model_equals_expected')?.ok, false);
    assert.equal(r.verified, false);
  });

  it('is not verified for a reverted transaction', async () => {
    const r = await verifyReceipt(c, OVERCAP!);
    assert.equal(r.verified, false);
  });
});

describe('explain_refusal', live, () => {
  it('decodes the over-cap revert to ExceedsPerTradeCap', async () => {
    const r = await explainRefusal(c, OVERCAP!);
    assert.equal(r.reverted, true);
    assert.equal((r as { error?: string }).error, 'ExceedsPerTradeCap');
  });
});

// The spike's mined refusal on the live account: a real Phala quote whose measurement the owner had not approved.
const UNAPPROVED = '0x30508980df2710fb5af2cba20ffa232603db3206c73b072ccd1665b1c56a7e29';

describe('explain_refusal on the mined Arbitrum Sepolia refusal', () => {
  it('decodes registerAgent with an unapproved measurement to MeasurementNotApproved', async () => {
    const r = await explainRefusal(c, UNAPPROVED);
    assert.equal(r.reverted, true);
    assert.equal((r as { error?: string }).error, 'MeasurementNotApproved');
    assert.deepEqual((r as { args?: string[] }).args, ['0xfd34caabef222327146cb5c059810f08bf7c41adb6cc48312be21cc228020149']);
  });
});
