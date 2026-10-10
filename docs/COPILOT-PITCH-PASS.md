# Pitch pass: CHIRON (Arbitrum sub-track CWF) (2026-10-09)

Copilot does not score Arbitrum CWF repos. Use `ethereum/docs/KILL-PASS.md` and `ethereum/research/rivals/RIVALS.md`.

## Lock

**Arbitrum Sepolia** entry: attested agent trading account + Stylus TDX verifier + receipt-gated inference pay. Robinhood testnet deployment stays evidence, not sub-track unless rules change.

## Host signals

- @binji_x: agent account + allowance ([status](https://x.com/binji_x/status/2097475590165029036)).
- @zkLumi / Open House: verifiable AI trading on Arbitrum (see `ethereum/docs/KILL-PASS.md`).

## Visible CWF rivals (2026-10-03 RIVALS.md)

| repo | overlap |
|------|---------|
| zuemen/mandate-layer (Base) | Caps + x402, **no TDX admission** |
| arkanine1000/atnx-markets | RH + Arbitrum prediction |
| SkandhaRoshan/Leash (Arbitrum, Oct 2) | Agent spend + ERC-8004 (verify claims) |

## Pitch deltas

1. **Open:** “The account admits an agent key only after **Stylus verifies an Intel TDX quote** for an owner-approved measurement.”
2. **Vs mandate-layer / spend caps:** Caps check signatures; we check **which software** signed.
3. **Vs Robinhood Agents (app):** They offer dedicated account + approvals; we offer **onchain proof** of model + workload on each trade event.
4. **Vs EPP-style attestations:** We gate **trades and pay**, not only log disagreements.

## Portal field outlines

**competition:** mandate-layer, MetaMask delegation enforcers, Robinhood Agents (off-chain). One sentence on TDX + receipt gate.

**traction:** Arbitrum Sepolia Assay redeems, RHC testnet trade/refusal txs, mutation test score, `make test` log path.

**prior work disclosure:** Reuse policy per coordinator; git split before/after CWF window (`CHIRON-PORT-PLAN.md`).
