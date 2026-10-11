# CHIRON agent-account page: design audit, round 6

Mode: AUDIT ONLY. No source edits, no server, no commits. Evidence: `docs/design/r6-1440.png`, `r6-390.png`, `r6-full-1440.png`, `r6-full-390.png`, `r6-arb-full-1440.png`, `r6-arb-390.png`, `r6-recheck-390.png` (after pressing the primary action), `before-1440.png`, `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx`, `src/components/{Chip,GateLog,Stamp}.tsx`, `src/pages/account/gateRows.ts`. Previous report: `design-audit-chiron-r5.md`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B-

Verdict in one line: round 6 closes all five round-5 Mediums at the root (refusals are now filed under the check whose custom error they are, the served model is deduped, the mobile button inset is gone, the lavender config chips are neutral, Approved code collapses to a count) and most of the polish list, and adds a per-network accent (Robinhood lime, Arbitrum blue); but it ships a new High on mobile: the signature strip's grid places the fourth row into the 28px number column, so "none refused here" stacks one word per line and the red refusal chips hang under the numerals, on both chains, inside the first two mobile screens.

## First impression

- The page communicates **an instrument that shows its own refusals**: one claim, one lime action, then a strip that says where each call is checked and how many were turned away there.
- I notice **the strip finally agrees with the feed** (`r6-1440.png`): step 1 "1 refused here" matches "Caller is not the admitted agent", step 2 matches "Code the owner has not approved", step 3 matches "Trade above the per-trade cap", and the settled proposal is counted once in a note below. The diagram now tells the truth about its own evidence.
- First three things my eye goes to: **the headline**, **the lime "Recheck every receipt" slab**, **the three red-ringed step numerals**. The first two are intended. The third pulls the eye to the strip, which is right, but in red, which reads "this account is failing" on an account where every refusal is the product working.
- One word: **credible**.

Page area test at 1440: top bar, hero sheet, strip, Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS.

## Round 5 findings, checked against round 6

| R5 finding | Status in r6 | Evidence |
|---|---|---|
| 001 strip misfiles refusals, mixes account state with per-trade checks (Medium) | **Fixed** | `Account.tsx:80-85` `STEP_OF` maps every custom error to gate 0-3; `:148` counts per gate; `:229-232` prints the remainder. Rendered: 1 / 1 / 1 / none, plus "1 more refused outside these checks" (`r6-1440.png`), matching the four refused feed rows. Title now reads "Where every call is checked, and how many were turned away at each step", which is what the strip shows. Gate values are Archivo words with a mono figure ("**4** measurements approved", `:210`). |
| 002 Arbitrum prints served model twice (Medium) | **Fixed, residue** | `Account.tsx:152` `new Set(...)`. Rendered once (`r6-arb-full-1440.png`). Residue: the served name equals the pinned name on Arbitrum, so the line restates the value above it and wraps at the hyphen ("phala/qwen3.8-27b-" / "uncensored"). |
| 003 primary button inset 16px on mobile (Medium) | **Fixed** | 640px block no longer pads `.hero-action`; button, headline and lede share x=33 (`r6-390.png`, `r6-arb-390.png`). |
| 004 Activity ~2300px down on mobile (Medium) | **Partly fixed** | Approved code is a disclosure ("4 measurements (show)", `Account.tsx:266-269`). Activity now starts ~2140px down (`r6-full-390.png`, heading at ~980 of 2000 display px x 2.18). Cap groups are still full three-row grids, and the broken strip (FINDING-001) adds height. Still Medium. |
| 005 lavender chips on config rows (Medium) | **Fixed** | `Chip.tsx:24-25` `PINNED` and `APPROVED CODE` are `neutral`. Residue: `'info'` survives in the `Tone` type (`Chip.tsx:3`), `.chip-info` (`styles.css:71`) and `--info`/`--info-wash` (`tokens.css:21-22`) with no caller. |
| Polish: cap refusal repeats amount, leaks `amountIn` | **Fixed** | "execute() from 0x4a0B…8eA8 · 10.000001 testUSDG into TSLA · cap 10.00 testUSDG". |
| Polish: Proposed vs trade model phrasing | **Fixed** | Proposed row: "Waits for the owner · served by llama3-3-70b (0xc853…df59)". One verb. |
| Polish: "· 0 / waiting for the owner" | **Fixed** | "none waiting for the owner". |
| Polish: rail runs past node 4 | **Fixed** | `styles.css:151` `right: calc(... - 14px)`; rail stops at node 4's center (`r6-1440.png`). |
| Polish: 0% bar reads as a divider | **Fixed** | `Account.tsx:218` renders `.bar` only when `used > 0`. |
| Polish: "Pinned model" label wraps | **Fixed** | `.kv dt { white-space: nowrap }` (`styles.css:196`). |
| Polish: block stamp words in mono | **Fixed** | `.stamp-l` is Archivo 14 (`styles.css:90`); "Robinhood Chain Testnet, block" in body face, `133,067,547` in mono. |
| Polish: red count chip when only unreadable | **Fixed** | `Account.tsx:187` tone `warn` when `verified + unreadable === total`. |
| Polish: dead `Num`, duplicate rules, `--fs-40` | **Mostly fixed** | `Num` and `--fs-40` gone. `.caps` still declared twice (`styles.css:199-200`, the second overrides the first's gap); `.ledger-head` has two rules in the 640px block (`:242`, `:246`). |
| Polish: `.tx-key` uppercase | **Fixed** | `styles.css:125` no transform. |
| Polish: ghost recheck on Arbitrum | **Unchanged, acceptable** | Disabled ghost plus reason. |

Five of five Mediums addressed (four closed, one reduced); ten of eleven polish items closed.

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | Headline, one lime action, the strip, then ledger and Policy (`r6-1440.png`). The strip now earns its position: it is the page's mechanism and its counts are true. Loses points: four equal cells, so nothing marks which check did most of the work; hero right column empty from y~270 to y~396 at 1440; three red numerals compete with the primary action for the second fixation. |
| Typography | 8.0 | Archivo for words, Plex Mono only for figures and hashes in the strip and stamp; one chip face; sentence case everywhere outside the wordmark. Loses points: the chain switch sets "Robinhood Chain 46630" and "Arbitrum 421614" in mono (`styles.css:76`), words as terminal output; strip rows drift: step 1's chip value is taller than a text value, so its "1 refused here" sits at y~611 while steps 2-3 sit at y~607 and step 4's hint at y~606; Arbitrum served name breaks at the hyphen. |
| Color | 7.5 | Config states neutral, amber only Proposed, red only refusals and failed checks, accent only on the primary action, focus and selection. The per-chain accent is a real idea: the page's one hue names the network. Loses points: on RHC the lime accent (#c3f53c) and the success green (#3fb950) sit in the same viewport with different meanings ("Recheck" slab vs "Admitted", "Open", "Executed"), two yellow-greens a reader must tell apart; `.gate:has(.chip-bad) .gate-n` (`styles.css:162`) paints the numeral ring red on top of the red chip, so a healthy account shows three red alarms in its signature element; on Arbitrum the accent is invisible (ghost button), so the chain color appears only as the 8px switch dot. |
| Density | 7.0 | Desktop tight, Approved code collapsed, caps as hairline groups. Loses points: mobile Activity still ~2140px down; Arbitrum still leaves ~390px of empty left column under a 3-row feed (feed ends y~955, Policy ends y~1340, `r6-arb-full-1440.png`); the broken mobile strip adds three lines per empty step. |
| Components | 7.0 | Primary action covers idle, running, done, failed-with-link, unreadable and nothing-to-do; per-row "Receipt verified" chips appear in the feed after a recheck (`r6-recheck-390.png`), linking the verdict to rows. Rail fixed, `Num` gone. Loses points: the mobile `.gate` grid (FINDING-001) is a component defect; dead `info` tone path in type, CSS and tokens; `.caps` and `.ledger-head` duplicates; three treatments for "nothing here" in one panel ("No agent" chip, "none" hint, "None" chip, `r6-arb-full-1440.png`). |
| Mobile | 6.0 | Button inset fixed, chain switch full width, verdict lands under the button, per-row receipt chips readable, no horizontal scroll. Loses points: the signature strip is broken at 390 on both chains: "none / refused / here" one word per line under the step numeral (`r6-full-390.png` step 4, `r6-arb-390.png` step 1, first screen), and "1 refused here" chips sit at x=33 under the numerals instead of under the step label (`r6-390.png`); Activity ~2140px down. |
| Consistency | 8.0 | DESIGN.md:5 and :9 describe the per-chain accent and the refusal mapping that the code ships; model phrasing unified; no uppercase transforms left; config tones match the contract. Loses points: empty-value treatments differ row to row; `info` tone exists in code that DESIGN.md no longer has a role for; Arbitrum "served as" restates the pin verbatim. |
| Evidence / clarity | 9.0 | Strongest axis, and stronger than r5. Each refusal is counted under the gate whose custom error it raised, the remainder is explained, the served model sits beside the pin and in every trade row, the recheck verdict is computed in the browser and repeated on each trade row, and the block stamp ties every figure to a height. Loses points: the strip note says "(for example a proposal already settled)" although the code knows the exact error of every uncounted row, so it hedges where it could name; the Arbitrum served-as line adds a value with no new information. |

## Findings by severity

### High

**FINDING-001: the mobile strip puts its fourth row into the numeral column.** `styles.css:239-240`: under 640px `.gate` is a two-column grid (`28px minmax(0,1fr)`) and `.gate-n` spans 3 rows, but a gate has up to five children (numeral, label, value, foot, refused). The fifth auto-places into column 1, the 28px numeral column. Rendered: "none refused here" wraps to three lines of one word each (`r6-full-390.png` step 4; `r6-arb-390.png` step 1, inside the first mobile screen on Arbitrum), and the nowrap "1 refused here" chips overflow from x=33 under the numerals instead of starting under the label at x=73 (`r6-390.png`, `r6-recheck-390.png`). This is the page's signature element on the viewport most judges will open on a phone, and it reads broken. Fix: `.gate > :not(.gate-n) { grid-column: 2 }` and `.gate-n { grid-row: 1 / -1 }` in the 640px block.

### Medium

**FINDING-002: Activity still ~2140px down on mobile.** `r6-full-390.png`. Collapsing Approved code took ~160px; the two cap groups (six rows plus headers) and the strip still precede the first ledger row. Fix: under 640px render each cap group as one line ("testUSDG 10.00 per trade · 0.00 / 5.00 today · owner above 2.00") or collapse Caps behind the same disclosure pattern as Approved code. Fixing FINDING-001 also returns ~100px.

**FINDING-003: red numeral rings turn a working account into an alarm.** `styles.css:162` `.gate:has(.chip-bad) .gate-n { border-color: var(--bad); color: var(--bad) }`. On RHC three of four numerals are red (`r6-1440.png`), on Arbitrum one. A refusal is the account doing its job; the red chip already says how many. Doubling it on the step marker is what makes the strip read as an incident board, and it is the third fixation on the page. Fix: drop the rule, or tint the ring neutral-strong and keep red for the chip only.

**FINDING-004: two yellow-greens with different meanings on RHC.** `tokens.css:43` sets `--accent: #c3f53c` (action) while `--ok: #3fb950` (success). In the first viewport the lime slab sits above the green "Admitted" chip; after recheck the lime "Recheck again" sits directly over the green "3 of 3 receipts verified" chip (`r6-recheck-390.png`). A reader cannot tell from hue alone whether lime means "done" or "press". The per-chain accent is a good idea; on the one chain whose brand color is a green, success needs to move away from it. Fix: on `[data-chain='robinhood-testnet']` shift `--ok` toward a cooler, less saturated green (for example #4cc38a) or render success chips with the neutral surface and a green dot only.

### Polish

- Strip note hedges: "1 more refused outside these checks (for example a proposal already settled)" (`Account.tsx:231`). Name the actual errors from the uncounted rows ("1 more refused: proposal already settled").
- Arbitrum "served as phala/qwen3.8-27b-uncensored" equals the pinned name and breaks at the hyphen. When every served name equals the pin, print "served under this name" or omit; add `overflow-wrap: anywhere` only as a fallback.
- Strip rows misalign by ~4px at 1440 because step 1's value is a chip. Use `grid-template-rows: subgrid` on `.gate` or give `.gate-value` a fixed line box (`min-height: 26px; display: flex; align-items: center`).
- Three empty-value treatments in one panel: "No agent" chip (strip), "none" hint (Agent key), "None" chip (Approved code). Pick the hint for Policy values, the chip only for states.
- Chain switch labels in mono (`styles.css:76`). Words in Archivo, chain id in mono.
- Dead `info` path: `Tone` member, `.chip-info`, `--info`, `--info-wash`.
- `.caps` declared twice (`styles.css:199-200`); `.ledger-head` split across two rules in the 640px block (`:242`, `:246`).
- Hero right column empty below the hint at 1440 (~126px). The verdict lands there after a recheck, so this is a pre-action state; acceptable.
- Arbitrum: the accent never renders on the page body (ghost button), so the chain-colored accent claim in DESIGN.md:5 holds only on RHC. The 8px switch dot carries it alone.

## AI slop read

Removed since r5: the half-earned stepper is now fully earned. Its numbers line up with its steps by custom error, which is the opposite of a structure chosen before its content. The lavender config chips and the lavender accent are gone. Added: a neon lime accent on a near-black canvas, which is exactly calibration look 2 ("near-black, one neon accent"). Two things keep it from being the reflex: there is no glow, halo or gradient anywhere, and the hue is not chosen from the category, it is the selected network's own color and switches to Arbitrum blue with the chain, so it carries information. The Linear-derived surface stack, pill chips with leading dots and hairline rows remain predictable from "dark crypto console". Net: one tell retired properly, one added but argued. Grade moves from C+ to B-.

Litmus: brand unmistakable in first screen YES; one strong anchor YES (headline, then the lime action); scannable by headings YES; one job per section YES; cards necessary YES for sheet and Policy, NO for Owner controls (already a disclosure row, correct); motion improves hierarchy N/A (hover and color transitions only); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action are obvious, left edge aligned)
  Tap Recheck           80 -> 90  (+10 verdict under the button, per-row "Receipt verified")
  Read the strip        90 -> 85  (-5 "none / refused / here" stacked, chips under numerals)
  Look for the trades   85 -> 80  (-5 Activity ~2140px down)
  Read a refusal        80 -> 85  (+5 each refusal is counted under the check that raised it)
  Compare model names   85 -> 90  (+5 pin and served name side by side)
  FINAL: 90/100 healthy
```

## What r6 got right

- The strip's counts now come from the contract's own custom errors (`STEP_OF`), so the page's diagram and its ledger cannot disagree. That was the round-5 headline finding and it is fixed at the source, not relabelled.
- Every round-5 Medium was addressed at its root: `Set` on served names, the stale padding rule deleted, tone map corrected, Approved code as a disclosure.
- The per-chain accent is a design decision with an argument: the page's only hue answers "which network am I reading" before any text does.
- Against `before-1440.png` (unstyled `dl`, misaligned caps table, uppercase underlined "EXECUTED", a vertical account rail), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-001: `.gate > :not(.gate-n) { grid-column: 2 }` and `.gate-n { grid-row: 1 / -1 }` in the 640px block.
2. FINDING-003: delete `styles.css:162`.
3. Polish: name the uncounted errors in the strip note instead of "for example".
4. Polish: omit "served as" when it equals the pin.
5. Polish: delete the dead `info` path and the duplicate `.caps` rule.

Blind spot: no live browser run (by instruction). The strip row offsets and mobile Activity offset are read from screenshots (full-page mobile captures are downscaled ~2.2x); the recheck failure and unreadable branches, the expanded "Show 27 renewals and setup" feed, open Owner controls, hover and focus states, and coarse-pointer touch targets were not observed rendered; claims about them come from source.

AXES: avg=7.6 min=6.0
