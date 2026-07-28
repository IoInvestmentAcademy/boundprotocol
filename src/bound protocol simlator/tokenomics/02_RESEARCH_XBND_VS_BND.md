# Investor Infrastructure — BND Direct vs xBND (Staked Wrapper)

**Date:** 2026-07-21 · Research + structured comparison + recommendation.

The question: how do investors capture BOUND protocol value —
**Option 1:** hold BND directly (value via buyback/burn only), or
**Option 2:** a staked wrapper (xBND) that receives protocol revenue, the way Usual pays USUALx.

---

## 1. How the reference models actually work (verified 2026-07-21)

### Usual (USUAL / USUALx) — the model the owner referenced

- Stake USUAL → receive **USUALx** (transferable ERC-20 receipt, appreciating exchange rate).
- Two yield layers:
  1. **All USUALx** earns ~22% of daily USUAL emissions (auto-compounds into the exchange rate).
  2. **Only LOCKED USUALx** (1/3/6/12-month fixed locks) earns the **Revenue Switch**: **30% of protocol revenue, paid weekly in USD0** (their stablecoin). Boost factors by lock length: 1×/2×/4×/8×.
- The other **70% of revenue → treasury + open-market buybacks** of USUAL.
- 10% unstaking fee (DAO-governed). Governance rights ride with USUALx.
- Key insight from their UIP-9 "Realign": they MOVED from ~100% distribution to 70% buyback / 30% distribution — direct-payment-heavy models proved reflexive and sell-pressure-prone.

### Comparables

| Protocol | Mechanism | Split | Note |
|---|---|---|---|
| **GMX** | stake GMX, fees in ETH/AVAX (now buyback-based) | ~27–30% of fees to stakers | The original "real yield"; survived multiple cycles |
| **Gains (gTrade)** | gDAI vault is the counterparty | ~90% of revenue to vault | Vault ≠ governance token; different pattern |
| **dYdX** | shifted from emissions → fee-funded staking/buybacks | evolving | Proof that pure emissions rewards fail long-term |
| **Nosana (proposal)** | emissions retargeted to productive actors only; passive pool capped + sunset | — | "Emissions must fund growth, not idle balances" |

Market consensus after 2022–2026: **fee-share to committed stakers + majority-share buyback/treasury** is the standard for revenue-generating protocols. Pure burn models and pure dividend models both lost.

---

## 2. Regulatory reality (US — SEC/CFTC March 2026 joint interpretive release)

Facts that matter for this decision (from the release + law-firm analyses, checked 2026-07-21):

1. **Howey still governs.** The new token taxonomy supplements it.
2. A token that **"distributes revenue, pays dividends, or confers claims on an asset pool" is likely a digital security** (SEC full registration/disclosure). → **Option 1b "BND direct dividends" is the highest-risk design.**
3. **Protocol staking is generally NOT a securities transaction** when rewards are protocol-defined and the facilitator is ministerial (no discretion, no guaranteed returns). **Staking receipt tokens** evidencing staked non-security assets are treated as non-securities.
4. BUT: a receipt token tied to **additional yield-generating activity chosen at a provider's discretion** can itself be a security — the design must keep parameters protocol-defined and governance-set, not company-discretionary.
5. Marketing language matters (expectation-of-profit prong): sell **utility + participation**, never "dividends"/"profit share" in investor-facing copy. Tony's "position as utility token" advice is also the regulatory-safe direction.
6. BOUND already has legal docs in play (DFY legal opinions, VD Law compliance roadmap) — final mechanics must go through VD Law. Nothing here is legal advice.

---

## 3. Structured comparison

| Criterion | Option 1 — BND direct (buyback/burn only) | Option 2 — xBND staking + revenue switch |
|---|---|---|
| Investor yield story | Indirect (supply reduction) — hard to underwrite | Explicit, measurable APR paid in rwaUSD/USDC — easy to underwrite |
| Demand driver | Speculation + fee discounts (~$35K/3yr — measured, negligible) | Locked staking demand; float sink; recurring cash yield |
| Sell-pressure behavior | Unlocks hit spot market directly | Locks absorb unlocks; Usual boosts (1–8×) reward re-locking |
| Regulatory (US 2026) | Buyback/burn = lower risk; **direct dividends = highest risk** | Staking-gated distribution via protocol-defined rules = the pattern regulators just blessed, if implemented ministerially |
| Complexity / audit surface | Minimal (no new contracts) | +1 staking contract, +distribution module (well-trodden: Usual, GMX forks) |
| Reflexivity risk | Burn during low revenue = wasted money (audit's point) | 70% buyback share is discretionary/strategic (Tony's point) |
| Fits BOUND's cash engine | PR is cash (USDC/rwaUSD) — burning it is value-destructive | PR cash can be streamed as-is — no conversion needed |
| Story to VCs | "We burn fees" — 2021 pitch | "Real-yield RWA protocol, staked holders share revenue" — 2026 pitch |

## 4. Recommendation

**Option 2 — xBND, adapted (not copied) from Usual:**

1. **BND** = the base token. Utility positioning: fee discounts (existing 0.44% BND path), staking access, governance-later.
2. **xBND** = staked BND (ERC-4626-style, appreciating exchange rate). Unlocked xBND earns only a small emissions stream from the Ecosystem bucket (bootstrapping, capped + sunset per Nosana logic).
3. **Revenue Switch:** a governance-set % of Protocol Reserve inflows (draft **30%**) is distributed to **locked xBND** (1/3/6/12-mo locks, 1×/2×/4×/8× boosts), paid in **rwaUSD** — which also creates internal rwaUSD demand.
4. **Remaining 70%** of the switched stream → treasury, with **strategic (not automatic) buybacks** from a dedicated reserve, per Tony + audit.
5. Existing **BND-burn fee-discount path stays** (it's small but real utility and already engine-modeled).
6. All parameters protocol-defined + governance-tunable; investor-facing language: "staking rewards from protocol activity", never "dividends".

Numbers check (why this is honest): v8 engine PR ≈ $0.53M cum at M12, $3.03M at M36 (current calibration).
A 30% switch on early PR inflow supports single-digit-to-mid-teens APR on a realistically-sized staked float
at launch valuations — sustainable, and it scales 1:1 with protocol AUM growth. Precise curves: see simulation.

**What we deliberately do NOT copy from Usual:** their emissions-linked-to-TVL minting (BND is fixed-supply), their 10% unstake fee at launch (friction too high pre-product-maturity; start 0–2%), and 100%-distribution history (start at 30%).

---

## 5. Open items for the owner

1. Confirm Option 2 direction.
2. Revenue Switch %: 30% draft — could start 20% and ratchet up by governance.
3. Whether Team/Treasury tokens are allowed to stake for revenue (recommend: **no** during vesting — avoids insider-yield optics).
4. VD Law review of the distribution module before any investor-facing publication.
