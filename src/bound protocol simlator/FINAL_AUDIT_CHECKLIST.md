# BOUND Platform — Final Pre-Publication Audit

Every item is checked against source, not against another document. A figure that
appears in two documents is verified twice, independently, and then compared.

## A · Asset inventory

| # | Check | Method |
|---|---|---|
| A1 | Every card in the Documentation hub resolves to a file or a route | HTTP status on each URL |
| A2 | Every file under `public/` is reachable from the hub, or is deliberately unlinked | Set difference |
| A3 | No card points at a file that does not exist | 404 sweep |
| A4 | Deliberately unlinked material (internal tier) stays unlinked | Grep hub for `/legal/internal/` |

## B · Build freshness

| # | Check | Method |
|---|---|---|
| B1 | Each `public/*.html` is newer than its generator, its content JSON, and `base.css` | mtime comparison |
| B2 | `sim-default.json` is newer than `BoundSimulator.jsx` — the feed reflects current engine defaults | mtime + regeneration diff |
| B3 | Regenerating `sim-default.json` produces no change | Byte comparison against a fresh dump |
| B4 | Every document that cites tokenomics figures was rebuilt after the LP-staking and Extended Seed changes | mtime vs. `BoundSimulator.jsx` |

## C · Verifier suite

| # | Check |
|---|---|
| C1 | `verify-whitepaper.py` |
| C2 | `verify-architecture.py` |
| C3 | `verify-market.py` |
| C4 | `verify-competitors.py` |
| C5 | `verify-costs.py` |
| C6 | `verify-businessplan.py` |
| C7 | `verify-gtm.py` |
| C8 | `verify-roadmap.py` |
| C9 | `verify-invariants.mjs` — engine identities |
| C10 | Audit scripts: conservation, BCI/SC identities, PR/ER identities, AnnG decomposition, participant economics |

## D · Simulator feed integrity

| # | Check | Method |
|---|---|---|
| D1 | Default-case revenue in the feed equals the sum of its ten streams, all 36 months | Identity assertion |
| D2 | Figures quoted in documents match the feed exactly, not approximately | String presence at full precision |
| D3 | The horizon is 36 months for protocol figures and 24 for operating-company figures, never mixed | Grep for horizon claims |
| D4 | Tokenomics defaults in `BoundSimulator.jsx` match those the audit report parses | Parse comparison |

## E · Cross-document consistency

Figures and claims that appear in more than one document must agree. Each is
derived from source once, then located in every document that cites it.

| # | Fact | Documents that must agree |
|---|---|---|
| E1 | Total supply and allocation percentages | Tokenomics audit, Business Plan, Whitepaper |
| E2 | Round prices, raises, cliffs and vesting | Tokenomics audit, Business Plan, SAFT |
| E3 | 36-month protocol revenue | Business Plan, GTM, Cost Analysis |
| E4 | Operating cost base and the marketing total | Cost Analysis, Business Plan, GTM |
| E5 | OpCo funding, runway and the 24-month horizon | Cost Analysis, Business Plan |
| E6 | Entity names, jurisdictions and roles | Every document, hub, legal opinions |
| E7 | Token names — rwaUSD and BLI, never the legacy names | Every document |
| E8 | Network — Ethereum primary | Architecture, Whitepaper, Roadmap |
| E9 | Pool split and burn-engine seed | Tokenomics audit, Business Plan |
| E10 | Development budget and delivery window | Roadmap, Business Plan, Cost Analysis |

## F · Messaging discipline

| # | Check |
|---|---|
| F1 | No claim that yield rises with scale | Enforced by `verify-gtm.py` |
| F2 | Protocol revenue is never netted against operating cost | Enforced by `verify-costs.py` |
| F3 | No legacy token names anywhere | Grep sweep |
| F4 | No placeholder text left in any rendered document | Grep for `TODO`, `TBD`, `[●]`, `XXX`, `Lorem` |

## G · Application

| # | Check |
|---|---|
| G1 | Production build succeeds with no errors |
| G2 | No console errors on the hub, the simulator, or the tokenomics page |
| G3 | Navigation labels are consistent — Simulator, Library |
| G4 | Export renders both halves and hides all controls |
| G5 | Engine reference opens from the Simulator and returns there |
