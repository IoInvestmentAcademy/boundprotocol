# Business Plan Rebuild — Build Checklist

Rebuild of `BOUND_protocol_BM.pdf` (24 pages, "as of 25 February 2026", Deloitte-authored)
as a current-architecture business plan: **same structure, same graphic inventory, new protocol,
data pulled from the simulator**.

Status: `[ ]` not started · `[x]` done · `[!]` needs owner decision

---

## 0 · Source assessment (complete)

- [x] **0.1** Old plan read in full — 24 pages, structure and every chart catalogued (§3).
- [x] **0.2** Old plan describes a **different protocol**. Token architecture is
      BND (stablecoin) / sBND (yield-bearing) / BNT (governance), distributed through a
      retail savings app with a capped APY. Current architecture is
      **rwaUSD (stablecoin) / BLI (index) / BND (governance)** — RWA liquidity infrastructure.
      Not a renaming: the business, the customer and the revenue engine all differ.
- [x] **0.3** **The PDF and the workbook disagree with each other.** They tie for FY26–FY27 and
      diverge from FY28 onward — the workbook is a later, materially lower revision.

| USD ths | FY28 | FY29 | FY30 |
|---|---:|---:|---:|
| NOPAT — PDF | 189,950 | 793,763 | 2,066,128 |
| NOPAT — workbook | 166,696 | 583,124 | 1,229,071 |
| Divergence | −12% | −27% | **−41%** |

- [x] **0.4** Confirmed per owner instruction: **neither source supplies data.** They supply
      structure, section logic, chart inventory and document craft only.

## 1 · What carries over, what is replaced

- [ ] **1.1** **Structure carries over 1:1** — page order, section headings, the two-column
      "Section / Description and assumptions" layout, chart-per-page density, and the
      Business overview → Summary → Key assumptions → Outputs arc.
- [ ] **1.2** **Every number is replaced** from `PRESETS.default` via `scripts/sim-default.json`.
- [ ] **1.3** **Token mapping** applied throughout:

| Old plan | Current architecture |
|---|---|
| BND (stablecoin) | **rwaUSD** — 100% USDC-backed |
| sBND (yield-bearing index) | **BLI** — Bound Liquidity Index |
| BNT (governance) | **BND** — governance |
| Liquidity buffer | **Bound Liquidity Layer** (four-tier) |
| BOUND collateral reserve | **Liquidity Layer tiers 2–4** |
| Reserve Plus | **Emergency Reserve** |

- [!] **1.4** **Sections with no current equivalent — owner decision on each:**
      - *BOUND App + premium membership* ($280 lifetime, 10.2–11.5% conversion). Absent from
        the current whitepaper. Drop the section, or is the app still planned?
      - *Performance fee / capped APY* (19%→11% cap, uncapped-vs-capped spread as company
        revenue). The current model has no yield cap and no performance fee; BLI accrues
        mechanistically. Old plan's largest revenue line (70.5% of revenue) has no successor.
      - *Avantgarde Finance* as named asset-management partner — still current?
      - *Yield concentration from idle BND* — no equivalent mechanism.
- [ ] **1.5** **Revenue architecture replaced** with the ten current streams (whitepaper Ch.8 /
      simulator): RWA liquidation, minting, conversion, pool trading, APSS stabilization,
      maintenance, integration, Morpho yield, float yield, haircut revenue.
- [!] **1.6** **Horizon.** Old plan runs FY2026–FY2030 (60 months). The simulator runs
      **36 months**. Options: (a) publish a 36-month plan and re-label FY26–FY28 — recommended,
      consistent with the Operating Cost Analysis; (b) extend the engine to 60 months;
      (c) extrapolate months 37–60 and label them as extrapolation. **Blocks pages 19–24.**
- [!] **1.7** **Ethena benchmark method.** Old plan sized volume as 1%→14.48% of Ethena's
      Uniswap volume. Keep the benchmark-against-a-comparable approach (re-based on a current
      comparable), or drop it since the simulator generates volume endogenously?

## 2 · Output format

- [!] **2.1** The original is a **landscape slide deck**. The platform's five documents are
      **portrait HTML** with a sticky sidebar. Options: (a) HTML platform document matching the
      existing family — recommended, reuses `base.css`, prints to PDF via the existing button;
      (b) a true landscape deck; (c) both. **Blocks all build work.**
- [ ] **2.2** If (a): same pipeline as the cost document —
      `gen-businessplan-content.py` → `businessplan-content.json` → `build-businessplan.mjs`
      → `public/bound-business-plan.html`, plus `verify-businessplan.py`.
- [ ] **2.3** Charts: the old deck's charts are **native vector, not images** — all series data
      was recoverable from the text layer. Rebuild as inline SVG so they stay selectable,
      themeable and printable. No raster.

## 3 · Page-by-page rebuild map

Every page of the original, its graphics, and the current-architecture source.

| # | Original page | Graphics | Rebuild source |
|---|---|---|---|
| 1 | Cover — "Protocol Business Plan as of 25 Feb 2026" | — | Re-dated, current tagline |
| 2 | Business overview \| Company description | — | Whitepaper Ch.2–4; three-token architecture |
| 3 | Business Sustainability \| Revenue streams | 9 stream cards, 2 groups | Ten current streams, regrouped |
| 4 | Protocol architecture — APSS (1) | — | Whitepaper Ch.7; APSS telemetry |
| 5 | Protocol architecture — APSS (2) + liquidity buffer | — | Whitepaper Ch.7 + Ch.6 |
| 6 | Liquidity buffer + asset management + strategies | — | Whitepaper Ch.6, four-tier structure |
| 7 | **Summary \| Key elements** | 4 KPI callouts | Simulator: revenue, AIG, breakeven, TVL CAGR |
| 8 | Key assumptions — volume, private/B2B | Bar + donut | Private LP inputs, seed allocation |
| 9 | Key assumptions — volume, public + Ethena | Donut + bar | Retail LP inputs; benchmark per §1.7 |
| 10 | Key assumptions — transactional volume | Stacked bar + pie | Simulator volume series, buy/sell split |
| 11 | Key assumptions — BND→sBND conversion | Stacked bar | **rwaUSD→BLI conversion**, BCI conversion rate |
| 12 | Key assumptions — yield concentration | Combo bar+line | No equivalent — see §1.4 |
| 13 | Key assumptions — sBND supply + APSS | Bar | **BLI supply** + APSS revenue |
| 14 | Key assumptions — APSS + B2B minting | Bar | Mint/redeem fees, private mint |
| 15 | Key assumptions — premium membership | Bar | See §1.4 |
| 16 | Key assumptions — performance (uncapped) | Combo | See §1.4 — likely **Annualized Index Growth** |
| 17 | Key assumptions — performance (capped) | Combo | See §1.4 |
| 18 | Key assumptions — underlying strategies | — | Layer tiers: Aave/Morpho/enhanced yields |
| 19 | Key assumptions — portfolio performance | Table | Layer NAV progression |
| 20 | Key assumptions — liquidity buffer movements | Table | Layer inflow/outflow/EoP by year |
| 21 | Key assumptions — costs | Full cost table | **Operating Cost Analysis (already built)** |
| 22 | Outputs \| sBND price + cash flow | Line chart + table | **BLI price curve** + cash flow |
| 23 | Outputs \| Income statement | Table | Rebuilt P&L on simulator revenue |
| 24 | Outputs \| Treasury | Table/chart | Bound Core, Emergency Reserve, BND holdings |

- [ ] **3.1** Confirm no page is dropped without an explicit decision recorded in §1.4.
- [ ] **3.2** Preserve the original's chart *types* (donut, stacked bar, combo bar+line, line)
      even where the underlying metric changes.

## 4 · Data pipeline

- [x] **4.1** `scripts/sim-default.json` already exists (36 months, `PRESETS.default`, default
      OUSG market) — built for the cost document, reusable here.
- [ ] **4.2** Extend the dump with the series this document needs: `bciPrice`, `annG`,
      `bciSupply`, `bciNav`, `layerNav`, the ten revenue streams (`bci_*` / `pr_*`),
      `boundCoreBal`, `er`, `rwaCollateralBal`, `lcr`.
- [ ] **4.3** Cost pages pull from the **already-verified** cost model, not the workbook.
- [ ] **4.4** No figure may be hand-typed. Every number in prose must exist in a table or series.
- [ ] **4.5** `verify-businessplan.py` — re-derives every figure from source and asserts it
      appears in the rendered page. Same contract as `verify-costs.py`.

## 5 · Voice and craft

- [ ] **5.1** Match the **whitepaper voice** (analysis in this session): specification not
      persuasion, ~21-word mean sentence, long-long-short cadence, antithesis openings,
      em-dash for mid-flow definition, every figure carrying magnitude + period + provenance.
- [ ] **5.2** Keep the original's **institutional register** — "Section / Description and
      assumptions", full-sentence bullets, hedged forward-looking language.
- [ ] **5.3** Banned: revolutionary, seamless, robust, unlock, leverage (verb), best-in-class.
- [ ] **5.4** Every assumption states its basis. Every projection states its limits.
- [ ] **5.5** The original's honesty markers are retained — e.g. it disclosed the 1,210% revenue
      CAGR as an artefact of a low base rather than sustained growth. Keep that discipline.

## 6 · Platform integration

- [ ] **6.1** New card in `DOCS`, [src/DocHub.jsx:78](src/DocHub.jsx#L78) — replaces the
      existing **Business Plan "Coming soon"** card (`key:"businessplan"`), which this fulfils.
- [ ] **6.2** Route in `openDoc` (~[src/DocHub.jsx:264](src/DocHub.jsx#L264)).
- [ ] **6.3** Card meta reflects the horizon decided in §1.6.
- [ ] **6.4** Verify card renders and routes in the running app.

## 7 · Verification and sign-off

- [ ] **7.1** `verify-businessplan.py` passes.
- [ ] **7.2** Page-by-page diff against §3 — every original page accounted for.
- [ ] **7.3** Every chart from the original present or explicitly retired with a reason.
- [ ] **7.4** No residue of the old architecture: zero occurrences of sBND, BNT, "BOUND
      Dollar", or the capped-APY framing, except where deliberately discussing the prior model.
- [ ] **7.5** Light and dark rendering verified; print/PDF output checked.
- [ ] **7.6** Owner sign-off on §1.4, §1.6, §1.7, §2.1.

---

## Blocking decisions

| # | Decision | Why it blocks |
|---|---|---|
| 2.1 | HTML platform document, or landscape deck? | Determines the entire build approach |
| 1.6 | 36-month horizon, or extend/extrapolate to 60? | Determines pages 19–24 and every table |
| 1.4 | Keep or retire: BOUND App, premium membership, performance fee, capped APY, Avantgarde | Four of 24 pages have no current equivalent; the performance fee was 70.5% of old revenue |
| 1.7 | Keep the Ethena-style external benchmark? | Determines pages 9–10 |

## Note on scale

The old plan's headline was **$2.3B revenue in 2030** on a capped-APY performance-fee model.
The current simulator's default case produces **$3.5M of protocol revenue in year three**.
These are not reconcilable by re-basing — they are different businesses at different scales.
The rebuilt plan will show materially smaller numbers, and the document should say so plainly
rather than let the comparison sit unaddressed.
