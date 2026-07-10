# Audit — Sections 7–10: Simulation Results Page

**Date:** 2026-07-09 · **Procedure:** `AUDIT_CHECKLIST_TEMPLATE.md` (Phases A–F)
**Scope:** the entire Simulation Results page — Section 7 (BCI SC Revenue), Section 8
(Protocol Reserve Revenue), Section 9 (BCI Price Mechanics: KPI row, price chart,
Price & Backing table), Section 10 (Participant Economics, previously reworked this
same day under owner direction). All four are **pure consumers** of the already-audited
Sections 1–6, so this audit is tie-out + display-honesty verification, not formula
re-derivation. The owner also directed a **tab restructure** and authorized cutting
duplicated/overcomplicated elements.

---

## 1 · Element inventory (as audited, before restructure)

| # | Element | Data source | Verdict |
|---|---|---|---|
| 1 | KPI row (5 cards) | `sim[resultsMonth-1]` direct reads | ✔ correct (Range-linked, fixed earlier this day — previously frozen at M12) |
| 2 | BCI Index Price chart | `priceChart` memo ← `sim` slices | ✔ correct; price/annG/SC/supply tooltip all engine exports |
| 3 | BCI Price & Backing table | `bciPriceCalcTableData` ← `sim` | ✔ correct; own year selector (independent of chart) |
| 4 | BCI SC Revenue chart + headline | `bciRevChart` ← `bci_*` exports; headline `totalBci` | ✔ correct |
| 5 | BCI SC fee-source reference card | static copy + split %s | ✔ matches engine splits (100/0, 20/80, 80/20, 20/80, 80/10/10, 80/20, 20/80) |
| 6 | BCI SC Monthly Breakdown table | `bciScRevenueTableData` | ⚠ Finding 2 (gross re-summed in UI) — fixed |
| 7 | BCI SC "% Composition" table | `bciMonthlyCompositionData` | ✂ removed (Finding 3, duplication) |
| 8 | PR Revenue chart + headline | `prRevChart` ← `pr_*` exports | ✔ correct (incl. $333K op-cost reference line) |
| 9 | PR fee-source reference card | static copy + split %s | ✔ matches engine |
| 10 | PR Monthly Breakdown table | `prRevenueTableData` | ✗ **Finding 1 (the real defect)** — fixed |
| 11 | PR "% Composition" table | `prMonthlyCompositionData` | ✂ removed (Finding 3, duplication) |
| 12 | Participant Economics | reworked earlier same day (per-unit fee waterfall, `computeLpOutcome`) | ✔ audited in that pass |

## 2 · Findings

### Finding 1 — PR Monthly Breakdown: columns did not add up (display defect, fixed)
The table's 7 source rows are **gross** components (`pr_rwa + pr_entry + pr_pool +
pr_maint + pr_integ + pr_morpho + pr_float = totalPrRaw`), but the bold total row
displayed **`totalPr` = totalPrRaw − erTopUp** (net after the Emergency-Reserve
top-up, up to 10% of gross). The deduction was invisible: an investor summing the
column would get a number larger than the printed total, with no explanation — the
exact "columns must tie out" failure this audit exists to catch.
**Fix:** engine now exports `totalPrRaw` and `erTopUp`; the table gained two rows —
**"Gross (sum of sources above)"** and **"− Emergency Reserve top-up"** — before the
net total, so every column adds up visibly. (At the default preset the top-up is $0
in Y1 because the ER's $500K seed exceeds its early target — the identity is guarded
regardless.)
**Guard:** new invariant **S30** — `totalPrRaw` = sum of the 7 sources,
`totalPr = totalPrRaw − erTopUp`, `erTopUp ∈ [0, 10% × gross]`, exports exist — all
36 months, 3-market preset. Now **30 invariant families**.

### Finding 2 — BCI SC table re-summed its own total (rule 8, fixed)
`bciScRevenueTableData` computed `gross` as a UI-side sum of the 7 components instead
of reading the engine's `totalBci` export. Numerically identical (S6 guards the
identity) but a parallel re-derivation — the recurring defect class rule 8 bans.
Now reads `row.totalBci`.

### Finding 3 — "% Composition" tables removed (duplication, owner-authorized cut)
Both revenue sections carried a second 12-column table re-expressing the Monthly
Breakdown as percentages. The stacked bar charts already show composition visually,
and the $ tables carry the exact numbers — the % tables added a third rendering of
the same data (and their own UI-side re-computation of totals). Removed, along with
their memos (`bciMonthlyCompositionData`, `prMonthlyCompositionData`).

### Finding 4 — P10: Year 4/5 fiction (fixed)
Both revenue year-selectors offered Years 1–5 on a 36-month engine (Years 4–5 all
dashes), and three data memos built 5 years. All trimmed to 3
(`bciScRevenueTableData`, `prRevenueTableData`, `bciPriceCalcTableData`, both button
rows). This was the 4th recurrence of the P10 pitfall on this page family.

### Verified correct (no change)
- Both fee-source reference cards' split percentages hand-checked against the engine's
  actual constants (bci_conv 100/0; entry 20/80; pool 80/20; rwa 20/80; layer 80/10/10;
  float 80/20; maint 20/80; integ 0/100). No drift.
- Chart headline figures: `totalBci` (month), `prCum` (cumulative) + `totalPr` (month) —
  direct exports.
- KPI cards, price chart and Price & Backing table — verified in the earlier
  Range-linking pass this same day; re-checked post-restructure.

## 3 · Restructure — tab layout (owner-directed)

The single scrolling page became **four tabs** (state `resultsTab`), tab bar in the
Simulation Results header:

1. **Overview** — Range control, 5 KPI cards, BCI Index Price chart, BCI Price &
   Backing table (its own year selector).
2. **BCI SC Revenue** — year selector, stacked chart + M-total headline, fee-source
   reference card, Monthly Breakdown table.
3. **Protocol Reserve Revenue** — year selector, stacked chart + cumulative headline,
   fee-source reference card, Monthly Breakdown table (now with gross/ER/net rows).
4. **Participant Economics** — the calculator cards (Private LP, Retail LP) and the
   RWA Holder / rwaUSD Holder cards.

The sticky "← Back to Inputs" button is shared across all tabs. Each revenue tab
keeps its own independent Year selector, and Overview keeps its own Range control —
no cross-tab state coupling.

## 4 · Verification battery

```
npm run build                       ✓ clean
node scripts/verify-invariants.mjs  ✓ ALL PASS — 30 families (S30 new)
node scripts/hand-verify-m12.mjs    ✓ ALL VALUES MATCH
node scripts/audit-conservation.mjs ✓ ALL TIE-OUTS PASS
npm run lint                        ✓ 0 errors · 35 warnings (baseline, 0 new)
dev server                          ✓ 200 @ http://127.0.0.1:5239/
Playwright                          ✓ all 4 tabs render; correct content isolation per tab;
                                      composition tables absent; ER top-up + gross rows present
```

**P6 self-check:** the engine export addition (`totalPrRaw`, `erTopUp`) is guarded by
S30; the tab restructure verified in-browser tab-by-tab; removed memos confirmed to
have no remaining references (build + lint clean).

---

# Addendum — Overview Tab Deep Audit (2026-07-10, owner-requested)

**Scope:** the Overview tab specifically — the investor-headline surface (BCI Annualized
Growth). Full Phase A–F treatment: every displayed number independently re-derived, not
just traced to an export. Also covers the same-day owner-directed restructure (3-section
table, shared Range control, descriptive text removed) since P6 makes that restructure
itself in-scope.

## A · Independent identity verification (the core of this audit)

New permanent probe **`scripts/audit-overview-identities.mjs`** re-implements every
identity the tab displays, from scratch, and checks all 36 months in TWO configurations
(no-markets and 3-markets):

| # | Identity verified | Result |
|---|---|---|
| T1 | BCI SC roll-forward: `scEnd(t) = scEnd(t−1) + totalBci(t)` — the table's Section 2 | ✔ 36/36 both configs |
| T2 | Layer NAV roll-forward: `NAV(t) = NAV(t−1) + privIn + retailIn − exits` — Section 1. **This match is also direct proof no yield is compounded into LP balances** (ruling #1): the roll-forward has NO yield term and still reproduces the engine exactly | ✔ |
| T3 | Total backing: `bciNav = layerNav + bciSC` — Section 3 row 1 | ✔ |
| T4 | The division shown: `price × supply = backing` (±$0.05) | ✔ |
| T5 | Supply mint/burn at START-of-month price | ✔ |
| T6 | annG: `(price^(12/m) − 1) × 100`, clamped [0, 999] — the headline number | ✔ |
| T7 | Annual-summary aggregation ("All" view): flows sum across 12 months, stocks are year-end; `scEnd(Y) = scStart(Y) + Σrevenue`; NAV year roll-forward | ✔ |
| T8 | KPI Range wiring: view 0→M36, 1→M12, 2→M24, 3→M36 | ✔ |

Engine-side, these identities were already permanently guarded (conservation **C1/C3/C4**,
invariants **S1/S2**) — the probe is a second, independent implementation confirming both
the engine and the guards. No double-counting paths exist: BCI SC grows by exactly the 7
identified streams (C1), NAV by exactly LP flows (C3), and yield reaches the price only
once, through `bci_morpho` inside `totalBci`.

## B · Data-source & slider audit

Every field on the tab is a direct engine-export read (`row.<field> || 0`): KPI cards
(`annG, bciPrice, layer, blendedAnnualYield, bciSupply, bcUsdcAmt, bcCoverageAchieved,
bcUsdcRequired, rwaUSDIdle`), chart memo, monthly table memo, annual summary memo. No
UI-side recomputation of any total (rule 8 clean). All memos depend on `sim` (and
`bciPriceView`), and `sim` on `[p, rwaMarkets, layerCfg]` — every slider propagates.

## C · Findings

1. **Label defect (fixed):** in the "All" (Annual Summary) view, the Section-2 sub-row
   still read "+ New fee revenue **this month**" while displaying 12-month sums. Label
   now switches to "this year" in the All view. (Found by eye on the rendered page —
   values were correct, the words weren't.)
2. **Dead memo fields (fixed, P6-class):** `scStart` and `privGross` remained computed
   in both table memos after the same-day restructure dropped their rows, plus an
   orphaned `prev` lookup (caught as a new lint warning, removed; lint back to the
   35-warning baseline).
3. **Observations (correct, documented, no change):**
   - M1 "Annualized Growth" (~14.6% in Y1) is one month annualized — mathematically
     correct, expected to look high vs M12.
   - The KPI card's annG at M24/M36 is **since-launch CAGR** at that month, not that
     single year's growth — consistent with the doc's formula (§11.10).
   - Hand tie-out on the rendered page: Y3 backing $23.7M = $20.0M NAV + $3.7M SC;
     1.2988 × 18.23M supply ≈ $23.7M; SC $560.7K → $1.8M → $3.7M matches Σrevenue.

## D · Verification battery

```
npm run build                            ✓ clean
node scripts/verify-invariants.mjs       ✓ 30 families
node scripts/hand-verify-m12.mjs         ✓ 32/32
node scripts/audit-conservation.mjs      ✓ all tie-outs
node scripts/audit-overview-identities.mjs ✓ T1–T8, 36 months × 2 configs (NEW, permanent)
npm run lint                             ✓ 0 errors · 35 warnings (baseline)
Browser (Playwright)                     ✓ All/Year views, KPI-chart-table linkage, annual summary
```

---

# Addendum 2 — BCI SC Revenue Tab Deep Audit (2026-07-10, owner-requested)

**Scope:** Section 7's tab in full — year selector, stacked chart + headline, Fee
Sources & Allocation reference card, Monthly Breakdown ($) table, % Composition
table (incl. its annG connecting row). Runs AFTER the same-day owner changes
(80/20 split flip, default recalibration, % Composition re-add), so all of those
are in scope per P6.

## A · Independent identity verification

New permanent probe **`scripts/audit-bcisc-identities.mjs`** — 36 months × 2 configs
(no-markets; 3 markets with per-market maintFee/tradeF overrides + new default layerCfg):

| # | Identity | Result |
|---|---|---|
| B1 | Monthly Breakdown bold total = sum of its 7 visible rows (`totalBci`) | ✔ |
| B2 | Streams re-derived from OTHER exports: `bci_pool = pVol × 0.8% × 80%`, `bci_morpho = layerYieldGross × 80%`, `bci_float = bcYieldGrossMo × 80%`, `bci_rwa = (trade+haircut) × 80%` | ✔ |
| B3 | Post-flip split complements: entry & rwa **80/20**, maint still 20/80 (vs their `pr_*` twins) | ✔ |
| B4 | % Composition columns sum to exactly 100% whenever revenue > 0 | ✔ |
| B5 | annG row (the connecting metric) matches the clamped engine formula | ✔ |
| B6 | Chart bars ($K, 1dp) reconstruct exports within $50 rounding | ✔ |
| B7 | Headline reads the year-end month's `totalBci` (M12/M24/M36) | ✔ |
| B8 | `bci_maint` = Σ ACTIVE markets' own maintFee/12 × 20% (per-market rates, incl. overrides) | ✔ |
| B9 | `bci_conv` = the 4 per-fee conversion exports (`privConvIn/OutBCI`, `retBuy/ExitConvBCI`) — the SAME fields the Private/Retail LP fee tables display, so the two sections can never disagree | ✔ |
| B10 | Post pool-launch, `bci_entry` = `privMintBCI + privRedeemBCI` (pre-pool months add the RWA redemption fee, same class) | ✔ |

Rule-8 check: every rendered figure is a direct export read (`bci_*`, `totalBci`,
`annG`); the only UI arithmetic is unit conversion (÷1000 for chart, ÷total for %).
All memos depend on `sim` → every slider propagates.

## B · Findings (copy layer — numbers were all correct)

1. **Pool+APSS description understated its base (fixed, both tabs):** the cards said
   "on retail pool buy / exit volume" / "on retail flow", but the engine's `pVol`
   includes the RWA liquidation-sell and minting-buy legs routed through the pool
   (exactly the 4 legs the Capital Flow Reconciliation table documents). Now reads
   "On ALL pool volume (retail + RWA)" with matching body text — on the BCI SC card
   AND the PR tab's mirror card.
2. **Hardcoded 0.3% rate (fixed, both tabs):** the Mint/Redemption card hardcoded
   "0.3%" while the rate is a slider (`p.mintRedeemFee`); now templated so it follows
   the slider.
3. **Headline ambiguity (fixed):** "M12 total" (a single-month figure) could read as
   a year total next to a 12-month chart — now "M12 · monthly revenue".
4. **Verified correct, no change:** all seven split badges match engine constants
   post-flip (conv 100/0, entry 80/20, pool 80/20, rwa 80/20, layer 80/10/10 + ER,
   float 80/20, maint 20/80); chart bar order/colors = legend = RC palette; year
   selector [1,2,3] only (P10 clean); "Linked to Year selector" note accurate.

## C · Verification battery

```
build ✓ · lint 35/0 (baseline) · 30 invariant families ✓ · M12 hand-check 32/32 ✓
conservation ✓ · overview identities T1–T8 ✓ · NEW audit-bcisc-identities B1–B10 ✓
Browser: copy fixes confirmed live, old wording absent
```

---

# Addendum 3 — Protocol Reserve Revenue Tab Deep Audit (2026-07-10, owner-requested)

**Scope:** Section 8's tab in full — year selector, stacked chart (+ $333K/mo op-cost
reference line + headline), Fee Sources card, Monthly Breakdown ($), % Composition,
and the **Emergency Reserve section** (reference card + performance table) added
earlier the same day (in scope per P6). Verified to SOURCE level, not just
cross-export level, per owner instruction.

## A · Independent identity verification

New permanent probe **`scripts/audit-pr-er-identities.mjs`** — 36 months × 2 configs
(no-markets; 3 markets with per-market integFee AND maintFee overrides + new default
layerCfg):

| # | Identity | Result |
|---|---|---|
| P1 | 7 source rows sum to gross (`totalPrRaw`) | ✔ |
| P2 | Net = Gross − ER top-up (the S30 identity) | ✔ |
| P3 | Cumulative row rolls forward by exactly the net | ✔ |
| P4 | Cross-export re-derivations: pool ×20%, layer yield ×10%, BC yield ×20%, RWA (trade+haircut) ×20%, entry = mint+redeem PR exports, maint = Σ active markets' own fee/12 ×80%, **integration = Σ launching markets' own integFee in exactly their launch month** (verified with different fees per market) | ✔ |
| P5 | % Composition base is GROSS; columns sum to exactly 100% | ✔ |
| P6 | **ER balance roll-forward EXACT**: er(t) = er(t−1) + layer-yield credit + top-up (upgrades conservation C5's ≥ check to strict equality) | ✔ |
| P7 | ER Target = (Morpho + BC Yield Position) × year rate (10/15/20%) — the two new table rows | ✔ |
| P8 | Top-up trigger & cap re-derived: min(max(0, target − balance-after-yield-credit), 10% × gross) | ✔ |
| P9–P11 | Coverage row sane; headline reads year-end prCum + month net; chart bars reconstruct within $50 rounding | ✔ |
| **P12–P16 (source level)** | pVol = its 4 pool legs; layerYieldGross = Σ tier balances × config rates/12; bcYieldGrossMo = yield position × rate/12; **RWA trade & haircut revenue = Σ per-market SERVED volumes × that market's live (concentration-bumped) rates from marketStats**; privMintPR/privRedeemPR re-derived through the full fee chain from lpIn/privateLayerOut × sliders (incl. exit conversion-fee deduction) | ✔ |

Rule-8: every rendered figure is a direct export read; UI arithmetic is unit
conversion only. All memos depend on `sim` → every slider propagates.

## B · Findings

1. **Chart tooltip didn't add up (fixed):** the stacked bars are the 7 GROSS streams,
   but the tooltip's single total was NET — summing the tooltip's own lines gave a
   number that didn't match its total whenever the ER top-up was nonzero (Year 2+).
   The tooltip now shows the full arithmetic: **Gross → − ER top-up (only when
   nonzero) → Net to PR**. Hand-verified on screen: $85.8K − $8.6K = $77.2K ✓.
2. **Copy fixes applied in Addendum 2 confirmed on this tab too** (Pool+APSS "ALL
   pool volume", dynamic mint/redeem rate) — both cards mirror correctly.
3. **Verified correct, no change:** all 7 split badges (post-flip: entry/rwa "Majority
   to BCI SC"; maint still majority PR; integ 100% PR); op-cost reference line at
   $333K on a $K axis (unit-consistent; a fixed reference assumption, not an engine
   value — labeled as such in the subtitle); ER reference card's five cells match the
   probe-verified mechanics (P6–P8); ER performance table rows are exactly the P6/P7
   identities; year selector [1,2,3]; "Linked to Year selector" notes.

## C · Verification battery

```
build ✓ · lint 35/0 (baseline) · 30 invariant families ✓ · M12 hand-check 32/32 ✓
conservation ✓ · overview T1–T8 ✓ · bcisc B1–B10 ✓ · NEW audit-pr-er-identities P1–P16 ✓
Browser: tooltip gross/ER/net confirmed live with nonzero top-up (Year 2)
```

---

# Addendum 4 — Participant Economics Tab Deep Audit (2026-07-10, owner-requested)

**Scope:** Section 10's tab — the Private LP and Retail LP calculator cards
(`computeLpOutcome` waterfall, inputs, stat row, fee breakdown, projection) and the
RWA Holder / rwaUSD Holder cards. This tab was substantially rebuilt this week
(per-investor waterfall replacing the aggregate-export approach; input remount fix;
minimal styling), so all of that is in scope per P6. **This completes the deep-audit
series — all four Simulation Results tabs now have dedicated addenda.**

## A · Independent verification

New permanent probe **`scripts/audit-participant-economics.mjs`** — tests the REAL
`computeLpOutcome` (extracted from source, not re-typed) for both cards × 3 holding
periods, against a second implementation and against economic invariants:

| # | Check | Result |
|---|---|---|
| E1 | Full waterfall re-implemented independently: entry fee → 92%/80% split → entry conv fee → growth at the engine's actual `bciPrice(12·years)` → exit conv fee → exit fee → + idle share; `finalValue` matches to the cent | ✔ |
| E2 | The 4 displayed fee legs equal the waterfall's own legs (labels show live rate + the exact dollar base each applies to) | ✔ |
| E3 | Net APY = `(finalValue/amount)^(1/years) − 1` exactly | ✔ |
| E4 | Total-Fees stat = Σ legs ÷ amount (a one-time %, correctly NOT annual) | ✔ |
| E5 | Gross APY stat = the engine's `annG` export at month 12·years | ✔ |
| E6 | **Linearity:** fees & final value scale exactly ∝ amount; Net APY is invariant to amount (a percentage must not depend on how much you enter) | ✔ |
| E7 | **One-time-fee economics:** Net APY strictly INCREASES with holding period — the guard against the "one-time fee treated as annual" bug class the owner caught in the first version | ✔ |
| E8 | Net APY < Gross APY in every configuration (fees can only drag), both positive at defaults | ✔ |
| E9 | RWA Holder card stats: simple average over ACTIVE markets only (a market launching M30 correctly excluded from the M12 average) | ✔ |

Waterfall-vs-engine consistency: entry ordering (mint fee on full deposit → conv %
split → conv fee on converting share) and exit ordering (conv fee on grown value →
redeem/pool fee on the remainder) match the engine's own private/retail fee
sequences; the idle share correctly neither grows nor pays exit fees (Bound Core
direct redemption is fee-free in the engine).

## B · Findings

1. **BND-share transparency (fixed):** the conversion-fee legs show the blended
   rwaUSD-path rate (0.88% × (1 − BND usage) ≈ 0.79% at defaults). That is the
   correct amount deducted from the deposit — the BND-paid share is burned in BND
   tokens and never touches the invested rwaUSD — but an investor comparing the leg
   to the 0.88% slider would see a mismatch with no explanation. The cards' fine
   print now states it explicitly.
2. **Observations (correct, documented, no change):**
   - RWA Holder rates are a simple (unweighted) average across active markets,
     labeled "live avg" — volume-weighting would differ slightly; acceptable for a
     snapshot card since per-market detail lives in the RWA section.
   - The calculator models an entry at launch (price 1.0000) growing along the
     actual simulated price path — stated in the fine print ("the pace it reached by
     month N").
   - `||0.89` / `||95` / `||98` fallbacks in the tab differ from the new preset
     values (0.88/92/80) but are unreachable (preset always defined, slider mins 50).
3. **On-screen hand tie-out:** $500K, 1yr: legs 1.5+3.6+4.1+1.5 = $10.7K = 2.1% of
   principal ✓; bases $458.6K (92% of post-mint) and $509.8K (post-exit-conv) ✓;
   net 9.6% < gross 12.9% ✓; cards' controls fully independent ✓.

## C · Verification battery

```
build ✓ · lint 35/0 (baseline) · 30 invariant families ✓ · M12 hand-check 32/32 ✓
conservation ✓ · T1–T8 ✓ · B1–B10 ✓ · P1–P16 ✓ · NEW audit-participant-economics E1–E9 ✓
Browser: BND fine-print live, breakdown legs, independent per-card controls
```
