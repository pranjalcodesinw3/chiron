# CHIRON agent-account page: design audit, round 7

Mode: AUDIT ONLY. No source edits, no server, no commits. Evidence: `docs/design/r7-1440.png`, `r7-390.png`, `r7-full-1440.png`, `r7-full-390.png`, `r7-arb-full-1440.png`, `r7-arb-390.png`, `r7-recheck-390.png` (after pressing the primary action), `before-1440.png`, plus `r6-full-1440.png` and `r6-full-390.png` to tell new changes from carried ones; `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx`, `src/components/{Chip,ChainSwitch}.tsx`, `src/lib/format.ts`, `src/pages/account/gateRows.ts`. Previous report: `design-audit-chiron-r6.md`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B+
AI Slop Score: B-

Verdict in one line: round 7 closes the round-6 High at the root (the mobile strip now keeps every row in the content column), removes the red numeral rings, separates success (mint #3ec6a8) from the lime accent, aligns the strip rows, names the uncounted refusal and unifies empty values; no High remains, and the one surviving Medium is the same as last round: on a phone the first trade is still ~2,120px down.

## First impression

- The page communicates **an instrument that shows its own refusals**, and now it does so calmly: one claim, one lime action, a strip whose numerals are neutral and whose red appears only where a count of refusals lives.
- I notice **the strip finally reads as a diagram, not an incident board** (`r7-1440.png`): four neutral rings on one rail, four labels on one baseline (y~511), four values on one baseline (y~543), four refusal lines on one baseline (y~611-612). In r6 the rings were red and the rows drifted ~4px.
- First three things my eye goes to: **the headline**, **the lime "Recheck every receipt" slab**, **the strip's labels and figures** ("Admitted", "4", "0.00 / 5.00", "3"). All three are intended. The three red "1 refused here" pills are now the fourth fixation, which is the right rank.
- One word: **composed**.

Page area test at 1440: top bar, hero sheet, strip, Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS (wordmark, network switch with the selected chain highlighted, account address and block stamp under the headline).

## Round 6 findings, checked against round 7

| R6 finding | Status in r7 | Evidence |
|---|---|---|
| 001 mobile strip puts its 4th/5th row into the numeral column (High) | **Fixed** | `styles.css:237-239`: `.gate-n { grid-row: 1 / span 5 }` and `.gate > :not(.gate-n) { grid-column: 2 }`. Rendered: "1 refused here" chips start at x~73 under the label (`r7-390.png`); Arbitrum step 1 "none refused here" is one line at x~73 (`r7-arb-390.png`); step 4 on RHC no longer stacks one word per line (`r7-full-390.png`, compare `r6-full-390.png`). |
| 002 Activity ~2140px down on mobile (Medium) | **Barely moved, still Medium** | Caps now render as one three-cell row per token under 640px (`styles.css:240-242`), saving ~60px. Activity heading sits at ~1003 of 2000 display px x 2.12 = ~2,120px (`r7-full-390.png`); ~2,190px after a recheck (`r7-recheck-390.png`). See FINDING-001. |
| 003 red numeral rings (Medium) | **Fixed** | The `.gate:has(.chip-bad) .gate-n` rule is gone; `.gate-n` is `--hairline-strong` ring, `--ink-muted` figure (`styles.css:153`). All four rings neutral on both chains. |
| 004 two yellow-greens with different meanings on RHC (Medium) | **Fixed** | `tokens.css:15` `--ok: #3ec6a8` (mint), recorded in `DESIGN.md:7`. In `r7-recheck-390.png` the lime "Recheck again" slab sits over a mint "3 of 3 receipts verified" chip; the two read as different hues. Residue: `.tx-confirmed` still hard-codes the old green `rgba(63, 185, 80, 0.5)` (`styles.css:128`). |
| Polish: strip note hedges "for example" | **Fixed** | "1 more refused after the checks: proposal already settled." (`Account.tsx:229-233`), built from the uncounted rows' own titles. |
| Polish: Arbitrum "served as" restates the pin | **Fixed** | `Account.tsx:259` prints "served as" only when a served name differs from the pin. Arbitrum Pinned model is one line (`r7-arb-full-1440.png`). |
| Polish: strip rows misalign ~4px | **Fixed** | `.gate-value { min-height: 28px; display: flex; align-items: center }` (`styles.css:155`). Baselines match across all four columns (`r7-1440.png`). |
| Polish: three empty-value treatments | **Fixed** | Agent key and Approved code both render the `hint` "none" (`Account.tsx:262`, `:271`); the "No agent" chip remains only as a state in the strip, which is correct. |
| Polish: chain switch labels in mono | **Fixed** | `.chainsw a` is Archivo 560/14, chain id in Plex Mono 12 (`styles.css:75`, `:78`). "Robinhood Chain 46630" now reads as a word plus a number. |
| Polish: dead `info` path | **Fixed** | `Tone` is `'ok' \| 'warn' \| 'bad' \| 'neutral'` (`Chip.tsx:3`); no `.chip-info`, no `--info` in tokens. |
| Polish: `.caps` twice, `.ledger-head` split | **Half fixed** | `.caps` declared once (`styles.css:198`). `.ledger-head` still has two rules in the 640px block (`:244`, `:248`). |
| Polish: hero right column empty at 1440 | **Unchanged, acceptable** | Pre-action state; the verdict fills it after a recheck. |
| Polish: Arbitrum accent never renders on the body | **Fixed, with a cost** | The sheet now carries a 2px top rule in the network accent (`styles.css:132`), so Arbitrum blue shows at y~95 (`r7-arb-full-1440.png`). The cost is a known tell; see AI slop read. |

Four of four r6 Mediums addressed (three closed, one reduced by ~60px); ten of eleven polish items closed.

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.5 | Headline, one lime action, then a strip whose figures, not its alarms, take the next fixation (`r7-1440.png`). Red now marks only counts of refusals. Loses points: four equal strip cells, so nothing says which check did most of the work; hero right column empty from y~275 to y~395 at 1440 before a recheck; three red pills plus four red-washed feed rows still make red the second-most-frequent hue on RHC. |
| Typography | 8.5 | Archivo for words, Plex Mono only for figures, hashes, chain ids and the block number; one chip face; sentence case outside the wordmark; strip rows share baselines; no hyphen-broken model names. Loses points: wordmark is tracked mono (`styles.css:41`, 0.18em), the one remaining "tiny tracked mono label" note; gate values mix a 20px mono figure with a 14px Archivo unit ("4 measurements approved") in two columns and a pure mono pair ("0.00 / 5.00") in the third, so the row's type voice changes mid-strip. |
| Color | 8.0 | Neutral rings, mint success clearly apart from the lime action, amber only Proposed, neutral config chips, the accent now visible on both chains. Loses points: `.feed-row.is-refused` (`styles.css:178`) lays a red gradient under every refused row, four of thirteen rows on RHC, and at 390 they become full-width red bands (`r7-full-390.png`), repeating in the ledger the alarm reading that r7 removed from the strip; `.tx-confirmed` keeps the retired green; the 2px accent top rule on a rounded sheet is a decoration tell (see slop read). |
| Density | 7.0 | Desktop tight, Approved code collapsed, mobile caps compressed to one row per token. Loses points: mobile Activity still ~2,120px down (FINDING-001); Arbitrum leaves ~335px of empty left column under a three-row feed (feed ends y~960, Policy ends y~1,295, `r7-arb-full-1440.png`); mobile feed rows run ~140px each because chip, title, sub and meta each take a line. |
| Components | 8.0 | Primary action covers idle, running, done, failed-with-link, unreadable and nothing-to-do; per-row "Receipt verified" chips after recheck (`r7-recheck-390.png`); mobile strip grid correct; dead tone path and duplicate `.caps` gone. Loses points: `.ledger-head` split across two 640px rules; `.tnum` declared on `:20` and again on `:21`; `.tx-confirmed` outside the token system although the file header says every value comes from tokens. |
| Mobile | 7.5 | Strip fixed on both chains, button flush with the headline, chain switch full width with 44px coarse targets, verdict under the button, no horizontal scroll, caps readable in one row. Loses points: first trade ~2,120px down, behind a Policy panel that restates what the strip already shows (code count in step 2, 24 h caps in step 3); red refused-row bands are heavier at full width than at 1440. |
| Consistency | 8.0 | Model phrasing unified, empty values unified, chip tones match `DESIGN.md:5`, per-chain accent applied in action, focus, selection and sheet rule exactly as `DESIGN.md:5` says. Loses points: `DESIGN.md:3` still describes the system as "one lavender accent", contradicting `:5` and the code; `.tx-confirmed` green contradicts `DESIGN.md:7`'s mint. |
| Evidence / clarity | 9.0 | Each refusal counted under the check whose custom error raised it, the remainder named by its error, served model shown only when it differs from the pin, receipts recomputed in the browser with per-row verdicts, every figure tied to a block. Loses points: the strip's "3 trades through" counts the owner-approved proposal as a trade, while the feed tags that row "Approved", not "Executed"; a reader reconciling the two has to read the row's "Trade 2" sub-line to see it. |

## Findings by severity

### High

None.

### Medium

**FINDING-001: the first trade is still ~2,120px down on a phone.** `r7-full-390.png`: hero, strip, then the full Policy panel (owner, pinned model, agent key, approved code, two cap groups) before the Activity heading. Under 1000px `styles.css:222` orders `'side' 'ledger'`, as `DESIGN.md:9` specifies. The ordering made sense before the strip existed; now the strip already shows the agent state (step 1), the approved-code count (step 2) and the lead token's 24 h cap (step 3), so on a phone Policy repeats the strip before the user reaches what the headline promised ("every trade records the model"). Fix: under 640px put Activity before Policy (`grid-template-areas: 'ledger' 'side'`) and update `DESIGN.md:9` to match, or render the Policy panel as a `<details>` whose summary reads "Policy: open · 2 tokens capped". Either moves the first trade row to ~1,000px.

### Polish

- Refused feed rows carry a red gradient wash (`styles.css:178-179`). The chip already says "Refused" in red; the wash turns four of thirteen RHC rows into red bands, strongest at 390. Drop the wash, or limit it to a 2px left tick in the chip column.
- Sheet top rule `border-top: 2px solid var(--accent)` on a 10px-radius card (`styles.css:132`). It carries the network, which is an argument, but it is the colored-accent-border-on-rounded-card pattern. Alternative that keeps the information: color the chain stamp's dot under the headline, which already names the network in text.
- `DESIGN.md:3` "one lavender accent" contradicts `DESIGN.md:5` and `tokens.css:41-42`. Rewrite the line.
- `.tx-confirmed { border-color: rgba(63, 185, 80, 0.5) }` (`styles.css:128`) is the retired green. Use `rgba(62, 198, 168, 0.5)` or a `--ok-line` token.
- `.ledger-head` split across `styles.css:244` and `:248`; `.tnum` declared twice (`:20`, `:21`).
- Arbitrum: ~335px of empty left column under a three-row feed at 1440. Acceptable for a near-empty account; a one-line note under the feed ("Earlier events: 3 renewals and setup, hidden") would close the gap with content rather than space.
- Strip value voices differ across columns (mono figure plus Archivo unit vs pure mono pair). Either give step 3 a unit ("0.00 / 5.00 testUSDG") or drop units from steps 2 and 4.
- Hero right column empty before a recheck at 1440. Pre-action state; acceptable.

## AI slop read

Removed since r6: red numeral rings (the incident-board look) and the lime/green collision. Added: a 2px accent rule along the top of the rounded sheet, which is a stock detector pattern ([border-accent-on-rounded]); it is argued (it is the network's color and changes with the switch) but it is still the first decoration a generator reaches for to "brand" a card. Unchanged: neon lime on near-black is calibration look 2, rescued again by having no glow, halo or gradient and by the hue carrying information; the Linear-derived surface stack, pill chips with leading dots and hairline rows remain predictable from "dark crypto console". The red refused-row gradient is the one gradient on the page. Net: one tell retired, one added, grade holds at B-.

Litmus: brand unmistakable in first screen YES; one strong anchor YES (headline, then the lime action); scannable by headings YES; one job per section YES; cards necessary YES for sheet and Policy, Owner controls correctly a disclosure row; motion improves hierarchy N/A (hover and color transitions only, reduced motion honored at `styles.css:253`); premium without shadows YES (no decorative shadows in view).

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action obvious, left edge aligned)
  Tap Recheck           80 -> 90  (+10 mint verdict under the lime button, per-row "Receipt verified")
  Read the strip        90 -> 90  ( 0  rows now aligned, no broken wrap; r6 was -5)
  Look for the trades   90 -> 85  (-5  Activity ~2,120px down, behind a Policy panel that repeats the strip)
  Read a refusal        85 -> 90  (+5  counted under the check that raised it, error named in the note)
  Compare model names   90 -> 95  (+5  pin and served name side by side, served line omitted when equal)
  FINAL: 95/100 healthy
```

## What r7 got right

- The High was fixed at the grid, not patched per row: every non-numeral child is forced into column 2, so any future fifth or sixth row lands correctly.
- Every r6 color finding was fixed in tokens and recorded in `DESIGN.md` (mint `--ok`, neutral rings), so the contract and the page agree on what green means.
- The strip note now names the uncounted error from data instead of an example, which is the page's own rule (refusals mapped by custom error) applied to its last loose sentence.
- Against `before-1440.png` (unstyled `dl`, misaligned caps table, uppercase underlined "EXECUTED", a vertical account rail, mono-on-everything chain switch), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-001: under 640px, `grid-template-areas: 'ledger' 'side'`, and update `DESIGN.md:9`.
2. Delete `styles.css:178-179` (refused-row wash).
3. Fix `DESIGN.md:3` ("lavender") and `.tx-confirmed`'s green.
4. Merge the two `.ledger-head` rules in the 640px block; delete the duplicate `.tnum`.

Blind spot: no live browser run (by instruction). Offsets are read from screenshots (full-page mobile captures are downscaled ~2.1x, so the ~2,120px figure carries roughly +/-20px); the r6/r7 comparison of the refused-row wash comes from `r6-full-1440.png`, which shows it was already present and unflagged last round; recheck failure and unreadable branches, the expanded renewals feed, open Owner controls, hover and focus states and the tx toast were not observed rendered, and claims about them come from source.

AXES: avg=8.1 min=7.0
