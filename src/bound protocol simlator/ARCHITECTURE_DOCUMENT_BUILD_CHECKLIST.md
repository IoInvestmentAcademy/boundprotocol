# Smart Contract Architecture — Build Checklist

Conversion of `BOUND Smart Contract Architecture - Overview (1).pdf` into a platform document:
**BOUND Protocol — Smart Contract Architecture**, in whitepaper voice.

Status: `[ ]` not started · `[x]` done · `[!]` needs owner decision

---

## 1 · Source review (complete)

- [x] **1.1** Four pages, ~4,050 characters of text, one embedded architecture diagram.
      Eight numbered sections: executive summary, system architecture, security and access
      control, fee structure, protocol integrations, recent changes, current status, capabilities.
- [x] **1.2** Six contracts documented, with the dependency graph recovered from the diagram:

| Contract | Role | Connects to |
|---|---|---|
| `BOUND.sol` | Main ERC20 token | Hook (bidirectional), Calculator |
| `BOUNDHook.sol` | Price monitoring, Uniswap V4 hook | Token (bidirectional), Exchange |
| `BOUNDCalculator.sol` | Financial calculations | Token, BAMS (bidirectional), Staked token |
| `BAMS.sol` | Asset management system | Calculator (bidirectional) |
| `BOUNDExchange.sol` | Token conversion | Hook |
| `SBOUNDToken.sol` | Staked/index token | Calculator |

- [x] **1.3** **The source diagram has a rendering defect**: the labels `BOUNDCalculator.sol` and
      `BOUNDExchange.sol` both overflow their boxes. The rebuild fixes this rather than
      reproducing it.
- [x] **1.4** **This document describes the pre-RWA baseline.** There is no RWA registry, no
      haircut engine, no issuer onboarding and no governance token in scope. That is not a gap —
      it is precisely the "APSS system already deployed" that the Delivery Roadmap extends, and
      positioning it that way is what makes the document useful.

## 2 · Conflicts with the current document set

- [!] **2.1** **Token naming is the retired architecture**, exactly as in the roadmaps:

| Source | Current platform naming |
|---|---|
| `BOUND.sol` — main token | **rwaUSD** — settlement dollar |
| `SBOUNDToken.sol` / sBOUND | **BLI** — Bound Liquidity Index |
| `BOUNDExchange.sol` — BOUND ↔ sBOUND | the rwaUSD ↔ BLI converter |
| `reservePlus` | **Emergency Reserve** |

      Recommend the same treatment applied to the Delivery Roadmap: render prose in current
      naming, **but keep contract filenames verbatim** — `BOUND.sol` is the deployed artefact's
      actual name and renaming it would make the document wrong for any engineer reading it
      against the repository. **Owner decision.**

- [!] **2.2** **Fee conflict.** The source states an exchange fee of **0.3%** on BOUND ↔ sBOUND
      conversions. The whitepaper and simulator price the rwaUSD ↔ BLI conversion at
      **0.88%**, discounted to **0.44%** when paid in BND, and use **0.3%** for the *private
      mint/redeem* fee — a different operation.
      → Either the contract implements a rate the economic model does not, or the source labels
      the mint/redeem fee as an exchange fee. **This must be resolved before publication; it is a
      published-number contradiction, not a wording choice.**

- [!] **2.3** **Integration set does not match.** The source names Morpho V2, Enzyme, Universal
      Router and LiFi. The whitepaper's Liquidity Layer names **Aave** and **Morpho**; the
      simulator configures `aaveYield`, `morphoYield` and `enhancedYield`.
      → Is Enzyme the "enhanced strategies" tier? Is Aave integrated but undocumented here, or
      planned rather than live? **Owner decision.**

- [!] **2.4** **Networks are stated here and nowhere else.** Base primary, Polygon secondary,
      Ethereum for cross-chain. The whitepaper is silent on deployment chain. The prior business
      plan referenced transactions on Ethereum. Confirm before publishing a deployment claim.

- [x] **2.5** "Contribution-based fair launch" appears in no current document and describes a
      launch mechanism the tokenomics model does not use. Flag rather than carry forward.

- [x] **2.6** LiFi cross-chain execution appears nowhere else in the document set. It materially
      widens the trust surface and belongs in the risk framing if it is live.

## 3 · Evidential discipline

The source is thin — roughly 4,000 characters for a full architecture. The whitepaper voice
invites expansion, and expansion here is dangerous.

- [ ] **3.1** **No contract-level claim may be written that is not in the source PDF.** No
      inferred function names, no assumed call paths, no invented invariants.
- [ ] **3.2** Context may be drawn from the whitepaper and Delivery Roadmap **with the source
      named in the text**, so a reader can always tell architecture fact from protocol context.
- [ ] **3.3** Where the source is silent — test coverage figures, audit status, contract
      addresses, deployment dates — say so explicitly in the limits chapter rather than filling
      the gap.
- [ ] **3.4** "Comprehensive coverage across modules" and "fully functional" are the source's
      own characterisations, not measurements. Attribute them; do not restate them as fact.

## 4 · Document architecture

- [ ] **4.1** `Abstract` — what the deployed system is, what it does, what it does not yet cover.
- [ ] **4.2** `1 · System Architecture` — the six contracts and the dependency graph, with a
      rebuilt diagram.
- [ ] **4.3** `2 · Component Reference` — one section per contract, responsibilities verbatim.
- [ ] **4.4** `3 · Access Control` — four access levels and the four core modifiers.
- [ ] **4.5** `4 · Fee Structure` — including the §2.2 conflict, stated openly.
- [ ] **4.6** `5 · Protocol Integrations` — five integrations, three networks.
- [ ] **4.7** `6 · Relationship to the RWA Migration` — how this baseline maps onto the Delivery
      Roadmap's twelve milestones. **This chapter is why the document earns a place in the hub.**
- [ ] **4.8** `7 · Status and Recent Changes` — five changes, five status lines, attributed.
- [ ] **4.9** `8 · Limits and Open Items` — §2.2, §2.3, §2.4, §3.3.
- [ ] **4.10** `Legal Disclaimer`.

## 5 · Graphics

- [ ] **5.1** Rebuild the core architecture diagram as inline SVG — six nodes, correct edge
      directions, no overflowing labels. Bidirectional edges where the source shows them.
- [ ] **5.2** Layer diagram: integrations and networks.
- [ ] **5.3** Table — access level against permitted operations.
- [ ] **5.4** Table — contract to roadmap milestone mapping (Chapter 6).
- [ ] **5.5** Light and dark verified; print checked.

## 6 · Build and integration

- [ ] **6.1** `gen-architecture-content.py` reads the PDF directly (pypdf), so the verify script
      can prove completeness against source.
- [ ] **6.2** `build-architecture.mjs` reusing the shared chart primitives and `base.css`.
- [ ] **6.3** `verify-architecture.py` — asserts all six contracts, four access levels, four
      modifiers, five integrations and three networks appear in the rendered page.
- [ ] **6.4** Card in `DOCS` — `key:"architecture"`, `icon:"shield"` or `book`,
      `tag:"Reference"`; route in `openDoc`; verified in the app.

---

## Blocking decisions

| # | Decision | Why it blocks |
|---|---|---|
| 2.2 | Is the conversion fee 0.3% or 0.88%/0.44%? | Direct contradiction between the contract doc and the published whitepaper and simulator |
| 2.1 | Rename tokens in prose but keep contract filenames verbatim? | Affects every reference in the document |
| 2.3 | Is Enzyme the "enhanced" tier? Is Aave live? | Determines whether the integration list can be reconciled to the Liquidity Layer |
| 2.4 | Confirm Base / Polygon / Ethereum deployment claim | It is a factual claim about live infrastructure appearing nowhere else |

## Note on the incoming set

You mentioned further documents. The pipeline built here — source-parsing generator, shared
chart primitives, completeness-checking verifier, hub card — is reusable for each. The pattern
that has held across the last four documents is worth keeping: review first, resolve conflicts
against the published set explicitly, and let the verifier prove nothing was lost.
