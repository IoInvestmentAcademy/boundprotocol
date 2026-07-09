# BOUND Protocol Simulator v7

Interactive financial simulator for BOUND Protocol — BCI index price, liquidity layer, RWA markets, and revenue allocation.

## Setup

```bash
npm install
npm run dev:fresh
```

Open **http://127.0.0.1:5239/** (canonical — see [HANDOFF.md](./HANDOFF.md) if the port differs).

## Build

```bash
npm run build
npm run preview
```

## Handoff

See **[HANDOFF.md](./HANDOFF.md)** for full architecture notes, scenario definitions, and a testing checklist for external review.

## Main file

All simulation logic and UI live in `src/BoundSimulator.jsx`.
