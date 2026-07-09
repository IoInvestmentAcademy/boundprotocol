# Section 1 Audit — Private Liquidity Providers

**Status: FIXED, then extended per owner follow-up.** The parallel-simulation bug in §4 is
resolved — the table now reads `lpIn` / `privateLayerOut` / `privateLayerBal` straight from
the engine, a description card was added above the table explaining each row, and the four
Private LP sliders got clearer, more complete hints ("Monthly Outflow" was renamed from
"% of Private Capital" to "% of Layer Balance" since that's what it actually multiplies).
Owner kept the all-years-stacked table layout rather than a year-selector.

**Follow-up round (owner-directed):**
1. The three Fee sliders were stretched to a spacer column that made them narrower than
   the row above — fixed to match width exactly (4 equal columns both rows).
2. The 6-month lock, initially removed as a fabricated UI-only artifact, turned out to be
   **real, missing engine logic** — the owner confirmed Private LP capital is genuinely
   locked for the first 6 months (no exits at all), Retail LP unaffected. Implemented in
   the engine itself: `privateLayerOut = m > lockPeriod ? privateLayerBal × lpOutflow% : 0`
   (`lockPeriod` reads the preset's existing `lockPeriod: 6` field, previously dead). New
   invariant **S19** confirms zero exits/exit-fees in months 1–6, exits resume exactly at
   month 7, and retail is untouched.
3. **Cross-cutting finding while investigating "why is there no Year 4/5 data":** the
   engine only ever simulates 36 months (3 years) — `MONTHS = 36` — yet 14 different
   tables across the whole app are structured for 60 months (5 years). Years 4–5 have
   never had real data anywhere in the app. Owner chose to trim tables to match the
   engine's actual 3-year horizon rather than extend the engine to 5 years. Applied to
   this section's two tables (Private Capital Allocation, Private LP fee tables) now;
   the other 12 will get the same trim when their sections come up in the audit. Also
   fixed a real display bug this surfaced: the capital table's column headers said
   "M1–M12" for every year block even though Year 2/3 data is months 13–24/25–36 — each
   year now gets its own correctly-numbered header row.

## 1. Logic, in plain English

Private LPs are institutional depositors who transact **directly with the protocol
contract** (never touching the AMM pool). Each month:

**On entry (new deposit):**
1. An LP deposits USDC. Month 1 gets the one-time seed allocation *plus* the recurring
   monthly growth; every month after just gets the monthly growth.
2. A **mint fee** (default 0.3%) is taken off the top of the full deposit.
3. Of what's left, a **conversion rate** (default 95%) converts into BCI; the remainder
   stays as idle rwaUSD in Bound Core (this is the "keep some liquid, convert the rest"
   choice the slider hint describes).
4. The converting portion pays a **conversion fee** (default 0.88%, or 0.44% if paid in
   BND — BND path is 100% burned, credited to nobody). What's left after that fee is the
   actual USDC that lands in the Liquidity Layer.

**On exit (monthly redemption):**
1. Each month, a fixed percentage of the LP's current Layer balance exits (the "Monthly
   Outflow" slider, default 2.5%/month of *balance*, not of original deposit).
2. That exiting amount pays the conversion fee again (BCI → rwaUSD leg).
3. What's left after that pays the **redeem fee** (same 0.3% rate as mint) on the way out
   to USDC.

**Important cross-section coupling:** the BND-usage rate (what % of conversions get paid
in BND for the 50% discount) is **one shared global slider**, physically located in the
*Retail* LP section ("BND Discount Usage %"), but it applies to Private LP conversions
too. If you're checking Private LP numbers and something doesn't add up, check that
slider — it's not a Private LP setting even though it affects Private LP fees.

## 2. Formulas (exact engine code, `simulate()` in `BoundSimulator.jsx`)

```
// Entry
lpIn              = month 1 ? (seed + growth) : growth
mintFeeRevenue    = lpIn × mintRedeemFee%                      // e.g. 0.3%
rwaUSDReceived    = lpIn − mintFeeRevenue
convAmountEntry   = rwaUSDReceived × privateBCIConversion%      // e.g. 95%
convFeeEntry      = convAmountEntry × (1 − bndUsage%) × convFeeRwaUSD%   // e.g. 0.88%
privateToLayer    = convAmountEntry − convFeeEntry              // → Liquidity Layer
privateBoundCore  = rwaUSDReceived × (1 − privateBCIConversion%) // → Bound Core

// Exit — lpOut = privateLayerOut = privateLayerBal × lpOutflow%  (this month's balance, not original deposit)
convFeeExit       = lpOut × (1 − bndUsage%) × convFeeRwaUSD%
rwaAfterConvExit  = lpOut − convFeeExit
redeemFeeRevenue  = rwaAfterConvExit × mintRedeemFee%

// Fee destinations (all sourced once, reused everywhere — see §3)
privMintBCI   = mintFeeRevenue × 20%       privMintPR   = mintFeeRevenue × 80%
privConvInBCI = convFeeEntry (× 100%)      privConvInBND = convAmountEntry × bndUsage% × convFeeBND%
privConvOutBCI= convFeeExit (× 100%)       privConvOutBND= lpOut × bndUsage% × convFeeBND%
privRedeemBCI = redeemFeeRevenue × 20%     privRedeemPR = redeemFeeRevenue × 80%
```

**Sign-off checks you can do by hand:** pick any month, take `p.lpGrowth` from the
slider, and walk the Entry formulas top to bottom — each intermediate value appears
in the Private LP fee tables so you can check your arithmetic step by step.

### Worked example — Month 12, Default preset ($500,000 monthly growth, verified against the live engine)

```
lpIn              = $500,000                              (month > 1, so just the growth)
mintFeeRevenue    = $500,000 × 0.3%   = $1,500
rwaUSDReceived    = $500,000 − $1,500 = $498,500
convAmountEntry   = $498,500 × 95%    = $473,575
convFeeEntry      = $473,575 × (1 − 30%) × 0.88%  = $2,917   (30% is the shared BND-usage default)
privateToLayer    = $473,575 − $2,917 = $470,658            → enters the Liquidity Layer
privateBoundCore  = $498,500 × 5%     = $24,925              → enters Bound Core, idle

// Fee destinations from this month's ENTRY alone:
privMintBCI  = $1,500 × 20% = $300        privMintPR = $1,500 × 80% = $1,200
privConvInBCI = $2,917 (100% — the rwaUSD-path share of the fee)
privConvInBND = $473,575 × 30% × 0.44% = $625   (informational — burned, credited nowhere)
```

The M12 exit-side numbers depend on the Layer balance built up over the prior 11 months
(`privateLayerOut = privateLayerBal(M11) × 2.5%`), so they're not hand-computable from a
single month's inputs alone — that's exactly what the "Remaining" row in the Private
Capital Allocation table is for: it shows you `privateLayerBal` each month so you can
chain this same entry formula forward yourself, month by month, and cross-check.

## 3. Cross-reference map — where else this data appears

| This section's output | Also appears in | As field/label |
|---|---|---|
| `privateToLayer`, `privateLayerOut` | Liquidity Layer (waterfall input) | `layerPostUpdate` calc |
| `privateBoundCore` | Bound Core Reserve | part of `newToBoundCore` |
| `privMintBCI/PR`, `privConvIn/OutBCI/BND`, `privRedeemBCI/PR` | BCI SC Revenue chart & table | rolled into `bci_entry`, `bci_conv` |
| (same) | Protocol Reserve Revenue chart & table | rolled into `pr_entry` |
| `privateLayerBal` | BCI Price Mechanics | `layerNav` term in `bciPrice = (layerNav + bciSC) / supply` |
| `privateLayerBal` | Layer Composition + LCR table | part of `Total Layer` |
| `privateLayerBal`, fees paid | Participant Economics | "Net Yield" fee-drag calculation |

Note: `bci_entry`/`pr_entry` **blend** Private LP's mint+redeem fees together with a
third, unrelated source (pre-pool RWA redemption fees) — so the BCI SC Revenue chart's
"Mint/Redeem" bar is *not* pure Private LP; it's Private LP + a small RWA contribution.
The Private LP Fee tables you're looking at directly are the clean, unblended numbers.

## 4. ⚠ Finding — "Private Capital Allocation - 5 Years" table is a second, disconnected simulation

This table (directly below the Private LP sliders) computes its own parallel version of
the LP capital balance instead of reading the verified engine numbers — the same class of
bug fixed twice already in the Retail/Private fee tables. Specifically it:

1. **Invents a fake "no outflow for the first 6 months" rule** (`m > 6 ? remaining * outRate : 0`)
   that does not exist anywhere in the actual simulation.
2. Tracks its own `remaining` balance from **gross deposits** (before mint fee, before
   conversion fee, before the Bound Core split) — a different, larger number than the
   engine's real `privateLayerBal` (Layer-side balance, post all fees and conversion).
3. As a result, the "New Capital" / "Outflow" / "Remaining" columns in this table **do not
   match** `lpIn` / `privateLayerOut` / `privateLayerBal` from the actual simulation —
   they're a fictional parallel LP ledger that happens to share the same sliders.

**Recommendation:** same fix as before — replace this table's computation with direct
reads of `sim[i].lpIn`, `sim[i].privateLayerOut`, `sim[i].privateLayerBal`. This changes
what the table displays (removes the fake 6-month lock, and "Remaining" will show the
real, smaller net-of-fees Layer balance instead of gross deposits). Want me to fix it now,
before we move to Section 2?
