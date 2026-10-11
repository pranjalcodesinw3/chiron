# CHIRON agent-account page: design audit, round 16

Mode: AUDIT ONLY. No source edits, no server, no commits, no browser run (by instruction). Evidence: `docs/design/r16-1440.png`, `r16-390.png`, `r16-full-1440.png`, `r16-full-390.png`, `r16-arb-1440.png`, `r16-arb-390.png`, `r16-arb-full-390.png`, plus 1:1 crops of the 390 chart (y 1,450-2,150) and the 1440 chart (x 130-1,310, y 880-1,260). Code read: `git diff fbc86d6..HEAD` over `src/`, `design-research/tools/contrast.cjs`, `DESIGN.md` and `docs/design/DESIGN-CONTRACT.md` (commits `422d4be` r15 and `30985cc`), `src/tokens.css`, `src/styles.css`, `src/pages/Account.tsx:155-200`, `src/components/{CapRuler,GateLog}.tsx`, `src/pages/account/gateRows.ts:170-196`, `docs/design/contrast-r15.txt`. Phone Activity heading positions measured with the same pixel scan as r9-r14 (bright heading text in x 16-110 of the full 390 capture). There is no r16 768 capture, so the tablet width is not graded this round. Previous report: `design-audit-chiron-r14.md` (checked below; r15 had no critic report of its own, so r15 and r16 changes are judged together).

Classifier: OPERATE (app UI, one account console). App UI rules apply.

Design Score: B
AI Slop Score: B

Verdict in one line: this round closes every r14 Medium in substance. The chip is a pill again on phones. The phone attempt list really is one line per call now, so the contract sentence is finally true. Feed rows carry the chart's mark number, which means a phone reader can get from a mark to its refusal reason. And the contrast control goes red on the non-text lines. What keeps it at B: the new mark disc sits on the same feed row as two older numbering systems ("4" next to "Proposal 1 approved" over "Trade 2"). The hero has not changed in four rounds (wrapped label, empty right column, "spent." orphan on phones). The boundary marks still sit on the lines they crossed. B, upper end.

## First impression

- The page communicates **"3 trades went through, 4 calls were refused, 3 of those asked for 15.000001 testUSDG and none of it was spent"**. Unchanged (`r16-1440.png` y~195-320).
- I notice **the phone chip is a chip again**: "4 calls refused" is a content-width pill at `r16-390.png` y~362-384, x 34-141, and "1 call refused" on Arbitrum. It now matches the chip in the strip and the feed.
- I notice **the phone attempt list reads like a ledger**: five rows of disc, mono amount, one outcome word, each on one line (`r16-full-390.png` crop y~1,825-1,955). This is the best the phone chart has looked across sixteen rounds.
- I notice **the feed row for mark 4 carries three numbers**: disc "4", title "Proposal 1 approved: 2.000001 testUSDG into 0.007944 TSLA", sub line "Trade 2 · served by llama3-3-70b…" (`r16-full-1440.png` y~1,930-1,965). Each number is correct and each counts something different, but the row asks me to work out which number to trust.
- First three things my eye goes to at 1440: **the "3"**, **the lime "Recheck every receipt" slab**, **the bold 28px headline**. Red chip fourth, the same as r10-r14. At 390: the "3", the bold headline, then the lime button. With the bar bug fixed, the chip drops back to fourth on phones too.
- One word: **reconciled**.

Page area test at 1440: top bar, hero (metric + action), four checks, caps chart with list, Activity, Policy, Owner controls, footer. I can name each one in under 2 seconds. Trunk test: PASS at both widths.

## Round 14 findings, checked against r15/r16

| R14 finding | Status | Evidence |
|---|---|---|
| 001 phone rule stretches the shared Chip into a full-width bar (Medium) | **Fixed** | `styles.css:284` is now `.lead-sub > span:not(.chip) { flex-basis: 100% }`. Rendered at `r16-390.png` y~362-384 (content width, ~107px) and `r16-arb-390.png` "1 call refused". The fix is the one-selector change r14 named. |
| 002 phone Activity ~193px lower; "one line per call" false (Medium) | **Fixed for the claim, partly for the distance** | Under 560px the outcome word is now `SHORT[kind]` with no edge clause (`CapRuler.tsx:14`, `:103`). The zone key is "runs ≤ 2.00 / owner ≤ 10.00 / reverts above" on one line (`:96`). All five list items are one line at 390 (crop y~1,825-1,955), so `DESIGN.md:21` and the `CapRuler.tsx:45` comment now match the render. Phone Activity heading moved from 2,104 to **2,014px** (-90). That is still ~104px below r13's 1,910. Arbitrum moved from 1,828 to **1,805px**. |
| 003 non-text contrast control cannot fail; missing element passes silently (Medium) | **Mostly fixed** | `contrast.cjs:52` applies `inject` to the non-text page. `contrast-r15.txt` commits a control run (`--warn-wash` at 0.9) where "amber line on approval zone" 1.21, "red mark on approval zone" 1.43 and "mint ring on approval zone" 1.11 all print FAIL ("AA: 5 failures"). A missing foreground element now prints `element missing FAIL` (`:64-66`). Still open: a missing **zone** rect still falls back to bare `--surface-1` through `zone()` (`:61`) and passes silently. Mark numerals, `.mk-more` and the new feed discs are not in the non-text set. No r16 run is committed (the r15 run predates `30985cc`, which only touched copy and a class name, so the risk is low). |
| 004 phone refusal reason only in Activity, nothing maps mark to feed row (Medium) | **Fixed for the mapping, new collision created** | `markNumbers()` (`CapRuler.tsx:134-139`) feeds `GateLog` (`GateLog.tsx:29`). Each lead-token row now shows the chart disc in its title: "5 Caller is not the admitted agent", "3 Trade above the per-trade cap", "1 Proposal already settled" (`r16-full-1440.png` y~1,262, 1,650, 1,762; same on 390). The contract's new clause, "the reason is on the Activity row carrying the same number", is true. But "Trade n" (`gateRows.ts:174`) and "Proposal n" (`:173`, `:189`) still sit on the same rows. See FINDING-001. |
| Polish: "+k" reaches into lane above; no render test | **Not fixed** | `CapRuler.test.ts` still tests `groupMarks` geometry only; no capture contains a grouped mark. |
| Polish: revoke-then-readmit untested; `currentAdmission` called twice | **Not fixed** | `Account.tsx:161-162` still calls it twice. |
| Polish: "spent." orphan at 390 | **Not fixed** | `r16-390.png` y~413-425: "…none of it / spent." |
| Polish: hero label wraps at 1440; empty right column | **Not fixed** | `r16-1440.png` y~228-280: "trades the agent executed inside the / owner's caps", line two hangs ~30px under the numeral. ~290px of empty column under the recheck hint (y~280-560). |
| Polish: boundary marks on threshold lines (since r8) | **Not fixed** | Mark 4 is split by the amber dashed line and mark 3 is centered on the red cap line at 1440 (chart crop x~222, x~876) and at 390 (crop x~98, x~269). |
| Polish: "asked for" counts the owner's `approveTrade()` | **Not fixed** | Mark 1 ("proposal already settled", `approveTrade()` from the owner) is still in the 3 and the 15.000001. |
| Polish: mixed scope ("3" counts Paxos USDG) | **Not fixed** | Feed row "1.00 Paxos USDG into 0.00391 TSLA · Trade 3" has no disc (`r16-full-1440.png` y~1,207). The missing disc does make the scope difference visible now, which helps. |
| Polish: daily cap absent from chart | **Not fixed** | Zones still split at 2.00 and 10.00; Policy shows 5.00 a day. |
| Polish: Arbitrum "0" headline, empty column | **Unchanged** | `r16-arb-390.png`. The empty chart has an honest line ("No trade attempt on USDG yet; the zones show what the contract would do"), and that is a good empty state. |
| Polish: trust link and revoke line share one underline style | **Not fixed** | `r16-1440.png` y~158 vs `r16-arb-390.png` trust line. |
| Polish: `DESIGN.md` / `DESIGN-CONTRACT.md` duplicated | **Not fixed** | Both edited by hand again in `422d4be`; `cmp` reports identical. |
| Polish: `CapRuler.test.ts:13` default string sort | **Not fixed** | `.sort()` on numbers. |
| Polish: contrast and overlap tools on Playwright | **Not fixed** | `contrast.cjs` still drives headless Chromium. |

## Brief compliance (Web3-grade rules)

| Rule | Delivered | Gap |
|---|---|---|
| (1) Lead with the primary metric | The 64/48px figure leads on both chains at every width. | "3" mixes tokens; on Arbitrum an empty account is a 48px "0". |
| (2) Every number states what it means | Hero clauses, per-check refusal counts, numbered list at every width, and now the feed carries the mark number, so every mark reconciles to its reason. | Three numbering systems on one row (FINDING-001). On phones the list says "10.000001 refused" without "0.000001 over the cap"; the reader has to do the subtraction. |
| (3) Semantic colors plus one accent | Four tones plus the network accent. The chip has one shape at every width again. The disc colors are the same in the chart, the list and the feed. | Discs (canvas ink on mint/red) and "+k" are still outside the contrast pass. |
| (4) Plain-language summary before every signed action | Five `.sign-summary` blocks, unchanged since r10. `.prose` renamed `.body-copy` (`30985cc`). | Still not observed rendered: Owner controls collapsed, no wallet connected in any capture. |
| (5) Trust signals | Network badge with chain id, admission link with UTC time, block stamp, explorer link and time on every row. | Unchanged. |

## Axes (0-10)

| Axis | Score | Evidence |
|---|---|---|
| Hierarchy | 8.5 | Unchanged at 1440: figure, lime action, headline, then chip. The 52-character label still wraps under a 34ch cap, and ~290px of right column sits empty. On phones the chip returns to its proper weight. |
| Typography | 8.5 | Unchanged. Every size is a token. Phone list rows are mono amount plus a 14px word on one baseline, which is clean. Losses: "spent." orphan at 390 for the third round; hanging label line at 1440. |
| Color | 8.5 | Unchanged. Disc tones are consistent across chart, list and feed. No glow, no gradient. |
| Density | 7.0 | Up from 6.5. Phone Activity at 2,014px (r14 2,104, r13 1,910), Arbitrum 1,805 (r14 1,828), with the same scan on each. The list now costs five single lines. The hero still spends a line per clause, and the four-check strip on phones runs ~430px. |
| Components | 8.0 | Up from 7.5. The Chip keeps one shape. The `.an` disc is reused in the feed without a new style (only `.feed-mark` spacing). `markNumbers` and `chartAttempts` share one filter, so chart and feed cannot drift. Losses: no test for `markNumbers`; "+k" still unrendered and untested; the disc in the feed has no accessible name (FINDING-003). |
| Mobile | 8.0 | Up from 7.5. One-line list, content-width chip, one-line zone key, mark discs in the feed. Losses: the edge distance is gone on phones; marks 3 and 4 still sit on their lines; "spent." orphan; Activity still ~100px lower than r13. |
| Consistency | 7.5 | Unchanged score, different reasons. Gains: contract, comment and render now agree on "one line per call" and "the reason is on the Activity row carrying the same number". Losses: one row carries disc "4", "Proposal 1" and "Trade 2" (FINDING-001). The zone vocabulary changes by width: "executes / owner approves / reverts" at 1440, "runs / owner / reverts above" at 390 (FINDING-002). `DESIGN.md` and `DESIGN-CONTRACT.md` are still hand-synced copies. |
| Evidence / clarity | 8.5 | Up from 8.0. The non-text control now goes red (three lines FAIL in `contrast-r15.txt`), and missing foreground elements fail. Losses: missing zone rects still fall back silently, discs and "+k" are unmeasured, `markNumbers` has no test, and no r16 contrast run is committed. |

## Findings by severity

### High

None.

### Medium

**FINDING-001: feed rows now carry three numbering systems at once.** The r15 disc is the right fix for r14 FINDING-004, but it lands beside the two numbers it was meant to replace. Row at `r16-full-1440.png` y~1,930-1,965: disc **4**, title "**Proposal 1** approved: 2.000001 testUSDG into 0.007944 TSLA", sub "**Trade 2** · served by llama3-3-70b". Row at y~1,700-1,730: disc **2**, sub "**Trade 1**". The proposal row above (y~1,595) reads "Proposal 1: 2.000001 testUSDG above the approval line" with no disc, because PROPOSED rows are excluded from the chart (`CapRuler.tsx:131`). That exclusion is correct, but it means "Proposal 1" and mark "4" name the same trade from two rows. A reader who sees "2" in a disc and "Trade 1" on the same line will reasonably think one of them is wrong. Fix: keep the disc as the only visible ordinal on lead-token rows. Move the onchain ids into the mono metadata as ids rather than ordinals ("trade id 2", "proposal id 1"), or into the tx column's tooltip-free sub line. Keep "Proposal n" in the title only on rows with no disc. Then verify at 390 and 1440 that no row shows two bare small integers.

**FINDING-002: the phone zone key changed the chart's vocabulary.** At 1440 the zones are labelled "executes", "owner approves", "reverts" (chart crop y~186), and the list says "executed", "executed after owner approval", "refused". At 390 the key reads "runs ≤ 2.00", "owner ≤ 10.00", "reverts above" (`CapRuler.tsx:96`), and the list says "owner approved". "Runs" appears nowhere else on the page. "Owner ≤ 10.00" drops the verb, so it reads as a limit on the owner. "Reverts above" has no number, although the cap label sits just above it. The line got shorter by renaming things, not by removing them. Fix: "executes ≤ 2.00 · owner approves ≤ 10.00 · reverts" fits 358px at 14px Archivo semi-condensed. If it does not fit, drop the "≤ n" values, since the ticks and line labels already carry them, and keep the three canonical words.

**FINDING-003: the feed disc has no accessible name and joins the title text.** `GateLog.tsx:29` renders `<span class="an … feed-mark" title="Mark 5 on the caps chart">5</span>Caller is not…`. Unlike the chart list (`aria-hidden="true"`, with the amount next to it), this disc is read aloud. Assistive tech gets "5Caller is not the admitted agent", or "5 Caller…" depending on whitespace handling. The `title` explanation is hover-only, so it is invisible on touch, and nothing on the row tells a sighted phone reader that the red "5" refers to the chart. Rule (2) says every number states what it means. Fix: `aria-hidden` on the disc plus a visually hidden "Chart mark 5:" before the title. Add one visible cue for sighted readers: the Activity sub line under the heading could say "numbered rows match the caps chart". Also add the discs (canvas ink on `--ok`/`--bad`, and `--ok` ring on `--canvas`) to the contrast pass.

### Polish

- Phone list drops the distance past the line ("10.000001 refused" with no "+0.000001 past cap"). Two short words would fit: "refused, +0.000001".
- "+k" grouped mark: still drawn at `(x + 12, lane - 6)`, never rendered in any capture, no render test. Carried since r12.
- `contrast.cjs:61` `zone()` falls back to `--surface-1` when a zone rect is missing; treat a null zone as FAIL like the foreground. Commit an r16 run.
- `markNumbers` has no unit test (filter equality with the chart, PROPOSED excluded, numbering oldest-first). One `it` with the fixture already in `CapRuler.test.ts`.
- "spent." alone on its line at 390; `text-wrap: pretty` on `.lead-sub > span`.
- Hero label wraps at 1440 with line two hanging; ~290px empty right column under the recheck hint.
- Boundary marks 3 and 4 centered on the lines they crossed (since r8).
- "Asked for" counts the owner's `approveTrade()`; "3" counts the Paxos USDG trade; chart omits the 5.00 daily cap.
- `currentAdmission` called twice (`Account.tsx:161-162`); revoke-then-readmit untested.
- `DESIGN.md` and `DESIGN-CONTRACT.md` hand-synced again; make one a pointer.
- `CapRuler.test.ts:13` default string sort on numbers.
- No 768 capture this round.

## AI slop read

Nothing new in the slop register. The round's additions are a selector scope, shorter list words, and a number disc reused from the chart. All three are data plumbing, not decoration. Refused feed rows keep a red left tick. On a ledger row (not a card) that is the contract's semantic "refused row tick", so I do not count it against the "colored left-border card" tell, but it stays one step from that pattern if the rows ever gain radius and padding. Lime on near-black is still calibration look 2, held off by the network-driven accent and the absence of glow, halo, gradient or grid. Holds at B; not A because the palette is still guessable from "crypto console".

Litmus: brand unmistakable in first screen YES; one strong anchor YES (the figure); scannable by headings YES; one job per section YES; cards necessary YES (sheet and Policy only); motion improves hierarchy N/A (color transitions only, reduced motion honored at `styles.css:305`); premium without shadows YES.

## Goodwill (RHC, 390, primary flow)

```
Goodwill: 70
  Land on page          70 -> 85  (+10 figure and refused count in first viewport; +5 timestamped admission; chip is a chip again)
  Read the metric row   85 -> 85  (+0  clauses on own lines; "spent." orphan)
  Tap Recheck           85 -> 95  (+10 verdict in place; carried from r10, not re-observed)
  Read the chart        95 -> 100 (+5  five one-line rows under the marks)
  Read the zone key     100 -> 95 (-5  "runs" / "owner <= 10.00": new words for known zones)
  Ask why mark 1 failed 95 -> 100 (+5  disc 1 on "Proposal already settled" in Activity)
  Read the mark 4 row   100 -> 95 (-5  disc 4, "Proposal 1", "Trade 2" on one row)
  FINAL: 95/100 healthy
```

## What r15/r16 got right

- It fixed all four r14 Mediums with the narrow change each one needed: one selector, one shared filter function, one `addStyleTag`, and one shorter word map.
- It committed a forced-fail control run that actually goes red on non-text lines, after six rounds of a control that could not.
- The chart and the feed now derive mark numbers from the same function (`chartAttempts`), so the numbers cannot drift apart.
- It made the contract sentence true by changing the render, not by editing the sentence to match a bug.
- The Arbitrum empty chart says what it shows ("the zones show what the contract would do") instead of rendering a blank track.

## Quick wins (under 30 minutes each)

1. FINDING-001: rename the sub line to "trade id n" and drop "Proposal n" from titles on rows that carry a disc.
2. FINDING-002: zone key back to "executes / owner approves / reverts", with values only if they fit.
3. FINDING-003: `aria-hidden` disc plus visually hidden "Chart mark n:"; add discs to the non-text contrast set.
4. `zone()` null as FAIL in `contrast.cjs`; one `markNumbers` test; numeric sort in `CapRuler.test.ts:13`.
5. `text-wrap: pretty` on `.lead-sub > span` for the "spent." orphan.

Blind spot: no live browser run (by instruction). Every visual claim comes from static r16 captures and pixel scans, so the screen-reader reading in FINDING-003 is inferred from the markup, not heard. The 390 zone-key fit in FINDING-002 is estimated, not measured. There is no 768 capture this round. "+k", sign-summary blocks, Owner controls, wallet-connected states, focus rings and the recheck verdict were again not observed rendered. Contrast figures come from `contrast-r15.txt`, which was not re-run against r16.

AXES: avg=8.06 min=7.0
