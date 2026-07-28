# LP Staking — Impact Review

Proposed change: rewards are earned by **providing BND/USDC liquidity and staking the LP
token**, rather than by staking bare BND. Pool depth then grows with the reward programme.

**Review first. Nothing changed yet.**

---

## Part 1 · What the model does today

- [x] **1.1** `publicStaked` is a **bare BND stake**. Holders stake tokens; the tokens leave
      float; they earn emissions. Line 1568: `publicNewStake += newUnlocked[k] × (1 − soldFrac)
      × publicStakePct/100` — 20% of newly unlocked, unsold supply.
- [x] **1.2** Emissions are capped: `stakingBudget = community × 15%` — a carve-out of the
      Community allocation. `stakingEmission()` pays the target APY on the staked balance until
      the budget is exhausted, then stops. No new supply is minted.
- [x] **1.3** **Staking has no effect on the AMM.** `usdcReserve` and `bndReserve` are seeded
      once at line 1451–1452 and only move through trades. Nothing else touches them.
- [x] **1.4** Pool depth is therefore **fixed for the whole 36 months** at $1,000,000 a side —
      it never grows, no matter how much adoption the model assumes.

**That is the flaw your change fixes.** A protocol paying 10% APY to attract liquidity, in a
model where liquidity never arrives, understates its own pool and overstates its own price
impact.

---

## Part 2 · Everything the change touches

### 2.1 Directly rewritten

| Element | Line | Effect |
|---|---|---|
| `usdcReserve` / `bndReserve` | 1451–1452 | Become dynamic — grow as LPs join |
| `publicStaked` | 1568, 1580, 1608 | Becomes an **LP position**, not a bare token stake |
| `stakingEmission()` | 1408 | APY base changes — LP value, not BND count |
| `stakingBudget` | 1435 | Depletes faster or slower depending on the APY base |
| `floatSupply` | 1636 | BND inside LP positions is still out of float |

### 2.2 Consequences that follow

- [x] **Sell slippage falls.** Line 1534: `sellUsdOut = usdcReserve × tokensSold × 0.997 /
      (bndReserve + tokensSold)`. A deeper pool means the same sell recovers more USDC and moves
      price less. **This is the largest single effect on results** — every cohort's realised exit
      price improves.
- [x] **Buy impact falls symmetrically.** Line 1601 — the Burn Engine's buybacks purchase fewer
      tokens per dollar in a deep pool. **Burn effectiveness goes down.** This cuts against the
      Burn Engine and must be shown, not hidden.
- [x] **Price becomes less volatile in both directions.** `price = usdcReserve / bndReserve`.
- [x] **The month-12 depth warning changes.** Line 1930 flags TGE float exceeding 3× pool depth.
      A growing pool will silence a warning that is currently firing — make sure it is silenced
      because the risk fell, not because the test drifted.
- [x] **Investor ROI tables move.** Realised sell proceeds are computed at the blended AMM
      execution price, so every cohort's return changes.
- [x] **xBND Revenue Switch moves** — distributions are pro-rata by locked value, which is
      price-dependent.

### 2.3 Documents that consume these numbers

- [x] **Business Plan** — no direct dependency; it uses the protocol engine, not tokenomics
- [x] **Operating Cost Analysis** — none
- [!] **Go-to-Market Strategy** — none today, but a liquidity-mining programme is a GTM
      instrument and should appear there
- [!] **Whitepaper** — describes BND as governance-and-fees. If holding BND now also earns
      through an LP programme, the token's utility description needs a line
- [!] **BND Token Economic Audit** — reads directly from this engine; every figure moves

---

## Part 3 · The economics that must be modelled honestly

This is where a naive implementation would flatter the protocol.

### 3.1 An LP position is half USDC — and that USDC has to come from somewhere

- [x] To provide $100 of BND/USDC liquidity a participant supplies **$50 of BND and $50 of
      USDC**. The BND they may already hold. **The USDC they do not.**
- [!] Two sources, with opposite effects:
      - **Outside capital** — new USDC entering. Genuinely deepens the pool. The good case.
      - **Selling BND to raise USDC** — sell pressure that partly offsets the deepening.
- [ ] **The model must carry an explicit assumption for the split.** Assuming 100% outside
      capital would be the single most flattering unstated assumption in the tokenomics.

### 3.2 Rewards are paid on LP value, not on BND count

- [x] A staker with $100 of LP earns the target APY on $100 — but only $50 of that is BND. So
      the same emission budget supports **roughly half the "staked BND" it does today**, or the
      same BND supports twice the rewarded value.
- [!] Decide the base: APY on **total LP value** (market standard) or on **the BND side only**
      (cheaper, less attractive). This directly sets how fast the 15% Community carve-out burns.

### 3.3 Impermanent loss is a real deterrent

- [x] At a 10% target APY on a volatile pair, IL can exceed rewards in a drawdown. LP
      participation should be **lower** than bare-staking participation, not higher.
- [ ] Recommend defaulting LP participation **below** the current 20% bare-stake rate, and
      stating IL as a named risk rather than assuming rational participation.

### 3.4 The programme sunsets

- [x] The staking budget is capped and hard-stops. **When emissions end, the incentive to remain
      an LP ends with them.** A model that grows the pool and never shrinks it is wrong.
- [ ] Liquidity must be allowed to **withdraw** when rewards stop, at a stated rate.

---

## Part 4 · Proposed model

Five parameters, each an explicit assumption rather than a hidden one.

| Parameter | Proposed default | Rationale |
|---|---:|---|
| **LP participation** | 12% of unlocked, unsold supply | Below the 20% bare-stake rate, reflecting IL risk |
| **Outside USDC share** | 60% | Majority new capital; 40% sourced by selling BND |
| **APY base** | Total LP value | Market standard; the honest, more expensive choice |
| **LP exit rate after sunset** | 8% a month | Liquidity leaves when rewards stop |
| **Reward lock** | LP tokens staked, BND side out of float | Matches today's float treatment |

### Mechanics per month

1. Eligible holders LP a share of newly unlocked, unsold supply
2. Their BND enters `bndReserve`; matching USDC enters `usdcReserve`
3. The USDC not sourced from outside is raised by **selling BND into the pool** — added to
   `tokensSold` before the sell trade clears
4. Emissions accrue on total LP value at the target APY, from the capped budget
5. When the budget is exhausted, LP positions withdraw at the exit rate, removing both sides

---

## Part 5 · What to watch after the change

- [ ] **5.1** Burn Engine effectiveness will fall. Confirm the fall is proportionate and not a
      sign the pool has been over-deepened.
- [ ] **5.2** Investor IRR will rise across every cohort, purely from lower slippage. That is
      real, but it should not be presented as a return improvement — it is a liquidity
      improvement.
- [ ] **5.3** The month-12 depth warning should stop firing. Verify it stops for the right
      reason.
- [ ] **5.4** If the pool grows beyond roughly $10M a side by month 36, the participation rate
      is almost certainly too high — sanity-check against the 12% of supply in the Liquidity &
      MM allocation.
- [ ] **5.5** Re-read the results page end to end. Every number on it moves.

---

## Part 6 · Decisions

| # | Decision | Default proposed | Effect if wrong |
|---|---|---|---|
| 1 | LP participation rate | 12% | Sets pool growth; the single biggest lever |
| 2 | Outside USDC share | 60% | Too high flatters price; too low overstates sell pressure |
| 3 | APY base — LP value or BND side | LP value | Halves or doubles the programme's duration |
| 4 | Exit rate after sunset | 8%/month | Whether the pool is permanent or rented |

---

## Assessment

**The change is correct and the current model is wrong without it.** A protocol that pays to
attract liquidity, modelled with liquidity that never arrives, understates its own depth and
overstates its own price impact.

Two cautions. It **improves almost every headline number** — deeper pool, less slippage, better
investor returns — so it must be implemented with the honest assumptions in Part 3, or it
becomes a way of making the model look better rather than truer. And it **cuts against the Burn
Engine**, which buys fewer tokens per dollar in a deep pool. That trade-off should be visible on
the page, not buried.
