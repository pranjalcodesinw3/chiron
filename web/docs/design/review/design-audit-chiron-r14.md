# CHIRON agent-account page: design audit, round 14

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r14-1440.png`, `r14-390.png`, `r14-full-1440.png`, `r14-full-768.png`, `r14-full-390.png`, `r14-arb-1440.png`, `r14-arb-390.png`, `r14-arb-full-1440.png`, `r14-arb-full-768.png`, `r14-arb-full-390.png`, with 1:1 crops of the chart, attempt list, hero and Activity regions. Also read: `DESIGN.md` (still byte-identical to `docs/design/DESIGN-CONTRACT.md`, `cmp` reports no difference), `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,CapRuler.test,Chip}.tsx/.ts`, `src/pages/Account.tsx:150-215`, `src/pages/account/{gateRows,currentAdmission.test}.ts`, `design-research/tools/contrast.cjs`, `docs/design/contrast-r14.txt`, and commit `fbc86d6` (`git show HEAD -- web/src`). I measured phone Activity heading positions the same way as in r9-r13: a pixel scan for bright heading text in x 16-110 of the full 390 capture. `npx vitest run` on `CapRuler.test.ts` and `currentAdmission.test.ts`: 2 files, 5 tests, all pass. Previous report: `design-audit-chiron-r13.md` (checked below).

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B

Verdict in one line: round 14 closes the r13 High the right way. The attempt list is back at every width, so on a phone each numbered mark again has its amount and outcome directly under the chart, and the SVG `aria-label` ("listed below the chart") is true again. The "+k" specificity bug is fixed (`.mk .mk-more` at (0,2,0) now beats `.mk text` at (0,1,1)). Token hygiene items that sat open for six rounds are gone: `--fs-48`, `--fs-12` in the chart numerals, one `.tnum`, one `.ledger-head`. The contrast script now reads computed colors instead of hex constants. Three things hold the grade at B and not higher. The phone "no bullet dots" rule leaks into the shared Chip and stretches "4 calls refused" into a 322px red bar. Phone Activity moved back down by ~193px. And the new non-text contrast pass still cannot be turned red by its own control, because the injected CSS never reaches the page it measures. Net: the page's primary job reads correctly at every width for the first time since r12. B- to B.

## First impression

- The page communicates **"3 trades went through, 4 calls were refused, 3 of those asked for 15.000001 testUSDG and none of it was spent"**. Unchanged at 1440 (`r14-1440.png` y~200-320).
- I notice **on a phone the red "4 calls refused" chip is now a full-width bar** (`r14-390.png` y~360-385, x 34-356). It reads like an alert banner or a progress track, not the same chip I see in the strip and the feed. The same on Arbitrum ("1 call refused", `r14-arb-390.png` y~382-405).
- I notice **the phone chart is legible again** (`r14-full-390.png` crop y~1,640-2,060): five marks, then five numbered rows: "1 4.00 testUSDG refused", "2 1.00 testUSDG executed", "3 10.000001 testUSDG refused, 0.000001 over the cap", and so on. I can read every attempt without leaving the sheet.
- First three things my eye goes to at 1440: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold 28px headline**. Red chip fourth, the same as r10-r13. At 390 the stretched red bar is now second, which matches the brief's "risk beside the headline" better than the desktop does, but for the wrong reason.
- One word: **legible**.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart with its list, Activity, Policy, Owner controls, footer. Each nameable in under 2 seconds. Trunk test: PASS. At 390 the chart area now passes the 2-second test too (it failed in r13).

## Round 13 findings, checked against round 14

| R13 finding | Status in r14 | Evidence |
|---|---|---|
| 001 phone mark numbers map to nothing; feed numbers name different calls (High) | **Fixed for the "what"; the "why" is still off-sheet** | `CapRuler.tsx:99` is now `marks.length ? <ol …>` at every width; under 560px the list gets `attempts-compact` (number, amount, outcome, distance past a line). The misleading hint ("the Activity list below gives every call its amount and reason") is deleted. Residue: `:106` still drops the refusal reason on narrow (`!narrow`), feed rows still carry no mark number, and "Trade 1/2/3" in the feed (`gateRows.ts:174`) still names different calls than marks 1/2/3. See FINDING-004. |
| 002 contract and `aria-label` false on phones (Medium) | **Fixed, one new false clause** | The list exists at every width, so `aria-label` "listed below the chart" (`CapRuler.tsx:70`) is true, and the 250% zoom reflow case no longer loses content. `DESIGN.md:21` now adds "(on phones each call is one line: number, amount, outcome; the reason stays in Activity)". Items 3 and 4 wrap to two and three lines at 390 (`r14-full-390.png` y~1,905-1,995), so "one line" is not what renders. `DESIGN-CONTRACT.md` is still a byte copy, so the clause is wrong in two files. |
| 003 "+k" drawn in canvas ink (Medium) | **Fixed in CSS, rest open** | `styles.css:196` `.mk .mk-more { fill: var(--ink) }` (0,2,0) now outranks `.mk text` (0,1,1) and `.mk-approved text` (0,1,1). Still open: "+k" is drawn at `(x + 12, lane - 6)` (`CapRuler.tsx:82`), so its 12px glyphs reach ~4px into the lane above; no render test exists (`CapRuler.test.ts` tests `groupMarks` geometry only), and no capture contains a grouped mark, so "+k" has still never been seen. Downgraded to polish because the color is now right. |
| 004 contrast proof built from constants (Medium) | **Half fixed** | `contrast.cjs:49-63` opens the RHC page and reads computed `fill`/`stroke` for `.mk-executed circle`, `.mk-refused circle`, `.l-warn`, `.l-bad`, `.z-*` and the approved ring. `contrast-r14.txt` prints the computed colors. But the control still cannot reach these lines, and a missing element silently removes its line. See FINDING-003. |
| Polish: revoke-then-readmit untested | **Not fixed** | `currentAdmission.test.ts` still has three cases. |
| Polish: `currentAdmission` called twice | **Not fixed** | `Account.tsx:161-162`. |
| Polish: dead `attempts-compact` code, false comment | **Resolved** | The compact branch is live again; the comment at `CapRuler.tsx:46-47` now reads "(one line per call on phones)", which has the same problem as `DESIGN.md:21`. |
| Polish: two instruction sentences under the phone chart | **Resolved** | The second hint is deleted. |
| Polish: daily cap not shown on the chart | **Not fixed** | Zones still say "executes up to 2.00"; Policy says 5.00 a day. |
| Polish: phone metric row dots read as bullets; "spent." alone | **Dots fixed, orphan not fixed, regression created** | `styles.css:283-284` removes the `·` and gives each `.lead-sub > span` its own line. "spent." still sits alone on its line (`r14-390.png` y~425). The selector also matches the Chip's root `<span>`. See FINDING-001. |
| Polish: "asked for" counts the owner's `approveTrade()` | **Not fixed** | Mark 1 (4.00, "proposal already settled") is still in the 3 and the 15.000001. |
| Polish: boundary marks on threshold lines (since r8) | **Not fixed** | Mark 4 is split by the amber dashed line and mark 3 sits on the red cap line at 1440, 768 and 390. |
| Polish: hero label wrap, empty right column | **Changed, no visible effect** | `.lead-label` 22ch to 34ch (`styles.css:211`). The label is 52 characters, so it still wraps at 1440 to "trades the agent executed inside the / owner's caps", with line two ~30px under the numeral's baseline (`r14-1440.png` y~239-270). ~290px of empty right column under the recheck hint is unchanged. |
| Polish: mixed scope ("3" counts Paxos USDG) | **Not fixed** | Feed row "1.00 Paxos USDG into 0.00391 TSLA … Trade 3" (`r14-full-768.png` y~1,970) has no mark. |
| Polish: Arbitrum "0" headline, empty column | **Not fixed** | `r14-arb-full-1440.png`: ~340px of empty canvas under a three-row feed. |
| Polish: trust link and revoke line share one underline style | **Not fixed** | `r14-1440.png` y~158 vs `r14-arb-1440.png` y~158. |
| Polish: `.lead-value` 48px literal, 12px literals, scale omits 48/64 | **Fixed** | `--fs-48` token (`tokens.css:28`), `styles.css:183`, `:199`, `:282` all use tokens, `DESIGN.md:8` and `:24` document "lead figure 64 / 48". |
| Polish: `.tnum` twice, `.ledger-head` split | **Fixed (after six rounds)** | One `.tnum` rule at `styles.css:20`; one `.ledger-head` rule in the 640px block at `:300`. |
| Polish: `DESIGN.md` and `DESIGN-CONTRACT.md` duplicated | **Not fixed** | Both edited by hand in the same commit; `cmp` identical. |
| Polish: r11 captures overwritten | **Not repaired, not repeated** | `fbc86d6` adds only `r14-*`; `r13-*` untouched. |
| Polish: `CapRuler.test.ts:13` default string sort | **Not fixed** | `.sort()` on numbers. |
| Polish: `spentToken` double `try`; Playwright tooling | **Not fixed** | `gateRows.ts` untouched; `contrast.cjs` and `overlap.cjs` still drive Playwright's headless Chromium. |

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | The 64px figure (48px on phones, now tokenized) leads on both chains at every width. | Unchanged: "3" mixes tokens; on Arbitrum an empty state is a headline number. |
| (2) Every number states what it means | Hero clauses, per-check refusal counts, and now at every width a numbered list with amount, outcome and distance past the line. | On phones the list states what and how far, not why: refusal reasons are dropped under 560px and the feed has no mark numbers to find them by (FINDING-004). |
| (3) Semantic colors plus one accent | Four tones plus the network accent; "+k" now `--ink`. | The bad-tone chip takes a second shape on phones, a full-width bar (FINDING-001). The non-text contrast check reads real colors but its control cannot fail it (FINDING-003). |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks, unchanged since r10. | Still not observed rendered: Owner controls collapsed, no wallet connected in any capture. |
| (5) Trust signals | Address-checked admission link, network badge with chain id, block stamp, explorer link and UTC time per row. | Unchanged from r13. Revoke-then-readmit untested. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.5 | Unchanged at 1440. The 28px bold mechanism headline is still the third-heaviest object; ~290px of empty right column; the 34ch label still wraps. On phones the stretched red bar now outweighs the headline, which happens to serve the brief, but by accident of a selector. |
| Typography | 8.5 | Up from 8.0. Every size on the page is a token and the contract documents 48 and 64. Phone metric row no longer starts lines with dots. Losses: "spent." orphan on 390; the label width change did nothing visible at 1440. |
| Color | 8.5 | Unchanged. "+k" moves to `--ink` (correct). Lime on near-black, no glow. |
| Density | 6.5 | Down from 7.5. Phone Activity heading at ~2,103px (r13 ~1,910, r12 ~2,061, r9 ~1,898), the same scan on all four. The list earns its space this time, but items 3 and 4 run two and three lines, the zone key still takes two lines, and the hero clause split adds a line. Arbitrum phone Activity at ~1,827px (r13 ~1,770). Arbitrum 1440 still has ~340px of empty column. |
| Components | 7.5 | Unchanged. Gains: specificity fix, live compact list, tokens in chart CSS, duplicate rules gone. Losses: a page-level descendant selector (`.lead-sub > span`) restyles the shared Chip (FINDING-001); "+k" still reaches into the lane above with no render test; the compact list is not compact for edge cases. |
| Mobile | 7.5 | Up from 7.0. The chart is readable on a phone again, which is the biggest single gain this round. Losses: the chip-turned-bar, Activity ~193px lower, refusal reasons absent from the phone list, mark 4 still split by the dashed line, "spent." orphan. |
| Consistency | 7.5 | Up from 7.0. `aria-label` and the list agree at every width; `DESIGN.md` documents the lead sizes; duplicate CSS gone. Losses: "one line per call on phones" is false in `DESIGN.md:21`, `DESIGN-CONTRACT.md` and the code comment; the Chip has two shapes; "mark n" and "Trade n" still name different calls. |
| Evidence / clarity | 8.0 | Up from 7.5. Every mark reconciles to a visible row at every width; contrast colors come from the rendered page. Losses: the non-text control cannot go red and missing selectors drop lines silently (FINDING-003); no render test for "+k"; phone readers must match refusal reasons by amount. |

## Findings by severity

### High

None.

### Medium

**FINDING-001: the phone rule for the metric row stretches the shared Chip into a full-width bar.** `styles.css:284` sets `.lead-sub > span { flex-basis: 100% }` under 640px to put each clause on its own line. `Chip` renders `<span className="chip chip-bad">` (`Chip.tsx:9`) as a direct child of `.lead-sub` (`Account.tsx:193`), so the chip takes the full row: a 322px red pill at `r14-390.png` y~360-385 and `r14-arb-390.png` y~382-405. Everywhere else on the page (strip, feed) the same component is a content-width pill. At this width it reads as an alert banner or a meter, and `.chip`'s `white-space: nowrap` plus a full-width wash makes "4 calls refused" look like a label floating in an empty bar. This is the component system breaking for the most important chip on the page. Fix: scope the rule to the clauses, `.lead-sub > span:not(.chip) { flex-basis: 100% }`, or give the two clauses a class. Verify at 390 on both chains that the chip's width equals its text plus 20px padding.

**FINDING-002: phone Activity is ~193px lower than r13, and the "one line per call" promise does not hold.** Same scan as r9-r13: heading at ~2,103px (r13 ~1,910, r12 ~2,061). The restored list is the right content, and I would not trade it back. The cost comes from three places: items 3 and 4 wrap their edge clause ("refused, 0.000001 over the cap" on its own line; "executed after owner approval, 0.000001 over the approval line" on two more), the zone key wraps to two lines, and the hero clauses now take one line each. `DESIGN.md:21` and `CapRuler.tsx:47` both say "one line per call on phones", which the render contradicts. Fix: on narrow, shorten `WORD` and the edge clause ("refused, +0.000001 past cap", "approved, +0.000001 past line"), and set `.attempts-compact li { flex-wrap: nowrap }` with the outcome text allowed to ellipsize only as a fallback. Put the zone key on one line by dropping "up to" (the ticks already give the numbers). Target: heading at or above ~2,000px, every list item one line at 390, and the contract sentence true.

**FINDING-003: the non-text contrast pass reads real colors, but its control still cannot fail it, and a missing element passes silently (r9 FINDING-002, r10-r13 FINDING-004/005).** `contrast.cjs:50-52` opens a fresh page for the non-text read and never calls `addStyleTag({ content: inject })`, so the forced-fail control (`argv[3]`) changes the text-node runs and leaves all five non-text lines unchanged. A control such as `:root{--warn-wash:rgba(227,179,65,.9)}` cannot turn "amber line on approval zone" red. `contrast-r14.txt` shows only a passing run; no control run is committed this round. Second: `waitForSelector(...).catch(() => {})` (`:52`) and `.filter(([, a]) => a)` (`:63`) mean that if the page renders without a refused mark, that line simply disappears and the run still prints "AA: pass"; `zone()` falls back to bare `--surface-1` when a zone rect is missing (`:61`), which flatters the ratio. Third: `.mk-more` and the mark numerals against their circle fills are still not in the non-text set, which is the case r13 named. Fix: apply `inject` to the non-text page; fail the run when any of the eight selectors returns null; add `.mk .mk-more` against its zone; commit both a passing run and a forced-fail run in which at least one non-text line prints FAIL.

**FINDING-004: on phones the reason for a refusal is only in Activity, and nothing on the page maps a mark to its feed row (residue of r13 FINDING-001).** `CapRuler.tsx:106` drops the reason under 560px; `DESIGN.md:21` says "the reason stays in Activity". The feed rows carry no mark number, and their only numbers ("Trade 1", "Trade 2", "Trade 3", `gateRows.ts:174`) name different calls: "Trade 1" is mark 2, "Trade 2" is mark 4, "Trade 3" is the Paxos trade with no mark. A phone reader asking "why was mark 1 refused" has to scan a newest-first feed for a 4.00 refused row past admissions, withdrawals and a `registerAgent()` refusal. Rule (2) asks for the why. Fix, in order of size: (a) keep the reason on narrow as a second line only for refused items (three short lines, ~60px, less than FINDING-002 saves), or (b) render the mark number as an `.an` disc on feed rows that spend the lead token and rename "Trade n" to "trade id n" in the mono sub line. (b) also fixes the two-numbering problem at 768 and 1440.

### Polish

- "+k" label at `(x + 12, lane - 6)` reaches ~4px into the lane above; move it to `y = lane + 4`, start-anchored at `x + 13`. Add the render test r12 and r13 asked for (executed 2.00, approved 2.000001, two refused at 4.00): assert one "+1", its computed fill is not `--canvas`, no two circles closer than 18px; set lanes to 13px apart once and confirm red.
- `currentAdmission`: add revoke-then-readmit; collapse the double call at `Account.tsx:161-162`.
- "spent." alone on its line at 390 (`r14-390.png` y~425). `text-wrap: pretty` on the clause, or shorten to "none spent".
- Hero label: 34ch still wraps a 52-character label at 1440. Use `max-width: none` above 1000px, or align the label to the numeral's bottom so line two does not hang.
- ~290px of empty right column at 1440 (RHC) and ~340px of empty left column under the Arbitrum feed.
- Boundary marks 3 and 4 still centered on the lines they crossed (since r8).
- "Asked for" includes the owner's own `approveTrade()`; mark 1 is that call.
- Mixed scope: "3" counts the Paxos USDG trade.
- Chart zones do not show the 5.00 daily cap that Policy shows.
- Arbitrum: a 64px "0" headlines an empty account.
- The verified trust link and the revoke line share one underline style.
- `DESIGN.md` and `DESIGN-CONTRACT.md` still duplicated; this round edited both by hand. Make one a pointer.
- r11 captures still hold the a140663 re-renders; `shots.cjs` has no write-once guard.
- `CapRuler.test.ts:13` default string sort on numbers; `spentToken` double `try`; contrast and overlap tools on Playwright instead of the Brave harness.

## AI slop read

Nothing new in the slop register. The round restored a data list, fixed a selector and moved literals to tokens. One big number with a full-sentence label, refusals counted per check, and a chart whose zones come from the contract's own branches are still the opposite of a template stat row. The phone chip-bar is a bug, not a slop tell, but a full-width tinted pill is close to the "progress ring filling space" family, so fix it before anyone reads it that way. Lime on near-black is still calibration look 2, held off by no glow, halo, gradient or grid, and by an accent that follows the network. Holds at B; not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES at every width (the phone chart now tells, not just shows); cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:305`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 figure and refused count in first viewport; +5 timestamped admission; -5 the refused chip renders as a full-width bar)
  Read the metric row   80 -> 85  (+5  each clause on its own line, no bullet dots)
  Tap Recheck           85 -> 95  (+10 verdict in place, per-row chips; carried from r10, not re-observed)
  Read the chart        95 -> 100 (+5  every mark has its amount and outcome directly underneath)
  Ask why mark 1 failed 100 -> 95 (-5  reason only in Activity, no mark number on feed rows)
  Find the trades       95 -> 90  (-5  Activity ~2,103px down, ~193px lower than r13)
  Read a refusal        90 -> 95  (+5  named by its custom error, amount in the sub line)
  FINAL: 95/100 healthy
```

Same final number as r13, with the drain moved from the chart (the page's core) to the feed and the hero chip (finish).

## What r14 got right

- It fixed the r13 High by restoring the list at every width, which fixes the `aria-label`, the zoom reflow case and the false hint in one change.
- It fixed the "+k" color with the specificity change r13 named, not by adding `!important`.
- It cleared six rounds of token and duplicate-rule debt in one pass: `--fs-48`, tokenized 12px numerals, one `.tnum`, one `.ledger-head`, a documented lead scale.
- The contrast tool now reads the rendered page for non-text colors instead of trusting hex constants.
- It did not overwrite the previous round's captures.

## Quick wins (under 30 minutes each)

1. FINDING-001: `.lead-sub > span:not(.chip) { flex-basis: 100% }`. One selector.
2. FINDING-003: `if (inject) await pg.addStyleTag({ content: inject })` on the non-text page, `process.exit(1)` on any null selector, add `.mk .mk-more`; commit a forced-fail run beside the pass run.
3. FINDING-002: shorter outcome and edge words under 560px, one-line zone key, then fix `DESIGN.md:21` and the `CapRuler.tsx:47` comment to match what renders.
4. FINDING-004(a): keep the refusal reason on narrow for refused items only.
5. Revoke-then-readmit `it`, collapse the double `currentAdmission`, numeric sort in `CapRuler.test.ts:13`.

Blind spot: no live browser run (by instruction). FINDING-001 is confirmed in the captures and traced to the selector in source; FINDING-003 is read from `contrast.cjs`, not re-run, so the claim that the control leaves the non-text lines unchanged is inferred from the missing `addStyleTag`, not observed. "+k" has still never been rendered. Sign-summary blocks, Owner controls, wallet-connected states, hover and focus rings and the recheck verdict were again not observed rendered. Phone positions come from a pixel scan of static captures. AA text figures are taken from `contrast-r14.txt`.

AXES: avg=7.81 min=6.5
