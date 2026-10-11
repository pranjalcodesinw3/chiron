# CHIRON web references

Captured 2026-10-11 with `design-research/tools/refshot-pw.cjs` (Playwright port of ui-craft refshot.py); tokens are computed styles from the live page. Negative reference: `before-1440.png` / `before-390.png` (the shipped page: unstyled dl/table, document flow). The system is `linear.app` from ~/.config/design-md.

## 1. Linear (north star: dark product surface)
Shots: ref-linear-1440.png, ref-linear-390.png, tokens ref-linear-tokens.json. URL https://linear.app
- canvas rgb(8,9,10), ink rgb(247,248,248); h1 64px w510; nav pills radius 9999px
- take: near-black canvas with tiered surfaces and hairlines, light ink, one restrained accent. leave: marketing-scale hero, gradient glows.

## 2. Uniswap explore tokens (data list)
Shots: ref-uniswap-1440.png, ref-uniswap-390.png, tokens ref-uniswap-tokens.json. URL https://app.uniswap.org/explore/tokens
- body Basel 16px; table rows with right-aligned tabular numbers, row hover, token pills
- take: dense rows, right-aligned numerals, hover tier. leave: white canvas, pink accent.

## 3. Blockscout, Robinhood Chain testnet explorer (domain)
Shots: ref-blockscout-1440.png, ref-blockscout-390.png, tokens ref-blockscout-tokens.json. URL https://explorer.testnet.chain.robinhood.com
- h1 Poppins 30px w700; stat cards across the top; tx list with status chips (Success / Failed) and truncated hashes
- take: top stat strip, status chips with text, truncated mono hashes with explorer links. leave: Poppins, white cards.
