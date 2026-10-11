# CHIRON agent-account page: design audit, round 4

Mode: AUDIT ONLY. No source edits, no server, no commits. Evidence: `docs/design/r4-1440.png`, `r4-390.png`, `r4-full-1440.png`, `r4-full-390.png`, `r4-arb-full-1440.png`, `r4-arb-390.png`, `r4-recheck-390.png` (after pressing the primary action), `before-1440.png`, `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx`, `src/App.tsx`, `src/components/{Chip,GateLog,ChainSwitch,Stamp}.tsx`, `src/lib/format.ts`, `src/pages/account/gateRows.ts`, `src/chain.ts`.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B-
AI Slop Score: C+

Verdict in one line: round 4 closes every High from round 3 (the primary action now finishes with a verdict next to the button, the disabled state explains itself, the stat boxes are one ruled strip inside the hero sheet), and fixes most Mediums; what is left is a second tier of consistency and clarity debt (three chip faces, two names for one model, raw 64-hex and base-unit dumps in refused rows, red used for deliberate configuration states) inside a layout that still reads as a dark Linear console.

## First impression

- The page communicates **a working instrument**: one claim, one action, a summary strip, a ledger, a policy column. Nothing decorative competes.
- I notice **the hero now carries the whole story above the fold at 1440** (`r4-1440.png`): claim, account, block, action, and the four numbers that prove it, inside one sheet.
- First three things my eye goes to: **the headline**, **the lavender "Recheck every receipt" button**, **the green "Admitted" chip**. Intended order. On Arbitrum (`r4-arb-full-1440.png`) the second stop is a 50% opacity disabled button, which is still the most saturated block on the page.
- One word: **credible**.

Page area test at 1440: top bar, hero sheet, summary strip, Activity, Policy with caps, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS (site, page, chain via the switch, options). No search, correct for a single-account console.

## Round 3 findings, checked against round 4

| R3 finding | Status in r4 | Evidence |
|---|---|---|
| 001 primary action never finishes (High) | **Fixed** | `Account.tsx:155-169`: label cycles "Rechecking n of N" then "Recheck again"; verdict chip "3 of 3 receipts verified" plus "recomputed in this browser from calldata" renders directly under the button (`r4-recheck-390.png`, top). Per-row "Receipt verified" chips on the 4 receipt rows. |
| 002 disabled CTA with no reason (High) | **Fixed, new residue** | Hint reads "No trade on this account yet, so there is no receipt to recheck." (`r4-arb-full-1440.png`). Residue: the disabled button is still the loudest object in the hero (see FINDING-003 below). |
| 003 stat-card strip plus card stack (High) | **Partly fixed** | Stats are now one hairline-divided strip inside `.sheet` (`styles.css:148-150`), no separate boxes. Still four big mono numbers under tiny labels; `--shadow-card` still on `.sheet` (`styles.css:132`); new nesting: `.hero-action` card inside the sheet, `.cap` cards inside the Policy panel (see FINDING-005). |
| 004 uppercase corrupts tickers (Medium) | **Fixed** | Labels are sentence case: "testUSDG spent in 24 h" (`r4-1440.png`). No `text-transform` on data labels. |
| 005 footer claim not true (Medium) | **Fixed** | `App.tsx:24`: "Figures are live chain reads at the block shown under the headline." True of the page. |
| 006 "1 proposed for approval" (Medium) | **Fixed, polish residue** | Now "0 waiting for the owner · 1 proposed in all", correct. Wraps with an orphan "all" at 1440 and 390. |
| 007 two USDG tokens (Medium) | **Fixed** | Hero says "buys TSLA with testUSDG"; the Paxos trade row is labelled "1.00 Paxos USDG into 0.00391 TSLA". Arbitrum hero says "WETH with USDG", matching its caps. |
| 008 same address, two spellings (Medium) | **Fixed** | `format.ts:4-7` checksums before truncating; feed and Policy both show `0x2aD1…5DEF`. |
| 009 right column void at 1440 (Medium) | **Mostly fixed** | Caps moved into the side panel as per-token key/value blocks. Residual void: RHC side ends ~y1308 vs feed ~y1575; Arbitrum flips it, feed ends ~y855 while Policy runs to ~y1216. The side is sticky, so the void is less felt while scrolling. |
| 010 mobile order and clipping (Medium) | **Fixed** | Policy and caps render before Activity under 1000px (`styles.css:214`); caps are key/value, nothing clipped (`r4-full-390.png`). |
| 011 amber overloaded (Medium) | **Fixed** | `Chip.tsx:20-23`: Revoked, Withdrawn, Rejected, Cancelled are neutral. Amber now means only Proposed. |
| 012 activity subtitle contradicts content (Medium) | **Fixed** | "Trades, refusals and key changes, newest first"; toggle reads "Show 27 renewals and setup". |
| Polish: refused rows repeat the error name | **Open** | `gateRows.ts:114` still appends `${name}(${args})`; see FINDING-001. |
| Polish: footer link not styled as a link | **Fixed** | `.link` underline on both footer links. |
| Polish: copy and tx touch targets under 44px | **Open** | `.copy` 24px tall, `.btn-sm` 28px, `.chainsw a` 28px, `.link-mono` ~24px. |
| Polish: hero eyebrow chain chip | **Fixed** | Removed. Chain now named in the switch, the block stamp and the footer. |
| Polish: hero dead space above the button | **Fixed** | `.hero` aligns start; the action sits at the top of its column. |
| Polish: dead `TitleBlock` component | **Open** | `Stamp.tsx:55` still exports it; no `.titleblock` CSS and no caller. |
| Polish: generic wordmark | **Changed** | New "H" bar mark, painted in `--accent`, which DESIGN.md:7 reserves for the primary action and focus. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 7.5 | Headline, then the single primary action, then the summary strip, then the ledger (`r4-1440.png`). Stat values dropped from 40px to 28px (`styles.css:152`), so "Activity" and "Policy" (20px) no longer read as captions under the numbers. Loses points: on Arbitrum the disabled lavender button outranks everything with real content; the two column heads do not share a top line ("Activity" at y~594, "Policy" at y~619 inside panel padding). |
| Typography | 7.0 | Archivo wdth 92 plus IBM Plex Mono with tabular numerals is a committed choice; uppercase tracking is gone from data labels. Loses points: three chip treatments (feed chips Archivo 12px, verdict chip Archivo 14px, stat chips "Admitted"/"No agent" in Plex Mono 14px because `.stat-value` sets mono, `styles.css:152-153`); 12px remains the size of every hash, tx link, time, stamp and copy button; orphaned "all" under "Trades executed"; refused-row subs set an unbroken 64-character hex in 14px Archivo that wraps across two lines at 1440 and three at 390. |
| Color | 7.0 | Token-only, amber now has one meaning, the spend bar is ink not accent (`styles.css:155`), chips always carry a word. Loses points: red marks deliberate configuration states as failures on Arbitrum ("No agent" stat chip, "Approved code: None" chip) next to genuine refusals; the disabled primary keeps a 50% lavender fill; the wordmark spends the accent outside the DESIGN.md reservation. |
| Density | 6.5 | Feed rows tightened to ~70px for one-line events, caps fit the side column. Loses points: the Arbitrum layout leaves ~360px of empty left column under a 3-row feed; refused rows grow to ~90px (1440) and ~150px (390) because of raw argument dumps; mobile is still 4084px tall for 13 events, with Activity starting ~1550px down. |
| Components | 7.0 | The primary button now has idle, running ("Rechecking n of N"), done ("Recheck again" plus verdict) and disabled-with-reason states. HexValue, Chip, kv and cap patterns are reused. Loses points: nested cards (`.hero-action` inside `.sheet`, `.cap` inside `.panel`); verdict has no path to a failing row; touch targets 24-28px; `TitleBlock` dead code. |
| Mobile | 7.0 | Chain switch drops to a full-width row, CTA is full width, verdict appears directly under the button after the tap (`r4-recheck-390.png`), Policy before Activity, no clipping, no page-level horizontal scroll. Loses points: touch targets; length; raw hex wrapping three lines in refused rows; the stats strip at 390 sets "Admitted" in mono at 14px beside 20px values. |
| Consistency | 6.5 | Address spelling, admin tones, footer layout and label casing are now uniform across chains. Loses points: the model has two names (Policy "meta-llama/llama-3.3-70b-instruct", every feed row "model llama3-3-70b (0xc853…df59)") with nothing saying they are the same model; three chip faces; refused rows mix formatted amounts in the clause ("10.000001 testUSDG") with base units in the same line ("amountIn 10000001, cap 10000000"); DESIGN.md has drifted from code (metrics "40 mono" vs 28px, "one column under 900px" vs the 1000px breakpoint, "4-up metric strip" and "policy cards" vs the ruled strip and the merged Policy panel). |
| Evidence / clarity | 8.0 | Strongest axis. The recheck verdict now lives beside the action and says where it was computed; per-row receipt chips; block stamp under the headline; every row links its tx; refusals are enumerated with their revert reason; the footer claim is now literally true. Loses points: refused rows restate the title as a raw revert dump; the two model names make "which model traded" harder to answer on the page whose whole point is answering it. |

## Findings by severity

### High

None. All three round-3 Highs are closed.

### Medium

**FINDING-001: refused rows dump raw revert data that restates the title.** `gateRows.ts:114`. "Code the owner has not approved" is followed by `MeasurementNotApproved(measurement 0xfd34caabef222327146cb5c059810f08bf7c41adb6cc48312be21cc228020149)`; "Trade above the per-trade cap" by `ExceedsPerTradeCap(amountIn 10000001, cap 10000000)` in base units right after the formatted "10.000001 testUSDG". The title already decodes the error; the sub should carry only what the title lacks. Fix: shorten hashes with `short()` and format amounts with the token's decimals ("measurement 0xfd34…0149", "cap 10.00 testUSDG"); keep the raw error name in the chip `title` attribute for anyone who wants it.

**FINDING-002: one model, two names.** Policy pins `meta-llama/llama-3.3-70b-instruct` (`Account.tsx:202`); every trade row says `model llama3-3-70b (0xc853…df59)` (`gateRows.ts:46`, ids from `chain.ts:98`). The page's thesis is "every trade records the model that decided it", and a reader cannot tell from the page that the served id satisfies the pin. Fix: in trade rows, render "model matches pin" (or the pinned display name) with the served id as secondary text, or show both ids once in Policy ("Pinned model … served as llama3-3-70b").

**FINDING-003: disabled primary is still the loudest object on Arbitrum.** `r4-arb-full-1440.png`, `r4-arb-390.png`. `.btn:disabled` is 50% opacity (`styles.css:54`), so a muddy lavender slab with low-contrast text leads the hero on a chain with nothing to recheck. Fix: when `nothing` is true, render the hint alone or a ghost button; the accent fill should appear only when the action can run.

**FINDING-004: red marks configuration as failure.** On Arbitrum "No agent" (`Account.tsx:59`, tone `bad`) and "Approved code: None" (`Account.tsx:206`, tone `bad`) share the red of genuine refusals. A revoked agent is the owner's deliberate, safe state. Fix: neutral tone for both; keep red for refused calls and failed receipt checks.

**FINDING-005: nested cards and a decorative shadow keep the stacked-card read.** `.hero-action` (surface-2 card with border, `styles.css:142`) sits inside `.sheet`; `.cap` cards (`styles.css:189`) sit inside the Policy `.panel`; `.sheet` carries `--shadow-card` (0 8px 24px on #08090a, invisible except as intent). Fix: drop the hero-action box (button plus hint on the sheet surface is enough), render caps as hairline-separated groups inside the panel, remove the sheet shadow. Shadows on the wallet menu and tx toast are real elevation and stay.

**FINDING-006: verdict has no route to a failing receipt, and errors read as mismatches.** `Account.tsx:87-89,160`: a query that errors counts as done-but-not-verified, so an RPC timeout and a receipt that does not match the chain both produce the same red "2 of 3 receipts verified". On mobile the failing row can be 2000px below the verdict. Not observed rendered (the run verified 3 of 3). Fix: split the count ("2 verified, 1 could not be read"), and make the verdict a link that scrolls to the first non-verified row.

**FINDING-007: three chip treatments.** Feed chips Archivo 12px, verdict chip Archivo 14px, stat chips Plex Mono 14px (inherited from `.stat-value`). Fix: set `font-family: var(--font-body)` on `.chip` so the face never inherits, and pick one size for chips that carry state.

### Polish

- Orphan "all" under "Trades executed" at 1440 and 390: shorten to "0 waiting · 1 proposed" or add `text-wrap: pretty` to `.stat-foot`.
- Column heads misaligned at 1440: "Activity" sits ~25px above "Policy". Either put the ledger head on the same panel padding or pull the Policy heading out of the panel.
- "Approved code" label is vertically centered against a 4-row list (`.kv > div { align-items: center }`); align to the first row.
- Arbitrum Policy "Agent key: none" renders in 16px Archivo ink, larger than every other value in that list.
- Withdrawn sub "An agent running it is turned away" reads awkwardly; "Agents on this code are refused" is plainer.
- Touch targets: `.copy` 24px, `.btn-sm` 28px, `.chainsw a` 28px, `.link-mono` ~24px. Pad the hit area to 44px on coarse pointers.
- `TitleBlock` in `Stamp.tsx:55` is dead code.
- Wordmark mark uses `--accent`; DESIGN.md:7 reserves it for the primary action and focus.
- DESIGN.md drift: metrics size, breakpoint and layout description no longer match code; update the doc so the next round grades against the truth.

## AI slop read

Gone since r3: the eyebrow chip, uppercase tracked micro-labels, four boxed stat cards, accent on a progress bar, amber on finished admin events. Present: near-black canvas with one lavender accent (a direct Linear transplant, by DESIGN.md's own admission), a 4-up big-number strip, pill chips with leading dots on every status, nested rounded cards in the side column. Nothing here is careless and the content is specific and real, which is the opposite of slop. But the look is still the one a reader would predict from "dark crypto agent console", so it does not reach B. Grade C+, up from C.

Litmus: brand unmistakable in first screen YES (claim plus account plus chain); one strong anchor YES (headline); scannable by headings YES; one job per section YES; cards necessary NO (hero-action and cap cards are not interactions); motion improves hierarchy N/A (hover tints only); premium without shadows YES (the one decorative shadow is invisible already).

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action are obvious)
  Read stats            80 -> 85  (+5 upfront: refusals counted, funds unchanged)
  Tap Recheck           85 -> 95  (+10 verdict appears under the button, "Recheck again")
  Scroll to a refusal   95 -> 90  (-5 raw 64-hex dump to decode)
  Compare model names   90 -> 85  (-5 pinned id and served id differ, unexplained)
  FINAL: 85/100 healthy
```

## What r4 got right

- The single action is now a complete loop: run, progress, verdict in place, rerun.
- Every round-3 consistency bug in data presentation is gone (checksummed addresses, token names, sentence-case labels, neutral admin tones).
- Mobile now makes design sense: policy and caps first as compact key/value, the result of the tap appears where the thumb is.
- The footer stopped overclaiming.
- Compared with `before-1440.png` (unstyled `dl`, broken caps table, unlabelled vertical account rail), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-001: `short()` and `fmtToken()` on revert args in `gateRows.ts:114`.
2. FINDING-004: neutral tone for "No agent" and "None".
3. FINDING-007: `.chip { font-family: var(--font-body) }`.
4. FINDING-003: ghost or hidden button when there is nothing to recheck.
5. FINDING-005: delete the `.sheet` shadow and the `.hero-action` box styling.

Blind spot: no live browser run (by instruction). The failure branch of the recheck verdict, hover and focus states, the open Owner controls panel, and the "Show 27 renewals and setup" expanded feed were not observed rendered; claims about them come from source.

AXES: avg=7.1 min=6.5
