# BND Tokenomics — Engineering Handover

> Complete logic reference for the BND Tokenomics feature of the BOUND Simulator.
> Written so a fresh AI (or engineer) can continue the work without re-deriving anything.
> **Last updated:** 2026-07-23 · Architecture v4 · 36-month horizon.

---

## 0. TL;DR / current state

- The **Tokenomics** feature is a self-contained page inside the single-file React app `src/BoundSimulator.jsx`. It is a "what-if" simulator for the **BND token** (BOUND's governance token), driven by the main app's **Protocol Reserve revenue** series.
- It has two views (`tView`): **assumptions** (sliders) and **results** (charts/tables), mirroring the main sim's inputs→results pattern.
- A **professional audit document** exists at `public/bound-tokenomics-audit.html`, opened from a button on the results page.
- **Base case (current defaults):** launch $0.05 → **+162.5% at M36** ($0.1313), trough **−24.1% @ M10**, sell/buy **0.87×**, burned 11.26M (1.13%), Burn Engine M36 $6.19M. Supply reconciles exactly. Staking APY holds at target 10%. (Numbers updated 2026-07-24 after: burnApy 9→4%, 4-way raise split with Emergency Reserve, Extended Seed $3.7M/$0.046. The thinner $5.95M pool raises both the M36 return and the drawdown vs. the prior $6.75M-pool base case.)
- **⚠ Known fragility (2026-07-24):** with the thinner pool, toggling **Extended Seed OFF** drops the pool to $2.25M and the persistent yield-seeking demand overwhelms it → the price diverges to a nonsensical value. Default path (extSeed on) is fine. `demandStrengthPct = 1.5` was tuned for the old $6.75M pool; lower it if the extSeed-off config must be usable.
- **The model is revenue-dependent** — every buy engine ultimately traces to Protocol Reserve revenue (~$3.0M over 36 months, ~$83K/mo).

---

## 1. Where everything lives

All code is in **`src/BoundSimulator.jsx`** (single-file app). Key anchors (line numbers drift as the file is edited — search by name):

| Symbol | ~Line | Purpose |
|---|---|---|
| `TOKENOMICS_BUCKETS` | 1186 | The 9 allocation buckets (array of keys) |
| `bucketMonthlyUnlock(...)` | 1188 | TGE/cliff/linear vesting math for one bucket in month `m` |
| `stakingEmission(...)` | 1204 | Public-staking-pool reward emission (target-APY design) |
| `runTokenomicsSim(a, prSeries)` | 1210 | **The core engine.** Returns `{ rows, catTokens, stakingBudget }` |
| `SliderGrid({items})` | 1437 | Layout helper — caps sliders at 3/row with dashed dividers |
| `TokenomicsPage({ sim })` | 1454 | The full page component (state + derived data + JSX) |
| `{view === "tokenomics" && <TokenomicsPage sim={sim} />}` | 6590 | Mount point inside `BoundSimulator` |

Related files:
- **`public/bound-tokenomics-audit.html`** — the standalone audit doc (served by the app; opened from a button).
- **`src/BoundLegend.jsx`** — the Documentation page; **authoritative source for protocol mechanics** (assets, 10 revenue streams). Read this before describing the protocol.
- Diagnostic harness (not shipped): `/private/tmp/.../scratchpad/diag/` — see §9.

`sim` (the prop) is the main app's `simulate()` output; the engine reads `prSeries[m-1].totalPr` (net Protocol Reserve revenue) each month.

---

## 2. The protocol in one paragraph (real terms — NOT "DFY/DFY+")

BOUND is an **RWA liquidity protocol**. It issues **rwaUSD** (the RWA liquid dollar, 100% USDC-backed, peg defended by the **APSS** on a Uniswap-v4 pool). LPs deposit USDC and hold **BCI** (the LP index token that accrues fee revenue). **BND** is the governance/utility token (this feature's subject); **xBND** is locked BND that earns the Revenue Switch. The protocol earns from **10 fee streams**, each split between the **BCI SC** (LP holders, usually 80%) and the **Protocol Reserve** (usually 20%). **The Protocol Reserve's revenue is what funds the BND token economy** modeled here. (An older Tokenomics.net PDF called the assets "DFY/DFY+" — that is stale; do not use it.)

---

## 3. The token model — assumptions (defaults)

All are `useState` in `TokenomicsPage`. Total supply = **1,000,000,000 BND** (hard-coded in `assumptions.totalSupply`).

### 3.1 Capital formation (rounds)
| Round | Raise | Price | Tokens | % supply | FDV |
|---|---|---|---|---|---|
| Seed | $2,480,000 | $0.0248 | 100M | 10% | $24.8M |
| Extended Seed | $3,700,000 | $0.046 | 80.4M | 8.04% | $46M |
| Public (= launch) | $7,500,000 | $0.05 | 150M | 15% | $50M |

*(Extended Seed updated 2026-07-24: was $3.0M/$0.0375. Allocation total now 100.04% — inside the ±0.6% green tolerance.)*

Round token counts are **derived** (`raise / price`). Price sliders use `step 0.0001` / 4-decimal display so these land exactly. `extSeedOn` toggles Extended Seed.

### 3.2 Allocation buckets (the other 67%)
`alloc` = `{ community:30, team:12, liquidity:12, treasury:9, marketing:2, advisors:2 }`.
Buckets (67%) + rounds (33%) = **exactly 100%**. Validation warns if `|total−100| > 0.6` (search `allocTotal`).

### 3.3 Vesting (`vestState`) — `{tge%, cliff months, linear months}`
```
seed:      {0,  6,  24}     team:      {0,  12, 36}
extSeed:   {0,  12, 36}     advisors:  {0,  12, 24}
public:    {15, 0,  12}     community: {5,  0,  24}
treasury:  {5,  12, 48}     marketing: {5,  0,  24}
```
`liquidity` has NO vesting — it seeds the AMM (see §5). `extSeedCliff` is a separate state merged into `vest.extSeed.cliff`.

### 3.4 Revenue split & Burn Engine
- `burnSplitPct = 80` → 80% of Protocol Reserve revenue to the Burn Engine, remainder (20%) to xBND.
- `burnApy = 4` → the Burn Engine cash portfolio earns 4%/yr; **only the yield is spent** on buyback+burn. (Was 9%; lowered 2026-07-24 — roughly halves lifetime burns.)
- **Public raise is now a 4-way split** (`burnSeedPct = 100 − liq − company − emergency`): `publicSplitLiquidity = 30`, `publicSplitCompany = 10`, `publicSplitEmergency = 10` → **30% liquidity / 10% company / 10% Emergency Reserve / 50% Burn Engine seed**. (Emergency Reserve added 2026-07-24; it's a set-aside protocol safety buffer — tracked, not active in the sim, like Company. Split was 50/15/–/35.)

### 3.5 Market behaviour
- `sellThrough = { investor:18, public:25, team:18, community:20 }` — % of each cohort's monthly unlock sold. (treasury = 0, hard-coded in `sellRate`.)
- `stakePct = 100` — % of unsold investor unlocks locked into xBND.
- `unstakeChurn = 3`, `unstakeSoldPct = 50` — monthly xBND unstake %, and % of that sold.

### 3.6 Public Staking Pool & demand
- `stakingRewardPct = 15` — the staking reward slice as **% of the Community allocation** (15% × 300M = 45M BND). **NOT a separate budget** — it is carved from Community supply (see §6). Owner-directed change: there is no standalone "staking reward budget."
- `targetStakingApy = 10` — pool pays 10% APY in BND on staked balance.
- `publicStakePct = 20` — % of unsold non-investor unlocks staked into the public pool.
- `publicUnstakeChurn = 3`, `publicUnstakeSoldPct = 50`.
- `demandStrengthPct = 1.5` — **yield-seeking demand** as % per month of the circulating float **valued at launch price** (see §7). **NO fixed dollar cap, NO benchmark gate** (owner-directed removal).
- `orgVolumePct = 3`, `orgBuyBalance = 50` — organic monthly volume as % of circulating mkt cap, split buy/sell (50 = neutral).

---

## 4. The engine — `runTokenomicsSim(a, prSeries)`

Monthly loop, `m = 1..months` (36). Each iteration:

1. **Revenue split:** `prRevenue = prSeries[m-1].totalPr`. `burnFlow = prRevenue × burnSplitPct%` → Burn Engine; `xbndFlow = prRevenue − burnFlow` → xBND. `burnEngineBalance += burnFlow`; `yieldUsd = burnEngineBalance × burnApy%/12`.
2. **Unlocks:** for each bucket, `bucketMonthlyUnlock(vestTokens[k], ...)` → `newUnlocked[k]`, accumulate into `vestedCum[k]`. NOTE `vestTokens.community = catTokens.community − stakingBudget` (the carve-out is removed from normal community vesting).
3. **xBND unstake churn** (seed/extSeed only) → `soldByCohort`.
4. **Public-pool unstake churn** → `soldFromUnstakePublic`.
5. **Cohort sells:** `newUnlocked[k] × sellRate%` added to `tokensSold` (per-cohort for seed/extSeed/public; lumped for others).
6. **Organic volume:** `orgVolumeUsd = priorCirculating × priorPrice × orgVolumePct%`; split into `orgSellUsd`/`orgBuyUsd` by `orgBuyBalance`. `orgSellTokens` added to `tokensSold`.
7. **Sell trade (AMM):** one blended sell of `tokensSold` through the constant-product pool (0.3% fee). Updates `usdcReserve`/`bndReserve`, sets interim `price`. `avgSellPrice` attributes proceeds back per cohort (`cumSellProceeds`, `cumSoldTokens`).
8. **xBND staking:** unsold seed/extSeed unlocks × `stakePct` → `lockedXbnd`.
9. **Public-pool staking:** unsold non-investor unlocks × `publicStakePct` → `publicStaked`.
10. **Staking emission:** `stakingEmissionNow = stakingEmission(remainingBudget, targetStakingApy, publicStakedBeforeEmission)`. **Uses the PRE-emission balance** as both the emission input AND the APY denominator (critical — see §8). `cumStakingEmissions += emission`. `impliedPublicApy` computed off pre-emission balance = exactly the target.
11. **Yield-seeking demand:** `demandUsd = stakingEmissionNow>0 ? priorCirculating × publicPrice × demandStrengthPct% : 0` (anchored to LAUNCH price — see §7).
12. **Buy trade (AMM):** `totalBuyUsd = yieldUsd + orgBuyUsd + demandUsd`, one blended buy. `burnedNow` = the share bought by `yieldUsd` (these are burned → `cumBurned`); `demandBought` is staked into the pool. Final `price`.
13. **xBND Revenue Switch:** `xbndFlow` distributed pro-rata by locked value → `dist.seed/extSeed` (rwaUSD). **Price cancels algebraically** — distribution $ is price-independent; only token share & PR revenue matter. **While no xBND is locked** (pre-Seed-cliff, M1–M6 on defaults) the flow is **redirected into `burnEngineBalance`** instead of dropped (`xbndRedirected`/`cumXbndRedirected` row fields; owner-directed 2026-07-23, audit finding F-1 — previously $41,340 of M1–M6 flow silently vanished). Both monthly-breakdown tables display the redirect as its own row.
14. **`circulating`** = Σ vestedCum (excl. liquidity) − cumBurned + cumStakingEmissions. Push a row (~35 fields).

**Supply invariant (verified):** `Σ byBucket + cumStakingEmissions − cumBurned === circulating`, exactly.

---

## 5. AMM / pool seeding — **cash-constrained** (IMPORTANT)

```js
liquidityUsdSeed = extSeedRaised + publicRaised × publicSplitLiquidity%   // = $5.95M (3.7M + 30%×7.5M)
usdcReserve = liquidityUsdSeed                                            // real cash only
bndReserve  = usdcReserve / publicPrice                                   // = 119M @ $0.05
```
- Pool = **$5.95M USDC / 119M BND @ $0.05**. Liquidity/FDV = 11.9%. (Was $6.75M/135M/13.5% before the 2026-07-24 change to the raise split — liquidity cut 50%→30%, partly offset by the larger $3.7M Extended Seed.)
- The 120M **Liquidity allocation** is the *reserve* the 119M BND side is drawn from; it is **not** added as extra depth.
- **DO NOT** re-introduce "protocol-owned liquidity" that pairs the full 120M allocation with invented USDC. That was a bug (it conjured ~$6M of treasury USDC that does not exist — the total raise is only $12.98M and is already allocated). Pool depth is bounded by real cash. See §8.
- Constant-product (Uniswap-v2 style), 0.3% fee, on `usdcReserve`/`bndReserve`.

---

## 6. Public Staking Pool — funded from Community

- `stakingBudget = catTokens.community × stakingRewardPct%` (= 45M). Carved OUT of Community; `vestTokens.community` is net of it. No new supply minted; hard sunset when exhausted.
- Emission (`stakingEmission`): `desired = currentStaked × targetApy%/12`, capped by remaining budget. Target-rate design (holds APY at target, not a front-loaded curve).
- Return value is named `stakingBudget`; in `TokenomicsPage` it's destructured as **`stakingBudgetClamped`** to avoid colliding with... (there is no longer a `stakingBudget` state — it was replaced by `stakingRewardPct`, but the alias name is retained).

---

## 7. Yield-seeking demand — anchored, non-reflexive

```js
demandUsd = stakingEmissionNow>0 ? priorCirculating × a.publicPrice × demandStrengthPct%/100 : 0
```
- Sized as % of circulating float valued at **LAUNCH price** (`a.publicPrice`), NOT live price.
- **Why:** anchoring to live market cap creates a runaway `price↑→mcap↑→demand↑→price↑` loop (tested: it blew the token to 40× / +10,000%). Anchoring to launch price makes demand track *adoption* (supply unlocked), not the price it is itself moving.
- Switches off when `stakingEmissionNow == 0` (reward slice exhausted).
- Sensitivity (on the $6.75M pool): 0.5%→−25%/M36, 1.0%→+~40%, **1.5%→+139% (current default)**, higher → increasingly explosive. Dial DOWN for a calmer base case.

---

## 8. Bugs fixed (do not reintroduce)

1. **Dead demand mechanism** — old design gated demand behind a 12% benchmark while APY was 10%, so demand was $0 every month → 91% price collapse. Removed the benchmark + fixed dollar cap entirely; replaced with the anchored %-of-float driver above.
2. **Reflexive demand explosion** — first replacement anchored demand to *live* market cap → 40× runaway. Fixed by anchoring to launch price (§7).
3. **Invented treasury USDC** — a "POL" seeding change paired the full 120M Liquidity allocation with ~$6M of USDC that doesn't exist, doubling reported pool depth. Reverted to cash-constrained seeding (§5).
4. **Staking APY denominator timing** — emission/APY must use the PRE-emission staked balance, else the displayed APY under-reads the target.
5. **774% month-1 APY** — the original decaying-schedule emission paid a large fixed amount against a tiny staked base. Replaced with the target-rate design (§6).
6. **Audit used month-1 pool snapshot** as the "launch pool" and measured price impact from launch price against an already-drifted pool → overstated. Audit now uses the pristine $0.05 seed.
7. **Pre-cliff xBND flow leak (F-1, fixed 2026-07-23)** — the Revenue Switch dropped `xbndFlow` in months with no locked xBND (M1–M6, $41,340 = 6.9% of the slice): not distributed, not accrued, nowhere. Now redirected to the Burn Engine principal (see §4 step 13). Do not revert to the silent-drop behavior; if the destination should change, that's an owner decision.

---

## 9. Verification harness (numeric truth, not guessing)

Pattern used throughout (in scratchpad `diag/`):
1. `sed -n '1188,1434p' src/BoundSimulator.jsx > tokenomics-engine.part.js` (extract the live engine).
2. Wrap in `new Function(...)` with `const TOKENOMICS_BUCKETS = [...]` prepended, `module.exports = { runTokenomicsSim }`.
3. Feed the real `sim` PR series (from `combined.mjs`, a reconstruction of `simulate()`), run with the default assumptions object, print numbers.
- Re-extract after EVERY engine change (line ranges drift).
- To instrument extra fields, patch the `rows.push({ m, price, ... })` line to add `sellUsdOut, tokensSold, yieldUsd_d:yieldUsd, demandUsd_d:demandUsd, orgBuyUsd_d:orgBuyUsd`.
- Always verify the supply invariant (§4) after changes.

---

## 10. Results-page derived data (what the UI renders)

In `TokenomicsPage`, computed from `tRows`: `priceChart`, `burnChart`, `vestingAreaData` (+`stakingEmissions` series), `prRevChart`, `unlockChart`, `supplyStackData`, `xbndRateChart`, `xbndCumDistChart`, `burnTreasuryChart`, `publicPoolChart`, `publicStakeIllustration`, `investorCashFlowRows`, `investorSummary`, `allocSummary`, `tokenomicsRows`, `burnTreasuryRows`, `warnings`. KPIs: `maxDrawdown`, `pctSupplyBurned`, `tgeFloat`/`tgeFloatPct` (uses `communityVestable` = community − staking carve-out, **and includes Treasury's TGE slice** since 2026-07-23 — owner-directed audit fix F-7, so the KPI equals the engine's actual m=0 unlocks, 4.08% on defaults), `stakingBudgetRemaining`. Reusable components: `CollapsibleSection`, `Slider` (has `hint`), `SliderGrid`, `KPI`, `SectionTitle`, `FeeTable`, `RowMeaningCard` (the "— What Each Row/Column Means" description card that mirrors the main sim page; `items` = `[{row, col?, what}]`, rendered as a responsive grid — one precedes each major Results table). Theme tokens: `T`, `SHADOW`, `MONO`, `SANS`, `RC`.

Assumption sections (order): 1 Capital Formation → 2 Allocation → 3 Vesting → 4 Revenue Split & Burn Engine → 5 Market Behaviour → 6 Public Staking Pool & Market Demand.

---

## 11. Navigation

- **Primary nav** (segmented control, header of `BoundSimulator`): `Simulator · Tokenomics · Documentation`. `view` ∈ `inputs|results|tokenomics`; Documentation calls `onOpenDocs` (App switches to `BoundLegend`).
- The main SCENARIO bar is hidden when `view === "tokenomics"` (Tokenomics has its own `tView` sub-nav: "See Tokenomics Results →" / "← Back to Tokenomics Inputs").
- Audit button: on the Tokenomics **results** view, a green link `🛡️ View Professional Tokenomics Audit ↗` → `/bound-tokenomics-audit.html` (target=_blank).

---

## 12. The audit document (`public/bound-tokenomics-audit.html`)

Standalone HTML (own `<head>`/theme; responds to OS light/dark). **Now SCRIPT-GENERATED** — do not hand-edit the HTML; edit `scripts/build-audit-report.mjs` and regenerate:

```
node scripts/build-audit-report.mjs
```

The script extracts the live engine + defaults from `src/BoundSimulator.jsx` (same slicing as the `diag/` harnesses), runs the base case, and emits the full report — inline SVG charts (13, generated from the real series) + tables + KPIs, all data-accurate by construction. **This permanently fixes the stale-doc problem (old findings F-5/E3): after any default change, just re-run the script.** Reuses the existing CSS (`<style>` block is read back from the current HTML each run) plus a small chart-color var block.

Structure (rebuilt 2026-07-24 to mirror the Tokenomics.net audit PDF the owner supplied):
- **Part I Mechanism Design:** M1 Exec Summary · M2 Business Model (rwaUSD/BCI/BND/xBND) · M3 Platform Fee Channels (10-stream table) · M4 Tokenomics & Utility · M5 Stakeholder Analysis · M6 Value Accrual & Game Theory.
- **Part II Audit (each: chart/table → Interpretation → Analysis & Insights → Potential Risks):** 01 Vesting (stacked-area + unlock charts + allocation table) · 02 Capital Formation & Discounts · 03 Investor ROI (cohort table) · 04 Protocol Reserve Revenue · 05 BND Price Path · 06 Burn Engine · 07 xBND Revenue Switch · 08 Public Staking Pool (+$10k illustration) · 09 Supply Composition · 10 Liquidity Depth & Price Impact · 11 Max Trade Size · 12 Buy-Pressure Requirement.
- **Part III:** Conclusion + recommendations. Verdict **A– "Structurally sound, revenue-dependent"** (10 Pass / 2 Caution / 0 Critical).
- Charts mirror the Results page: vesting stack, monthly/cum unlocks, PR revenue, price path, burn balance/spend + BND burned, xBND rate + cum rwaUSD, staking pool dual-axis, supply composition (3-band). Pool math (price-impact, max-trade) computed on the launch pool in-script.
- Base case reflected: launch $0.05 → +162.5% M36 / −24.1% DD / burned 11.3M (1.13%) / pool $5.95M-119M / Liq-FDV 11.9% / sell-buy 0.87× / PR cum $3.0M. `AUDIT_REPORT_BUILD_CHECKLIST.md` tracks the rebuild.

---

## 13. Open decisions / next steps

- **Base-case volatility:** +139%/−21% is healthy-but-volatile because the pool is thin ($6.75M). To calm it, lower `demandStrengthPct` default (1.5→1.0) OR deepen the pool (raise `publicSplitLiquidity`, but that starves the Burn Engine seed). Owner has not chosen.
- **Liquidity depth (13.5% of FDV)** is the low end of the healthy band. Real options: route more of the public raise to liquidity, or commit genuine treasury USDC (only if it actually exists).
- **Audit is a static snapshot.** Consider wiring the audit's key numbers from the engine, or add a "regenerate" note. For now: rerun harness after any default change and update the HTML.
- **Preset:** the tokenomics defaults are page-local (`useState`), independent of the main app's `PRESETS.default`. Not yet linked.

---

## 14. Guardrails (owner-stated, honor these)

- **Do not** break/alter the existing main simulation or its graphics — Tokenomics is additive only.
- **Make no assumptions** about the economic model — ask the owner when unsure.
- **No invented money.** Every dollar in the model must trace to a real source (the $12.98M raise + Protocol Reserve revenue). The treasury does NOT have spare USDC beyond the raise.
- **Verify numerically** (harness) before claiming a fix works; check the supply invariant.
- Match the platform's existing design system for any new UI.
