# CHIRON agent-account page: design audit, round 11

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r11-1440.png`, `r11-390.png`, `r11-full-1440.png`, `r11-full-768.png`, `r11-full-390.png`, `r11-arb-1440.png`, `r11-arb-390.png`, `r11-arb-full-1440.png`, `r11-arb-full-768.png`, `r11-arb-full-390.png`; `r10-full-390.png` for the phone delta; `DESIGN.md` (still byte-identical to `docs/design/DESIGN-CONTRACT.md`), `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,Chip}.tsx`, `src/pages/Account.tsx`, `src/pages/account/gateRows.ts`; `design-research/tools/{contrast,overlap}.cjs`; commit `811292f` (`git show 811292f -- web/src`). The phone position of the Activity heading comes from 1:1 crops of the r10 and r11 full 390 captures over the same y band (1,800-2,800). Previous report: `design-audit-chiron-r10.md` (checked below).

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B-
AI Slop Score: B

Verdict in one line: round 11 closes four of the six r10 Mediums. The blocked chip pluralizes ("1 call refused"). The spend figure now says what it is ("15.000001 testUSDG asked for across 3 refused calls, none of it spent"). One noun, refused, runs through hero, strip, chart and feed. The attempt list sits on a clean two-column grid. Same-lane marks are packed, and the `--fs-13`/`--fs-64` tokens and the `styles.css` comment are fixed. It also leaves a false trust signal on Arbitrum: the hero says "Agent TDX quote verified on chain, 05 Oct 08:11 UTC" while gate 1 says "No agent" and the feed shows that agent revoked. The phone pushes Activity down another ~72px, and the new packing moves marks along the amount axis, which only data with no collisions has ever tested. Net: cleaner finish, one new High, same grade.

## First impression

- The page communicates **"3 trades went through, 4 calls were refused, nothing refused was spent"**. On RHC that is the brief's sentence, and it reads in the first viewport at both widths.
- I notice **the metric row is now one run-on line at 1440**: `4 calls refused` chip, then "15.000001 testUSDG asked for across 3 refused calls, none of it spent", then 8px of gap, then "5.00 testUSDG left in today's cap" (`r11-1440.png` y~313). With the r10 semicolon gone and nothing in its place, it reads as "none of it spent 5.00 testUSDG left". The chip says 4 and the clause beside it says 3, and nothing tells the reader which call is the odd one.
- First three things my eye goes to: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold 28px headline**. The red chip is still fourth. Unchanged from r10.
- One word: **tidier**.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart, Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS.

## Round 10 findings, checked against round 11

| R10 finding | Status in r11 | Evidence |
|---|---|---|
| 001 "1 calls blocked" (Medium) | **Fixed** | `Account.tsx:184` branches on `length === 1`; `r11-arb-390.png` y~341 and `r11-arb-full-1440.png` y~313 read "1 call refused". |
| 002 "stopped" figure overstates (Medium) | **Fixed in wording, residue moved to FINDING-002** | `Account.tsx:185` now reads "{sum} {symbol} asked for across {n} refused calls, none of it spent". That is true as written. It still adds up the owner's `approveTrade()` (4.00) and would grow with retries, but it no longer claims to measure trades stopped. "Refused" is now the only noun on the page. The semicolon is gone. What is left: the 4-vs-3 mismatch and the run-on with the next clause. |
| 003 ragged attempt list (Medium) | **Fixed** | `styles.css:191-195`: `.attempts { align-items: start }`, each `li` is a `20px 1fr` grid with the badge spanning three rows. In `r11-full-1440.png`, items 1-3 are top-aligned and amount, outcome and reason share one left edge. The cost is on phones (FINDING-003). |
| 004 same-outcome marks cover each other (Medium) | **Fixed for overlap, new encoding defect** | `CapRuler.tsx:46-50` sorts each lane by x and pushes any mark within 18px of its neighbor 18px right. Marks no longer cover each other, but x no longer means amount for the pushed mark. There is no unit test, and the current data never triggers it. See FINDING-004. |
| 005 non-text contrast lines are constants (Medium) | **Not fixed (third round)** | `contrast.cjs:49` still builds the five 1.4.11 pairs from hard-coded hex. No `contrast-r11.txt` exists, so AA was not re-measured after the r11 changes. See FINDING-005. |
| 006 phone Activity ~266px later than r9 (Medium) | **Worse** | Same y band in both captures: r10 heading ~2,166px, r11 ~2,238px (+72px). Cumulative since r9 (~1,898px): +340px. See FINDING-003. |
| Polish: `styles.css:211` "policy first on phones" | **Fixed** | Now `styles.css:213` "Activity before Policy on phones". |
| Polish: `--fs-13` and 64px literals | **Fixed, two new literals** | `tokens.css:28` adds `--fs-13` and `--fs-64`, used at `styles.css:175,179,182,207`. New: `.lead-value { font-size: 48px }` on phones (`:279`). Mark numerals stay `12px` literals (`:184`, `:196`). `DESIGN.md:8` and `:24` still list the scale as 12-44 and omit 48 and 64. |
| Polish: `DESIGN.md:21` false "never cover" claim | **True for overlap, misleading for meaning** | Now backed by packing code. It does not mention that packed marks leave their amount. |
| Polish: `.tnum` twice, `.ledger-head` split | **Not fixed** | `styles.css:20-21`; `.ledger-head` at `:217`, `:291`, `:296` (the last two in one media block). |
| Polish: `DESIGN.md` and `DESIGN-CONTRACT.md` duplicated | **Not fixed** | `cmp` reports identical. |
| Polish: `spentToken` double `try` | **Not fixed** | `gateRows.ts:121` wraps `spentBy`, which already catches at `:109`. |
| Polish: boundary marks on threshold lines | **Not fixed (since r8)** | Mark 4 is centered on the amber dashed line and mark 3 on the red cap line (`r11-full-1440.png` x~350 and x~1,003 at 1:1; `r11-full-390.png` crop x~98, x~268). |
| Polish: hero label wrap, empty right column, headline weight, mixed scope, trust-link styling, marks not linked to rows, Arbitrum empty column | **Not fixed** | All visible unchanged in `r11-1440.png` and `r11-arb-full-1440.png`. |

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | The 64px mono figure leads on both chains and both widths (`r11-390.png` y~265). | "3" is `snap.tradeCount` over all tokens (it includes "Trade 3", the Paxos USDG buy). The chart beside it shows 2 executed testUSDG marks. On Arbitrum the lead is a 64px "0": an empty state rendered as a headline number. |
| (2) Every number states what it means | Refused count, "asked for ... none of it spent", cap left today, refusals per check, a numbered list with outcome, distance past the line and reason. | "4 calls refused" beside "across 3 refused calls": two denominators next to each other with no bridge (FINDING-002). |
| (3) Semantic colors plus one accent | Four tones plus the network accent, true in tokens, `Chip.tsx`, chart and feed. | The non-text contrast evidence is still constant (FINDING-005). |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks, unchanged since r10 (`Account.tsx:45`, `OwnerActions.tsx`). | Still not observed rendered: Owner controls are collapsed in every capture and there is no wallet-connected capture. |
| (5) Trust signals | Network badge with chain id, timestamped admission link, block stamp with network dot, explorer link and UTC time per row. | On Arbitrum the admission link vouches for an agent the owner has revoked (FINDING-001). The strongest claim on the page is still styled as a 14px underline. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | The figure still leads and the refused chip is beside it. Unchanged losses: the 28px bold mechanism headline is the third-heaviest object; ~290px of empty right column under the recheck hint at 1440 (`r11-1440.png` y~272-563); the 22ch cap wraps the lead label with ~500px free. New: the metric row's clauses run together at 1440. |
| Typography | 8.0 | Up from 7.5. The attempt list has one left edge per item, the dangling semicolon is gone, and 13 and 64 are tokens. Losses: a 48px phone literal and two 12px literals; `DESIGN.md` scale omits 48 and 64; the lead label still hangs ~30px below the numeral's baseline. |
| Color | 8.5 | Unchanged. A strict four-tone system plus one network accent; the owner-approved trade is mint everywhere. The non-text contrast lines still cannot fail. Lime on near-black stays the predictable crypto look, rescued by no glow or gradient. |
| Density | 6.0 | Down from 6.5. Phone Activity heading at ~2,238px (r9 ~1,898, r10 ~2,166). Every attempt item now takes 2-3 lines at 390 because outcome moved to its own grid row (`r11-full-390.png` crop: five items span ~360px). The chart keeps a fixed 150px SVG with ~45px dead under the ticks once zone labels leave. Arbitrum 1440 still has ~300px of empty column under a three-row feed. The Arbitrum chart spends ~270px to say no attempt exists. |
| Components | 7.5 | Up from 7.0. The chip pluralizes, the attempt list grid is right, and marks no longer collide. Losses: packing moves marks along the amount axis with no test (FINDING-004); marks still do not link to feed rows; `.tnum` and `.ledger-head` still duplicated; `spentToken` dead `try`. |
| Mobile | 7.0 | Down from 7.5. The metric, chip and recheck button still sit in the first 390x844 viewport, with no horizontal scroll. Losses: Activity is later again; the metric row is a chip, a two-line clause and a third line (`r11-390.png` y~330-425); marks 4 and 5 touch at 390 (centers ~20px apart, r=9) with mark 4 split by the dashed line. |
| Consistency | 7.5 | Up from 7.0. One noun (refused) across hero, strip, chart and feed; the comment and tokens are fixed. Losses: two identical contract files; the type scale in `DESIGN.md` no longer matches `tokens.css`; duplicated CSS rules survive a fourth round. |
| Evidence / clarity | 7.0 | Down from 7.5. The spend figure is now honest, and the four refusal counts still reconcile (1+1+1 in the strip plus "1 more refused after the checks"). Losses: a timestamped "verified" link for a revoked agent on Arbitrum (FINDING-001); 4 vs 3 beside each other; non-text contrast constants; the new `overlap.cjs` "0 overlaps" result runs on data with no same-lane collision and shows no forced-red control, so it cannot speak for the packing it was written to back. |

## Findings by severity

### High

**FINDING-001: the hero's trust link vouches for a revoked agent.** `Account.tsx:159` sets `admitted = activity?.find((r) => r.tag === 'ADMITTED')`, the newest admission ever, with no check against `snap.agent` or a later `AgentRevoked`. On Arbitrum (`r11-arb-full-1440.png`, `r11-arb-390.png`) the first line of the hero reads "Agent TDX quote verified on chain, 05 Oct 08:11 UTC ↗". Below it, gate 1 says "No agent: no key can trade until one is admitted", Policy says "Agent key: none", and the first feed row is "Agent 0x79A5...6B79 revoked" at 05 Oct 08:11. The page's product claim is that only a currently attested key can trade. A trust signal that outlives its revocation is exactly what that claim is supposed to rule out, and it sits in the most-read line of the page. RHC renders correctly only because its latest agent is still admitted. Fix: render the link only when `snap.agent !== ZERO_ADDR` and the admission row's agent equals `snap.agent`. Otherwise show a neutral line ("No agent admitted; last one revoked 05 Oct 08:11 UTC ↗" linking the revoke tx). Add a `gateRows`-level test with an admit-then-revoke log, and confirm it fails against the current `find`.

### Medium

**FINDING-002: the metric row runs on and carries two counts.** `Account.tsx:183-186` puts three items in a flex row with an 8px gap and no separator. At 1440 they render as one line: "4 calls refused | 15.000001 testUSDG asked for across 3 refused calls, none of it spent 5.00 testUSDG left in today's cap" (`r11-1440.png` y~313). The eye cannot tell where the spend clause ends and the cap clause begins. The chip says 4 and the clause says 3. The fourth (`registerAgent()`, no amount) is never named here, so a reader has to work out that the clause is scoped to calls with a testUSDG amount. Fix: end the spend clause with a period or put a middle dot between items (`.lead-sub > span + span::before { content: '·' }`), and either name the scope ("3 of them asked for 15.000001 testUSDG; none was spent") or drop the count from the clause, since the chip already gives it.

**FINDING-003: on a phone, Activity has moved down for the second round running.** The heading sits at ~2,238px in r11, ~2,166px in r10 and ~1,898px in r9: +340px in two rounds. The r11 cause is the attempt-list grid. At 390 each item now stacks amount, outcome and reason on separate rows (`r11-full-390.png`, crop 1,800-2,370), where r10 kept short outcomes inline. The r10 causes are untouched: the list repeats what the feed holds, and the 150px SVG keeps ~45px dead after zone labels move to the key (`CapRuler.tsx:9`, `:93-96`). Fix: under 560px, render each attempt as one line (badge, amount, outcome word); the reason is already in the feed. Shrink `H` by the zone-label band when `narrow`. Put the mark number on its feed row so the mapping survives. Target: Activity at or above ~1,900px.

**FINDING-004: packing moves marks along the amount axis.** `CapRuler.tsx:47-50` resolves a collision by setting `inLane[i].x = inLane[i - 1].x + 18`. In this chart x is the amount, so a pushed mark is drawn at a value it never asked for. Five refused retries of one 10.000001 trade become a 72px train that reads as five rising amounts. A pushed executed mark at the approval line lands inside "owner approves". A cluster near the right end paints past `W - PAD` (the SVG is `overflow: visible`). None of this has been seen: the RHC data has no two same-lane marks within 18px, Arbitrum has no marks, there is no `CapRuler` test, and `overlap.cjs` shows no forced-red run. Fix: keep x fixed and resolve within the lane on y (offset alternate marks ±7px, or add a "×5" count badge to one mark). Add a test with two identical refused rows asserting equal `cx` and distinct `cy` (or one mark with a count). Break it once to see it go red.

**FINDING-005: non-text contrast lines are constants (r9 FINDING-002, r10 FINDING-005, untouched).** `contrast.cjs:45-50` composites hard-coded `#3ec6a8`, `#e3b341`, `#f2555a` at 0.12 alpha. Changing `--bad` or `--warn-wash` in `tokens.css` cannot move these numbers, and no control run reaches them. No `contrast-r11.txt` was produced, so the r11 text changes were not re-measured either. Fix: read the computed fill and stroke of `.mk-*`, `.l-warn`, `.l-bad` and the `.z-*` rect under each in the page loop. Add a control that forces `--warn-wash` to 0.9 alpha and confirm one non-text line turns red.

### Polish

- Boundary marks 3 and 4 still centered on the lines they crossed (carried since r8); at 390 mark 4 is split by the dashed line and touches mark 5.
- Hero: the lead label wraps at 22ch with ~500px free; the bold 28px mechanism headline outweighs the refused chip; ~290px of empty right column at 1440.
- Mixed scope: "3" counts all tokens (Trade 3 is Paxos USDG), and its neighbors and chart are testUSDG.
- Arbitrum lead: a 64px "0" headlines an empty account. "No trade yet" at the label weight, with the refused chip beside it, says the same with less shout.
- Trust link styled as a plain 14px underline; once FINDING-001 is fixed, give the verified state an ok-toned glyph.
- Chart marks do not link to feed rows; feed rows carry no mark number.
- `.lead-value` 48px phone literal (`styles.css:279`), 12px numeral literals (`:184`, `:196`); `DESIGN.md:8,24` scale omits 48 and 64.
- `.tnum` declared twice (`styles.css:20-21`); `.ledger-head` has two rules in one media block (`:291`, `:296`).
- `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` identical; make one a pointer.
- `gateRows.ts:121` `spentToken` wraps an already-catching `spentBy` in a second `try`.
- Arbitrum 1440: ~300px empty left column under a three-row feed (since r6).
- `overlap.cjs` drives Playwright's headless Chromium; the standing rule for this machine is the Brave harness.

## AI slop read

Nothing new in the slop register this round. The changes are copy, alignment and a CSS grid. One big number with a full-sentence label and its risk counterpart beside it is still the opposite of the decorative stat row. The chart's geometry comes from the contract's branches. Lime on near-black stays calibration look 2, rescued by no glow, halo, gradient or grid, and by the accent following the network. Holds at B; not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES; cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:301`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 85  (+10 figure and refused count in first viewport; +5 timestamped admission)
  Read the metric row   85 -> 85  ( 0  "none of it spent" is honest; 4 vs 3 costs a second read)
  Tap Recheck           85 -> 95  (+10 verdict in place, per-row chips; carried from r10 capture)
  Read the chart        95 -> 95  ( 0  five marks, five aligned items)
  Find the trades       95 -> 85  (-10 Activity ~2,238px down, list repeats the feed)
  Read a refusal        85 -> 90  (+5  named by its custom error, counted under its check)
  FINAL: 90/100 healthy
```

On Arbitrum: landing is -10, not +5. The verified-admission link contradicts "No agent" two blocks below, and a trust page that contradicts itself spends the reservoir it exists to fill.

## What r11 got right

- It took four of six r10 Mediums at their root: the pluralization, the honest spend label, the list grid and a single noun.
- "None of it spent" is the consequence the brief asked every number to state, in four words.
- The attempt list is now a real two-column grid; badge, amount, outcome and reason read as one unit at 1440 and 768.
- Tokens caught up with the code (`--fs-13`, `--fs-64`) and the stale phone-order comment is gone.
- The 768 capture is new evidence and holds up: hero stacks cleanly, gates go 2x2 without the rail, the list goes to two columns, no overlap.

## Quick wins (under 30 minutes each)

1. FINDING-001: gate the trust link on `snap.agent === admitted agent`; neutral "last one revoked" line otherwise.
2. FINDING-002: a separator between metric-row items and drop the "across 3" count.
3. FINDING-004: resolve lane collisions on y, not x; one test with two identical refused rows.
4. FINDING-003 (part): one-line attempt items and a shorter SVG under 560px.
5. Delete the duplicate `.tnum` and `.ledger-head` rules; add 48 and 64 to `DESIGN.md:8`.

Blind spot: no live browser run (by instruction). Sign-summary blocks, Owner controls, wallet-connected states, hover and focus rings, the tx toast and the recheck verdict were not observed rendered this round (no r11 recheck capture). Positions come from static captures and 1:1 crops, not DevTools. No r11 contrast run exists, so AA is assumed from r10. FINDING-004's failure cases are read from code, not seen in a render, because no capture has same-lane collisions.

AXES: avg=7.4 min=6.0
