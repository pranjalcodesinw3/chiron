# CHIRON agent-account page: design audit, round 10

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r10-1440.png`, `r10-390.png`, `r10-full-1440.png`, `r10-full-390.png`, `r10-arb-full-1440.png`, `r10-arb-390.png`, `r10-recheck-390.png`, `before-1440.png`; the BACKED v3 reference direction (`backed/web/docs/design/r39-1440.png`, `r39-390.png`, as described in the brief and the r8/r9 reports); `docs/design/contrast-r10.txt` and `design-research/tools/contrast.cjs`; `DESIGN.md` (byte-identical to `docs/design/DESIGN-CONTRACT.md`), `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,Chip}.tsx`, `src/pages/Account.tsx`, and the working-tree diff of `src/pages/account/{gateRows,OwnerActions}.ts(x)`. Chart and list positions were read from 1:1 crops of the full captures. Phone positions of the Activity heading were measured the same way in r9 and r10 (a pixel scan for bright heading text in x 16-110), so the delta is like for like. Previous reports: `design-audit-chiron-r8.md` (checked below), `design-audit-chiron-r9.md`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B-
AI Slop Score: B

Verdict in one line: round 10 delivers the Web3-grade structure the brief asked for. A 64px primary metric ("3 trades the agent executed inside the owner's caps") now leads the sheet with blocked calls and cap left beside it, which is Aave's risk-beside-the-headline pattern. A trust row carries the network badge with chain id and the timestamped TDX admission link. Every signing form has a styled "What you sign" summary. Violet is gone, so the page is semantic tones plus one network accent. But the round shipped new copy defects on the primary metric row ("1 calls blocked" on Arbitrum, a dangling semicolon, a "stopped" figure that adds up retries and counts an owner call as a trade). Three r9 Mediums (ragged attempt list, same-lane collisions, constant non-text contrast) were left untouched. And the phone now reaches Activity ~265px later than r9. Net: better structure, worse finish. Score drops from B to B-.

## First impression

- The page communicates **"this agent made 3 trades, 4 calls were stopped, here is the proof"**. The number now speaks before the sentence does.
- I notice **the hero has six text tiers before the action**: trust row, 64px figure, blocked row, 28px bold headline, a three-line lede, the account/block row (`r10-1440.png`, y~145-530). The figure wins, but the bold headline under it is the second-heaviest object on the page and says something different (how checks work, not what happened).
- First three things my eye goes to: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold headline**. The red "4 calls blocked" chip is fourth. For a page whose job is "what it traded, what it was blocked from", the chip should be second, ahead of the headline.
- One word: **louder**.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart, Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS.

## Round 8 findings, checked against round 10

| R8 finding | Status in r10 | Evidence |
|---|---|---|
| 001 chart hides a refused call under an executed one (High) | **Fixed for this data, still latent** | Outcome lanes (`CapRuler.tsx:13`): marks 2 (executed 1.00) and 5 (refused 1.00) stack at x~140 in the 1440 crop. Two same-outcome calls at one amount still share a pixel (`:39-45`, no packing). See FINDING-004. |
| 002 boundary trades sit on their threshold lines (Medium) | **Half fixed, unchanged since r9** | The list states "0.000001 over the approval line / cap" (`:47-52`). Marks 4 and 3 are still centered on the dashed amber line and the red cap line (1440 crop x~222, x~875). Polish. |
| 003 approved trade amber in chart, mint in feed (Medium) | **Fixed** | Hollow mint ring (`styles.css:196`), "executed after owner approval" in the list, mint "Approved" chip in the feed. |
| 004 four-sentence chart caption (Medium) | **Fixed** | One sentence (`CapRuler.tsx:64`). |
| 005 marks hover-only, no identity on touch (Medium) | **Fixed in substance** | Numbered marks plus a visible numbered list. Marks still do not link to feed rows and feed rows carry no number (polish). |
| 006 contract contradicts code (Medium) | **Mostly fixed, two items open for the third round** | `DESIGN.md:5` now says four tones, no second accent, which matches `Chip.tsx:4`. `:8` gives one scale. `:9` says Activity before Policy. Still open: no `--fs-13` token (13px literal at `styles.css:175,179,182`), `styles.css:211` still comments "policy first on phones", and `DESIGN.md:21` still claims marks at the same amount "never cover each other". |
| Polish: `.tnum` twice, `.ledger-head` split | **Not fixed** | `.tnum` at `styles.css:20` and `:21`. `.ledger-head` rules at `:215`, `:289`, `:294` (the last two in one media block). |
| Polish: Arbitrum empty left column at 1440 | **Unchanged since r6** | Feed ends y~1,396, Policy ends y~1,733 (`r10-arb-full-1440.png`): ~337px of empty canvas. |
| Polish: strip step 3 unit | **Fixed (r9), holds** | "0.00 / 5.00 testUSDG". |
| Polish: contrast evidence pass-only | **Fixed for text, not for non-text** | `contrast-r10.txt`: control drops min to 1.86, 306 failures. Non-text lines print 7.40 / 7.99 / 4.61 / 4.99 / 7.29 in both runs. See FINDING-005. |

r9 items: FINDING-005 (ragged list) not fixed; FINDING-001 (same-lane collision) not fixed; FINDING-002 (non-text constants) not fixed; FINDING-006 (phone Activity later) worse; `.sign-summary` missing rule **fixed** (`styles.css:208-209`); "Approved" mint vs "4 approved" violet **resolved** by dropping violet.

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | `Account.tsx:178-181`: 64px mono "3" with "trades the agent executed inside the owner's caps". In the first phone viewport at y~250 (`r10-390.png`), matching BACKED's number-first opening. | The figure counts all tokens (snap.tradeCount, includes the Paxos USDG trade); the two figures beside it are testUSDG only. One row, two scopes, no label for either. The 28px bold headline under it pulls weight away from the blocked chip. |
| (2) Every number states what it means | Blocked count, spend stopped, cap left today, refusals per check, a numbered chart list with outcome, distance past the line and reason. | "1 calls blocked" (FINDING-001). "15.000001 testUSDG of trades stopped" sums attempted amounts across refusals, so it grows with retries and includes the owner's `approveTrade()` on a settled proposal, which is not a trade by the agent; it covers 3 of the 4 blocked calls without saying so (FINDING-002). Three nouns for one event: blocked, stopped, refused. |
| (3) Semantic colors plus one accent | Violet removed. `Chip.tsx` has ok / warn / bad / neutral only; accent is the network color (lime RHC, blue Arbitrum). AA measured: worst 4.68:1, 12px floor, with a failing control. | Non-text 1.4.11 lines are computed from hard-coded hex, not the rendered page (FINDING-005). |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks cover every write the page can make: `createAccount` (`Account.tsx:45`), deposit/withdraw (`OwnerActions.tsx:77`), `setLimits` (`:141`), `setMeasurement` (`:199`), `approveTrade`/`rejectTrade` (`:241`). Each names amounts and consequences ("No funds move", "owner wallet only"). Now styled as a bordered 14px block with a bold lead-in. | Not observed rendered: Owner controls are collapsed in every capture and there is no wallet-connected capture. The proposal summary is a `<span>` with `display:block` inside an `actions` slot; its layout next to the buttons is unverified. |
| (5) Trust signals | Network badge with chain id, "Agent TDX quote verified on chain, 11 Oct 03:52 UTC ↗" linking the admission tx, block stamp with network dot, explorer link and UTC time on every feed row, explorer links in the footer. | The network is named three times in the first 520px (switch, badge, stamp line). The trust link is a 14px underline that reads as body text; it is the strongest claim on the page and the least styled. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | The figure is now the focal point and the blocked chip sits beside it, as the brief asked. Loses points: six text tiers before the action; the bold 28px headline is the third thing the eye hits and explains mechanism, not outcome; the hero's right column is ~290px of empty surface under the hint at 1440 (y~272-563); the label "trades the agent executed / inside the owner's caps" is capped at 22ch so it wraps even with 500px free, and its second line hangs ~30px below the numeral's baseline. |
| Typography | 7.5 | Archivo plus Plex Mono, sentence case, measured AA, mono for every figure. Loses points: the new 64px lead size is a literal outside the documented scale (`styles.css:204`, `DESIGN.md:8` lists 12-44); 13px is still a literal in three chart rules; the attempt list wraps outcome lines to the badge edge while reasons are indented 28px, leaving an orphan "line" at x=163 (item 4) and three left edges in one list; a semicolon ends a line on a phone ("spent anything;"). |
| Color | 8.5 | Strict four-tone semantic system plus one network accent, now true in code, contract and render. The approved trade is mint everywhere. AA worst 4.68:1 with a control that goes red. Loses points: the non-text contrast lines cannot fail; lime on near-black is still the predictable crypto look, rescued by having no glow or gradient. |
| Density | 6.5 | Desktop is tight: hero, strip and chart bar all inside the first 1440x900 (chart title at y~893). Loses points: on a phone the Activity heading is at ~2,164px, up from ~1,898px in r9 by the same measurement (+266px); the first feed row is ~2,250px down. The chart's fixed 150px SVG leaves ~45px dead between the ticks and the zone key at 390 once zone labels move out. The attempt list repeats amount, outcome and reason that the feed already holds. Arbitrum 1440 still has ~337px of empty column. |
| Components | 7.0 | `.sign-summary` now has a real rule. The disabled recheck on Arbitrum is a ghost button with the reason under it, done right. The recheck verdict appears in place with per-row chips (`r10-recheck-390.png`). Loses points: no pluralization in the blocked chip; the attempt list's grid and flex alignment is still broken; no in-lane collision handling; no nudge off threshold lines; marks do not link to rows; `.tnum` and `.ledger-head` still duplicated. |
| Mobile | 7.5 | The primary metric and blocked chip are in the first 390x844 viewport; the recheck button sits at y~740-788, just inside the fold; the zone key moves out of the SVG; no horizontal scroll. Loses points: Activity is ~266px further down than r9; the blocked row breaks into chip, a two-line clause ending in ";", and a third line; the approval line label is a bare amber "2.00". |
| Consistency | 7.0 | The tone table, `Chip.tsx`, the chart and the feed now agree, and the contract no longer promises a second accent. Loses points: three drift items survive a third round (`styles.css:211` comment, `--fs-13` untokenized, `DESIGN.md:21` false claim); `--fs-64` joins them; `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` are two identical copies; one event is called "blocked" (hero), "stopped" (hero), "refused" (strip, chart, feed). |
| Evidence / clarity | 7.5 | Trust signals are complete and linked; every chart mark reconciles to a list item and a feed row; refusals are counted per check and the four counts add up to the hero's 4 (1+1+1 in the strip plus "1 more refused after the checks"). Loses points: the stopped-spend figure is an unscoped sum that inflates with retries and includes an owner call (FINDING-002); the "3" and its neighbors carry different scopes; non-text contrast figures are constants presented beside measurements. |

## Findings by severity

### High

None.

### Medium

**FINDING-001: "1 calls blocked" on the primary metric row.** `Account.tsx:183` renders `{refusedRows.length} calls blocked` with no singular branch. Arbitrum shows "1 calls blocked" in a red chip directly under the hero figure at both widths (`r10-arb-full-1440.png` y~313, `r10-arb-390.png` y~341). It is the first sentence a reader sees on that network and it reads as unfinished. Fix: `{n} {n === 1 ? 'call' : 'calls'} blocked`, and the same check on "1 refused here" siblings if they ever take a count above one ("refused" is fine).

**FINDING-002: the "stopped" figure overstates what it measures.** `Account.tsx:160` sums `spend.amount` over every refused row on the lead token, then labels it "testUSDG of trades stopped before they spent anything". On RHC that is 10.000001 (cap refusal) + 1.00 (non-admitted caller) + 4.00 (the owner's `approveTrade()` on an already-settled proposal) = 15.000001. Three problems: (a) it counts a retry once per attempt, so an agent that retries a 10.000001 trade five times shows 50.000005 "stopped", a number that grows with persistence, not with risk; (b) the 4.00 call is an owner action, not a trade by the agent; (c) the 4th blocked call (`registerAgent`, no amount) is silently excluded, so the figure and the "4" beside it have different denominators. Under rule (2) this is the number most likely to be quoted and least able to survive a question. Fix: either relabel to what it is ("15.000001 testUSDG across 3 refused calls") or count distinct attempted trades by agent calls only and say so ("1 over-cap trade of 10.000001 refused"). Pick one noun for the event (refused) and use it in the chip too. Replace the trailing ";" with separate spans (it orphans on phones).

**FINDING-003: the numbered attempt list is still ragged at 1440 (r9 FINDING-005, untouched).** `styles.css:191-193` are byte-identical to r9: `.attempts` is a grid that stretches each `li` to the row height, each `li` is `flex-wrap: wrap; align-items: center` with default `align-content`, and `.hint` alone is indented 28px. In the 1:1 crop of `r10-full-1440.png` item 2 sits ~18px below items 1 and 3; item 3's "refused, 0.000001 over the cap" starts at the badge's left edge while its reason starts 28px in; item 4 wraps "line" to its own row at the badge edge. This is the list that makes the chart readable, and it has been reported with a two-line fix. Fix: `.attempts { align-items: start }`, and `.attempts li { display: grid; grid-template-columns: 20px 1fr; column-gap: 8px }` with the badge spanning all rows in column 1 and amount, outcome and reason in column 2.

**FINDING-004: same-outcome calls at one amount still cover each other (r9 FINDING-001, untouched).** `CapRuler.tsx:43-44` places x by amount and y by outcome lane only. Two refused retries of the same trade, the most ordinary agent behavior, land on one pixel and only the later numeral shows; the list would say 6 calls while the chart shows 5 marks. `DESIGN.md:21` promises this cannot happen. Fix: within each lane, sort by x and shift any mark within 18px of its predecessor by +18px (or pack into sub-rows); add a unit test with two identical refused rows that asserts circle centers differ by at least 18px, and break it once to see it go red.

**FINDING-005: non-text contrast lines are constants (r9 FINDING-002, untouched).** `contrast.cjs:49` builds the five WCAG 1.4.11 pairs from hard-coded `#3ec6a8`, `#e3b341`, `#f2555a` and a 0.12 alpha. `contrast-r10.txt` prints identical values in the pass run and the forced-fail run, so the control cannot reach them; changing `--bad` or `--warn-wash` in `tokens.css` would not move them. They are reported beside measured output, which makes them look measured. Fix: read the computed fill/stroke of `.mk-*` circles, `.l-warn`, `.l-bad` and the `.z-*` rect under each in the page loop, composite over `--surface-1`, and add a second control (`--warn-wash: rgba(227,179,65,0.9)`) that turns at least one non-text line red.

**FINDING-006: on a phone, Activity now starts ~266px later than r9.** Same pixel scan on both captures: r9 ~1,898px, r10 ~2,164px; first feed row ~2,250px. The lead metric earned its space; what did not is the duplication beneath it. The attempt list repeats every feed fact, the blocked row wraps to three lines, and the chart SVG keeps a fixed 150px height after its zone labels leave (`CapRuler.tsx:9`, `:88-91`), leaving ~45px dead at 390. Fix: on narrow widths shrink `H` by the zone-label band (~30px), render each attempt as one line (number, amount, outcome word; the reason is in the feed), and print the mark number as a small badge on its feed row so the mapping survives. Target: Activity at or above r9's ~1,900px.

### Polish

- Hero label: `.lead-label { max-width: 22ch }` forces a wrap at 1440 with ~500px free, and `align-items: baseline` hangs line two ~30px under the numeral. Let it run on one line at desktop, or align the label block to the numeral's bottom.
- Hero order: put the blocked row's chip immediately after the figure on one line ("3 trades executed · 4 refused") and drop the bold headline to 20px or into the lede. The mechanism sentence is the fourth-most important thing on the page and renders as the third-heaviest.
- Hero right column at 1440: ~290px of empty surface under the recheck hint before the strip. The account/block row or the trust link would fit there and shorten the left column.
- Mixed scope: "3" counts all tokens, the neighbors are testUSDG. Add the scope ("3 trades, all tokens") or make all three figures lead-token.
- Boundary marks 3 and 4 still centered on their lines (carried since r8).
- Chart marks do not link to feed rows; feed rows carry no mark number.
- `--fs-13` and a 64px lead size live as literals (`styles.css:175,179,182,204`); add tokens and document 64 in the scale.
- `styles.css:211` comment says "policy first on phones"; the grid puts Activity first (third round).
- `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` are identical copies; make one a pointer.
- `.tnum` declared twice (`styles.css:20-21`); `.ledger-head` has two rules in one media block (`:289`, `:294`).
- `gateRows.ts` `spentToken` wraps `spentBy` (which already catches) in a second `try`. Dead branch.
- Arbitrum 1440: ~337px empty left column under a three-row feed (since r6).
- The trust link ("Agent TDX quote verified on chain ...") is the page's strongest claim and is styled as a plain underline at 14px. A small ok-toned check glyph or chip framing would make it read as a verified fact, not a footnote.

## AI slop read

Retired since r9: the violet secondary chip, so "neon accent plus violet" is no longer on the page. Added: a big number with a sentence label. That is near the "big numbers with tiny labels" tell, but it is one figure, read live from the chain, with a full-sentence meaning and its risk counterpart beside it, which is the opposite of the template's decorative stat row. The chart's geometry still comes from the contract's branches, which nothing in the category predicts. Unchanged: lime on near-black (calibration look 2), rescued by no glow, halo, gradient or grid, and by the accent changing with the network. Holds at B; not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES; cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:299`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 85  (+10 figure and blocked count in first viewport; +5 trust row with timestamped admission)
  Read the blocked row  85 -> 80  (-5  "stopped" sum with a dangling semicolon, three nouns for one event)
  Tap Recheck           80 -> 90  (+10 "3 of 3 receipts verified" in place, per-row chips)
  Read the chart        90 -> 90  ( 0  five marks, five items; list readable on phone)
  Find the trades       90 -> 80  (-10 Activity ~2,164px down, list repeats the feed)
  Read a refusal        80 -> 85  (+5  named by its custom error, counted under its check)
  FINAL: 85/100 healthy
```

On Arbitrum the first sentence is "1 calls blocked": -5 at landing.

## What r10 got right

- It adopted the reference's structure, not just its parts: one number first, its risk counterpart beside it, then the instrument.
- It removed the second accent instead of defending it, and the contract, the chip types and the render now agree on four tones plus one accent.
- Every write the page can make has a plain-language summary that names amounts and consequences, and the summaries now have a real visual treatment.
- Trust signals are complete: chain id badge, timestamped admission link, block stamp, explorer link and UTC time per row.
- The four refusal counts reconcile to the hero's 4 without the reader doing arithmetic beyond the strip.
- Against `before-1440.png` (an unstyled `dl`, misaligned caps table, underlined uppercase "EXECUTED"), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-001: pluralize the blocked chip.
2. FINDING-002: relabel the stopped figure to its real scope and use one noun (refused); drop the semicolon.
3. FINDING-003: `align-items: start` on `.attempts`, a 20px/1fr grid on `.attempts li`.
4. FINDING-006 (part): shrink the SVG height on narrow widths when zone labels move to the key.
5. Fix the `styles.css:211` comment, add `--fs-13` and a lead-size token, reword `DESIGN.md:21` until FINDING-004 lands.

Blind spot: no live browser run (by instruction). The sign-summary blocks, Owner controls, wallet-connected states, hover/focus rings, the tx toast and recheck failure states were not observed rendered; rule (4) is verified in source only. Positions come from static captures and a pixel scan, not DevTools. AA figures are taken from `contrast-r10.txt`, not re-run here. The BACKED reference was judged through the brief and prior reports' measurements, not re-opened this round.

AXES: avg=7.4 min=6.5
