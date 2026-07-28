# Funding — Assumptions and Plan

Establishes the agreed basis before any document or model is touched, then sets out the work.

**Nothing has been changed. Assumptions first, then the plan.**

Status: `[x]` fixed or computed · `[!]` needs your decision · `[ ]` to do

---

## Part 1 · Assumptions — the agreed basis

Everything below follows from these. If one is wrong, say so now rather than after the rewrite.

### 1.1 Capital raised — fixed

| Round | Amount | Price | FDV |
|---|---:|---:|---:|
| Seed | $2,480,000 | $0.0248 | $24,800,000 |
| Extended Seed | $3,700,000 | $0.0460 | $46,000,000 |
| Public | $7,500,000 | $0.0500 | $50,000,000 |
| **Total** | **$13,680,000** | | |

- [x] Supply 1,000,000,000. Launch FDV $50,000,000.

### 1.2 Use of the raise — as now set in the simulator

- [x] Public raise splits **Liquidity 25% · Company 20% · Emergency Reserve 10% · Burn Engine 45%**
- [x] Extended Seed goes 100% to pool liquidity
- [!] **Seed goes 100% to the operating company** — your instruction, not yet in the model

| Destination | Amount |
|---|---:|
| Pool liquidity (Ext Seed + 25% Public) | $5,575,000 |
| Burn Engine seed (45% Public) | $3,375,000 |
| Operating company (Seed + 20% Public) | **$3,980,000** |
| Emergency Reserve (10% Public) | $750,000 |
| **Total** | **$13,680,000** |

### 1.3 Token allocations available to operations

- [x] Marketing 2% = 20,000,000 tokens · fully vested by M24 · **$1,000,000** at launch price
- [x] Treasury 9% = 90,000,000 tokens · 5% TGE, 12-month cliff, 48-month vest · only **52.5%**
      reachable by M36 = **$2,362,500**
- [x] **Total token funding available by M36: $3,362,500**
- [!] Valued at launch price. Selling into the market moves that price; the model does not yet
      show the sell pressure.

### 1.4 Operating company cost — from the verified cost model

- [x] $10,923,648 over 36 months, being every line except payment fees:

| | Amount | Share |
|---|---:|---:|
| Sales and marketing | $3,740,000 | 34.2% |
| Personnel (employer cost) | $2,938,869 | 26.9% |
| Maintenance infrastructure | $1,408,699 | 12.9% |
| Cloud infrastructure | $1,183,307 | 10.8% |
| Legal | $1,016,000 | 9.3% |
| Development | $350,000 | 3.2% |
| G&A | $254,064 | 2.3% |
| Software | $32,708 | 0.3% |

- [x] Payment fees ($723,687) are a protocol cost, not an operating cost.

### 1.5 Revenue attribution — the correction that drives everything

- [x] **BCI surplus capital ($5,549,732) belongs to BLI holders.** It sits inside the index price.
- [x] **Protocol Reserve ($1,278,862) is protocol treasury.**
- [x] **The operating company earns nothing** unless a services agreement is created.
- [!] **Assumption to confirm: the operating company is paid a cost-plus services fee.** Without
      it there is no revenue line and no defensible EU transfer-pricing position.

### 1.6 Horizon

- [!] The plan currently runs 36 months. Whether that is the right commitment is a decision, not
      an assumption — see Part 5.

---

## Part 2 · What your new split buys

You moved Company from 10% to 20%, taking 5% from Liquidity and 5% from the Burn Engine.

| | Old 30/10/10/50 | New 25/20/10/45 | Change |
|---|---:|---:|---:|
| Company cash | $3,230,000 | **$3,980,000** | +$750,000 |
| Total available (cash + tokens) | $6,592,500 | **$7,342,500** | +$750,000 |
| Shortfall | −$4,331,148 | **−$3,581,148** | +$750,000 |
| Pool seed | $5,950,000 | $5,575,000 | −$375,000 |
| Burn Engine seed | $3,750,000 | $3,375,000 | −$375,000 |
| **Runway** | 21.7 months | **24.2 months** | **+2.5 months** |

- [x] **2.1 It helps, and it is the cheapest lever available** — no external capital, no
      negotiation, one parameter.
- [x] **2.2 It does not close the gap on its own.** $3.58M still unfunded at the documented
      marketing budget.
- [x] **2.3 It has a price.** Every 10 points of Company is $750,000, taken from the Burn Engine
      and the pools — the two things you said matter most.

---

## Part 3 · The decision grid

Runway in months. `*` = fully funded for 36 months. Burn Engine falls as Company rises.

| Company % | Burn Engine | mkt $3.74M | mkt $2.5M | mkt $1.5M | mkt $1.0M |
|---:|---:|---:|---:|---:|---:|
| 10% | $4,125,000 | 21.7 | 24.5 | 27.3 | 29.0 |
| **20%** *(current)* | **$3,375,000** | **24.2** | 27.3 | **30.4** | 32.3 |
| 30% | $2,625,000 | 26.7 | 30.1 | 33.5 | 35.6 |
| 40% | $1,875,000 | 29.1 | 32.9 | **36.0\*** | **36.0\*** |
| 50% | $1,125,000 | 31.6 | 35.7 | **36.0\*** | **36.0\*** |

### What Company share would fully fund 36 months

| Marketing budget | Cash needed from Public | As % of Public |
|---|---:|---:|
| As documented, $3.74M | $5,081,148 | **67.7% — impossible** |
| $2.5M | $3,841,148 | 51.2% |
| $1.5M | $2,841,148 | **37.9%** |
| $1.0M | $2,341,148 | **31.2%** |

- [x] **3.1 At the documented marketing budget, no Company share closes it.** 67.7% of the
      public raise exceeds what is left after liquidity, burn and reserve. **Marketing has to
      come down — this is arithmetic, not preference.**
- [x] **3.2 With marketing at $1.5M, Company at ~38% closes 36 months.** That leaves the Burn
      Engine at roughly 27% — $2.0M rather than $3.4M.
- [x] **3.3 With marketing at $1.0M, Company at ~31% closes it**, with the Burn Engine near 34%.

---

## Part 4 · The two constraints

### 4.1 Company share and the Burn Engine trade directly against each other

- [x] Every 10 points to Company costs $750,000, split between the pools and the Burn Engine.
      You said the Burn Engine seed is a must. Going to 40% Company halves it.
- [!] **Decide the floor.** What is the smallest Burn Engine seed that still does its job? That
      number sets the ceiling on Company share.

### 4.2 One liquidity allocation, two pools

- [x] You are right that liquidity must serve both the **rwaUSD/USDC** pool and the
      **BND/USDC** pool. The model currently puts all of it in BND/USDC.
- [x] At 25%, total pool funding is $5,575,000. Split evenly that is $2,787,500 each:

| | If split 50/50 |
|---|---:|
| BND/USDC pool total value | $5,575,000 — 11.2% of FDV |
| BND side | 55,750,000 tokens — 5.6% of supply |
| rwaUSD/USDC pool | $2,787,500 |

- [x] 11.2% of FDV in BND liquidity is healthy by launch standards.
- [!] **Whether $2,787,500 is enough depth for the rwaUSD pool is unknown and must be sized.**
      The APSS defends that pool, and monthly pool volume reaches $15.5M by month 36 — turning
      the pool over roughly five times a month. **This is the open question that blocks the
      use-of-funds table.**

---

## Part 5 · Recommended package

- [ ] **5.1 Marketing to $1.5M** over 36 months, front-loaded to Stages 1 and 2, with Stage 3
      retail spend restored from revenue. Justified because Stage 1 is a direct sales motion,
      not a marketing one.
- [ ] **5.2 Fund marketing from the Marketing token allocation first** — $1,000,000 of the
      $1,500,000, cash for the remainder.
- [ ] **5.3 Company share at 30%**, not 20% or 40%. It adds $750,000 over your current setting
      while leaving the Burn Engine at $2,625,000 — reduced but not gutted.
- [ ] **5.4 Cost-plus services agreement at 8%**, funded from the raise, transitioning to
      Protocol Reserve as revenue builds.

**Position under this package:**

| | Amount |
|---|---:|
| OpCo cost incl. 8% margin | $9,378,339 |
| Cash from raise (Seed + 30% Public) | $4,730,000 |
| Tokens vested by M36 | $3,362,500 |
| Total available | $8,092,500 |
| **Shortfall** | **−$1,285,839** |
| **Runway** | **31.1 months** |

- [!] **5.5 Closing the last $1.29M** — three honest options:
      - Marketing to $1.0M instead of $1.5M → 33.0 months, $746K short
      - Raise increased by $1.3M
      - **Commit to a funded 24-month plan with a stated next round** — my preference. 31 months
        of runway on a 24-month plan is comfortable, and a plan that is funded beats a plan that
        is longer.

---

## Part 6 · Plan

### Stage 1 — Settle the assumptions *(nothing touched)*

- [ ] Confirm Part 1, or correct it
- [ ] Size the rwaUSD/USDC pool requirement (§4.2) — blocks everything downstream
- [ ] Set the Burn Engine floor (§4.1) — sets the ceiling on Company share
- [ ] Decide marketing level, Company share, margin and horizon
- [ ] Confirm the operating company's jurisdiction with counsel

### Stage 2 — Build the model of record

- [ ] Use-of-funds table across both pools, Burn Engine, Emergency Reserve, operating budget
- [ ] Token liquidation schedule with sell pressure shown, not assumed away
- [ ] Operating company P&L — services revenue, cost, margin, tax, runway
- [ ] Protocol economics statement — fee income, split, protocol costs
- [ ] Group sources and uses

### Stage 3 — Fix the engine

- [ ] Split the liquidity allocation across both pools
- [ ] Add the Seed use-of-funds allocation
- [ ] Add operating-budget and runway outputs to the tokenomics results
- [ ] Reclassify payment fees to protocol cost
- [ ] Rename the "Liquidity" line to name the pools it seeds

### Stage 4 — Rewrite the documents

- [ ] Operating Cost Analysis · Business Plan · Go-to-Market · Delivery Roadmap · Whitepaper

### Stage 5 — Enforce

- [ ] Entity attribution asserted on every financial figure
- [ ] Use-of-funds equals raise
- [ ] No document nets protocol revenue against operating cost

---

## Part 7 · Decisions

| # | Decision | Effect |
|---|---|---|
| 1 | rwaUSD/USDC pool seed size | Blocks the use-of-funds table |
| 2 | Burn Engine floor | Sets the ceiling on Company share |
| 3 | Company share — 20%, 30%, 40%? | Each 10 points = $750,000, ~2.5 months runway |
| 4 | Marketing — $3.74M, $2.5M, $1.5M, $1.0M? | Each $1M cut ≈ 2.5 months runway |
| 5 | Services margin — 5%, 8%, 10%? | ~$110,000 per point over 36 months |
| 6 | Horizon — 36 months, or a funded 24? | Determines whether the plan is credible on its face |

---

## Direct answer to your question

**Yes, raising the Company share helps, and it is the cheapest lever you have** — one parameter,
no external capital. It bought you $750,000 and 2.5 months.

**But it cannot work alone.** At the documented marketing budget you would need 67.7% of the
public raise going to the company, which exceeds what is left after liquidity, burn and reserve.
The marketing budget has to come down regardless of what you do with the split.

**And it is not free.** Company share comes out of the Burn Engine and the pools — the two
things you have said matter most. 30% is where I would stop: it adds meaningful runway while
leaving the Burn Engine at $2.6M rather than the $1.9M that 40% would imply.
