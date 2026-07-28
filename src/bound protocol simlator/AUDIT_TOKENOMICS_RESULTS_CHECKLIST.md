# Tokenomics Results Page — Professional Audit Checklist (v1)

**Scope:** the `tView === "results"` view of `TokenomicsPage` in `src/BoundSimulator.jsx`
(render block ~lines 1885–2308), its derived data (~lines 1550–1690), and the engine
`runTokenomicsSim` (~line 1210) that feeds it. Line numbers drift — always re-locate by symbol name.

**Method:** follows `AUDIT_CHECKLIST_TEMPLATE.md` (Phases A–F + Pitfall register). Every numeric
claim must be verified against the live engine via the extraction harness
(`TOKENOMICS_HANDOVER.md` §9) — never hand-computed on the side, never quoted from memory.

**Status legend:** `☐` not audited · `✅ PASS` · `⚠️ CAUTION` (works, but a defect risk logged) ·
`❌ CRITICAL` (wrong number shown to the user) · `➖ N/A`

**Regression guard:** the six fixed bugs in `TOKENOMICS_HANDOVER.md` §8 are re-checked explicitly
in Phase G. Reintroducing any of them is an automatic ❌.

---

## Phase A — Global preconditions (before any per-section work)

| # | Check | How to verify | Status |
|---|---|---|---|
| A1 | Harness extraction is current: re-extract `runTokenomicsSim` + `bucketMonthlyUnlock` + `stakingEmission` from the live file (line ranges have drifted since the handover) | `diag/a-checks.mjs` — extracts BOTH engines, the 10-market default array, `yld`→`layerCfg`, and every TokenomicsPage `useState` default by string-slicing the live source (nothing hand-copied) | ✅ PASS |
| A2 | **Supply invariant** holds at every month m: `Σ byBucket + cumStakingEmissions − cumBurned === circulating` (exact, not approximate) | All 36 months, max abs diff **1.19e-7 tokens** (float noise only) | ✅ PASS |
| A3 | **Cash conservation**: every USD in the model traces to the $12.98M raise + Protocol Reserve revenue. Sum all USD sources vs. all USD sinks (pool seed, Burn Engine seed + top-ups, company split, xBND distributions, yield spent) | Ledger ties out: pool $6.75M + Burn seed $2.625M + company $1.125M = extSeed+public raise exactly; BE principal M36 = seed + ΣburnFlow + Σredirected exactly; pool USDC = seed − sells + buys exactly. Finding **F-1** (xBND flow leak $41,340) found, owner chose redirect-to-Burn-Engine, **fixed & re-verified** — xBND flow now fully accounted, residual $0. New baseline: +139.2% M36 / −21.3% M10 / 0.870× / burned 18.91M | ✅ PASS (F-1 fixed) |
| A4 | **AMM pool conservation**: `usdcReserve × bndReserve` changes only by the 0.3% fee retention; pool never goes negative; price = usdcReserve/bndReserve at every step | Reserves positive all 36 months; k non-decreasing; price identity exact | ✅ PASS |
| A5 | Baseline numbers reproduce the handover's stated base case: launch $0.05 → +139% @ M36, trough −21.4% @ M10, sell/buy 0.87× (if they don't, defaults have drifted — STOP and tell the owner before auditing displays against a moved target) | **+139.1% @ M36 ($0.1195), −21.4% @ M10, 0.870×** — exact match; PR series cum $3,000,565 | ✅ PASS |
| A6 | Hidden couplings disclosed: the PR series comes from the MAIN simulator's `simulate()` (`sim` prop → `prSeries[m-1].totalPr`). Confirm which main-page scenario/preset is active and that Results numbers move when main inputs move | Code trace: `sim = simulate(p, rwaMarkets, layerCfg)` at ~L2632 — `p` = live scenario state (defaults to `PRESETS.default`), `rwaMarkets` = the **10-market** onboarding array, `layerCfg` from `yld` state. `totalPr` = `totalPrAfterER` (net of ER top-up, ~L815). Browser live-coupling check deferred to D4 | ✅ PASS |
| A7 | `extSeedOn` off-path: with Extended Seed disabled, no chart/table/KPI renders stale extSeed data, and totals still reconcile | Engine off-path: no NaN/Infinity in any row field, invariant holds (1.19e-7), extSeed series all zero. (Browser render side of R-sections still pending in Phase B.) Note: M36 lands +559% off-path — pool seed drops to $3.75M but 80M fewer tokens exist; alloc-total warning fires correctly (92%) | ✅ PASS (engine) |

---

## Phase B — Per-section audit (render order)

Each section gets the same four sub-checks, plus its own specific items:
- **(a) Source** — renders engine `tRows` / derived-data fields only; no parallel recomputation (Pitfall P1).
- **(b) Math** — the specific calculations listed below, spot-verified numerically via harness for at least M12 and M36.
- **(c) Labels** — every title/sub/hint states the true formula, base, and timing; no hardcoded parameter values that a slider can move (Pitfall P3).
- **(d) Render** — axes, units, formatters, reference lines, series colors/legend match the data actually plotted; no NaN/`—` on defaults.

### R1 · Header controls & audit link (~1886–1906)
| # | Check | Status |
|---|---|---|
| R1.1 | "Back to Tokenomics Inputs" returns to assumptions with state intact (no reset) | ✅ PASS (state persists — verified during browser session) |
| R1.2 | Audit link opens `/bound-tokenomics-audit.html`; **static-snapshot honesty**: its baked-in figures still match the live engine on current defaults | ❌ STALE (**F-5**): audit ROI +399/223/139% uses full-allocation × M36 price (ignores vesting + sells); live Cohort Summary = +308.6/+87.5/+105.5%. Also 4.08% float headline vs live 3.6% KPI (F-7), and post-F-1 digit drift. Regenerate per E3 |

### R2 · Warnings banner (~1908–1915)
| # | Check | Status |
|---|---|---|
| R2.1 | Enumerate every condition that can push into `warnings`; each fires at its stated threshold and reads truthfully | ✅ PASS — 4 conditions enumerated; all silent on defaults; F-8 label reworded to match its comparator (fixed) |
| R2.2 | Allocation-total warning threshold (`|total−100| > 0.6`) consistent between Inputs validation and the Results allocation table's red/green total | ✅ PASS (same 0.6 constant both places) |

### R3 · Headline KPI strip (~1917–1924) — 6 KPIs
| # | Check | What the number must be | Status |
|---|---|---|---|
| R3.1 | Price @ M12 / M24 / M36 | `tRows[11/23/35].price` | ✅ PASS — $0.0398/$0.0618/$0.1196, browser = engine exactly |
| R3.2 | "launch $0.050" sub | interpolated from `publicPrice` | ✅ PASS (browser shows live value) |
| R3.3 | Max drawdown vs launch | min over ALL months | ✅ PASS — reduce-min = true min, −21.3% |
| R3.4 | Supply burned | `cumBurned_M36 / totalSupply` | ✅ PASS — 1.89% = 18.91M/1B, consistent with C1 |
| R3.5 | TGE float | definition check | ✅ PASS (F-7 fixed, owner chose engine-consistent definition) — KPI now includes Treasury TGE: 4.1% = engine m=0 unlocks exactly, harness-verified |

### R4 · Token Supply & Allocation table (~1926–1958)
| # | Check | Status |
|---|---|---|
| R4.1 | Sum of Tokens column = 1,000,000,000 exactly | ✅ PASS — 100.0000% |
| R4.2 | Total row red iff `|allocTotal−100| > 0.6` | ✅ PASS — 100.00% green on defaults |
| R4.3 | Footnote carve-out figure interpolated live | ✅ PASS — 45M = community × 15% |
| R4.4 | % column same source as Tokens | ✅ PASS (both derive from catTokens/alloc) |

### R5 · Vesting Schedule — Cumulative Unlocks, stacked area (~1961–1980)
| # | Check | Status |
|---|---|---|
| R5.1 | Each bucket series = `vestedCum[k]` from engine; community NET of carve-out | ✅ PASS (direct map from `r.byBucket`; engine vests net community) |
| R5.2 | `stakingEmissions` series + stack total reconciles | ✅ PASS — M36 stack 759.8M = circulating + cumBurned exactly |
| R5.3 | Liquidity bucket ABSENT | ✅ PASS |
| R5.4 | extSeed hidden when off; tooltip uses `BUCKET_LABELS` | ✅ PASS (code filter + A7) |
| R5.5 | Spot-check stack heights vs. harness | ✅ PASS (via R5.2 identity, all months) |

### R6 · Monthly + Cumulative Token Unlocks (~1982–2009)
| # | Check | Status |
|---|---|---|
| R6.1 | Emissions in/out of `monthly` — label must say | ✅ PASS (F-9 fixed) — emissions included AND now disclosed in both sub-labels |
| R6.2 | last cumulative = Σ monthly | ✅ PASS |
| R6.3 | M1 spike composition | ✅ PASS — 62.29M = TGE 40.75M + M1 linear (public/community/marketing) + M1 emissions, verified vs `bucketMonthlyUnlock` |
| R6.4 | Cliff steps at right months | ✅ PASS — seed 0→4.2M at M7; team 0→x at M13 |

### R7 · Protocol Reserve Revenue — monthly + cumulative (~2011–2038)
| # | Check | Status |
|---|---|---|
| R7.1 | `prRevenue` = `totalPr` verbatim, all months | ✅ PASS |
| R7.2 | `prCum` ≈ $3.0M | ✅ PASS — $3,000,565 |
| R7.3 | Live-coupling browser check | → deferred to D4 (code trace confirms live `sim` prop) |

### R8 · BND Simulated Price + BND Burned (~2040–2068)
| # | Check | Status |
|---|---|---|
| R8.1 | Price = end-of-month post-buy | ✅ PASS (engine ordering verified in code read) |
| R8.2 | ReferenceLine = live `publicPrice` | ✅ PASS |
| R8.3 | Trough/endpoint match harness | ✅ PASS — −21.3% @ M10 / +139.2% (post-F-1 baseline) |
| R8.4 | `burnedNow` attribution = yieldUsd share only | ✅ PASS — Σ burnedNow = cumBurned; spot M20: burnedNow/tokensBought = yieldUsd/totalBuyUsd exactly |

### R9 · Circulating vs Locked + Cumulative Burned (~2070–2098)
| # | Check | Status |
|---|---|---|
| R9.1 | Which band holds `publicStaked`? | ✅ PASS (F-6 fixed) — third band `publicStaked` ("Staked — Public Pool") added; stack now sums to circulating exactly (identity verified all months) |
| R9.2 | Stack total ties to engine | ✅ PASS — identity verified all months (with the F-6 omission noted) |
| R9.3 | `cumBurned` endpoint = one number in 3 places | ✅ PASS (C1) |

### R10 · xBND Distribution Rate + Cumulative rwaUSD (~2100–2129)
| # | Check | Status |
|---|---|---|
| R10.1 | Rate denominator | ✅ PASS — dist×12 / (lockedTokens × CURRENT price), spot M30 exact; label "Implied Annualized Distribution Rate" matches |
| R10.2 | Price-independence | ✅ PASS — A/B demand 1.5% vs 0.5%: total AND per-cohort distributions identical to the cent ($558,772.79) |
| R10.3 | 15% ReferenceLine meaning | ✅ PASS (F-2b fixed) — relabelled "15% reference threshold, for comparison only" |
| R10.4 | Chart total = KPI = 20% of PR net of redirect | ✅ PASS — $558,773 everywhere; + redirected $41,340 = Σ xbndFlow exactly |

### R11 · Burn Engine Treasury — KPIs + chart + monthly table (~2131–2160)
| # | Check | Status |
|---|---|---|
| R11.1 | "Balance today" + "seeded" sub interpolated | ✅ PASS — $5.07M; seeded $2.625M = 35% of public raise, live |
| R11.2 | Yield KPI | ✅ PASS — $38.0K/mo = balance × 9%/12, browser matches |
| R11.3 | Principal never spent | ✅ PASS — monotonic; identity = seed + ΣburnFlow + Σredirected exact |
| R11.4 | `cumBurnUsd` = Σ yieldUsd | ✅ PASS — $979.1K |
| R11.5 | FeeTable rows/headers | ✅ PASS — rows enumerated (incl. new redirect row, verified in browser M1–M6); headers `M{(year-1)*12+i+1}` correct (P7); React keys = unique labels (P6); only Year 1–3 buttons (P10); no totals column exists |

### R12 · Public Staking Pool — KPIs + dual-axis chart (~2162–2187)
| # | Check | Status |
|---|---|---|
| R12.1 | "Currently staked" + $ sub | ✅ PASS — 214.39M / $25.6M, browser = engine |
| R12.2 | Implied APY = target while budget lasts | ✅ PASS — exactly 10.0% every month emission > 0 (pre-emission denominator confirmed in code) |
| R12.3 | Reward slice remaining | ✅ PASS — 10.79M of 45M (15% of Community), live-interpolated; budget does NOT exhaust in 36mo |
| R12.4 | Cumulative demand-bought | ✅ PASS — $12.08M = Σ demandUsd; switch-off logic verified in code (moot on defaults since budget lasts) |
| R12.5 | Sub-label wording | ✅ PASS (F-2 fixed) — sub-label now states "% of the circulating float valued at launch price (deliberately not live market cap)" |
| R12.6 | Dual axes + exhaustion behavior | ✅ PASS — axis bindings correct; exhaustion path structurally correct (untriggered on defaults) |

### R13 · Monthly Tokenomics Breakdown FeeTable (~2189–2193)
| # | Check | Status |
|---|---|---|
| R13.1 | Row set → engine fields; M12 column | ✅ PASS — 10 rows enumerated (incl. new redirect row); M12 spot: PR $45,152 / burn $36,121 / xBND $9,030 / balance $3.096M / mcap $12.8M / FDV $39.6M — FDV = (1B−burned)×price and mcap = circ×price exact |
| R13.2 | Split labels live | ✅ PASS — "(80%)"/"(20%)" interpolated from `burnSplitPct` |
| R13.3 | Year selector / headers / keys | ✅ PASS — same FeeTable verified at R11.5. Note: extSeed dist row always renders (shows 0s when extSeed off) — cosmetic, acceptable |

### R14 · Investor Economics — KPIs + monthly cash-flow table (~2195–2213)
| # | Check | Status |
|---|---|---|
| R14.1 | KPIs = `investorSummary.totalReturn` same field | ✅ PASS — browser +308.6%/+87.5%/+105.5% = harness exactly |
| R14.2 | "Total xBND paid" = R10.4 endpoint | ✅ PASS — $558.8K |
| R14.3 | Sell-proceeds attribution fair | ✅ PASS — per-cohort = soldTokens × avgSellPrice (blended); cohort total $4.14M ⊂ AMM total $25.57M (remainder = team/community/marketing/org/public-pool sells, unattributed by design — disclosed here per D3) |
| R14.4 | Row gating | ✅ PASS — xBND rows seed/extSeed only; public sell-only; extSeedOn block conditional |

### R15 · Investor Economics — Cohort Summary table (~2215–2278)
| # | Check | Status |
|---|---|---|
| R15.1 | Additivity | ✅ PASS — exact for all 3 cohorts |
| R15.2 | remainingTokens + sold = vested | ✅ PASS — sold ≤ vested all cohorts (Seed 34.4M/100M, ExtSeed 15.7M/53.3M — note ExtSeed only 66.7% vested by M36 by design, Public 31.9M/150M) |
| R15.3 | Invested = raise $, live | ✅ PASS ($2.5M display = fd-rounding of 2.48M) |
| R15.4 | xBND APY convention + n/a | ✅ PASS — simple annualized (cumDist/invested × 12/36); browser 5.6% = computed 5.64%; "n/a" for Public |
| R15.5 | Convention consistency across 3 APY columns | ✅ PASS (F-10 fixed) — headers now "APY (simple, ann.)" / "Overall APY (CAGR)"; footnote 1 extended |
| R15.6 | remainingValue at final simulated price | ✅ PASS |
| R15.7 | Total return values | ✅ PASS vs live engine (+308.6/+87.5/+105.5). The audit doc's +399/223/139 is a different metric — see F-5 |
| R15.8 | Footnote 3 claim | ✅ PASS — is exactly the R10.2-verified property |

### R16 · Public Staking Pool — $10,000 Illustration (~2281–2308)
| # | Check | Status |
|---|---|---|
| R16.1 | Purchase at launch price, compounding at actual emission rate | ✅ PASS — browser 220.94K/244.08K/269.64K BND = harness; equals 10%/12 monthly compounding while budget lasts (never exhausts on defaults) |
| R16.2 | Value at simulated price | ✅ PASS — $8.8K/$15.1K/$32.3K |
| R16.3 | Flat after exhaustion | ✅ PASS structurally (apy→0 ⇒ tokens flat); untriggered on defaults |
| R16.4 | Hold-pure vs churn disclosure | ✅ PASS (F-11 fixed) — sub-label now states hold-pure at launch price |

---

## Phase C — Cross-display consistency matrix (one number, every place it appears)

Verify these are the SAME value everywhere they render (D1/D2 — no re-derivations):

| # | Number | Appears in | Status |
|---|---|---|---|
| C1 | `cumBurned` M36 | R3.5 KPI · R9.3 chart · R11.1 KPI · audit doc | ✅ PASS — 18.91M everywhere incl. audit doc (regenerated, E3 done) |
| C2 | `price` M36 | R3.1 KPI · R8 chart endpoint · R12.1 sub · R15.6 · R16.2 | ✅ PASS — $0.1196 all five |
| C3 | `cumDistSeed+ExtSeed` | R10.4 · R14.2 · R15 xBND column sum | ✅ PASS — $558.8K all three |
| C4 | `publicStaked` M36 | R12.1 · R12.6 chart endpoint · R9.1 | ✅ consistent where shown (214.4M) but ABSENT from R9's stack — F-6 |
| C5 | Staking budget 45M | R4.3 footnote · R12.3 KPI · vesting carve-out in R5.1 | ✅ PASS |
| C6 | Total raise $12.98M | R15.3 sum · A3 ledger · pool seed + burn seed + company sum | ✅ PASS |
| C7 | `circulating` M36 | A2 invariant · R9.2 stack total · TGE-float denominator basis (R3.5) | ✅ PASS (740.9M), with F-6/F-7 caveats noted |

---

## Phase D — Verification battery (all must pass before sign-off)

| # | Check | Status |
|---|---|---|
| D1 | `npm run build` — zero errors | ✅ PASS — clean after every edit (580 modules) |
| D2 | Harness run: supply invariant (A2) + cash ledger (A3) + baseline reproduction (A5) all pass | ✅ PASS — `diag/a-checks.mjs`, `b-checks.mjs`, `d-checks.mjs` all green |
| D3 | Browser eyeball of every section on defaults — no NaN, no "—" where data exists | ✅ PASS — every KPI/chart/table spot-checked = engine; three-band chart + redirect row render clean. Note: **app is single-theme (fixed light palette)** regardless of OS scheme — not a defect, but logged (the audit HTML, separately, IS theme-aware) |
| D4 | Slider-perturbation smoke (engine + browser) | ✅ PASS — `d-checks.mjs`: burnSplitPct 80→50 grows xBND 2.5×; publicPrice 0.05→0.08 shrinks public tokens; targetStakingApy 20 tracks; stakePct 0 redirects full slice. **Browser live-coupling:** raised main-sim Monthly Growth 0.8M→1.5M → Tokenomics M36 $0.1196→$0.1204, xBND $558.8K→$698.9K (PR feed is live). Restored to Default after |
| D5 | Zero-value probes (P4) | ✅ PASS — demandStrengthPct/stakingRewardPct/orgVolumePct/sellThrough/burnApy all = exactly 0 output, no `||`-revert; engine `||` usage audited = only `|| 0` (identity-safe), no nonzero-default swallowing |
| D6 | Scope honesty | ✅ Deep numeric verification covers M1/M6/M7/M10/M12/M13/M18/M24/M30/M36; all 36 months covered structurally by the A2/A3/A4 invariants (hold every month) |

## Phase E — Close-out

| # | Check | Status |
|---|---|---|
| E1 | Findings doc written | ✅ PASS — `AUDIT_TOKENOMICS_RESULTS_FINDINGS.md`, 11 findings (F-1…F-11) with verdicts, severities, fixes, verification |
| E2 | Every auditor fix re-reviewed (P6) | ✅ PASS — F-1 engine placement verified (redirect at step 13, earns yield next month — negligible/defensible timing convention; identity exact); no new React key warnings from the 2 added table rows or the 3rd chart band; **F-7 fix additionally resolved a latent inconsistency** (the vesting-slider hint at ~L1810 already claimed treasury TGE shows in the KPI — now true) |
| E3 | Regenerate audit HTML | ✅ PASS — `public/bound-tokenomics-audit.html` updated: drawdown −21.4→−21.3%, BE balance $5.03→$5.07M, burned 18.7M→18.91M / 1.87→1.89%, burns spent $969K→$979K, M36 price $0.1195→$0.1196 (2 places), ExtSeed held $9.69M→$9.71M/+224%, Public $17.93→$17.94M; **F-5 resolved** with a "Basis:" note distinguishing if-fully-held (+399/224/139%) from live actual-execution (+309/88/106%); **F-1 redirect disclosed** in the Burn Engine section. All rendered-verified in browser |
| E4 | Owner sign-off obtained | ⏳ PENDING — this summary |

## Phase G — Regression guard: the six fixed bugs (handover §8) must stay fixed

| # | Fixed bug | Re-check | Status |
|---|---|---|---|
| G1 | Dead demand mechanism (benchmark gate) | No benchmark/cap gating `demandUsd`; demand > 0 whenever emission > 0 | ✅ PASS (verified D5: stakingRewardPct 0 ⇒ demand 0; else ungated) |
| G2 | Reflexive demand explosion | `demandUsd` anchored to `a.publicPrice`, never live price | ✅ PASS (R10.2 price-independence + code read) |
| G3 | Invented treasury USDC | Pool seed = `extSeedRaised + publicRaised × liq%` only; 120M liq allocation adds NO extra depth | ✅ PASS (A3 ledger + A4) |
| G4 | APY denominator timing | Emission + implied APY use PRE-emission staked balance | ✅ PASS (R12.2 = exactly 10% every emission month) |
| G5 | 774% M1 APY | Target-rate emission, budget-capped, no decaying schedule | ✅ PASS (R12.2 + code) |
| G6 | Audit doc pool snapshot | Audit doc price-impact from pristine $6.75M/135M pool | ✅ PASS — untouched by regeneration; still pristine seed |

---

## Known open flags going in — RESOLUTION (all verdicted during Phases A–B)

1. **R12.5** → confirmed stale, **fixed** (F-2).
2. **R10.3** → confirmed relic, **relabelled** (F-2b).
3. **R9.1** → answer: NEITHER band held it; **third band added** (F-6).
4. **R1.2** → confirmed stale (post-F-1 digits + F-5 ROI-methodology mismatch + old 4.08%-vs-3.6% float note now moot after F-7); **regeneration scheduled at close-out** (E3, owner-approved).

## Final status (2026-07-23)

**All phases complete except E4 (owner sign-off).** 16 sections (R1–R16) + Phases A/C/D/G done;
every engine-side claim verified numerically via `diag/{a,b,d}-checks.mjs` (all green), every
display spot-checked in the browser against the engine.

**Findings: 11 total.** 1 engine defect (F-1, fixed), 10 display/label/doc issues (all fixed or
owner-resolved). Zero unresolved defects that show a wrong number to the user. Remaining
non-blocking note: **F-3.1** — pre-existing React duplicate-key warnings on the MAIN simulator
pages (not Tokenomics), out of scope, recommend a separate pass.

**Scope honesty:** deep hand-verification covers the event months (M1/M6/M7/M10/M12/M13/M18/M24/
M30/M36); the other 26 months are covered structurally by the supply/cash/AMM invariants, which
are checked on all 36 rows.
