# Go-to-Market Strategy — Brief and Build Checklist

Build plan for a sixth platform document: **BOUND Protocol — Go-to-Market Strategy**,
grounded in the simulator's default case and the existing document set.

Status: `[ ]` not started · `[x]` done · `[!]` needs owner decision

---

## Part 1 · The brief, restated

The owner's direction, written as a professional brief.

> **Objective.** Define how BOUND acquires both sides of a two-sided market — liquidity
> providers who fund the Liquidity Layer, and RWA holders who consume instant exits — in a
> sequence that lets each side make the other viable.
>
> **The sequencing is staged on both sides, and the two are independent.**
>
> **Supply side (capital in, BLI out):** open first to private investors, DAOs and companies;
> open later to DeFi users seeking yield, at which point retail can buy BLI and provide
> liquidity directly.
>
> **Demand side (RWA in, rwaUSD out):** open first to private holders liquidating RWA
> positions; open later to everyone. The gate between the two is the **rwaUSD pool**. While the
> protocol is B2B-only the pool is not live, so the only route to mint or redeem rwaUSD is
> directly through the smart contract — which is exactly what suits institutional ticket sizes,
> since it avoids pool slippage.
>
> **RWA market onboarding runs in parallel from the first month**, independent of which side is
> open to whom.
>
> **Revenue sequencing.** Before the pool is live there is no APSS or pool-trading revenue. Once
> retail opens, the protocol earns across the full stream set.
>
> **Deliverable.** A professional GTM strategy document: market sizing, the two-sided cold-start
> problem, the staged plan with explicit gates, acquisition strategy per audience, positioning
> and pricing, targets drawn from the simulator, and the risks that govern the sequence.

## Part 2 · Strategic findings — three corrections to the brief

Verified against `scripts/sim-default.json` (default preset, 36 months). Each changes the plan.

### Finding 1 — Phase 1 is not a yield business. It is already a liquidity business.

The brief assumes that before retail opens, revenue is "the base yield from the Bound Liquidity
Layer yield position". In the default case, that yield is **5.9% of Phase 1 revenue**.

| Phase 1 revenue (months 1–5, private only) | Amount | Share |
|---|---:|---:|
| Integration fees (RWA market onboarding) | $150,000 | 31.9% |
| RWA trade and haircut revenue | $146,155 | 31.0% |
| Mint and redemption fees | $63,212 | 13.4% |
| Conversion fees | $52,305 | 11.1% |
| Maintenance fees | $31,250 | 6.6% |
| **Deployed-capital yield** | **$27,937** | **5.9%** |
| **Total** | **$470,859** | 100% |

- [x] **2.1** The liquidation business is live and earning from month one, through direct
      smart-contract mint and redeem. The pool's absence removes the APSS stream, not the
      core product.
- [x] **2.2** **Integration fees front-load cash.** Onboarding RWA markets is the single largest
      Phase 1 revenue line, and it is collected on onboarding rather than on volume. This makes
      issuer onboarding the highest-leverage Phase 1 activity — a GTM conclusion, not just a
      product one.
- [ ] **2.3** Rewrite the Phase 1 LP pitch around this. "Your capital earns from the exit spread
      on real liquidations from month one" is both stronger and true; "you earn base yield until
      retail arrives" understates the business by roughly seventeen times.

### Finding 2 — Opening retail does not raise LP yield. It dilutes it.

The brief states that opening retail increases LP yield because the protocol earns across more
streams. The model shows the opposite, because capital grows faster than revenue.

| | Phase 1 (m1–5) | Phase 2 (m6–8) | Phase 3 (m9–36) |
|---|---:|---:|---:|
| Revenue | $470,859 | $293,641 | $6,064,094 |
| Average Liquidity Layer | $5,095,863 | $7,907,099 | $19,676,716 |
| **Annualised take on capital** | **22.18%** | **14.85%** | **13.21%** |

Annualized Index Growth falls monotonically: **12.97% (m5) → 12.54% (m8) → 12.48% (m12) →
11.63% (m24) → 11.04% (m36)**.

- [x] **2.4** More streams raise **absolute** revenue, not **per-unit** return. BLI yield is
      revenue ÷ capital, and in the default case the denominator wins.
- [x] **2.5** **The yield advantage is temporal, not structural.** Early liquidity earns most
      because there is less of it competing for the same exit spread. That is a genuine,
      defensible argument for the private round — and it is exactly the wrong thing to promise
      retail later.
- [ ] **2.6** Reposition retail opening on its true merits: it scales the absolute business,
      creates a secondary market so BLI holders can exit without redeeming, and unlocks the APSS
      stream. Not on yield uplift.
- [!] **2.7** **Do not market a yield number that the model does not produce.** The whitepaper
      already commits to describing AIG as historical and capable of declining. Any GTM material
      promising rising yield contradicts it. **Owner decision on messaging discipline.**

### Finding 3 — Capital pacing is a binding constraint, not a growth lever.

- [x] **2.8** Because yield is revenue ÷ capital, raising LP capital faster than RWA markets can
      absorb it directly reduces returns for existing holders. The Liquidity Layer grows 5.8×
      over the horizon while monthly revenue grows 5.5× — capital slightly outpaces earning
      capacity throughout.
- [ ] **2.9** The GTM must therefore treat LP raising as **paced against RWA market onboarding**,
      with an explicit rule: no new LP tranche opens until onboarded market capacity can absorb
      it. This is the single most important operating discipline in the plan.
- [ ] **2.10** State the corollary honestly: a hard LP cap in early phases is a feature. It
      protects the yield that attracts the next tranche.

## Part 3 · Market context (researched, July 2026)

- [x] **3.1** **Supply side.** Public companies, DAOs, fintechs and crypto-native businesses hold
      **$35B+ in onchain stablecoin reserves**, most of it idle. Mainstream stablecoin yields run
      **4.1%–11.8%**. BOUND's modelled AIG of 11–13% sits at or above the top of that band, and is
      earned from an exit spread rather than from lending risk — a different risk shape, which is
      the positioning wedge. *(P2P.org; Coinchange; Eco)*
- [x] **3.2** **Demand side.** Tokenized RWA stands at **$22–33B onchain**, growing ~75% year on
      year. Treasuries and money-market funds are ~$10B (BUIDL $2.5B, USYC $3B, USDY $2.1B,
      BENJI $828M, OUSG $625M); private credit ~$8B (Maple, Centrifuge, Goldfinch, Apollo);
      real estate ~$2–3B. *(Eco; MetaMask; StablecoinInsider)*
- [x] **3.3** **Where the pain is sharpest.** Private credit is the weakest link — permissioned,
      eligibility-gated, and explicitly "uneven" on liquidity. Treasuries are the easiest to
      onboard but have the least acute exit problem. This asymmetry should drive market
      onboarding order.
- [x] **3.4** Scale check: the default case needs roughly **$6.5M of LP capital by month 5** —
      about **0.019%** of the idle stablecoin pool. The constraint is credibility and access,
      not market size.
- [ ] **3.5** Every market figure cited inline with source and date. No uncited claims.

## Part 4 · Document architecture

- [ ] **4.1** `Abstract` — the two-sided problem, the staged answer, what has to be true.
- [ ] **4.2** `1 · The Market` — supply side and demand side sized separately, with the
      asymmetry in §3.3 made explicit.
- [ ] **4.3** `2 · The Cold-Start Problem` — why a liquidity protocol cannot launch both sides at
      once, and why BOUND's protocol-owned reserve makes the problem tractable where a
      market-maker model would not.
- [ ] **4.4** `3 · The Staged Plan` — three stages with named entry gates on both sides.
      One diagram carrying both axes.
- [ ] **4.5** `4 · Stage One — Private Liquidity and B2B Exits` — the LP pitch rebuilt on
      Finding 1; issuer onboarding as the highest-leverage activity; direct smart-contract
      mint/redeem as an institutional feature, not a limitation.
- [ ] **4.6** `5 · Stage Two — Pool Launch` — what changes when the rwaUSD pool goes live, the
      APSS stream opens, and BLI becomes secondary-tradeable.
- [ ] **4.7** `6 · Stage Three — Open Market` — retail on both sides; positioning corrected per
      Finding 2.
- [ ] **4.8** `7 · Acquisition Strategy` — per audience: institutional LPs, DAO treasuries, RWA
      issuers, RWA holders, DeFi yield users. Channel, message, objection, proof point.
- [ ] **4.9** `8 · Capital Pacing Discipline` — Finding 3 as an operating rule with a stated
      trigger for opening each tranche.
- [ ] **4.10** `9 · Targets and Milestones` — drawn from the simulator, cross-referenced to the
      Delivery Roadmap's twelve milestones so GTM and engineering share one clock.
- [ ] **4.11** `10 · Risks` — cold-start failure, capital-ahead-of-demand, issuer concentration,
      regulatory gating of retail, competitor response.
- [ ] **4.12** `11 · Limits and Open Items`.
- [ ] **4.13** `Legal Disclaimer` — matches the platform family; no forward-looking yield promise.

## Part 5 · Alignment with existing documents

- [ ] **5.1** Stage gates must reconcile to the **Delivery Roadmap** — the pool cannot launch
      before M12 (mainnet). Any GTM stage that assumes pool liquidity must sit after it.
- [ ] **5.2** Revenue and yield figures must reconcile to the **Business Plan** and
      `sim-default.json`. No new numbers.
- [ ] **5.3** Spend must reconcile to the **Operating Cost Analysis** — the $1.5M launch
      marketing budget is the GTM's actual budget and should be allocated in this document
      rather than left as a single line.
- [ ] **5.4** Positioning must not contradict the **Whitepaper**: rwaUSD pays no yield, BLI is an
      index that can decline, BND confers governance only.
- [ ] **5.5** Competitive claims must reconcile to the **Competitors Analysis** (Midas MSL,
      Symbiotic, Ondo Nexus, Aave Horizon).

## Part 6 · Voice, graphics and build

- [ ] **6.1** Whitepaper voice — specification not persuasion; ~21-word mean sentence;
      antithesis openings; every claim carrying its evidence.
- [ ] **6.2** A GTM document is inherently persuasive. Discipline holds anyway: state what has to
      be true for each stage to work, and what happens if it is not.
- [ ] **6.3** Banned: revolutionary, seamless, unlock, leverage (verb), best-in-class, hyper-growth.
- [ ] **6.4** Two-axis staging diagram (supply side × demand side × time) — the document's
      centrepiece.
- [ ] **6.5** Bar — Phase 1 revenue composition, correcting the base-yield assumption.
- [ ] **6.6** Line — AIG decline against capital growth, making Finding 2 visible.
- [ ] **6.7** Table — acquisition matrix: audience, channel, message, objection, proof.
- [ ] **6.8** Table — stage gates with entry criteria and the milestone each depends on.
- [ ] **6.9** Pipeline: `gen-gtm-content.py` → `build-gtm.mjs` → `public/bound-gtm-strategy.html`,
      plus `verify-gtm.py` asserting every figure re-derives from `sim-default.json` and
      `cost-model.json`.
- [ ] **6.10** Card in `DOCS`, replacing the existing **Go-to-Market Strategy** "Coming soon"
      entry; route in `openDoc`; verify in the running app.

---

## Blocking decisions

| # | Decision | Why it blocks |
|---|---|---|
| 2.7 | Accept that LP yield declines as capital scales, and message accordingly? | Determines the entire retail-stage pitch; contradicts the brief as written |
| 2.9 | Adopt paced LP raising with a hard cap per stage? | Determines whether the plan optimises for capital raised or for yield defended |
| 5.3 | Allocate the $1.5M launch marketing budget inside this document? | Determines whether this is a strategy or a plan |

## Recommended approach, in one paragraph

Lead with the liquidation business, not the yield. Phase 1 already earns 94% of its revenue from
fees on real exits and market onboarding, so the private-LP pitch should be "you are funding an
operating spread business with a live order book", not "you are parked in a vault until retail
arrives". Pace LP capital deliberately behind RWA market onboarding, and say publicly that early
liquidity earns the most — it is true in the model, it rewards the investors taking the most
risk, and it creates genuine urgency without promising anything that later dilutes. Treat the
pool launch as the moment BLI becomes exitable rather than the moment yield rises, and treat
retail as scale rather than as an upgrade in returns.
