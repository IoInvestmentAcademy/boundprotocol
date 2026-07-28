# Delivery Roadmap Document — Build Checklist

Merge of `BOUND_Protocol_Technical_Roadmap.docx` and `BOUND_RWA_Milestone_Roadmap.docx`
into a single platform document: **BOUND Protocol — Delivery Roadmap**, opening with a
plain-language roadmap any reader can follow, then descending into full engineering detail.

Status: `[ ]` not started · `[x]` done · `[!]` needs owner decision

---

## 1 · Source review (complete)

- [x] **1.1** Both documents extracted with heading level, list depth and tables preserved.
      Technical: 212 lines, 6 tables, ~90 deliverable line items across 4 layers × 3 phases.
      Milestone: 201 lines, 6 tables, 12 milestones × 3 phases plus three budget cuts.
- [x] **1.2** **The two documents are complementary, not duplicative.** The Milestone roadmap is
      the *outcome* view (what becomes possible, why it matters, what it costs); the Technical
      roadmap is the *execution* view (which layer builds what, in which week, against which gate).
      Both are needed; neither is a summary of the other.
- [x] **1.3** Budget arithmetic verified — all three cuts tie to **$320,000** exactly:

| Cut | Total | Ties |
|---|---:|---|
| By workstream (8 lines) | $320,000 | yes |
| By workforce (9 roles) | $320,000 | yes |
| By phase (3 phases) | $320,000 | yes |

- [x] **1.4** Phase shares as stated (24% / 48% / 28%) are rounded from 24.4% / 48.1% / 27.5%.
      Restate precisely or keep the source rounding — flagged, not an error.

## 2 · Conflicts between the two sources

Each must be resolved before writing; the merged document cannot carry both readings.

- [!] **2.1** **Timeline floor conflicts.** Technical states **18–25 weeks**; Milestone states
      **22–25 weeks**. The Technical document qualifies 18 weeks as achievable only with
      "fully dedicated teams and a clean single-round audit remediation".
      → Recommend leading with **22–25 weeks** (the Milestone figure, which is the delivery
      commitment) and presenting 18 weeks as the compressed floor with its stated preconditions.
      **Owner decision.**
- [!] **2.2** **Budget horizon conflicts with the milestone schedule.** The budget is stated as
      "$320,000 across 22 weeks" with Phase 3 running **weeks 17–22**, but milestone M12
      (RWA markets live) sits at **week 25**. Three weeks of the delivery window carry no
      budgeted allocation.
      → Either the budget covers weeks 1–22 and weeks 23–25 are absorbed by contingency, or the
      phase table is mis-stated. **Owner decision — this is the most material inconsistency found.**
- [!] **2.3** **Token terminology conflicts with the entire platform.** Both roadmaps call the
      settlement dollar **BLD (Bound Liquid Dollar)**. The whitepaper, simulator, cost analysis
      and business plan all call it **rwaUSD**. Same instrument, same function, different name.
      → Recommend rendering the merged document in current platform terminology (**rwaUSD**), with
      a single explicit note recording that the source roadmaps use BLD. **Owner decision.**
- [x] **2.4** **Neither roadmap covers BLI or BND.** The engineering scope is the settlement
      dollar, the liquidity pool, the RWA registry, the oracle layer and governance plumbing.
      The index token and the governance token build are absent. State this as a scope boundary
      rather than silently implying full coverage.
- [x] **2.5** **"MICA" is spelled inconsistently** with the whitepaper's "MiCA"
      (Regulation (EU) 2023/1114). Normalise to MiCA throughout.

## 3 · Cross-references to existing platform documents

- [x] **3.1** The roadmap's **excluded** items are already **inside** the verified cost model:

| Roadmap exclusion | Cost model line | Amount |
|---|---|---:|
| External smart contract audit | Legal — Smart Contract Auditing | $200,000 |
| Public security competition + re-audit | Legal — (not separately booked) | — |
| Immunefi bug bounty capital | Legal — Bug Bounty Program | $300,000 |
| Legal & securities advisory | Legal — Legal Advisory & Compliance | $72,000/yr |

- [!] **3.2** **The $320,000 development budget does not reconcile to the cost model.** The cost
      model books Development at **$250,000 in Year 1** ($200,000 app development + $50,000
      protocol integrations). The roadmap's engineering programme is $320,000.
      → Either the roadmap budget supersedes the cost model's Development line, or the two cover
      different scopes. **Owner decision — affects the Operating Cost Analysis and Business Plan.**
- [x] **3.3** The public security competition and its targeted re-audit appear in the roadmap
      exclusions but have **no line in the cost model at all**. Consistent with the Operating Cost
      Analysis finding that the security budget is booked only once, at launch.
- [ ] **3.4** Cross-link the merged document to the Operating Cost Analysis and Business Plan
      where budget and security spend overlap. No figure restated without its source named.

## 4 · Document architecture

Plain-language first, engineering depth second — the owner's explicit requirement.

- [ ] **4.1** `Abstract` — what is being built, on what foundation, in what window, at what cost.
- [ ] **4.2** `1 · The Roadmap in Brief` — **the non-technical view.** Three phases, twelve
      milestones, one timeline graphic, one table. Written so a reader with no engineering
      background can follow it end to end and stop here if they choose.
- [ ] **4.3** `2 · Starting Point` — what is already deployed (APSS, settlement dollar, pool) and
      what this programme adds. The pivot is an extension, not a rebuild; that is the single most
      important framing in the Milestone document and must survive the merge.
- [ ] **4.4** `3 · Delivery Principles` — the six guiding principles from the Technical roadmap,
      in full.
- [ ] **4.5** `4 · Phase 1: Foundation` — milestones M1–M3, then the four-layer deliverables.
- [ ] **4.6** `5 · Phase 2: Build` — milestones M4–M8, then the four-layer deliverables.
- [ ] **4.7** `6 · Phase 3: Audit and Launch` — milestones M9–M12, then the four-layer deliverables.
- [ ] **4.8** `7 · Audit and Security Strategy` — two rounds plus ongoing bounty, in full.
- [ ] **4.9** `8 · Development Budget` — all three cuts (workstream, workforce, phase) plus
      exclusions, with a chart for composition.
- [ ] **4.10** `9 · Schedule Risk` — the six conditions and their stated cost if unmet.
- [ ] **4.11** `10 · Scope Boundaries and Open Items` — §2.1, §2.2, §2.3, §2.4, §3.2.
- [ ] **4.12** `Legal Disclaimer` — forward-looking, matches the platform family.

## 5 · Completeness — nothing may be lost

The owner's requirement is explicit: do not miss any information.

- [ ] **5.1** All **12 milestones** present, each with its five sub-deliverables **and** its
      "Strategic outcome" line. The outcome lines are what make the document readable for
      non-technical stakeholders — none may be dropped.
- [ ] **5.2** All **4 layers × 3 phases = 12 deliverable blocks** present, every line item intact
      (~90 items). Technical specificity (Terraform, Slither, Certora, WCAG AA, Lighthouse ≥ 90,
      OpenTelemetry, HSM) is retained verbatim — it is evidence of rigour, not noise.
- [ ] **5.3** All **6 guiding principles** present in full.
- [ ] **5.4** All **3 budget tables** present, plus the 5 exclusions.
- [ ] **5.5** All **6 schedule-risk conditions** present with their buffers.
- [ ] **5.6** The 5 issuer strategic benefits from the Technical roadmap's opening table retained.
- [ ] **5.7** Automated completeness check: every milestone id (M1–M12), every phase, every
      workstream and every role name from the sources must appear in the rendered page.

## 6 · Voice and style

- [ ] **6.1** Whitepaper voice: specification not persuasion, ~21-word mean sentence,
      long-long-short cadence, antithesis openings, em-dash for mid-flow definition.
- [ ] **6.2** **Register split is deliberate.** Chapter 1 is plain language — short sentences, no
      unexplained jargon, every acronym expanded. Chapters 4–7 carry full engineering register.
      The transition is announced, as the whitepaper announces its own Litepaper boundary.
- [ ] **6.3** Every date, cost and duration carries its provenance. Source documents named in
      table captions.
- [ ] **6.4** Banned: revolutionary, seamless, robust, unlock, leverage (verb), best-in-class,
      world-class, cutting-edge.
- [ ] **6.5** Forward-looking language stays hedged — this is a plan, and the sources are careful
      to say so. Preserve that discipline.

## 7 · Graphics

Reuse the Business Plan's SVG chart engine and `base.css` components.

- [ ] **7.1** **Timeline graphic** — horizontal 25-week band, three phases, twelve milestone
      markers. This is the document's centrepiece and the thing a non-technical reader will
      actually use.
- [ ] **7.2** `.kpis` — weeks to mainnet, milestones, budget, team size, layers.
- [ ] **7.3** Donut — budget by workstream (8 slices, categorical ramp).
- [ ] **7.4** Bar — budget by phase.
- [ ] **7.5** Table — workforce allocation with duration and amount.
- [ ] **7.6** Table — schedule risk conditions and consequences.
- [ ] **7.7** Milestone cards — one per milestone, deliverables plus strategic outcome.
- [ ] **7.8** Verify light and dark rendering; verify print output.

## 8 · Build pipeline

Same contract as the other platform documents.

- [ ] **8.1** `scripts/gen-roadmap-content.py` — reads both .docx directly, emits
      `scripts/roadmap-content.json`. Reading the sources rather than transcribing them by hand
      is what makes §5.7 possible.
- [ ] **8.2** `scripts/build-roadmap.mjs` — reads `base.css`, reuses the Business Plan chart
      primitives, emits `public/bound-delivery-roadmap.html`.
- [ ] **8.3** `scripts/verify-roadmap.py` — asserts every milestone, phase, workstream, role and
      budget figure from both sources appears in the rendered page, and that the three budget
      cuts each total $320,000.
- [ ] **8.4** Sticky sidebar, `.sec-num` badges, masthead, print CSS — matching the family.

## 9 · Platform integration

- [ ] **9.1** New card in `DOCS`, [src/DocHub.jsx:78](src/DocHub.jsx#L78) —
      `key:"roadmap"`, `icon:"route"`, `tag:"Roadmap"`, `status:"available"`,
      `title:"Delivery Roadmap"`, `meta:"22–25 weeks · Confidential"` (pending §2.1).
- [ ] **9.2** Route in `openDoc`.
- [ ] **9.3** Verify card renders and routes in the running app.

## 10 · Verification and sign-off

- [ ] **10.1** `verify-roadmap.py` passes.
- [ ] **10.2** Completeness sweep per §5 — every item from both sources accounted for.
- [ ] **10.3** Budget cuts each total $320,000 in the rendered page.
- [ ] **10.4** No unresolved conflict from §2 left ambiguous in the text.
- [ ] **10.5** Chapter 1 read by the plain-language test: no unexplained acronym, no sentence
      requiring engineering knowledge.
- [ ] **10.6** Owner sign-off on §2.1, §2.2, §2.3, §3.2.

---

## Blocking decisions

| # | Decision | Why it blocks |
|---|---|---|
| 2.2 | Budget covers 22 weeks but delivery runs to week 25 — which is right? | Most material inconsistency; affects every budget statement |
| 2.3 | Render as **rwaUSD** (platform-current) or keep **BLD** (source)? | Affects every mention in the document |
| 2.1 | Lead with 22–25 weeks or 18–25 weeks? | Sets the headline timeline and the KPI strip |
| 3.2 | Does the $320k roadmap budget supersede the cost model's $250k Development line? | Affects the Operating Cost Analysis and Business Plan, both already published |

## Note on what these documents are

Both sources are **engineering plans for the RWA migration**, built on the already-deployed APSS
foundation. They are not a protocol specification and do not cover the index token or the
governance token. The merged document should say what it covers and what it does not, in the
first chapter, rather than leaving a reader to infer the boundary.
