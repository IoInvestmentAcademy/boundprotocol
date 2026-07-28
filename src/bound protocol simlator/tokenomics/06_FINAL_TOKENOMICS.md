# BND Tokenomics — FINAL (simulation-derived)

**Date:** 2026-07-21 · **Supersedes** `05_BND_TOKENOMICS_DRAFT.md` (which anchored on legacy numbers).
**Method:** every market-facing parameter below was selected by grid-search
(`sim-bnd-optimizer.mjs`, 17,112 configurations tested) against the v8 engine's real
Protocol Reserve revenue, under a **zero-speculation demand model** — the only buyers are
yield-seekers targeting 15% APR. If it works here, it works on fundamentals alone.

## How the numbers were chosen (not assumed)

Feasibility required simultaneously:
- **F1 Cash:** raise covers LP seed + buyback reserve + $1M marketing + $2M ops runway
- **F2a Stress floor:** price never below 40% of launch across 60 months with zero speculation
- **F2b Recovery:** fundamentals alone return price to ≥ launch by month 60
- **F3 Honest APR:** locked-staker APR in a credible band (Y1 ≤ 60%, Y3 8–30%)
- **F4 Defense:** the −10%/month buyback line never runs out of money
- **F5 Liquidity bucket:** DEX pool fits inside a 12%-of-supply liquidity allocation
- **F6 Insiders ≤ 30%**

**Result: of 17,112 configurations, 45 pass — every single one at $0.04 launch ($40M FDV) and a
50% revenue switch.** Higher FDV ($50–60M) fails recovery (revenue can't carry the price back).
Lower prices ($0.01–0.03) fail cash (can't fund the protocol). Weaker switch (20–40%) fails
recovery (not enough staker demand). The market-facing design is therefore *forced*, not chosen.

---

## 1. Supply

| | |
|---|---|
| Token | BND (staked form: xBND) |
| Total supply | **1,000,000,000 — fixed, no mint authority** |

## 2. Allocation & vesting (100%)

| Category | % | Tokens | TGE | Cliff | Vesting | Why (source) |
|---|---|---|---|---|---|---|
| Pre-seed | 3% | 30M | 0% | 6 mo | 18 mo linear | optimizer: larger early cohorts break the stress floor; 6+18 = Tony's norm |
| Seed | 7% | 70M | 0% | 6 mo | 18 mo linear | same |
| Public sale | **15%** | 150M | **15%** | 1 mo | 12 mo linear | optimizer: the raise must reach ~$7.7M for cash feasibility; 15% TGE passed the floor once the 1-month gap desynced it from listing |
| Team | 15% | 150M | 0% | 12 mo | 36 mo linear | norm (audit) |
| Treasury | 20% | 200M | 0% | 12 mo | 48 mo linear | audit: "12 + 36/48 normal" |
| Ecosystem & Rewards | 20% | 200M | 2% | — | 48-mo budgeted programs | remainder; every program has a job (Nosana rule) |
| Liquidity / MM | 12% | 120M | as needed | — | non-discretionary | audit: 10–15%; DEX pool uses 37.5M, rest is CEX/MM reserve |
| Marketing / Growth | 5% | 50M | 5% | — | 24 mo linear | Tony: dedicated marketing bucket |
| Advisors | 3% | 30M | 0% | 12 mo | 24 mo linear | norm |

Insiders (pre-seed + seed + team + advisors): **28%**.

## 3. Capital formation — $7.7M total

| Round | Price | Discount | FDV | Tokens | Raise |
|---|---|---|---|---|---|
| Pre-seed | $0.010 | 75% | $10M | 30M | **$300K** |
| Seed | $0.020 | 50% | $20M | 70M | **$1.4M** |
| Public | **$0.040** | — | **$40M** | 150M | **$6.0M** |

Discount ladder matches the audit's observed venture norms (74% → 42% → 0%).
Step-ups: 2× pre-seed→seed, 2× seed→public, 4× cumulative.

**Use of proceeds (cash plan the optimizer validated):**

| Use | $ |
|---|---|
| DEX liquidity seed | $1.5M |
| Reactive buyback reserve | $2.0M |
| Marketing (audit's 10–20%-of-public-raise rule → $0.6–1.2M) | $1.0M |
| Operations runway + protocol-deployed capital ($2.56M deployed at ~13% engine yield) | $3.2M |
| **Total** | **$7.7M** |

## 4. Market structure at TGE

- Circulating at TGE: **29M BND (2.9%)** ≈ $1.16M sellable value.
- DEX pool: **$1.5M USDC + 37.5M BND** (from the 12% liquidity bucket), V3 concentrated with full-range backstop.
- **$2M buyback reserve** defends a −10%-per-month line; replenished by 50% of the treasury's revenue share + ~$28K/mo yield on deployed proceeds. In simulation it dips to $87K at M24 and rebuilds to $2.65M by M60 — never dry.

## 5. xBND — the investor infrastructure

| Layer | Mechanic |
|---|---|
| Stake | BND → xBND (appreciating receipt, transferable) |
| Locks | 1 / 3 / 6 / 12 months · revenue boosts 1× / 2× / 4× / 8× |
| **Revenue Switch** | **50% of Protocol Reserve inflows → locked xBND, paid in rwaUSD** |
| Treasury share | 50% of PR inflows → treasury; half of that stream feeds the buyback reserve |
| Unlocked xBND | Bootstrap emissions only (from Ecosystem, 24-mo decaying, hard sunset) |
| Fee discount | Conversions paid in BND: 0.44% vs 0.88%, BND 100% burned (already engine-modeled) |
| Exclusions | Team & Treasury cannot stake while vesting |
| Positioning | Utility & participation token. Never the word "dividends". Legal pass (VD Law) before publication |

**Why 50% and not Usual's 30%:** BOUND's early revenue base is smaller than Usual's was at TGE;
the optimizer shows 20–40% switches cannot generate enough staking demand for the price to
recover on fundamentals. At 50% the protocol still keeps half of PR for treasury/buybacks.
Governance can ratchet DOWN later as revenue scales — lowering is easy, raising is hard.

## 6. Simulated outcomes (zero-speculation stress case)

| Milestone | Circulating | Price | vs launch | Locked APR | Buyback reserve |
|---|---|---|---|---|---|
| TGE | 2.9% | $0.0360 | −10% | — | $1.69M |
| M6 | 11.8% | $0.0297 | −26% | 11.1% | $1.30M |
| M12 | 25.2% | $0.0296 | −26% | 7.8% | $648K |
| M24 | 51.7% | $0.0270 | −32% | 8.5% | $87K |
| M36 | 68.1% | $0.0172 | −57% (trough) | 16.4% | $569K |
| M48 | 83.0% | $0.0304 | −24% | 12.1% | $1.36M |
| M60 | 88.0% | **$0.0491** | **+23%** | 11.9% | $2.65M |

Average locked-xBND APR: **~22% in year 1, ~11–12% steady-state.** Worst trough −57–58%
around M33–38 (treasury+team vesting overlap) — with **zero** speculative demand modeled.
Any real-world speculative/narrative demand sits on top of this floor. At 5× protocol scale
the trough shallows dramatically (per `04_SIMULATION_RESULTS.md` sensitivity).

## 7. Investor outcomes at the fundamentals-only path

| Round | Entry | Break-even vs trough | Value at M60 fundamentals price ($0.0491) |
|---|---|---|---|
| Pre-seed $0.010 | fully vested by M24 | in profit at every simulated month | **4.9×** |
| Seed $0.020 | fully vested by M24 | under water only in trough months | **2.5×** |
| Public $0.040 | fully vested by M13 | −57% worst mark | **1.23×** (fundamentals only) |

## 8. What changes if the protocol scales faster

The $40M FDV cap is a consequence of the engine's **current** revenue calibration
(PR $63K→$402K/mo over 60 months). If AUM onboarding runs ahead of the default preset —
more markets, faster growth — re-run the optimizer; the feasible FDV rises with revenue.
The discipline stands: **launch FDV is what the simulation supports, not what the market
might tolerate.**

---

*Reproduce everything: `node tokenomics/sim-bnd-optimizer.mjs` (grid + chosen-config trajectory),
`node tokenomics/sim-bnd-tokenomics.mjs` (scenario detail). Revenue source: live v8 engine, Default
preset, 10-market lineup.*
