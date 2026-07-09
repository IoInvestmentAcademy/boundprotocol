# BOUND Simulator — Verification Report (Passes 1–3, superseded by section-by-section audit)

**Date:** 2026-07-08 · **Scope:** full engine + UI verification of `src/BoundSimulator.jsx` per the handoff document, with owner rulings collected during the engagement.

> **⚠ This document is frozen at the end of Audit Pass 3.** Verification since then follows
> a section-by-section process instead — see **`HANDOFF.md`** for current orientation,
> `AUDIT_PLAN_SECTIONS.md` for the roadmap,
> `AUDIT_CHECKLIST_TEMPLATE.md` for the procedure every section follows, and
> `AUDIT_SECTION_1_*.md` / `AUDIT_SECTION_2_*.md` (etc.) for each section's findings and
> changelog. Preset values, market lists, and headline numbers quoted below are **stale**
> — the current default preset and RWA market list are documented in the latest
> `AUDIT_SECTION_N_*.md` changelog, not here. This file is kept for the historical record
> of Passes 1–3 (the original engine bugs: yield double-counting, RWA liquidity model,
> integration-fee double-count, etc.) — all still valid as *history*, just not as *current
> state*.

## Verdict

The simulation engine's arithmetic is now **internally consistent and verified**: every
mathematical invariant holds across all 36 months, and an independent hand-recomputation
of month 12 (27 intermediate values, formulas re-derived from the spec, not the code)
matches the engine exactly. Twelve issues were found and fixed across two verification
passes (2026-07-08), all confirmed with the owner before fixing — spanning the BCI price
engine, the RWA/liquidity model, and UI fee-table accuracy.

## Bugs found & fixed (all confirmed with owner before fixing)

### 1. Layer yield distributed twice (CRITICAL — was inflating the headline BCI curve)
`layerYieldGross` was allocated at ~190%: 100% split to BCI SC / Protocol Reserve /
Emergency Reserve (80/10/10) **and** a further 90% of the same dollars compounded into LP
principal (`privYieldShare`/`retailYieldShare`). Both terms of
`BCI Price = (Layer NAV + BCI SC) / Supply` were inflated by the same yield dollar,
compounding monthly. **Fix:** removed the LP-principal compounding; yield is distributed
exactly once via the 80/10/10 revenue split. (Owner ruling: bug, revenue split is the design.)

### 2. Phantom RWA minting (CRITICAL — booked revenue on inventory that didn't exist)
Minting volume was capped by Layer USDC (`layerUSDCAvailable × 0.5`) instead of by RWA the
protocol actually holds. The engine could "sell" more RWA than it owned — the collateral
balance floored at 0 while haircut/trade/pool revenue was still booked on the full volume.
**Fix:** `rwaMint = min(held inventory, demand)`. (Matches owner's described flow: minting
= selling RWA received from liquidations.)

### 3. RWA collateral model rebuilt to match the intended flow (owner-confirmed design)
Previously: the `maxRwaPct` cap only clamped the *displayed* allocation (the real balance
grew past it — 34/36 months in Conservative), and issuer redemption drained the **entire**
balance monthly, so the protocol never retained inventory to sell. Now, per the owner's
description: liquidations are always accepted up to Layer USDC capacity; received RWA is
held as sellable inventory up to `maxRwaPct` of the layer; the excess is routed to an
issuer-redemption pipeline (`rwaPipelineBal`, drains over `issuerRedemptionDays`); minting
sells only held inventory. Held inventory now respects the cap in **0/36** months breached.

### 4. EMERGENCY stress throttle was display-only
`rwaAcceptancePct` (drop to 50% acceptance in EMERGENCY) was computed but never applied to
volumes. **Fix:** prior-month stress mode now throttles this month's accepted liquidation
volume; the displayed rate reflects what was actually applied.

### 5. Zero values silently reverted to defaults (`||` fallbacks)
Four UI sliders reach 0 but their engine reads used `|| default`, so 0 became the default:
`aumGrowth` (0→2%), `integFee` (0→$150K), `maintFee` (0→$75K), and worst,
`bcUsdcCoverage` (0%→100% coverage). **Fix:** replaced with `??` at every read (engine +
UI). Also unified month-1 integration fees to use the market's own `integFee` like every
other launch month.

### 6. UI showed a different RWA capacity than the engine used
The "RWA Users" section displayed Layer USDC capacity as `layer × layerILB%` (a legacy
static 30% config), while the engine uses the dynamically computed `layerUSDCAvailable` —
the exact wrong-denominator bug class from the handoff §6.4. **Fix:** both occurrences now
read `md.layerUSDCAvailable`. Also removed the duplicate `rwaUSDIdle` key in the sim
return object (shadowed, harmless, lint noise).

## Also configurable now
Bound Core monthly outflow (was hardcoded 2%/month) is a slider: *"Monthly Outflow — % of
Idle rwaUSD"* in the Bound Core section (`bcOutflowRate`, default 2%).

## What was verified as CORRECT (no changes)

| System | Evidence |
|---|---|
| BCI price identity `(NAV+SC)/Supply` | S1: exact match, 108 month-rows |
| Mint/burn at start-of-month price, no circularity | code order verified; S11 |
| Deposit/withdrawal price-neutrality | S11: zero-fee run holds price at exactly 1.0 for 36 months |
| annG compound annualization | S2 + S12 (spec examples: m12→10.00, m24→4.88) |
| 4-tier waterfall sums exactly to layer total | S3: max error < $0.01 across all rows |
| Bound Core 1:1 liability/asset symmetry, zero-yield Tier 1 | S7 + hand-verify |
| LCR thresholds & stress modes | S8 |
| Minting discount = max(preventive, reactive), never sum | S9 |
| Served volume ≤ demand; revenue scaled by served/demand | S10 + hand-verify |
| All 7 revenue streams, splits per §4 table, no double-count | S6 + hand-verify `totalBci` |
| ER: `er_morpho` and `erTopUp` are distinct, non-overlapping paths | code trace; top-up capped at 10% of monthly PR |
| `totalPrRaw` (pre-ER) never surfaced in UI | grep: only used to derive `totalPr` |
| Inactive markets fully excluded | S13: bit-identical to no-market run |
| No dead phase-governor references | grep clean |
| UI revenue/price tables read engine fields directly | manual sweep |

**Verification harnesses (re-runnable):**
- `node scripts/verify-invariants.mjs` — 17 invariant families, exits non-zero on failure
- `node scripts/hand-verify-m12.mjs` — independent re-derivation of M12, 27 values
- `node scripts/baseline-dump.mjs` — headline outputs M12/M24/M36 for the Default preset
- `node scripts/diagnose-markets.mjs` — confirms revenue is monotonic in market count

### 7. Punitive triggered haircut removed from revenue projections (owner ruling)
The legacy safeguard (`rwaHaircutTriggered = 15%` above `rwaConcentrationHard = 10%`
concentration) had become a permanent revenue driver: the new inventory model holds RWA at
the 20% cap by design, so the punitive haircut fired nearly every month (~$616K of
Moderate's M12 revenue alone). Per the owner: this haircut is a **deterrent to protect the
protocol, not a revenue stream** — a working deterrent produces no volume at the punitive
rate. Revenue is now always projected at each market's baseline `liqHaircut`; the safeguard
remains in the protocol design and UI warnings but no longer inflates projections.

### 8. Per-market RWA ledger + committed-obligation LCR (owner-reported, 2026-07-08)
Two related defects reported from UI observation. (a) The "RWA Concentration in Layer"
bars displayed each market's monthly liquidation *demand* ÷ layer — external flow, not
held collateral — producing nonsense like three markets "holding" 56% + 65% + 35% of the
layer. (b) The LCR treated **full external demand** as an obligation, including volume
the protocol refused at the capacity constraint — so adding markets crashed the LCR into
STRESS/WARNING for 22/36 months and suppressed revenue, making more markets *less*
profitable. **Fix:** the engine now keeps a per-market held-inventory ledger (`mkHeld`):
accepted liquidation capacity is allocated pro-rata to demand; each market's minting
sells from its own inventory; each market's own haircut/trade-fee rates apply to served
volumes (replacing the blended-average approximation); the global cap scales all markets
pro-rata with excess routed to the issuer pipeline. LCR obligations now reflect
**committed (served) volume only** — refused demand is not a liability. The engine
exports `marketStats` (demand/served/held/concentration per market) and the UI bars read
it. Result: with 3 default markets, stress months went from 22/36 to 0/36, per-market
concentrations sum to the ≤20% cap, and revenue is now monotonic in market count
(M36 annG: 0 markets 5.5% → 1 market 9.7% → 3 markets 11.6%). New invariant S14 guards
the ledger (per-market held/served sums must equal the global figures every month).

### 9. RWA liquidity model rebuilt: no hard refusal cap, two-tier retention caps, gentle escalation ladder, BCI redemption queue (owner-directed, 2026-07-08)
The owner reported the concentration bars summing past 100% and, separately, that adding
markets should never make the protocol *less* profitable. Root design flaw: `maxRwaPct`
was being treated as a hard ceiling on what could be *served*, and the LCR crashed when
markets were added (see Fix #8) — the exact opposite of the owner's intent that idle Layer
liquidity should always be working (100% utilization = 100% revenue, not idle safety
margin). Rebuilt per the owner's explicit flow description:
- **No cap ever refuses a liquidation.** RWA liquidation has first claim on Layer USDC
  (it's the revenue engine). `maxRwaPct`/`mkMaxPct` only decide how much of what was
  already accepted stays as sellable inventory vs. gets routed to the issuer-redemption
  pipeline for cash back.
- **Two retention caps, checked in order:** per-market (`mkMaxPct`, new slider, default
  10% — no single RWA can be over-held) then category-wide (`maxRwaPct`, default 20%,
  scaled pro-rata across markets if still breached after the per-market cap).
- **BCI redemptions are now genuinely subject to Layer liquidity**, per the owner's exact
  instruction: "if there is idle USDC in the layer, always used for RWA liquidation... BCI
  redemption is subject to liquidity." Implemented as an informational backlog
  (`bciQueueBal`) — RWA liquidation draws Layer USDC first; BCI redemption draws whatever
  is left over, plus USDC returning that month from the issuer-redemption pipeline (which
  the owner specified should route straight to the waiting BCI queue, not general RWA
  buying power). This only affects *when USDC settles* — it does not alter BCI burn, Layer
  NAV, or fee revenue timing, keeping it isolated from the already-verified price mechanics.
- **3-step gentle escalation ladder** (owner-approved parameters: 50%/75%/100% of each cap
  → +0.10/+0.20/+0.30pp haircut, +0.05/+0.10/+0.15pp trade fee), additive across category
  and per-market concentration, priced off prior-month concentration. Replaces the old
  15%-cliff punitive haircut with a defensible, gradual deterrent.
- Fixed a genuine bug found while building this: an initial implementation applied a
  fill-ratio to fresh LP-exit demand *and* separately carried forward a queue balance,
  double-counting unmet demand. Caught by a new invariant (S15) before it shipped;
  redesigned so the queue is purely informational and cannot double-count.

New invariants **S15–S17** verify: queue/pipeline never negative, RWA never draws more
than `layerUSDCAvailable`, and per-market held inventory never exceeds its own cap — all
passing across 36 months on the 3-market default set. Result: 3 markets now beats 1 market
at every checkpoint (M36 annG: 1 market 8.4% → 3 markets 9.4%) with **0/36 stress months**
(previously 2–22 depending on configuration).

### 10. Private LP fee table was an independent re-derivation with a fabricated 6-month lock (owner question: "is retail LP profit calculated right?")
Auditing that question surfaced a worse issue on the *private* side: `privateFeesTableData`
duplicated the entry/exit math with its own copy of the formulas instead of reading the
engine's `sim` output, and invented `lpOut = m > 6 ? remaining * outRate : 0` — a "no exits
before month 6" rule that exists nowhere in the actual simulation (the `lockPeriod: 6`
preset field is dead, never read by `simulate()`). This table could silently diverge from
the real simulation. **Fix:** added 8 per-component fields to the engine's return object
(`privMintBCI/PR`, `privConvIn/OutBCI/BND`, `privRedeemBCI/PR`) computed once from the exact
same variables that feed the verified aggregate totals (`bci_entry`, `bci_conv`, `pr_entry`)
— the UI table now only reads these, with zero independent recomputation.

On the *retail* side, the audit found the fee table was already correctly sourced from
`sim` — but **no retail LP profit/net-yield calculation existed anywhere in the codebase**.
The honest answer to the owner's question was "it isn't calculated at all yet," not "it's
calculated wrong." Addressed in Fix #12 below.

### 11. Private & Retail LP fee tables restructured: hierarchical rows, split by fee type, separate totals table
Per the owner's request, both fee-revenue tables now use the same main-row/sub-row pattern
as the Layer Composition table (e.g. "Liquid Capital" → "-> USDC in Aave" → "-> Morpho
Vaults"), via a new shared `FeeTable` component, and are split into focused tables by color
instead of one long undifferentiated list:
- **Private LP**: Minting & Redemption Fees table, Conversion Fees table, Totals table.
- **Retail LP**: Pool Trading Volume table (new — main row + Buy/Sell sub-rows, mirroring
  the RWA table's Liq./Mint Volume pattern), Trading & APSS Fees table, Conversion Fees
  table, Totals table.
Each main row shows the gross fee/volume; sub-rows show its destination (BCI SC / Protocol
Reserve / BND Burn) or direction (Buy/Sell), color-coded per destination.

### 12. Participant Economics: fixed dead haircut reference, added net-yield calculation (owner-approved formula)
`Haircut: ${fp(p.haircutRate)}...` always rendered 0.0% — `p.haircutRate` doesn't exist
anywhere in the assumptions object (haircut rates live per-market as `mk.liqHaircut`).
Replaced with a live AUM-simple average of active markets' *effective* haircut and trade
fee (baseline + current escalation bump from Fix #9), so the display now reflects what the
model is actually charging that month. Added **Net Yield = BCI index growth − own
annualized fee drag** (fees paid ÷ own capital × 12/m × 100) for both Private and Retail
LP cards — the fee-drag calc deliberately **excludes APSS revenue** for Retail LP, since
the codebase's own fee-structure documentation states APSS is captured arbitrage spread,
not a fee deducted from the user's transaction; counting it would overstate their real cost.

## Headline impact (Default preset, single OUSG market unless noted)

| | M12 price | M36 price | M36 annG |
|---|---|---|---|
| Before any fixes (original handoff baseline) | 1.2856 | 1.9281 | 24.5% |
| After Fixes 1–8 (yield/RWA/haircut engine bugs) | 1.1090 | 1.3168 | 9.6% |
| After Fix #9 (RWA liquidity model rebuild, same 1-market config) | 1.0859 | 1.2747 | 8.4% |
| Default preset, 3 default markets (OUSG+BUIDL+PrivCredit) | 1.0826 | 1.3099 | 9.4% |

The 3-market default now outperforms the 1-market case at every checkpoint, and the model
runs at 0/36 stress months — both were structurally impossible before Fix #9. Growth
composition is fully traceable: baseline fee flows only, no double-counted yield, no
phantom inventory, no deterrent-penalty revenue, no capacity-refusal LCR cliffs.

## Audit Pass 3 (2026-07-08, post-UI-restructure) — full ledger tie-out

A third, "financial-audit-style" pass was run after the table restructures and RWA
liquidity rebuild, focused on money conservation and cross-system linkage. New permanent
harnesses: `scripts/audit-conservation.mjs` (ledger tie-outs C1–C7: BCI SC, PR cumulative,
layer balances, supply mint/burn, ER growth, split-ratio complements, per-market revenue
reconstruction) and invariant **S18** (per-market served volumes × effective rates must
reproduce engine haircut/trade revenue to the cent).

### 13. Integration fees double-counted in cumulative PR (pre-existing, found by tie-out C2)
For any market launching after month 1, the integration fee was credited to `prCum` twice:
once directly at the launch-month check, and once through the `pr_integ` revenue stream
(`totalPrRaw → totalPrAfterER → prCum`). This bug is verbatim in the original handoff code;
passes 1–2 missed it because the single test market launches at month 1, where only the
(separate) seed path fires. With the 3-market default it overstated cumulative Protocol
Reserve by $300K. **Fix:** all integration fees — including month-1 launches — now flow
exactly once through `pr_integ`; both out-of-band `prCum` credits removed. Conservation
check confirms $450K credited for 3 launches, exactly once each.

### 14. RWA Fee Revenue table was a parallel re-derivation that had drifted from the engine
Three divergences: (a) mint volume allocated by uniform demand scaling, but the engine
sells each market's own inventory; (b) baseline haircut/trade rates, missing the live
escalation-ladder bumps the engine actually charges; (c) months 37–60 displayed 100% of
demand served at full rates — fiction beyond the 36-month engine horizon. **Fix:** table
now reads the engine's `marketStats` ledger (served volumes + effective escalated rates,
incl. newly exported `mintHcPct`); months past M36 show zero like every other table.
Guarded by S18.

### 15. Two stale obligation displays
The Layer "Obligations" readout and the RWA-coverage slider hint still computed from raw
external demand; the engine (since Fix #8) uses committed/served volume. Both now read the
engine's `dailyRWALiqDemand` field.

### The 11% → 8.6% question (owner-raised): the old number was inflated, the new one is right
Decomposition (single-market Default config, `scripts/audit-anng-decomposition.mjs`):
- **Pipeline transit timing (main cause).** The earlier engine returned issuer-redemption
  cash the same month the RWA entered the pipeline — buy RWA, ship to issuer, receive
  cash, re-buy, all inside one month, on a 30-day redemption product. That let the layer
  serve physically impossible volume. Now only the prior month's pipeline returns; at M12
  ~$3.35M of a $7.2M layer sits in transit earning nothing, exactly as it would in
  reality.
- **Per-market retention cap** (10% vs the old effective 20%): −0.25pp at M12 (halves
  sellable mint inventory for a single market).
- **Escalation ladder**: adds back ~$146K of year-1 revenue via concentration bumps.
The 8.6% (1 market) / 8.3% (3 markets, M12; 9.4% by M36) figures are the defensible ones;
the previous 11% relied on a same-month capital round-trip that cannot happen.

### Audit conclusion
All ledgers tie out across 36 months × both market configurations: BCI SC moves only by
`totalBci`, cumulative PR only by post-ER `totalPr`, layer balances only by identified
LP flows, supply only by mint/burn at start-of-month price, ER only by its yield share +
capped top-up, and every fee split reconstructs its gross. The BCI redemption queue is
healthy (peak $60K, clears within one month, never unbounded). The independent M12
hand-recomputation still matches on all 27 values.

## Notes / remaining observations

1. **rwaUSD backing flow for liquidations** — per the owner's description, USDC should move
   Layer → Bound Core when new rwaUSD is minted for liquidating users. The engine instead
   nets this out (Layer USDC swaps directly for RWA). At monthly granularity this is
   economically equivalent, but Bound Core's displayed TVL slightly understates transit
   balances. Documented simplification; change only if investor materials show BC TVL.
2. Lint: one cosmetic `const-comparisons` warning remains (line ~2389) plus unused-var
   warnings; none affect results.
