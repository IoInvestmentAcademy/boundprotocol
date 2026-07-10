# BOUND Protocol Simulator v7 — Handoff

**Last synced:** 2026-07-10 — **Participant Economics tab deep audit (Addendum 4) — DEEP-AUDIT SERIES COMPLETE: all four Simulation Results tabs now have dedicated identity probes** (`audit-overview/bcisc/pr-er/participant-economics`). E1–E9 all pass (real `computeLpOutcome` vs second implementation, linearity, netApy↑-with-hold guard, net<gross). One transparency fix: cards' fine print now explains the conversion-fee leg is net of the BND-paid share (paid in BND tokens, never deducted from the deposit). Earlier same day: **Protocol Reserve Revenue + Emergency Reserve tab deep audit** (Addendum 3): all numbers verified to SOURCE level via new permanent probe `scripts/audit-pr-er-identities.mjs` (P1–P16 — incl. exact ER roll-forward/target/top-up re-derivation, per-market integration/maintenance/trade/haircut from served volumes × live rates, and full fee chains from sliders). One fix: the PR chart tooltip summed to gross but showed only the net total — now shows Gross → − ER top-up → Net so it visibly adds up. Earlier same day: **BCI SC Revenue tab deep audit** (see `AUDIT_SECTIONS_7-10_RESULTS_PAGE.md` Addendum 2): all numbers verified correct via new permanent probe `scripts/audit-bcisc-identities.mjs` (B1–B10, incl. cross-checks against the LP fee-table exports); three copy fixes — Pool+APSS cards on BOTH revenue tabs now say "ALL pool volume (retail + RWA)" (was "retail flow", understating the base), Mint/Redemption rate now follows the `mintRedeemFee` slider (was hardcoded 0.3%), chart headline "M12 total"→"M12 · monthly revenue". Also same day: **Protocol Reserve Revenue tab restructured (owner request)** to mirror BCI SC Revenue: the single Monthly Breakdown table split into a $ table (7 sources + Total) + a new **% Composition** table (mirrors BCI SC's, last row = cumulative PR balance). The "Gross / − ER top-up" rows that used to sit inline in the $ table moved into a brand-new **Emergency Reserve** section (own reference card explaining seed/funding/target/waterfall + own Performance table: balance, the two funding credits, target, and coverage %). Two new memos (`prMonthlyCompositionData`, `erPerformanceTableData`); pure UI reorg, no engine values touched, full battery re-confirmed green.

**Earlier the same day — DEFAULT PRESET RECALIBRATED (owner-directed):** see table below. Also: Year 4/5 pool-growth sliders removed (unreachable dead controls — 36-month engine can't reach poolYearIdx 3/4, P10 pitfall); all 10 RWA markets' Integration Fee default $150K→$50K; Overview tab table section renamed "Private Liquidity Providers"→"Liquidity Providers"; Liquidity Layer KPI subtitle dropped its "blended yield" clause.

| Field | Was | Now |
|---|---|---|
| `lpGrowth` (Private monthly growth) | $500K | **$800K** |
| `poolInitialVolume` | $200K | **$50K** |
| `poolStart` | Month 4 | **Month 6** |
| `poolGrowthY1/Y2/Y3` | 7/3/3% | **20/15/12%** |
| `privateBCIConversion` | 98% | **92%** |
| `retailBCIConversion` | 98% | **80%** |
| `convFeeRwaUSD` | 0.89% | **0.88%** |
| `integFee` (all 10 markets) | $150K | **$50K** |
| `layerMinBuffer` (USDC floor) | 5% | **10%** |
| `morphoMinReserve` | 20% | **22%** |
| `aaveYield` | 3.5% | **2.2%** |
| `morphoYield` | 4.5% | **5.3%** |
| `enhancedYield` | 7.5% | **6.2%** |
| `bcUsdcCoverage` (Bound Core) | 100% | **24%** — activates the USDC Yield Position / float yield stream, previously always $0 |

Measured impact (live default preset): M12 annG 8.4%→**12.9%**, M12 Bound Core USDC $0→**$243.4K** (now non-zero). Full battery re-run and green after the recalibration.

**Earlier the same day — ECONOMICS CHANGE (owner-directed):** private mint, private redeem (incl. same-class pre-pool RWA redemption fee), RWA trade fee, and RWA haircut splits all flipped **20/80 → 80% BCI SC / 20% Protocol Reserve**. Engine + per-market table + all UI cards/hints + docs + verification scripts (C6, hand-verify) updated together; maintenance/pool/yield splits unchanged. Measured impact (3-market benchmark): M12 annG 8.47%→**13.64%**, M36 9.46%→**14.52%**, PR cumulative M36 $4.21M→**$2.16M**. App default M12 headline now 13.4%. Docs conversion-fee wording also reverted to 0.88% per owner (note: default preset slider remains 0.89%). Earlier same day: Overview-tab deep audit, owner-requested — every identity behind the BCI Annualized Growth headline independently re-derived across 36 months × 2 configs via new permanent probe `scripts/audit-overview-identities.mjs` (T1–T8, all pass); one label defect fixed ("this month" shown on yearly sums in the All view); dead memo fields from the same-day table restructure removed; see `AUDIT_SECTIONS_7-10_RESULTS_PAGE.md` Addendum). **All 10 sections audited + docs synced (BoundLegend v4.0)** — awaiting owner sign-off on 3–10.

Financial simulation UI for BOUND Protocol: BCI index price, LP flows, RWA markets, fee revenue, and Protocol Reserve.

**Read `AUDIT_PLAN_SECTIONS.md` first if you're picking this up mid-audit.** This file is the
quick-start/orientation doc. For formulas, worked examples, and per-finding attribution, use
the section audit docs listed below — they are the source of truth for what changed and why.

### Documentation map (attribution)

| Document | Owns |
|---|---|
| `AUDIT_PLAN_SECTIONS.md` | Audit order, color-tag plan, orphaned-code list |
| `AUDIT_SECTION_1_*.md` | Private LP — signed off (+ MNaN table-header fix in signoff addendum) |
| `AUDIT_SECTION_2_RETAIL_LP.md` | Retail LP audit + **cross-cutting preset / 10-market setup** (§ changelog) |
| `AUDIT_SECTION_3_RWA_MARKETS.md` | RWA engine — Addendum 1 (STEP 0 reorder), Addendum 2 (LCR redesign) |
| `AUDIT_SECTION_4_LIQUIDITY_LAYER.md` | Layer waterfall UI — full findings table (§4) |
| **`HANDOFF.md` (this file)** | Orientation, merged changelog index, verification battery, deferrals |

**Rule:** If a detail isn't here, check the section doc first. Section docs are authoritative
for formulas, severity, and owner-trigger context.

---

## Quick start

```bash
cd bound-simulator-v7-latest   # or your clone path
npm install
npm run dev:fresh              # preferred — kills stale servers first
```

**Live URL:** **http://127.0.0.1:5239/** (`vite.config.js` + `scripts/dev-fresh.mjs`, both
set to port **5239**, strict — fails if taken).

Close **all** older tabs (5173–5238). Use **hard refresh** (Cmd+Shift+R) if the UI looks stale.
Stale ports from previous working copies (`~/bound-simulator-v7`, etc.) have repeatedly served
old bundles — always confirm the URL bar shows **5239**.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:fresh` | **Preferred.** Kills known stale ports, starts Vite on 5239 |
| `npm run dev` | Start Vite only (may fail if port taken) |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | oxlint — **45 pre-existing cosmetic warnings** repo-wide (none from recent audits) |
| `npm run preview` | Serve production build |
| `node scripts/verify-invariants.mjs` | **Primary harness** — **30 invariant families**, 36 months, exits non-zero on failure |
| `node scripts/hand-verify-m12.mjs` | Independent M12 re-derivation — **32/32 values**, diffed against engine |
| `node scripts/audit-conservation.mjs` | Ledger tie-out (1-market + 3-market configs) |
| `node scripts/audit-overview-identities.mjs` | Overview-tab display identities T1–T8 (SC/NAV roll-forwards, price×supply=backing, annG, annual-summary aggregation) — 36 months × 2 configs |
| `node scripts/audit-bcisc-identities.mjs` | BCI SC Revenue tab identities B1–B10 (7-stream sum, cross-export re-derivations, post-flip splits, composition=100%, per-market maint, conv/entry vs LP fee-table exports) — 36 months × 2 configs |
| `node scripts/audit-pr-er-identities.mjs` | PR Revenue + Emergency Reserve identities P1–P16 incl. SOURCE level (gross/net/ER identity, prCum & ER exact roll-forwards, target/top-up formulas, per-market integ/maint/trade/haircut from served volumes × live rates, fee chains from sliders) — 36 months × 2 configs |
| `node scripts/audit-participant-economics.mjs` | Participant Economics identities E1–E9 (real `computeLpOutcome` vs second implementation, fee legs, Net-APY formula, amount-linearity, netApy↑ with hold, net<gross, RWA-holder averages) |
| `node scripts/diagnose-10-markets.mjs` | 10-market default pipeline stress-check |
| `node scripts/quantify-reorder-impact.mjs` | Isolates §3 Addendum 1 STEP 0 reorder before/after (§3 doc) |
| `node scripts/compare-scenarios.mjs` | Legacy CLI (predates Default-only preset model) |

**Run build + the first three verification scripts after ANY engine change.**

---

## Project layout

```
bound-simulator-v7-latest/
├── src/
│   ├── BoundSimulator.jsx   # Engine + UI (~4,900 lines)
│   ├── BoundLegend.jsx      # In-app Documentation view
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   ├── dev-fresh.mjs        # Port 5239; sweeps 5173–5238
│   ├── verify-invariants.mjs
│   ├── hand-verify-m12.mjs
│   ├── audit-conservation.mjs
│   ├── quantify-reorder-impact.mjs
│   └── diagnose-10-markets.mjs
├── AUDIT_PLAN_SECTIONS.md
├── AUDIT_CHECKLIST_TEMPLATE.md
├── AUDIT_SECTION_1_*.md     # Private LP (signed off)
├── AUDIT_SECTION_2_RETAIL_LP.md
├── AUDIT_SECTION_3_RWA_MARKETS.md
├── AUDIT_SECTION_4_LIQUIDITY_LAYER.md
├── VERIFICATION_REPORT.md   # Frozen pre-section-audit history — do not trust preset numbers here
├── vite.config.js           # DEV_PORT = 5239
└── package.json
```

---

## Audit status (section-by-section)

| # | Section | Doc | Status |
|---|---|---|---|
| 1 | Private Liquidity Providers | `AUDIT_SECTION_1_*.md` | Signed off |
| 2 | Retail Liquidity Providers | `AUDIT_SECTION_2_RETAIL_LP.md` | Audited; changelog in doc |
| 3 | RWA Markets | `AUDIT_SECTION_3_RWA_MARKETS.md` | **Closed 2026-07-09** — Addendum 2; awaiting owner sign-off |
| 4 | Liquidity Layer | `AUDIT_SECTION_4_LIQUIDITY_LAYER.md` | **Re-audited by 2nd reviewer 2026-07-09** (ER export bug fixed, S27, UI rework — see doc Addendum); awaiting owner sign-off |
| 6 | Bound Core Reserve | `AUDIT_SECTION_6_BOUND_CORE.md` | **Audited 2026-07-09** — yield double-count fixed (S28), dead state removed, table reworked; awaiting owner sign-off. One open call: default 100% coverage makes BC yield $0 (see doc §5) |
| 5 | Capital Flow Reconciliation | `AUDIT_SECTION_5_CAPITAL_FLOWS.md` | **Audited 2026-07-09** — renamed, moved last, split into 5 tables, pool-volume aggregation bug fixed (S29); awaiting owner sign-off |
| 7–10 | Simulation Results page (BCI SC, PR, Price, Economics) | `AUDIT_SECTIONS_7-10_RESULTS_PAGE.md` | **Audited 2026-07-09** — PR ER-top-up display fix (S30), duplication cut, 4-tab restructure; awaiting owner sign-off |

Procedure for each section: `AUDIT_CHECKLIST_TEMPLATE.md`.

---

## Preset & market model

- **One preset:** `Default` (+ Custom when any slider moves). Old bear/bull/conservative presets removed.
- **Authoritative preset values:** read `PRESETS.default` in `BoundSimulator.jsx` or the latest section audit — not `VERIFICATION_REPORT.md`.
- **10 RWA markets**, staggered launches M1–M28 (see `rwaMarkets` initial state in source).

---

## Core accounting (verified — updated 2026-07-09)

| Rule | Detail | Introduced / verified in |
|---|---|---|
| BCI SC | Fee revenue surplus only — not LP collateral | All audit passes |
| Layer NAV | `privateLayerBal + retailLayerBal` — backs BCI price with BCI SC | §1, §4 |
| BCI Price | `(Layer NAV + BCI SC) / supply`; mint/burn at start-of-month price | §9 (consumer) |
| Private LP lock | **6 months** (`p.lockPeriod`) — real engine behavior | §1 |
| Layer yield | **Never compounded** into LP balances; paid 80/10/10 BCI SC / PR / ER | §4 |
| `layer === layerPostUpdate` | Yield payout means no post-yield NAV bump | §3 Addendum 2, §4 |
| RWA capacity basis | Sized off **this month's** `layerPostUpdate` (STEP 0 reorder) | §3 Addendum 1; invariant **S22** |
| **BCI redemptions senior** | LP exits served before RWA capacity; pipeline returns count | §3 Addendum 2; invariant **S16** |
| **LCR guard on RWA** | `rwaLcrTarget` (default **1.5×**) caps acceptance | §3 Addendum 2; invariant **S23** |
| Per-market pipeline | `mkPipe[]` — each market drains at own `issuerRedemptionDays` | §3 Addendum 2; invariant **S24** |
| Minting discount | **Applied** to mint haircut (one-month lag, `appliedMintingDiscount`) | §3 Addendum 2; invariant **S25** |
| LCR obligations | Based on **served** RWA volume, not raw demand | §3, §4 |
| Engine horizon | **36 months** — UI tables trimmed to Years 1–3 where audited | §2, §3, §4 |

---

## Slider ownership (where controls live in the UI)

All structural params share one `yld` state object → `layerCfg` → `simulate()`.

| Parameter | UI section | Engine effect |
|---|---|---|
| `layerMinBuffer`, `layerRedemptionDays`, `layerRwaCoverageDays` | Liquidity Layer | USDC buffer sizing |
| `morphoMinReserve`, `enhancedMaxPct` | Liquidity Layer | Morpho/Enhanced split |
| `aaveYield`, `morphoYield`, `enhancedYield` | Liquidity Layer | Layer yield revenue |
| `lcrHealthy`, `lcrWarning`, `lcrStress` | Liquidity Layer | Stress mode thresholds |
| `rwaAcceptEmergency`, `rwaLcrTarget`, `protocolReservePct` | Liquidity Layer | EMERGENCY throttle + RWA LCR floor + PR target |
| ~~`bciLockExt*` sliders~~ | **Removed 2026-07-09** (display-only) | Stress-box "+N days" now uses engine defaults +15/+30/+60 |
| `maxRwaPct`, `mkMaxPct` | **RWA Markets** (Retention Caps) | Inventory vs pipeline routing |
| `mintDiscountRwa*`, `mintDiscountWarning/Stress/Emergency` | **RWA Markets** (Minting Discounts) | Mint haircut revenue (lagged) |
| `issuerRedemptionDays` | Per-market card in RWA Markets | Per-market pipeline drain speed |

**Display-only (not wired to engine lock):** `bciLockExtension` sliders in Liquidity Layer — actual exit lock is `p.lockPeriod` in Private LP.

---

## Changelog — engine & verification (2026-07-09)

### Cross-cutting — preset & market model (`AUDIT_SECTION_2_RETAIL_LP.md` § changelog)

Logged in Section 2 doc (outside §2 scope per owner instruction); summarized here for handoff.

| Change | Attribution |
|---|---|
| Retail LP defaults reset (`poolInitialVolume` $200K, growth 7/3/3/2/1%, outflow 8%, `bndUsage` 10%) | `PRESETS.default` — owner screenshot |
| Private LP defaults reset (`initPrivateLp` $3.2M, `privateBCIConversion` 98%, `convFeeRwaUSD` 0.89%) | `PRESETS.default` — owner screenshot |
| **10 RWA markets** staggered M1–M28 (was 3) | `rwaMarkets` initial state + `diagnose-10-markets.mjs` |
| Section renamed "RWA Users" → **"RWA Markets"** | UI copy |
| `hand-verify-m12.mjs` pool growth no longer hardcoded at 20% | Script fix — exposed by preset change |
| `HANDOFF.md` / `VERIFICATION_REPORT.md` refreshed for section-audit process | Docs — owner documentation sweep |
| MNaN table-header fix (`FeeTable` missing `year` prop) | `AUDIT_SECTION_1_SIGNOFF.md` addendum |

**Owner flags (still open):** Private + Retail BCI conversion both 98% — confirm intentional;
RWA concentration display (held + pipeline) deferred to §3 (resolved in Addendum 2).

### Section 3 — RWA Markets (`AUDIT_SECTION_3_RWA_MARKETS.md`, Addendum 2)

**Owner trigger:** LCR 0.99 (M5) / 0.91 (M7) — not a breakdown, but a design flaw.

| Change | Attribution |
|---|---|
| BCI redemptions **senior** to RWA capacity allocation | Engine reorder in `simulate()`; owner trigger (LCR 0.99/0.91) |
| **LCR guard** (`rwaLcrTarget`, default 1.5) on RWA acceptance | New slider (Liquidity Layer) + engine cap; invariant **S23** |
| **Per-market pipeline ledger** (`mkPipe[]`) | Replaces single-bucket unweighted drain; invariant **S24** |
| `weightedRedemptionDays` now genuinely pipeline-weighted | Engine display export |
| `marketStats[i].pipeline` exported | Engine → UI per-market rows |
| Minting discount **wired into revenue** (one-month lag) | `prevMintingDiscount` → `mintHc`; `appliedMintingDiscount` export; **S25** |
| Preventive discount thresholds proportional to `maxRwaPct` (75%/90%/100%) | Engine + slider labels |
| Layer Capacity card: removed fabricated post-yield vs pre-yield rows | UI — `layer === layerPostUpdate` always |
| Layer Capacity card waterfall (BCI first, LCR guard) | UI — RWA Markets section |
| Fee-table market selector **full-array index** fix | UI — RWA Markets (latent misalignment) |
| Fee table `integFee`/`maintFee` fallback aligned with engine | UI — RWA Markets |
| Summary Card demand rows read `marketStats[i].liqDemand/mintDemand` | UI — no AUM re-derivation (C1 class) |
| Deleted dead/wrong `rwaAum` export | Engine (C6: render or delete) |
| §2 worked example + battery text refreshed against live engine | `AUDIT_SECTION_3_RWA_MARKETS.md` |
| Invariants **S16** rewritten, **S23–S25** added | `scripts/verify-invariants.mjs` |
| Hand-verify rewritten for new waterfall | `scripts/hand-verify-m12.mjs` → **32/32** checks |

**Measured impact (10-market default):** min LCR 0.905 → 1.501; 36/36 HEALTHY; cum BCI SC +1.4%; cum PR +2.7%; M36 annG 8.988% → 9.106%.

### Section 3 — prior (Addendum 1, STEP 0 reorder)

| Change | Attribution |
|---|---|
| LP entry/exit computed **before** RWA capacity sizing | Engine STEP 0 — uses real `layerPostUpdate` |
| Exported `layerPostUpdate`, `rwaInLayerNow` for UI | Engine → Layer Capacity card |
| Layer Capacity card reads engine (not `sim[ms-2]` guess) | UI — C1 parallel-derivation fix |
| Invariant **S22** guards stale-layer regression | `scripts/verify-invariants.mjs` |
| `quantify-reorder-impact.mjs` — isolated before/after | Script — **small net revenue decrease** (honest); reorder still correct |
| Hand-verify script rewritten for new order | 28/28 → later 32/32 after Addendum 2 |

**Addendum 1 profitability note:** reorder fixes M1 $0-capacity bug but cumulative annG is
~0.05–0.08pp lower at M36 (concentration-ladder denominator effect). Layer stays
demand-constrained 36/36. See §3 doc for full numbers — do not advertise as revenue increase.

### Section 4 — Liquidity Layer (`AUDIT_SECTION_4_LIQUIDITY_LAYER.md`)

| Change | Attribution |
|---|---|
| Architecture banner: BCI seniority + LCR floor (removed inverted "RWA > BCI" text) | UI — Finding #1 (Critical stale text) |
| Layer Composition table reads **engine yield exports** (C1 fix) | `layerTableData` useMemo — Finding #2 |
| Table restructured: 6 section headers, inline `$ (%)`, neutral ink for liquid tiers | UI — Findings #4–5 |
| Composition tiles: USDC/Morpho/Enhanced neutral ink (RWA keeps risk color) | UI — Finding #6 |
| Years 1–3 only (removed Year 4/5) | UI — Finding #3 (P10 horizon) |
| **Structure & Distribution reference card** (Retail LP fee-card pattern, 2×6 columns) | UI — owner request 2026-07-09; Finding #4 |
| Liquidity Layer sliders: **3 focused columns** (Buffer/Coverage, Yields, LCR/Stress/Reserve) | UI — Finding #7 |
| RWA caps + mint discount sliders **moved to RWA Markets** | UI reorganisation — Finding #7 |
| Removed duplicate per-market redemption timing block from Liquidity Layer | UI — Finding #7 |
| Removed 10 dead legacy `yld` fields; warn thresholds from `maxRwaPct × 0.5/0.75` | State cleanup — Finding #8 |
| Removed `rwaHaircutTriggered` from `layerCfg` | Dead config — Finding #9 |
| Removed dead table fields (`bciAnnualYield`, USDC sub-breakdown rows) | UI — C6 |
| `bciLockExtension` hints → display-only (actual lock = `p.lockPeriod` in Private LP) | UI — Finding #10 |
| `reserveTriggered` documented as non-firing at default LCR floor 1.5 | Observation — Finding #11; defer §8 |
| Exported `liquidCapital`, `totalObligations` for LCR display | Engine |
| Invariant **S26**: tier sum = Layer NAV; LCR reconstructs | `scripts/verify-invariants.mjs` |

### Section 4 — Independent re-audit (2nd reviewer, owner-requested, 2026-07-09)

| Change | Attribution |
|---|---|
| **ER row bug (owner-reported): `er_morpho` never exported** — table read a non-existent field, Emergency Reserve row blank 36/36 months | Engine export added; P6-class defect in prior pass's own "reads engine exports" fix |
| Invariant **S27**: `er_morpho` exists + 80/10/10 sums to gross + pr = er = 10% | `scripts/verify-invariants.mjs` (now 27 families) |
| Engine independently re-verified: LCR-guard algebra re-derived by hand, per-market pipeline order, BCI seniority, 80/10/10 — **prior pass's engine work stands** | §4 doc Addendum Finding 2 |
| Composition tiles re-colored (green/blue/amber restored; owner overruled neutral ink) | UI — owner request |
| Monthly table: 6 sections → 3 numbered; tier colors; "LCR inputs" merged into health | UI — owner request ("not approachable") |
| Reference card rewritten in plain language (12 cells); tags match tier colors | UI — owner request |
| **3 `bciLockExt*` sliders removed** (display-only); `yld` fields + `layerCfg` pass-throughs deleted; stress box uses engine defaults | UI/state — owner: "remove irrelevant sliders" |
| `protocolReservePct` hint discloses it cannot fire at default LCR floors | UI honesty |
| Lint kept at 45 — one new warning introduced by this pass's own edit caught & removed | P6 discipline |

### Section 6 — Bound Core Reserve (`AUDIT_SECTION_6_BOUND_CORE.md`, 2026-07-09)

| Change | Attribution |
|---|---|
| **CRITICAL (latent): BC yield double-count** — yield was accrued into `bcUsdcNav` AND paid to BCI SC/PR (`bci_float`/`pr_float`); same dollar booked ~2× whenever `bcUsdcCoverage < 100%`. Invisible at defaults (100% coverage ⇒ yield position $0). NAV accrual removed — distribute-once, matching Layer-yield rule | Engine fix; default preset provably unchanged |
| Invariant **S28**: NAV = Σ(flows) only; gross = Tier2 × rate/12; 80/20 sums; anti-vacuity — runs at 80% coverage | `scripts/verify-invariants.mjs` (now 28 families) |
| `hand-verify-m12.mjs` accrual replication removed to match | scripts |
| 6 dead `yld` fields removed (`bcFypPct/bcFypYield/bcDailySellVol/bcMinBufferDays/bcGasDeploy/bcGasRedeem` — never engine-read, never rendered) | state cleanup |
| ~12 dead component-level `bc*` aliases removed — lint 45 → **35 warnings**, 0 new | cleanup / P6 |
| Monthly table: Year 4/5 buttons removed (P10), **idle-rwaUSD liability row added** (amber), NAV row relabelled, unused memo fields dropped | UI |
| "Monthly rwaUSD drain" fabricated `×0.02` fallback removed — engine export only | UI honesty |
| **Open owner call:** default 100% coverage makes the whole BC yield stream $0 for 36 months (structurally, not a bug) | doc §5 |

### Section 5 — Capital Flow Reconciliation (`AUDIT_SECTION_5_CAPITAL_FLOWS.md`, 2026-07-09)

| Change | Attribution |
|---|---|
| Renamed `"Protocol Capital Flows — Monthly Overview"` → **"Capital Flow Reconciliation"**; moved from above Bound Core Reserve to LAST (correct dependency order — it's a pure consumer of 1–4 & 6) | owner request |
| **CRITICAL: "Total Pool Volume" nested "Private Contract Volume" under it** — implied private LP deposits were counted in the pool total; engine's `pVol` never includes `lpIn` (separate direct-contract channel, never touches the AMM). Fixed: pool total now has only its 4 real children; private volume is its own row; new honest **"Total Capital Entering Protocol"** = both channels summed explicitly | Engine untouched — UI/data-memo fix |
| Invariant **S29**: `pVol` = sum of its 4 channel legs; `newToBoundCore`/`rwaUSDToLayer`/`bciOutflowThisMonth` aggregates match their component sums | `scripts/verify-invariants.mjs` (now 29 families) |
| One 36-row table → **5 focused tables** (Market Volume / Private LP Flow / Retail LP Flow / Bound Core Flow / Liquidity Layer Flow), matching the existing per-fee-table pattern | owner request ("break this big table") |
| Bound Core / Liquidity Layer **stock** rows (NAV, balances) removed from this section — they duplicated the Bound Core Reserve and Layer Composition tables; this section now shows flow only, with a pointer to where the stock lives | dedup |
| Retail LP table gained the same fee-breakdown detail (pool fee, net received, conv fee) the Private LP table always had — was asymmetric before | UI parity |
| Trimmed 5 years → 3 (P10) | cleanup |
| Dead memo fields removed (`bciSC/bciSupply/bciPrice/annG` + 4 duplicate aliases, never rendered by the old table) | cleanup |

### Sections 7–10 — Simulation Results page (`AUDIT_SECTIONS_7-10_RESULTS_PAGE.md`, 2026-07-09)

| Change | Attribution |
|---|---|
| **PR Monthly Breakdown didn't add up**: 7 source rows are gross, bold total was NET (post-ER top-up) — up to 10% of the month's revenue silently vanished between rows and total. Engine now exports `totalPrRaw` + `erTopUp`; table gained "Gross (sum of sources)" and "− Emergency Reserve top-up" rows | display defect, fixed; invariant **S30** (now 30 families) |
| BCI SC table `gross` re-summed in the UI instead of reading `totalBci` (rule 8) — now reads the export | fix |
| **Both "% Composition" tables removed** (BCI SC + PR) — third rendering of the same data (chart shows composition, $ table has the numbers); memos deleted | owner-authorized duplication cut |
| Year 4/5 buttons + 5-year memos trimmed to 3 across both revenue sections + Price & Backing (P10, 4th recurrence) | cleanup |
| **Page restructured into 4 tabs**: Overview (KPI + price chart + Price & Backing) / BCI SC Revenue / Protocol Reserve Revenue / Participant Economics — `resultsTab` state, tab bar in header, sticky Back-to-Inputs shared | owner request |
| Fee-source reference cards' split %s hand-checked against engine constants — all correct | verified, no change |

Also same-day (owner-directed, pre-audit): Simulation Results moved to its own page (sticky nav buttons), KPI cards Range-linked (were frozen at M12 — dead `ms` state), BCI Price & Backing got an independent year selector, Participant Economics rebuilt as per-investor calculators (`computeLpOutcome` — aggregate-export approach was wrong), footer "Model Basis" card deleted.

### Documentation sync (`src/BoundLegend.jsx`, v3.0 → v4.0, 2026-07-09)

| Change | Was (v3 doc) | Now (matches v8 engine) |
|---|---|---|
| BCI price formula | `SC / Supply` | `(Layer NAV + BCI SC) / Supply`; LP capital in Layer, SC = fee revenue only; mint/burn at start-of-month price |
| Monthly appreciation threshold (12% target, revenue switching) | documented as live | **removed** — explicit "Removed in v4" note; all revenue follows fixed splits |
| Bound Core | 70/30 FYP, ~0.85% net, insurance netting, 20% haircut buffer, 3-phase split | two-tier coverage model (raw USDC + USDC Yield Position, 4.5%/yr), flat 80/20, distribute-once |
| Liquidity Layer | ILB/AYL/EYL velocity formula | 4-tier waterfall (USDC/Morpho/Enhanced/RWA held), LCR + stress modes, 1.5x acceptance guard, BCI-senior capacity order |
| LP redemption | "waits full issuer period, no queue" | 6-month lock + monthly exits, served senior from Layer liquidity; issuer T+30-120 applies to the per-market RWA pipeline |
| Conversion fee | 0.88% | 0.89% (current default) |
| Concentration | >20% single-issuer trigger | 3-step ladder at 10%/market + 20% category caps, held-only metric, no punitive cliff |
| ER | at-risk = AYL+EYL+held+FYP; "10% yield uncredited" | at-risk = Morpho + BC Yield Position; 10% of Layer yield CREDITED to ER + capped PR top-up; 3-layer waterfall |
| Scenarios | Bear/Base/Bull | Default (10 staggered markets, $3.2M seed, 98% conv, 36 months) + Custom |
| Glossary | ILB/AYL/EYL/FYP/threshold entries | 4-tier, LCR, USDC Yield Position, issuer pipeline entries |

---

## Verification battery (current — run after any change)

```
npm run build                         ✓
node scripts/verify-invariants.mjs    ✓ 30 families (S1–S30; see script for list)
node scripts/hand-verify-m12.mjs      ✓ 32/32 values
node scripts/audit-conservation.mjs   ✓
npm run lint                          ✓ 45 pre-existing warnings
```

Deep hand-recomputation: **M12 only**. Other 35 months: structural invariants + conservation.

---

## UI map — where to find recent work

| What | Where in app |
|---|---|
| RWA capacity waterfall (BCI senior, LCR guard) | RWA Markets → Layer Capacity card |
| Per-market pipeline + demand (engine `marketStats`) | RWA Markets → Summary + fee tables |
| Retention caps + mint discount sliders | RWA Markets → bottom card |
| LCR gauge + composition tiles (neutral liquid tiers) | Liquidity Layer → top |
| Buffer / yield / LCR sliders (3 columns) | Liquidity Layer → control panel |
| **Layer Composition — Structure & Distribution** (reference card) | Liquidity Layer → above monthly table |
| Layer Composition monthly table | Liquidity Layer → below reference card |
| Layer yield in revenue charts | BCI SC Revenue / PR Revenue → "Layer Yield" slice |

---

## Known deferrals (not forgotten)

| Item | Target section |
|---|---|
| Wire `bciLockExtension` to Private LP lock OR remove sliders | §1 follow-up |
| Model Protocol Reserve deploy when `reserveTriggered` | §8 PR Revenue |
| Origin badge colors (AUDIT_PLAN § color tags) | Cross-cutting UI |
| Orphaned `KPI` component + `yc` yield-curve dataset | AUDIT_PLAN § orphaned code |

---

## Tech stack

React 19 · Vite 8 · Recharts · single-file engine (`BoundSimulator.jsx`).

---

## Port config

Canonical port: **5239**. Edit `DEV_PORT` in `vite.config.js` **and** `PORT` in
`scripts/dev-fresh.mjs` together. Always use `npm run dev:fresh`.
