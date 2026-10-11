# CHIRON agent-account page: design audit, round 8

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r8-1440.png`, `r8-390.png`, `r8-full-1440.png`, `r8-full-390.png`, `r8-arb-full-1440.png`, `r8-arb-390.png`, `r8-recheck-390.png`, `before-1440.png`; the BACKED v3 reference `backed/web/docs/design/r39-1440.png` and `r39-390.png`; `docs/design/contrast-r8.txt` and the script that produced it, `design-research/tools/contrast.cjs`; `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/components/{CapRuler,Chip}.tsx`, the working-tree diff of `src/pages/Account.tsx` and `src/pages/account/gateRows.ts`; and `contracts/src/AgentAccount.sol` (to check the chart's zone model against the contract). Chart pixel positions were read from 1:1 crops of the full-page captures. Previous report: `design-audit-chiron-r7.md`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B

Verdict in one line: round 8 delivers the three asks in substance: a written status system with a violet secondary accent, a bespoke caps chart, and a measured AA pass (worst 4.75:1, 12px floor). It also closes the r7 Medium (Activity now comes before Policy on phones). But the chart, the round's main new surface, draws two red marks under a legend that says "3 refused". The third refusal is hidden under the executed mark. Two more marks sit on the threshold lines they are meant to test, and the chart colors the owner-approved trade amber while the feed colors the same event mint. The contract documents (DESIGN.md, a CSS comment) now disagree with the code in four places.

## First impression

- The page communicates **a console that checks every call and shows what it refused**. It now has a picture of that claim as well as a list.
- I notice **the new chart is the most designed object on the page** (`r8-full-1440.png`, y~720-1,050): three tinted zones, a dashed amber approval line, a solid red cap line, ticks only at 0, 2 and 10, and a legend with counts. It reads as a real instrument, not a stock chart. Then I count the marks: green, amber, red, red. That is four marks. The legend says 1 + 1 + 3 = 5.
- First three things my eye goes to: **the headline**, **the lime "Recheck every receipt" slab**, and **the strip's figures** ("4", "0.00 / 5.00", "3"). At 1440 the chart title is the fourth thing, just above the fold (y~755). All four are intended.
- One word: **credible, until counted**.

Page area test at 1440: top bar, hero sheet, strip, caps chart, Activity, Policy, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS.

## Round 7 findings, checked against round 8

| R7 finding | Status in r8 | Evidence |
|---|---|---|
| 001 first trade ~2,120px down on a phone (Medium) | **Fixed at the grid** | `styles.css:249` `grid-template-areas: 'ledger' 'side'` under 1000px. Activity now precedes Policy (`r8-full-390.png`). The Activity heading sits at ~1,716px. Without the new chart (~435px tall at 390) it would be ~1,280px. |
| Refused-row red gradient wash | **Fixed** | `styles.css:206` `.feed-row.is-refused { box-shadow: inset 2px 0 0 var(--bad) }`, a 2px tick and no wash. |
| 2px accent rule on the rounded sheet | **Fixed as suggested** | `.sheet` has no top border (`styles.css:133`). The network color moved to the dot beside the block stamp (`Account.tsx` diff, `styles.css:283`). |
| `DESIGN.md:3` "lavender accent" | **Fixed, new drift elsewhere** | Line 3 now reads "one accent". Lines 5, 8 and 9 are now stale; see FINDING-006. |
| `.tx-confirmed` retired green | **Fixed** | `styles.css:129` `rgba(62, 198, 168, 0.5)`. |
| `.ledger-head` split, `.tnum` declared twice | **Not fixed, worse** | `.tnum` is still declared at `:20` and `:21`. `.ledger-head` is now declared in three places (`:199`, `:271`, `:276`). |
| Arbitrum empty left column at 1440 | **Unchanged** | Feed ends y~1,355 and Policy ends y~1,690 (`r8-arb-full-1440.png`): ~335px of canvas. |
| Strip value voices differ (mono + unit vs bare mono pair) | **Unchanged** | Step 3 "0.00 / 5.00" still has no unit while steps 2 and 4 do. |
| Hero right column empty before a recheck | **Unchanged, acceptable** | Pre-action state. |
| Evidence: "3 trades through" counts the approved proposal | **Unchanged** | The strip says 3, the chart says "1 executed" (testUSDG only, Trade 3 spent Paxos USDG). Each is correct for its own scope, but neither says its scope next to the number. |

R7 closed: 1 Medium and 4 of 8 polish items. One polish item regressed (`.ledger-head`).

## Brief compliance (round 8 asks)

| Ask | Delivered | Gap |
|---|---|---|
| BACKED v3 as reference: metric cards, panels, status chips, clear primary action | Panels, status chips and the single primary action were already there. The chart echoes BACKED's loss-line ruler. | No metric cards. BACKED leads with one number ("1.19 USDC of room") and puts its ruler in the first phone viewport (`r39-390.png`, y~280-500). CHIRON leads with a sentence, and its chart starts at ~1,240px on a phone. The strip plays the metric-row role. That is a defensible choice for this product, but it does not adopt the reference's structure. |
| (1) Deliberate status color system with a secondary accent | `DESIGN.md:11-19` table: ok mint, warn amber, bad red, attest violet `#b4a3ff`, neutral. Tokens at `tokens.css:15-23`. Every chip keeps its word. | The secondary accent renders on exactly one chip ("Admitted", RHC). It renders on none on Arbitrum. The chart breaks the table once (FINDING-003). |
| (2) Chart polish | `CapRuler.tsx`: drawn at real container width via ResizeObserver so text stays 13px. Ticks only at 0, the approval line and the cap. Legend with counts. `aria-label` lists every mark. Empty state on Arbitrum is honest ("No trade attempt on USDG yet; the zones show what the contract would do."). Zone model matches the contract (`AgentAccount.sol:293-295`, `:475`). | One mark is hidden (FINDING-001). Two marks are fused with lines (FINDING-002). Marks have no visible identity (FINDING-005). Phone labels degrade (polish). |
| (3) Type scale + WCAG AA, measured | `contrast-r8.txt`: 4 runs (2 chains x 1440/390), 149-212 text nodes each, worst 4.75:1, min 12px, 0 failures. The script composites alpha backgrounds, covers SVG text, applies the 3:1 large-text rule and exits 1 on failure (`contrast.cjs:32-38`). | No red run is recorded, so the check is not shown able to fail. It measures text only, not WCAG 1.4.11 non-text contrast (chart zones, mark rings). The 13px chart size is not a token (`styles.css:180,184,187`). |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | Headline, lime action, strip figures, then the chart as a second visual anchor. The order is right. Loses points: the chart pushes the Activity heading at 1440 to ~1,116px (below the fold on a 900px viewport). The chart's 4-sentence caption (`CapRuler.tsx:47`) is the longest text block on the page after the lede. There is still no single headline figure of the kind the reference leads with. |
| Typography | 8.0 | Archivo for words, Plex Mono for figures and the chart's threshold labels and ticks, sentence case, a 12px floor reserved for mono metadata, and measured AA. Loses points: 13px is hard-coded three times outside the `--fs-*` scale. `DESIGN.md:8` and `:25` give two different scales. The wordmark is still tracked mono (`styles.css:41`). Step 3's value voice still differs from steps 2 and 4. |
| Color | 7.5 | A written five-tone system, mint kept apart from lime, violet reserved for attestation, AA pass. Loses points: the chart's amber "owner-approved" mark and the feed's mint "Approved" chip mark the same trade (FINDING-003). The secondary accent appears once per page at most, so it barely registers as a system. The violet sits near the slop list's purple tell, though as a flat chip, not a gradient. |
| Density | 7.5 | The phone puts Activity before Policy, and the cap grid stays one row per token. Loses points: the chart adds ~435px at 390 and ~330px at 1440 ahead of the ledger. The caption is 5 lines on a phone. The Arbitrum desktop still leaves ~335px of empty column under a three-row feed. |
| Components | 7.0 | `CapRuler` is bespoke and sized to its container, with an aria-label carrying every mark and an honest empty state. The verdict and per-row "Receipt verified" chips still work (`r8-recheck-390.png`). Loses points: no collision handling for coincident marks (FINDING-001). No separation of marks from threshold lines (FINDING-002). Mark identity is hover-only through an SVG `<title>` on a 10px dot (FINDING-005). Duplicate `.tnum`. `.ledger-head` in three rules. |
| Mobile | 8.0 | Activity before Policy, the strip grid correct, the chain switch full width, the chart drawn at true width so its 13px labels stay legible, no horizontal scroll. Loses points: chart labels degrade at 390. "executes" disappears, "owner approves" becomes "owner", and the approval line label becomes a bare amber "2.00" (`CapRuler.tsx:62-69`). The hidden mark is equally hidden. |
| Consistency | 7.0 | The tone table, chips and tokens agree with each other. Loses points: `DESIGN.md:5` says "one accent" and "executed/admitted/verified green". `:9` says "Policy before Activity" under 1000px. `styles.css:195` says "policy first on phones". The code does the opposite of all three (FINDING-006). The chart's amber approved mark contradicts `DESIGN.md:15`. |
| Evidence / clarity | 7.5 | Refusals are counted per check, receipts are recomputed in the browser, and every figure is tied to a block. The contrast claim ships with its script and output. Loses points: the chart's caption promises "Each mark is one call", yet one call is invisible and the legend's "3 refused" can't be reconciled against the drawing (FINDING-001). Boundary trades can't be told apart from the thresholds (FINDING-002). |

## Findings by severity

### High

**FINDING-001: the caps chart hides a refused call under an executed one.** The legend reads "1 executed · 1 owner-approved · 3 refused". The bar draws one green, one amber and two red marks (1:1 crop of `r8-full-1440.png` around y~860-1,020; same in `r8-full-390.png` around y~1,560). The missing mark is "Caller is not the admitted agent", `execute()` for 1.00 testUSDG (feed row 4). It sits at the same x as Trade 1, the executed 1.00 testUSDG. `CapRuler.tsx:33-38` maps each row straight to `sx(amount)`. `:71-77` draws the rows in feed order (newest first), so the older executed mark paints last and covers the red one. The chart's own caption says "Each mark is one call", and the page's whole argument is that refusals are visible. A reader who counts finds the chart disagreeing with its legend. Fix: group marks whose x positions are within ~8px. Stack each group vertically inside the track (offsets of ±9px from center), drawing refused marks on top. Or draw one mark with a count badge ("2") and a split fill. Then assert in a test that the number of drawn `<g.mk>` elements, counted per visible position, equals the legend total.

### Medium

**FINDING-002: the two boundary trades sit on the lines they test.** Proposal 1 spent 2.000001 testUSDG, just above the approval line at 2.00. The cap refusal spent 10.000001, just past the cap at 10.00. On a linear scale running 0 to 13, both land on their threshold line: an amber dot on the amber dashed line, and a red dot on the red cap line (crop, x~192 and x~846). These are exactly the two calls that demonstrate "between the lines it waits for the owner" and "past the cap the contract reverts". The chart can't show which side of the line either one is on. Fix: when a mark is within 6px of a threshold, move it 7px toward the side its value lies on and print its amount beside it in 12px mono ("2.000001", "10.000001").

**FINDING-003: the same trade is amber in the chart and mint in the feed.** `CapRuler.tsx:36` gives an `APPROVED` row the kind `held`, which `styles.css:191` paints `--warn`, and the legend calls it "owner-approved". `Chip.tsx:18` maps `APPROVED` to `ok`, so the feed row "Proposal 1 approved: 2.000001 testUSDG" carries a mint "Approved" chip. `DESIGN.md:15` defines amber as "waiting on the owner". This trade is no longer waiting; it executed. Fix: draw it as an executed mark (mint fill) with an amber ring, and label the legend "1 executed after owner approval". Or keep amber only for pending proposals, which the chart currently filters out.

**FINDING-004: the chart explains itself in four sentences.** `CapRuler.tsx:47` prints a 64ch paragraph (4 lines at 1440, 5 at 390) above a bar whose zone labels already say "executes", "owner approves" and "reverts". This is instructions compensating for the drawing. Fix: cut it to one sentence ("One mark per call, at the amount it tried to spend."). Move "a red mark inside the caps was stopped at another check" into that mark's own label (see FINDING-005). That saves ~60px at 1440 and ~100px at 390.

**FINDING-005: marks have no visible identity, and none at all on touch.** Each mark's label ("1.00 testUSDG: refused") exists only as an SVG `<title>` (`CapRuler.tsx:73`) plus a CSS `r: 7` hover (`styles.css:193`) on a 10px dot. A phone user can't learn which call a mark is. A desktop user has to find it by hovering. The red mark at 4.00 ("proposal already settled") and the hidden one at 1.00 are refusals for reasons other than the cap, and the chart sends the reader to Activity to find out why. Fix: link each mark to its feed row (`href="#row-<key>"` on the `<g>`, with a 24px transparent hit circle). Print the amount under any mark that does not collide with a tick label.

**FINDING-006: the design contract now contradicts the code in four places.** `DESIGN.md:5` says "one accent" and "executed/admitted/verified green". The code renders Admitted in the violet secondary accent (`Account.tsx` diff, `tone: 'attest'`), and `DESIGN.md:17` itself adds that accent. `DESIGN.md:8` gives the scale as 12/14/16/20/28/44, while `:25` says 12/13/14/16/20/28/44. `DESIGN.md:9` says "Under 1000px one column with Policy before Activity", but `styles.css:249` puts the ledger first. `styles.css:195` still comments "policy first on phones". This file is the contract that later rounds and other agents build from, so each stale line will be re-implemented. Fix: rewrite lines 5, 8 and 9 to match the code, add `--fs-13` to `tokens.css` and use it in the three chart rules, and fix the comment.

### Polish

- The secondary accent is thin. On RHC it renders once (the "Admitted" chip). On Arbitrum it never renders ("No agent" is neutral). `DESIGN.md:17` lists the pinned model and approved code as attest. In Policy both render as plain text (`r8-full-1440.png`, Policy rows 2 and 4). Either give those rows the attest chip or dot, or narrow the table to "admitted agent only".
- Phone chart labels degrade (`CapRuler.tsx:62-69`). "executes" is dropped because its zone is under 44px wide. "owner approves" is cut to "owner". The approval line label loses "approve above" and becomes an amber "2.00" floating over a dashed line. Put the three zone names in the legend row on narrow widths instead of under the bar.
- At 1440 the chart pushes the Activity heading from about the first scroll to ~1,116px. Pairing the chart with the strip (same sheet, under step 3, which already shows the same token's caps) would make it read as the visual for "Inside the testUSDG caps" rather than a separate panel. It would also drop one card from the stack.
- `.tnum` is declared twice (`styles.css:20-21`). `.ledger-head` is declared three times (`:199`, `:271`, `:276`).
- The refused-row marker is a 2px red inset on the row's left edge (`styles.css:206`). That is the colored-left-border pattern, acceptable here because it sits on square table rows, not on rounded cards, and the chip carries the word.
- Arbitrum 1440: ~335px of empty left column under the three-row feed (unchanged since r6).
- The strip's step 3 value has no unit while steps 2 and 4 do (unchanged).
- Contrast evidence: `contrast-r8.txt` records only the passing run. Record one run against a deliberately lowered `--ink-subtle` to show the script goes red, and add a non-text (1.4.11) check for mark rings against zone washes.

## AI slop read

Removed since r7: the accent rule on the rounded sheet and the red row wash, which were the two decoration tells. Added: a bespoke chart that carries the product's argument (zones derived from the contract's own branches, one mark per call). Nothing about it could be guessed from the category, and it is the strongest anti-slop move this page has made. Also added: a violet secondary accent. It is a flat chip and used for one meaning, so it is not the purple-gradient tell, but violet next to neon lime is a predictable crypto pairing. Also added: a four-sentence caption, which is the "instructions" tell. Unchanged: neon lime on near-black (calibration look 2), still rescued by having no glow, halo or gradient and by the hue changing with the network. Net: one strong original object, two tells retired, one added. Grade moves from B- to B.

Litmus: brand unmistakable in first screen YES; one strong anchor YES (headline, then the lime action); scannable by headings YES; one job per section YES; cards necessary MOSTLY (sheet, chart panel and Policy are three rounded panels stacked, and the chart panel could live inside the sheet); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:281`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action obvious)
  Tap Recheck           80 -> 90  (+10 mint "3 of 3 receipts verified" under the button, per-row chips)
  Read the strip        90 -> 90  ( 0  rows aligned, refusals counted per check)
  Read the chart        90 -> 80  (-5  five-line caption; -5 legend says 3 refused, two visible, marks untappable)
  Find the trades       80 -> 85  (+5  Activity now before Policy, ~400px earlier than r7)
  Read a refusal        85 -> 90  (+5  named by its custom error, counted under the check that raised it)
  FINAL: 90/100 healthy
```

## What r8 got right

- It fixed the r7 Medium at the layout root (`grid-template-areas`), not by trimming content.
- The chart's geometry comes from the contract, not from a chart library: the approval line and per-trade cap match `AgentAccount.sol:293-294` and `:475`. Drawing at the measured container width keeps chart text at its real CSS size on phones, which most SVG charts get wrong.
- The status system is written down as a table of tone, token, meaning and surfaces, and every chip still carries its word.
- Contrast is measured on the rendered page for both chains and both widths, SVG included, with alpha compositing, and the command is checked in. A claim made with its instrument is worth more than a claim.
- Compared with `before-1440.png` (unstyled `dl`, misaligned caps table, underlined uppercase "EXECUTED"), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-001: group coincident marks and stack them inside the track. Add a test that counts drawn marks against the legend.
2. FINDING-003: render the approved trade as executed (mint fill, amber ring) and relabel the legend.
3. FINDING-004: cut the chart caption to one sentence.
4. FINDING-006: rewrite `DESIGN.md:5`, `:8`, `:9`, add `--fs-13`, fix the `styles.css:195` comment.
5. Delete the duplicate `.tnum` and fold `.ledger-head` into one base rule plus one 640px rule.

Blind spot: no live browser run (by instruction). Chart positions were read from 1:1 crops of static captures, so a mark offset by under ~2px from another could still be called hidden. Source confirms the two 1.00 marks share the same x (`CapRuler.tsx:35`). Hover, focus, the open renewals feed, open Owner controls, the tx toast and recheck failure states were not observed rendered. The AA pass is taken from `contrast-r8.txt` and not re-run here.

AXES: avg=7.6 min=7.0
