# Tokenomics Results Page — Audit Findings

Companion to `AUDIT_TOKENOMICS_RESULTS_CHECKLIST.md`. Every finding is numerically verified
via `diag/a-checks.mjs` (harness extracts both engines + all defaults from the live source).
Severity: **CRITICAL** (wrong number shown) · **CAUTION** (defect risk / model question) ·
**NOTE** (informational).

---

## F-1 · xBND Revenue Switch flow is silently dropped while no xBND is locked — $41,340 (CAUTION, owner decision)

**Where:** `runTokenomicsSim`, the Revenue Switch block (~L1401–1409).

**What happens:** each month `xbndFlow = prRevenue × (1 − burnSplitPct%)` (20% of Protocol
Reserve revenue) is meant to be distributed to locked xBND. But distribution only executes
when `totalLockedVal > 0`. Seed's cliff is 6 months and Extended Seed's is 12, so **no xBND
exists until M7** — and the M1–M6 xbndFlow is neither distributed, nor accrued to a pool,
nor redirected to the Burn Engine. It simply vanishes from the model.

**Verified numbers (defaults):** Σ xbndFlow = $600,113 over 36 months; Σ distributed =
$558,773; **undistributed = $41,340 (6.9% of the xBND slice)** — exactly the M1–M6 flow.

**Why it matters:** the model's own guardrail is "every dollar must trace to a real source
and destination." This is the mirror image of invented money: real modeled revenue with no
destination. It also slightly understates either (a) xBND distributions (if the real
protocol would escrow and pay it out later), or (b) Burn Engine inflows (if the real
protocol would redirect it while no lockers exist).

**Owner decision (2026-07-23): Option 2 — redirect to Burn Engine.**

**Fix applied:** in the Revenue Switch block, when `totalLockedVal === 0 && xbndFlow > 0` the
flow is added to `burnEngineBalance` (earning yield from the following month, like any other
top-up), tracked as `xbndRedirected` / `cumXbndRedirected` in the rows. Two display rows added:
- Burn Engine Treasury — Monthly Breakdown: "Inflow → redirected xBND slice (20%, only while no xBND is locked)"
- Monthly Tokenomics Breakdown: "of which redirected → Burn Engine (no xBND locked yet)" under the xBND pool row

**Verification (harness re-run + browser):**
- xBND flow now fully accounted: in $600,113 = distributed $558,773 + redirected $41,340, residual $0.000000.
- Burn Engine identity updated and exact: balance M36 $5,066,792 = seed $2.625M + Σ burnFlow + Σ redirected.
- All Phase A invariants still pass (supply max diff 2.98e-8; AMM k non-decreasing; no NaN on extSeed-off path).
- Browser: redirect row shows $12.5K/$2.5K/$2.8K/$13.8K/$4.4K/$5.3K for M1–M6 (= $41.3K), "–" from M7; KPIs updated.
- **Baseline shift (tiny, expected):** M36 +139.1% → **+139.2%** ($0.1196); trough −21.4% → **−21.3%** @ M10;
  cumulative burned 18.72M → **18.91M** (1.89%); BE balance M36 $5.03M → **$5.07M**; sell/buy still 0.870×.
  → the static audit HTML's baked figures are now off by these deltas (see E3 in the checklist).

**Status:** ✅ FIXED & VERIFIED (fix itself queued for second-pass re-review per template rule P6).

---

## F-2 · Public Staking Pool chart sub-label describes demand as "% of market cap" — engine anchors to launch price (pending verification → see R12.5)

Flagged during checklist construction; the engine (~L1384) uses
`priorCirculating × a.publicPrice` (launch price), deliberately NOT live market cap
(bug-fix §8.2). Sub-label at ~L2173 says "% of market cap the whole time the pool pays."
Wording likely stale. To be verdicted in Phase B / R12.5. The Inputs-page hint for
`demandStrengthPct` (~L1509–1511 comment, and its slider hint) has the same phrasing risk.

---

## F-3 · Browser observations logged in passing (NOTE)

1. **React duplicate-key warnings** (pre-existing, MAIN simulator pages, not Tokenomics):
   "Encountered two children with the same key" for keys `Protocol Reserve`, `BCI SC`,
   `BND Burn` — legend/row keys reused somewhere in the main sim's fee tables. Cosmetic
   today, but React documents the behavior as unsupported. Out of this audit's scope;
   worth a separate pass.
2. **TGE float discrepancy with the static audit doc:** live Results KPI shows **3.6%**
   (= public 22.5M + community-vestable 12.75M + marketing 1M = 36.25M / 1B); the audit
   HTML headline says **4.08%**. The live formula omits Treasury's 5% TGE (4.5M) by design
   or by drift — to be verdicted at R3.5, and the audit doc regenerated either way (E3).

---

## Phase B findings (2026-07-23) — all numerically verified via `diag/b-checks.mjs`

### F-4 · `seedRaised` default is off the slider's step grid (CAUTION)
Default 2,480,000; slider `min 200000, step 50000` → not representable ((2.48M−0.2M)/50K = 45.6).
The DOM range input already snaps its thumb to 2,500,000 (observed in the accessibility tree)
while React state stays 2.48M — the first user touch silently jumps the round off its designed
$2.48M / $0.0248 / 100M-token configuration. All other Capital Formation defaults verified
on-grid. **Fix options:** step → 10,000, or default → 2,500,000 (then seed = 100.8M tokens and
allocTotal shifts). Owner choice.

### F-5 · Static audit doc's investor ROI uses a different methodology (CAUTION → E3)
Audit HTML: ROI Seed/Ext/Public **+399/+223/+139%** = full ALLOCATION × M36 price (+xBND),
ignoring vesting progress and sell execution (verified: 100M×$0.1196+$0.42M = +399.2%;
80M×$0.1196+$0.14M = +223.6%; 150M×$0.1196 = +139.2%). Live Cohort Summary: **+308.6/+87.5/+105.5%**
= vested tokens, actual blended-execution sell proceeds, remaining at M36 price. Both are
internally consistent metrics, but they disagree on the same page pair. Regenerate the audit
doc with the live definition, or label its figures "if fully held to M36."

### F-6 · Supply-stack chart hides the Public Staking Pool balance (CAUTION)
"Circulating vs. Locked (xBND) Supply": `unstaked` = floatSupply, `locked` = xBND only —
`publicStaked` is in NEITHER band. Verified: stack + publicStaked = circulating exactly;
at M36 that's **214.4M tokens = 28.9% of circulating** invisible. Recommend a third band
("Staked — Public Pool") so the stack sums to circulating.

### F-7 · "TGE float" KPI definition differs from the engine's TGE unlocks (CAUTION)
KPI formula = public + community-vestable + marketing TGE = 36.25M (**3.63%**), silently
excluding Treasury's 5% TGE (4.5M). Engine m=0 unlocks = 40.75M (**4.08%** — the figure the
audit doc quotes). Delta verified = exactly the treasury slice. Treasury never sells
(sellRate 0), so "sellable float" is a defensible reading — but then the label should say so.
Options: include treasury (4.08%), or relabel "TGE sellable float (excl. treasury)".

### F-8 · Float-vs-depth warning compares against M12 pool, label says "seeded" (NOTE)
`tgeFloat×launch > 3 × m12.usdcReserve` — the text says "relative to seeded pool depth" but
the comparator is month-12 pool USDC (which has grown by then). Either compare against
`liquidityUsdSeed` or reword. Silent on defaults either way ($1.81M vs $20.3M seeded×3 / $18.1M+).

### F-9 · Unlock charts include staking emissions but don't say so (NOTE)
`unlockChart` totals derive from vestingAreaData INCLUDING `stakingEmissions`; the two
sub-labels say "across all buckets" / "all unlocked tokens" without mentioning emissions
(R5's chart discloses them explicitly). One-line sub-label addition.

### F-10 · Cohort Summary mixes APY conventions under identical headers (NOTE)
xBND APY and BND APY columns are simple-annualized (×12/36); "Overall APY (ann.)" is CAGR.
Intentional per code comments, but all three headers read "APY (ann.)". Suggest "(simple)" /
"(CAGR)" markers or a footnote line.

### F-11 · $10k illustration is a hold-pure position — not stated (NOTE)
Buys at launch price at M1, never churns/unstakes (unlike the modeled pool population, which
churns 3%/mo). Values verified: 220.94K/$8.8K @ M12 → 269.64K/$32.3K @ M36. Add a clause to
the sub-label.

### F-2 (upgraded to CONFIRMED) · Public-pool chart sub-label wording stale
Engine verified: demand = % of circulating float at **launch** price (anti-reflexivity design);
sub-label says "% of market cap". Fix wording. Related **F-2b**: the 15% reference line on the
xBND rate chart is labeled "yield-seeking demand benchmark" — the benchmark mechanism was
removed (handover §8.1); keep-relabelled or remove (owner).

**Phase B engine-side + browser render checks: ALL PASS otherwise.** Browser matched the
engine to the displayed digit on: all 6 headline KPIs, allocation table, Burn Engine KPIs +
redirect row, Public Pool KPIs (214.39M / 10.0% / 10.79M / $12.1M), full Seed & Public cohort
rows, and the $10k table.

### Fix log (owner-approved 2026-07-23, all verified in browser after HMR + `npm run build` clean)

| Finding | Fix applied | Verified |
|---|---|---|
| F-2 | Public-pool chart sub now says "% of the circulating float valued at launch price (deliberately not live market cap…)" | ✅ rendered |
| F-2b | 15% line relabelled "15% reference threshold, for comparison only" | ✅ rendered |
| F-4 | seedRaised slider step 50,000 → 10,000 | ✅ DOM value now exactly 2480000 |
| F-6 | Third stacked band `publicStaked` ("Staked — Public Pool", amber) added; sub-label states the stack totals circulating supply | ✅ rendered |
| F-7 | Owner chose engine-consistent definition: tgeFloat now includes Treasury's TGE slice → KPI reads **4.1%** (= engine m=0 unlocks 40.75M, harness-verified exact match) | ✅ rendered + harness |
| F-8 | Warning text reworded to match its actual comparator: "exceeds 3× the pool's month-12 USDC depth" | ✅ (silent on defaults, as before) |
| F-9 | Both unlock-chart subs now mention Public Staking Pool emissions | ✅ rendered |
| F-10 | Headers → "APY (simple, ann.)" ×2 and "Overall APY (CAGR)"; footnote 1 extended with the convention caveat | ✅ rendered |
| F-11 | $10k sub-label states: bought at launch price M1, held staked throughout, no unstaking/selling | ✅ rendered |

Still open: **F-5** (audit HTML regeneration — owner: at close-out), **F-3.1** (main-sim
duplicate-key warnings — out of scope). All fixes above queued for the E2 second-pass re-review.

---

## Phase A summary (2026-07-23)

| Check | Result |
|---|---|
| A1 harness extraction | PASS — all engines/defaults sliced from live source |
| A2 supply invariant | PASS — max diff 1.19e-7 tokens over 36 months |
| A3 cash ledger | PASS with **F-1** — all other flows tie out exactly |
| A4 AMM conservation | PASS — reserves positive, k non-decreasing, price identity exact |
| A5 baseline reproduction | PASS — +139.1% M36 / −21.4% M10 / 0.870× — matches handover exactly |
| A6 PR-series coupling | PASS — live `p` + 10-market array + yld layerCfg; `totalPr = totalPrAfterER` |
| A7 extSeed off-path | PASS (engine level) — no NaN, invariant holds |

Milestone reference rows (defaults) for Phase B spot-checks:

```
M 1  price 0.0476  circ  61.9M  burned  0.43M  pubStaked   4.4M  apy 10.0%  lockedX  0.0M  dist$      0  BE$ 2.68M
M 7  price 0.0402  circ 193.1M  burned  3.45M  pubStaked  37.5M  apy 10.0%  lockedX  3.4M  dist$ 16,539  BE$ 2.86M
M10  price 0.0393  circ 269.5M  burned  5.21M  pubStaked  59.4M  apy 10.0%  lockedX 13.1M  dist$ 48,897  BE$ 2.99M
M12  price 0.0398  circ 320.7M  burned  6.45M  pubStaked  75.9M  apy 10.0%  lockedX 19.0M  dist$ 66,186  BE$ 3.06M
M24  price 0.0618  circ 604.3M  burned 13.42M  pubStaked 171.8M  apy 10.0%  lockedX 66.7M  dist$262,206  BE$ 3.84M
M36  price 0.1195  circ 741.1M  burned 18.72M  pubStaked 214.5M  apy 10.0%  lockedX 80.7M  dist$558,773  BE$ 5.03M
```
