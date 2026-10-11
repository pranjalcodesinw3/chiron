# CHIRON agent-account page: design audit, round 3

Mode: AUDIT ONLY. No source edits, no server, no commits. Evidence: the r3 screenshot set in `docs/design/` (1440 and 390, RHC and Arbitrum, post-recheck at 390), `before-1440.png` for comparison, `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx`, `src/components/{Chip,GateLog,ChainSwitch,Stamp}.tsx`, `src/App.tsx`, `src/pages/account/gateRows.ts`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: C+
AI Slop Score: C

Verdict in one line: a large, real step up from `before-1440.png` (which was an unstyled `dl` and a broken table), now a disciplined Linear clone whose single primary action has no finished state, and whose layout is a stack of boxes that a reader could predict from the category alone.

## First impression

- The page communicates **competence and restraint**: one headline, one primary button, tokens used everywhere, no gradient text, no emoji, no icon grid.
- I notice the **4-up metric strip is the loudest thing below the hero**: the 40px mono "3", "4", "0.00" outrank every section heading (20px) on the page.
- First three things my eye goes to: **the headline**, **the lavender "Recheck every receipt" button**, **the "Admitted" green chip**. That is the intended order; the hierarchy is honest above the fold.
- One word: **tidy**.

Page area test at 1440 (RHC): top bar, hero, metrics, caps, activity, policy, owner controls: all nameable in 2 seconds. The right column under Policy (y 975 to 1780 in `r3-full-1440.png`) is an unnamed void.

Trunk test: PASS on site ID, page, chain, options. No search, which is correct for a single-account console.

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 6.5 | Headline then single CTA then metrics reads correctly (`r3-1440.png`). Loses points: metric values at `--fs-40` (styles.css:101) outrank `.t-section` at 20px, so "Activity" and "Caps" read as captions under the numbers; chain is named four times above the fold (switch, hero eyebrow chip, lede, and again in the footer); refused rows repeat the error name twice (red `MeasurementNotApproved()` line plus the raw `MeasurementNotApproved(measurement 0xfd34…)` dump in the sub). |
| Typography | 6.5 | Archivo wdth 92 + IBM Plex Mono with tabular nums is a real choice, not Inter. Loses points: `text-transform: uppercase` on `.metric-label` and `.caps thead th` mangles data, turning `testUSDG` into "TESTUSDG" and "24 h" into "24 H" (`r3-1440.png`, metric 4 and caps header); 12px is the dominant size for every hash, stamp, tx link, time and chip; the "Admitted" chip inherits mono 16px from `.metric-value` (styles.css:101-102) while every other chip on the page is Archivo 12px. |
| Color | 7.0 | Tokens only, semantic chips always carry a word (Chip.tsx:4), contrast of `--ink-subtle` on `--surface-1` is about 5.8:1. Loses points: amber means three different things (Proposed, Revoked, Withdrawn: 6 of 13 feed rows in `r3-full-1440.png` are amber, so amber stops signalling "needs the owner"); DESIGN.md:5 reserves the accent for the primary action and focus, but `.bar` (styles.css:104) paints the spend bar in accent; lime `--rhc` plus lavender accent plus green/amber/red is five saturated hues on one screen. |
| Density | 5.5 | Desktop: caps table stretches 2 tokens over 1150px with numbers 250px apart; Policy ends ~800px before Activity does, leaving the right third empty for most of the scroll; feed rows run 64 to 140px tall for one event each. Mobile: 4142px tall (`r3-full-390.png`) for 13 events, a 4-row caps table and a 3-row policy. |
| Components | 5.5 | Chip, btn, hex/copy and kv patterns are reused consistently. Loses points: the primary button has no done state (see FINDING-001); on Arbitrum it is disabled with no stated reason (FINDING-002); `.copy` buttons are 16px tall and `.btn-sm` 28px, far under 44px; the whole page is cards inside a card shell, each with a shadow (`--shadow-card` 0 8px 24px on #08090a is invisible, pure decoration). |
| Mobile | 5.5 | No page-level horizontal scroll, chain switch correctly drops to a full-width second row, CTA goes full width. Loses points: caps table is clipped mid-header ("APPROVE A" in `r3-390` full shot) with an inner scroller and no affordance; Policy (owner, pinned model, approved code) lands below a 13-row feed at y ~3600; after tapping Recheck at the top, every result appears 600 to 3000px further down (`r3-recheck-390.png`); touch targets on copy, tx links and "Show 27 admin events" are 16 to 28px. |
| Consistency | 5.0 | The same owner address renders as `0x2aD1…5DEF` in Policy (checksummed by `HexValue`) and `0x2ad1…5def` in the feed (`short()` on raw trace data, gateRows.ts:114); the feed subtitle says "Trades and refusals, newest first" while it shows Revoked and Withdrawn rows (Account.tsx:328 counts them as core); footer link sits right-aligned on Arbitrum (`r3-arb-full-1440.png`) and wraps to its own left-aligned line on RHC (`r3-full-1440.png`); the Admitted chip is a different size and face from every other chip. |
| Evidence / clarity | 7.0 | Strongest axis: per-row tx links, revert names, block stamp on the hero, real explorer links, refusals proven from raw trace. Loses points: footer claims "Every figure is a chain read at the block shown beside it" (App.tsx:24) but metrics, caps, policy and activity carry no block beside them, only the hero does; "1 proposed for approval" (Account.tsx:364) uses the cumulative `proposalCount`, so a proposal already approved reads as still pending; hero says the agent "buys TSLA with USDG" while caps and the spend metric govern `testUSDG`, and the feed shows trade 3 in Paxos `USDG` (gateRows.ts:81) next to trade 1 in `testUSDG`, two near-identical names, one absent from the caps table. |

## Findings by severity

### High

**FINDING-001: the primary action never finishes.** `Account.tsx:318,348-349`: `checking` is set true and never reset, so after a recheck the hero button stays disabled forever, labelled "Rechecking receipts in your browser" (`r3-recheck-390.png`, button at top), even after every row shows "Receipt verified". There is no summary (3 of 3 verified, or 1 failed) next to the button; results are scattered across the feed, up to 3000px away on mobile. The one action the page exists to offer ends in an indefinite spinner state. Fix: derive a result state from the per-row checks and render "3 of 3 receipts match the chain" (or the failing count, with a jump link) directly under the button; re-enable it as "Recheck again".

**FINDING-002: disabled CTA with no reason (Arbitrum).** `r3-arb-full-1440.png`: zero trades, so the button is disabled at 50% opacity, while the hint beside it still promises "Recomputes each trade's inference receipt". Reads as broken. Fix: when `trades.length === 0`, replace the hint with the reason ("No trade on this account yet, nothing to recheck") or hide the action.

**FINDING-003: stat-card strip plus card stack is the predictable dark-console template.** Four boxed metrics with tracked uppercase mono labels and a big mono number, then every section in its own shadowed card. This hits hard-rejection #7 (app UI made of stacked cards) and the "big numbers with tiny labels" tell, and the user's own UI contract bans stat-grid dashboards, which DESIGN.md:9 currently mandates. Fix: fold the four metrics into the hero as one ruled inline strip (label over value, hairline dividers, no boxes) or into the Policy column; drop `--shadow-card`.

### Medium

**FINDING-004: uppercase transform corrupts tickers and units.** `styles.css:100,136`. "TESTUSDG SPENT, 24 H", "24 H USED". Fix: remove `text-transform` from data-bearing labels, or write the labels in sentence case and keep mono at 12px with no tracking.

**FINDING-005: footer claim not true of the page.** App.tsx:24 says every figure has its block beside it; only the hero does. Either stamp each card head (`Stamp` already exists) or narrow the sentence to "read at block N" once.

**FINDING-006: "1 proposed for approval" misstates state.** The count is cumulative; the only proposal was approved (feed row "Proposal 1 approved"). Fix: show pending proposals ("0 waiting for the owner") or "1 needed owner approval".

**FINDING-007: two USDG tokens, one name in the hero.** Hero says USDG, caps say testUSDG, feed mixes both. Name the token the caps govern in the hero, and mark the Paxos USDG trade row with its full name or address.

**FINDING-008: same address, two spellings.** Feed `short()` on lowercase trace data vs checksummed `HexValue` in Policy. Route feed addresses through `getAddress` before `short()` so one address has one face.

**FINDING-009: right column void and sparse caps table at 1440.** Policy ends ~800px before Activity. Move the caps table into the side column under Policy (it is 2 rows, it fits at 1/3 width), freeing a full-width feed or a shorter page.

**FINDING-010: mobile order and clipping.** Policy below 13 feed rows; caps table clipped at "APPROVE A". At 640px and below, put Policy before Activity and render caps as a per-token key/value list instead of a scrolled table.

**FINDING-011: amber overloaded.** Proposed (needs owner), Revoked and Withdrawn (finished admin actions) share `warn` (Chip.tsx:17-19). Make Revoked/Withdrawn neutral so amber keeps one meaning: waiting on the owner.

**FINDING-012: activity subtitle contradicts content.** "Trades and refusals" while Revoked/Withdrawn rows show, and "Show 27 admin events" implies admin events are hidden. Rename to "Trades, refusals and key changes" or move Revoked/Withdrawn behind the toggle.

### Polish

- Refused rows: drop the duplicated error name from the sub line; show the decoded argument only ("measurement 0xfd34…0149").
- Footer explorer link is mono, subtle, unstyled: it does not read as a link. Use `.link`.
- `.copy` and tx links under 44px touch height on mobile; pad the hit area.
- Hero eyebrow chain chip duplicates the chain switch directly above it ([hero-eyebrow-chip]).
- Hero right column at 1440 has ~170px of dead space above the button (`align-items: end`).
- `TitleBlock` in `Stamp.tsx` has no CSS left in `styles.css` (`titleblock` class unstyled); dead component from the previous design.
- Wordmark concentric-ring mark is generic.

## What r3 got right (vs before-1440)

- Real type system and token layer; no inline hex in components (`styles.css` reads only tokens).
- Status chips always carry a word, never color alone (Chip.tsx:4).
- Focus ring, `::selection`, `color-scheme: dark`, `prefers-reduced-motion`, explicit transition properties: browser surfaces are themed.
- Caps table right-aligned tabular mono numbers; feed rows link every event to its tx.
- No page-level horizontal overflow at 390.

## AI slop read

No purple gradients, no gradient text, no emoji, no 3-column icon grid, no testimonial row. But: near-black canvas with one lavender accent, tracked uppercase mono micro-labels, an eyebrow chip over the headline, four stat cards, everything boxed. Someone given "crypto agent console, dark" would land within a few pixels of this. Not careless slop; template-shaped competence. Grade C.

## Quick wins (under 30 minutes each)

1. FINDING-001: result line under the Recheck button and reset the label.
2. FINDING-002: reason text when there is nothing to recheck.
3. FINDING-004: remove uppercase transform from data labels.
4. FINDING-006 and FINDING-012: two copy fixes in Account.tsx.
5. FINDING-011: Revoked/Withdrawn to neutral tone.

Blind spot: no live browser run in this audit (by instruction); interaction claims come from source plus the supplied screenshots, and hover/focus states and the open Owner controls panel were not observed rendered.

AXES: avg=6.1 min=5.0
