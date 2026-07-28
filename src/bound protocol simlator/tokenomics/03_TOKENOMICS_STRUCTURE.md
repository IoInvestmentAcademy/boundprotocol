# BND Tokenomics Structure — v1 Draft (for owner review)

**Date:** 2026-07-21 · Baseline: v8 simulator BND block + Tony's rules + audit thresholds.
Every number here is a **draft default** — the simulation (`sim-bnd-tokenomics.mjs`) reads these
values so alternatives can be tested before anything is published.

---

## 1. Supply & naming

| Parameter | Value | Rationale |
|---|---|---|
| Token | **BND** | Matches simulator/whitepaper/app (Feb PDF's "BNT" retired) |
| Total supply | **1,000,000,000 (1B), fixed** | Tony + audit; immutable, no mint authority |
| Value-accrual | xBND staking + revenue switch + strategic buyback | See `02_RESEARCH_XBND_VS_BND.md` |
| Positioning | **Utility token** (fee discounts, staking access), governance phased in later | Tony + regulatory |

## 2. Allocation (clean numbers, sums to 100%)

| Category | % | Tokens | TGE unlock | Cliff | Linear vesting | Notes |
|---|---|---|---|---|---|---|
| Pre-seed | 3% | 30M | 0% | 6 mo | 18 mo | Tony's norm (6+18); price $0.015 |
| Seed | 7% | 70M | 0% | 6 mo | 18 mo | Price $0.025 |
| Public sale | 8% | 80M | 20% | 0 | 12 mo | Price $0.10; 20% TGE gives buyers immediate skin without dump mass |
| Team | 15% | 150M | 0% | 12 mo | 36 mo | Longer than investors — alignment optics |
| Treasury | 20% | 200M | 0% | 12 mo | 48 mo | Audit's "12+36/48 normal"; strategic buyback reserve lives here |
| Ecosystem & Rewards | 22% | 220M | 2% | 0 | 48 mo (budgeted, not auto) | Staking bootstrap emissions, LP incentives (6-mo linear per Tony), partnerships, airdrop-scale campaigns |
| Liquidity / MM | 12% | 120M | 100% deployed | — | — | Audit: 10–15%; DEX + CEX split decided at listing |
| Marketing / Growth | 5% | 50M | 5% | 0 | 24 mo | Tony: dedicated marketing bucket (plus cash from raise) |
| Advisors | 3% | 30M | 0% | 12 mo | 24 mo | |
| **Total** | **100%** | **1B** | | | | |

**Insider total (pre-seed+seed+team+advisors) = 28%** — inside the 25–30% norm.
**Investor rounds total 18%** vs the simulator's current 34.8% (24.8% private + 10% public) — the 24.8% private
allocation in the v8 block is the single biggest thing this draft changes; a quarter of supply at $0.025 is
exactly the "low-basis holders overwhelm the float" risk the audit flagged.

## 3. Capital formation

| Round | Price | FDV | Tokens | Raise |
|---|---|---|---|---|
| Pre-seed | $0.015 | $15M | 30M | $450K |
| Seed | $0.025 | $25M | 70M | $1.75M |
| Public | $0.10 | $100M | 80M | $8M |
| **Total** | | | 180M | **$10.2M** |

- Step-ups: pre-seed→seed 1.67×, seed→public 4×, cumulative 6.7× — within the audit's "typical venture progression".
- Audit's marketing rule: an $8M public raise wants roughly $1–1.6M marketing budget → funded from raise + the 5% token bucket.
- Public raise 80% deployed into the protocol's own yield engine (the DFY+/BCI position — consistent with the October plan Tony reviewed), 20% operations. The yield on deployed proceeds funds the early buyback reserve.

## 4. TGE float & liquidity

| Component | Tokens | $ at $0.10 |
|---|---|---|
| Public TGE (20% of 80M) | 16M | $1.6M |
| Ecosystem TGE (2% of 220M) | 4.4M | $0.44M |
| Marketing TGE (5% of 50M) | 2.5M | $0.25M |
| **Sellable float** | **22.9M (2.3%)** | **$2.29M** |
| Liquidity deployment (not float) | ~30M paired + reserve | $3M USDC side |

- LP seeding draft: **$3M USDC + 30M BND** (V3 concentrated ±20% around $0.10 with full-range backstop) + **$1M reactive buyback reserve** (audit's 70/30 lesson).
- Sellable float ($2.29M) vs pool depth ($3M USDC side) — a full-float dump moves price far less than the audit's 62%-crash scenario; verified in simulation.
- Float at TGE 2.3% is deliberately BELOW the Feb doc's 9.25%: with revenue this early ($40–60K/mo), a small float is the only defensible choice. Float grows to ~15–18% by M12 as public+ecosystem vest.

## 5. xBND staking & revenue switch (the investor infrastructure)

| Parameter | Draft value | Note |
|---|---|---|
| Stake | BND → xBND (ERC-4626 receipt, appreciating) | Transferable |
| Unlocked xBND | Bootstrap emissions only (from Ecosystem, capped 24-mo schedule, decaying) | Nosana rule: capped + sunset |
| Locked xBND | 1 / 3 / 6 / 12-mo locks; boosts 1× / 2× / 4× / 8× | Usual UIP-9 pattern |
| Revenue Switch | **30% of Protocol Reserve inflows** → locked xBND, paid in rwaUSD, weekly/monthly epochs | Governance-tunable 0–50% |
| Remaining 70% | Treasury; funds **strategic buybacks** (not automatic burns) | Tony + audit |
| Team/Treasury staking | **Not eligible** while vesting | Optics + fairness |
| Unstake fee | 0% at launch (governance may add later) | Usual's 10% is too much friction pre-maturity |
| Fee-discount burn path | Unchanged (0.44% BND conversion fee, 100% burn) | Already engine-modeled |

## 6. Emissions discipline (Ecosystem 220M)

Budgeted, not automatic — every program has a job:

| Program | Budget | Schedule |
|---|---|---|
| Staking bootstrap (unlocked xBND APR floor) | 60M | 24-mo decaying (front-loaded, sunset M24) |
| Early-LP incentives | 40M | 6-mo linear per campaign (Tony) |
| RWA-market/issuer partnerships | 60M | Per-deal, governance-approved |
| Community campaigns (meaningful sizes only — no dust airdrops) | 30M | Ad hoc |
| Unallocated reserve | 30M | Held |

Audit's rule respected: rewards that don't get used **never enter circulation**.

## 7. What the simulation must prove (acceptance criteria)

1. **Unlock absorption:** worst unlock month's sell-value ≤ plausible buy pressure (organic + switch demand + buyback reserve) without >20% price impact on the modeled pool.
2. **Staking APR honesty:** revenue-switch APR at 20–60% staking participation stays in a credible band (not 0.1%, not 500%).
3. **No cliff synchronization:** pre-seed/seed (M6) and team/treasury (M12) cliffs don't stack into a single dump month against thin liquidity — schedule stays staggered.
4. **Buyback capacity:** treasury share + deployed-proceeds yield ≥ audit-style monthly buy-pressure requirement in every month of Y1–Y3.
