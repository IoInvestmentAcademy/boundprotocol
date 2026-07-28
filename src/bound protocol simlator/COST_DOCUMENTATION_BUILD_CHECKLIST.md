# Cost Structure Documentation — Build Checklist

Build plan for a fifth platform document: **BOUND Protocol — Cost Structure & Personnel Plan**,
sourced from the `Costs` and `Personnel costs` sheets of
`Copy of BOUND Financial Model Last Version.xlsx`, **rebased onto the simulator's default case**.

Status legend: `[ ]` not started · `[x]` done · `[!]` needs owner decision

---

## 1 · Source and scope

- [x] **1.1** Source workbook: `~/Downloads/Copy of BOUND Financial Model Last Version.xlsx` (21 sheets).
- [x] **1.2** Scope: `Costs` and `Personnel costs` only. All other sheets out of scope.
- [x] **1.3** Excel horizon: 60 months, Jan 2026 → Dec 2030, monthly, USD.
- [x] **1.4** Column alignment verified. `Personnel costs` data starts at column **H**;
      `Costs` starts at column **I** (H is the `USD` label). Reading both from H silently drops
      December from every year. **Re-verify on any rebuild.**
- [!] **1.5** **Horizon mismatch.** The simulator runs **36 months**; the Excel runs 60.
      Options: (a) publish a 36-month document matched to the simulator — recommended;
      (b) extrapolate the simulator to 60 months and label it clearly as extrapolation.
      **Owner decision.**

## 2 · Data extraction and reconciliation

- [x] **2.1** `Costs` rolled up by category using the year-index row (row 7).
- [x] **2.2** Personnel taken from the **summary block (rows 73–85)**, not the gross block
      (rows 31–67). Wrong block overstates 5-year personnel by **$721,268**.
- [x] **2.3** Cross-sheet reconciliation passed: `Costs!`row 49 ties to `Personnel costs!`row 85
      in all 60 months.
- [x] **2.4** Category totals tie to `Costs` row 78 in all five years.
- [ ] **2.5** Re-run `scratchpad/analyze.py` + `rebase_full.mjs` before publication; no hand-typed numbers.

## 3 · Rebasing onto the simulator (owner-directed)

The Excel's revenue-scaling lines are driven by a **separate investment-balance model**, not by
protocol activity. These must be replaced with simulator default-case outputs.

- [x] **3.1** **Root cause identified.** Excel `Payment fees` = `0.1% × Revenues!row150 × 1000`,
      where row 150 is *"TVL for portfolios"* — an **investment closing balance**, not transaction
      flow. It is a portfolio/custody fee, structurally unrelated to the protocol's revenue engine.
- [x] **3.2** **Scale gap quantified.** Excel's implied balance vs. simulator TVL:
      Y1 **2.3×**, Y2 **3.8×**, Y3 **5.0×** — and diverging. The Excel cost base assumes a
      materially more aggressive growth path than the simulator's default case.
- [x] **3.3** Simulator default-case outputs extracted headlessly (`scratchpad/rebase_full.mjs`,
      `PRESETS.default` + default OUSG market):
      TVL M36 **$46,060,161** · 3-yr transaction volume **$723,687,250** ·
      3-yr protocol revenue **$6,828,594**.
- [x] **3.4** **Payment fees rebased** to `0.1% × protocol transaction volume`:
      $107,320 / $233,713 / $382,654 → **$723,687** over 3 years (was $2,953,635 on the Excel basis).
- [x] **3.5** **Cloud + Maintenance rebased** — Excel compounds these by `Revenues!K24/J24−1`
      (its own volume series). Replaced with the simulator's month-over-month volume growth.
      Cloud $1,183,307 · Maintenance $1,408,699 over 3 years.
- [x] **3.6** Non-scaling lines carried unchanged: Personnel, Software Licenses, G&A, Legal,
      S&M, Development. These are not revenue-linked in the Excel and need no rebase.
- [x] **3.7** **Rebased 3-year total: $11,582,664** vs Excel $13,383,387 — a **$1,800,723 reduction**.
- [x] **3.8** **Coverage result:** cost/revenue **3.29× → 1.62× → 1.16×**. The protocol
      **does not reach breakeven inside the 36-month horizon**; cumulative net is **−$4,754,070**.
      This is the document's single most important number and must be stated plainly.
- [!] **3.9** **Confirm the payment-fee basis.** Rebased here as 0.1% of transaction volume.
      Alternatives: 0.1%/month on TVL ($689,789 — nearly identical), or a fixed per-transaction
      cost. **Owner decision on which is economically correct for BOUND.**

## 4 · External validation (research)

Benchmarks gathered July 2026. Each finding must be attributed in the document.

- [x] **4.1** **Smart Contract Auditing — $200,000 (launch).** Market: typical DeFi audit
      $50K–$100K; realistic pre-launch budget $60K–$120K incl. remediation; up to $250K for
      enterprise multi-chain. → **Adequate to conservative.** Defensible given APSS + four-tier
      liquidity + RWA integrations. *(Sherlock, Zealynx, QuillAudits)*
- [x] **4.2** **Bug Bounty — $300,000, launch year only, $0 thereafter.** Market: mid-size DeFi
      max rewards $80K–$100K; large protocols $1M–$6M. Budget size is reasonable, but
      **bug bounties are a standing program, not a one-off.** → **Flag: recurring cost missing
      from years 2–5.** *(Immunefi, Sherlock)*
- [x] **4.3** **Regulatory Licenses — $300,000, 2026 only.** Market: MiCA CASP first-year all-in
      **€350K–€900K** (or €300K–€700K), plus **€150K–€250K annually** to hold the licence.
      → **Understated on both counts: low first-year figure and no ongoing licence cost.**
      *(Crassula, Pharos, InnReg)*
- [x] **4.4** **Legal Advisory — $72,000/yr.** MiCA authorisation prep alone runs €80K–€200K.
      → Plausible as steady-state maintenance; **light for the authorisation year.**
- [x] **4.5** **Smart Contract Engineer — $128,250 base.** Market: mid-level $150K–$200K;
      senior/staff owning protocol architecture $200K–$300K, plus tokens.
      → **Below the mid-level floor.** *(InterviewPal, CryptoRecruit, Metana)*
- [x] **4.6** **CTO / Co-founder — $129,600 base.** Below what senior individual contributors
      command at peer protocols. → **Materially below market.**
- [x] **4.7** **Technical-comp gap quantified:** lifting CTO and Smart Contract Engineer to a
      $200K market floor adds ≈ **$142,150/yr base** (≈$156K with bonus), ≈**$875K over five years**
      before employer taxes.
- [x] **4.8** **Personnel share.** Startups typically run payroll at **60–75% of burn**;
      BOUND's model runs **21.3% (2026) → 11.9% (5-yr avg)**. The gap is explained by a $1.5M
      launch marketing budget and the (now-corrected) payment-fee line.
      → State as a structural observation, with the marketing budget named as the cause.
- [x] **4.9** **Headcount flat at 9 FTE for 60 months** while the cost base compounds.
      → Flag as an assumption, not a plan. No hiring is funded against TVL growth.
- [ ] **4.10** Cite every benchmark inline with source and date. No uncited market claims.

## 5 · Findings to carry into the document

- [x] **5.1** Excel 5-yr base **$43,030,289**; COGS 81.7%, S&M 13.7%, Legal 2.7%, Dev 1.0%, G&A 0.9%.
- [x] **5.2** **2027 falls below 2026** (−$599,649) as launch-only items roll off.
- [x] **5.3** Personnel **$5,109,781 (11.9%)**, falling 21.3% → 6.1% of annual cost — operating
      leverage, not headcount reduction.
- [x] **5.4** **3 of 12 defined roles are never hired** (flag 0 across all 60 months):
      Co-founder, DeFi Strategist, Marketing Lead. Must be disclosed, not silently dropped.
- [!] **5.5** **The 35% payroll tax assumption is defined but never referenced by any formula.**
      Verified: zero formula hits. Personnel = salary + bonus only.
      → **Owner decision:** is the gross salary fully loaded, or is personnel understated by
      ~35% (≈$1.79M over five years)? **Blocks the personnel chapter.**
- [x] **5.6** Allocation tags (G&A/S&M/R&D) exist per role but are unused — all personnel
      lands in COGS. Note as a presentational limit.
- [x] **5.7** Bonus 10% for every role except Founder/CEO (0%).

## 6 · Document architecture

- [ ] **6.1** `Abstract` — the cost base in three paragraphs: scale, shape, and what it is not.
- [ ] **6.2** `1 · Scope and Method` — two sheets, the rebasing, what is excluded and why.
- [ ] **6.3** `2 · Rebasing the Model onto Protocol Results` — §3.1–3.8. Why the Excel basis was
      replaced and what changed. This chapter earns the rest of the document.
- [ ] **6.4** `3 · The Shape of the Cost Base` — categories, the 2027 dip, fixed vs. scaling.
- [ ] **6.5** `4 · Cost of Goods Sold` — five lines, each with its driver formula.
- [ ] **6.6** `5 · Personnel` — roster, hiring sequence, escalation, the flat-9 assumption.
- [ ] **6.7** `6 · Operating Expenses` — G&A, Legal, S&M, Development; launch vs. recurring.
- [ ] **6.8** `7 · Cost Coverage` — cost/revenue ratio, the −$4.75M cumulative position,
      and what has to be true for breakeven.
- [ ] **6.9** `8 · External Validation` — §4, benchmark by benchmark, cited.
- [ ] **6.10** `9 · Model Limits and Open Items` — §5.4, §5.5, §5.6, §4.2, §4.3, §4.9.
- [ ] **6.11** `Legal Disclaimer` — matches whitepaper §15.

## 7 · Voice and style (from the whitepaper analysis)

- [ ] **7.1** Mode: **specification, not persuasion.** "Written to be verified, not believed."
- [ ] **7.2** Cadence: mean sentence ~21 words; paragraphs 3–5 sentences (~60 words).
      Long-long-**short**.
- [ ] **7.3** Antithesis pivots at chapter openings.
      *"The cost base compounds at forty-six percent a year. The team does not."*
- [ ] **7.4** Em-dash ~12/1k words for mid-flow definitions; semicolon joins claim to consequence;
      colon introduces the proving list. Parentheses rare.
- [ ] **7.5** Every figure carries magnitude + period + provenance. Captions name sheet and rows.
- [ ] **7.6** Banned: revolutionary, seamless, robust, leverage (verb), unlock, lean, efficient,
      disciplined, best-in-class. No exclamation marks. No superlatives about the team.
- [ ] **7.7** Third-person specification voice. No Litepaper chapter, no first person.
- [ ] **7.8** Every mechanism section ends by naming its own bounds.
- [ ] **7.9** Curly quotes, unspaced em-dashes, en-dash ranges, `$5.1M` / `46.7%`, acronyms
      expanded on first use.

## 8 · Tables and graphics

Reuse `scripts/base.css` components only.

- [ ] **8.1** `.kpis` — 3-yr rebased total, cost/revenue at Y3, personnel share, peak headcount,
      cumulative net.
- [ ] **8.2** Table — cost by category × 3 years, `tr.tot` total row, % of base.
- [ ] **8.3** Table — COGS lines with the driver formula named per line, Excel vs. rebased.
- [ ] **8.4** Table — personnel roster: role, allocation, gross start salary, bonus %, hire month,
      months active, 3-yr total, market band, variance.
- [ ] **8.5** Table — benchmark validation: line, model figure, market range, source, verdict.
- [ ] **8.6** `.chart`/`.barrow` — cost composition by category.
- [ ] **8.7** `.chart`/`.barrow` — cost vs. revenue by year (coverage ratio).
- [ ] **8.8** `.note.warn` for §5.5 and §4.3 while unresolved.
- [ ] **8.9** All tables in `.tbl-scroll` with a `.cap` naming source sheet and rows.
- [ ] **8.10** Verify light **and** dark rendering.

## 9 · Build pipeline

- [ ] **9.1** `scripts/costs-content.json` — structured blocks, presentation-free.
- [ ] **9.2** `scripts/build-costs.mjs` — reads `base.css`, emits `public/bound-cost-structure.html`.
- [ ] **9.3** Sticky 262px sidebar, `.sec-num` badges, masthead, `print-css.mjs`.
- [ ] **9.4** `scripts/verify-costs.py` — re-derives every figure from the workbook **and** the
      simulator, asserts the HTML matches to the dollar. Non-negotiable.
- [ ] **9.5** Confirm `dist/` copy is produced.

## 10 · Documentation hub card

- [ ] **10.1** Add to `DOCS` in [src/DocHub.jsx:78](src/DocHub.jsx#L78):
      `key:"costs"`, `icon:"briefcase"`, `tag:"Report"`, `tagColor:T.blue`, `status:"available"`,
      `title:"Cost Structure & Personnel Plan"`, `meta:"FY2026–FY2028 · Confidential"`.
- [ ] **10.2** Route in `openDoc` (~[src/DocHub.jsx:263](src/DocHub.jsx#L263)):
      `else if (key === "costs") window.location.assign("/bound-cost-structure.html");`
- [!] **10.3** **Business Plan card overlap** — the existing "Coming soon" card already claims
      "cost base". Narrow its description or supersede it. **Owner decision.**
- [ ] **10.4** Verify card renders and routes in the running app.

## 11 · Verification and sign-off

- [ ] **11.1** `verify-costs.py` passes.
- [ ] **11.2** Category totals re-tie to `Costs` row 78.
- [ ] **11.3** Personnel re-ties across both sheets.
- [ ] **11.4** Rebased figures re-derive from `PRESETS.default` at build time.
- [ ] **11.5** No number in prose absent from a table.
- [ ] **11.6** Style pass against §7.
- [ ] **11.7** Every benchmark cited.
- [ ] **11.8** Owner sign-off on §1.5, §3.9, §5.5, §10.3.

---

## Open items blocking the write

| # | Item | Why it blocks |
|---|------|---------------|
| 5.5 | Is the 35% payroll tax inside or outside the salary figures? | Moves personnel by ~$1.79M and decides the honesty of the chapter |
| 1.5 | 36-month (simulator-matched) or 60-month (extrapolated) horizon? | Determines every table |
| 3.9 | Payment fee basis: transaction volume, TVL, or per-transaction? | Determines the largest rebased line |
| 10.3 | Business Plan card overlap | New card or replacement |
