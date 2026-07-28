# BND Tokenomics — Master Checklist & Action Plan

**Created:** 2026-07-21 · **Owner:** Georgian · **Status:** Phase 1–4 complete, Phase 5 in progress

Goal: build the investor infrastructure for BOUND — decide **BND direct** vs **staked xBND**,
produce a defensible tokenomics structure, simulate it against real protocol revenue
(v8 simulator engine), and write the final tokenomics document.

---

## Phase 1 — Document review (DONE ✅)

- [x] `BOUND_Tokenomics_-_2026.pdf` (Feb 2026) — current tokenomics; full findings in `01_DOCUMENT_REVIEW.md`
- [x] `Tokenomics Audit_ Bound Protocol.pdf` (Tokenomics.net, Oct 2025) — professional audit of the OLD structure
- [x] `Tokenomics Meeting with Tony - summary - October 7th.pdf` — advisor recommendations
- [x] `BOUND Protocol Financial Model.xlsx` — `Bound Price` + `Tokenomics` sheets extracted and analyzed
- [x] Example: `Example Tokenomics Audit.pdf` (DR Liquidity / $MOON) — template for what a good audit covers
- [x] Example: `Nosana_Tokenomics_ProposedChanges.pdf` — emissions retargeting, rebate loop, modeling method
- [x] Example: `Roark_rewards.pdf` — reward-mechanism fairness/simulation methodology
- [x] v8 simulator (`bound-simulator-v8-latest`) — BND assumptions block + protocol revenue extraction

## Phase 2 — Market research (DONE ✅)

- [x] Usual / USUALx model (staking wrapper + revenue switch + lock boosts) — details in `02_RESEARCH_XBND_VS_BND.md`
- [x] Comparable real-yield models: GMX (27–30% fees to stakers), Gains (90% to vault), dYdX (buyback shift)
- [x] Regulatory scan: SEC/CFTC March 2026 joint interpretive release (Howey, staking, receipt tokens, revenue distribution)

## Phase 3 — Structural decision (DONE ✅ — recommendation made, owner sign-off needed)

- [x] BND direct vs xBND comparison → `02_RESEARCH_XBND_VS_BND.md`
- [x] **Recommendation: Option 2 — staked xBND with revenue switch (Usual-style), utility-token positioning**
- [ ] **OWNER DECISION:** confirm xBND direction (or override)
- [ ] **OWNER DECISION:** legal review of revenue-distribution mechanics with VD Law Group
      (the 2026 SEC taxonomy treats "distributes revenue to holders" as a digital-security marker —
      the staking-gated structure mitigates but does not eliminate this; see research doc § Regulatory)

## Phase 4 — Tokenomics structure v1 (DONE ✅ — draft for review)

- [x] Supply, allocation, vesting, emissions draft → `03_TOKENOMICS_STRUCTURE.md`
- [ ] **OWNER DECISION:** round pricing (pre-seed / seed / public FDV ladder)
- [ ] **OWNER DECISION:** revenue-switch split (draft: 30% stakers / 70% treasury+buyback)
- [ ] **OWNER DECISION:** public raise target (draft: $6–10M, NOT $20–30M — see audit's marketing-budget rule)

## Phase 5 — Simulation (IN PROGRESS 🔄)

- [x] Build `sim-bnd-tokenomics.mjs` — fed by real v8 engine revenue (same extraction pattern as audit scripts)
- [x] Model: unlock schedule → circulating float; staking participation; revenue switch; staking APR; buyback capacity vs unlock sell pressure
- [x] Scenarios: base protocol revenue / 5× scale / 10× scale
- [ ] Owner reviews outputs; tune parameters
- [ ] (Later) price-impact modeling on chosen LP depth (V2 vs V3, per audit method)

## Phase 6 — Final tokenomics document (NOT STARTED)

- [ ] Write investor-facing tokenomics v2 doc (structure of the Feb 2026 PDF, corrected content)
- [ ] Reconcile with whitepaper v2 (July 2026) + pitch deck naming (BND everywhere — the Feb doc says "BNT")
- [ ] Legal pass (VD Law Group) on final mechanics
- [ ] Tony / Tokenomics.net re-audit of the NEW structure before publishing

---

## Standing rules for this workstream

1. **One source of truth per number.** Protocol revenue comes from the v8 engine, never re-typed.
2. **Clean numbers only.** 1B supply, whole-percentage allocations (audit + Tony both flagged this).
3. **Every mechanic must name its funding source.** No "staking yield 15%" without saying what pays it.
4. **All documents in `tokenomics/` folder; every change logged in the doc it belongs to.**
