# BND Token Economic Audit — Report Rebuild Checklist

**Goal:** rebuild `public/bound-tokenomics-audit.html` as a professional audit report modeled on the
**Tokenomics.net "Bound Protocol Tokenomics Audit" PDF** structure (2025-10-01), but populated
entirely from the **current platform data** (the live tokenomics engine + Results page), not the
PDF's stale figures (DFY/DFY+, $0.15, 4.3B supply — all obsolete).

**Method:** a reproducible build script `scripts/build-audit-report.mjs` extracts the live engine
from `src/BoundSimulator.jsx`, runs it on current defaults, and emits the full HTML with SVG charts
+ data tables generated from real series. Re-running the script regenerates the report — this is the
permanent fix for the "audit doc goes stale" problem (findings F-5/E3).

**Source-of-truth rule:** every number in the report must come from the live engine via the script.
No hand-typed figures. Verify the emitted report against the Results page in the browser.

---

## Structure to reproduce (from the PDF) — mapped to current platform data

### Part I — Mechanism Design (prose, current model)
- [ ] M1. Executive Summary — grade, headline KPIs (current base case), what the token is
- [ ] M2. Business Model & Value Proposition — RWA liquidity protocol; rwaUSD / BCI / BND / xBND
- [ ] M3. Platform Fee Channels — the 10 revenue streams, BCI-SC/Protocol-Reserve splits
- [ ] M4. Tokenomics & Utility — BND utility (governance, fee-discount burn, xBND revenue, security bond)
- [ ] M5. Stakeholder Analysis — LPs, xBND lockers, public stakers, treasury, governance
- [ ] M6. Value Accrual & Game Theory — the three flows (Burn Engine, xBND, staking) + incentive loop

### Part II — Tokenomics Audit (each: chart/table → Interpretation → Analysis & Insights → Potential Risks)
Mapped to the CURRENT Results-page elements:

- [ ] A1. Vesting Analysis — **Vesting Schedule (stacked area)** + Monthly/Cumulative Unlocks + Allocation table
- [ ] A2. Capital Formation & Token Discounts — round pricing (Seed/ExtSeed/Public), discounts, step-ups, FDV ladder
- [ ] A3. Investor ROI — **Cohort Summary table** + per-cohort returns (xBND / BND / Combined)
- [ ] A4. Protocol Reserve Revenue — **PR Revenue (monthly + cumulative)** — the fuel for the token economy
- [ ] A5. BND Price Path — **BND Simulated Price** chart, drawdown, M12/M24/M36
- [ ] A6. Burn Engine (Buyback & Burn) — **Balance vs Cumulative Spend** + BND Burned + Cumulative Burned
- [ ] A7. xBND Revenue Switch — **Implied Distribution Rate** + **Cumulative rwaUSD Distributed** charts
- [ ] A8. Public Staking Pool — **Balance & Implied APY** dual-axis + $10k illustration
- [ ] A9. Supply Composition — **Circulating vs Locked (xBND) vs Public-Pool** stacked area
- [ ] A10. Liquidity Depth & Price Impact — pool $5.95M/119M, price-impact table at sell bands
- [ ] A11. Max Trade Size — executable buy/sell at 2/5/10% slippage
- [ ] A12. Buy-Pressure Requirement — monthly sell vs buy-side, sell/buy ratio

### Part III — Conclusion & Recommendations
- [ ] C1. Overall verdict + grade, pass/caution/critical tally
- [ ] C2. Strengths (structural), tempering points (revenue-dependence, thin pool), recommendations

---

## Charts to render as inline SVG (from live series)
- [ ] G1. Vesting stacked-area (9 buckets + staking emissions)
- [ ] G2. Monthly token unlocks (bar) + Cumulative unlocks (line)
- [ ] G3. Protocol Reserve revenue (bar) + cumulative (line)
- [ ] G4. BND simulated price (line + launch reference)
- [ ] G5. BND burned (bar) + cumulative burned (line)
- [ ] G6. Circulating vs Locked vs Public-Pool (stacked area)
- [ ] G7. xBND implied distribution rate (line) + cumulative rwaUSD (line)
- [ ] G8. Burn Engine balance vs cumulative spend (dual line)
- [ ] G9. Public Staking Pool balance + implied APY (dual axis)

## Data tables to embed (current values)
- [ ] T1. Token Supply & Allocation (9 rows, %, tokens)
- [ ] T2. Capital rounds (raise, price, tokens, %, FDV, discount, vesting)
- [ ] T3. Cohort Summary (Seed/ExtSeed/Public × invested/xBND/BND/combined)
- [ ] T4. Public-raise 4-way split ($ + %)
- [ ] T5. Price-impact at sell bands (1/2/5/10/20% → impact, price)
- [ ] T6. Max trade size at slippage (2/5/10% → buy $, sell $)
- [ ] T7. Buy-pressure sample months (sell / burn yield / demand / org buy / price)

---

## Build & verification
- [ ] B1. `scripts/build-audit-report.mjs` runs clean, emits `public/bound-tokenomics-audit.html`
- [ ] B2. Every KPI/table figure matches the live Results page (browser cross-check)
- [ ] B3. Report opens from the Results-page "View Professional Tokenomics Audit" button
- [ ] B4. Theme-aware (light/dark), responsive, no external assets (self-contained)
- [ ] B5. Charts render correctly (SVG paths valid, axes labelled)
- [ ] B6. Cover + Table of Contents + section anchors present (PDF parity)
- [ ] B7. `npm run build` still clean; no regression to the app

## Close-out
- [ ] Z1. Owner review of the generated report
- [ ] Z2. Note in handover that the audit doc is now script-generated (regenerate via the script)

---

## Data provenance (current defaults — filled by the build script, do not hand-edit)
*Base case, capital rounds, allocation, splits, and all series are emitted by the script from the
live engine so they always match the app. Recorded in the report's "Basis" line + this section on each run.*
