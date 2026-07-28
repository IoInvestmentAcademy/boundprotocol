# BOUND Protocol — BND Tokenomics & Capital Structure
## Draft v2.0 — July 2026 (replaces the February 2026 "BNT" memorandum)

> **STATUS: INTERNAL DRAFT.** Numbers marked ⚠ await owner decision (see `00_CHECKLIST.md`).
> Simulation-backed: every mechanism here was stress-tested in `sim-bnd-tokenomics.mjs`
> against live protocol-engine revenue. Not investor-facing until legal review (VD Law Group).

---

## 1. Overview

BOUND is an RWA liquidity protocol. Its revenue engine (liquidation/minting fees, conversion
fees, layer yield, float yield) is modeled end-to-end in the BOUND Simulator and accrues to two
pools: the **BCI Surplus Cushion** (supports the BCI index) and the **Protocol Reserve** (protocol-owned
cash). **BND** is the protocol's utility token; **xBND** is its staked form and the vehicle through
which committed participants share in protocol activity.

The token model follows three principles, each a corrective to the prior design:

1. **Utility first** — BND exists to be used (fee discounts, staking access), not to be scarce.
2. **Revenue-anchored rewards** — staking rewards are paid from real Protocol Reserve inflows,
   never from inflation. BND supply is fixed; there is no minting authority.
3. **Committed capital earns more** — locked stakers receive revenue share; unlocked holders don't.

## 2. Supply

| Parameter | Value |
|---|---|
| Token | BND |
| Total supply | 1,000,000,000 — fixed, immutable at contract level |
| Inflation | None. No mint function |

## 3. Allocation

| Category | % | Tokens | TGE | Cliff | Vesting |
|---|---|---|---|---|---|
| Pre-seed | 3% | 30M | 0% | 6 mo | 18 mo linear |
| Seed | 7% | 70M | 0% | 6 mo | 18 mo linear |
| Public sale | 8% | 80M | 10% | 1 mo | 12 mo linear |
| Team | 15% | 150M | 0% | 12 mo | 36 mo linear |
| Treasury | 20% | 200M | 0% | 12 mo | 48 mo linear |
| Ecosystem & Rewards | 22% | 220M | 2% | — | 48-mo budgeted programs |
| Liquidity / Market Making | 12% | 120M | deployed | — | non-discretionary |
| Marketing / Growth | 5% | 50M | 5% | — | 24 mo linear |
| Advisors | 3% | 30M | 0% | 12 mo | 24 mo linear |
| **Total** | **100%** | **1B** | | | |

Insiders (pre-seed, seed, team, advisors): 28%. Investor rounds: 18%. All percentages whole numbers.

## 4. Capital formation ⚠

| Round | Price | FDV | Tokens | Raise |
|---|---|---|---|---|
| Pre-seed | $0.015 | $15M | 30M | $450K |
| Seed | $0.025 | $25M | 70M | $1.75M |
| Public | $0.10 ⚠ | $100M ⚠ | 80M | $8M |

⚠ **Simulation finding:** at the engine's *current* revenue calibration, $100M launch FDV is ahead
of fundamentals (zero-speculation stress case drifts to ~$12–30M float-value before recovering with
revenue). Options on the table: (a) launch at $0.04–0.06 FDV $40–60M, (b) gate TGE on ~5× protocol
revenue scale, (c) accept that the gap is covered by growth expectations. Owner decision.

Use of public proceeds: 80% deployed into the protocol's own yield engine (deployed-capital yield
funds the buyback reserve), 20% operations. Marketing budget: $1–1.6M cash (audit's 10–20% rule) + 5% token bucket.

## 5. TGE float & market structure

- Sellable float at TGE: **~15M BND (1.5% of supply, ~$1.5M at $0.10)** — deliberately low; grows to ~19% by M12.
- Liquidity: **$3M USDC + 30M BND**, V3 concentrated ±20% with full-range backstop, plus
  **$2M reactive buyback reserve** (defends −10% months; sized by simulation — $1M was exhausted, $2M holds).
- Buybacks are **strategic, not automatic** — reserve deploys on drawdown triggers, replenished by
  50% of the treasury's revenue stream + deployed-proceeds yield.

## 6. xBND — staking & revenue switch (the investor infrastructure)

| Layer | Mechanic |
|---|---|
| Stake | BND → xBND (ERC-4626-style appreciating receipt, transferable) |
| Unlocked xBND | Bootstrap emissions only — 60M BND, 24-month decaying schedule, hard sunset |
| Locked xBND | 1 / 3 / 6 / 12-month locks · revenue-share boosts 1× / 2× / 4× / 8× |
| **Revenue Switch** | **30% ⚠ of Protocol Reserve inflows → locked xBND, paid in rwaUSD, per epoch** |
| Treasury share | Remaining 70% → treasury + strategic buyback reserve |
| Fee discount | Unchanged: conversions paid in BND charged 0.44% (vs 0.88%), BND path 100% burned |
| Exclusions | Team & Treasury tokens cannot stake while vesting |
| Unstake fee | 0% at launch; governance may introduce later |

Modeled outcomes (zero-speculation stress case, 40% of float staked):
- Locked-xBND APR: **~12% Y1 → ~11% Y3** at current engine revenue; **14–16% steady-state** at 5–10× scale.
- Rewards scale 1:1 with protocol AUM — no dependence on token emissions.

Positioning: BND/xBND is a **utility and participation token**. Staking rewards derive from
protocol-defined, governance-tunable parameters — never guaranteed, never discretionary payments.
(Language per 2026 SEC/CFTC interpretive framework; final wording via counsel.)

## 7. Ecosystem & Rewards (220M) — budgeted programs

| Program | Budget | Discipline |
|---|---|---|
| Staking bootstrap | 60M | 24-mo decaying, sunsets |
| Early-LP incentives | 40M | 6-mo linear per campaign |
| RWA-issuer partnerships | 60M | per-deal, governance-approved |
| Community campaigns | 30M | meaningful sizes only |
| Reserve | 30M | unallocated |

Unused budgets never enter circulation.

## 8. Dilution model (circulating supply)

| Milestone | Circulating | % of supply |
|---|---|---|
| TGE | ~15M | 1.5% |
| M12 | ~190M | 19% |
| M24 | ~455M | 46% |
| M36 | ~625M | 63% |
| M60 | ~830M | 83% |

No cliff stacking: public vests M2–13, seed/pre-seed M7–24, team/advisors M13+, treasury M13–60.
Worst modeled unlock month sells $0.7M against $3M pool depth + $2M reserve.

## 9. Governance

Phased: parameters (revenue-switch %, boosts, unstake fee, buyback triggers) are DAO-tunable
by xBND vote after decentralization milestones; treasury under multi-sig with governance oversight.

---

*Backing documents: `01_DOCUMENT_REVIEW.md` (what changed and why), `02_RESEARCH_XBND_VS_BND.md`
(model choice), `03_TOKENOMICS_STRUCTURE.md` (parameter rationale), `04_SIMULATION_RESULTS.md`
(stress-test evidence), `sim-bnd-tokenomics.mjs` (reproducible model).*
