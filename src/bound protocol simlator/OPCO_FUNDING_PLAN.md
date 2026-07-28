# Operating Company — Funding and Reporting Plan

Answers three questions: how the operating company gets a revenue line, what statements the
group needs, and whether the marketing budget has to come down.

**Nothing has been changed. This is a plan.**

Status: `[x]` verified or computed · `[ ]` to do · `[!]` needs decision

---

## Part 0 · A correction, and a finding underneath it

- [x] **0.1** You are right that liquidity should split across the **rwaUSD/USDC pool** and the
      **BND/USDC pool**. Both need depth: the rwaUSD pool is what the APSS defends and what
      retail exits route through; the BND pool is where the governance token trades.
- [x] **0.2** **The model does not do that.** The tokenomics engine routes 100% of the $5,950,000
      into the BND/USDC pool alone — `usdcReserve` paired against 119,000,000 BND
      ([BoundSimulator.jsx:1445](src/BoundSimulator.jsx#L1445)). There is no rwaUSD reference
      anywhere in `runTokenomicsSim`.
- [x] **0.3** In the protocol engine the rwaUSD pool has **no seeded depth at all**.
      `poolInitialVolume: 50,000` is monthly trading *volume*, not reserve capital
      ([BoundSimulator.jsx:244](src/BoundSimulator.jsx#L244)).
- [!] **0.4** So the intent is right and the model is behind it. This matters for funding: if
      the rwaUSD pool needs seeding, that is a further claim on the same $5,950,000 — or more
      capital. **It has to be sized before the use-of-funds table is fixed.**

---

## Part 1 · Giving the operating company a revenue line

The company currently has none. Three mechanisms exist; one is right.

- [ ] **1.1 · Cost-plus services agreement — recommended.** The operating company bills the
      Foundation and the Issuer for development, marketing and operations at cost plus a margin.
      This is the standard instrument, and it is the only one that survives an EU tax review:
      counsel already flagged that revenue generation sits with EU entities, and an EU company
      performing real work for a Panama principal at **zero margin** is the classic transfer-
      pricing challenge. A margin makes it defensible.
- [ ] **1.2 · Fixed grant.** Simpler, but a grant with no deliverable and no margin invites the
      question of whether the EU entity is a permanent establishment of the Panama one.
- [ ] **1.3 · Revenue share from Protocol Reserve.** Protocol Reserve is $1,278,862 over 36
      months — 4.2 months of burn, and it only arrives *after* the money is needed. Correct as a
      later supplement, not as the primary mechanism.

### What the margin costs

- [x] At an 8% mark-up on $10,923,648 of cost:

| | Amount |
|---|---:|
| OpCo revenue (cost × 1.08) | $11,797,539 |
| OpCo profit before tax | $873,892 |
| EU corporate tax at 16% | $139,823 |
| **Additional funding the margin requires** | **$873,892** |

- [x] Doing this properly costs roughly $874,000 over three years. That is the price of a
      defensible structure, and it should be in the plan rather than discovered later.
- [!] **1.4** Confirm the margin with counsel. 5–10% is the usual band for routine services;
      the exact figure depends on the jurisdiction and the functions performed.

---

## Part 2 · What statements the group needs

Yes — you need both, but they are different instruments and only one is a P&L.

- [ ] **2.1 · Protocol economics statement — not a P&L.** A protocol has no profit; it has
      flows. This states fee income by stream, the split between BCI surplus capital (to BLI
      holders) and Protocol Reserve, and protocol-level costs — payment fees, gas. It ends at
      *distribution*, not at *profit*. Owner: Foundation.
- [ ] **2.2 · Operating company P&L — a real one.** Revenue is the services fee from §1.1;
      costs are personnel, marketing, infrastructure, G&A, legal. It produces a margin, a tax
      charge and a runway. Owner: the EU operating company.
- [ ] **2.3 · Group sources and uses.** Capital raised, allocated across pools, Burn Engine,
      Emergency Reserve and operating budget; token allocations liquidated; the transfer from
      Issuer/Foundation to OpCo. This is the statement that shows whether the launch is
      affordable, and it is the one that does not exist today.
- [x] **2.4** The current Business Plan collapses 2.1 and 2.2 into a single income statement.
      That is the error. Splitting them is not extra work — it is the work.

---

## Part 3 · Marketing — the scenarios

Marketing is $3,740,000, **34.2% of operating cost** and the largest single line. Available
funding is $6,592,500, so marketing alone is 57% of everything the company has.

| Scenario | OpCo cost | Shortfall | Runway |
|---|---:|---:|---:|
| **A** · As documented ($3.74M) | $10,923,648 | −$4,331,148 | 21.7 mo |
| **B** · Marketing to $2.5M | $9,683,648 | −$3,091,148 | 24.5 mo |
| **C** · Marketing to $1.5M | $8,683,648 | −$2,091,148 | 27.3 mo |
| **D** · Marketing to $1.0M (= token allocation) | $8,183,648 | −$1,591,148 | 29.0 mo |
| **E** · C + raise increased $2M | $8,683,648 | **−$91,148** | **35.6 mo** |
| **F** · C + cost-plus 8% | $9,378,339 | −$2,785,839 | 25.3 mo |
| **G** · C + raise $2M + cost-plus 8% | $9,378,339 | −$785,839 | 33.0 mo |

- [x] **3.1 · Cutting marketing alone does not close the gap.** Even at $1.0M — the size of the
      Marketing token allocation — $1.59M remains.
- [x] **3.2 · Marketing to $1.5M plus a $2M raise increase closes it.** Scenario E leaves a
      $91,148 shortfall against a 36-month plan. That is a rounding error at this scale.
- [x] **3.3 · Doing the transfer pricing properly costs about eight months of runway.** Compare
      C (27.3 months) with F (25.3 months) — the margin is real money and must be funded.

### Why $1.5M is defensible, not arbitrary

- [x] **3.4** The Go-to-Market Strategy already allocates the launch year as $520,000 to
      institutional sales support, $430,000 to the pool-launch campaign and $630,000 to Stage 3
      retail performance marketing.
- [x] **3.5** Stage 1 is explicitly **a direct sales motion**, not a marketing one — closing
      institutional LPs and RWA issuers one relationship at a time. Direct sales does not consume
      $1.58M in year one.
- [x] **3.6** The most compressible line is **Stage 3 retail performance marketing** — the most
      discretionary, the most measurable, and the one that can be restored from revenue once the
      pool is live. Cutting there costs the least strategically.
- [ ] **3.7** Pair the residual budget to the **Marketing token allocation ($1,000,000)**. The
      allocation exists to fund marketing; using it for anything else makes the tokenomics
      harder to explain, and using cash for marketing while the allocation sits idle is worse.

---

## Part 4 · Recommended package

- [ ] **4.1** Marketing to **$1.5M** over 36 months, front-loaded to Stage 1 and 2, with Stage 3
      retail spend restored from revenue rather than from the raise
- [ ] **4.2** Fund marketing from the **Marketing token allocation** first, cash second
- [ ] **4.3** **Cost-plus services agreement at 8%**, funded from the raise, transitioning to
      Protocol Reserve as revenue builds
- [ ] **4.4** Increase the raise by **$2,000,000** — or accept a funded **24-month** plan with a
      stated next round, which needs only $265,348 more at the reduced marketing level
- [ ] **4.5** Three statements per Part 2, replacing the single combined income statement
- [x] **4.6** Result: **Scenario G — $785,839 short over 36 months, 33 months funded**, with a
      defensible tax structure and marketing paired to its own allocation. Or Scenario E without
      the margin, which is fully funded but weaker structurally.

---

## Part 5 · Work plan

### Stage 1 — Decide *(no files touched)*

- [ ] Size the rwaUSD/USDC pool seed (§0.4) — this changes the use-of-funds table
- [ ] Choose the marketing level and the raise decision from Part 4
- [ ] Confirm the services-agreement margin with counsel
- [ ] Confirm the operating company's jurisdiction

### Stage 2 — Rebuild the model of record

- [ ] Use-of-funds table: raise → pools, Burn Engine, Emergency Reserve, operating budget
- [ ] Token liquidation schedule for Marketing and Treasury, with sell-pressure shown
- [ ] Operating company P&L: services revenue, costs, margin, tax, runway
- [ ] Protocol economics statement: fee income, split, protocol costs
- [ ] Group sources and uses

### Stage 3 — Fix the engine

- [ ] Split the tokenomics liquidity allocation across both pools
- [ ] Add the Seed use-of-funds allocation
- [ ] Add an operating-budget line and runway output
- [ ] Reclassify payment fees from operating cost to protocol cost
- [ ] Rename the tokenomics "Liquidity" line to name the pool it seeds

### Stage 4 — Rewrite the documents

- [ ] Operating Cost Analysis — attribute every line to an entity
- [ ] Business Plan — three statements, restated capital requirement and breakeven
- [ ] Go-to-Market Strategy — revised marketing allocation, funded from the token allocation
- [ ] Delivery Roadmap — which entity bears the $320,000, where the IP vests
- [ ] Whitepaper — reflect the Foundation in governance and regulatory chapters

### Stage 5 — Enforce

- [ ] Verify scripts assert entity attribution on every financial figure
- [ ] Cross-document check: use-of-funds equals raise
- [ ] Cross-document check: no document nets protocol revenue against operating cost
- [ ] Re-run all suites

---

## Part 6 · Decisions

| # | Decision | Effect |
|---|---|---|
| 1 | How much does the rwaUSD/USDC pool need? | Unknown claim on the $5.95M; blocks the use-of-funds table |
| 2 | Marketing level — $3.74M, $2.5M, $1.5M or $1.0M? | Each $1M cut adds ~2.5 months of runway |
| 3 | Increase the raise by $2M, or plan to a funded 24 months? | Determines whether the 36-month plan is credible |
| 4 | Services-agreement margin — 5%, 8%, 10%? | Costs ~$110K per percentage point over 36 months |
| 5 | Operating company jurisdiction | Determines tax, margin and the agreement's form |

---

## The short answer to your three questions

**How do we align cost with the operating company?** Give it a revenue line — a cost-plus
services agreement with the Foundation and Issuer, funded from the raise and later from
Protocol Reserve. Without it the company is a cost centre with no income, which is exactly what
the current numbers describe.

**Do we need a P&L for both?** You need a real P&L for the operating company, a flow statement
for the protocol — protocols have no profit, only distribution — and a group sources-and-uses
statement showing the transfer. Three statements, not one.

**Do we cut marketing?** Yes. At 34% of operating cost and 57% of available funding it is the
binding constraint, and the plan's own Stage 1 is a direct sales motion that does not need it.
$1.5M is defensible. But cutting marketing alone leaves $2.09M unfunded — it has to be paired
with either a $2M raise increase or an honest 24-month horizon.
