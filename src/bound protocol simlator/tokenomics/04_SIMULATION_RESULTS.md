# BND Tokenomics Simulation — Results v1

**Date:** 2026-07-21 · Model: `sim-bnd-tokenomics.mjs` · Revenue source: **live v8 engine**
(Default preset, 10 markets — PR inflow $63K M1 → $143K/mo M36, extrapolated +4.4%/mo to M60).

## What the model does

60-month simulation of the draft structure in `03_TOKENOMICS_STRUCTURE.md`:
unlock schedule → float; 40% of float staked (70% of that locked); Revenue Switch 30% of PR
to locked xBND; **demand side modeled honestly** — the ONLY buyers are yield-seekers who buy
until locked APR compresses to 15% (Tony's number), capped at $400K/mo inflow. No speculative
demand at all. Sell side: 30–60% of each unlock sells immediately. Constant-product pool
($3M USDC + 30M BND), $2M reactive buyback reserve defending −10% months, funded by 50% of the
treasury's revenue share + yield on deployed raise proceeds.

This is deliberately **pessimistic on demand and conservative on sells** — a stress case, not a forecast.

## Headline results

| Scenario | Min price (60 mo) | Y1 avg locked APR | Y3 avg locked APR | Buyback reserve M60 |
|---|---|---|---|---|
| BASE (engine as-is) | $0.0127 (−87% vs $0.10) | 12.2% | 11.2% | $6.0M |
| 5× protocol scale | $0.0425 (−57%) | 42.0% | 14.1% | $18.8M |
| 10× protocol scale | $0.0536 (−46%) | 79.0% | 15.9% | $36.6M |

Acceptance checks (base): APR credibility **PASS** · worst unlock month vs pool depth **PASS**
($701K sell vs $3M USDC) · buyback reserve never exhausted **PASS** · price floor −20% **FAIL**.

## The key finding (same one the audit made, now quantified)

**At current engine revenue, a $100M FDV launch cannot hold without speculative demand.**
The staking yield at 15% target APR only "justifies" ~$1–3.5M of locked value in year 1
(30% × ~$45–80K/mo × 12 ÷ 15%). With zero speculation modeled, price drifts down to
fundamental-value territory (~$12–30M market cap on float) and then **recovers with revenue**
($0.013 floor → $0.034 by M60, steadily climbing). The structure is sound; the **valuation is
ahead of the current revenue calibration** — exactly the audit's "$32K utility demand vs $58M
market cap" point, reproduced with our own engine numbers.

At 5–10× protocol scale (which is what the raise is FOR), the same structure holds a −46 to −57%
worst drawdown in a zero-speculation stress case and delivers a credible 14–16% steady-state
locked APR — a genuinely fundable story.

## What already got tuned from sim v1 → v1.1

| Change | Why |
|---|---|
| Public TGE 20% → **10% + 1-mo gap** | TGE was the worst sell month ($1.1M) — halved it |
| Buyback reserve $1M → **$2M** | v1 exhausted the reserve defending TGE |

## Levers for the owner (in order of impact)

1. **Launch FDV.** $100M → $40–60M ($0.04–0.06 public price) closes most of the fundamentals gap
   on its own; combine with a smaller public tranche if raise target allows.
2. **Protocol scale at TGE.** Every month of pre-TGE AUM growth de-risks the launch — the 5×
   scenario is the sensible "launch when" gate. (5× PR inflow ≈ $200–400K/mo — reachable per the
   engine's own AUM growth trajectory with more/larger markets.)
3. **Revenue switch %.** 30% draft. Raising it lifts APR and demand but drains the buyback side.
   Sensitivity at base: 20% staking participation → 18.3% Y1 APR; 60% → 10.5%.
4. **Sell-through assumptions.** We model 50–60% of investor unlocks selling instantly. Real
   cohorts with revenue-paying locks re-lock instead — the 1×/2×/4×/8× boosts exist to pull
   this number down. Every 10pp less sell-through raises the price floor materially.

## Next runs to do after owner decisions

- Re-run with chosen FDV/pricing ladder.
- Add V3 concentrated-liquidity pool model (audit showed 25× capacity at same depth).
- Add lock-mix dynamics (1/3/6/12-mo cohorts and re-lock behavior) instead of a flat 70%.
- Cross-check against the audit's buy-pressure-requirement method month by month.
