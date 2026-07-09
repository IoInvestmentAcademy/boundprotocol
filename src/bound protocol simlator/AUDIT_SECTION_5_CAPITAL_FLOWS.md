# Audit — Section 5: Capital Flow Reconciliation (formerly "Protocol Capital Flows")

**Date:** 2026-07-09 · **Procedure:** `AUDIT_CHECKLIST_TEMPLATE.md` (Phases A–F)
**Scope:** the cross-section summary table (renamed, restructured, and moved this pass),
its data memo (`protocolFlowsTableData`), and every field it reads.
**Nature of this section:** per `AUDIT_PLAN_SECTIONS.md`, this is a **pure consumer** — it
generates no new numbers, only re-displays numbers already verified at their source in
Sections 1–4 and 6. Its audit is therefore "does every displayed value equal the
already-verified source value," not formula re-derivation.

---

## 1 · Changes made this pass (owner-directed)

1. **Moved to last position** — was rendered *above* Bound Core Reserve; now rendered
   *after* it, as the final assumptions-page section. Correct per the audit plan's own
   dependency ordering (source sections 1–4, 6 before the pure-consumer section 5).
2. **Renamed** `"Protocol Capital Flows — Monthly Overview"` → **`"Capital Flow
   Reconciliation"`** — the old name didn't signal that its purpose is cross-checking,
   not generating, numbers.
3. **One 36-row table → five focused tables**, mirroring the existing per-fee-table
   pattern used elsewhere in the app (e.g. "Private LP — Minting & Redemption Fees"):
   1. Market Volume by Channel
   2. Private LP — Capital Flow
   3. Retail LP — Capital Flow
   4. Bound Core — Inflow / Outflow
   5. Liquidity Layer — Inflow / Outflow
4. **Trimmed 5 years → 3** (P10 — engine horizon is 36 months; Years 4–5 were dashes).
5. Intro card rewritten to state the finding below in plain language and to point readers
   to where stock/balance figures actually live (Layer Composition, Bound Core Reserve,
   Simulation Results) so this section isn't duplicating them.

## 2 · Finding — CRITICAL: "Total Pool Volume" silently implied it included Private LP volume

**Before:** the single table's first section was:
```
Total Pool Volume         (bold)
  Pool — Retail Buy
  Pool — Retail Exit Sell
  Pool — RWA Liquidation
  Pool — RWA Minting
  Private Contract Volume   ← nested under the pool total, with a section-separator rule
```
Nesting `Private Contract Volume` directly under `Total Pool Volume` with the same
visual treatment as the other four (genuine) pool sub-flows implied it was already
counted in the bold total above it. It was not: the engine's own `pVol` formula
(`src/BoundSimulator.jsx` ~L444) is `retailPoolVol + retailExitSellVol + rwaPoolSellVol +
rwaPoolBuyVol` — four terms, no `lpIn`. The private LP path is a genuinely separate
direct-to-contract channel that never touches the AMM pool. A reader summing the
displayed rows for "total capital movement" would have silently double-counted nothing
(the bold total itself was correct) but would very plausibly have added the private row
to the pool total, overstating combined volume by the full private deposit amount every
month — e.g. **M1: $3.6M pool-adjacent total would read as $3.6M + $3.7M private = $7.3M
when true combined activity is $3.7M** (pool hadn't even started in M1–M3 in the default
preset).

**Fix:**
- `pVolTotal` (renamed **"AMM Pool Volume (total)"**) now has exactly its 4 real children,
  no private row nested inside it.
- `privateContractVol` (**"Private Contract Volume (direct — not pool)"**) is its own
  top-level row, explicitly labeled as not-pool.
- Added **`totalAllChannels`** (**"Total Capital Entering Protocol (both channels)"**) —
  a new, honestly-labeled combined figure = `pVol + lpIn`, so readers who do want a
  single top-line number get one that's actually correct, instead of being invited to
  construct a wrong one themselves.
- **Guard:** new invariant **S29** asserts `pVol === retailPoolVol + retailExitSellVol +
  rwaPoolSellVol + rwaPoolBuyVol` every month (3-market default preset, all 36 months) —
  this exact bug class (an aggregate silently omitting or including a channel) is now
  permanently caught if it recurs.

## 3 · Other corrections made during restructuring

- **Bound Core / Liquidity Layer stock rows removed from this section.** The old table
  re-displayed `rwaUSDIdle`, `bcNav`, `bcUsdc`, `bcYieldPos`, `bcCovAch`, `layerTotal`,
  `privLayerBal`, `retailLayerBal` — all balance/composition figures that already have
  their own authoritative tables (Bound Core Reserve's monthly breakdown; Layer
  Composition's monthly table). Keeping a second copy of a stock figure in a "flow"
  section is exactly the kind of parallel redundancy rule 8 warns about for
  *re-derivations*; here the values weren't re-derived (they read the same fields), but
  displaying the same stock number in two different sections invites them to drift
  visually out of sync if only one table's styling is later touched. Removed — this
  section now shows flow only (inflow/outflow), with an explicit note pointing to where
  the stock figures live.
- **Dead computed fields removed.** The old memo also computed `bciSC, bciSupply,
  bciPrice, annG, bciInPrivLayer, bciInRetailLayer, bciInFees, bciOutPriv, bciOutRetail`
  — none of these were ever rendered by the old table (confirmed by grep before this
  pass). `bciInPrivLayer`/`bciInRetailLayer`/`bciOutPriv`/`bciOutRetail` were exact
  duplicates of fields already used elsewhere (`privateToLayer`, `retailToLayer`,
  `privateLayerOut`, `retailLayerOut`); `bciSC`/`bciSupply`/`bciPrice`/`annG` duplicate
  the BCI Price & Backing table in Simulation Results. Removed rather than wired, since
  wiring them would have re-created the same stock-duplication problem above.
- **Retail LP table gained the same fee-breakdown detail the Private LP table always
  had** (pool fee, rwaUSD received net of fee, conversion fee, net-to-layer) — previously
  the retail side only showed the two endpoints (`retailPoolBuy` → `retailToLayer`),
  which was asymmetric with the Private LP row detail and hid where the retail pool fee
  (0.3%) actually went. All added fields (`retailPoolFeeEntry`, `retailRwaUSDRecv`,
  `convAmountRetail`, `retailConvFeeEntry`) were already engine exports — no new
  computation was added anywhere.
- Every field in the rebuilt memo is a direct engine-export read (`row.<field> || 0`);
  none are re-derived. Verified by design (each line is a single property read) and by
  invariant S29's cross-checks against independently-known component sums.

## 4 · Cross-reference / responsiveness check

All 5 tables update immediately from slider changes because they read `sim` (the
`simulate(p, rwaMarkets, layerCfg)` memo) — the same single source of truth as every
other section. No independent recompute, no stale cache: confirmed by tracing every key
in the memo back to a `row.<field>` read with no arithmetic beyond `+` combinations of
two already-correct fields (`totalAllChannels`, and the pre-existing `bcInTotal`/
`layerInTotal`/`layerOutTotal` which are themselves direct exports, not sums computed in
the UI).

| Table | Reads (all from `sim[i]`, i.e. one `simulate()` call) |
|---|---|
| Market Volume by Channel | `pVol, retailPoolVol, retailExitSellVol, rwaPoolSellVol, rwaPoolBuyVol, lpIn` |
| Private LP — Capital Flow | `lpIn, privMintBCI, privMintPR, rwaUSDReceived, convAmountEntry, privConvInBCI, privateToLayer, privateBoundCore, privateLayerOut` |
| Retail LP — Capital Flow | `retailPoolVol, retailPoolFeeEntry, retailRwaUSDRecv, convAmountRetail, retailConvFeeEntry, retailToLayer, retailBoundCore, retailLayerOut` |
| Bound Core — Inflow/Outflow | `newToBoundCore, privateBoundCore, retailBoundCore, boundCoreOutflow` |
| Liquidity Layer — Inflow/Outflow | `rwaUSDToLayer, privateToLayer, retailToLayer, bciOutflowThisMonth, privateLayerOut, retailLayerOut, rwaLiq, rwaMint` |

## 5 · Verification battery

```
npm run build                       ✓ clean
node scripts/verify-invariants.mjs  ✓ ALL PASS — 29 families (S29 new)
node scripts/hand-verify-m12.mjs    ✓ ALL VALUES MATCH
node scripts/audit-conservation.mjs ✓ ALL TIE-OUTS PASS
npm run lint                        ✓ 0 errors · 35 warnings (unchanged — no new dead code)
dev server                          ✓ 200 @ http://127.0.0.1:5239/
Playwright smoke test               ✓ section renders last, renamed correctly, all 5 tables present with correct data
```

**P6 self-check:** the restructuring itself is guarded (S29 covers the exact bug class
just fixed); no new unused variables were introduced (lint count unchanged at 35).
