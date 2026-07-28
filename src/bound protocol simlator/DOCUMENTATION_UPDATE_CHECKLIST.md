# Documentation Update — Checklist

Propagating the engine changes, the entity structure and the reorganisation across the platform.

Status: `[x]` verified · `[ ]` to do · `[!]` needs your decision

---

## Part 0 · Answers to your questions

### 0.1 Where does the operating-company analysis go?

- [ ] **Your instinct is right — the Operating Cost Analysis.** That is where personnel already
      sits, and the OpCo P&L is the natural conclusion of a cost document rather than a new
      document that would immediately duplicate it. Renaming it **Operating Cost & Company
      Analysis** signals the widened scope.

### 0.2 Do we need a protocol-level P&L too?

- [ ] **No — a protocol has no P&L, and publishing one would be wrong.** It has no shareholders,
      no retained earnings and no profit. What it has is a **flow statement**: fee income in,
      split between BCI surplus capital (to BLI holders) and Protocol Reserve (to treasury),
      less protocol costs. That belongs in the **Business Plan** alongside the OpCo P&L, so the
      two sit side by side and the transfer between them is visible.
- [ ] Three statements total: protocol flows · operating company P&L · group sources and uses.

### 0.3 The repeated abstracts — your observation is correct

- [x] Every document opens by re-establishing what BOUND is. Five separate first paragraphs all
      doing the same work:

| Document | Opens with |
|---|---|
| Business Plan | "BOUND Protocol is on-chain liquidity infrastructure for tokenized real-world assets…" |
| Go-to-Market | "BOUND is a two-sided market. One side supplies liquidity…" |
| Delivery Roadmap | "BOUND is not starting from zero. The Atomic Peg Stabilization System…" |
| Architecture | "BOUND is a modular contract system built on Uniswap V4…" |
| Operating Cost | "A cost model is only as good as the revenue series…" |

- [ ] **Adopt your proposal.** Move the shared protocol overview onto the Documentation hub
      itself, above the cards, and cut the re-explanation from each document's abstract. Each
      abstract then opens on **its own subject** rather than on the protocol.
- [ ] **Keep the Whitepaper's abstract intact** — it is the specification and must stand alone
      for a reader who receives only that file.
- [ ] A visitor landing on the hub gets the overview before opening anything, which is what a
      first-time investor actually needs.

---

## Part 1 · Inconsistencies found

### 1.1 The Tokenomics Audit is stale and partly hardcoded — highest priority

The audit is generated from the live engine, but three things are wrong.

- [x] **It parses defaults from the source file by name**, and my three new parameters are not
      in its list: `bndPoolSeed`, `lpOutsideUsdcPct`, `lpExitChurnPct`. It therefore runs the
      LP-staking model with the old fallback.
- [x] **Its pool figure ignores the two-pool split.** Line 106 computes
      `usdc0 = extSeedRaised + publicRaised × publicSplitLiquidity/100` — the full AMM
      allocation. It reports **$4.97M of BND pool depth against a true seed of $1.00M.**
- [x] **Extended Seed's vesting is a hardcoded string**: `"0% TGE · 12-mo cliff · 36-mo linear"`.
      It is now 8-month cliff, 24-month vest. Seed and Public are hardcoded too and happen to
      still be right, which is worse — they will drift silently.

### 1.2 The cost model still carries $3.74M of marketing

- [x] `cost-model.json` reads `sales_marketing: [1,580,000 · 1,080,000 · 1,080,000]`. Everything
      downstream — Business Plan, GTM, funding position — is computed on the old number.

### 1.3 Documents predate the entity work entirely

- [x] The Business Plan still nets protocol revenue against operating cost. The Operating Cost
      Analysis attributes nothing to an entity. Neither mentions the Foundation or the OpCo.

### 1.4 Things I checked that are fine

- [x] `sim-default.json` is unaffected — the protocol engine did not change, only tokenomics.
- [x] Whitepaper, Market Analysis, Competitors Analysis carry no figures from either engine.
- [x] Smart Contract Architecture is unaffected by the tokenomics changes.

---

## Part 2 · Open questions

- [!] **2.1** Renaming the cost document to **Operating Cost & Company Analysis** — agreed?
- [!] **2.2** The **$320,000 delivery budget** — does it sit in the OpCo P&L as development cost,
      or is it capitalised as IP to the Foundation? It changes both statements.
- [!] **2.3** Services margin — I will use **8%** unless you say otherwise.
- [!] **2.4** Horizon — documents currently say 36 months. You agreed to **commit to 24 with the
      spare**. Should the Business Plan lead on 24 and show 36, or keep leading on 36?

---

## Part 3 · Work, in dependency order

Each stage consumes the one before it. Order is not optional.

### Stage 1 · Engine and feeds

- [ ] **3.1** Add `bndPoolSeed`, `lpOutsideUsdcPct`, `lpExitChurnPct` to the audit's parsed names
- [ ] **3.2** Fix the audit's `usdc0` to use the BND pool slice
- [ ] **3.3** Make the audit's vesting strings derive from `vestState`, not string literals
- [ ] **3.4** Regenerate `sim-default.json` (no change expected — confirm)

### Stage 2 · Cost model — everything downstream depends on it

- [ ] **3.5** Implement the phased **$1,500,000** marketing budget:

| Phase | Line | Amount |
|---|---|---:|
| 1 · B2B institutional (m1–5) | Brand and institutional collateral | $60,000 |
| | Category research and thought leadership | $50,000 |
| | Two Tier-2 conferences | $120,000 |
| | PR and analyst relations | $40,000 |
| | Issuer BD materials and data room | $30,000 |
| 2 · Pool launch (m6–8) | Launch campaign | $120,000 |
| | One Tier-2 conference | $60,000 |
| | PR and earned media | $40,000 |
| | DeFi ecosystem and integrations | $60,000 |
| 3 · Open market (m9–36) | Content and SEO, $12K/mo | $336,000 |
| | Community and education, $7K/mo | $196,000 |
| | Conferences, two a year | $240,000 |
| | Performance marketing, retail | $148,000 |
| | **Total** | **$1,500,000** |

- [ ] **3.6** Attribute every cost line to an entity; move payment fees to protocol cost
- [ ] **3.7** Add the **operating company P&L**: services revenue at cost + 8%, cost, margin,
      tax, runway
- [ ] **3.8** Emit the entity split and the P&L into `cost-model.json` for downstream consumers

### Stage 3 · Documents

- [ ] **3.9 · Operating Cost & Company Analysis** — entity attribution, the new marketing budget
      with its phase table, the OpCo P&L, funding sources, runway
- [ ] **3.10 · Business Plan** — three statements replacing the combined one; restated capital
      requirement, breakeven and treasury
- [ ] **3.11 · Go-to-Market Strategy** — the $1.5M budget, funded from the Marketing allocation
- [ ] **3.12 · Tokenomics Audit** — regenerate after Stage 1
- [ ] **3.13 · Delivery Roadmap** — which entity bears the $320,000 (pending 2.2)
- [ ] **3.14 · Whitepaper** — the Foundation in governance and regulatory chapters

### Stage 4 · Documentation hub reorganisation

- [ ] **3.15** Add a **protocol overview** section to the hub, above the document cards —
      what BOUND is, the three tokens, the entity structure, current status
- [ ] **3.16** Cut the re-explanation from each document's abstract so each opens on its own
      subject. **Whitepaper excepted.**
- [ ] **3.17** Group the cards by purpose rather than listing nine flat: Specification ·
      Analysis · Commercial · Delivery

### Stage 5 · Verification

- [ ] **3.18** Every verify script re-run
- [ ] **3.19** New cross-document checks:
      - marketing totals $1,500,000 in every document that cites it
      - no document nets protocol revenue against operating cost
      - entity attribution present on every financial figure
      - use-of-funds equals the raise
- [ ] **3.20** Audit's pool figure matches `bndPoolSeed`
- [ ] **3.21** Manual read of all nine documents for figures that moved

---

## Part 4 · The figures that must be consistent everywhere

Any document citing one of these must cite the same value.

| Figure | Value |
|---|---:|
| Total raise | $13,680,000 |
| Public split | Liquidity 17% · Company 30% · Emergency 10% · Burn 43% |
| AMM allocation | $4,975,000 — BND $1,000,000 / rwaUSD $3,975,000 |
| Burn Engine seed | $3,225,000 |
| Operating budget | $4,730,000 (Seed + 30% of Public) |
| Extended Seed | $0.0400 · 8-mo cliff · 24-mo vest · 9.25% of supply |
| Community & Ecosystem | 28.75% |
| Total allocation | 100.00% |
| Marketing, 36 months | $1,500,000 |
| Protocol revenue, 36 months | $6,828,594 |
| Services margin | 8% |
