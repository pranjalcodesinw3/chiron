# CHIRON agent-account page: design audit, round 13

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r13-1440.png`, `r13-390.png`, `r13-full-1440.png`, `r13-full-768.png`, `r13-full-390.png`, `r13-arb-1440.png`, `r13-arb-390.png`, `r13-arb-full-1440.png`, `r13-arb-full-768.png`, `r13-arb-full-390.png`, with 1:1 crops of the chart and Activity regions. Also read: `DESIGN.md` (still byte-identical to `docs/design/DESIGN-CONTRACT.md`), `src/styles.css`, `src/components/{CapRuler,CapRuler.test}.tsx/.ts`, `src/pages/Account.tsx`, `src/pages/account/{gateRows,currentAdmission.test}.ts`, `contracts/src/AgentAccount.sol:285-330` (to check a chart claim), and commit `4abc77d` (`git show HEAD -- web/src`). I measured phone Activity heading positions the same way as in r9-r12: a pixel scan for bright heading text in x 16-110 of the full 390 capture. `npx vitest run` on the two touched test files: 2 files, 5 tests, all pass. Previous report: `design-audit-chiron-r12.md` (checked below).

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B-
AI Slop Score: B

Verdict in one line: round 13 closes the r12 trust-gate finding properly. `currentAdmission()` matches on an address field, is pure, and has tests that can fail. Lanes are now 20px apart, so circles in different lanes cannot cover each other. Phone Activity is back at r9 height (~1,910px). The density win came from deleting the numbered attempt list on phones, though, and that list was the only key to the chart. On a phone the marks are now numbers with no amounts. The new hint sends the reader to Activity, and the only numbers there ("Trade 1", "Trade 2", "Trade 3") name different calls than marks 1, 2 and 3. That is a High on the page's primary job: what traded and what was blocked. The same change made `DESIGN.md` and the SVG's `aria-label` false. Separately, a CSS specificity bug (present since r12, missed by r12) means a "+k" count would render in canvas ink, so it would be invisible. Net: cleaner code, worse phone reading. B to B-.

## First impression

- The page communicates **"3 trades went through, 4 calls were refused, 3 of those asked for 15.000001 testUSDG and none of it was spent"**. The hero did not change this round (`r13-1440.png` y~313, `r13-390.png` y~340-423).
- I notice **the chart on a phone is now five colored dots with numbers and no amounts** (`r13-full-390.png` crop y~1,640-1,850). Under it: "Each mark is numbered in time order; the Activity list below gives every call its amount and reason." I scroll to Activity. The first row is a `registerAgent()` refusal, newest first. The first number I find is "Trade 3" on a Paxos USDG trade that is not on the chart at all. Mark 1 on the chart is a refused 4.00 call. "Trade 1" in the feed is an executed 1.00 call.
- First three things my eye goes to: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold 28px headline**. The red chip is still fourth, the same as r10-r12.
- One word: **trustworthy** at 1440, **cryptic** at the phone chart.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart, Activity, Policy, Owner controls, footer. Each one can be named in under 2 seconds. Trunk test: PASS. At 390 the chart area fails the 2-second test: I can name it ("trade attempts against the caps") but cannot read a single attempt off it.

## Round 12 findings, checked against round 13

| R12 finding | Status in r13 | Evidence |
|---|---|---|
| 001 cross-lane marks cover each other, "+k" never rendered (Medium) | **Half fixed** | `CapRuler.tsx:13` lanes are now 13 / 33 / 53, 20px apart against 18px circles, so circles in different lanes cannot overlap (2px gap). `TRACK_H` 54 to 66 and `H` 150 to 162 to match. Not done: "+k" is still drawn at `(x + 12, lane - 6)`, which reaches 4px into the lane above. No render test was added, so putting the spacing back to 13 fails nothing. "+k" has still never been rendered, and reading the CSS shows it would be invisible (FINDING-003). |
| 002 trust-link gate untested, matches a display string (Medium) | **Fixed** | ADMITTED and REVOKED rows now carry `agent` (`gateRows.ts:199-202`). `currentAdmission(rows, agent, zero)` (`gateRows.ts:316-324`) walks newest first, returns undefined on a revoke of this agent and on a newest admission for another agent, and compares lowercased addresses. `currentAdmission.test.ts` covers admit, admit-then-revoke and another agent. Mutation check by reading: delete the REVOKED line and the second assertion of test 2 goes red; return any ADMITTED row and test 3 goes red. Residue: revoke-then-readmit, the fourth case r12 asked for, is not tested; `Account.tsx:161-162` calls `currentAdmission` twice for one value; nothing asserts that `activity` is newest first. All polish. |
| 003 phone Activity ~160px later than r9 (Medium) | **Fixed by deletion, regression created** | Heading at ~1,910px (r12 ~2,061, r9 ~1,898). Target met. The method was `marks.length && !narrow` (`CapRuler.tsx:99`): the numbered list no longer renders under 560px. The zone key was not folded and mark numbers were not added to feed rows, which were the two fixes r12 suggested. See FINDING-001 and FINDING-002. |
| 004 r12 commit overwrote r11 evidence (Medium) | **Not repeated, not repaired** | `4abc77d` added only `r13-*` captures; the `r12-*` files are untouched. The r11 files still hold the a140663 re-renders (`git diff 811292f HEAD --stat -- docs/design/r11-*` shows all ten changed). No write-once guard in `shots.cjs`. Downgraded to polish because it did not happen again. |
| 005 contrast proof built from constants, no run since r10 (Medium) | **Not fixed (fifth round)** | No `contrast-r11/12/13.txt`. The FINDING-003 bug below is exactly what a computed-style contrast pass would have caught: it would have measured near-black on a dark wash. See FINDING-004. |
| Polish: phone metric row dots read as bullets, "spent." alone on a line | **Not fixed** | `r13-390.png` y~370-423, the same as r12. |
| Polish: "asked for" counts the owner's own `approveTrade()` | **Not fixed** | Mark 1 (4.00, "proposal already settled") is an owner call plotted and counted as an agent attempt. |
| Polish: boundary marks on threshold lines (since r8) | **Not fixed** | Mark 4 is split by the amber dashed line, and mark 3 sits on the red cap line, at all three widths. |
| Polish: hero label wrap, empty right column, headline weight | **Not fixed** | ~290px of empty column under the recheck hint at 1440 (`r13-1440.png`). |
| Polish: mixed scope ("3" counts Paxos USDG) | **Not fixed** | Now it is also part of FINDING-001: "Trade 3" in the feed is the Paxos trade, with no mark. |
| Polish: Arbitrum "0" headline, empty column | **Not fixed** | `r13-arb-1440.png`. New small mismatch: "Here the agent buys WETH with USDG" under "No agent admitted now". |
| Polish: verified link and revoke line share one underline style | **Not fixed** | `r13-1440.png` y~158 vs `r13-arb-1440.png` y~158. On 390 the revoke line still wraps with "08:11 UTC ↗" alone on its second line (`r13-arb-390.png` y~232). |
| Polish: `.lead-value` 48px literal, 12px numerals, `DESIGN.md` scale | **Not fixed** | `styles.css:283`, `:184`, `:200`. |
| Polish: `.tnum` twice, `.ledger-head` split | **Not fixed (sixth round)** | `styles.css:20-21`; `:221`, `:295`, `:300`. |
| Polish: `DESIGN.md` and `DESIGN-CONTRACT.md` duplicated | **Not fixed** | `cmp` reports identical. Neither was updated for r13's behavior change, so both are now wrong in the same way (FINDING-002). |
| Polish: `CapRuler.test.ts:13` default string sort | **Not fixed** | `.sort()` on numbers. |
| Polish: `spentToken` double `try`, `overlap.cjs` on Playwright | **Not fixed** | Unchanged. |

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | The 64px figure leads on both chains at every width. | Unchanged: "3" mixes tokens; on Arbitrum an empty state is a headline number. |
| (2) Every number states what it means | Hero clauses, per-check refusal counts, and at 768 and up a numbered list with amount, outcome, distance past the line and reason. | **On phones the chart's numbers state nothing.** Five numbered marks, no amounts, and a pointer to a feed whose numbers mean something else (FINDING-001). |
| (3) Semantic colors plus one accent | Four tones plus the network accent, unchanged. | The "+k" count resolves to `--canvas` fill on executed and refused marks (FINDING-003). The contrast proof still cannot fail (FINDING-004). |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks, unchanged since r10. | Still not observed rendered: Owner controls are collapsed and no wallet is connected in any capture. |
| (5) Trust signals | The admission link now rests on an address comparison with tests, not on a formatted title. Network badge, block stamp, explorer links, UTC times. | Strongest round yet on this rule. Only residue: revoke-then-readmit untested. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.5 | Unchanged. The hero was not touched. Same losses: the 28px bold mechanism headline is the third-heaviest object, ~290px of empty right column at 1440, and the 22ch label wraps with room to spare. |
| Typography | 8.0 | Unchanged. The 48px and 12px literals remain, the `DESIGN.md` scale omits 48 and 64, and the phone metric row still starts lines with dots. |
| Color | 8.5 | Unchanged on screen. The "+k" fill bug is latent (no grouped marks in the data), so I score it under Components and Evidence, not here. |
| Density | 7.5 | Up from 6.5. Phone Activity at ~1,910px, level with r9. Arbitrum Activity at ~1,770px. Losses: the zone key still takes two lines under the phone chart, and Arbitrum at 1440 still has ~330px of empty column under a three-row feed. |
| Components | 7.5 | Down from 8.0. Gains: lanes 20px apart, `currentAdmission` extracted and tested. Losses: `.mk text` (0,1,1) outranks `.mk-more` (0,1,0), so "+k" is drawn in canvas ink (FINDING-003); the "+k" can still reach into the lane above; `attempts-compact` and the `!narrow` reason check are now dead code (`CapRuler.tsx:100`, `:106`, `styles.css:196`); the comment at `CapRuler.tsx:46-47` says "the numbered list below still gives every call its own line", which is false on phones. |
| Mobile | 7.0 | Down from 7.5. Activity is higher, but the chart on a phone cannot be read for a single amount. The hint asks the reader to reverse the order (marks oldest first, feed newest first) and to skip non-trade rows. The dots still read as bullets, and mark 4 is still split by the dashed line. |
| Consistency | 7.0 | Down from 7.5. Two numbering schemes for the same calls on one page (mark n, "Trade n"). `DESIGN.md:21` and the SVG `aria-label` describe a list that phones no longer get. Duplicate CSS rules for a sixth round. |
| Evidence / clarity | 7.5 | Unchanged overall. Up: the trust gate is now structural and tested. Down: on phones the chart's numbers point the reader to the wrong rows (FINDING-001); there has been no contrast run since r10; and the lane-spacing fix has no test that goes red at 13px. |

## Findings by severity

### High

**FINDING-001: on phones the chart's mark numbers now map to nothing, and the feed's only numbers name different calls.** Under 560px `CapRuler.tsx:99` drops the numbered list. In its place, `:111` says "Each mark is numbered in time order; the Activity list below gives every call its amount and reason." Activity rows carry no mark number. Their only numbers come from `gateRows.ts:174`: "Trade ${a.tradeId}". In the RHC data, mark 1 is a refused 4.00 `approveTrade()` call. "Trade 1" is an executed 1.00 call, which is mark 2. "Trade 2" is mark 4. "Trade 3" is a Paxos USDG trade that is not on the chart. A reader who follows the hint and matches numbers will read a refusal as a trade. That is the one confusion this page exists to prevent. A reader who does not match numbers has to count the feed backwards, skip admissions, withdrawals and a `registerAgent()` refusal, and judge amounts from dot positions against ticks at 0, 2 and 10 (`r13-full-390.png` crops y~1,640-1,850 and y~1,910-2,900). At 768 and 1440 the list is still there, so this is phone only. Fix, smallest first: (a) put the mark's number on its feed row, using the same `.an` disc beside the tag chip, for every row that has a `spend` on the lead token. Then the hint is true, and "Trade n" either goes or becomes "trade id n" in the mono sub line. (b) Restore the compact list on phones behind a `<details>` disclosure, "5 attempts on testUSDG", which costs one line of height. Either keeps Activity near ~1,910px. Verify on the RHC 390 capture: a reader can go from mark 1 to its row and its "proposal already settled" reason without counting.

### Medium

**FINDING-002: the phone change made the contract and the text alternative false.** `DESIGN.md:21` (and its identical twin `DESIGN-CONTRACT.md`) still says "the numbered list under the chart gives each mark its exact amount, outcome, distance past a line it just crossed, and the refusal reason, so nothing depends on hover". The SVG's `aria-label` (`CapRuler.tsx:70`) still ends "listed below the chart." Under 560px neither is true. A screen reader on a phone hears "5 attempts, listed below the chart", and no list follows. `narrow` comes from the container width, not the device, so a desktop reader at 250% zoom (a 1440 window becomes 576 CSS px, and the sheet's padded content box is then under 560) also loses the list. That is WCAG 1.4.10 reflow territory: content should not disappear when the page reflows. Fix: the FINDING-001 disclosure fixes all three at once, because the list exists at every width and is collapsed on narrow. Then correct `DESIGN.md:21` once and make `DESIGN-CONTRACT.md` a pointer.

**FINDING-003: a "+k" count renders in canvas ink on executed and refused marks.** `.mk text { fill: var(--canvas) }` (`styles.css:184`) has specificity (0,1,1). `.mk-more { fill: var(--ink-muted) }` (`:197`) has (0,1,0). The "+k" `<text>` sits inside `<g class="mk mk-…">` (`CapRuler.tsx:79-82`), so the first rule wins and the count is drawn near-black on a 0.12-alpha dark wash: invisible. Approved marks escape only because `.mk-approved text` (0,1,1, declared later) sets `--ok`. This was introduced in r12, and r12 missed it because "+k" has never been rendered. It matters more now: on phones the chart is the only view of attempts at a given amount (FINDING-001), so a grouped refused mark would hide a refusal without any visible cue. Fix: `.mk .mk-more { fill: var(--ink-muted); }`, and move the label into its own lane (`y = lane + 4`, `x = m.x + 13`, start-anchored) so it never reaches the lane above. Add the render case r12 asked for: executed 2.00, approved 2.000001, two refused at 4.00. Assert one "+1" exists, that its computed fill is not `--canvas`, and that no two circles sit closer than 18px. Put the lanes back to 13px apart once and confirm the test goes red.

**FINDING-004: the contrast proof is still built from constants, and nothing has been measured since r10 (r9 FINDING-002, r10-r12 FINDING-005).** `contrast.cjs:45-50` composites hard-coded hex values at 0.12 alpha. FINDING-003 is the proof of cost: a run that read computed `fill` on `.mk-more` would have reported roughly 1:1 the day it shipped. Fix: in the page loop, read computed `fill` and `stroke` for `.mk text`, `.mk-more`, `.l-warn`, `.l-bad` and the `.z-*` rect under each. Inject one grouped mark with a fixture so `.mk-more` exists. Add a control that forces `--warn-wash` to 0.9 alpha and confirm a line turns red. Commit `contrast-r13.txt`.

### Polish

- `currentAdmission` is not tested for revoke-then-readmit (`[ADMITTED A, REVOKED A, ADMITTED A]`). A rewrite to "any revoke of this agent means no link" passes all three tests and breaks every readmitted agent. One more `it`.
- `Account.tsx:161-162` calls `currentAdmission` twice. `const admitted = activity && snap ? currentAdmission(activity, snap.agent, ZERO_ADDR) : undefined; const admitIsCurrent = !!admitted;`.
- Dead code after the phone change: the `attempts-compact` class branch (`CapRuler.tsx:100`), `!narrow` in the reason check (`:106`), `.attempts-compact li` (`styles.css:196`). The comment at `:46-47` is now false on phones.
- The phone chart carries two instruction sentences, the figcaption hint and the new hint. If FINDING-001(a) lands, the second one can go.
- Chart zones are correct against the contract: `_spendWindow` runs only on direct `execute` (`AgentAccount.sol:295`), so owner-approved trades do not draw on the daily cap. Still, "executes up to 2.00" holds only while the 24h window has room, and Policy shows 5.00 a day. One tick mark for "5.00 a day" or a caption clause would close it.
- Phone metric row: dots begin wrapped lines and read as bullets, and "spent." is alone on a line (`r13-390.png`).
- "Asked for" includes the owner's own `approveTrade()`; mark 1 is that call.
- Boundary marks 3 and 4 still sit centered on the lines they crossed (since r8).
- Hero: the 22ch label wraps with ~500px free; ~290px of empty right column at 1440; the 28px headline outweighs the refused chip.
- Mixed scope: "3" counts the Paxos USDG trade.
- Arbitrum: a 64px "0" headlines an empty account; "Here the agent buys WETH with USDG" sits under "No agent admitted now".
- The verified trust link and the revoke line share one underline style.
- r11 captures still hold the a140663 re-renders; restore from `811292f` and make `shots.cjs` refuse to overwrite `rN-*`.
- `.lead-value` 48px literal, 12px numeral literals; `DESIGN.md` scale omits 48 and 64.
- `.tnum` declared twice (`styles.css:20-21`); `.ledger-head` has two rules in one media block.
- `CapRuler.test.ts:13` default string sort on numbers.
- `gateRows.ts` `spentToken` double `try`; `overlap.cjs` drives Playwright's Chromium, and the standing rule for this machine is the Brave harness.

## AI slop read

Nothing new in the slop register. The round's changes are a pure function, a constant change and a deleted list. One big number with a full-sentence label, refusals counted per check, and a chart whose geometry comes from the contract's own branches are still the opposite of a template stat row. Lime on near-black is still calibration look 2, saved by having no glow, halo, gradient or grid, and by an accent that follows the network. It holds at B. It is not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES at 1440, NO for the chart at 390 (it shows but does not tell); cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 85  (+10 figure and refused count in first viewport; +5 timestamped admission, now address-checked)
  Read the metric row   85 -> 90  (+5  "3 of them ... none of it spent" answers the chip)
  Tap Recheck           90 -> 100 (+10 verdict in place, per-row chips; carried from r10, not re-observed)
  Read the chart        100 -> 90 (-10 five numbered dots, no amounts, an instruction to go elsewhere)
  Follow the hint       90 -> 80  (-5  feed is newest first, marks oldest first; -5 "Trade 1" is not mark 1)
  Find the trades       80 -> 90  (+10 Activity ~1,910px down, level with r9)
  Read a refusal        90 -> 95  (+5  named by its custom error, amount in the sub line)
  FINAL: 95/100 healthy
```

The final number is still healthy. The drain is concentrated in exactly the step the brief cares most about: reading what was blocked against what traded.

## What r13 got right

- It fixed FINDING-002 where it starts: an `agent` field on the rows, a pure function, and address comparison, with tests that go red under the two obvious regressions.
- It fixed the cross-lane circle overlap with geometry, not a nudge: 20px lane pitch against an 18px mark, and the track grew to keep it.
- Phone Activity is back at the r9 position for the first time since r9.
- It did not overwrite the previous round's captures.

## Quick wins (under 30 minutes each)

1. FINDING-003: `.mk .mk-more { fill: var(--ink-muted); }` and the in-lane "+k" position. Two lines.
2. FINDING-001(a): render the mark number as an `.an` disc on feed rows that spend the lead token. Build the map once in `Account.tsx` from the same oldest-first filter `CapRuler` uses, and pass it down.
3. FINDING-002: wrap the attempt list in `<details open={!narrow}>`. Fix `DESIGN.md:21` and make `DESIGN-CONTRACT.md` a pointer.
4. One `it` for revoke-then-readmit, and collapse the double `currentAdmission` call.
5. Delete the dead `attempts-compact` branch and CSS, one `.tnum` and one `.ledger-head` rule.

Blind spot: no live browser run (by instruction). FINDING-003 comes from CSS specificity read in source, not from a render. No capture contains a grouped mark, so the near-black "+k" has never been seen. FINDING-002 zoom case is inferred from `narrow` being container-width based, not observed. Sign-summary blocks, Owner controls, wallet-connected states, hover and focus rings and the recheck verdict were again not observed rendered. Phone positions come from a pixel scan of static captures. AA is assumed from the r10 run.

AXES: avg=7.69 min=7.0
