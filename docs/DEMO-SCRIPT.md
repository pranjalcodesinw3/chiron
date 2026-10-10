# Chiron demo script (product demo, cap 3:00)

Record against deployed Sepolia + RHC testnet addresses in `docs/SUBMISSION.md`. Prefer live `make test` green in terminal as B-roll if time.

| # | Time | Screen | Action | Narration |
|---|---|---|---|---|
| 1 | 0:00 | RHC testnet `AgentAccount` | Show funded balance and `limits`; open agent `execute` → `TradeExecuted` (e.g. `0x0023f359...3b03` or live-cycle trade tx) | "You give the agent an allowance: caps on this account. It traded only after the account checked the software and admitted this key. The event names the model." |
| 2 | 0:25 | Same account or explorer | Scroll `TradeExecuted`: workload measurement + served model hash + receipt hashes | "Every trade on chain says which attested software and which model receipt backed it." |
| 3 | 0:50 | Arbiscan Sepolia | Open Assay channel + `registerAgent` txs from SUBMISSION table | "Same stack on Arbitrum Sepolia: gateway registered from a fresh TDX quote, inference channel pinned to your model." |
| 4 | 1:15 | Agent trade | Over-cap `eth_call` revert or approval flow (`NeedsApproval` → owner `approveTrade`) | "Inside the allowance it executes. Above your threshold it stops until you approve exactly that trade." |
| 5 | 1:40 | Receipt | `redeemWithReceipt` tx (e.g. `0x16270367...a55d`) | "Inference spend matches: provider paid only when the TEE receipt names the pinned model." |
| 6 | 2:05 | RHC testnet | Revoke measurement → next `execute` reverts `NotAgent` | "Unapprove the measurement and the account drops the key immediately." |
| 7 | 2:30 | Terminal | `make test` summary or mutation doc | "314 tests; 109/110 mutation guards killed." |
| 8 | 2:50 | Close | none | "Allowance you set. Software the account checked. Model name on every trade." |

Presentation video: cite [Binji on agentic bank allowance](https://x.com/binji_x/status/2097475590165029036); vs mandate-layer caps-only; Robinhood Agents off-chain approvals vs onchain TDX gate on the same account.
