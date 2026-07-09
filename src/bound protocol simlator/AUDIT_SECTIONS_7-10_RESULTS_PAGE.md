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
