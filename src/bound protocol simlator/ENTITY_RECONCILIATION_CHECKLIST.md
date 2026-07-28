# Entity Reconciliation — Findings and Remediation Plan

Cross-document audit of the BOUND documentation set, testing whether protocol-level revenues
are being netted against operating-company costs, and whether the token raise is sized to fund
what the cost model actually spends.

**Verdict: yes, there is a structural problem, and it is larger than a presentation issue.**

Status: `[ ]` not started · `[x]` verified · `[!]` needs owner decision

---

## Part 1 · Findings

### Finding 1 — Revenue and cost sit in different entities and are being netted

The Business Plan's income statement reads:

| | 36 months |
|---|---:|
| Protocol revenue | $6,828,594 |
| Operating cost base | −$11,647,335 |
| Operating result | **−$4,818,741** |

- [x] **1.1** That subtraction is not valid. The two lines belong to different entities.
- [x] **1.2** **BCI surplus capital — $5,549,732 — belongs to BLI holders, not the company.**
      Verified in the engine: the BLI price identity is
      `price = (Layer NAV + BCI SC) / supply` ([BoundSimulator.jsx:890](src/BoundSimulator.jsx#L890)).
      Every dollar of BCI surplus raises the index. It is liquidity-provider return, and
      spending it on salaries would mean paying staff out of the index.
- [x] **1.3** **Protocol Reserve — $1,278,862 — is protocol treasury**, funding the Emergency
      Reserve and protocol operations. It is not company revenue either.
- [x] **1.4** **The operating company has no revenue line anywhere in the model.** Not a small
      one — none. It is modelled as a pure cost centre while being credited with the protocol's
      entire fee income.
- [x] **1.5** The prior financial model handled this correctly. Its FS sheet stated that
      "revenues recognised directly in the company's profit and loss statement and not
      reinvested in the protocol" were a specific, narrower subset. That distinction was lost
      when the current documents were built.

### Finding 2 — The operating company is funded at 7% of what it spends

- [x] **2.1** Cost attributed by natural owner, over 36 months:

| Line | Amount | Bears it |
|---|---:|---|
| Sales and marketing | $3,740,000 | Operating company |
| Personnel (employer cost) | $2,938,869 | Operating company |
| Maintenance infrastructure | $1,408,699 | Operating company |
| Cloud infrastructure | $1,183,307 | Operating company |
| Development | $350,000 | Operating company / capitalised to Foundation |
| General and administrative | $254,064 | Operating company |
| Software licences | $32,708 | Operating company |
| Legal | $1,016,000 | **Split** — token legal to issuer, corporate to OpCo |
| Payment fees | $723,687 | **Protocol** — scales with on-chain volume |
| **Total** | **$11,647,335** | |

      Operating company bears **$10,923,648** — 93.8% of the base.

- [x] **2.2** The tokenomics engine allocates the raise as follows
      ([BoundSimulator.jsx:1445](src/BoundSimulator.jsx#L1445), [:1448](src/BoundSimulator.jsx#L1448)):

| Destination | Amount | Rule |
|---|---:|---|
| Liquidity Layer seed | $5,950,000 | 100% of Extended Seed + 30% of Public |
| Burn Engine seed | $3,750,000 | 50% of Public |
| **Company** | **$750,000** | **10% of Public** |
| Emergency Reserve | $750,000 | 10% of Public |
| Allocated | $11,200,000 | |
| **Unallocated** | **$2,480,000** | |

- [x] **2.3** **$750,000 against $10,923,648 of cost is 2.5 months of runway.** Average operating
      burn is $303,435 a month. Even treating the entire unallocated Seed raise as company
      funding gives 10.6 months against a 36-month plan.

### Finding 3 — The Seed raise is never assigned to anything

- [x] **3.1** $2,480,000 of Seed proceeds appear in the token-count and investor-return
      calculations but in no use-of-funds line. The engine allocates Extended Seed and Public;
      Seed simply is not spent anywhere in the model.
- [x] **3.2** This is a modelling gap, not necessarily a real one — but as published, the
      documents do not say what the Seed money does.

### Finding 4 — Two different pools share one word, and the word is "liquidity"

- [x] **4.1** The tokenomics engine's $5,950,000 "Liquidity" line is the **BND/USDC AMM pool** —
      the market where the governance token trades. Verified at
      [BoundSimulator.jsx:1445](src/BoundSimulator.jsx#L1445): the figure becomes `usdcReserve`,
      paired against `bndReserve = usdcReserve / launchPrice` = 119,000,000 BND, or 11.9% of
      supply against the 12% Liquidity & MM allocation.
- [x] **4.2** The protocol engine's **Bound Liquidity Layer** is the reserve that funds RWA
      instant exits, funded entirely from liquidity-provider deposits — `initPrivateLp`
      $3,200,000 plus `lpGrowth` $800,000 a month
      ([BoundSimulator.jsx:243](src/BoundSimulator.jsx#L243)).
- [x] **4.3** **These are different pools with different purposes, funded from different
      sources. There is no double count.** An earlier draft of this document raised that as an
      open question; reading the engine resolves it.
- [ ] **4.4** What remains is a **naming collision**. A protocol whose core product is called
      the "Bound Liquidity Layer" also has a tokenomics slider labelled "Public raise →
      Liquidity" that means something entirely different. Rename the tokenomics line to
      "BND/USDC pool" or "AMM liquidity" wherever it appears.

### Finding 5 — Payment fees are misclassified as an operating-company cost

- [x] **5.1** $723,687 of "payment fees" scale with on-chain volume. They are a protocol cost
      netted against protocol revenue, not an operating expense. They currently sit inside the
      company's cost base, overstating it.

### Finding 6 — The plan needs roughly $21.4M and raises $13.7M

- [x] **6.1** Summing what the documents commit to:

| Requirement | Amount |
|---|---:|
| Operating company, 36 months | $10,923,648 |
| Liquidity Layer seed | $5,950,000 |
| Burn Engine seed | $3,750,000 |
| Emergency Reserve | $750,000 |
| **Total required** | **$21,373,648** |
| **Total raised** | **$13,680,000** |
| **Gap** | **−$7,693,648** |

- [x] **6.2** This is the number underneath the owner's intuition. It is not a rounding
      problem or a presentation problem — the documented plan is under-funded by roughly 36%.

---

## Part 2 · The correct entity model

Three entities, evidenced in the corporate records and the counsel engagement letter.

| Entity | Evidence | Role |
|---|---|---|
| **Nexus Technologies Foundation** (Panama) | Foundation Deed; SAFT §Definitions — *"holds the intellectual property rights in and to the Protocol and the Platform and has granted the Token Delegation to the Seller"* | Owns protocol and IP; mints token |
| **BITSWIFT TECHNOLOGIES INC.** (Panama IBC) | SAFT Seller; issuer named in both legal opinions | Distributes tokens; holds raise proceeds |
| **Operating company** (EU) | Counsel engagement letter — *"revenue generation will be done exclusively by the companies in EU"* | Employs staff; incurs operating cost; delivers services |

- [ ] **2.1** **Money flows that must be stated explicitly:**
      - Token raise → Issuer → allocated across Liquidity, Burn Engine, Emergency Reserve, and
        an **operating budget**
      - Protocol fees → split between BCI surplus capital (**to BLI holders**) and Protocol
        Reserve (**to protocol treasury**)
      - Operating company funded by a **services agreement** with the Foundation or Issuer, paid
        from the raise and, once revenue exists, from Protocol Reserve
- [ ] **2.2** **The structural fix is that the operating company needs a revenue line.** A
      development-and-services fee is the standard instrument. Without it the company is a cost
      centre with no income, which is exactly what the current numbers describe.
- [!] **2.3** Confirm the operating company exists and in which jurisdiction. It is named in the
      counsel engagement letter but appears in no corporate record supplied so far.

---

## Part 3 · Options to close the $7.7M gap

Not mutually exclusive. Figures are the effect of each on the gap.

- [!] **3.1 · Reallocate the Burn Engine seed — up to $3,750,000.** The largest single lever. The
      Burn Engine is a value-accrual mechanism, not an operating necessity at launch, and it
      could be seeded from Protocol Reserve over time instead of from the raise on day one.
      **Closes 49% of the gap on its own.**
- [!] **3.2 · Allocate the Seed raise explicitly — $2,480,000.** Currently unassigned. Directing
      it to the operating budget closes a further 32%.
- [!] **3.3 · Reduce the cost base.** Sales and marketing at $3,740,000 is 34% of operating cost
      and the largest discretionary line. A 40% reduction closes $1.5M.
- [!] **3.4 · Raise more.** Increasing the round sizes or the FDV. This is the only option that
      does not require giving something up, and the most dilutive.
- [!] **3.5 · Introduce a services fee from Protocol Reserve.** Protocol Reserve totals
      $1,278,862 over 36 months — real, but it covers 4.2 months of operating burn, so it
      supplements rather than solves.
- [x] **3.6** Combining 3.1 and 3.2 alone closes $6,230,000 of the $7,693,648 gap and would make
      the plan approximately fundable at the current raise.

---

## Part 4 · Remediation checklist

### 4.1 Establish the model of record

- [ ] Confirm the three entities, their jurisdictions and their relationships (§2.3)
- [ ] Decide the funding mechanism for the operating company (§2.2)
- [ ] Decide the allocation changes from §3
- [ ] Record the resulting use-of-funds table as the single source of truth

### 4.2 Fix the engine

- [ ] Add a Seed use-of-funds allocation ([BoundSimulator.jsx:1445](src/BoundSimulator.jsx#L1445))
- [ ] Reconcile the tokenomics "Liquidity" seed against the protocol engine's LP-funded layer,
      or state plainly that they are separate pools (§4.4)
- [ ] Add an operating-budget line and a runway output to the tokenomics results
- [ ] Move payment fees out of the operating cost base into protocol costs

### 4.3 Fix the Operating Cost Analysis

- [ ] Attribute every cost line to an entity
- [ ] Present operating-company cost separately from protocol cost
- [ ] Split the legal line between token legal and corporate legal
- [ ] Restate the "cost coverage" chapter — protocol revenue does not cover company cost, and
      the current framing implies it eventually will

### 4.4 Fix the Business Plan

- [ ] **Remove the combined income statement.** Replace with three statements: protocol
      economics, operating company, and a consolidated view that shows the transfer between them
- [ ] Restate the capital requirement — it is not $4,897,895; that figure came from netting
      across entities
- [ ] Rebuild the breakeven chapter on operating-company economics
- [ ] Restate the treasury chapter to show which entity holds each balance

### 4.5 Fix the Go-to-Market Strategy

- [ ] The $1,580,000 marketing allocation is an operating-company cost funded from the raise —
      say so
- [ ] Re-check the stage-gate economics against the corrected runway

### 4.6 Fix the Delivery Roadmap

- [ ] State which entity bears the $320,000 development budget and whether the resulting IP
      vests in the Foundation

### 4.7 Whitepaper and legal consistency

- [ ] The whitepaper names only BITSWIFT. If the Foundation owns the IP, the whitepaper's
      governance and regulatory chapters need to reflect the actual structure
- [ ] Confirm counsel has opined on the structure as it will actually operate

### 4.8 Verification

- [ ] Extend the verify scripts to assert entity attribution on every financial figure
- [ ] Add a cross-document check that the use-of-funds total equals the raise
- [ ] Re-run all five verification suites

---

## Part 5 · Decisions required before any document is rewritten

| # | Decision | Consequence |
|---|---|---|
| 1 | Does the operating company exist, and where? | Determines the entire structure and the tax position |
| 2 | How is it funded — allocation, services fee, or both? | Determines whether it has a revenue line |
| 3 | Reallocate the Burn Engine seed? | Largest single lever, closes 49% of the gap |
| 4 | Allocate the Seed raise to operations? | Closes a further 32% |
| 5 | Cut the cost base, raise more, or both? | Closes the remainder |
| 6 | Rename the tokenomics "Liquidity" line to "BND/USDC pool"? | Presentational — the two pools are distinct; only the label collides |

---

## A note on what is not wrong

The underlying models are sound. The protocol engine's revenue identities hold, the cost model
reconciles to its sources, and the tokenomics engine's allocations are internally consistent.
Every verification suite still passes, because each document is correct in isolation.

The failure is at the seams. Nothing in the document set asserts which entity owns which
number, so the Business Plan combined two entities' figures into one statement and nothing
caught it. That is a structural gap in how the documents relate, not an arithmetic error inside
any one of them — which is why it survived five passing verifiers.

The fix is to make entity attribution explicit and then enforce it the same way everything else
in this set is enforced: mechanically, in the verify scripts.
