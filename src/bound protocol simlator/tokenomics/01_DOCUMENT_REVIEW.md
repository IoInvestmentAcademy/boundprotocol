# Document Review — Findings & Contradictions

**Date:** 2026-07-21. Every provided document read in full. All are marked by the owner as
**outdated / not final** — this review extracts what is still usable and what must change.

---

## 1. `BOUND_Tokenomics_-_2026.pdf` (February 2026) — the current tokenomics

**Structure:** 2B fixed supply ("BNT"), private $0.025 / $2.5M (5%), public $0.10 / $20M (10% + 5% expansion),
team 12%, treasury 30%, ecosystem 20%, liquidity 8%, advisors 5%. TGE float 9.25%. FDV $50M → $200M (4× step-up).

**Problems found (against the audit, Tony's advice, and market norms):**

| # | Problem | Evidence |
|---|---|---|
| 1 | **2B supply** — Tony explicitly recommended 1B ("more familiar, easier to communicate") | Tony meeting; audit made the same point against the old 2.6B |
| 2 | **Token called "BNT"** — everything else (simulator, whitepaper, app) says **BND** | Naming inconsistency across investor docs |
| 3 | **$200M launch FDV with ~$0 product traction** — audit called the comparable $390M FDV "extremely unlikely"; even $200M is aggressive for the current stage | Audit § Public round |
| 4 | **$20–30M public raise** — audit's rule of thumb: raising $X needs 10–20% of X in marketing budget ($2–6M). Not budgeted anywhere | Audit § Overall Recommendations |
| 5 | **No dedicated marketing allocation** — Tony flagged this explicitly | Tony meeting next-steps |
| 6 | **Liquidity 8%** — audit recommends 10–15% | Audit § Missing Liquidity allocation |
| 7 | **No value-accrual mechanism described at all** — the Feb doc is purely supply-side. No staking, no revenue share, no buyback, no burn. Nothing for an investor to underwrite | Whole document |
| 8 | **Public sale 12-mo linear vesting** — better than the old 12-mo cliff, but public buyers locked while insiders watch is still the #1 FUD generator the audit warned about | Audit § Vesting schedules |
| 9 | **Treasury 30% "unlocked for governance purposes"** at TGE — contradicts its own "non-circulating" claim; needs a real vesting schedule | § 7 vs § 10 |
| 10 | **Ecosystem 20% has no vesting schedule stated** | § 2 table |

**What is GOOD and worth keeping:**
- Fixed supply, no inflation authority — keep.
- Private $0.025 with 12-mo cliff + 24-mo linear — reasonable shape (Tony suggested 6-mo cliff + 18-mo vesting as the norm; either defensible).
- 4× private→public step-up is within market norms.
- 9–12% TGE float target — healthy; keep.
- The "expansion capacity" idea (10%→15% public) — keep as optionality.

---

## 2. `Tokenomics Audit_ Bound Protocol.pdf` (Tokenomics.net, 2025-10-01)

Audited the **old** structure (2.6B supply, $100M public raise at $390M FDV, 30–35% TGE unlocks).
That structure is dead, but the audit's **methods and thresholds remain the benchmark**:

**Key reusable findings:**
- **Liquidity depth math:** $5.73M USDC + 38.2M tokens → 1% of TGE supply sold = **11.4% price impact**; 10% sold = **62% crash**. Whatever we launch, sell-pressure vs pool depth must be simulated first.
- **Buy-pressure requirement method:** monthly USD demand needed to absorb unlocks — TGE peak $4.95M, months 13–19 at $3.48M/mo in the old model. Our new schedule must keep this inside plausible protocol buyback capacity.
- **70/30 pool/buyback reserve** reduced max drawdown by 34pp in their dump simulation — adopt a reactive buyback reserve.
- **V3 concentrated liquidity = 25× trade capacity** at same depth, but goes out of range under heavy dumps — use V3 with active management + V2-style full-range backstop.
- **Utility-value proxy:** they valued real BND discount demand at ~$32K/yr vs $58M market cap — "add more utilities" is the core demand-side to-do. **This is exactly what the xBND revenue switch fixes.**
- **Burns are money** — "the goal of a utility token is not to be scarce but to facilitate usage" — prefer strategic buybacks (Tony agreed) over automatic burns.

---

## 3. Tony meeting summary (October 7th) — advisor direction

All still-relevant instructions, status-checked against the Feb 2026 doc:

| Tony's instruction | Feb 2026 doc status |
|---|---|
| 1B total supply | ❌ still 2B |
| Simplify to pre-seed / seed / public | ⚠️ partially (private/public, but no seed split) |
| Reduce 30% TGE unlock for early investors | ✅ now 5% TGE |
| Separate ecosystem allocation from treasury, shorter vesting | ✅ separate 20% — but no vesting stated |
| More marketing funds | ❌ absent |
| **Utility token positioning, NOT governance token** | ❌ doc still leads with "governance" |
| Liquidity incentives for early LPs, ~6-mo linear | ❌ absent |
| Strategic buybacks instead of automatic burns | ❌ mechanism not in doc (burn only in fee path) |
| 6-mo cliff + 18-mo vesting norm for seed | ⚠️ doc uses 12+24 |
| 15% staking yield reasonable | ❌ no staking design at all |
| Review Flying Tulip & HazelFlow for public sale/burn | open |

---

## 4. `BOUND Protocol Financial Model.xlsx` — `Bound Price` sheet analysis

The owner's own AMM price simulation (constant-product pool, 60 months). What it shows:

- Setup: $3M USDC + 20M BND in LP at $0.15; 87.5M initial supply released; 30% pre-staked.
- **Price rockets $0.15 → $0.98 by M5** (buy-pressure assumptions of +40–100%/mo), then **collapses to $0.03 by M7** when month-6/7 unlocks hit (VC + pre-seed 9.26M/mo each + airdrop), grinding at $0.01–0.04 through M23. Slow recovery to ~$0.63 by M60.
- **Diagnosis:** the sheet correctly demonstrates the death spiral the audit warned about — cliff-synchronized unlocks (~18.5M tokens/mo vs an LP holding only ~20M BND) overwhelm any realistic demand. The model's own conclusion: current unlock design destroys the launch.
- Sheet mechanics worth keeping for the new sim: constant-product price impact, staking % of supply, burn feedback from fees, revenue→rewards/burn split (10%/90% in the `Revenues` sheet).
- Limitations to fix in the new sim: price-driven percentage "assumptions" hand-typed per month; staking modeled as negative supply with no yield source; rewards minted from a fixed 150M bucket without APR sanity check; no buyback reserve.

**Tokenomics sheet (same file):** an intermediate structure (1.528B supply — odd number, VC 166M + pre-seed 166M at 30% TGE, public $10M at $0.10) — superseded by the Feb 2026 PDF; ignore except as history.

---

## 5. Example docs (Tony's folder) — what "professional" looks like

- **DR Liquidity ($MOON) audit:** the 13-analysis template (vesting, discounts, ROI, V2/V3 liquidity, max trade, buy pressure, buyback, liquidity required). Our final tokenomics should be able to pass this checklist — it's the rubric Tony's people will re-audit against.
- **Nosana proposal:** the gold standard for *justifying* emissions — every emitted token has a job (pay for GPU readiness), passive staking capped and sunset, rebates burn-on-redeem to avoid supply growth, and a demand/supply simulation with elasticity. Steal: "emissions must fund growth, not idle balances."
- **Roark rewards:** monotonicity/fairness testing of reward formulas via simulation before launch. Steal: prove reward mechanics can't be gamed before shipping.

---

## 6. v8 simulator — what the protocol actually generates (Default preset, 10 markets)

Extracted live from the engine (2026-07-21):

| Milestone | Protocol Reserve (cum) | BCI SC balance | BND burn value (cum) | annG |
|---|---|---|---|---|
| M12 | $0.53M | $0.93M | ~$6K | 12.85% |
| M24 | $1.57M | $3.04M | ~$15K | ~13.2% |
| M36 | $3.03M | $7.47M | $35K | 13.58% |

**Implications for tokenomics design:**
1. **BND burn from fee discounts is tiny** (~$35K over 3 years at 10% usage) — as the audit said, discount utility alone cannot support the token. Confirms the need for a revenue-share/staking utility.
2. **The fundable value stream for BND is the Protocol Reserve** (~$3M cumulative by M36 at current calibration, scaling with AUM). A revenue switch pointing a % of PR (and/or a dedicated BND fee split) at stakers is the honest yield source.
3. Protocol revenue in year 1 (~$0.5M) **cannot absorb multi-million monthly unlocks** — vesting must stay long and float low until revenue scales.

**Simulator BND block (v8, lines ~1383–1401):** 1B supply, private $0.025 × 24.8% = $6.2M, public $0.10 × 10% = $10M, FDV $100M. **This is the freshest owner thinking** — newer than the Feb PDF — and is the baseline used in `03_TOKENOMICS_STRUCTURE.md`.

---

## 7. Cross-document contradictions to resolve (owner decisions)

| Topic | Feb 2026 PDF | Simulator v8 | Excel | Recommendation |
|---|---|---|---|---|
| Total supply | 2B | 1B | 1.53B | **1B** (Tony + audit) |
| Token name | BNT | BND | BND | **BND** |
| Private raise | $2.5M @ $0.025 (5%) | $6.2M @ $0.025 (24.8%) | $5.5M @ $0.033 | ~$3–6M @ $0.02–0.03, ≤15% supply (24.8% to insiders is too high) |
| Public raise | $20M @ $0.10 | $10M @ $0.10 | $10M @ $0.10 | **$6–10M @ $0.08–0.10** unless marketing budget ≥$1–2M |
| Launch FDV | $200M | $100M | $150M ladder | **$80–100M** |
| Value accrual | none | none modeled | burn 90%/rewards 10% of a small stream | **xBND staking + revenue switch + strategic buyback** |
