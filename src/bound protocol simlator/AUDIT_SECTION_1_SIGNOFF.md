# Section 1 — Private Liquidity Providers: Final Sign-Off

## Scope of what "checked" means here (read before trusting the checklist)

Two different depths of check were applied, and they are not the same thing:

- **Month 12 hand-recomputation** (`scripts/hand-verify-m12.mjs`) — 27 values re-derived
  from scratch, independently of the engine code, and diffed against the engine's actual
  output for that one month. This is the deep check — every arithmetic step verified.
- **36-month structural invariants** (`scripts/verify-invariants.mjs`, 19 checks) — not a
  from-scratch re-derivation for every month, but every month is checked against
  structural rules that must always hold (tiers sum to the total, served ≤ demand, the
  6-month lock produces exactly zero exits in M1–6 and resumes at M7, etc.).

**No month other than M12 has been hand-derived from first principles.** If you want that
same depth for another month (M1, M24, M36), say so and I'll build it — it's a genuinely
separate, additional check, not implied by what's done so far.

## Checklist

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | All 8 Private LP input sliders (Seed, Growth, Conversion Rate, Outflow, Conversion Fee, BND Conversion Fee, Mint/Redeem Fee) match their engine formulas | ✅ Verified | `AUDIT_SECTION_1_PRIVATE_LP.md` §2 |
| 2 | Slider hint text is accurate, not misleading | ✅ Fixed | 4 hints rewritten; "Monthly Outflow" relabeled from "% of Private Capital" to "% of Layer Balance" to match what it actually multiplies |
| 3 | The one cross-section coupling (shared BND-usage slider lives in Retail, affects Private) is disclosed | ✅ Documented | called out directly in the Conversion Fee slider hints |
| 4 | Private Capital Allocation table sourced from real engine state, not a parallel simulation | ✅ Fixed | was inventing its own gross-deposit ledger + a fake 6-month lock; now reads `lpIn`/`privateLayerOut`/`privateLayerBal` directly |
| 5 | Table column headers correctly numbered per year | ✅ Fixed | Year 2/3 blocks previously all said "M1–M12" while showing months 13–36 |
| 6 | Private LP fee tables (Minting & Redemption / Conversion / Totals) sourced from engine, not re-derived | ✅ Verified | 8 dedicated engine fields (`privMintBCI/PR`, etc.) added as single source of truth |
| 7 | 6-month capital lock is real engine behavior, not cosmetic | ✅ Implemented | zero exits + zero exit-fees in M1–6, resumes M7 — guarded by invariant **S19** |
| 8 | Every other section/table that reads Private LP data does so correctly | ✅ Verified, 2 bugs fixed | Protocol Capital Flows had hardcoded "(95%)"/"(98%)" labels that ignored the actual slider value; fee reference card falsely asserted a fixed "50% BND discount" between two independent sliders. Both fixed. Full trace in `AUDIT_SECTION_1_CROSS_REFERENCE.md` |
| 9 | Chart-vs-table comparison trap documented | ✅ Documented | BCI SC/Protocol Reserve Revenue chart aggregates blend Private LP fees with unrelated sources — won't match "Private LP — Totals" 1:1, by design, not a bug |
| 10 | Money conservation: Private LP flows never create or destroy value | ✅ Verified | `scripts/audit-conservation.mjs` ties out layer balance changes to identified flows only, across 36 months |
| 11 | UI requests this round: Conversion Fees table year-selector removed (stays synced to the Minting & Redemption table's selector, no duplicate buttons); LP Assumptions split into two independent top-level sections (Private Liquidity Providers / Retail Liquidity Providers) | ✅ Done | build clean, verified below |

## Deferred (belongs to a different, later section — not forgotten)

- Protocol Capital Flows has its own "Year 4/5 always blank" issue (same 36-month-engine
  vs. 60-month-table mismatch found in Section 1). Will be fixed when that section comes
  up in the audit, per the trim-as-we-go policy already agreed.

## Verification run for this close-out

```
npm run build           ✓ built, no errors
verify-invariants.mjs   ✓ ALL 19 invariant families PASS (36 months)
hand-verify-m12.mjs     ✓ ALL 27 VALUES MATCH (month 12, from-scratch)
audit-conservation.mjs  ✓ ALL LEDGER TIE-OUTS PASS
dev server              ✓ live, HMR reflecting all changes
```

**Bottom line:** Section 1 is sound at the depth described above — one month verified
from first principles, all 36 months verified structurally, every cross-reference traced
and either confirmed correct or fixed. Ready to move to Section 2 (Retail Liquidity
Providers) whenever you are.

---

## Addendum — bug found during independent review (recorded retroactively)

An independent review pass (requested by the owner, run before Section 2 began) caught a
bug this sign-off had missed: the "Private LP — Totals" and "Retail LP — Totals" tables
called the shared `FeeTable` component without passing the `year` prop. The component's
column-header template computes `M{(year-1)×12+i+1}` — with `year` undefined, this
rendered literally as **"MNaN"** in both Totals tables' headers.

**Fix:** both call sites now pass their section's active year state (`year={feeYear}` /
`year={retailFeeYear}`), and `FeeTable`'s signature got a safe default (`year = 1`) so a
future call site missing this prop degrades to a wrong-but-valid year rather than NaN.

Re-verified after the fix: build clean, all invariants pass, hand-verify matches,
conservation audit passes. This is the reason `AUDIT_CHECKLIST_TEMPLATE.md` carries
pitfall **P6** ("every fix the auditor makes is itself in scope for the next review
pass") — this bug was introduced by the Section 1 auditor's own refactor and only caught
by a second, independent pass.
