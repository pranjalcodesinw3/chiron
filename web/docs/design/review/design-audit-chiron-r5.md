# CHIRON agent-account page: design audit, round 5

Mode: AUDIT ONLY. No source edits, no server, no commits. Evidence: `docs/design/r5-1440.png`, `r5-390.png`, `r5-full-1440.png`, `r5-full-390.png`, `r5-arb-full-1440.png`, `r5-arb-390.png`, `r5-recheck-390.png` (after pressing the primary action), `before-1440.png`, `DESIGN.md`, `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx`, `src/App.tsx`, `src/components/{Chip,GateLog,Stamp}.tsx`, `src/lib/format.ts`, `src/pages/account/gateRows.ts`. Mobile crops were read at native 390px width to confirm small details.

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: C+

Verdict in one line: round 5 closes all seven round-4 Mediums and most of the polish list (refusals decoded into reader units, the served model named beside the pin, a ghost button when there is nothing to recheck, neutral configuration states, no nested cards or decorative shadow, one chip face, DESIGN.md back in step with code); it adds a new signature strip, "The four checks every trade passes", whose structure is strong but whose numbers do not all belong to the check they sit under, and it leaves mobile longer than before, with Activity now about 2300px down.

## First impression

- The page communicates **a working instrument with a thesis**: one claim, one action, then a four-step strip that tries to show the mechanism, then the ledger and the policy that governs it.
- I notice **the new strip turns the summary numbers into a sequence** (`r5-1440.png`): quote, code, caps, receipt, joined by a rail. It is the first element on the page that explains *how* the account refuses, not just *that* it does.
- First three things my eye goes to: **the headline**, **the lavender "Recheck every receipt" button**, **the green "Admitted" chip at step 1**. Intended order. On Arbitrum (`r5-arb-full-1440.png`) the second stop is now the headline's lede and the strip, because the button is a ghost: correct.
- One word: **credible**.

Page area test at 1440: top bar, hero sheet, four-check strip, Activity, Policy with caps, Owner controls, footer. All nameable in under 2 seconds. Trunk test: PASS (site, page, chain via the switch, options). No search, correct for a single-account console.

## Round 4 findings, checked against round 5

| R4 finding | Status in r5 | Evidence |
|---|---|---|
| 001 refused rows dump raw revert data (Medium) | **Fixed, polish residue** | `gateRows.ts:118-122` `fmtArg` truncates hashes and formats amounts: "measurement 0xfd34…0149", "amountIn 10.000001 testUSDG, cap 10.00 testUSDG" (`r5-full-1440.png`). Residue: the cap row now states the amount twice in one line ("10.000001 testUSDG into TSLA · amountIn 10.000001 testUSDG") and leaks the camelCase ABI name `amountIn`. |
| 002 one model, two names (Medium) | **Fixed on RHC, new defect on Arbitrum** | Policy: "meta-llama/llama-3.3-70b-instruct / served as llama3-3-70b"; trade rows: "served by llama3-3-70b (0xc853…df59), accepted under the pin". The link is explicit now. Arbitrum prints "served as phala/qwen3.8-27b-uncensored, phala/qwen3.8-27b-uncensored" (`r5-arb-full-1440.png`): two accepted hashes resolve to the same name and `Account.tsx:140` does not dedupe. See FINDING-002. |
| 003 disabled primary loudest on Arbitrum (Medium) | **Fixed** | `Account.tsx:165` renders `btn btn-ghost` when there is no trade; `r5-arb-390.png` shows an outline button with the reason below. |
| 004 red marks configuration as failure (Medium) | **Fixed** | `Account.tsx:59` "No agent" is neutral; `Account.tsx:244` "None" is neutral (`r5-arb-full-1440.png`). |
| 005 nested cards and decorative shadow (Medium) | **Fixed** | `.sheet` has no shadow (`styles.css:132`); `.hero-action` is a flex column, no box (`styles.css:142`); caps are hairline groups (`styles.css:191`). Shadow survives only on wallet menu and tx toast. Residue: the mobile rule `.hero-action { padding: var(--sp-4) }` (`styles.css:227`) was written for the old box and now insets the button; see FINDING-003. |
| 006 verdict has no route to a failing receipt (Medium) | **Fixed in source, not observed rendered** | `Account.tsx:89-93,175-181`: separate amber "n could not be read" chip and a "Go to the first one that failed" anchor to `#row-<key>`. The observed run verified 3 of 3 (`r5-recheck-390.png`). Residue: when the only problem is an unreadable receipt, the count chip still turns red (`Account.tsx:175`). |
| 007 three chip treatments (Medium) | **Fixed** | `.chip { font-family: var(--font-body) }` at 12px (`styles.css:66`); the verdict chip, step-1 chip and feed chips now share one face and size. |
| Polish: orphan "all" | **Moved, not gone** | The foot is now "4 refused on chain, funds unchanged · 0 / waiting for the owner": the "0" ends one line and its noun starts the next, at 1440 and 390. `text-wrap: pretty` sits on a flex container (`styles.css:155`), where it does not help the anonymous text run. |
| Polish: column heads misaligned | **Fixed** | "Activity" and "Policy" share a baseline at y~697 (`r5-1440.png`). |
| Polish: "Approved code" centered against a list | **Fixed** | `.kv > div { align-items: flex-start }` (`styles.css:185`). |
| Polish: Arbitrum "Agent key: none" at 16px | **Fixed** | Rendered as `.hint` 14px. |
| Polish: awkward withdrawn sub | **Fixed** | "Agents on this code are refused". |
| Polish: touch targets under 44px | **Fixed for coarse pointers** | `@media (pointer: coarse)` lifts `.copy`, `.btn-sm`, `.chainsw a`, `.link-mono` to 44px (`styles.css:239-241`). Not observable in these captures (desktop emulation). |
| Polish: dead `TitleBlock` | **Fixed, replaced by new dead code** | `TitleBlock` is gone; `Num` (`Stamp.tsx:54-61`) has no caller, no `.n` CSS, and a doc comment describing the deleted strip. |
| Polish: wordmark in accent | **Fixed** | `.mark { fill: var(--ink) }` (`styles.css:42`). |
| Polish: DESIGN.md drift | **Fixed** | DESIGN.md now states 20 mono gate values, the 1000px breakpoint, the signature strip and the merged Policy panel. Small residue below. |

Seven of seven Mediums closed or reduced to polish; eleven of twelve polish items closed.

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.0 | Headline, single action, then the four-check strip, then ledger and policy on one shared baseline (`r5-1440.png`). Arbitrum no longer leads with a dead lavender slab. Loses points: the strip is four equal cells, so the one cell that answers the page's question (step 4, receipts) has no more weight than a policy count (step 2); the hero right column is empty from y~270 to y~396 at 1440. |
| Typography | 7.5 | One chip face, sentence-case labels, Archivo wdth 92 with Plex Mono tabular for figures. Loses points: gate values set words in mono ("4 approved", "3 traded", `styles.css:154`), so English reads as terminal output; the block stamp sets its label "Robinhood Chain Testnet, block" in mono while "Account" on the same line is Archivo; "· 0 / waiting for the owner" splits a number from its noun; "Pinned model" wraps to two lines on Arbitrum beside a long value. |
| Color | 8.0 | Configuration states are neutral, red is only refusals and failed checks, amber only Proposed, the accent is on the primary button, focus and selection, the wordmark is ink. Loses points: `PINNED` and `APPROVED CODE` rows still use the lavender `info` chip (`Chip.tsx:24-25`), against DESIGN.md:5 ("admin and configuration states neutral") and spending the accent hue; the step-3 bar at 0% renders as a bare track that reads as a stray hairline under "spent in the last 24 h". |
| Density | 6.5 | Desktop is tighter: no hero-action box, caps as hairline groups. Loses points: mobile grew from 4084px to 4250px (4347px after the recheck) and Activity now starts ~2300px down, below the strip (stacked to ~470px) and the full Policy panel with four code hashes and both cap groups; Arbitrum still leaves ~390px of empty left column under a 3-row feed (feed ends y~937, Policy y~1323). |
| Components | 7.5 | Primary action has idle, running, done, failed-with-link, unreadable and nothing-to-do states. HexValue, Chip, kv and cap patterns reused; nested cards gone. Loses points: the strip rail (`styles.css:150`) runs past node 4 to the right edge and ends on nothing; `Num` is dead code with a stale comment; duplicate rules (`.caps` twice at `styles.css:189-190`, `.ledger-head` twice in the 640px block at 233 and 237). |
| Mobile | 7.0 | Chain switch full width, verdict lands directly under the button after the tap (`r5-recheck-390.png`), strip collapses to a numbered vertical list, Policy before Activity, no clipping. Loses points: the primary button is inset 16px from the headline and lede (x=49 vs x=33, `r5-390.png`) from leftover card padding; Activity is ~2300px down; the 0% bar draws a full-width line inside step 3 that reads as a divider. |
| Consistency | 7.5 | DESIGN.md matches code again; address spelling, chip face, admin tones and model naming are uniform on RHC. Loses points: Proposed rows say "model llama3-3-70b (…)" while trade rows say "served by llama3-3-70b (…), accepted under the pin" (`gateRows.ts:158,172`); Arbitrum repeats the served name; `info` chips contradict the contract; `--fs-40` is a token nothing uses and DESIGN.md's scale omits; `.tx-key` (`styles.css:124`) is uppercase and tracked, against DESIGN.md:8 "never uppercase-transformed". |
| Evidence / clarity | 8.5 | Strongest axis. Pin and served name sit together in Policy and in every trade row; refusals are decoded with their argument in token units; the verdict says where it was computed and can route to a failure; the block stamp and footer claim are literally true. Loses points: the strip puts "4 refused on chain" under step 4 (receipts) though those refusals are step-1 (caller not the agent), step-2 (code not approved) and step-3 (above the cap) failures, so the page's own diagram misfiles its best evidence; the Arbitrum duplicate reads like a rendering bug on the line that answers "which model". |

## Findings by severity

### High

None.

### Medium

**FINDING-001: the four-check strip misfiles the refusals and mixes per-trade checks with account state.** `Account.tsx:191-213`. The heading promises "The four checks every trade passes", but the values are account state (step 2 "4 approved" is a policy count, step 4 "3 traded" is a counter), and the refusal count sits under step 4 though the four refusals in the feed failed at steps 1, 2 and 3 ("Caller is not the admitted agent", "Code the owner has not approved", "Trade above the per-trade cap") plus one owner-side settle. The strip is the page's best idea; it should show, per step, what that step turned away. Fix: put each refusal count under the gate whose error it is (map `REFUSAL_GLOSS` keys to gates 1-4 in `gateRows.ts`), e.g. step 1 "1 refused: caller not the agent", step 3 "1 refused: above the per-trade cap", and keep "funds unchanged" once in the heading foot. Set gate values as Archivo words with only the figure in mono ("**4** approved"), which also resolves the mono-as-costume read.

**FINDING-002: Arbitrum prints the served model twice.** `Account.tsx:138-141` maps every accepted hash to `modelName(h)` and joins without dedupe; two accepted hashes resolve to "phala/qwen3.8-27b-uncensored", so Policy reads "served as phala/qwen3.8-27b-uncensored, phala/qwen3.8-27b-uncensored" (`r5-arb-full-1440.png`). On the line whose job is answering "which model", a repeated string reads as a bug. Fix: `[...new Set(names)]`, and if two hashes share a name, show the count ("served as phala/qwen3.8-27b-uncensored, 2 builds") with the hashes in the `title`.

**FINDING-003: primary button inset 16px on mobile.** `styles.css:227` `.hero-action { padding: var(--sp-4) }` is left over from when the action was a boxed card. Now that the box is gone, the button and its hint start at x=49 while the headline, lede and account row start at x=33 (`r5-390.png`, `r5-arb-390.png`). The first mobile viewport loses its left edge at the one element that matters. Fix: delete the rule; `.hero` already pads.

**FINDING-004: Activity is ~2300px down on mobile.** `r5-full-390.png`: the strip (stacked) plus the whole Policy panel (owner, pinned model, agent key, four code hashes, two cap groups) precede the first ledger row. Round 4 had it at ~1550px. Policy-first was the right call when Policy was short; it no longer is. Fix: under 640px, collapse "Approved code" to a count with a disclosure ("4 approved, show"), and render the cap groups as one line each ("testUSDG 10.00 per trade · 0.00 / 5.00 today · owner above 2.00") so the feed starts near 1400px.

**FINDING-005: lavender chips on configuration rows contradict the contract.** `Chip.tsx:24-25` maps `PINNED` and `APPROVED CODE` to `info` (#8b93e6 on an accent wash). DESIGN.md:5 says configuration states are neutral and DESIGN.md:5 reserves the accent for the primary action and focus. These rows are behind "Show 27 renewals and setup", so not observed rendered; the source is unambiguous. Fix: map both to `neutral`.

### Polish

- Cap refusal sub repeats the amount and leaks `amountIn` (`gateRows.ts:134`): drop error args whose formatted value already appears in `trade`, and gloss arg names ("cap 10.00 testUSDG").
- Proposed rows say "model llama3-3-70b (…)"; trade rows say "served by … accepted under the pin" (`gateRows.ts:172` vs `158`). Use one phrase.
- "· 0 / waiting for the owner": the number is separated from its noun. Join with a non-breaking space or reword to "none waiting for the owner".
- Strip rail runs past node 4 to the right edge (`styles.css:150`, `right: 14px`). End it at the last node's center.
- Step-3 bar at 0% draws an empty full-width track that reads as a divider, worst on mobile. Hide it at 0% or give it a 1px tick at the origin.
- "Pinned model" label wraps on Arbitrum at 1440; `white-space: nowrap` on `.kv dt`.
- Block stamp label is mono, "Account" label beside it is Archivo. Set the stamp's words in the body face, the number in mono.
- Red count chip when the only problem is an unreadable receipt (`Account.tsx:175`): tone `warn` when `verified + unreadable === total`.
- `Num` in `Stamp.tsx:54-61` is dead with a stale doc comment; `.caps` and `.ledger-head` declared twice; `--fs-40` unused.
- `.tx-key` is uppercase with tracking (`styles.css:124`), the one remaining uppercase transform.
- Ghost "Recheck every receipt" on Arbitrum is a full-size control that cannot be enabled on this account. Acceptable; the hint alone would be quieter.

## AI slop read

Gone since r4: the nested hero-action card, nested cap cards, the decorative sheet shadow, the accent on the wordmark, red on configuration states, mixed chip faces. Added: a numbered four-step stepper with circled numerals on a connecting rail, which is the "How it works 1-2-3-4" pattern every generator reaches for. Here it carries live state and is the page's clearest explanation of the mechanism, so it earns more than the template version, but its numbers do not yet line up with its steps (FINDING-001), which is exactly the tell of a structure chosen before its content. Underneath, the look is unchanged: near-black canvas, tiered surfaces, one lavender accent, pill chips with leading dots, a Linear transplant that DESIGN.md:3 names as its source. A reader could still predict it from "dark crypto agent console". Net: three tells removed, one added and half-earned. Grade stays C+.

Litmus: brand unmistakable in first screen YES; one strong anchor YES (headline, then the strip); scannable by headings YES; one job per section YES; cards necessary YES now for sheet and Policy, NO for the Owner controls panel (a disclosure row would do); motion improves hierarchy N/A (hover tints only); premium without shadows YES (no decorative shadow left).

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 80  (+10 claim and single action are obvious)
  Read the strip        80 -> 85  (+5 mechanism shown as four steps, refusals counted)
  Tap Recheck           85 -> 95  (+10 verdict under the button, "Recheck again")
  Look for the trades   95 -> 90  (-5 Activity ~2300px down, below the full Policy)
  Read a refusal        90 -> 90  (decoded in token units, no penalty)
  Compare model names   90 -> 95  (+5 pin and served name side by side)
  FINAL: 95/100 healthy
```

## What r5 got right

- Every round-4 Medium was addressed at its root (`fmtArg`, the served-as line, the ghost state, tone remaps, card removal, `.chip` font), not patched at one call site.
- The strip is the first visual that teaches the product's mechanism; with FINDING-001 fixed it becomes the signature element DESIGN.md:9 says it is.
- DESIGN.md and code agree again, so the next round grades against the truth.
- Compared with `before-1440.png` (unstyled `dl`, broken caps table, uppercase "EXECUTED" links, an unlabelled vertical account rail), this is a different class of page.

## Quick wins (under 30 minutes each)

1. FINDING-003: delete `.hero-action { padding }` in the 640px block.
2. FINDING-002: dedupe `served` in `Account.tsx:140`.
3. FINDING-005: `PINNED` and `APPROVED CODE` to `neutral` in `Chip.tsx`.
4. FINDING-001 (first half): gate values as Archivo words with a mono figure.
5. Polish: end the rail at node 4, hide the 0% bar, non-breaking space in "0 waiting".

Blind spot: no live browser run (by instruction). The recheck failure and unreadable branches, the "Show 27 renewals and setup" expanded feed (where the lavender chips live), the open Owner controls, hover and focus states, and coarse-pointer touch targets were not observed rendered; claims about them come from source.

AXES: avg=7.6 min=6.5
