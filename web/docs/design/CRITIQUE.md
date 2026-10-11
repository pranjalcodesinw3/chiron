# CHIRON web critique log (critic: gstack /design-review, an independent `claude -p` audit-only run per round; reports in docs/design/review/)

Shots per round: docs/design/rN-{1440,390}.png (viewport), rN-full-*, rN-arb-* (Arbitrum), rN-recheck-390.png (after the primary action). Before: before-*.png (local build) and before-live-*.png (chiron-receipts.vercel.app as deployed).

## Before (self-critique)
The page rendered as a document: unstyled dl/dt pairs, a bare caps table with no padding, trade rows as plain underlined text, status as words ("EXECUTED", "open"), no metrics, no surfaces, sub-12px text in 20 nodes. The stylesheet no longer matched the component class names after the single-page rework.

## r1 (self-critique)
Hero card with one primary action, 4-up metric cards, two columns. Activity drowned in 27 daily "Admitted" key renewals; caps table clipped inside the 1/3 side column (Held column cut).
Fixes: hide renewals and setup behind a ghost toggle; caps moved full width.

## r2 (self-critique)
Trades and refusals now lead the feed with colored chips. Mobile: long revert data and the toggle ran off the card edge. Fixes: min-width 0 and overflow-wrap on the feed; header stack on phones.

## r3 (critic) Design C+, Slop C, avg 6.1 min 5.0. review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r3.md
Top issues: primary action never finished; disabled CTA with no reason on Arbitrum; stat-card strip plus card stack template; uppercase labels mangling tickers; footer overclaim; amber overloaded; address spelled two ways.

## r4 (critic) Design B-, Slop C+, avg 7.1 min 6.5. review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r4.md
Fixed the three Highs (action states, reason text, stat strip folded into the sheet). Open: raw revert args, model named two ways, nested cards, chip faces.

## r5 (critic) Design B, Slop C+, avg 7.6 min 6.5. review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r5.md
Added the four-check strip; critic: refusals not mapped to the steps, served model printed twice, mobile button inset.

## r6 (critic) Design B, Slop B-, avg 7.6 min 6.0. review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r6.md
Refusals now counted under the check whose custom error raised them; accent follows the network (RHC lime, Arbitrum blue). Critic: mobile strip grid broke, red numerals, lime vs green success clash.

## r7 (critic) Design B+, Slop B-, avg 8.1 min 7.0. review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r7.md
Mobile strip fixed, neutral numerals, mint success token, caps one row per token on phones, chain words in Archivo. Remaining (logged, not fixed this round): first trade ~2,100px down on phones (Policy before Activity), red wash on refused rows, accent top rule on the sheet, small CSS duplicates.

FINAL: 8.1 min=7.0 round=7 critic=design-review review=/Users/kamal/Desktop/solana/cwf/ethereum/projects/chiron/web/docs/design/review/design-audit-chiron-r7.md
