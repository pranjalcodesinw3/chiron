# CHIRON agent-account page: design audit, round 9

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r9-1440.png`, `r9-390.png`, `r9-full-1440.png`, `r9-full-390.png`, `r9-arb-full-1440.png`, `r9-arb-390.png`, `r9-recheck-390.png`, `before-1440.png`; the BACKED v3 reference `backed/web/docs/design/r39-1440.png`; `docs/design/contrast-r9.txt` and the script that produced it, `design-research/tools/contrast.cjs`; `DESIGN.md` (byte-identical to `docs/design/DESIGN-CONTRACT.md`), `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,Chip}.tsx`, and the working-tree diff of `src/pages/Account.tsx` and `src/pages/account/gateRows.ts`. Chart and key positions were read from 1:1 crops of the full-page captures (the 390 full captures are 4,883 and 4,980px tall and are downscaled 2.4x when displayed whole). Previous report: `design-audit-chiron-r8.md`.

Source drift during this audit: after the files above were read, the working tree moved on (`contrast-r10.txt` appeared). The current `Chip.tsx`, `tokens.css`, `DESIGN.md` and `Account.tsx` no longer contain the `attest` tone or `--attest`, and Admitted, Pinned and Code approved fall back to ok and neutral. That reverses r9 brief ask (1), the secondary accent. This report grades round 9 as captured in the r9 screenshots and the source as first read. Line references to `--attest`, `.chip-attest` and `DESIGN.md:11-19` describe that state, not the current tree.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B

Verdict in one line: round 9 fixes the r8 High and three of its five Mediums. The chart now draws all five calls as numbered marks in outcome lanes, and a numbered list under it gives each call's amount, outcome and reason, so the drawing and the list reconcile one for one, including on touch. The owner-approved trade is a hollow mint mark that matches the feed's mint chip. The caption is one sentence. Contrast passes at a worst of 4.68:1, and a negative control now shows the text check going red (306 failures). What holds the score at B: the new numbered list renders ragged at 1440 because of a flex-wrap alignment default. The lane fix only separates marks with different outcomes, so two refused calls at one amount would still stack invisibly. The two boundary trades still sit on their threshold lines. The non-text contrast figures are constants that the negative control cannot move. And the phone now reaches Activity about 110px later than in r8.

## First impression

- The page communicates **a console that checks every call, counts what it refused, and now draws each call where it landed**.
- I notice **the chart reads as finished at 1440** (`r9-1440.png`): the bar sits inside the first 900px viewport (track at y~792-845), the caption is one line, and the marks carry numbers. Then my eye drops to the list under it and the grid goes uneven. Item 1's reason sits 35px below its amount. Item 2 floats 16px lower than items 1 and 3. Item 4's outcome line starts flush with its badge, while item 1's reason is indented 28px.
- First three things my eye goes to: **the headline**, **the lime "Recheck every receipt" slab**, and **the strip's figures** ("4", "0.00 / 5.00 testUSDG", "3"). The chart bar is fourth and now visible without scrolling. All four are intended.
- One word: **reconciled**.

Page area test at 1440: top bar, hero sheet (headline + action, four checks, caps chart), Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS.

## Round 8 findings, checked against round 9

| R8 finding | Status in r9 | Evidence |
|---|---|---|
| 001 chart hides a refused call under an executed one (High) | **Fixed for this data, latent in general** | `CapRuler.tsx:13` puts each outcome in its own lane (executed y+14, approved y+27, refused y+40). Marks 2 (executed 1.00) and 5 (refused 1.00) now stack (`r9-full-1440.png` crop, x~140). Five marks, five list items. Two calls with the same outcome at the same amount still share x and lane; see FINDING-001. |
| 002 boundary trades sit on their threshold lines (Medium) | **Half fixed** | The list now says "0.000001 over the approval line" and "0.000001 over the cap" (`CapRuler.tsx:47-52`), so the side is stated. The drawing is unchanged: mark 4 is centered on the dashed amber line and mark 3 on the red cap line (`sx(amount)`, `:43`, no nudge). FINDING-003. |
| 003 approved trade amber in chart, mint in feed (Medium) | **Fixed** | `.mk-approved` is a hollow mint ring (`styles.css:187`). The list reads "executed after owner approval". `DESIGN.md:14` documents it. |
| 004 four-sentence chart caption (Medium) | **Fixed** | One sentence: "Each numbered mark is one call at the amount it tried to spend." (`CapRuler.tsx:64`). |
| 005 marks hover-only, no identity on touch (Medium) | **Fixed in substance** | Numbered marks plus a visible numbered list with amount, outcome and refusal reason (`CapRuler.tsx:95-105`). Readable on a phone (`r9-full-390.png` crop y~1,560-1,830). The marks still don't link to feed rows, and feed rows carry no number (polish). |
| 006 contract contradicts code in four places (Medium) | **Mostly fixed** | `DESIGN.md:5` now names the five tones with violet as the secondary accent. `:8` gives one scale, 12/13/14/16/20/28/44. `:9` says "Activity before Policy". Still open: no `--fs-13` token, `styles.css:201` still comments "policy first on phones", and a new false claim at `DESIGN.md:22`. FINDING-004. |
| Polish: secondary accent thin | **Fixed** | Violet now renders on Admitted (strip), "Pinned by the owner" and "4 approved" (Policy) on RHC, and on "Pinned by the owner" on Arbitrum (`Chip.tsx:19-26`, `Account.tsx` diff). |
| Polish: phone chart labels degrade | **Fixed** | Under 560px the zone names move into a text key: "executes up to 2.00 / owner approves up to 10.00 / reverts past the cap" (`CapRuler.tsx:94`). The approval label is still a bare amber "2.00" on the line. |
| Polish: chart as a separate card | **Fixed** | The chart now lives inside the sheet under the strip (`Account.tsx:238`, `.ruler-wrap`). One rounded panel fewer. |
| Polish: `.tnum` twice, `.ledger-head` in three rules | **Not fixed** | `.tnum` at `styles.css:20` and `:21`. `.ledger-head` at `:205`, `:277` and `:282`; the last two are in the same 640px block. |
| Polish: refused-row 2px red inset | **Unchanged, acceptable** | `styles.css:212`, on square rows, and the chip carries the word. |
| Polish: Arbitrum empty left column at 1440 | **Unchanged** | Feed ends y~1,232 and Policy ends y~1,597 (`r9-arb-full-1440.png`): ~365px of empty canvas. |
| Polish: strip step 3 has no unit | **Fixed** | "0.00 / 5.00 testUSDG" (`Account.tsx` diff, `.gate-unit`). |
| Polish: contrast evidence shows only a passing run | **Fixed for text, not for non-text** | `contrast-r9.txt`: forcing `--ink-subtle` to `#4a4d52` drops the minimum to 1.86 and produces 306 failures. The five non-text lines print identical values in both runs. FINDING-002. |

R8 closed: the High (for this data), 3 Mediums in full, 1 Medium in half, 1 Medium mostly, and 5 of 8 polish items.

## Brief compliance (round 9 asks)

| Ask | Delivered | Gap |
|---|---|---|
| BACKED v3 as reference: metric cards, panels, status chips, clear primary action | Panels: one sheet holding hero, strip and chart, plus a sticky Policy panel. Status chips throughout, every chip worded. One clear primary action whose verdict appears in place (`r9-recheck-390.png`: "Recheck again", mint "3 of 3 receipts verified", per-row "Receipt verified"). The chart is now in the first desktop viewport, as BACKED's ruler is. | No metric cards and no headline figure. BACKED opens its panel with "1.19 USDC of room above the line", draws the ruler beneath it, and puts a five-cell metric row under that (`r39-1440.png`). CHIRON's strip is a four-cell metric row joined by a rail, which is a fair adaptation. But CHIRON still has no single number that answers "how much room does the agent have", even though it already holds the data (5.00 left today, 10.00 per trade). On a phone the chart starts at ~1,275px; BACKED's ruler sits at ~280px. |
| (1) Deliberate status color system with a secondary accent | A five-tone table (`DESIGN.md:11-19`), now honored by the chart, the feed and Policy alike. Violet means attestation on three surfaces. Lime stays the network action color and is kept apart from mint. | "Approved" (a trade, mint) and "4 approved" (code, violet) use the same word in two tones a few hundred pixels apart. Small, but it is the one place where the word and the color disagree about what "approved" means. |
| (2) Chart polish | Outcome lanes, numbered marks, a hollow mark for the owner-approved trade, ticks only at 0 / approval / cap, a one-line caption, the zone key moved off the bar on phones, an honest empty state on Arbitrum, and an aria-label that points to the list. | The list layout is ragged at 1440 (FINDING-005). Same-outcome collisions are unhandled (FINDING-001). Boundary marks are fused with their lines (FINDING-003). |
| (3) Type scale and WCAG AA, measured, with a negative control | Measured on the rendered page: 4 runs, 149-234 text nodes each, worst 4.68:1, 12px minimum, 0 failures. The negative control fails all 4 runs and exits 1. | 13px is in the documented scale but not in `tokens.css`, and the chart rules hard-code `13px`/`12px` (`styles.css:176,180,183,185,195`). The non-text section is not a measurement (FINDING-002). |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | Headline, lime action, strip figures, then the chart bar, all inside the first 1440x900 viewport. Moving the chart into the sheet makes the top of the page one composition. Loses points: still no headline figure of the kind the reference leads with. The hero's right column is ~120px of empty space under the helper text before a recheck. The numbered list under the chart is visually as heavy as the strip above it. |
| Typography | 8.0 | Archivo for words, Plex Mono for figures, sentence case, a 12px floor kept for mono metadata, measured AA, and step 3 now carries its unit. Loses points: 13px and 12px are literals in five chart rules despite "components read only tokens" (`DESIGN.md:3`, `styles.css:1`). List outcome lines that wrap ("executed after owner approval, 0.000001 over the approval line") lose the 28px indent their reason lines keep. The wordmark is still tracked mono caps (`styles.css:41`). |
| Color | 8.5 | One five-tone system that the chart, chips and list all obey. The secondary accent now does real work on three attestation surfaces. AA is measured at both widths on both chains, with a control that fails. Loses points: the "approved" word appears in mint and violet. Violet beside neon lime is the expected crypto pairing, though here it is flat and keeps to one meaning. |
| Density | 7.0 | Desktop is tighter: the chart moved into the sheet and the caption is one line. Loses points: on a phone the chart plus its five-item list runs ~555px (y~1,275-1,830), up from ~435px in r8, and the Activity heading moved from ~1,716px to ~1,825px. Arbitrum 1440 still leaves ~365px of empty left column. |
| Components | 7.5 | `CapRuler` gained lanes, numerals, a hollow-ring variant and a list keyed to the marks, all drawn at the container's real width. Loses points: no collision handling within a lane (FINDING-001). No nudge off threshold lines (FINDING-003). The list's grid and flex alignment is broken at 1440 (FINDING-005). Marks don't link to feed rows. `.sign-summary` is used five times (`Account.tsx:45`, `OwnerActions.tsx:77,141,199,241`) and has no CSS rule. `.tnum` and `.ledger-head` are still duplicated. |
| Mobile | 8.0 | The zone names move to a text key, the list stacks one call per row and reads cleanly (1:1 crop), the strip goes single column with the rail number on the left, the chain switch is full width, and there is no horizontal scroll. Loses points: Activity comes later than in r8. The approval line is labeled with a bare amber "2.00". |
| Consistency | 7.5 | Three of the four r8 contract drifts are closed, the status table matches the code, and the chart, feed and Policy agree on every tone. Loses points: `DESIGN.md:22` says marks "at the same amount never cover each other", which is only true across outcomes. `--fs-13` is documented but not tokenized. The `styles.css:201` comment is stale. `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` are two identical copies that will drift. |
| Evidence / clarity | 8.0 | Every mark reconciles to a list item, and every list item to a feed row by its text. Boundary trades state how far past the line they went. The text contrast claim ships with a negative control that fails. Loses points: the non-text figures cannot fail (FINDING-002). The chart numbers calls oldest first while the feed lists newest first with no numbers, so going from "mark 1" to its row means matching text by eye. |

## Findings by severity

### High

None.

### Medium

**FINDING-001: lanes separate outcomes, not calls; two same-outcome calls at one amount still hide each other.** `CapRuler.tsx:13` gives each outcome a fixed y, and `:43` gives x = `sx(amount)`. Two refused retries at 1.00, or two executed 1.00 buys, land on the same pixel in the same lane, and only the later numeral shows. A fixed-size retry is the most ordinary agent behavior there is, so the next refusal of a repeated trade brings back the r8 High. `DESIGN.md:22` already promises it can't happen. Fix: within each lane, sort marks by x and offset any mark within 18px of the previous one by +18px horizontally (or pack into sub-rows). Add a unit test that feeds two identical refused rows and asserts the two `<circle>` centers differ by at least 18px.

**FINDING-002: the non-text contrast lines are constants, so the negative control cannot reach them.** `contrast.cjs` (after the page loop) computes the five WCAG 1.4.11 ratios from hard-coded hex (`#3ec6a8`, `#e3b341`, `#f2555a`, `#0f1011`) and a hard-coded 0.12 alpha. It never reads `getComputedStyle` of `.mk circle`, `.l-warn` or `.z-*`. `contrast-r9.txt` prints 7.40 / 7.99 / 4.61 / 4.99 / 7.29 in both the pass run and the forced-fail run. If someone changes `--bad` or `--warn-wash` in `tokens.css`, these lines still pass. The same file presents them next to measured output. Fix: inside the page loop, read the computed fill or stroke of each `.mk-*` circle, `.l-warn`, `.l-bad`, and the `.z-*` rect behind it, composite over `--surface-1`, and add a second control that forces `--warn-wash: rgba(227,179,65,0.9)` so at least one non-text line goes red.

**FINDING-005: the numbered list under the chart is ragged at 1440.** The cause is one CSS default. `.attempts` is a grid (`styles.css:192`), so each `li` stretches to its row's height, set by the tallest item: item 3, three lines. Each `li` is `display:flex; flex-wrap:wrap; align-items:center` (`:193`) with the default `align-content: normal`, so its wrapped lines spread out to fill the stretched height. The result (1:1 crop of `r9-full-1440.png`): item 1's reason sits 35px under its amount, item 2 is centered 16px below items 1 and 3, and item 5 is centered in row 2. On top of that, `.attempts .hint` is indented 28px (`:194`), but a long `.attempt-word` wraps to its own line at x=0 (items 3 and 4). So there are three different left edges in one list. This is the main new surface of the round. Fix: `.attempts { align-items: start }` and `.attempts li { align-content: flex-start }`. Then give the `li` a two-column grid (`grid-template-columns: 20px 1fr; column-gap: 8px`), put the badge in column 1 spanning all rows, and put amount, outcome and reason in column 2, so every line shares one left edge.

**FINDING-006: on a phone, Activity starts ~110px later than in r8.** The chart plus list now takes ~555px at 390 (crop y~1,275-1,830), and the Activity heading sits at ~1,825px (r8: ~1,716). The list repeats facts the feed already holds: amount, outcome and reason are all in the feed row. Fix: on narrow widths, show only the number, amount and outcome word on one line per item (drop the reason line, which the feed carries), and print each row's mark number as a small badge beside its feed chip. That keeps the mapping without the second description. Saves ~100px and fixes the cross-reference gap under Evidence.

### Polish

- **FINDING-003 (from r8-002, half fixed):** marks 4 and 3 are still centered on the approval and cap lines (`r9-full-1440.png` crop x~221 and x~876). The list now says "over", so this drops from Medium to polish. Fix: when |x - line| < 10px, shift the mark 10px toward the side its value lies on.
- **FINDING-004 (from r8-006, mostly fixed):** add `--fs-13: 13px` to `tokens.css:31` and use `var(--fs-13)` / `var(--fs-12)` at `styles.css:176,180,183,185,195`. Change the `styles.css:201` comment to "activity first on phones". Reword `DESIGN.md:22` to "marks at the same amount in different outcomes never cover each other" until FINDING-001 lands. Keep one contract file and make `docs/design/DESIGN-CONTRACT.md` a pointer.
- "Approved" (mint, trade) next to "4 approved" (violet, code). Relabel the Policy chip "4 codes approved", or keep its old summary "4 measurements" and drop the chip word.
- `.sign-summary` has no rule, so each "What you sign:" line in Owner controls renders as body 16px ink inside 14px forms. Not observed rendered (Owner controls was collapsed in every capture).
- Chart marks don't link to feed rows. An `href="#row-<key>"` on each `<g>` and `<li>` would make the number navigable.
- `.tnum` is declared twice (`styles.css:20-21`). `.ledger-head` has two rules inside one media block (`:277`, `:282`).
- Arbitrum 1440: ~365px of empty left column under the three-row feed (unchanged since r6).
- `gateRows.ts` `spentToken` wraps a `try` around `spentBy`, which already catches. Dead branch, no design impact.

## AI slop read

Retired since r8: the four-sentence instructions caption (the "instructions" tell) and the stand-alone chart card (one fewer stacked rounded panel). Added: numbered circle badges in a list, a common pattern, but here each badge is the key to a real mark on a real axis, so it carries data, not decoration. Unchanged: neon lime on near-black, which is calibration look 2. It is still rescued by having no glow, halo, gradient or grid paper, and by the accent changing with the network. Unchanged: a flat violet secondary chip, which is not the purple-gradient tell. The chart's geometry still comes from the contract's own branches, which nothing in the category would predict. Net: one tell retired, nothing slop-shaped added. Holds at B. It does not reach A because the palette still matches a look a reader could guess from "crypto dev console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES; scannable by headings YES; one job per section YES; cards necessary YES (sheet and Policy only now); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:287`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action obvious)
  Tap Recheck           80 -> 90  (+10 mint "3 of 3 receipts verified" in place, per-row chips)
  Read the strip        90 -> 90  ( 0  units on every value now, refusals per check)
  Read the chart        90 -> 95  (+5  five marks, five listed calls, outcomes in words)
  Find the trades       95 -> 90  (-5  Activity ~1,825px down, list repeats the feed)
  Read a refusal        90 -> 95  (+5  named by its custom error, counted under its check)
  FINAL: 95/100 healthy
```

## What r9 got right

- It fixed the r8 High in the data model (an outcome per lane) rather than by nudging one mark, and it moved mark identity out of hover entirely.
- The owner-approved trade now has one visual identity everywhere: a hollow mint ring in the chart, mint "executed after owner approval" in the list, and a mint "Approved" chip in the feed.
- The contrast check is now shown able to fail: forcing one token produced 306 failures across 4 runs, and the shipped tokens produce 0.
- Moving the chart into the sheet put the product's picture inside the first desktop viewport and removed a card.
- Against `before-1440.png` (an unstyled `dl`, a misaligned caps table, underlined uppercase "EXECUTED"), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-005: `align-items: start` on `.attempts`, `align-content: flex-start` and a 20px/1fr grid on `.attempts li`.
2. FINDING-001: offset same-lane marks within 18px. Add a test with two identical refused rows.
3. FINDING-002: read the non-text colors from computed styles and add a wash-based negative control.
4. FINDING-004: add `--fs-13`, replace five literals, fix the `styles.css:201` comment, reword `DESIGN.md:22`.
5. Add a `.sign-summary` rule (14px, `--ink-muted`, `b` in `--ink`).

Blind spot: no live browser run (by instruction). Key-list offsets and mark positions were read from 1:1 crops of static captures. The ragged-list diagnosis comes from source and was not confirmed in DevTools. Hover, focus rings, open Owner controls, the tx toast and recheck failure states were not observed rendered. The AA figures are taken from `contrast-r9.txt`, not re-run here.

AXES: avg=7.8 min=7.0
