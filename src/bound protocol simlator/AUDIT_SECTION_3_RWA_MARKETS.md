# Section 3 Audit — RWA Markets (Liquidation & Minting)

**Status: CRITICAL bug found and fixed** — the "RWA Collateral %" concentration metric,
shown prominently to investors, was overstating real RWA risk by 30–45 percentage points
once several markets were live. Root cause and fix below. Checklist filled in at the
bottom per `AUDIT_CHECKLIST_TEMPLATE.md`.

**Handoff index:** merged changelog + slider ownership → `HANDOFF.md` (§ Changelog — Section 3).

---

## 1. Logic, in plain English

Each RWA market (issuer partnership) has its own timeline and economics:

1. **AUM compounds monthly** from a launch value at the market's own growth rate.
2. **Liquidation opens at launch.** Monthly demand = AUM × liquidation rate%. Capacity
   is allocated in strict order each month (2026-07-09 redesign): estimated USDC on
   hand + pipeline cash returning this month → **BCI redemptions served FIRST** (LP
   exits are an obligation; RWA service is discretionary) → an **LCR guard** caps
   acceptance so the projected month-end LCR never drops below `rwaLcrTarget`
   (default 1.5 = the protocol can never be pulled out of HEALTHY mode by RWA
   crowding) → whatever remains serves market demand, split **pro-rata by demand**
   across markets. Each market's liquidation revenue (haircut + trade fee) is
   calculated on its own **served** volume, not its raw demand.
3. **Minting opens later** (default: launch + 8 months) — this represents the delay
   needed to build up sellable RWA inventory before BOUND can offer a buy-side service.
   Minting demand is capped by **that specific market's own held inventory** — BOUND
   cannot sell OUSG to satisfy demand for BUIDL. The **minting discount** (preventive
   concentration ladder + reactive stress ladder) is genuinely applied to the mint
   haircut with a one-month lag (fixed 2026-07-09 — it was previously display-only).
4. **Held inventory is capped two ways**, checked in order: per-market (`mkMaxPct`, 10%
   of the Layer) first, then category-wide across all markets combined (`maxRwaPct`,
   20%). Whatever exceeds either cap routes to an **issuer-redemption pipeline** — a
   PER-MARKET ledger since 2026-07-09: each market's overflow is cash in transit that
   returns after that market's OWN `issuerRedemptionDays` (a T+90 real-estate market
   no longer drains at a T+30 blended average).
5. **A gentle 3-step escalation ladder** bumps a market's effective haircut and trade fee
   as concentration rises — both for that specific market and for the category total —
   discouraging further concentration without being punitive.
6. **Integration fee** (one-time, at launch) and **maintenance fee** (recurring monthly)
   are straightforward per-market fixed costs, split 0/100 and 20/80 to BCI SC/PR.

## 2. Formulas + worked example — M12, 3-market fixture (OUSG/BUIDL/PC), engine-verified

```
aum(m)          = launchAUM × (1 + aumGrowth%)^(months since launch)
liqDemand       = aum × liqRate%                    (open from launch)
mintDemand      = mintOpen ? aum × mintRate% : 0    (open from mintStartMonth)

// Capacity waterfall (2026-07-09 redesign)
estUSDC%        = max(minBufferPct, 100 − (heldPrior + pipelinePrior)/layerPost × 100)
layerUSDCAvailable = layerPost × min(estUSDC%, 80)/100
pipelineReturn  = Σ pipelinePrior(mkt) / max(1, issuerRedemptionDays(mkt)/30)   // per-market drain
funds           = layerUSDCAvailable + pipelineReturn
bciServed       = min(bciQueue + desiredBCIExits, funds)                        // BCI SENIOR
rwaLcrCap       = max(0, (layerPost − heldPrior − pipePrior + pipelineReturn + expectedMint
                          − T·desiredBCIExits) / (1 + T·rwaCoverageDays/30)),  T = rwaLcrTarget+1e-3
rwaLiq          = min(funds − bciServed, rwaLcrCap, totalLiqDemand × stressThrottle)

// Allocation + revenue per market, on SERVED volume, at the EFFECTIVE rate
liqServed(mkt)  = liqDemand(mkt) × rwaLiq/totalLiqDemand      // pro-rata by demand
mintServed(mkt) = min(heldInventory(mkt), mintDemand(mkt))
haircutRev(mkt) = liqServed × effectiveLiqHaircut% + mintServed × effectiveMintHaircut%
tradeRev(mkt)   = (liqServed + mintServed) × effectiveTradeF%
effectiveLiqHaircut  = baseline + categoryBump + marketBump   (each ladder step capped +0.30pp/+0.15pp)
effectiveMintHaircut = baselineMintHaircut × (1 − appliedMintingDiscount/100)   // prior-month discount
```

**M12, engine-verified 2026-07-09** (`PRESETS.default`, markets OUSG/BUIDL/PC at
$410M/$550M/$180M, `rwaLcrTarget` 1.5):

```
totalLiqDemand = $11,273,151   rwaLiq (accepted) = $4,789,837   rwaMint = $1,220,912
layerUSDCAvailable = $3,891,855   pipelineReturn = $3,504,356   bciServed (senior) = $314,567
rwaLcrCap = $4,789,837 (the binding constraint this month)   LCR = 1.501 · HEALTHY
appliedMintingDiscount = 60% (held at the category cap → preventive ladder, prior-month value)

Per market (all correctly capped at held = $643,997 = exactly 1/3 of the $1.93M category
cap, split evenly since all three markets are equally concentrated at this point):
  OUSG   liqServed $1,732,811  mintServed $610,456  haircut 0.80%  mintHc 0.120% (0.3 × 40%)  tradeF 0.45%
  BUIDL  liqServed $1,993,091  mintServed $610,456  haircut 0.70%  mintHc 0.120% (0.3 × 40%)  tradeF 0.45%
  PC     liqServed $1,063,936  mintServed       $0  haircut 1.10%  mintHc 0.200% (0.5 × 40%)  tradeF 0.55%
  per-market pipeline: OUSG $1,088,814 · BUIDL $1,349,094 · PC $1,462,769 (PC drains at T+45, slower)

haircutRevenue (total) = $40,982.51     rwaTradeRevenue (total) = $28,112.31
```

Note each market's haircut is at baseline + the category ladder bump (+0.30pp, since
total held is at the 20% cap) — the escalation mechanism working as designed, not a bug.
(Historical note: this example was refreshed 2026-07-09; the previous figures in this
section predated the STEP 0 reorder and no longer reproduced — caught by the
independent verification review, see the second addendum below.)

## 3. The critical bug: "RWA Collateral %" conflated held inventory with pipeline cash

**Before the fix, at this exact M12 snapshot:** `rwaCollateralBal` (genuine held
inventory) = $1,931,991 = **20.00%** of the Layer (correctly at the cap). But the
DISPLAYED concentration metric (`rwaCollateralPct`) was **53.96%** — because the engine
added `rwaPipelineBal` ($3,280,496 — cash in transit to the issuer, not RWA) into the same
number before computing the percentage.

**Why this matters:** pipeline cash is a bounded, short-duration counterparty wait (the
issuer owes BOUND cash on a known schedule) — categorically different risk from
open-ended RWA market/price exposure. Blending them meant the concentration metric could
run arbitrarily high as more markets routed overflow into the pipeline simultaneously —
exactly what happened once the market count went from 3 to 10 (the owner-reported
50–65% readings). This wasn't cosmetic: the same blended figure also fed the **preventive
minting-discount ladder** (`preventiveDiscount`), meaning minting could have been
throttled based on cash-in-transit, not actual RWA risk.

**Fix:**
1. New engine field **`rwaHeldPct`** = held inventory ÷ Layer only (excludes pipeline).
   Bounded ≤ `maxRwaPct` by construction (guarded by new invariant **S21**).
2. `preventiveDiscount` (the minting-throttle ladder) now keyed off `rwaHeldPct`, not the
   blended figure.
3. **Risk coloring** (`rwaWarn`/`rwaAlert`/`rwaColor`) in the Liquidity Layer's composition
   tiles now uses `rwaHeldPct`.
4. The 4-tile composition display was **split into two honest tiles**: "RWA Held"
   (capped, colored by risk) and "RWA In Pipeline" (informational, neutral color) instead
   of one blended "RWA Collateral" tile with a misleading cap reference.
5. The "Layer Composition + LCR" monthly table's RWA row relabeled "RWA Held Inventory"
   (held-only) with a new separate "RWA In Issuer Pipeline" row alongside it.
6. The "Total RWA held" summary line in the RWA Concentration card had its color threshold
   fixed the same way (was using the blended field for color while already displaying the
   correct held-only number — an internal inconsistency between what was shown and what
   drove its color).

**What did NOT change:** the waterfall math that allocates Morpho/Enhanced yield capacity
(`yieldBucketAfterRwa = yieldBucketAmt − rwaCollateralInLayer`) still correctly uses the
BLENDED figure — both held RWA and pipeline cash are genuinely unavailable for active
yield deployment, so excluding both from that split is correct. Only the **risk-facing**
metrics were wrong.

## 4. Second bug: per-market breakdown table used a demand-share approximation, not the real ledger

The "Layer Composition + LCR" table's per-market RWA breakdown re-derived each market's
share of `rwaCollateralInLayer` from **current-month liquidation demand share** — a
parallel approximation, not a read of the engine's actual per-market held ledger
(`marketStats[i].held`, which already existed and is authoritative). This would silently
diverge from reality the moment markets differ in launch timing, liquidation rate, or hit
their individual retention caps at different times — exactly the 10-market situation.
**Fixed:** now reads `row.marketStats[i].held` directly, no re-derivation.

## 5. Third bug: index misalignment risk in the per-market table (currently latent, not yet triggered)

`mkNames` (the per-market column labels) was built by filtering to `active` markets and
re-indexing sequentially (0, 1, 2…), while `mkBreakdown`/`marketStats` are indexed by each
market's position in the **full** `rwaMarkets` array. Currently harmless only because
every market in the app is `active: true` and there is no UI path to deactivate one
without removing it entirely — but the moment that changes, names and dollar amounts
would silently mismatch for every market after the first inactive one. **Fixed
preemptively**: `mkNames` now maps the full array, matching the indexing convention used
everywhere else.

## 6. Slider/hint fixes (Phase B)

- **"Liquidation Haircut - Baseline (%)" hint described a mechanism that no longer
  exists** — it referenced the old punitive triggered-haircut override (removed from the
  engine in an earlier audit pass; confirmed by grep, `rwaHaircutTriggered`/
  `rwaConcentrationHard` are read nowhere in `simulate()`). Rewritten to describe the
  actual current mechanism (the 3-step escalation ladder).
- **"RWA Pool Trading Fee (%)" hint didn't mention the ladder at all** — added.
- **"Monthly Liquidation/Minting Rate" hints used static launch-month AUM** in their
  worked-example dollar figure, even though AUM compounds — now use the live
  currently-selected-month AUM (`aumAtMs`), matching the header badge's own figure.
- **Zero-value defensive fix**: 7 market fields (`liqRate`, `liqHaircut`, `mintRate`,
  `mintHaircut`, `rwaTradeF`, `issuerRedemptionDays`, `mintStartMonth`) used `||`
  fallbacks in both the engine and 3 UI display locations. None are currently reachable
  at 0 via the sliders (all have a `min` above 0), so this was latent, not live — fixed
  to `??` throughout for consistency with the established codebase convention and in
  case markets are ever constructed programmatically.

## 7. UI layout changes (requested)

- Sliders in "Liquidation Service", "Minting Service", and "Fees - This Market" were
  narrower than "Market & Demand Parameters" (a `flex:2` spacer ate 40% of the row width
  in the first three, absent from the fourth). Removed all three spacers — all four
  sub-sections now use equal-width sliders, applied uniformly since all 10 markets render
  from one shared template.
- All 10 per-market cards now default to **closed** when the RWA Markets section is
  opened (was defaulting to all-open, unmanageable at 10 markets).
- Section renamed "RWA Users - Liquidation & Minting" → **"RWA Markets - Liquidation &
  Minting"** (owner-delegated), plus its two inline body-text references.

## 8. Cross-reference map — consumers of RWA Markets data (all re-verified after fixes)

| Field | Consumer | Verdict |
|---|---|---|
| `rwaLiq`, `rwaMint` | Protocol Capital Flows, BCI mint/burn inputs | ✅ direct engine reads |
| `haircutRevenue`, `rwaTradeRevenue` | `bci_rwa`/`pr_rwa` → BCI SC/PR Revenue charts | ✅ reconstructed to the cent by invariant S18 |
| `marketStats[i].held/liqServed/mintServed/haircutPct/tradeFPct` | RWA Fee Revenue table, RWA Concentration bars, Layer Composition per-market row | ✅ all read the same ledger, no parallel derivation (S3 and S18 both fixed this class earlier; this audit found the two remaining stragglers, §4 and §5) |
| `rwaHeldPct` (new) | Minting-discount ladder, risk coloring, composition tiles | ✅ new field, guarded by S21 |
| `pr_integ`, `bci_maint`/`pr_maint` | Integration/maintenance fee revenue | ✅ verified via conservation audit (S20-adjacent tie-outs) |
| `mk.issuerRedemptionDays` | Weighted average redemption timing (Liquidity Layer section) | ✅ reads per-market directly, no index risk |

## 9. Verification battery

```
npm run build            ✓ built, no errors
verify-invariants.mjs     ✓ ALL 21 invariant families PASS (36 months) — S21 added
hand-verify-m12.mjs       ✓ ALL VALUES MATCH (month 12, from-scratch)
audit-conservation.mjs    ✓ ALL LEDGER TIE-OUTS PASS
diagnose-10-markets.mjs   ✓ rwaHeldPct now reads exactly 20.0% at the cap (was 50-65%)
dev server                ✓ live, HMR reflecting all changes
```

## 10. Checklist (`AUDIT_CHECKLIST_TEMPLATE.md`)

- A1–A4 ✅ — logic, formulas, worked example verified against the live engine, no hidden
  couplings found beyond the already-documented shared BND-usage slider.
- B1–B4 ✅ — all sliders map to real engine reads; 4 misleading/stale hints fixed; 7
  latent zero-swallowing `||` fixed to `??` (engine + UI, all instances).
- C1 ✅ — 2 parallel-derivation defects found and fixed (§4 demand-share approximation,
  §5 index misalignment); C2 (horizon) — RWA tables already read the 36-month `sim`
  array directly, no separate 60-month structure to trim. C3–C6 n/a / no new dead fields.
- D1–D4 ✅ — full cross-reference trace in §8, all consumers re-verified post-fix.
- E1–E6 ✅ — see §9. **S21 added.** Scope note: M12 deep (from-scratch), all 36 months
  structural (21 invariant families).
- F1 ✅ this doc · F2 pending owner sign-off.

---

## Addendum — profitability fix (owner-directed, in progress)

**Owner's question:** why does "Total Layer $9.7M" show only "$4.1M USDC available for
RWA," and can the underlying logic (not just the label) be improved to increase
profitability?

### Done
1. **Display/label fixes (complete, verified):** "USDC available for RWA (engine)"
   renamed and reworded throughout (intro text, Layer Capacity card, section badge) to
   explain it's an *estimate*, shared with BCI redemptions (not RWA-exclusive), and
   based on the prior month's layer. The Layer Capacity card now shows the actual
   breakdown inline (prior month layer → minus committed RWA/pipeline % → estimate),
   so the math is visible without asking. Verified: build clean, invariants pass,
   hand-verify matched before the engine change below.

2. **Root-cause finding (confirmed, not just theorized):** the "estimate based on last
   month's layer" was **not a true circular dependency** — it was an artifact of code
   ordering. `layerPostUpdate` (this month's real layer) is a pure function of prior LP
   balances + this month's LP entry/exit flows, none of which depend on RWA market
   activity at all. Traced every dependency by hand before touching anything.

3. **Owner approved the fix** ("Yes, do it now") after I explained the mechanism and the
   expected effect (removes a systematic revenue understatement in growth months).

4. **Engine reorder implemented:** moved the private/retail LP entry+exit calculations
   (previously mid-file) to run *before* the RWA market demand/capacity block, so
   `layerUSDCAvailable`/`estimatedUSDCPct` and the concentration-ladder inputs
   (`categoryConcPct`, `mkConcPct`) are now sized off THIS month's real
   `layerPostUpdate` instead of last month's stale `layerTotal`. No new circular
   dependency — verified line-by-line before editing. Full diff is in
   `src/BoundSimulator.jsx` (search "STEP 0" comment block near the top of `simulate()`).

5. **Verification so far:**
   - `npm run build` — ✓ clean, no errors.
   - `node scripts/verify-invariants.mjs` — ✓ **all 21 invariant families still pass**
     (this is strong evidence the reorder didn't break any structural property: tier
     sums, conservation, the 6-month lock, per-market caps, the concentration fix, etc.)
   - `node scripts/hand-verify-m12.mjs` — **27 of 28 values matched exactly** on the
     first run after the reorder. The **one mismatch was `layerUSDCAvailable` itself**
     — expected, because the *hand-verify script* still computed its own independent
     estimate using the OLD (prior-month-layer) formula, not because the engine was
     wrong. I rewrote the script to match the new engine order (LP flows computed
     first, `layerPost` used for the capacity/concentration estimate) — **this rewrite
     has NOT been re-run yet** (stopped before executing).

### Closed out (2026-07-09) — all 6 remaining steps done

1. **`node scripts/hand-verify-m12.mjs`** (rewritten script, matching the engine's new
   order) — ✅ **28/28 values match**, including `layerUSDCAvailable` itself (the one
   line that failed before the script rewrite). Loop is now closed.
2. **`node scripts/audit-conservation.mjs`** — ✅ **all ledger tie-outs pass**, re-run
   after the reorder. Money conservation unaffected, as expected.
3. **Profitability impact — quantified** (new script: `scripts/quantify-reorder-impact.mjs`,
   isolates the reorder by patching only the 4 capacity-sizing lines and diffing the
   two engines on the real 10-market default lineup, Default preset, all else held
   identical). **Result: the reorder's overall effect is a small NET DECREASE, not the
   hoped-for increase** — see full breakdown and explanation below. Reporting this
   honestly rather than the originally-expected direction.
4. **Dev server / browser** — ✅ confirmed serving the reordered engine (`STEP 0` block
   present, build clean). **Found and fixed a second, related bug while checking this**:
   the "Layer Capacity" summary card (RWA Markets section) still re-derived its own
   "prior month's layer" estimate from `sim[ms-2]` and its footnote still said
   "Estimated from last month's layer" — both **stale**, written for the pre-reorder
   engine and never updated when the engine changed. This is exactly the C1
   parallel-derivation defect class this project's checklist exists to catch, caught by
   the same "confirm the browser" step, not left latent. **Fixed**: `layerPostUpdate`
   and `rwaInLayerNow` are now exported from the engine; the card and both pieces of
   copy text (section intro + card footnote) read the engine field directly instead of
   recomputing a guess, and now correctly describe "this month," not "last month."
5. **This document updated** (below) + **new invariant S22 added**
   (`scripts/verify-invariants.mjs`): asserts `layerPostUpdate` always equals prior
   month's closing LP balances plus this month's real entry/exit flows (catches any
   future regression back to a stale-layer estimate), and that `layerUSDCAvailable`
   stays a bounded 0–80% fraction of that same basis. **PASS**, 22/22 invariant
   families now (was 21).
6. **`npm run lint`** — re-run, full (unpiped) output checked, not just the tail. ✅ **45
   pre-existing cosmetic `no-unused-vars` warnings repo-wide** (most in
   `BoundSimulator.jsx` — the orphaned `KPI`/`yc` dead code flagged in
   `AUDIT_PLAN_SECTIONS.md`, plus unused LCR-display locals and BND-calculator locals;
   a few more in `scripts/*.mjs` helper files). **None are on lines this fix touched**,
   and the new `quantify-reorder-impact.mjs` script and the new S22 block in
   `verify-invariants.mjs` introduce **zero** new warnings — verified by name-checking
   every warning line against this fix's diff, not just eyeballing a short tail (an
   earlier truncated check in this same session under-reported this as "~10," which was
   wrong — corrected here).

### Profitability impact — measured result (not the direction originally expected)

Method: built two engines from the same source — the current (fixed/reordered) one
as-is, and an "old" variant with *only* the 4 capacity-sizing lines
(`categoryConcPct`, `mkConcPct`, `estimatedUSDCPct`, `layerUSDCAvailable`) patched back
to size off `privateLayerBal + retailLayerBal` (the pre-flow prior-month closing
balance — exactly what those 4 lines computed before the reorder). Every other line of
the engine — the waterfall, LCR, yield split, and all *display-only* concentration
fields (`rwaHeldPct`, per-market `concPct`) — is identical in both, so the diff isolates
exactly the reorder's effect. Both run the real 10-market default lineup, Default
preset, full 36 months.

```
Milestone   annG(old)   annG(new)   Δpp      price(old)  price(new)
M12         8.433%      8.381%      -0.053   1.0843      1.0838
M24         8.761%      8.692%      -0.069   1.1829      1.1814
M36         9.066%      8.988%      -0.078   1.2974      1.2946

Cumulative (M1-36):  BCI SC revenue   old $3,663,705  new $3,630,227  Δ -0.91%
                     Protocol Reserve old $5,349,527  new $5,237,605  Δ -2.09%
                     RWA haircut rev  old $1,783,395  new $1,684,135  Δ -5.57%
                     RWA trade fee    old $1,185,620  new $1,115,770  Δ -5.89%

Layer constrained (demand > capacity): 36/36 months in BOTH old and new.
```

**Why the direction reversed from what was expected**, and confirmed via a real
mechanism, not just noise: the two engines diverge from month 1 onward (capacity
differences feed back into held inventory, pipeline overflow, and served volume, which
change the *next* month's starting state) — this is a genuinely path-dependent
nonlinear system, not a static formula, so intuition about "bigger denominator in growth
months" doesn't isolate to one direction. Two concrete effects pull opposite ways:

- **M1 capacity is correctly fixed**: old showed **$0** available in the launch month
  (the exact bug being fixed — `privateLayerBal + retailLayerBal` is 0 before any LP
  money has ever landed), new correctly shows **$2.87M** (this month's real inflow).
  This is a genuine, large improvement at the very start of the model.
- **But the concentration-ladder side effect dominates over 36 months**: `categoryConcPct`
  and `mkConcPct` (which drive the haircut/trade-fee escalation ladder) now divide by a
  LARGER current-month layer instead of a smaller prior-month one. The same held-RWA
  dollar amount is therefore a *smaller percentage* of the (larger) new denominator, so
  the ladder escalates *less* — lower effective haircut/trade-fee rates are applied to
  served volume for most of the horizon, which costs slightly more revenue than the
  extra served volume gains back.

**Separately, and arguably the more important finding**: the Layer remains the binding
constraint in **36 of 36 months, in both the old and the new engine.** The reorder fixes
*when* the estimate is stale, but demand across 10 markets structurally and permanently
exceeds Layer USDC capacity throughout the entire 3-year horizon regardless. Fixing the
staleness did not — and structurally could not — fix that deeper undersizing. If the
owner's real goal is "unlock more RWA profitability," the reorder is not sufficient on
its own; the lever that would actually move `layerConstrained` off 36/36 is Layer size
itself (LP inflow assumptions) or the capacity-allocation percentages
(`minBufferPct`/`estimatedUSDCPct` cap), not this month-vs-last-month timing question.

**Verdict on the fix itself**: it is *correct* — it replaces a provably wrong prior-month
estimate with the real current-month figure, closes the M1-specific $0-capacity bug, and
is now guarded by S22. It is *not* a profitability improvement in this configuration —
cumulative revenue and annG are very slightly lower (annG -0.05 to -0.08pp by M36), for
the concentration-ladder reason above. Recommend keeping the fix (it is more honest and
removes a real defect) but not advertising it as a revenue increase, and separately
discussing with the owner whether the ladder should key off a different, less
denominator-sensitive concentration measure if this effect is undesirable.

### Verification battery (final, all re-run 2026-07-09)

```
npm run build              ✓ clean, no errors
verify-invariants.mjs      ✓ ALL 22 invariant families PASS (36 months) — S22 added
hand-verify-m12.mjs        ✓ ALL 28/28 VALUES MATCH (rewritten script, month 12, from-scratch)
audit-conservation.mjs     ✓ ALL LEDGER TIE-OUTS PASS
quantify-reorder-impact.mjs  ✓ isolated before/after comparison — see numbers above
npm run lint               ✓ same 45 pre-existing cosmetic warnings, none new
                             (item 6 above corrected an earlier "~10" under-count; this
                              battery line originally repeated the stale figure)
dev server                 ✓ confirmed serving reordered engine + UI fix (curl-verified)
```

**Section 3 is ready for owner sign-off** — main findings (bugs 1–3, §3–§5) were already
closed; this addendum's reorder, its side-effect discovery (stale Layer Capacity card),
and its honestly-measured (not assumed) profitability result are now all closed and
verified to the same depth as the rest of this section.

---

## Addendum 2 — Independent verification review + capacity redesign (2026-07-09)

A second, independent audit pass (different reviewer/model) re-verified every claim in
this document against the live engine and reviewed the RWA engine block, sliders, and
all UI consumers from scratch. The core mechanics all re-verified clean (pro-rata
split, per-market ledger, cap routing, ladder, fee splits, `rwaHeldPct` fix). It found
**5 new defects** — including one introduced by the previous fix itself (the exact P6
pitfall class) — plus an owner-reported LCR problem whose root cause is in this
section's logic. All are now fixed and verified.

### Findings and fixes

1. **Fabricated "post-yield vs pre-yield" distinction in the Layer Capacity card**
   (P6-class — introduced by Addendum 1's own UI fix). `md.layer` and
   `md.layerPostUpdate` are identical to the penny in all 36 months (the engine
   deliberately never compounds Layer yield into LP balances), yet the card displayed
   both as different rows and its footnote claimed a yield-accrual difference.
   **Fixed**: single "Total Layer (this month)" row, truthful footnote, and the stale
   engine comment ("yield share is accrued later") rewritten.

2. **The entire minting-discount system had zero engine effect.** `mintingDiscount` +
   its 6 sliders were computed and displayed but never touched any simulated dollar —
   while a 20–70% discount was nominally "active" in 35 of 36 default months and the
   engine booked the FULL mint haircut throughout (≈$119K of cumulative revenue that a
   real discount would have removed). Addendum 0 (§3) also overstated this: the
   preventive ladder never "throttled minting" — it was cosmetic. **Fixed**: the
   discount is now genuinely applied to the mint haircut with a one-month lag
   (`prevMintingDiscount`, same pattern as the stress acceptance throttle), exported as
   `appliedMintingDiscount`, reflected in `marketStats[i].mintHcPct` (so the RWA Fee
   Revenue table and S18 tie out automatically), and guarded by **S25**. Preventive
   thresholds also de-hardcoded (15/18 → 75%/90% of `maxRwaPct`, same values at the
   default cap), with slider labels now interpolated. Demand stimulation from the
   discount is NOT modeled — documented in the hints.

3. **§2's "engine-verified" worked example no longer reproduced** — its numbers
   predated Addendum 1's reorder and were never refreshed (rwaLiq $4,148,124 claimed
   vs $3,731,835 live at the time of review). The battery block also still said "10
   pre-existing lint warnings" two paragraphs after item 6 corrected it to 45.
   **Fixed**: §2 fully refreshed against the current engine; battery line corrected.

4. **§5's index-misalignment bug class existed in a second location the fix missed**:
   the RWA Fee Revenue table's market-selector buttons were built from
   `rwaMarkets.filter(active)` while indexing into the full-array-indexed
   `rwaFeesTableData.perMarket`. Latent (all markets active), same trigger as §5.
   **Fixed**: selector tabs now carry full-array indexes; inactive markets are skipped
   in render, not re-indexed. The same pass also aligned the fee table's
   `integFee`/`maintFee` fallback chain with the engine's (`mk → p → hardcoded`), and
   the Summary Card's per-market demand rows now read `marketStats[i].liqDemand/
   mintDemand` instead of re-deriving AUM compounding (C1 class).

5. **`rwaAum` was a dead engine export that was also wrong** (−6%…+7% vs true summed
   AUM: its denominator averaged `liqRate` across ALL active markets including
   not-yet-launched ones). Rendered nowhere. **Deleted** (C6 ruling: render or delete).

### Owner-reported problem: LCR 0.99 (M5) / 0.91 (M7) — root cause and redesign

The owner spotted sub-1.0 LCR readings in the Layer Composition table. Analysis
confirmed: **not a breakdown** (no missed obligation, redemption queue empty all 36
months, conservation clean) but a real design flaw in THIS section — RWA acceptance
ignored liquidity coverage entirely, accepting up to ~80% of the Layer and converting
liquid USDC into illiquid held/pipeline RWA. This produced a sawtooth (accept heavily →
LCR craters to 0.91–0.99 / STRESS mode → capacity starved next month → recover →
repeat) with 8 of 36 months below HEALTHY. A second, related flaw: RWA liquidations had
**first claim** on Layer USDC and BCI redemptions took the leftover — under stress the
protocol would have delayed LP exits to keep buying RWA inventory.

**Redesign (owner-approved direction "if you have a better fix go for it"):**

- **BCI redemptions are now SENIOR** — served first from available USDC + pipeline
  returns, before any RWA capacity is allocated. (The owner's suggestion — BCI served
  only from pipeline returns — was considered and inverted: LP exits are an obligation
  the protocol already carries; RWA liquidation service is discretionary. Serving
  LPs only from pipeline returns would starve exits in months with no pipeline and
  build queues; guarded by **S16** (rewritten) instead.)
- **LCR guard on acceptance** (`rwaLcrTarget`, new slider, default **1.5×**): RWA
  liquidations are only accepted up to the volume that keeps the projected month-end
  LCR at or above the floor. Guarded by **S23**.
- **Per-market issuer-redemption pipeline ledger** (`mkPipe[]`): each market's overflow
  drains at its own `issuerRedemptionDays` — the old single-bucket pipeline drained at
  an UNWEIGHTED average across active markets (the variable was even named
  "weighted"), so a T+90 real-estate market returned cash at a T+30-ish blend.
  `weightedRedemptionDays` is now genuinely pipeline-weighted (display), and
  `marketStats[i].pipeline` is exported. Guarded by **S24**.

### Measured impact (10-market default lineup, before → after, all changes combined)

```
                         BEFORE (Addendum 1)      AFTER (this addendum)
min LCR (36 months)      0.905                    1.501
stress modes             28 HEALTHY/5 WARN/3 STRESS   36/36 HEALTHY
M12 annG                 8.381%                   8.402%
M24 annG                 8.692%                   8.861%
M36 annG                 8.988%                   9.106%   (price 1.2946 → 1.2988)
cum BCI SC rev (M1-36)   $3,630,227               $3,681,563  (+1.4%)
cum Protocol Reserve     $5,237,605               $5,377,566  (+2.7%)
cum RWA haircut rev      $1,684,135               $1,686,941  (≈flat)
cum RWA trade fee rev    $1,115,770               $1,191,497  (+5.7%)
BCI redemption queue     0/36 months              0/36 months
layerConstrained         36/36                    36/36 (structural: demand ≫ capacity)
```

The protocol is now permanently HEALTHY **and** slightly more profitable: accepting
less RWA in crowded months leaves more of the Layer deployed in Morpho/Enhanced yield
(80% of which accrues to BCI SC), and the slower per-market pipeline keeps served
volume smoother across months. Reported as measured, not assumed. The Layer remains
demand-constrained 36/36 — the structural undersizing finding from Addendum 1 stands;
the lever is LP inflow assumptions, not this section's allocation logic.

### Verification battery (all re-run 2026-07-09, after all changes)

```
npm run build              ✓ clean, no errors
verify-invariants.mjs      ✓ ALL 26 invariant families PASS — S16 rewritten (BCI
                             seniority), S23 (LCR floor guard), S24 (per-market
                             pipeline ledger), S25 (discount genuinely applied) added;
                             S26 added in Section 4 audit (tier sum + LCR reconstruct)
hand-verify-m12.mjs        ✓ ALL 32/32 VALUES MATCH (rewritten for the new capacity
                             waterfall: bciServedTotal, rwaLcrCap, appliedMintingDiscount
                             now hand-checked too)
audit-conservation.mjs     ✓ ALL LEDGER TIE-OUTS PASS (queue 0/36, integration fees OK)
npm run lint               ✓ 45 pre-existing cosmetic warnings, none new
dev server                 ✓ http://127.0.0.1:5238/ (canonical — see HANDOFF.md)
```

Scope honesty: deep hand-recomputation covers M12 (single-market fixture); the other
35 months and the 3-market/10-market lineups are covered structurally by the 26
invariant families and the conservation tie-outs.
