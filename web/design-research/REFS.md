# CHIRON web v3 research references (captured 2026-10-11 21:55-22:40 IST)

Capture: `design-research/tools/refshot-pw.cjs` (Playwright port of ui-craft `scripts/refshot.py`, same junk refusals and TOKENS_JS; copied from the LEASH research). Tokens: `refs/<name>-1440.tokens.json`. coingecko.com and dune.com returned Cloudflare challenges and were refused by the capture script, so they are not listed. Viewed as PNGs and as `design-research/contact-sheet.png`.
North star: Linear (system `linear.app` in ~/.config/design-md). Secondaries: Uniswap explore, Blockscout (Robinhood Chain explorer), GitHub Status.
Negative: `negative/chiron-v2-before-1440.png` (the shipped page: unstyled dl pairs, bare caps table, status as words) plus the older `negative/home-*` and `negative/refusal-*`.

## Linear: home (north star)
Screen: linear.app hero over a product screenshot. Measured: canvas rgb(8,9,10), ink rgb(247,248,248), h1 Inter Variable 64px weight 510; nav pills 9999px radius, 13px labels. Move worth stealing: near-black canvas with two or three surface tiers and 1px hairlines carrying all structure; type does the hierarchy, color is rationed. Do NOT take: the marketing-scale 64px hero, the product-shot glow, Inter as the face.
PNG: refs/linear-1440.png, refs/linear-390.png

## Uniswap: explore tokens (secondary, data list)
Screen: app.uniswap.org/explore/tokens, a ranked token table. Measured: body Basel 16px on rgb(255,255,255); rows ~64px tall with right-aligned tabular prices and colored percentage deltas. Move worth stealing: dense rows, numbers right-aligned, a hover tier per row, the status (delta) in color plus sign so it does not rely on color alone. Do NOT take: the white canvas, pink accent, sparkline column.
PNG: refs/uniswap-1440.png, refs/uniswap-390.png

## Blockscout: Robinhood Chain testnet explorer (secondary, domain)
Screen: explorer.testnet.chain.robinhood.com home. Measured: h1 Poppins 30px weight 700, body Inter 16px rgba(16,17,18,.8), buttons 4px radius, stat tiles across the top (blocks, txns, gas). Move worth stealing: a top strip of live chain facts, then a tx list with Success / Failed chips and middle-truncated hashes linking out. This is where our links land, so our rows should read the same way. Do NOT take: Poppins, white cards, the ad slot.
PNG: refs/blockscout-1440.png, refs/blockscout-390.png

## GitHub Status: component status board (secondary)
Screen: githubstatus.com. Measured: body 14px on rgb(246,248,250), ink rgb(36,41,46); a full-width green "All Systems Operational" banner, then one row per component with a check icon and a 90-day uptime bar. Move worth stealing: one row per check, each with its live state, and history of failures per row; that is our four-check strip (state plus how many were refused at that step). Do NOT take: the illustration header, the 90 tiny bars, square 0px buttons.
PNG: refs/githubstatus-1440.png, refs/githubstatus-390.png

## Revoke.cash: allowance manager (domain)
Screen: revoke.cash home. Measured: h1 outfitRevoke 60px weight 600 leading 75px, body 16px on white, buttons 4px radius; a mock approvals panel on the right listing tokens with amounts and "Revoke" actions. Move worth stealing: an allowance is shown as token, amount and one action per row; the genre's promise ("see what can spend your tokens") is CHIRON's caps panel. Do NOT take: the yellow highlight on the headline, white canvas, testimonial strip.
PNG: refs/revoke-1440.png, refs/revoke-390.png

## Safe{Wallet}: welcome (domain, account with owners)
Screen: app.safe.global/welcome, a centered sign-in card on a dark canvas. Measured: buttons 14px, 12px radius, padding 0 16px; body 16px rgb(18,19,18) inside the card. Move worth stealing: a smart account presented by owner, threshold and policy, with one primary button per card. Do NOT take: the centered single-card layout for a data page, the green, the 12px radius (ours is 10).
PNG: refs/safe-1440.png, refs/safe-390.png

## Raycast: home (tone)
Screen: raycast.com hero. Measured: body 16px white on rgb(7,8,10), h1 Inter 64px weight 600 leading 70.4px, primary button rgb(230,230,230) 14px, 8px radius, padding 8px 12px. Move worth stealing: one light button on a near-black canvas is enough contrast to be the only action; hairline chrome. Do NOT take: the red diagonal light streaks, the 64px hero.
PNG: refs/raycast-1440.png, refs/raycast-390.png

## Sentry: welcome (tone, negative-leaning)
Screen: sentry.io/welcome. Measured: h1 Dammit Sans 88px weight 700 leading 105.6px on rgb(31,22,51); nav labels uppercase 14px; buttons 8px radius padding 12px 16px. Move worth stealing: almost nothing for layout; kept as the reminder of what a dark dev-tool page looks like when it leans on a mascot, purple and an 88px display. Do NOT take: purple canvas, uppercase nav, illustration.
PNG: refs/sentry-1440.png, refs/sentry-390.png

## Hyperliquid: trade (domain, dense trading UI)
Screen: app.hyperliquid.xyz/trade. Measured: body 16px white on rgb(48,48,48) panels; Connect button rgb(80,210,193) 12px, 8px radius, padding 0 16px; order book rows ~20px with mono-style tabular numbers in green and red. Move worth stealing: a single saturated accent reserved for the one action, red and green only for side/state, numbers tabular. Do NOT take: the chart-first density, the teal, 12px labels as body.
PNG: refs/hyperliquid-1440.png, refs/hyperliquid-390.png

## Aave: markets dashboard (domain, metrics strip)
Screen: app.aave.com Core market. Measured: body 14px black on rgb(250,250,250), buttons 8px radius; a row of summary figures (Total market size $32.41B, Total available, Total borrows) above an asset table with right-aligned figures. Move worth stealing: summary figures as large numbers with small labels above the table, table columns right-aligned. Do NOT take: the light canvas, the cookie modal, 14px body.
PNG: refs/aave-1440.png, refs/aave-390.png
