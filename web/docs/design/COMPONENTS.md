# Components (CHIRON web)

FALLBACK: no 21st.dev API key on this machine and the page needs no new primitives, so components are hand-built on the tokens in src/tokens.css (linear.app system): Button (primary/secondary/ghost), Chip (ok/warn/bad/info/neutral), MetricCard, Card, ActivityRow, CapsTable, ChainSwitch.

| Component | File | Used for |
|---|---|---|
| Button | src/styles.css `.btn`, `.btn-secondary`, `.btn-ghost` | one primary "Recheck every receipt"; owner actions secondary |
| Chip | src/components/Chip.tsx | status of each activity row, agent state, receipt check |
| MetricCard | src/pages/Account.tsx | trades, refusals, agent, 24 h spend |
| ActivityRow | src/components/GateLog.tsx | trades, refusals and admin events with explorer links |
| CapsTable | src/pages/Account.tsx `.caps` | per-token caps, right-aligned tabular numbers |
| ChainSwitch | src/components/ChainSwitch.tsx | Robinhood Chain / Arbitrum |
