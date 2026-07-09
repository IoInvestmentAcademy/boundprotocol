# Audit — Section 6: Bound Core Reserve

**Date:** 2026-07-09 · **Procedure:** `AUDIT_CHECKLIST_TEMPLATE.md` (Phases A–F)
**Scope:** engine block `src/BoundSimulator.jsx` (~L455–492 Bound Core two-tier allocation,
~L650–662 float-yield split), its sliders, the "Bound Core Reserve" UI section, and every
cross-section consumer of its numbers.
**Note on ordering:** the roadmap runs Bound Core (Section 6) *before* Protocol Capital
Flows (Section 5) because §5 is a pure consumer — dependency order per `AUDIT_PLAN_SECTIONS.md`.

---

## 1 · Logic, in plain English

Bound Core holds the **idle rwaUSD** — the share of LP deposits that never converted to
BCI (private: `1 − privateBCIConversion%`, default 2%; retail: `1 − retailBCIConversion%`,
default 2%). That rwaUSD is a **liability**: holders can exit instantly (pool sell or
direct redemption), so it must be backed by USDC.

Per month, in engine order:

1. **Inflow** `newToBoundCore = privateBoundCore + retailBoundCoreIn` — the non-converting
   slice of both LP entry paths (each already net of its mint/pool fee).
2. **Outflow** `boundCoreOutflow = boundCoreBal × bcOutflowRate/100` — % of the
   start-of-month idle stock redeemed out (default 2%/mo). Drains liability and USDC 1:1.
3. **Liability update** `rwaUSDIdle = max(0, bal + in − out)`.
4. **Asset update** `bcUsdcNav = max(0, nav + in − out)` — USDC funded 1:1 at mint,
   drained 1:1 at redemption. **No yield is retained in NAV** (see Finding 1).
5. **Two-tier split of NAV:**
   - Tier 1 *Peg Defence*: `bcUsdcAmt = min(NAV, required)` where
     `required = rwaUSDIdle × bcUsdcCoverage/100` (default 100%). Earns 0%.
   - Tier 2 *USDC Yield Position*: `bcYieldUsdcAmt = max(0, NAV − Tier1)`. Earns
     `bcYieldUsdcRate` (default 4.5%/yr).
6. **Yield** `bcYieldGrossMo = Tier2 × rate/12`, paid out **once**, flat
   **80% → BCI SC (`bci_float`) / 20% → Protocol Reserve (`pr_float`)**.
7. **Coverage health**: `bcCoverageAchieved = Tier1 / idle`, shortfall flagged red in UI.
8. `bcDeployed = Tier2` feeds the Emergency-Reserve target (`atRisk = morphoAmt + bcDeployed`).

**Structural consequence the owner should know (not a bug):** at the default
`bcUsdcCoverage = 100%`, NAV always equals the requirement, so **Tier 2 is $0 in all 36
months and the Bound Core yield stream contributes $0 to BCI SC and PR** at defaults. The
"BC Yield" slice in the revenue charts only becomes non-zero if coverage is set below
100%. If you want this revenue stream alive in the default story, the default coverage
must drop below 100% — owner decision, not changed in this audit.

---

## 2 · Findings

### Finding 1 — CRITICAL (latent at defaults): Bound Core yield was double-counted
- **What:** the engine added `yieldAccrual = prevYieldPos × rate/12` into `bcUsdcNav`
  (retaining the yield as Bound Core assets) **and** credited `bcYieldGrossMo` to
  BCI SC/PR as `bci_float`/`pr_float`. The same yield stream was booked twice — once
  compounding inside BC NAV, once as protocol revenue. Measured over 36 months at 80%
  coverage: **$7,928 retained in NAV + $8,363 paid out = $16,290 booked from a single
  ~$8K yield stream** (probe script, default preset, 1 market).
- **Why invisible until now:** at the default 100% coverage the yield position is
  structurally $0, so both terms were $0 — the conservation audit and all prior passes
  run at defaults and could not see it. It fired only when the coverage slider moved.
- **Fix (applied):** removed the NAV accrual (`prevBcYieldUsdcAmt` state deleted). NAV
  now changes with flows only; yield is paid out 80/20 exactly once. This matches owner
  ruling #1 (yield distributed once, never compounded into balances — the same rule that
  governs Layer yield) and matches the UI copy ("flat 80% BCI / 20% PR").
- **Default-preset impact:** exactly $0 in every month (proven — retained-yield term was
  identically zero at 100% coverage).
- **Guard:** new invariant **S28** — runs at 80% coverage (non-vacuous), asserts
  `bcUsdcNav == Σ(inflow − outflow)`, `gross = Tier2 × rate/12`,
  `toBCI + toPR = gross`, `bci_float = bcYieldToBCI`, and that at least one month
  actually produced yield (anti-vacuity check).
- `scripts/hand-verify-m12.mjs` updated to the same single-stream model (its accrual
  replication removed).

### Finding 2 — Dead state: six legacy Bound Core fields (removed)
`bcFypPct, bcFypYield, bcDailySellVol, bcMinBufferDays, bcGasDeploy, bcGasRedeem` sat in
the `yld` state, never passed to the engine (`layerCfg` never included them), never
rendered by any slider. Removed (same precedent as the `bciLockExt*` removal in §4).

### Finding 3 — Dead analytics aliases (removed)
`bcTotal, bcUsdc, bcFyp, bcGrossYieldMo, bcNetYieldMo, bcNetYieldAnn, safeFypPct,
bcDailyPoolVol, bcBlendedAnn, bcYieldGrossMo, bcYieldToBCI, bcYieldToPR` (component-level
copies) were declared but never read by any JSX. Removed — lint baseline dropped
**45 → 35 warnings**, zero new.

### Finding 4 — P10: Year 4/5 fiction in the monthly table (fixed)
`bcTableData` built 5 years and the table offered Year 1–5 buttons; Years 4–5 rendered
all dashes (engine horizon = 36 months). Trimmed to 3 years (memo + buttons), per
settled rule 7.

### Finding 5 — Misleading fallback in "Monthly rwaUSD drain" (fixed)
The Capital Flows snapshot fell back to `boundCoreBal × 0.02` (hard-coded 2%) whenever
`boundCoreOutflow` was 0 — so M1 displayed a fabricated non-zero drain and the fallback
ignored the `bcOutflowRate` slider. Now displays the engine export only.

### Finding 6 — Monthly table hid the liability side (improved)
The table showed only USDC assets ("Total Bound Core" = NAV). Added a top row
**"Idle rwaUSD in circulation (liability)"** (amber, matching the balance-sheet card) and
relabelled the NAV row "USDC NAV backing it (assets)" so the asset/liability pairing is
visible month by month. Unused computed fields (`req, shortfall, usdcPct, yldPct,
dailyVol, bciContrib`) dropped from the memo.

### Verified correct (no change)
- Inflow wiring: `privateBoundCore`/`retailBoundCoreIn` derive from the same
  money-conserving entry budgets verified in §1/§2 (invariant S20 covers retail).
- Tier split, coverage %, shortfall flag: hand-checked algebra; S7 guards tier sum = NAV.
- 80/20 float split: conservation C6 (`bci_float/0.80 == pr_float/0.20`) already guarded.
- Slider null-safety: `bcUsdcCoverage ?? 100` (min 0 — needs `??`, has it),
  `bcOutflowRate ?? 2` (min 0 — has it), `bcYieldUsdcRate || 4.5` (slider min 1, so `||`
  unreachable-safe; noted, left as is). `privateBCIConversion || 95` /
  `retailBCIConversion || 98` — slider mins are 50, `||` safe.
- ER coupling: `bcDeployed` (Tier 2) in the ER `atRisk` base — consistent with the ER
  reference card's wording.

---

## 3 · Cross-reference map (who reads Bound Core numbers)

| Consumer | Field(s) read | Where |
|---|---|---|
| Bound Core section (balance sheet, snapshot, monthly table) | `rwaUSDIdle, bcUsdcNav, bcUsdcAmt, bcYieldUsdcAmt, bcUsdcRequired, bcUsdcShortfall, bcCoverageAchieved, bcYieldUsdcMo, bcYieldGrossMo, bcYieldToBCI/ToPR, bcBlendedAnn, boundCoreOutflow` | §6 UI |
| KPI row (Simulation Results) | `bcUsdcAmt, bcCoverageAchieved, bcUsdcRequired, rwaUSDIdle` | 2 KPI tiles |
| Protocol Capital Flows table (§5) | `rwaUSDIdle, privateBoundCore, retailBoundCore, boundCoreOutflow, bcUsdcNav, bcUsdcAmt` | §5 rows |
| BCI SC Revenue (§7) | `bci_float` ("BC Yield" chart slice + table rows) | chart + 2 tables |
| Protocol Reserve Revenue (§8) | `pr_float` ("Float Yield" slice + rows) | chart + 2 tables |
| Emergency Reserve target | `bcDeployed` (in `atRisk`) | engine |

All consumers read engine exports directly — no parallel re-derivations found (rule 8 clean).

---

## 4 · Verification battery (after fix)

```
npm run build                       ✓ clean
node scripts/verify-invariants.mjs  ✓ ALL PASS — 28 families (S28 new)
node scripts/hand-verify-m12.mjs    ✓ ALL VALUES MATCH (accrual replication updated)
node scripts/audit-conservation.mjs ✓ ALL TIE-OUTS PASS
npm run lint                        ✓ 0 errors · 35 warnings (was 45 — 10 dead decls removed, 0 new)
dev server                          ✓ 200 @ http://127.0.0.1:5239/
```

**P6 self-check:** every edit in this pass (engine NAV change, alias removals, table
restructure) is itself guarded — S28 for the engine, build+lint for the removals, and the
new table row reads an existing exported field (`rwaUSDIdle`).

---

## 5 · Open item for owner

- **Default coverage = 100% ⇒ Bound Core yield = $0 for all 36 months.** The revenue
  stream, its charts, and the 80/20 split are wired and verified — but inert at defaults.
  Decide: keep 100% (maximum safety story, dead stream) or lower the default (live
  stream, partial instant-redemption coverage).
