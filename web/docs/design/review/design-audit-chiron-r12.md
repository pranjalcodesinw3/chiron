# CHIRON agent-account page: design audit, round 12

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r12-1440.png`, `r12-390.png`, `r12-full-1440.png`, `r12-full-768.png`, `r12-full-390.png`, `r12-arb-1440.png`, `r12-arb-390.png`, `r12-arb-full-1440.png`, `r12-arb-full-768.png`, `r12-arb-full-390.png`. The original r11 captures come from git (`git show 811292f:web/docs/design/r11-full-390.png`), because commit `a140663` overwrote the r11 files in the tree (FINDING-004). Also read: `DESIGN.md` (still byte-identical to `docs/design/DESIGN-CONTRACT.md`), `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,CapRuler.test,Chip}.tsx`, `src/pages/Account.tsx`, `src/pages/account/{gateRows,gateRows.test}.ts`, `design-research/tools/overlap.cjs`, and commit `a140663` (`git show HEAD -- web/src`). I measured phone Activity heading positions the same way as in r9-r11: a pixel scan for bright heading text in x 16-110 of the full 390 capture. Chart and list positions come from 1:1 crops. Previous report: `design-audit-chiron-r11.md` (checked below).

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B

Verdict in one line: round 12 removes the r11 High. The hero now vouches only for the agent admitted right now, and on Arbitrum it says plainly "No agent admitted now; the last one was revoked 05 Oct 08:11 UTC". The metric row now reads as three separate statements, and "3 of them" connects the clause back to the "4 calls refused" chip. Chart marks no longer leave their amount, and a unit test covers that. The phone reaches Activity 172px sooner. What is left is mostly about whether the evidence can be trusted, not how it looks. The trust-link gate has no test and matches a display string. Marks in different lanes can still cover each other at the approval line. "+k" has never been rendered. The r11 captures were overwritten, and the contrast proof is still built from constants. Net: the first round since r9 that is cleaner and also more honest. B- to B.

## First impression

- The page communicates **"3 trades went through, 4 calls were refused, 3 of those asked for 15.000001 testUSDG and none of it was spent"**. At 1440 this reads as three statements with middle dots between them, ending in periods (`r12-1440.png` y~313).
- I notice **the Arbitrum hero no longer contradicts itself**. The muted line "No agent admitted now; the last one was revoked 05 Oct 08:11 UTC ↗" agrees with gate 1 "No agent", Policy "Agent key: none" and the first feed row (`r12-arb-1440.png` y~158, `r12-arb-full-1440.png`).
- First three things my eye goes to: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold 28px headline**. The red chip is still fourth, the same as r10 and r11.
- One word: **trustworthy**.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart, Activity, Policy, Owner controls, footer. Each one can be named in under 2 seconds. Trunk test: PASS.

## Round 11 findings, checked against round 12

| R11 finding | Status in r12 | Evidence |
|---|---|---|
| 001 trust link vouches for a revoked agent (High) | **Fixed on screen, guard untested** | `Account.tsx:160-164` shows the link only when the newest admission comes after the newest revoke and names `snap.agent`. Otherwise, when `snap.agent` is zero, it shows a neutral `.trust-off` line that links the revoke tx. Rendered correctly on both chains (`r12-1440.png` "verified on chain, 12 Oct 01:23 UTC"; `r12-arb-1440.png` and `r12-arb-390.png` "last one was revoked"). r11 asked for a test that fails against the old `find`. None was added: `gateRows.test.ts` has no admit or revoke case, and the logic lives inline in the component. See FINDING-002. |
| 002 metric row runs on, two counts (Medium) | **Fixed** | `Account.tsx:195-196`: "{n} of them asked for {sum} {symbol}, none of it spent." then "{left} left in today's cap." `styles.css:198` adds a middle dot between spans. At 1440 it reads as three statements. The count now refers back to the chip. Residue (polish): on phones the dots begin wrapped lines and read as bullets, and "spent." sits alone on a line (`r12-390.png` y~370-423). |
| 003 phone Activity moved down (Medium) | **Partly fixed** | The heading is at ~2,061px in r12 and ~2,233px in the original r11 capture: 172px sooner. The causes were addressed: `.attempts-compact` makes one-line items and drops the reason under 560px, and the SVG is 30px shorter when `narrow` (`CapRuler.tsx:70`, `:100-106`). The r11 target (~1,900px, r9 level) is still missed by ~160px. See FINDING-003. |
| 004 packing moves marks along the amount axis (Medium) | **Fixed** | `groupMarks` (`CapRuler.tsx:117-129`) never changes x. Same-lane calls within 18px collapse into one mark with a "+k" count. `CapRuler.test.ts` asserts true x and the count. Mutation check by reading: putting the r11 push back (`x = prev + 18`) makes the first `toEqual([100, 300, 300])` fail, so the test can fail. New residue: lanes are 13px apart while marks are 18px across, and "+k" has never been rendered. See FINDING-001. |
| 005 non-text contrast lines are constants (Medium) | **Not fixed (fourth round)** | No `contrast-r11.txt` or `contrast-r12.txt` exists. `contrast-r10.txt` is the last run. New text since then (`.mk-more`, `.trust-off`, the separator) has not been measured. See FINDING-005. |
| Polish: boundary marks on threshold lines | **Not fixed (since r8)** | Mark 4 sits on the amber dashed line and mark 3 on the red cap line (`r12-full-1440.png` crop x~222, x~875). At 390, mark 4 is split by the dashed line. |
| Polish: hero label wrap, empty right column, headline weight | **Not fixed** | ~290px of empty column under the recheck hint at 1440. The 22ch label still wraps with ~500px free. |
| Polish: mixed scope ("3" counts Paxos USDG) | **Not fixed** | The feed row "Trade 3 · 1.00 Paxos USDG into 0.00391 TSLA" is counted in the testUSDG-framed hero. The chart shows 2 testUSDG trades (marks 2 and 4). |
| Polish: Arbitrum "0" headline | **Not fixed** | 64px "0" over an empty account (`r12-arb-1440.png`). |
| Polish: `.lead-value` 48px literal, 12px numerals, scale in `DESIGN.md` | **Not fixed** | `styles.css:283` `48px`; `:184`, `:200` `12px`; `DESIGN.md:8` still says 12/13/14/16/20/28/44. |
| Polish: `.tnum` twice, `.ledger-head` split | **Not fixed (fifth round)** | `styles.css:20-21`; `.ledger-head` at `:221`, `:295`, `:300`. |
| Polish: `DESIGN.md` and `DESIGN-CONTRACT.md` duplicated | **Not fixed, and now it costs** | r12 had to make the same chart edit twice (`git show HEAD -- web/DESIGN.md web/docs/design/DESIGN-CONTRACT.md`). `cmp` reports identical. |
| Polish: `spentToken` double `try`, marks not linked to feed rows, trust link plain underline, Arbitrum empty column, `overlap.cjs` on Playwright | **Not fixed** | Unchanged in source and captures. |

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | The 64px mono figure leads on both chains at every width (`r12-1440.png`, `r12-390.png` y~265). | "3" mixes tokens. On Arbitrum an empty state is still a headline number. |
| (2) Every number states what it means | "4 calls refused", "3 of them asked for 15.000001 testUSDG, none of it spent", "5.00 testUSDG left in today's cap", refusals per check, a numbered list with outcome and distance past the line. | "Asked for" still includes the owner's own `approveTrade()` (4.00, "proposal already settled"), which is not an agent asking for anything. |
| (3) Semantic colors plus one accent | Four tones plus the network accent. The new `.trust-off` is muted ink, not a status tone, which is the right call. | The non-text contrast proof still cannot fail (FINDING-005). |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks, unchanged since r10. | Still not observed rendered: Owner controls are collapsed in every capture, and no capture has a wallet connected. |
| (5) Trust signals | Network badge with chain id, a timestamped admission link that now tracks the current agent, a neutral revoke line, a block stamp, an explorer link and UTC time on each row. | The gate behind the strongest claim on the page has no test and matches on a formatted title (FINDING-002). |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.5 | Up from 8.0. The metric row no longer runs on. The figure leads, the chip and its clauses follow, then the cap. Unchanged losses: the 28px bold mechanism headline is the third-heaviest object; ~290px of empty right column at 1440; the 22ch label wraps with room to spare. |
| Typography | 8.0 | Unchanged. The periods and separators are right. Losses: the 48px phone literal and two 12px literals; the `DESIGN.md` scale omits 48 and 64; on phones the dots begin lines and "spent." is a one-word line. |
| Color | 8.5 | Unchanged. A strict four-tone system plus the network accent, and the revoke line correctly stays neutral. Lime on near-black is still the predictable crypto look, saved by having no glow or gradient. |
| Density | 6.5 | Up from 6.0. Phone Activity is at ~2,061px (r11 original ~2,233). The attempt list is one line per item, and the SVG is 30px shorter. Still ~160px later than r9. Arbitrum at 1440 still has ~330px of empty column under a three-row feed, and its empty chart takes ~270px. |
| Components | 8.0 | Up from 7.5. `groupMarks` keeps x true and has a test that can fail. Losses: lane spacing (13px) is smaller than a mark (18px), so marks in different lanes at one amount cover each other (FINDING-001); "+k" has no rendered evidence; the compact list drops the reason with no link from mark to feed row; `.tnum` and `.ledger-head` are still duplicated. |
| Mobile | 7.5 | Up from 7.0. Metric, chip and recheck are in the first 390x844 viewport, there is no horizontal scroll, the list is compact and Activity is higher. Losses: bullet-like dots on the metric row; marks 4 and 5 still nearly touch, with mark 4 split by the dashed line. |
| Consistency | 7.5 | Unchanged. `DESIGN.md` now describes the real mark behavior, but the same edit had to be made in two identical files. The type scale in the contract still does not match `tokens.css`. The duplicated CSS rules survive a fifth round. |
| Evidence / clarity | 7.5 | Up from 7.0. No trust signal on the page contradicts itself any more, and the 4-vs-3 gap is bridged. Losses: the trust gate is untested and matches a display string (FINDING-002); the r11 baseline captures were overwritten (FINDING-004); no contrast run since r10 (FINDING-005); `overlap.cjs` "0 overlaps" runs on data with no "+k" and no cross-lane collision. |

## Findings by severity

### High

None this round.

### Medium

**FINDING-001: marks in different lanes still cover each other, and "+k" has never been rendered.** `CapRuler.tsx:13` puts the lanes at 14, 27 and 40, so they are 13px apart, and each mark has `r="9"` (18px across). `groupMarks` only resolves collisions inside one lane. An executed call at exactly 2.00 (the largest amount that runs without the owner, which an agent maxing its allowance will send) lands at the same x as an owner-approved call at 2.000001, 13px below it, and the two circles overlap by 5px. An approved call and a refused call at one amount overlap the same way. The "+k" label sits at `(x + 12, lane - 6)`, which is in the next lane up, where it can sit on a mark there. `DESIGN.md:21` now says "no mark covers another", which only holds within a lane. No capture contains a "+k" or a cross-lane collision, and `overlap.cjs` runs only on live data, so neither case has ever been checked. Fix: make lane spacing at least 20px (for example 12 / 32 / 52, with `TRACK_H` to match), or draw the "+k" inside the mark's lane to the right. Add one render case to the test with executed 2.00, approved 2.000001 and two refused at 4.00, and assert that no two circles are closer than 18px. Break it once (put the spacing back to 13) and confirm it goes red.

**FINDING-002: the trust-link gate has no test and matches a formatted title.** `Account.tsx:162` decides the most-read trust claim on the page with `lastAdmit.title.includes(short(snap.agent))`. That is a substring match on a display string built at `gateRows.ts:197`. Change `short()` (for example to a 4+4 form) or the wording of the title, and every admitted agent silently loses its link. That failure gives no signal, because the page just looks like it has no claim. The newer-than-revoke ordering depends on `activity` being newest first, and nothing asserts that. r11 asked for an admit-then-revoke test that fails against the old `find`. None was added, and the logic is inline in the component, where `gateRows.test.ts` cannot reach it. Fix: carry `agent` as a field on ADMITTED and REVOKED rows. Move the decision into a pure `currentAdmission(rows, agent)` in `gateRows.ts`, and test admit, admit-then-revoke, revoke-then-readmit, and an admission for a different agent. Confirm the revoke case fails against `activity.find((r) => r.tag === 'ADMITTED')`.

**FINDING-003: phone Activity is still ~160px later than r9.** The heading is at ~2,061px (r9 ~1,898, r10 ~2,166, r11 ~2,233). The r12 changes moved it in the right direction. What remains: the attempt list still repeats what the feed holds (five lines at 390, `r12-full-390.png` crop y~1,780-2,000), and the zone key adds two lines under the chart. Fix: on phones, fold the zone key into the axis tick labels ("2 · owner approves", "10 · cap"), or drop the key's third line, since red "cap 10.00" already says it. Put the mark number on its feed row so the list can collapse behind a "5 attempts" disclosure. Target: Activity at or above ~1,900px.

**FINDING-004: the r12 commit overwrote the r11 evidence.** `a140663` rewrote all ten `docs/design/r11-*.png` files with new renders (for example `r11-full-390.png` 451,832 to 441,281 bytes, height 5,186 to 5,014px). In the tree, `r11-full-390.png` now differs from `r12-full-390.png` only inside x 105-317, y 691-1,033. Every pixel claim in `design-audit-chiron-r11.md` (Activity at ~2,238px, the run-on metric row, the Arbitrum trust link) now points at files that no longer show it. The point of numbered rounds is that each one is a frozen baseline. Fix: restore the r11 files from `811292f` and treat capture files as write-once (have the capture script refuse to overwrite an existing `rN-*` file).

**FINDING-005: non-text contrast lines are constants, and there has been no contrast run since r10 (r9 FINDING-002, r10 FINDING-005, r11 FINDING-005).** `contrast.cjs:45-50` still composites hard-coded `#3ec6a8`, `#e3b341`, `#f2555a` at 0.12 alpha. Since r10 the page has gained `.mk-more` (12px muted mono on a zone wash, where an approved mark's "+k" lands on the amber zone), `.trust-off`, and the separator. None of them has been measured. Fix: read the computed fill and stroke of `.mk-*`, `.mk-more`, `.l-warn`, `.l-bad` and the `.z-*` rect under each in the page loop. Add a control that forces `--warn-wash` to 0.9 alpha and confirm a line turns red. Commit `contrast-r12.txt`.

### Polish

- On phones the metric row's middle dots begin wrapped lines and read as list bullets, and "spent." sits alone on its own line (`r12-390.png` y~370-423). Under 560px, drop the `::before` dot and let each clause be its own line, or keep the dot only when items share a line.
- "Asked for" adds the owner's own `approveTrade()` (4.00, "proposal already settled") to what the agent asked for. Scope it to agent calls, or say "3 of them named 15.000001 testUSDG".
- Boundary marks 3 and 4 are still centered on the lines they crossed (since r8).
- Hero: the 22ch label wraps with ~500px free; the bold 28px mechanism headline outweighs the refused chip; ~290px of empty right column at 1440.
- Mixed scope: "3" counts the Paxos USDG trade; its neighbors and the chart are testUSDG.
- Arbitrum: a 64px "0" headlines an empty account. ~330px of empty column under a three-row feed at 1440.
- The verified trust link and the revoke line share one underline style. Give the verified state an ok-toned glyph so the two are told apart by more than ink weight. On 390 the revoke line wraps with "08:11 UTC ↗" alone on the second line.
- Chart marks do not link to feed rows. On phones the compact list now drops the reason, so the mark number is the only bridge to the feed, and the feed does not show it.
- `.lead-value` 48px literal (`styles.css:283`), 12px numeral literals (`:184`, `:200`); `DESIGN.md:8,24` scale omits 48 and 64.
- `.tnum` declared twice (`styles.css:20-21`); `.ledger-head` has two rules in one media block (`:295`, `:300`).
- `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` are identical; make one a pointer.
- `gateRows.ts:121` `spentToken` wraps an already-catching `spentBy` in a second `try`.
- `CapRuler.test.ts:13` sorts numbers with the default string sort. It passes for 100/300/300 only because they have the same number of digits. Use `.sort((a, b) => a - b)`.
- `overlap.cjs` drives Playwright's headless Chromium; the standing rule for this machine is the Brave harness.

## AI slop read

The slop register has nothing new. The changes are a guard, copy, a separator and a grouping function. One big number with a full-sentence label, with the refused count and its consequence beside it, is still the opposite of the decorative three-stat row. The neutral revoke line is a good sign: the page said less rather than dress up the absence of an agent. The chart's geometry still comes from the contract's own branches. Lime on near-black is still calibration look 2, saved by having no glow, halo, gradient or grid, and by an accent that follows the network. It holds at B. It is not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES; cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 85  (+10 figure and refused count in first viewport; +5 timestamped admission for the live agent)
  Read the metric row   85 -> 90  (+5  "3 of them ... none of it spent" answers the chip; dots read as bullets, no cost)
  Tap Recheck           90 -> 100 (+10 verdict in place, per-row chips; carried from r10 capture, not re-observed)
  Read the chart        100 -> 100 ( 0 five marks, five one-line items)
  Find the trades       100 -> 95 (-5  Activity ~2,061px down; better than r11, still behind r9)
  Read a refusal        95 -> 100 (+5  named by its custom error, counted under its check)
  FINAL: 100/100 healthy (capped)
```

On Arbitrum, landing is now +5 instead of -10. The hero, gate 1, Policy and the feed tell the same story about the revoked agent.

## What r12 got right

- It fixed the r11 High where it starts. The claim is now tied to `snap.agent` and to ordering against the latest revoke, and the absent case gets an honest, linked sentence instead of nothing.
- "3 of them asked for ..., none of it spent." is the brief's "every number states what it means" in one clause, tied to the chip beside it.
- `groupMarks` replaced a fix that lied about amounts with one that keeps x true. Its test can fail; I checked that by putting the r11 push back mentally against the assertions.
- Phone density moved the right way for the first time since r9: compact list, shorter SVG, 172px reclaimed.
- `DESIGN.md` was corrected in the same commit as the behavior, so the contract describes the code.

## Quick wins (under 30 minutes each)

1. FINDING-001: lane spacing 13 to 20px, and a render test with executed 2.00 next to approved 2.000001.
2. FINDING-002: an `agent` field on ADMITTED and REVOKED rows, `currentAdmission()` in `gateRows.ts`, and four tests.
3. FINDING-004: `git checkout 811292f -- web/docs/design/r11-*.png`, and a no-overwrite guard in the capture script.
4. Phone metric row: no leading dot under 560px.
5. Delete the duplicate `.tnum` and `.ledger-head` rules; add 48 and 64 to `DESIGN.md:8`; make `DESIGN-CONTRACT.md` a pointer.

Blind spot: no live browser run (by instruction). The "+k" mark, cross-lane collisions, sign-summary blocks, Owner controls, wallet-connected states, hover and focus rings and the recheck verdict were not observed rendered this round. FINDING-001 and FINDING-002 are read from code and geometry, not seen in a render. Phone positions come from a pixel scan of static captures, not DevTools. AA is assumed from the r10 run.

AXES: avg=7.75 min=6.5
