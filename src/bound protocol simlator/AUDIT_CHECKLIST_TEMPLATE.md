# Section Audit Checklist — Standard Procedure (v1)

**Derived from an independent review of the Section 1 (Private LP) audit.** Section 1's
method was sound and its findings all verified — but the review also caught a bug the
auditor introduced in its own fix (see Pitfall P6 below), which is exactly why this
checklist now exists. Every subsequent section audit must complete ALL phases below and
paste the filled-in checklist into its sign-off doc.

---

## Phase A — Understand & document (no code changes)

- [ ] **A1. Plain-English logic** written out in the order the ENGINE computes it (not the
      order the UI displays it), reviewed by the owner before anything is changed.
- [ ] **A2. Formulas transcribed from the engine** with variable names matching the code
      exactly (so the owner can grep). Never paraphrase a formula from memory.
- [ ] **A3. Worked numeric example** for at least one month, with every intermediate value
      **verified against the live engine via a node one-liner** — not computed by hand on
      the side. If the doc says `convFeeEntry = $2,917`, the engine must have printed
      `2917.22` first.
- [ ] **A4. Hidden couplings disclosed**: any slider/config living in a *different*
      section that affects this section's numbers (Section 1 example: BND-usage slider
      lives in Retail but drives Private LP fees). Grep every `p.*`/`yld.*` read by this
      section's engine block and confirm where each slider physically sits.

## Phase B — Input layer (sliders/config)

- [ ] **B1. Every slider maps to a real engine read.** No slider that silently does
      nothing; no engine parameter that has no UI control without being flagged.
- [ ] **B2. Hint text tells the truth**: correct base (balance vs. deposit; gross vs.
      net), correct timing (which month it starts applying), correct destination splits.
- [ ] **B3. Zero/extreme values behave**: slider minimums of 0 must not silently revert
      to defaults (`||` vs `??` — this bit us twice already), and slider maximums must not
      produce NaN/negative balances.
- [ ] **B4. Labels state the actual multiplicand** ("% of Layer Balance", not "% of
      Capital") — if the label names a number, it must be the number in the formula.

## Phase C — Section's own tables/charts

- [ ] **C1. Single source of truth**: every table reads engine `sim` rows. Any parallel
      recomputation inside a `useMemo` is a defect by default — the burden of proof is on
      keeping it, not removing it. (Found 4 times so far: private fees, retail-scale RWA
      fees, private capital, plus the fabricated 6-month lock.)
- [ ] **C2. Horizon honesty**: engine runs 36 months. No table may show Year 4/5 columns
      of implied zeros or, worse, extrapolated fiction. Trim to 3 years when touching a
      table; log the remaining untrimmed tables in the section doc.
- [ ] **C3. Header/label arithmetic**: month numbers in column headers must reflect the
      selected year (M13–M24 for Year 2, not M1–M12 relabeled). Check header template
      variables actually receive their props (see P6).
- [ ] **C4. No hardcoded parameter values in display text.** Any "(95%)", "0.88%",
      "$8,800", "50% discount" in a label/hint/card must be interpolated from the live
      slider, or it will lie the moment the slider moves.
- [ ] **C5. Description cards**: each table gets a what-each-row-means card if row
      semantics aren't obvious (owner standard, set in Section 1).
- [ ] **C6. Dead fields**: fields computed in the table's useMemo but rendered nowhere
      (e.g. `bciAnnualYield` today) — list them and ask the owner: render or delete.

## Phase D — Cross-section propagation (the core of the audit)

- [ ] **D1. Grep every output field** of this section (engine return-object fields) and
      enumerate EVERY consumer: table name, row label, and line number.
- [ ] **D2. Verify each consumer reads the same field, not a re-derivation.** If a
      consumer recomputes (e.g. `demand × scale` instead of `served`), that's a defect.
- [ ] **D3. Blending disclosure**: where a consumer aggregates this section's numbers
      with other sources (e.g. `bci_entry` = private mint/redeem + RWA redemption fee),
      document that the consumer's figure will NOT match this section's totals 1:1, so
      the owner doesn't chase phantom discrepancies.
- [ ] **D4. Downstream recheck after any engine change**: if this section's audit changed
      the engine (like the 6-month lock), re-verify the consumers found in D1 *after* the
      change — a display that was correct before can silently become stale.

## Phase E — Verification battery (all must pass before sign-off)

- [ ] **E1.** `npm run build` — zero errors.
- [ ] **E2.** `node scripts/verify-invariants.mjs` — all families pass; **add at least one
      new invariant if this section's audit changed engine behavior** (S19 pattern).
- [ ] **E3.** `node scripts/hand-verify-m12.mjs` — still matches after every change.
- [ ] **E4.** `node scripts/audit-conservation.mjs` — ledger tie-outs still pass.
- [ ] **E5.** Dev server responding; owner eyeballs the changed section in the browser.
- [ ] **E6. Scope honesty in the sign-off**: state explicitly that deep hand-recomputation
      covers M12 only and the other 35 months are covered structurally. Never write
      "everything is checked" without this qualifier.

## Phase F — Close-out

- [ ] **F1.** Section doc updated with: findings, fixes, deferrals (with the section
      number where each deferral will be handled).
- [ ] **F2.** Owner sign-off obtained before starting the next section.

---

## Pitfall register (P-list) — every one of these actually happened; check for them explicitly

| # | Pitfall | Where it bit us |
|---|---|---|
| P1 | UI table silently re-simulating instead of reading `sim` | private fees, private capital, RWA fee table |
| P2 | Fabricated rule existing only in UI (fake 6-month lock) — OR the opposite: a real rule missing from the engine (the lock turned out to be intended!) — **always ask the owner which it is; never assume** | private capital table |
| P3 | Hardcoded parameter values in labels ("95%", "50% discount", "$8,800") | Protocol Capital Flows, fee reference card |
| P4 | `\|\|` default swallowing legitimate 0 from a slider | bcUsdcCoverage, aumGrowth, integFee, maintFee |
| P5 | Same fee credited via two paths (double count) | integration fee → prCum |
| P6 | **Auditor-introduced bug**: refactored component called without a required prop → NaN rendered in headers ("MNaN") — found only by re-reviewing the auditor's own diff | FeeTable Totals tables (fixed in this review) |
| P7 | Stale month-number headers after year-slicing | private capital table |
| P8 | Consumer displaying demand-derived values where engine now uses served/committed | LCR obligation displays |
| P9 | Blended aggregates mistaken for section totals | bci_entry vs Private LP totals |
| P10 | Year 4/5 columns implying data that has never existed | 14 tables, 2 fixed so far |

**Rule from P6: every fix the auditor makes is itself in scope for the next review pass.**
