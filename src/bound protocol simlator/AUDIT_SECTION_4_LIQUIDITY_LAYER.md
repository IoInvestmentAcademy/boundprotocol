# Section 4 Audit — Liquidity Layer

**Status:** Complete — fixes applied, verification battery passed (2026-07-09). Awaiting owner sign-off.

**Handoff index:** merged changelog + slider ownership → `HANDOFF.md` (§ Changelog — Section 4).

---

## 1. Logic, in plain English (engine order)

The Liquidity Layer holds **all LP collateral** (private + retail). BCI SC holds fee surplus only — it is not part of the Layer.

Each month, after LP entry/exit flows establish `layerPostUpdate`, the engine runs a **4-tier waterfall**:

1. **USDC buffer (Aave, T+0)** — sized to the **largest of three constraints**: `minBufferPct` floor, BCI redemption coverage (`dailyBCIOutflow × redemptionDays`), or served-RWA coverage (`dailyRWALiqDemand × rwaCoverageDays`). Capped at 80% of the Layer.
2. **Yield bucket** — everything not in the USDC buffer.
3. **RWA in the yield bucket** — held inventory + issuer pipeline (both illiquid; reduce Morpho/Enhanced deployment).
4. **Morpho + Enhanced split** — Enhanced capped at `enhancedMaxPct` of the post-RWA yield bucket; Morpho floored at `morphoMinReserve` % of the Layer; remainder to Morpho.
5. **LCR** — `liquidCapital / totalObligations`, where liquid = USDC + Morpho + Enhanced, obligations = 30-day BCI exits + `rwaCoverageDays` of **served** RWA (not raw demand).
6. **Stress mode** — HEALTHY / WARNING / STRESS / EMERGENCY from LCR vs three thresholds.
7. **Yield** — three sources on allocated amounts; **fully paid out** as protocol revenue (80% BCI SC / 10% PR / 10% ER). **Never compounded into LP balances** — so `layer === layerPostUpdate` at month-end.
8. **BCI price** — `(Layer NAV + BCI SC) / supply`.

**Cross-section couplings (A4):**

| Parameter | Slider lives in | Engine read |
|---|---|---|
| LP inflows/outflows | Private LP, Retail LP | `privateToLayer`, `privateLayerOut`, `retailToLayer`, `retailLayerOut` |
| RWA served volume | RWA Markets | `rwaLiq` → `dailyRWALiqDemand`, buffer sizing |
| Retention caps | RWA Markets (moved here in this audit) | `maxRwaPct`, `mkMaxPct` |
| Mint discounts | RWA Markets (moved here in this audit) | preventive + reactive ladders |
| RWA acceptance LCR floor | Liquidity Layer | `rwaLcrTarget` (engine block in RWA capacity, displayed here) |

---

## 2. Formulas + worked example — M12, 10-market default, engine-verified

```
layerPostUpdate     = prior privBal + privToLayer − privOut + prior retBal + retToLayer − retOut
bciRedemptionCovPct = (dailyBCIOutflow × redemptionDays) / layerPostUpdate × 100
rwaLiqCovPct        = (dailyRWALiqDemand × rwaCoverageDays) / layerPostUpdate × 100
usdcBufferPct       = min(80, max(minBufferPct, bciRedemptionCovPct, rwaLiqCovPct))
usdcBufferAmt       = layerPostUpdate × usdcBufferPct / 100
yieldBucketAmt      = layerPostUpdate × (100 − usdcBufferPct) / 100
rwaInLayer          = min(held + pipeline, yieldBucketAmt)
enhancedAmt         = min(yieldBucketAfterRwa × enhancedMaxPct/100, max(0, yieldBucketAfterRwa − morphoFloor))
morphoAmt           = max(0, yieldBucketAfterRwa − enhancedAmt)
liquidCapital       = usdcBufferAmt + morphoAmt + enhancedAmt
totalObligations    = bciOutflowThisMonth + dailyRWALiqDemand × rwaCoverageDays
LCR                 = liquidCapital / totalObligations   (99 if obligations = 0)
layerYieldGross     = usdc×aaveYield/12 + morpho×morphoYield/12 + enhanced×enhancedYield/12
bci_morpho          = layerYieldGross × 0.80   → credited to BCI SC revenue as "Layer Yield"
```

**M12, engine-verified 2026-07-09** (Default preset, 10 markets):

```
Total Layer NAV     $9.66M
  USDC buffer       $2.17M (22%)   binding constraint: served-RWA coverage
  Morpho            $1.56M (16%)
  Enhanced          $0.00M (0%)     enhancedMaxPct cap binds when RWA crowd the yield bucket
  RWA held          $1.93M (20%)    at category cap
  RWA pipeline      $3.99M (41%)    issuer cash in transit
  ── tier sum ──    $9.66M ✓

LCR                 1.501× HEALTHY
Near-term obligations $2.49M (BCI exits + 14-day served RWA)
Layer yield gross   $12,192/mo → BCI SC $9,753 · PR $1,219 · ER $1,219
Blended annual      1.51%/yr on Layer NAV
```

---

## 3. Cross-reference map (D1)

| Engine field | Consumer |
|---|---|
| `layer`, `privateLayerBal`, `retailLayerBal` | BCI Price Mechanics, Protocol Capital Flows, header badge |
| `usdcBufferAmt`, `morphoAmt`, `enhancedAmt` | Composition tiles, Layer Composition table, LCR gauge |
| `rwaCollateralBal`, `rwaPipelineBal`, `rwaHeldPct` | Composition tiles, table per-market rows, RWA concentration |
| `lcr`, `stressMode` | LCR gauge, table, section badge |
| `layerYieldGross`, `aaveYieldMonthly`, … | Layer Composition table (now reads engine directly) |
| `bci_morpho`, `pr_morpho`, `er_morpho` | Layer Composition table distribution rows; BCI SC / PR revenue charts as "Layer Yield" |
| `blendedAnnualYield` | Section badge, Bound Core sub-header |
| `bindingConstraint`, `bciRedemptionCovPct`, `rwaLiqCovPct` | Engine export only (available for future UI) |
| `liquidCapital`, `totalObligations` | LCR gauge obligations line; table LCR inputs row (new) |
| `bciLockExtension` | Stress panel (**display only** — not wired to Private LP lock engine) |
| `reserveTriggered`, `protocolReserveTarget` | Stress panel (**reserve deploy not fully modeled in cash flows**) |

**Blending note (D3):** BCI SC "Layer Yield" slice = `bci_morpho` only. The Layer Composition table's yield section shows the same three-way split. It will **not** match total BCI SC revenue (which also includes pool, conversion, RWA, float, etc.).

---

## 4. Findings and fixes

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | **Critical (stale text)** | Architecture banner said "Priority: RWA liquidations > BCI redemptions" — inverted after Section 3 redesign | Rewritten to state BCI seniority + LCR floor |
| 2 | **Defect (C1)** | Layer Composition table **re-derived yield** from current slider values instead of reading `row.aaveYieldMonthly` / `row.bci_morpho` — would lie if sliders changed after sim ran | Table now reads engine exports only |
| 3 | **Defect (P10)** | Year 4/5 buttons on Layer Composition table — engine has 36 months only | Trimmed to Years 1–3 |
| 4 | **UI** | No row-level description for table components | Added **Layer Composition — Structure & Distribution** reference card (same pattern as Retail LP Fee Structure card: title, rate, tag badges, `what` paragraph). Two rows × six columns covering all table row types. Owner request 2026-07-09. |
| 5 | **UI** | Table hard to scan — flat colored rows, no section grouping | Restructured into 6 labeled sections; USDC/Morpho/Enhanced use neutral ink; % of NAV inline |
| 6 | **UI** | Composition tiles used green/blue/amber for liquid tiers | USDC/Morpho/Enhanced now neutral ink (RWA keeps risk coloring) |
| 7 | **Slider hygiene** | 4 columns with duplicate RWA caps + mint discounts + per-market redemption block (duplicate of RWA section) | RWA caps + mint discounts **moved to RWA Markets**; redemption block removed; 3 focused columns in Liquidity Layer |
| 8 | **Dead state** | 10 legacy `yld` fields (`layerILB`, `layerAYL`, gas deploy/redeem, hardcoded concentration 5/10%) never read by engine v4 | Removed from state; warn thresholds now derive from `maxRwaPct × 0.5 / 0.75` |
| 9 | **Dead config** | `rwaHaircutTriggered` passed to `layerCfg` but never read by engine | Removed from `layerCfg` |
| 10 | **Observation** | `bciLockExtension` sliders are **display-only** — Private LP lock is `p.lockPeriod` in a different section | Hints updated to say "informational / display only" |
| 11 | **Observation** | `reserveTriggered` never fires with default LCR floor 1.5 (LCR always ≥ 1.501) | Documented; slider kept for stress scenarios |

---

## 5. Sign-off checklist

### Phase A — Understand & document
- [x] A1 Plain-English logic (engine order)
- [x] A2 Formulas with grep-matching variable names
- [x] A3 Worked M12 example engine-verified via node
- [x] A4 Hidden couplings disclosed

### Phase B — Input layer
- [x] B1 Every remaining slider maps to engine read (RWA caps/discounts moved to RWA Markets — still one `yld` state)
- [x] B2 Hint text updated (BCI seniority, display-only lock extensions)
- [x] B3 Zero/extreme: existing invariant coverage
- [x] B4 Labels state actual multiplicands

### Phase C — Section tables/charts
- [x] C1 Single source of truth (yield re-derivation removed)
- [x] C2 Horizon honesty (Years 1–3 only)
- [x] C3 Header months correct (M13–M24 for Year 2)
- [x] C4 Hardcoded values interpolated in banner + description
- [x] C5 Description card added above table (**Retail LP fee-card pattern**, 2×6 component reference)
- [x] C6 Dead table fields removed (`bciAnnualYield`, `usdcFloor/BCI/RWA` sub-breakdown)

### Phase D — Cross-section propagation
- [x] D1 Grep map above
- [x] D2 Revenue charts read `row.bci_morpho` / `row.pr_morpho` — verified
- [x] D3 Blending documented
- [x] D4 Section 3 changes already re-verified in prior pass

### Phase E — Verification battery
- [x] E1 `npm run build` — clean
- [x] E2 `verify-invariants.mjs` — ALL PASS; **S26 added** (tier sum = NAV; LCR reconstruction)
- [x] E3 `hand-verify-m12.mjs` — 32/32 MATCH
- [x] E4 `audit-conservation.mjs` — PASS
- [x] E5 Dev server — http://127.0.0.1:5238/ (see `HANDOFF.md` for current port)
- [x] E6 Scope honesty: deep hand-check M12; other months structural via invariants

---

## 6. Deferrals

| Item | Handle in |
|---|---|
| Wire `bciLockExtension` into Private LP lock engine OR remove sliders | Section 1 follow-up |
| Model Protocol Reserve auto-deploy cash flow when `reserveTriggered` | Section 8 (PR Revenue) |
| Origin badge color system (AUDIT_PLAN § color tags) | Cross-cutting UI pass |

**Section 4 is ready for owner sign-off.**

---

## Addendum — Independent re-audit (2026-07-09, second reviewer; owner requested after distrusting the prior pass)

The owner asked for a full re-verification of this section by a different reviewer/model.
Every engine claim was re-checked from scratch; the prior pass's **engine-side** work all
re-verified clean, but its **table wiring** contained a real, owner-visible defect it had
marked as fixed, plus the owner requested several UI reversals/improvements.

### Finding 1 — CRITICAL (owner-reported): Emergency Reserve row empty in all 36 months

The Layer Composition table's "→ Emergency Reserve (10%)" row read `row.er_morpho` — but
the engine computed `er_morpho` internally and **never exported it** in the return
object, so the row rendered "-" in every month. This is a P6-class defect introduced by
the prior pass's own table rewrite: its Finding #2 fix ("table now reads engine exports
only") switched the row to an export that did not exist, and its E-battery passed anyway
because nothing verified the export's existence — the check was lexical, not live.

**Fixed:** `er_morpho` exported from the engine. **New invariant S27** guards this
permanently: `er_morpho` must exist on every row, `bci_morpho + pr_morpho + er_morpho`
must equal `layerYieldGross` to the cent, and `pr_morpho === er_morpho === 10%` each.
Verified live: M12 `er_morpho` = $4,041.08 = exactly 10% of $40,410.80 gross.

### Finding 2 — engine independently re-verified (prior pass's engine work STANDS)

Re-derived by hand, not trusted from the doc: the LCR-guard closed form
(`rwaLcrCap = (layerPost − rwaInLayerNow + pipeReturn + expectedMint − T·bciExits) / (1 + T·covFrac)`)
is algebraically correct, including the `expectedMint` liquidity-return term and its
conservative interaction with the `rwaCollateralInLayer` clamp; the per-market pipeline
ledger drains **before** this month's overflow is added (order correct); BCI seniority
waterfall and pro-rata category-cap routing into `mkPipe[]` are correct; the 80/10/10
split is correct. Section 3 Addendum 2's engine redesign is sound — the defect was
confined to this section's display layer.

### Owner-directed UI changes (this pass)

1. **Composition tiles re-colored** — USDC green / Morpho blue / Enhanced amber restored
   (the prior pass had made all three neutral ink; owner overruled). RWA Held keeps its
   risk coloring; Pipeline stays neutral.
2. **Monthly table restructured** — 6 fragmented section headers reduced to 3 numbered
   ones ("1 · Layer health", "2 · Composition", "3 · Monthly yield"), the orphaned
   one-row "LCR inputs" section merged into Layer health, tier rows re-colored to match
   the tiles, sub-rows marked with arrows. Same engine fields, no data change.
3. **Reference card rewritten in plain language** — all 12 cells (owner: "rewrite the
   text in order to be clear and understandable"). E.g. USDC buffer is now "the Layer's
   checking account"; obligations: "you don't reserve cash for business you declined";
   yield rows in cents-per-dollar terms. Tag badges now match tier colors.
4. **3 display-only "BCI Lock Ext" sliders REMOVED** (owner: "remove sliders that are
   not relevant"). They drove nothing in the engine (actual lock is `p.lockPeriod` in
   Private LP); the stress-box "+N days" readout still works from the engine's own
   defaults (+15/+30/+60). Also removed their `yld` state fields and `layerCfg`
   pass-throughs. `protocolReservePct` was kept (real tail-risk parameter, deploy
   modeling deferred to §8) but its hint now honestly discloses it cannot fire at the
   default LCR floor.

### Verification battery (re-run after all changes)

```
npm run build              ✓ clean
verify-invariants.mjs      ✓ ALL 27 families PASS (S27 added this pass)
hand-verify-m12.mjs        ✓ 32/32 VALUES MATCH
audit-conservation.mjs     ✓ ALL TIE-OUTS PASS
npm run lint               ✓ 45 pre-existing warnings, none new (one introduced by this
                             pass's own table edit was caught and removed — P6 discipline)
dev server                 ✓ http://127.0.0.1:5239/
```

**Section 4 re-audited and ready for owner sign-off.**
