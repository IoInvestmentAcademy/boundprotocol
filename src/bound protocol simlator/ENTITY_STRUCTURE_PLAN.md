# Entity Structure and Funding — Professional Plan

Follows [ENTITY_RECONCILIATION_CHECKLIST.md](ENTITY_RECONCILIATION_CHECKLIST.md). That document
established that a problem exists. This one establishes what normal looks like, sizes the
funding properly with the owner's corrections applied, and sets out the work in sequence.

**No document has been changed. This is a plan.**

Status: `[x]` researched or computed · `[ ]` to do · `[!]` needs decision

---

## Part 1 · How this is normally structured

Research, July 2026.

- [x] **1.1 The Foundation / operating-company split is the standard pattern.** The developer
      builds the technology; the foundation stewards the token and manages community resources.
      The two are designed to operate independently, which is what keeps the token separable
      from the operating business. *(Montague Law; Astraea Counsel)*
- [x] **1.2 The foundation holds ecosystem tokens in trust** on behalf of the ecosystem, and
      deploys them under a mandate rather than owning them outright. *(Legal Nodes)*
- [x] **1.3 Legal entities became the norm after January 2025.** A US federal ruling on
      unincorporated DAOs pushed protocols worldwide into formal structures; through 2026 the
      line between DAO, labs and foundation has continued to blur, with protocols increasingly
      operating like software companies. Uniswap dissolved its US foundation. *(Astraea Counsel;
      DL News)*
- [x] **1.4 Operations take the largest share of a raise.** One commonly cited allocation model
      is 60% operations, 30% reserve assets, 10% contingency. There is no universal benchmark —
      allocation varies with stage and strategy — but operations dominating is the pattern.
      *(0xProcessing; BitGroup)*
- [x] **1.5 Treasury tokens are a recognised operating-funding source**, liquidated on a
      schedule against a stated runway. Evaluating a project's treasury means examining
      "commitments to long-term incentives and operational expenditures" against reserves.
      *(DEXTools; Midlands in Business)*

**Conclusion.** The structure the owner described is the standard one. Nothing here needs
inventing — it needs stating, sizing and enforcing.

---

## Part 2 · The BOUND structure

- [ ] **2.1** Three entities, two of which exist today:

| Entity | Status | Role | Holds |
|---|---|---|---|
| **Nexus Technologies Foundation** (Panama) | Incorporated | Owns the protocol and its IP; grants Token Delegation | Protocol IP, ecosystem allocations |
| **BITSWIFT TECHNOLOGIES INC.** (Panama IBC) | Incorporated | Distributes the token; counterparty on the SAFT | Raise proceeds |
| **Operating company** | **Does not yet exist** | Develops the protocol; launches the token; employs staff | Nothing — funded by the other two |

- [x] **2.2** The Foundation's role is already documented — the SAFT defines it as the entity
      "which holds the intellectual property rights in and to the Protocol and the Platform and
      which has granted the Token Delegation to the Seller."
- [ ] **2.3** **The operating company not existing yet is not a problem, but its absence from
      the documents is.** Every cost in the model is borne by an entity that appears nowhere.
      The plan must state what it is funded with and what it spends, so that whether the launch
      is affordable becomes a question with an answer.
- [ ] **2.4** Funding mechanism to be documented: the operating company is paid under a
      **development and services agreement** with the Foundation and the Issuer, settled in USDC.
      This is the instrument that gives it a revenue line — without it, it is a cost centre with
      no income, which is what the current model describes.

---

## Part 3 · Funding inventory, with the owner's corrections applied

Corrections applied: Seed goes to the operating company; the Burn Engine seed is retained in
full; Marketing and Treasury token allocations are available to fund operations.

### 3.1 The raise now balances exactly

- [x] With Seed directed to operations, every dollar of the raise has a stated use and nothing
      is left unassigned. The gap identified in the previous audit closes.

| Use | Amount | % of raise |
|---|---:|---:|
| BND/USDC AMM pool seed | $5,950,000 | 43.5% |
| **Burn Engine seed** (retained) | $3,750,000 | 27.4% |
| Emergency Reserve | $750,000 | 5.5% |
| **Operating company — cash** | **$3,230,000** | **23.6%** |
| **Total** | **$13,680,000** | **100.0%** |

Operating cash is Seed $2,480,000 plus the 10% Company share of Public $750,000.

### 3.2 Token allocations available to operations

- [x] Supply 1,000,000,000 · launch price $0.0500 · launch FDV $50,000,000

| Allocation | Share | Tokens | Notional | Vested by M36 | Value at M36 |
|---|---:|---:|---:|---:|---:|
| Marketing | 2% | 20,000,000 | $1,000,000 | 100% | $1,000,000 |
| Treasury | 9% | 90,000,000 | $4,500,000 | 52.5% | $2,362,500 |
| **Total liquid by M36** | | | | | **$3,362,500** |

Treasury vests 5% at TGE then linearly over 48 months after a 12-month cliff, so only just over
half is reachable inside the 36-month horizon.

### 3.3 Total available against total need

| | Amount |
|---|---:|
| Operating cash from raise | $3,230,000 |
| Marketing + Treasury tokens, vested by M36 | $3,362,500 |
| **Total available** | **$6,592,500** |
| **Operating company cost, 36 months** | **$10,923,648** |
| **Shortfall** | **−$4,331,148** |

- [x] **3.4** Runway: **10.6 months** on cash alone; **21.7 months** including vested tokens,
      against a 36-month plan. Average operating burn is $303,435 a month.
- [x] **3.5** Operations receive **23.6%** of the raise against the ~60% benchmark in §1.4.

### 3.6 Tokens cannot close the gap — this is the binding constraint

- [x] Covering the $7,693,648 that cash does not fund would require selling **153,872,952
      tokens** at launch price — **139.9% of the combined Marketing and Treasury allocations**.
      More than exists.
- [x] That is **15.39% of total supply**, sold at an average of $213,712 a month for three
      years, into a market the same model assumes is absorbing investor and team unlocks.
- [x] **Conclusion: the gap is real and cannot be closed by reallocating what is already
      raised, once the Burn Engine is protected.** Either the cost base comes down or the raise
      goes up.

---

## Part 4 · What closes the remaining $4.33M

Not mutually exclusive. Effect of each on the shortfall.

- [!] **4.1 · Fund marketing spend from the Marketing allocation — natural pairing.**
      Marketing cost is $3,740,000; the Marketing allocation is $1,000,000. It does not cover
      the line but it is the correct source for it, and it frees cash. Pairing the two also
      makes the tokenomics legible: the marketing allocation exists to fund marketing.
- [!] **4.2 · Reduce the marketing budget — up to $2,240,000.** At $3,740,000 it is 34% of
      operating cost and by far the largest discretionary line. Bringing it to $1,500,000 over
      three years closes more than half the shortfall on its own.
- [!] **4.3 · Increase the raise — $4,331,148 to close, or $4,978,000 to reach the 60%
      benchmark.** The only option that gives nothing up, and the most dilutive. At the current
      $50M launch FDV this is roughly 8.7% more supply, or the same supply at a higher price.
- [!] **4.4 · Phase the plan to a shorter funded horizon.** 21.7 months is fundable today. A
      24-month plan with a stated Series-A-equivalent raise before month 22 is honest and
      common; a 36-month plan that runs out at month 22 is not.
- [!] **4.5 · Add a services fee from Protocol Reserve.** Protocol Reserve is $1,278,862 over
      36 months — 4.2 months of burn. Real, but supplementary. It also only arrives as the
      protocol earns, which is after the money is needed.
- [x] **4.6** Combining 4.1 and 4.2 — pairing marketing to its allocation and halving the
      budget — closes roughly $2.2M of $4.33M without touching the raise, the Burn Engine or
      headcount.

---

## Part 5 · The plan

### Stage 1 — Fix the model of record *(no documents touched)*

- [ ] **5.1** Confirm the operating company: jurisdiction, and whether it is one entity or the
      "companies in EU" the counsel engagement letter contemplates
- [ ] **5.2** Decide the funding mix from Part 4 and record the resulting use-of-funds table
- [ ] **5.3** Draft the development-and-services agreement terms — scope, fee basis, settlement
      currency, which entity pays
- [ ] **5.4** Confirm with counsel that paying an EU operating company from a Panama foundation
      works under the structure they advised, and what transfer-pricing position it needs

### Stage 2 — Fix the engine

- [ ] **5.5** Add a Seed use-of-funds allocation, so the raise reconciles in the model as it now
      does on paper
- [ ] **5.6** Add an operating-budget line and a runway output to the tokenomics results
- [ ] **5.7** Add a treasury/marketing liquidation schedule, so token-funded operations appear
      as a modelled flow rather than an assumption
- [ ] **5.8** Reclassify payment fees from operating cost to protocol cost
- [ ] **5.9** Rename the tokenomics "Liquidity" line to "BND/USDC pool". It seeds the AMM
      where BND trades, not the Bound Liquidity Layer, and the shared word is the single most
      confusing thing in the model

### Stage 3 — Fix the documents, in dependency order

- [ ] **5.10 · Operating Cost Analysis** — attribute every line to an entity; separate operating
      cost from protocol cost; split the legal line
- [ ] **5.11 · Business Plan** — replace the combined income statement with three views:
      protocol economics, operating company, and the transfer between them. Restate the capital
      requirement, breakeven and treasury chapters
- [ ] **5.12 · Go-to-Market Strategy** — state that the marketing allocation funds marketing
      spend; re-check stage gates against the corrected runway
- [ ] **5.13 · Delivery Roadmap** — state which entity bears the $320,000 and where the IP vests
- [ ] **5.14 · Whitepaper** — the governance and regulatory chapters name only BITSWIFT. If the
      Foundation owns the IP, that belongs in the document
- [ ] **5.15 · Smart Contract Architecture** — no change expected; confirm

### Stage 4 — Enforce it

- [ ] **5.16** Extend the verify scripts to assert entity attribution on every financial figure
- [ ] **5.17** Add a cross-document check that use-of-funds equals the raise
- [ ] **5.18** Add a check that no document nets protocol revenue against operating cost
- [ ] **5.19** Re-run all verification suites

---

## Part 6 · Decisions

| # | Decision | Why it matters |
|---|---|---|
| 1 | Jurisdiction and form of the operating company | Determines the structure, the tax position and the services agreement |
| 2 | Fund marketing spend from the Marketing allocation? | Natural pairing; frees cash; makes the allocation legible |
| 3 | Reduce the marketing budget, and to what? | Largest discretionary lever — up to $2.24M |
| 4 | Raise more, and how much? | $4.33M closes the gap; $4.98M reaches the 60% benchmark |
| 5 | Plan to 36 months, or to a funded 24 with a stated next raise? | Determines whether the plan is credible on its own terms |
| 6 | Rename the tokenomics "Liquidity" line to "BND/USDC pool"? | Resolved as distinct pools; the label is the only problem |

---

## What this changes about the earlier finding

The previous audit put the shortfall at $7,693,648 and suggested reallocating the Burn Engine.
With the owner's corrections — Seed to operations, Burn Engine retained, token allocations
counted — the position improves materially:

| | Before | After |
|---|---:|---:|
| Unallocated raise | $2,480,000 | $0 |
| Operating funding | $750,000 | $6,592,500 |
| Runway | 2.5 months | 21.7 months |
| Shortfall | $7,693,648 | $4,331,148 |

The structural error identified in the earlier audit stands unchanged: protocol revenue is
still being netted against operating cost in the Business Plan, and that must be corrected
regardless of how the funding question is resolved. What changes is the scale of the funding
problem — from severe to manageable, and closable without touching the Burn Engine.
