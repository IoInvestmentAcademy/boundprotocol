# BOUND Simulator — Section-by-Section Audit Plan

**Purpose:** a repeatable procedure to verify each functional section of the simulator
independently — its internal logic, its formulas, and every place its numbers reappear
elsewhere in the app — so the owner can check the math by hand and the display by eye,
section by section, rather than trusting the whole app at once.

## Two findings from building this plan (not yet acted on — flagging for a decision)

While mapping every section I found two **orphaned pieces of code**: a `KPI` component
(headline stat tile — price/annG/layer/etc.) and a `yc` yield-curve comparison dataset
(BCI vs. Treasuries/Morpho/Private Credit benchmark chart) are both fully built but never
rendered anywhere. Likely lost during the JSX-corruption repair mentioned in the original
handoff (§6.5). Not fixing this now — just flagging it so you can tell me whether to
restore them, repurpose them, or delete the dead code.

---

## Section inventory (in the order they appear top-to-bottom in the app)

| # | Section | What it models |
|---|---|---|
| 1 | **Private Liquidity Providers** | Institutional LP entry/exit, fees, capital allocation |
| 2 | **Retail Liquidity Providers (Pool)** | Retail buy/sell via the AMM pool, fees |
| 3 | **RWA Users — Liquidation & Minting** | Per-market RWA demand, concentration, haircuts |
| 4 | **Liquidity Layer** | 4-tier waterfall, LCR/stress, yield allocation |
| 5 | **Protocol Capital Flows — Monthly Overview** | Cross-system flow summary (consumer of 1–4) |
| 6 | **Bound Core Reserve** | rwaUSD peg backing, USDC coverage, float yield |
| 7 | **BCI SC Revenue** | Aggregated revenue credited to the BCI index (consumer) |
| 8 | **Protocol Reserve Revenue** | Aggregated revenue credited to PR (consumer) |
| 9 | **BCI Price Mechanics** | The terminal output: price, supply, annG (consumer of all) |
| 10 | **Participant Economics** | Who-pays/who-earns summary (consumer of 1, 2, 3, 9) |

Sections 5, 7, 8, 9, 10 are **pure consumers** — they don't generate new numbers, they
recombine and display numbers already produced in 1–4 and 6. That matters for the audit:
once 1–4 and 6 are verified at the source, checking 5/7/8/9/10 is mostly "does this
table's number equal that section's number" rather than re-deriving formulas.

---

## Per-section audit template (applied to each of the 10 sections in turn)

For every section, I will produce:

1. **Logic, in plain English** — what real-world thing this section represents, what
   decisions/assumptions drive it, in the order the engine actually computes them.
2. **Formulas** — the exact engine code, transcribed as math, with variable names
   matching the code so you can grep and confirm.
3. **Cross-reference map** — every other section that reads this section's output, and
   which field name it reads under (so you can trace a number across tables).
4. **Sign-off checklist** — a short list of "does X equal Y" checks you can do by eye in
   the live app, using the color tags below.

You review and confirm each section before I move to the next — same cadence as before.

---

## Proposed color/tag system for cross-section tracing

The app already uses a color axis for **destination** of a dollar (green = BCI SC, blue =
Protocol Reserve, amber = BND burn/warnings) — that's used consistently in every fee
table and must not be disturbed. What's missing is an **origin** axis: a way to look at a
number in, say, the BCI SC Revenue chart and immediately know "this slice came from the
Private LP section" without reading labels.

**Recommendation:** a small colored dot/badge (not full text recoloring, so it doesn't
fight the existing green/blue/amber destination system) next to section headers and
cross-referenced rows, one hue per origin section:

| Origin section | Badge color | Reuses existing token? |
|---|---|---|
| Private LP | violet `#5B4B8A` | yes — already `RC.entry` |
| Retail LP | teal `#2C8C8C` | new |
| RWA Users | burnt orange `#C77A1F` | new (distinct from amber/BND) |
| Liquidity Layer | slate `#5B7590` | new (distinct from PR blue) |
| Bound Core | tan `#8A6D4A` | new |

The BCI SC/PR Revenue stacked charts already do a version of this per revenue-stream
(their `RC.*` palette) — the plan is to extend that same idea consistently to the Layer
Composition table, Bound Core table, and Participant Economics, which currently don't tag
origin at all. I'd rather confirm this approach with you before touching any UI code,
since it touches almost every table in the app.

---

## Audit order

I'll go in dependency order (upstream sources before downstream consumers), same as the
table above: **Private LP → Retail LP → RWA Users → Liquidity Layer → Bound Core →
Protocol Capital Flows → BCI SC Revenue → Protocol Reserve Revenue → BCI Price Mechanics
→ Participant Economics.** This means by the time we reach a "consumer" section, you'll
already have verified every number it displays at its source.
