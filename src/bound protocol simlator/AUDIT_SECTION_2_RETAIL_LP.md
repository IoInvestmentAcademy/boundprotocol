# Section 2 Audit — Retail Liquidity Providers (Pool)

**Status: the owner's suspicion was CORRECT. One critical money-conservation bug found in
the engine, fixed, and now guarded by a new invariant (S20).** Checklist per
`AUDIT_CHECKLIST_TEMPLATE.md` filled in at the bottom.

---

## 1. Logic, in plain English

Retail LPs are public users who enter through the **Uniswap v4 rwaUSD/USDC pool** (never
the direct contract). Each month:

**On entry (buy):**
1. Pool trading volume grows on a compounding schedule (a fresh start value at
   `poolStart`, then Y1–Y5 monthly growth rates, capped at $200M/month).
2. The buyer spends that volume in USDC. The **pool fee** (0.3%) is taken inside the swap
   — the rwaUSD they actually receive is net of it. (APSS is protocol arbitrage capture
   around the peg — it is *not* deducted from the buyer's principal, by design.)
3. Of the received rwaUSD, the **Retail BCI Conversion Rate** (98%) converts to BCI; the
   remaining 2% stays as idle rwaUSD in Bound Core.
4. The converting amount pays the **conversion fee** (0.88%, or the BND-discounted rate);
   what's left lands in the Liquidity Layer as retail LP capital.

**On exit (sell):**
1. Each month, `retailOutflowRate` (5%) of the retail Layer balance exits — retail is
   NOT subject to the private 6-month lock (pool users can always sell).
2. The exiting amount pays the conversion fee (BCI → rwaUSD leg); the **net** rwaUSD is
   then sold on the pool, generating sell-side pool volume (and pool/APSS fees).

## 2. The bug that was found (why your numbers looked wrong)

The engine put the **gross** converting amount into the Layer *and* credited the
conversion fee on that same amount to BCI SC as revenue — the same dollars counted twice,
inflating **both** terms of `BCI Price = (Layer NAV + BCI SC) / Supply`. Two smaller
variants of the same problem: the pool fee wasn't deducted from the buyer's received
rwaUSD, and the exit sell volume ignored the exit conversion fee (inflating pool/APSS
revenue). The private path already did all three correctly — retail simply never got the
same treatment.

**Budget test that exposes it:** every dollar a buyer brings must land in exactly one
bucket. Private already satisfied `lpIn = mintFee + convFee + toLayer + toBoundCore`.
Retail's buckets summed to MORE than the buyer's money. Fixed; now enforced every month
by invariant **S20**.

**Impact of the fix (3-market default):** M36 annG 9.42% → **9.34%**; M12 8.26% → 8.08%.
That ~0.1–0.2pp was phantom revenue.

## 3. Formulas (engine, `simulate()`) + worked example — M12, Default preset, engine-verified

```
retailPoolVol      = compounding schedule            = $214,990.85
retailPoolFeeEntry = 214,990.85 × 0.3%               = $644.97      → pool fee (80/20 BCI/PR)
retailRwaUSDRecv   = 214,990.85 − 644.97             = $214,345.88
convAmountRetail   = 214,345.88 × 98%                = $210,058.96
retailConvFeeEntry = 210,058.96 × (1−30%) × 0.88%    = $1,293.96    → 100% BCI SC
retailToLayer      = 210,058.96 − 1,293.96           = $208,764.99  → Liquidity Layer
retailBoundCore    = 214,345.88 × 2%                 = $4,286.92    → Bound Core idle

Budget: 644.97 + 1,293.96 + 208,764.99 + 4,286.92 + ... = $214,990.85 ✓ (to the cent)

Exit:  retailLayerOut = $35,310.91 (5% of prior balance)
       exit conv fee  = 35,310.91 × 70% × 0.88% = $217.51
       retailExitSellVol = 35,310.91 − 217.51   = $35,093.40  → sold on pool
```

## 4. Cross-reference map — consumers of retail data (all re-verified AFTER the fix, per D4)

| Field | Consumer | Verdict |
|---|---|---|
| `retailToLayer` | Layer waterfall, BCI mint, Protocol Capital Flows, BCI Price table ("Retail pool to Layer") | ✅ all read the engine field — automatically correct post-fix |
| `retailBoundCore` | Bound Core (`newToBoundCore`), Protocol Capital Flows | ✅ updated to net-of-pool-fee base |
| `retailExitSellVol` | `pVol` → pool/APSS revenue; retail exit fee fields; Protocol Capital Flows | ✅ now net of exit conv fee |
| `retBuy*/retExit*` fee fields | Retail LP fee tables, Participant Economics fee drag | ✅ single-sourced |
| `retailConvFeeEntry` | `bci_conv` aggregate (with private entry/exit + retail exit) | ✅ replaced the stale gross-based term |
| `retailPoolFeeEntry` (new) | S20 budget invariant | ✅ |

## 5. Other findings this section

1. **Retail fee tables trimmed to 3 years** (engine horizon), year selectors now 1–3.
2. **Dead code (C6 — owner decision needed, not deleted):** `poolVolumeTableData` and
   `poolVolumeFull` are computed on every render but rendered NOWHERE — same orphan family
   as the `KPI` component and `yc` benchmark dataset found in the plan phase. Also the
   preset field `retailSellRate: 20` is read by nothing.
3. `bciAnnualYield` is computed in both LP fee-table builders but never displayed
   (pre-existing; same C6 list).

## 6. Checklist (AUDIT_CHECKLIST_TEMPLATE v1)

- A1–A4 ✅ (coupling: BND-usage slider affects retail conv fees too — documented in §1)
- B1–B4 ✅ (retail slider hints checked against the NEW flow; all still accurate)
- C1 ✅ (bug was in the ENGINE this time, not a UI recompute — tables were correctly
  single-sourced and healed automatically once the engine was fixed)
- C2 ✅ trimmed · C3 ✅ (year props verified after last review's MNaN fix) · C4 ✅ ·
  C5 ✅ (fee reference card already present) · C6 ⚠ flagged, owner to rule
- D1–D4 ✅ (all consumers re-verified post-fix)
- E1–E6 ✅ — build clean; **S20 added** (would fail on the old engine); S1–S19 pass;
  M12 hand-verify extended with the retail chain + budget check (30 values, all match);
  conservation tie-outs pass; scope note: M12 deep, months 1–36 structural.
- F1 ✅ this doc · F2 owner sign-off obtained — Section 2 closed.

---

## Changelog — actions taken after Section 2 close, before Section 3 opened

Per owner instruction, every action taken outside a section's own audit scope is logged
here until Section 3's document exists to take over that role.

### 1. Default preset — Retail LP sliders reset to owner-specified values
Owner supplied a screenshot of desired Retail LP defaults. Changed in `PRESETS.default`:

| Field | Old | New |
|---|---|---|
| `poolInitialVolume` | $50,000 | **$200,000** |
| `poolGrowthY1`–`Y5` | 20/10/6/4/2% | **7/3/3/2/1%** |
| `retailOutflowRate` | 5% | **8%** |
| `bndUsage` | 30% | **10%** |

`bndUsage` is the shared slider (also drives Private LP's BND conversion path — flagged
to the owner at the time). Verified: build clean, all invariants pass, M12 hand-verify
matched **after fixing a bug this exposed** — `scripts/hand-verify-m12.mjs` had the pool
growth rate (20%) hardcoded instead of reading `p.poolGrowthY1..Y5`; it silently matched
before only because the old default happened to equal the hardcoded value. Fixed to read
the actual per-year rate via the engine's own year-index formula. Conservation audit
re-passed. New headline: M12 annG 8.80%, M36 annG 9.61% (3-market default).

### 2. Default preset — Private LP sliders reset to owner-specified values
Second screenshot, Private LP section. Changed in `PRESETS.default`:

| Field | Old | New |
|---|---|---|
| `initPrivateLp` | $2,000,000 | **$3,200,000** |
| `privateBCIConversion` | 95% | **98%** |
| `convFeeRwaUSD` | 0.88% | **0.89%** |

Flagged to owner: Private and Retail BCI Conversion Rate are now both 98% — Section 1's
audit had treated the prior 95%/98% split as a deliberate design choice (private LPs
retain more idle rwaUSD); worth confirming this convergence is intentional. Verified:
build clean, all invariants pass, M12 hand-verify matches, conservation audit passes.
New headline: M12 annG 8.42%, M36 annG 9.40% (3-market default).

### 3. Ten RWA markets added (was 3), staggered M1–M28 over the 3-year horizon
Per owner request to reflect "onboard 10 markets over 3 years." Kept the 3 existing
markets (OUSG M1, BUIDL M4, Private Credit/Figure M7) and added 7 more, each launching
~3 months apart through M28, leaving M29–36 as a steady-state period with all 10 live:

| # | Market | Launch | AUM | Category |
|---|---|---|---|---|
| 4 | Money Market / Franklin Templeton (BENJI) | M10 | $320M | Money Market |
| 5 | Real Estate / Homebase | M13 | $95M | Real Estate |
| 6 | Private Credit / Apollo | M16 | $250M | Private Credit |
| 7 | Short Treasury / WisdomTree | M19 | $150M | Treasury |
| 8 | Tokenized Gold / Paxos | M22 | $120M | Commodities |
| 9 | Trade Finance / Centrifuge | M25 | $75M | Trade Finance |
| 10 | Municipal Bonds / Republic | M28 | $60M | Municipal |

Each got category-appropriate risk parameters (haircut, liq rate, redemption days, trade
fee) rather than copying an existing market's numbers. Diagnostic run
(`scripts/diagnose-10-markets.mjs`, new script) before reporting back: 0 EMERGENCY
months, 3/36 WARNING, revenue grows steadily to $5.35M cumulative PR by M36, annG reaches
9.1%. **Not yet resolved, deferred to Section 3 (owner explicitly asked to hold the audit
until markets were added first):** the displayed "RWA Collateral %" concentration metric
runs 50–65% once several markets are live, well above the 20% cap — suspected cause is
the display conflating actual held RWA inventory (correctly capped) with cash sitting in
the issuer-redemption pipeline (not RWA, but currently added into the same displayed
figure). Flagged, not fixed — this is exactly what Section 3's audit needs to resolve
properly rather than a quick patch now.

### 4. Section renamed
"RWA Users - Liquidation & Minting" → **"RWA Markets - Liquidation & Minting"** (plus the
two inline references to "RWA Users" in the section's body text), reflecting that the
section now manages 10 distinct market/issuer configurations rather than a generic
"users" framing. Owner delegated the exact naming choice.

### 5. Documentation sweep (this entry)
Owner asked for a full check that every action taken has been recorded somewhere. Found
one gap: the "MNaN" table-header bug (Totals `FeeTable` calls missing the `year` prop,
found and fixed during the independent review of Section 1) had been fixed in code but
never written into a doc. Added retroactively to `AUDIT_SECTION_1_SIGNOFF.md` (see that
file's new Addendum). Also found `HANDOFF.md` and `VERIFICATION_REPORT.md` had gone stale
relative to the current section-by-section audit process — both updated (see their own
change history / a pointer added at the top of `VERIFICATION_REPORT.md`).
