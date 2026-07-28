# BOUND Platform — Final Audit Results

Executed 28 July 2026 against the full document set, the simulator engine, the
legal record and the application.

---

## Summary

| Section | Checks | Result |
|---|---|---|
| A · Asset inventory | 4 | Pass |
| B · Build freshness | 4 | Pass |
| C · Verifier suite | 10 | Pass |
| D · Simulator feed integrity | 4 | Pass |
| E · Cross-document consistency | 10 | Pass — Finding 1 resolved 28 Jul |
| F · Messaging discipline | 4 | Pass |
| G · Application | 5 | Pass |

**Arithmetic across the whole capital structure reconciles exactly.** No rounding
drift, no orphan figure, no document disagreeing with another on a number.

Three findings are recorded below. One is material and needs a decision that is
not mine to make; two are housekeeping.

---

## A · Asset inventory — pass

- 16 hub links resolve, 0 broken.
- The 24 "unlinked" files are the logo PNGs inside the brand pack and the
  internal-tier counsel letter. Both are unlinked deliberately.
- `/legal/internal/` is referenced only in a source comment, never as a link.

## B · Build freshness — pass

`sim-default.json` was older than `BoundSimulator.jsx`, and three documents were
older than the feed. Both were false alarms, proven rather than assumed:

- Regenerating the feed changed only its `generated` timestamp.
- Rebuilding all nine documents produced **byte-identical output**, except one
  date stamp in the tokenomics audit.

No published document was numerically stale.

## C · Verifier suite — pass

All nine document verifiers pass, including the three that compare the rendered
page word-for-word against the source `.docx` (whitepaper, market, competitors).
`verify-invariants.mjs` passes all 30 engine invariants. All six audit scripts
are clean.

## D · Simulator feed integrity — pass

- `revenue = totalBci + totalPr` holds for all 36 months.
- 36-month protocol revenue **$6,828,594.32**, cited identically in three documents.
- Horizon discipline is explicit: *"the protocol's 36-month simulation is a
  different entity on a different clock."*

## E · Cross-document consistency

### Reconciles exactly

| Identity | Value |
|---|---|
| Total raise | $13,680,000 |
| AMM liquidity (BND $1.00M + rwaUSD $3.975M) | $4,975,000 |
| Burn Engine seed (43% of public) | $3,225,000 |
| Operating company cash | $4,730,000 |
| Emergency Reserve | $750,000 |
| Uses = raise | $13,680,000 |
| OpCo funding available by M24 | $7,023,750 |
| OpCo surplus at M24 | $771,524 |
| Rounds 34.25% + buckets 65.75% | **100.00%** |

### Finding 1 — RESOLVED 28 July · entity model contradiction

The **Whitepaper §12** states:

> "BOUND is developed by BITSWIFT TECHNOLOGIES INC."

The **Cost Analysis §7**, which is the authority on entity roles, states the
operating company develops the protocol, BITSWIFT distributes the token, and the
Foundation owns the IP. These cannot both be true.

Compounding it:

- **Neither counsel opinion mentions the Nexus Technologies Foundation.** Both
  name BITSWIFT as sole issuer (reg. 155773464).
- The **SAFT** defines "Foundation" as the IP holder and grantor of the Token
  Delegation, but leaves the name as `[●]`.
- The Foundation appears in only **2 of 9** documents.

**Resolution (author-approved, 28 July).** The protocol is built by the operating
company. Chapter 12 of the whitepaper now states the three-entity structure in
full, recorded as an approved correction in both `gen-whitepaper-content.py` and
`verify-whitepaper.py` — the same mechanism used for the BCI→BLI renames. The
structure was also added to the Business Plan (§1.3), the Delivery Roadmap (§8.6,
which now names the entity bearing the $320,000 and where the IP vests) and the
Smart Contract Architecture (§7.3).

Entity coverage went from 2 of 9 documents to 6 of 9. The three that remain
silent — Market, Competitors and the Tokenomics Audit — are external-market and
token-economic analyses in which no entity claim is made or needed.

**Still open with counsel:** neither legal opinion mentions the Foundation, and
the SAFT leaves its name as `[●]`. The documents now describe a structure the
counsel opinions do not yet reflect.

### Finding 2 — two different quantities are both called "0.8%"

- Whitepaper: *"measured collateral surplus of approximately 0.8% of
  stabilization volume"* — empirical, from mainnet.
- Engine: `0.3% pool + 0.5% APSS = 0.8% combined` on pool volume.

The engine models APSS capture at 0.5%, below the measured 0.8%, which is
appropriately conservative. But the reconciliation appears **only in the orphaned
`tokenomics.html`**, so no reader of the live document set can see it.

### Checks that passed

- **No legacy token names.** The single `sBOUND` hit is a deliberate note
  explaining that deployed contract filenames predate the rename.
- **Network: Ethereum only.** Every "Base" hit is "cost base" / "asset base".
- **Development budget.** Roadmap §8.5 already states the $320,000 engineering
  programme is not the $250,000 Development line and explains why.
- **Protocol revenue is never netted against operating cost** — enforced.
- **No claim that yield rises with scale** — enforced.
- **No placeholders** — no TODO, TBD, `[●]`, XXX or Lorem in any rendered page.

## F · Messaging discipline — pass

## G · Application — pass

Build clean. No console errors. Nav reads Simulator · Library. Scenario bar
carries Engine Documentation and Export. Engine reference returns to the Simulator.

---

## Finding 3 — housekeeping

**`public/tokenomics.html` is orphaned.** 127 KB, last built 22 July, unreferenced
by anything. It still deploys and still serves stale pre-LP-staking figures to
anyone with the URL. It should be deleted or refreshed.

~~Nine generated documents still say "← Back to Documentation"~~ — **fixed
28 July**, all nine now read "← Back to Library".

**The SAFT** carries a hardcoded `10.00%` Proportional Entitlement and a filled-in
buyer wallet address in what is otherwise a blank template.
