import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList
} from "recharts";

/* eslint-disable no-undef */

/* ------------------------------------------------------------- BOUND DESIGN TOKENS */
const T = {
  bg:        "#F6F4EE",
  bgEl:      "#FFFFFF",
  bgSoft:    "#FBFAF6",
  bgInset:   "#F1EEE6",
  border:    "#E5E1D6",
  borderS:   "#D6D1C2",
  borderH:   "#C4BEAC",
  ink:       "#0E0E0C",
  ink2:      "#3A3A36",
  ink3:      "#6B6A62",
  ink4:      "#9A9890",
  ink5:      "#BEBBB0",
  green:     "#1F4D3F",
  green2:    "#2C6A57",
  greenSoft: "#E5EFE9",
  greenInk:  "#143329",
  amber:     "#B07410",  amberSoft: "#F5E9D2",
  red:       "#A02929",  redSoft:   "#F2DCD8",
  blue:      "#2D4D8C",  blueSoft:  "#DEE5F2",
};

const SHADOW = "0 1px 0 rgba(20,20,15,.02), 0 1px 2px rgba(20,20,15,.04)";
const MONO   = "'Geist Mono','JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";
const SANS   = "'Geist','Inter',-apple-system,'Segoe UI',sans-serif";

/* --- Revenue bar palette (within design system, no neon) --- */
const RC = {
  rwa:    "#1F4D3F",  // forest green
  pool:   "#2D4D8C",  // blue
  maint:  "#B07410",  // amber
  integ:  "#8FBFA8",  // light green
  morpho: "#6B6A62",  // ink-3 gray
  float:  "#2C6A57",  // green-2
  conv:   "#143329",  // green-ink
  entry:  "#5B4B8A",  // muted violet — mint/redemption (smart-contract) fees
};

/* ------------------------------------------------------------- FORMATTERS */
const fd  = (n, d = 1) => {
  if (n == null || isNaN(n)) return "-";
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n/1e9).toFixed(d)}B`;
  if (a >= 1e6) return `$${(n/1e6).toFixed(d)}M`;
  if (a >= 1e3) return `$${(n/1e3).toFixed(d)}K`;
  return `$${n.toFixed(0)}`;
};
const fp  = (n, d = 1) => `${(+(n||0)).toFixed(d)}%`;
const fpr = (n) => `${(+(n||1)).toFixed(4)}`;
const fSupply = (n) => {
  if (n == null || isNaN(n) || n === 0) return null;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return `${n.toFixed(0)}`;
};

/* ------------------------------------------------------------- PRESETS */
const PRESETS = {
  default: {
    name: "Default",
    // Defaults recalibrated 2026-07-10 (owner-directed) — see HANDOFF changelog
    // for the full before/after table.
    initPrivateLp:3_200_000, lpGrowth:800_000,
    poolInitialVolume:50_000, poolStart:6,
    poolGrowthY1:20, poolGrowthY2:15, poolGrowthY3:12, poolGrowthY4:8, poolGrowthY5:7,
    bndUsage:10, lpOutflow:2.5, lockPeriod:6,
    integFee:50_000, maintFee:75_000, morphoRate:4,
    privateBCIConversion:92, retailBCIConversion:80, retailSellRate:20,
    poolFee:0.3, apssFee:0.5,
    convFeeRwaUSD:0.88, convFeeBND:0.44,
    mintRedeemFee:0.3, rwaTradeF:0.3,
    retailOutflowRate:8,
  },
};

/* ------------------------------------------------------------- SIMULATION ENGINE  (architecture v2 - unchanged logic) */
const MONTHS = 36;
const ER_SEED = 500_000;
const ER_RATES = [0.10, 0.15, 0.20, 0.25, 0.25];

// RWA concentration escalation ladder — gentle, 3-step. Fires on CATEGORY concentration
// (total RWA held / Layer) and independently on EACH MARKET's own concentration, additive.
// Thresholds are proportioned to the category cap (maxRwaPct, default 20%) and the
// per-market cap (mkMaxPct, default 10%) respectively — i.e. expressed as fractions of
// the cap so the ladder scales automatically if those caps are tuned.
const RWA_LADDER = [
  { capFrac: 0.50, haircutBump: 0.10, tradeFBump: 0.05 },  // e.g. 10% of a 20% cap
  { capFrac: 0.75, haircutBump: 0.20, tradeFBump: 0.10 },  // e.g. 15% of a 20% cap
  { capFrac: 1.00, haircutBump: 0.30, tradeFBump: 0.15 },  // at/above the cap itself
];
function ladderBump(concPct, capPct) {
  if (capPct <= 0) return { haircutBump: 0, tradeFBump: 0 };
  const frac = concPct / capPct;
  let bump = { haircutBump: 0, tradeFBump: 0 };
  for (const step of RWA_LADDER) if (frac >= step.capFrac) bump = step;
  return bump;
}

function simulate(p, rwaMarkets = [], layerConfig = {}) {
  const {
    // Structural
    minBufferPct          = 5,
    redemptionDays        = 14,
    rwaCoverageDays       = 14,
    maxRwaPct             = 20,   // category-wide: total RWA held before routing excess to issuer redemption
    mkMaxPct              = 10,   // per-market: single RWA cannot exceed this share of Layer before routing to issuer redemption
    morphoMinReserve      = 20,
    enhancedMaxPct        = 20,
    // Yield sources
    aaveYield             = 3.5,
    morphoYield           = 4.5,
    enhancedYield         = 7.5,
    // LCR
    lcrHealthy            = 1.5,
    lcrWarning            = 1.0,
    lcrStress             = 0.7,
    // Stress response
    bciLockExtWarning     = 15,
    bciLockExtStress      = 30,
    bciLockExtEmergency   = 60,
    mintDiscountRwa15     = 20,
    mintDiscountRwa18     = 40,
    mintDiscountRwaCap    = 60,
    mintDiscountWarning   = 50,
    mintDiscountStress    = 70,
    mintDiscountEmergency = 90,
    rwaAcceptEmergency    = 50,
    protocolReservePct    = 10,
    // RWA acceptance may never push the projected month-end LCR below this floor.
    // Default 1.5 (= lcrHealthy): RWA crowding can never pull the protocol out of
    // HEALTHY mode. Lower toward 1.0 to trade liquidity headroom for more accepted
    // RWA volume (more revenue, but permanent WARNING mode at the floor).
    rwaLcrTarget          = 1.5,
    // Note: rwaConcentrationHard / rwaHaircutTriggered (punitive haircut safeguard)
    // deliberately NOT consumed by the engine — deterrents are excluded from revenue
    // projections. The UI still reads them from layerConfig for warning displays.
  } = layerConfig;

  let bciSC = 0, bciSupply = 0, bciPrice = 1.0;
  let prCum = 0, er = ER_SEED;
  let prevAnnG = 0;
  let privateLayerBal  = 0;
  let retailLayerBal   = 0;
  let rwaCollateralBal = 0;       // held RWA inventory (sellable via minting, capped at maxRwaPct)
  let rwaPipelineBal   = 0;       // excess RWA awaiting issuer redemption (= sum of mkPipe)
  let prevStressMode   = "HEALTHY"; // prior-month stress mode (drives this month's RWA acceptance throttle)
  let prevMintingDiscount = 0;    // prior-month minting discount (applied to THIS month's mint haircut —
                                  // same one-month-lag pattern as the stress acceptance throttle)
  let mkHeld = rwaMarkets.map(() => 0); // per-market held inventory ledger (sums to rwaCollateralBal)
  let mkPipe = rwaMarkets.map(() => 0); // per-market issuer-redemption pipeline ledger — each market's
                                        // overflow drains at ITS OWN issuerRedemptionDays, so a T+90
                                        // real-estate market no longer returns cash at a T+30 blend
  let boundCoreBal = 0;            // idle rwaUSD liability stock in Bound Core
  let bcUsdcNav = 0;               // USDC asset NAV in BC (raw + yield position, separate from rwaUSD)
  let poolVol = 0;
  // v4 additional state
  let bciQueueBal = 0;             // BCI redemption queue $
  let protocolReserveBal = 0;      // separate treasury for emergency
  let lcrHistory = [];             // last 7 LCR values for reserve trigger
  let prevVel = 0;                 // previous-month RWA velocity (seeds next iteration)

  // Integration fees (including month-1 launches) flow through pr_integ inside the
  // monthly loop — one path for every launch month, no out-of-band prCum seeding.

  return Array.from({ length: MONTHS }, (_, idx) => {
    const m = idx + 1;
    const erRate = ER_RATES[Math.min(Math.ceil(m/12)-1, 4)];

    // ============================================================
    // STEP 0 — LP entry/exit flows (private + retail). NONE of this depends on RWA
    // market activity, so it is computed FIRST. This lets RWA capacity sizing (below)
    // use THIS MONTH's real Layer size (layerPostUpdate) instead of a prior-month
    // proxy — previously the RWA block ran first and had to guess using last month's
    // layer, which systematically understated capacity in any growth month (new LP
    // deposits > exits), throttling RWA-driven revenue below what the Layer could
    // actually support. No new circular dependency: layerPostUpdate here is exactly
    // the same formula as before, just computed earlier because its own inputs never
    // needed the RWA block in the first place.
    // ============================================================
    const privConv = (p.privateBCIConversion || 95) / 100;
    const bnd      = p.bndUsage / 100;
    const poolFeeRate  = (p.poolFee||0.3) / 100;
    const poolApssRate = ((p.poolFee||0.3) + (p.apssFee||0.5)) / 100;
    const convRateFull = (p.convFeeRwaUSD||0.88) / 100;
    const mintRdmRate  = (p.mintRedeemFee||0.3) / 100;

    const lpIn  = m === 1 ? (p.initPrivateLp + (p.lpGrowth || 0)) : (p.lpGrowth || 0);

    // Retail pool volume - compound growth (sequential across months; must run in order)
    if (m < p.poolStart) {
      poolVol = 0;
    } else if (m === p.poolStart) {
      poolVol = p.poolInitialVolume || 50_000;
    } else {
      const monthsSinceStart = m - p.poolStart;
      const poolYearIdx = Math.min(Math.floor(monthsSinceStart / 12), 4);
      const growthRates = [
        (p.poolGrowthY1 || 20) / 100,
        (p.poolGrowthY2 || 10) / 100,
        (p.poolGrowthY3 || 6)  / 100,
        (p.poolGrowthY4 || 4)  / 100,
        (p.poolGrowthY5 || 2)  / 100,
      ];
      poolVol = Math.min(poolVol * (1 + growthRates[poolYearIdx]), 200e6);
    }
    const retailPoolVol = poolVol;

    // -- RETAIL LP ENTRY (money-conserving, mirrors the private path) --------
    // Step 1: buyer spends retailPoolVol USDC on the pool; the pool fee is taken
    //         from the swap, so the rwaUSD actually received is net of it.
    //         (APSS is protocol arbitrage capture around the peg — NOT deducted
    //         from the buyer's principal, per the fee reference card.)
    const retailPoolFeeEntry = retailPoolVol * poolFeeRate;
    const retailRwaUSDRecv   = retailPoolVol - retailPoolFeeEntry;
    // Step 2: retailConv% of the received rwaUSD converts to BCI
    const retailConv         = (p.retailBCIConversion || 98) / 100;
    const convAmountRetail   = retailRwaUSDRecv * retailConv;
    // Step 3: conversion fee deducted FROM the converting amount (rwaUSD path only)
    const retailConvFeeEntry = convAmountRetail * (1-bnd) * convRateFull;
    // Step 4: net capital entering the Liquidity Layer
    const retailToLayer      = convAmountRetail - retailConvFeeEntry;
    // Step 5: non-converting rwaUSD stays idle in Bound Core
    const retailBoundCoreIn  = retailRwaUSDRecv * (1 - retailConv);
    // Budget: retailPoolVol = poolFee + convFee + toLayer + toBoundCore (invariant S20)

    // -- PRIVATE LP ENTRY (correct formulas) ----------------------
    // Step 1: Mint fee deducted from full deposit
    const mintFeeRevenue   = lpIn * mintRdmRate;            // 0.3% of full deposit
    const rwaUSDReceived   = lpIn - mintFeeRevenue;          // rwaUSD LP actually receives

    // Step 2: 95% of rwaUSD received converts to BCI
    const convAmountEntry  = rwaUSDReceived * privConv;      // e.g. $1,994K x 95% = $1,894.3K

    // Step 3: Conversion fee on converting amount (rwaUSD path only -> credited to BCI SC)
    const convFeeEntry     = convAmountEntry * (1-bnd) * convRateFull;

    // Step 4: Net USDC entering Liquidity Layer (after conversion fee deducted)
    const privateToLayer   = convAmountEntry - convFeeEntry;

    // Step 5: Non-converting rwaUSD stays in Bound Core
    const privateBoundCore = rwaUSDReceived * (1 - privConv);

    // -- LP EXIT — raw amounts. (BCI-redemption QUEUE throttling, which depends on
    // RWA capacity, is computed further below once layerUSDCAvailable is known; the
    // exit AMOUNTS themselves — and layerPostUpdate — do not depend on RWA at all.)
    // Private LP capital is locked for the first `lockPeriod` months (default 6) — no
    // exits at all during the lock, regardless of the Monthly Outflow slider. Retail LP
    // (public-pool) exits are unaffected — they can sell at any time.
    const lockPeriod      = p.lockPeriod ?? 6;
    const privateLayerOut = m > lockPeriod ? privateLayerBal * (p.lpOutflow / 100) : 0;
    const retailLayerOut  = retailLayerBal  * ((p.retailOutflowRate || 5) / 100);
    const lpOut = privateLayerOut; // private exit - used in conversion fee calcs below

    // THIS MONTH's real Layer size — the whole point of the reorder. Post-update layer
    // = pre-update balances + inflows - outflows. NOTE: Layer yield is deliberately NOT
    // compounded into LP balances (it is fully distributed as protocol revenue — see the
    // balance-update note further below), so this IS the final Layer figure for the month.
    const layerPostUpdate = Math.max(0,
      privateLayerBal + privateToLayer - privateLayerOut +
      retailLayerBal  + retailToLayer  - retailLayerOut
    );

    // ============================================================
    // RWA MARKET DEMAND CALCULATION (per-market ledger) ----------
    // Each active market contributes demand; serving capacity is allocated pro-rata
    // to demand across markets, and each market's SOLD inventory (minting) comes from
    // its own held-collateral ledger (mkHeld). Revenue uses each market's own haircut
    // and trade-fee rates applied to SERVED volumes — no blended-average approximation.
    // ============================================================
    let namedLiqDemand = 0;
    let namedMintDemand = 0;
    let totalNamedMarkets = 0;
    let newNamedMarkets = 0;

    // Concentration used to price THIS month's haircut/trade fee escalation, now
    // measured against THIS month's real layer (layerPostUpdate) rather than a stale
    // prior-month figure — consistent with rwaHeldPct/rwaCollateralPct further below,
    // which already used layerPostUpdate as their denominator.
    const categoryConcPct     = layerPostUpdate > 0 ? rwaCollateralBal / layerPostUpdate * 100 : 0;
    const categoryBump        = ladderBump(categoryConcPct, maxRwaPct);

    // Issuer-redemption pipeline: USDC returning THIS month is what was already in the
    // pipeline at the start of the month (last month's overflow, which has been counting
    // down) — new overflow routed to the pipeline this month hasn't waited yet, so it
    // doesn't return until a later month. Computed early (pure function of prior state)
    // so it can fund this month's BCI redemptions before RWA capacity is allocated.
    // Each market's pipeline drains at ITS OWN issuerRedemptionDays (per-market ledger),
    // so the blended return speed is genuinely weighted by pipeline composition.
    const activeMarketsNow = rwaMarkets.filter(mk => mk.active && m >= mk.launchMonth);
    const mkPipeReturn = rwaMarkets.map((mk, i) =>
      mkPipe[i] / Math.max(1, (mk.issuerRedemptionDays ?? 30) / 30));
    const rwaPipelineReturn = mkPipeReturn.reduce((a, b) => a + b, 0);
    const pipeTotalPrior = mkPipe.reduce((a, b) => a + b, 0);
    // Display metric: pipeline-weighted average return timing (falls back to the simple
    // average across active markets when the pipeline is empty).
    const weightedRedemptionDays = pipeTotalPrior > 0
      ? rwaMarkets.reduce((s, mk, i) => s + mkPipe[i] * (mk.issuerRedemptionDays ?? 30), 0) / pipeTotalPrior
      : activeMarketsNow.length > 0
        ? activeMarketsNow.reduce((s, mk) => s + (mk.issuerRedemptionDays ?? 30), 0) / activeMarketsNow.length
        : 30;

    const mkStats = rwaMarkets.map((mk, i) => {
      if (!mk.active || m < mk.launchMonth) return null;

      // Integration fee is credited ONCE, via the pr_integ revenue stream below
      // (it flows through totalPrRaw -> prCum like every other PR source). A direct
      // prCum credit here would double-count it.
      if (m === mk.launchMonth) newNamedMarkets++;
      totalNamedMarkets++;

      const monthsLive = m - mk.launchMonth;
      const aum = mk.aum * Math.pow(1 + (mk.aumGrowth ?? 2) / 100, monthsLive);
      const mintOpen = m >= (mk.mintStartMonth ?? mk.launchMonth + 8);

      // Revenue is projected at the BASELINE haircut only. The punitive triggered
      // haircut is a protocol SAFEGUARD (deterrent), excluded from revenue projections.
      const liqDemand  = aum * (mk.liqRate ?? 0.8) / 100;   // liquidation opens at launch
      const mintDemand = mintOpen ? aum * (mk.mintRate ?? 0.4) / 100 : 0;
      namedLiqDemand  += liqDemand;
      namedMintDemand += mintDemand;

      // Concentration escalation: category-wide bump + this market's own bump, additive.
      // Gentle (0.1–0.3pp on haircut, 0.05–0.15pp on trade fee) — discourages further
      // concentration in an over-weight market without being punitive to ordinary trading.
      const mkConcPct = layerPostUpdate > 0 ? mkHeld[i] / layerPostUpdate * 100 : 0;
      const mkBump = ladderBump(mkConcPct, mkMaxPct);
      const haircutBumpPct = categoryBump.haircutBump + mkBump.haircutBump;
      const tradeFBumpPct  = categoryBump.tradeFBump  + mkBump.tradeFBump;

      return {
        i, name: mk.name || `Market ${i + 1}`, aum,
        liqDemand, mintDemand,
        liqHc:  ((mk.liqHaircut ?? 0.5) + haircutBumpPct) / 100,
        // Mint haircut is reduced by the ACTIVE minting discount (prior-month value,
        // same one-month lag as the stress acceptance throttle — this month's discount
        // isn't known until this month's held/LCR state is computed below). Previously
        // the discount was computed and displayed but never applied, so the engine
        // booked full mint-haircut revenue in months where a 20-90% discount was
        // nominally in force. Demand stimulation from the discount is NOT modeled.
        mintHc: (mk.mintHaircut ?? 0.3) / 100 * (1 - prevMintingDiscount / 100),
        tradeF: ((mk.rwaTradeF ?? p.rwaTradeF ?? 0.3) + tradeFBumpPct) / 100,
        mkConcPct, haircutBumpPct, tradeFBumpPct,
      };
    });

    const newM = newNamedMarkets;
    const markets = totalNamedMarkets;
    const totalLiqDemand  = namedLiqDemand;
    const totalMintDemand = namedMintDemand;

    // -- CAPACITY WATERFALL: BCI redemptions first, then an LCR guard, then demand --
    // USDC available = THIS MONTH's real layer (layerPostUpdate) minus what's already
    // committed to RWA (held inventory + issuer-redemption pipeline cash, both still
    // prior-month-end since this month's serving hasn't happened yet).
    const rwaInLayerNow      = rwaCollateralBal + rwaPipelineBal;
    const estimatedUSDCPct   = Math.max(minBufferPct, 100 - (rwaInLayerNow / Math.max(layerPostUpdate, 1) * 100));
    const layerUSDCAvailable = layerPostUpdate * Math.min(estimatedUSDCPct, 80) / 100;

    // 1) BCI redemptions are SENIOR. LP exits are an OBLIGATION the protocol already
    // carries; RWA liquidation service is discretionary business it can decline.
    // (Previously RWA liquidations had first claim and BCI exits took the leftover —
    // that never bit in the default run only because pipeline returns happened to
    // cover exits, but under stress it would have delayed LP redemptions to keep
    // buying RWA inventory.)
    const desiredBCITotal = privateLayerOut + retailLayerOut;
    const fundsAvailable  = layerUSDCAvailable + rwaPipelineReturn;
    const bciServedTotal  = Math.min(bciQueueBal + desiredBCITotal, fundsAvailable);
    const bciQueueBalNext = Math.max(0, bciQueueBal + desiredBCITotal - fundsAvailable);
    const rwaFundsAfterBci = Math.max(0, fundsAvailable - bciServedTotal);

    // 2) LCR guard: never accept so much RWA that the projected month-end LCR drops
    // below rwaLcrTarget. Accepting X converts liquid USDC into illiquid held/pipeline
    // RWA. Projected: liquid ≈ layerPost − (rwaInLayerNow − pipelineReturn − expectedMint + X),
    // obligations ≈ desiredBCITotal + X·(rwaCoverageDays/30). Solving liquid ≥ T·obligations
    // for X gives the cap below. (Minting is independent of X — it sells from PRIOR
    // held inventory — so its liquidity contribution is known up front.)
    const expectedMint = mkStats.reduce((s, st) => s + (st ? Math.min(mkHeld[st.i], st.mintDemand) : 0), 0);
    const covFrac    = rwaCoverageDays / 30;
    // Tiny margin (+0.001) so the realized LCR lands strictly ABOVE the floor —
    // without it, months pinned exactly at the floor flicker between stress modes
    // on floating-point noise (lcr >= threshold comparisons).
    const lcrGuardT  = rwaLcrTarget + 1e-3;
    const rwaLcrCap  = Math.max(0,
      (layerPostUpdate - rwaInLayerNow + rwaPipelineReturn + expectedMint - lcrGuardT * desiredBCITotal)
      / (1 + lcrGuardT * covFrac));

    // 3) Liquidations are accepted up to min(funds left after BCI, LCR guard, demand).
    // The maxRwaPct cap does NOT refuse them — excess above the cap is routed to the
    // issuer-redemption pipeline below. In EMERGENCY stress (prior month), acceptance
    // drops to rwaAcceptEmergency%.
    const stressThrottle = prevStressMode === "EMERGENCY" ? rwaAcceptEmergency / 100 : 1;
    const rwaLiq  = totalLiqDemand  > 0
      ? Math.min(rwaFundsAfterBci, rwaLcrCap, totalLiqDemand * stressThrottle)
      : 0;

    // Allocate accepted liquidation capacity pro-rata to each market's demand.
    // Minting = selling RWA the protocol actually holds, per market: each market's
    // sales come from ITS OWN held inventory (the protocol cannot sell OUSG it doesn't
    // own to satisfy BUIDL demand).
    const liqScale = totalLiqDemand > 0 ? rwaLiq / totalLiqDemand : 0;
    let rwaMint = 0;
    let haircutRevenue = 0;
    let rwaTradeRevenue = 0;
    mkStats.forEach(s => {
      if (!s) return;
      s.liqServed  = s.liqDemand * liqScale;
      s.mintServed = Math.min(mkHeld[s.i], s.mintDemand);
      rwaMint += s.mintServed;
      haircutRevenue  += s.liqServed * s.liqHc + s.mintServed * s.mintHc;
      rwaTradeRevenue += (s.liqServed + s.mintServed) * s.tradeF;
    });

    const layerConstrained  = totalLiqDemand > 0 && rwaLiq < totalLiqDemand;
    const demandConstrained = totalLiqDemand > 0 && rwaLiq >= totalLiqDemand;
    const mintScale = totalMintDemand > 0 ? rwaMint / totalMintDemand : 0;

    // -- RETAIL LP EXIT -------------------------------------------------------
    // BCI -> rwaUSD conversion fee comes out of the exiting amount; the seller
    // only has the net rwaUSD to sell on the pool.
    const retailConvFeeExitBCI = retailLayerOut * (1-bnd) * convRateFull;  // -> BCI SC
    const retailConvFeeExitBND = retailLayerOut * bnd * (p.convFeeBND||0.44)/100; // BND burn
    const retailExitSellVol    = retailLayerOut - retailConvFeeExitBCI;

    // RWA user pool volume - sell side is liquidation, buy side is minting.
    // Pre-pool (m < poolStart) there is no USDC/rwaUSD AMM, so RWA liquidations cannot route
    // through the pool. Instead they are redeemed rwaUSD -> USDC directly via the protocol
    // (0.3% redemption fee, applied below). RWA trade fee + haircut still apply either way.
    const poolLive       = m >= p.poolStart;
    const rwaPoolSellVol = poolLive ? rwaLiq  : 0;
    const rwaPoolBuyVol  = poolLive ? rwaMint : 0;
    const rwaPoolVol     = rwaPoolSellVol + rwaPoolBuyVol;
    const rwaRedeemVol   = poolLive ? 0 : rwaLiq; // pre-pool liquidation served via protocol redemption

    // Total pool volume: retail buy + retail exits (net rwaUSD actually sold) + RWA users
    const pVol = retailPoolVol + retailExitSellVol + rwaPoolVol;

    // -- PRIVATE LP EXIT (correct formulas) ------------------------
    // Step 1: LP converts BCI -> rwaUSD (BCI price x balance, fee deducted)
    const convFeeExit      = lpOut * (1-bnd) * convRateFull;  // conversion fee on exit
    const rwaAfterConvExit = lpOut - convFeeExit;              // rwaUSD LP receives after conv fee

    // Step 2: LP redeems rwaUSD -> USDC (0.3% redeem fee on remaining rwaUSD)
    const redeemFeeRevenue = rwaAfterConvExit * mintRdmRate;   // 0.3% of post-conversion rwaUSD

    // -- BOUND CORE — two-tier USDC allocation ------------------------
    // Liability: idle rwaUSD (instant exit via pool or direct redemption).
    // Assets:    USDC NAV in BC — funded 1:1 when new idle rwaUSD is minted,
    //            drained on redemption, yield accrues on surplus position.
    // Tier 1: Raw USDC in smart contract = coverage% × idle rwaUSD (0% yield).
    // Tier 2: USDC Yield Position        = NAV surplus above required raw USDC.
    const bcUsdcCoverage    = layerConfig.bcUsdcCoverage    ?? 100;
    const bcYieldUsdcRate   = layerConfig.bcYieldUsdcRate   || 4.5;

    const newToBoundCore    = privateBoundCore + retailBoundCoreIn;
    const boundCoreOutflow  = boundCoreBal * ((layerConfig.bcOutflowRate ?? 2) / 100); // rwaUSD redeemed / drained

    const rwaUSDIdle        = Math.max(0, boundCoreBal + newToBoundCore - boundCoreOutflow);
    // New idle rwaUSD is backed 1:1 by USDC; redemptions drain USDC 1:1. Yield earned
    // on the Yield Position is NOT retained in NAV — it is fully paid out 80/20 to
    // BCI SC / Protocol Reserve below (same distribute-once rule as Layer yield;
    // retaining it here AND crediting it as revenue would double-count the dollar).
    bcUsdcNav               = Math.max(0, bcUsdcNav + newToBoundCore - boundCoreOutflow);
    boundCoreBal            = rwaUSDIdle;

    const bcUsdcRequired    = rwaUSDIdle * (bcUsdcCoverage / 100);
    const bcUsdcAmt         = Math.min(bcUsdcNav, bcUsdcRequired); // raw USDC for instant redemption
    const bcYieldUsdcAmt    = Math.max(0, bcUsdcNav - bcUsdcAmt);
    const bcUsdcShortfall   = Math.max(0, bcUsdcRequired - bcUsdcAmt);
    const bcCoverageOk      = bcUsdcShortfall <= 0;

    const bcUsdcNavTotal    = bcUsdcAmt + bcYieldUsdcAmt;
    const bcUsdcPct         = bcUsdcNavTotal > 0 ? bcUsdcAmt / bcUsdcNavTotal * 100 : 0;
    const bcYieldUsdcPct    = bcUsdcNavTotal > 0 ? bcYieldUsdcAmt / bcUsdcNavTotal * 100 : 0;
    const bcDailyPoolVol    = pVol / 30; // informational (APSS / pool context)
    const bcCoverageAchieved = rwaUSDIdle > 0 ? bcUsdcAmt / rwaUSDIdle * 100 : 100;

    const bcYieldUsdcMo     = bcYieldUsdcAmt * (bcYieldUsdcRate / 100) / 12;
    const bcYieldGrossMo    = bcYieldUsdcMo;
    const bcBlendedAnn      = bcUsdcNavTotal > 0 ? (bcYieldGrossMo * 12 / bcUsdcNavTotal) * 100 : 0;
    const bcYieldToBCI      = bcYieldGrossMo * 0.80;
    const bcYieldToPR       = bcYieldGrossMo * 0.20;

    const bcDeployed        = bcYieldUsdcAmt;
    const bcPostUpdate      = rwaUSDIdle; // legacy alias: idle rwaUSD TVL

    // === v4 DYNAMIC LAYER ALLOCATION - 4-TIER WATERFALL ===============
    // Layer = USDC(Aave) + Morpho + Enhanced + RWA. All except RWA are T+0/T+1 liquid,
    // all earn yield. layerPostUpdate was already computed in Step 0 above.

    // Step 1 - USDC buffer target (three constraints, largest wins)
    const bciOutflowThisMonth     = privateLayerOut + retailLayerOut;
    const dailyBCIOutflow         = bciOutflowThisMonth / 30;
    const bciRedemptionCovPct     = layerPostUpdate > 0 ? (dailyBCIOutflow * redemptionDays) / layerPostUpdate * 100 : minBufferPct;
    // Obligations reflect COMMITMENTS, not raw external demand: the protocol only
    // owes liquidity for volume it actually accepts (rwaLiq). Demand it refuses at
    // the capacity constraint is not a liability — otherwise adding large markets
    // would crash the LCR with obligations the protocol never took on.
    const dailyRWALiqDemand       = rwaLiq / 30;
    const rwaLiqCovPct            = layerPostUpdate > 0 ? (dailyRWALiqDemand * rwaCoverageDays) / layerPostUpdate * 100 : minBufferPct;
    const bindingConstraint =
      bciRedemptionCovPct >= rwaLiqCovPct && bciRedemptionCovPct >= minBufferPct ? "bci"
      : rwaLiqCovPct >= minBufferPct ? "rwa"
      : "floor";
    const usdcBufferPct           = Math.min(80, Math.max(minBufferPct, bciRedemptionCovPct, rwaLiqCovPct));
    const usdcBufferAmt           = layerPostUpdate * usdcBufferPct / 100;

    // Step 2 - Yield bucket = whatever is not USDC
    const yieldBucketPct          = Math.max(0, 100 - usdcBufferPct);
    const yieldBucketAmt          = layerPostUpdate * yieldBucketPct / 100;

    // Step 3 - RWA inventory + issuer-redemption pipeline
    // Liquidated RWA lands in held inventory (sellable via minting). Two caps route
    // excess to the issuer-redemption pipeline: (a) PER-MARKET — no single RWA can be
    // held above mkMaxPct of the layer, checked first; (b) CATEGORY — total RWA held
    // (after per-market capping) cannot exceed maxRwaPct, scaled pro-rata if breached.
    // Neither cap ever refuses a liquidation — they only decide how much of what was
    // already accepted stays as sellable inventory vs. goes to the issuer for cash back.
    const rwaCollateralCap = layerPostUpdate * maxRwaPct / 100;
    const mkCollateralCap  = layerPostUpdate * mkMaxPct  / 100;
    mkStats.forEach(s => {
      if (!s) return;
      mkHeld[s.i] = Math.max(0, mkHeld[s.i] + s.liqServed - s.mintServed);
    });
    // Drain each market's pipeline by its own return (computed earlier from prior
    // balances at that market's own issuerRedemptionDays), then add this month's
    // overflow to the ledger of the market that produced it.
    rwaMarkets.forEach((mk, i) => {
      mkPipe[i] = Math.max(0, mkPipe[i] - mkPipeReturn[i]);
    });
    let rwaToPipeline = 0;
    rwaMarkets.forEach((mk, i) => {
      if (mkHeld[i] > mkCollateralCap) {
        rwaToPipeline += mkHeld[i] - mkCollateralCap;
        mkPipe[i]     += mkHeld[i] - mkCollateralCap;
        mkHeld[i] = mkCollateralCap;
      }
    });
    const heldPreCap = mkHeld.reduce((a, b) => a + b, 0);
    if (heldPreCap > rwaCollateralCap && heldPreCap > 0) {
      rwaToPipeline += heldPreCap - rwaCollateralCap;
      const capScale = rwaCollateralCap / heldPreCap;
      rwaMarkets.forEach((mk, i) => { mkPipe[i] += mkHeld[i] * (1 - capScale); });
      mkHeld = mkHeld.map(h => h * capScale);
    }
    rwaCollateralBal = mkHeld.reduce((a, b) => a + b, 0);
    // rwaPipelineReturn (this month's cash-back) was already credited to the BCI
    // redemption/RWA capacity waterfall above. New overflow (rwaToPipeline) starts
    // its wait now — it returns in a future month at its own market's speed.
    const rwaRedemptionThisMonth = rwaPipelineReturn;
    rwaPipelineBal = mkPipe.reduce((a, b) => a + b, 0);

    // RWA in the layer = held inventory (capped) + pipeline (transient, awaiting issuer).
    // Used for the yield-bucket split below — both held RWA and pipeline cash are
    // unavailable for Morpho/Enhanced deployment, so both correctly reduce that split.
    const rwaCollateralInLayer    = Math.min(rwaCollateralBal + rwaPipelineBal, yieldBucketAmt);
    const rwaCollateralPct        = layerPostUpdate > 0 ? rwaCollateralInLayer / layerPostUpdate * 100 : 0;
    // Genuine held-inventory concentration ONLY (excludes pipeline cash). This is the
    // correct driver for investor-facing risk display and the preventive minting-discount
    // ladder below — pipeline cash is a bounded, short-duration issuer wait (counterparty
    // risk on a redemption already in motion), not open-ended RWA price/market exposure.
    // Blending it into "RWA concentration" (the old behavior) overstated risk and could
    // have driven rwaCollateralPct well past 100% of the intended cap once several
    // markets were routing overflow into the pipeline simultaneously.
    const rwaHeldPct              = layerPostUpdate > 0 ? rwaCollateralBal / layerPostUpdate * 100 : 0;

    // Step 4 - Split remaining yield bucket between Morpho + Enhanced
    const yieldBucketAfterRwa     = Math.max(0, yieldBucketAmt - rwaCollateralInLayer);
    const morphoFloorAmt          = layerPostUpdate * morphoMinReserve / 100;
    const enhancedMaxAmt          = yieldBucketAfterRwa * enhancedMaxPct / 100;
    const enhancedAmt             = Math.min(enhancedMaxAmt, Math.max(0, yieldBucketAfterRwa - morphoFloorAmt));
    const morphoAmt               = Math.max(0, yieldBucketAfterRwa - enhancedAmt);
    const morphoPct               = layerPostUpdate > 0 ? morphoAmt / layerPostUpdate * 100 : 0;
    const enhancedPct             = layerPostUpdate > 0 ? enhancedAmt / layerPostUpdate * 100 : 0;

    // Step 5 - LCR calculation (on post-update liquid capital)
    const liquidCapital           = usdcBufferAmt + morphoAmt + enhancedAmt;
    const monthlyBCIObligation    = dailyBCIOutflow * 30;
    const rwaObligation           = dailyRWALiqDemand * rwaCoverageDays;
    const totalObligations        = monthlyBCIObligation + rwaObligation;
    const lcr                     = totalObligations > 0 ? liquidCapital / totalObligations : 99;

    // Update rolling history for Protocol Reserve trigger
    lcrHistory.push(lcr);
    if (lcrHistory.length > 7) lcrHistory.shift();

    // Step 6 - Determine stress mode
    const stressMode =
      lcr >= lcrHealthy ? "HEALTHY"
      : lcr >= lcrWarning ? "WARNING"
      : lcr >= lcrStress ? "STRESS"
      : "EMERGENCY";

    // Step 7 - RWA acceptance rate actually applied this month (from prior-month stress
    // mode — this month's mode isn't known when liquidations are accepted). The mode
    // computed above becomes next month's throttle.
    const rwaAcceptancePct        = stressThrottle * 100;
    prevStressMode                = stressMode;

    // Step 8 - BCI lock extension (informational - actual queue mechanic handled outside)
    const bciLockExtension =
      stressMode === "HEALTHY"    ? 0
      : stressMode === "WARNING"  ? bciLockExtWarning
      : stressMode === "STRESS"   ? bciLockExtStress
      : bciLockExtEmergency;

    // Step 9 - Minting discount (max of preventive + reactive). Thresholds are
    // proportioned to the category cap (90% / 75% of maxRwaPct — i.e. 18% / 15% at the
    // default 20% cap) so the ladder scales if the cap is tuned, same convention as
    // the haircut escalation ladder (RWA_LADDER). This month's discount is APPLIED to
    // NEXT month's mint haircut (one-month lag, via prevMintingDiscount above).
    const preventiveDiscount =
      rwaHeldPct >= maxRwaPct ? mintDiscountRwaCap
      : rwaHeldPct >= maxRwaPct * 0.90 ? mintDiscountRwa18
      : rwaHeldPct >= maxRwaPct * 0.75 ? mintDiscountRwa15
      : 0;
    const reactiveDiscount =
      stressMode === "WARNING"   ? mintDiscountWarning
      : stressMode === "STRESS"  ? mintDiscountStress
      : stressMode === "EMERGENCY" ? mintDiscountEmergency
      : 0;
    const mintingDiscount = Math.max(preventiveDiscount, reactiveDiscount);
    const appliedMintingDiscount = prevMintingDiscount; // what actually hit this month's mint haircut
    prevMintingDiscount = mintingDiscount;

    // Step 10 - Protocol Reserve intervention
    const reserveTriggered = lcrHistory.length >= 7 && lcrHistory.every(l => l < 0.5);
    const protocolReserveTarget = layerPostUpdate * protocolReservePct / 100;

    // Step 11 - Yield calculation (three sources, on post-update allocated amounts)
    const aaveYieldMonthly     = usdcBufferAmt * (aaveYield / 100) / 12;
    const morphoYieldMonthly   = morphoAmt * (morphoYield / 100) / 12;
    const enhancedYieldMonthly = enhancedAmt * (enhancedYield / 100) / 12;
    const layerYieldGross      = aaveYieldMonthly + morphoYieldMonthly + enhancedYieldMonthly;

    // Blended annual yield on post-update layer
    const blendedAnnualYield = layerPostUpdate > 0
      ? ((aaveYieldMonthly + morphoYieldMonthly + enhancedYieldMonthly) * 12 / layerPostUpdate) * 100
      : 0;

    const bci_morpho           = layerYieldGross * 0.80;
    const pr_morpho            = layerYieldGross * 0.10;
    const er_morpho            = layerYieldGross * 0.10;
    // ER receives its 10% share of Layer yield directly (before general top-up).
    er += er_morpho;

    // Float yield (Bound Core) — flat 80% BCI SC / 20% Protocol Reserve
    // Credited from actual Bound Core gross yield (USDC Yield Position only)
    const floatBCIPct = 0.80;
    const floatPRPct  = 0.20;
    const floatPhase  = "Flat 80% BCI";
    const floatGross  = bcYieldGrossMo;
    const floatToBCI  = bcYieldToBCI;
    const floatToPR   = bcYieldToPR;

    // Backwards compat aliases for existing code
    const ILB = usdcBufferPct / 100;
    const AYL = morphoPct / 100;
    const EYL = 0;
    const blendYield = morphoPct / 100 * (morphoYield / 100);
    const lpSpeed = morphoAmt > 0 ? "T+0 to T+1" : "T+0";

    // (Retail exit fees are computed up in the retail flow block, alongside entry)

    // -- FEE REVENUE STREAMS ---------------------------------------
    // Pool + APSS fees (apply to all pool volume including retail exits and RWA)
    const bci_pool = pVol * poolApssRate * 0.80;
    const pr_pool  = pVol * poolApssRate * 0.20;

    // Mint fee (on full lpIn) + private Redeem fee (rwaUSD after conversion fee)
    // + pre-pool RWA liquidation redemption fee (0.3%). All are redemption/entry-class fees,
    // split 80% BCI SC / 20% Protocol Reserve (owner-directed flip 2026-07-10; was 20/80).
    const rwaRedeemFee = rwaRedeemVol * mintRdmRate; // 0.3% on pre-pool RWA liquidation volume
    const bci_entry = (mintFeeRevenue + redeemFeeRevenue + rwaRedeemFee) * 0.80;
    const pr_entry  = (mintFeeRevenue + redeemFeeRevenue + rwaRedeemFee) * 0.20;

    // Conversion fees -> 100% to BCI SC (private entry + exit, retail entry + exit)
    const bci_conv = convFeeEntry
                   + convFeeExit
                   + retailConvFeeExitBCI
                   + retailConvFeeEntry;

    // RWA trade revenue is computed per-market above (each market's own tradeF rate
    // on its served volumes) — no blended-average approximation.
    const activeMarkets = rwaMarkets.filter(mk => mk.active && m >= mk.launchMonth);

    // Per-market maintenance fees (sum across active markets)
    const totalMaintFee = activeMarkets.reduce((s, mk) => s + (mk.maintFee ?? p.maintFee ?? 75_000), 0);

    const bci_maint = (totalMaintFee / 12) * 0.20;
    // RWA trade + haircut: 80% BCI SC / 20% PR (owner-directed flip 2026-07-10; was 20/80)
    const bci_rwa   = (rwaTradeRevenue + haircutRevenue) * 0.80;
    const bci_float = floatToBCI;
    const totalBci  = bci_pool+bci_entry+bci_conv+bci_maint+bci_rwa+bci_morpho+bci_float;

    const pr_integ = newM > 0
      ? activeMarkets.filter(mk => m === mk.launchMonth).reduce((s,mk) => s + (mk.integFee ?? p.integFee ?? 50_000), 0)
      : 0;
    const pr_maint = (totalMaintFee / 12) * 0.80;
    const pr_rwa   = (rwaTradeRevenue + haircutRevenue) * 0.20;
    const pr_float = floatToPR;
    const totalPrRaw = pr_pool+pr_entry+pr_integ+pr_maint+pr_rwa+pr_morpho+pr_float;

    const atRisk  = morphoAmt + bcDeployed;
    const erTarget = atRisk * erRate;
    const erTopUp  = Math.min(Math.max(0, erTarget-er), totalPrRaw*0.10);
    er += erTopUp;
    const totalPrAfterER = totalPrRaw - erTopUp;

    // BCI SC = revenue surplus only (fees). LP collateral sits in the Liquidity Layer.
    // Price = (Layer NAV + BCI SC) / supply — mint/burn at start-of-month price.
    const priceStart = Math.max(bciPrice, 1e-9);
    const layerIn    = privateToLayer + retailToLayer;
    const layerOut   = privateLayerOut + retailLayerOut;
    const mint       = layerIn  / priceStart;
    const burn       = Math.min(layerOut / priceStart, bciSupply);
    bciSC            = Math.max(0, bciSC + totalBci);
    bciSupply        = Math.max(1e-9, bciSupply + mint - burn);

    // Layer yield is fully distributed as protocol revenue (80/10/10 to BCI SC / PR / ER
    // above) — it must NOT also compound into LP principal, or the same yield dollar
    // would inflate both terms of the BCI price formula (Layer NAV and BCI SC) at once.
    privateLayerBal = Math.max(0, privateLayerBal + privateToLayer - privateLayerOut);
    retailLayerBal  = Math.max(0, retailLayerBal  + retailToLayer  - retailLayerOut);

    const layerNav  = privateLayerBal + retailLayerBal;
    bciPrice        = (layerNav + bciSC) / bciSupply;
    prCum          += totalPrAfterER;

    prevVel  = Math.max(0.005, rwaLiq/Math.max(privateLayerBal + retailLayerBal, 1));
    // Bound Core balance updated to post-update value (computed above in waterfall block)
    const boundCore        = privateBoundCore + retailBoundCoreIn;
    boundCoreBal = bcPostUpdate;
    bciQueueBal  = bciQueueBalNext;

    const annG = (Math.pow(Math.max(bciPrice,1e-9),12/m)-1)*100;
    prevAnnG = annG;

    return {
      m, bciPrice, bciSC, bciSupply, prCum, markets, rwaLiq, rwaMint, pVol,
      retailPoolVol, rwaPoolSellVol, rwaPoolBuyVol, retailExitSellVol,
      totalLiqDemand, totalMintDemand, layerUSDCAvailable, layerPostUpdate,
      rwaInLayerNow, estimatedUSDCPct,
      layerConstrained, demandConstrained,
      haircutRevenue, rwaTradeRevenue,
      layer: privateLayerBal + retailLayerBal,
      layerNav: privateLayerBal + retailLayerBal,
      bciNav: privateLayerBal + retailLayerBal + bciSC,
      privateLayerBal, retailLayerBal, retailToLayer,
      privateLayerOut, retailLayerOut,
      desiredBCITotal, bciServedTotal, bciQueueBal: bciQueueBalNext,
      rwaPipelineReturn,
      boundCore, boundCoreBal, bcDeployed, er, erTarget,
      privateBoundCore, retailBoundCore: retailBoundCoreIn, privateToLayer,
      retailRwaUSDRecv, convAmountRetail, retailConvFeeEntry, retailPoolFeeEntry,
      lpIn, rwaUSDReceived, convAmountEntry, newToBoundCore, boundCoreOutflow,
      rwaUSDToLayer: privateToLayer + retailToLayer,
      // Bound Core — USDC / USDC Yield Position
      rwaUSDIdle, bcUsdcNav: bcUsdcNavTotal, bcUsdcRequired, bcUsdcShortfall, bcCoverageOk, bcCoverageAchieved,
      bcPostUpdate, bcUsdcPct, bcYieldUsdcPct, bcUsdcAmt, bcYieldUsdcAmt,
      bcYieldUsdcMo, bcYieldGrossMo, bcBlendedAnn,
      bcYieldToBCI, bcYieldToPR, bcDailyPoolVol, bcYieldUsdcRate, bcUsdcCoverage,
      // v4 Dynamic layer allocation - 4-tier waterfall (all on post-update layer)
      usdcBufferPct, usdcBufferAmt,
      usdcForBCIRedemption: layerPostUpdate * bciRedemptionCovPct / 100,
      usdcForRWALiq:        layerPostUpdate * rwaLiqCovPct / 100,
      usdcFloor:            layerPostUpdate * minBufferPct / 100,
      bciOutflowThisMonth, dailyRWALiqDemand,
      yieldBucketPct, yieldBucketAmt,
      morphoPct, morphoAmt,
      enhancedPct, enhancedAmt,
      rwaCollateralPct, rwaCollateralInLayer, rwaHeldPct,
      rwaCollateralBal, rwaPipelineBal, rwaToPipeline,
      rwaRedemptionThisMonth, weightedRedemptionDays,
      // Per-market ledger snapshot: demand, served volumes, held inventory, concentration
      marketStats: rwaMarkets.map((mk, i) => {
        const s = mkStats[i];
        if (!s) return { i, name: mk.name || `Market ${i+1}`, active: false,
          liqDemand: 0, mintDemand: 0, liqServed: 0, mintServed: 0, held: 0, pipeline: mkPipe[i] || 0, concPct: 0,
          haircutPct: 0, tradeFPct: 0, haircutBumpPct: 0, tradeFBumpPct: 0 };
        return { i, name: s.name, active: true, aum: s.aum,
          liqDemand: s.liqDemand, mintDemand: s.mintDemand,
          liqServed: s.liqServed, mintServed: s.mintServed,
          held: mkHeld[i],
          pipeline: mkPipe[i],
          concPct: layerPostUpdate > 0 ? mkHeld[i] / layerPostUpdate * 100 : 0,
          haircutPct: s.liqHc * 100, tradeFPct: s.tradeF * 100, mintHcPct: s.mintHc * 100,
          haircutBumpPct: s.haircutBumpPct, tradeFBumpPct: s.tradeFBumpPct };
      }),
      categoryConcPct, categoryHaircutBumpPct: categoryBump.haircutBump, categoryTradeFBumpPct: categoryBump.tradeFBump,
      layerYieldGross,
      // v4 yields breakdown
      aaveYieldMonthly, morphoYieldMonthly, enhancedYieldMonthly,
      blendedAnnualYield,
      // v4 LCR + stress
      lcr, stressMode,
      liquidCapital, totalObligations, monthlyBCIObligation, rwaObligation,
      rwaAcceptancePct, bciLockExtension, mintingDiscount, appliedMintingDiscount,
      preventiveDiscount, reactiveDiscount,
      rwaFundsAfterBci, rwaLcrCap,
      reserveTriggered, protocolReserveTarget,
      bindingConstraint, bciRedemptionCovPct, rwaLiqCovPct,
      // Backwards compat
      ILB, AYL, EYL, blendYield: blendYield*100,
      lpSpeed, floatPhase, floatGross, floatToBCI, floatToPR,
      totalBci, totalPr:totalPrAfterER, totalPrRaw, erTopUp,
      annG: Math.min(Math.max(annG,0),999),
      bci_pool, bci_entry, bci_conv, bci_maint, bci_rwa, bci_morpho, bci_float,
      pr_pool, pr_entry, pr_integ, pr_maint, pr_rwa, pr_morpho, pr_float,
      er_morpho,   // 10% of gross layer yield -> Emergency Reserve (Layer table reads this)
      // Private LP fee breakdown, single source of truth (bci_entry/bci_conv/pr_entry
      // above blend private+RWA-redemption+retail together for the aggregate revenue
      // totals; these fields expose the PRIVATE-LP-only components for the fee table,
      // computed from the exact same variables — never re-derived independently).
      privMintBCI:    mintFeeRevenue * 0.80,
      privMintPR:     mintFeeRevenue * 0.20,
      privConvInBCI:  convFeeEntry,
      privConvInBND:  convAmountEntry * bnd * (p.convFeeBND||0.44) / 100,
      privConvOutBCI: convFeeExit,
      privConvOutBND: lpOut * bnd * (p.convFeeBND||0.44) / 100,
      privRedeemBCI:  redeemFeeRevenue * 0.80,
      privRedeemPR:   redeemFeeRevenue * 0.20,
      // Retail fee breakdown - pool fee and APSS split separately
      retBuyPoolFeeBCI:  retailPoolVol * (p.poolFee||0.3)/100 * 0.80,
      retBuyPoolFeePR:   retailPoolVol * (p.poolFee||0.3)/100 * 0.20,
      retBuyAPSSBCI:     retailPoolVol * (p.apssFee||0.5)/100 * 0.80,
      retBuyAPSSPR:      retailPoolVol * (p.apssFee||0.5)/100 * 0.20,
      retBuyConvBCI:     retailConvFeeEntry,
      retBuyConvBND:     convAmountRetail * bnd * (p.convFeeBND||0.44)/100,
      retExitConvBCI:    retailConvFeeExitBCI,
      retExitConvBND:    retailConvFeeExitBND,
      retExitPoolFeeBCI: retailExitSellVol * (p.poolFee||0.3)/100 * 0.80,
      retExitPoolFeePR:  retailExitSellVol * (p.poolFee||0.3)/100 * 0.20,
      retExitAPSSBCI:    retailExitSellVol * (p.apssFee||0.5)/100 * 0.80,
      retExitAPSSPR:     retailExitSellVol * (p.apssFee||0.5)/100 * 0.20,
    };
  });
}

/* ------------------------------------------------------------- UI COMPONENTS */
function Slider({ label, value, min, max, step, onChange, fmt = v => v, hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:10.5, color:T.ink3, textTransform:"uppercase",
          letterSpacing:"0.08em", fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:12, color:T.green, fontFamily:MONO, fontWeight:600 }}>
          {fmt(value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width:"100%", height:3, accentColor:T.green, cursor:"pointer", display:"block" }} />
      {hint && <div style={{ fontSize:10.5, color:T.ink4, marginTop:2.5, lineHeight:1.4 }}>{hint}</div>}
    </div>
  );
}

function KPI({ label, value, sub, tag, accent = false }) {
  return (
    <div style={{
      background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10,
      padding:"14px 16px", flex:1, boxShadow:SHADOW, minWidth:0,
      borderTop: accent ? `2px solid ${T.green}` : `1px solid ${T.border}`,
    }}>
      <div style={{ fontSize:10.5, color:T.ink3, textTransform:"uppercase",
        letterSpacing:"0.08em", fontWeight:600, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:500, color:accent?T.green:T.ink, fontFamily:MONO,
        letterSpacing:"-0.025em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {value}
      </div>
      {tag && (
        <span style={{ display:"inline-block", marginTop:5, padding:"2px 7px", borderRadius:4,
          background:T.greenSoft, color:T.greenInk, fontSize:10.5, fontFamily:MONO, fontWeight:600 }}>
          {tag}
        </span>
      )}
      {sub && !tag && <div style={{ fontSize:11.5, color:T.ink3, marginTop:5, lineHeight:1.4 }}>{sub}</div>}
    </div>
  );
}

// Participant Economics — per-unit entry/exit fee waterfall for ONE investor's own
// deposit, over their own chosen holding period. Deliberately NOT derived from the
// engine's aggregate monthly fee-revenue exports (privMintBCI, privConvOutBCI, etc.)
// — those are the whole pool's fee revenue from whatever mix of OTHER LPs deposited
// or exited that specific month, unrelated to what any one investor personally pays.
// Using them (as an earlier version of this section did) implied one-time entry/exit
// fees recur every year, which they do not, and overstated cost the longer the hold —
// backwards, since a one-time fee should amortize DOWN over a longer hold. Fixed
// 2026-07-09 (owner-reported "calculations are way off").
//
// Waterfall (mirrors the engine's own private/retail entry+exit sequence exactly):
//   entry fee (mint or pool, on full amount) -> split converting/idle -> entry
//   conversion fee (on converting share) -> grows with BCI price to the target month
//   -> exit conversion fee -> exit fee (redeem or pool) -> + idle share (flat, no fee).
function computeLpOutcome({ amount, years, entryFeeRate, convPct, convFeeRate, exitFeeRate, bciPriceEnd }) {
  const afterEntryFee  = amount * (1 - entryFeeRate);
  const convertingAmt  = afterEntryFee * (convPct / 100);
  const idleAmt        = afterEntryFee - convertingAmt;
  const entryFeeDollar = amount * entryFeeRate;
  const entryConvFee   = convertingAmt * convFeeRate;
  const netToLayer     = convertingAmt - entryConvFee;
  const grown          = netToLayer * bciPriceEnd; // BCI starts at 1.0000 rwaUSD at entry
  const exitConvFee    = grown * convFeeRate;
  const afterExitConv  = grown - exitConvFee;
  const exitFeeDollar  = afterExitConv * exitFeeRate;
  const finalValue     = (afterExitConv - exitFeeDollar) + idleAmt;
  const netApy = amount > 0 && years > 0 ? (Math.pow(finalValue / amount, 1 / years) - 1) * 100 : 0;
  return { finalValue, netApy, entryFeeDollar, entryConvFee, exitConvFee, exitFeeDollar,
    convertingAmt, grown, afterExitConv };
}

const fmtAmountInput = (n) => (n || n === 0) ? Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "";

// Stable top-level component (not redefined per-render) — a component recreated
// inside a render closure gets a new function identity every render, which makes
// React unmount/remount its DOM on every keystroke (owner-reported: "you can only
// input one number, then need to click again"). All data arrives as props; the only
// internal state is a raw-text mirror of the amount input so the space-formatted
// display doesn't fight the user's typing.
function CapitalCard({ name, blurb, amount, setAmount, years, setYears,
  grossApy, netApy, feeLegs, feesPaidTotal, projected, gain,
  open, onToggleBreakdown }) {
  // Total fees as a plain % of what you put in — a one-time cost, not an annual
  // rate. This used to be shown as "Fee Drag" = Gross APY − Net APY, which nobody
  // could reverse-engineer by eye (owner: "how the [heck] do you calculate the fee
  // drag?"). This number IS just what it looks like: feesPaidTotal / amount.
  const feePctOfPrincipal = amount > 0 ? (feesPaidTotal / amount) * 100 : 0;
  return (
    <div style={{ flex:1, minWidth:340, border:`1px solid ${T.border}`,
      borderRadius:10, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>
        <div style={{ fontSize:13, fontWeight:700, color:T.ink }}>{name}</div>
        <div style={{ fontSize:10.5, color:T.ink3, marginTop:2 }}>{blurb}</div>
      </div>

      <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:14 }}>
        {/* Inputs — the only two controls; everything below reacts to these */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:150 }}>
            <div style={{ fontSize:9.5, color:T.ink4, marginBottom:4 }}>Investment amount ($)</div>
            <input type="text" inputMode="numeric" value={fmtAmountInput(amount)}
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setAmount(raw ? parseInt(raw, 10) : 0);
              }}
              style={{ width:"100%", padding:"6px 10px", fontSize:12,
                border:`1px solid ${T.border}`, borderRadius:6,
                background:T.bgEl, color:T.ink, fontFamily:MONO,
                outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ minWidth:150 }}>
            <div style={{ fontSize:9.5, color:T.ink4, marginBottom:4 }}>Holding period</div>
            <div style={{ display:"flex", gap:4 }}>
              {[1,2,3].map(yy => (
                <button key={yy} onClick={()=>setYears(yy)}
                  style={{ flex:1, padding:"6px 0", borderRadius:6, cursor:"pointer", fontSize:11,
                    fontWeight:years===yy?700:500,
                    border:`1px solid ${years===yy?T.ink:T.border}`,
                    background:years===yy?T.ink:T.bgEl,
                    color:years===yy?"#fff":T.ink3 }}>
                  {yy}{yy===1?" yr":" yrs"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BCI growth, total fee cost, and your actual annualized return */}
        <div style={{ display:"flex" }}>
          <div style={{ flex:1, padding:"4px 12px 4px 0" }}>
            <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>BCI Index Growth</div>
            <div style={{ fontSize:16, fontWeight:600, fontFamily:MONO, color:T.ink }}>{fp(grossApy)}<span style={{fontSize:10,color:T.ink4,fontWeight:400}}> /yr</span></div>
          </div>
          <div style={{ flex:1, padding:"4px 12px", borderLeft:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Total Fees</div>
            <div style={{ fontSize:16, fontWeight:600, fontFamily:MONO, color:T.red }}>−{fp(feePctOfPrincipal)}<span style={{fontSize:10,color:T.ink4,fontWeight:400}}> one-time</span></div>
          </div>
          <div style={{ flex:1, padding:"4px 0 4px 12px", borderLeft:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3, fontWeight:600 }}>Net APY (your return)</div>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:MONO, color:T.ink }}>{fp(netApy)}<span style={{fontSize:10,color:T.ink4,fontWeight:400}}> /yr</span></div>
          </div>
        </div>
        <div style={{ fontSize:9.5, color:T.ink4, lineHeight:1.5 }}>
          Your money grows at the BCI index rate ({fp(grossApy)}/yr) for {years} {years===1?"year":"years"}, then pays {fp(feePctOfPrincipal)} in fees ONCE — not every year — when it enters and exits. Net APY is what that nets out to per year, once the one-time fee cost is spread over the whole hold: the longer you hold, the smaller its annual bite.
        </div>

        {/* Total fees paid on THIS amount over THIS holding period — these are
            one-time entry/exit charges, not a recurring annual cost */}
        <div style={{ border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
          <button onClick={onToggleBreakdown}
            style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"9px 12px", background:T.bgSoft, border:"none", cursor:"pointer", textAlign:"left" }}>
            <span style={{ fontSize:11, color:T.ink2 }}>
              Total fees, entry + exit <span style={{ color:T.ink4 }}>(one-time, on {fd(amount)} over {years} {years===1?"yr":"yrs"})</span>
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, fontFamily:MONO, color:T.red }}>{fd(feesPaidTotal)}</span>
              <span style={{ fontSize:10, color:T.ink3 }}>{open ? "Hide breakdown ▲" : "Show breakdown ▾"}</span>
            </span>
          </button>
          {open && (
            <div style={{ padding:"4px 14px 10px" }}>
              {feeLegs.map((b,j) => (
                <div key={j} style={{ display:"flex", justifyContent:"space-between",
                  padding:"5px 0", borderTop: j>0 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize:10.5, color:T.ink3, maxWidth:"70%" }}>{b.label}</span>
                  <span style={{ fontSize:10.5, fontFamily:MONO, color:T.ink2, fontWeight:600 }}>{fd(b.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projected outcome for THIS amount over THIS holding period */}
        <div style={{ display:"flex" }}>
          <div style={{ flex:1, padding:"4px 12px 4px 0" }}>
            <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Projected Value</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:MONO, color:T.ink }}>{fd(projected)}</div>
          </div>
          <div style={{ flex:1, padding:"4px 0 4px 12px", borderLeft:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Total Gain</div>
            <div style={{ fontSize:16, fontWeight:700, fontFamily:MONO, color:T.green }}>+{fd(gain)}</div>
          </div>
        </div>
        <div style={{ fontSize:9, color:T.ink4, lineHeight:1.4 }}>
          Illustrative only — assumes the BCI index keeps growing at the same pace it reached by month {years*12} ({fp(grossApy)} annualized). Entry and exit fees are the protocol's actual rates for this scenario, charged once each, not annually. The conversion-fee rate shown is net of the BND-paid share — that portion is paid in BND tokens and never deducted from your deposit. Not a guarantee or a forward-looking projection of actual returns.
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:12.5, fontWeight:600, color:T.ink }}>{children}</div>
      {sub && <div style={{ fontSize:11, color:T.ink3, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

const TIP = {
  contentStyle:{ background:T.bgEl, border:`1px solid ${T.border}`,
    fontSize:11.5, borderRadius:8, color:T.ink2, boxShadow:SHADOW },
  labelStyle:{ color:T.ink3, fontFamily:MONO },
};

function FmtTip(prefix="", suffix="") {
  return ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
        padding:"9px 13px", fontSize:11.5, boxShadow:SHADOW }}>
        <div style={{ color:T.ink3, fontFamily:MONO, marginBottom:5 }}>{label}</div>
        {payload.map((p,i) => (
          <div key={i} style={{ color:p.color, fontFamily:MONO, marginBottom:2 }}>
            {p.name}: {prefix}{typeof p.value==="number"?p.value.toFixed(p.value<10?4:2):p.value}{suffix}
          </div>
        ))}
      </div>
    );
  };
}

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10,
      marginBottom:10, boxShadow:SHADOW, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
          padding:"11px 16px", cursor:"pointer", background:"transparent",
          border:"none", textAlign:"left" }}>
        <span style={{ fontSize:14, color:T.ink, transition:"transform .2s",
          display:"inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>{'>'}</span>
        <span style={{ fontSize:12.5, fontWeight:600, color:T.ink, flex:1 }}>{title}</span>
      </button>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${T.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Hierarchical fee-breakdown table: main row (bold, gross amount via `calc`) followed by
// indented destination sub-rows (via `key`, read straight off the month object) — same
// visual pattern as the Layer Composition + LCR table (Liquid Capital -> USDC in Aave ->
// Morpho Vaults). Used to split fee revenue tables by fee TYPE while keeping a single
// shared renderer, rather than duplicating table markup per fee category.
function FeeTable({ title, legend, rows, months, year = 1, years = 5, onYear }) {
  return (
    <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
      overflow:"hidden", marginTop:10 }}>
      <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
            textTransform:"uppercase", letterSpacing:"0.08em" }}>{title}</span>
          {legend && (
            <div style={{ display:"flex", gap:8 }}>
              {legend.map(([l,c])=>(
                <span key={l} style={{ fontSize:9.5, color:c, fontWeight:600 }}>* {l}</span>
              ))}
            </div>
          )}
        </div>
        {onYear && (
          <div style={{ display:"flex", gap:4 }}>
            {Array.from({length:years},(_,i)=>i+1).map(y => (
              <button key={y} onClick={() => onYear(y)}
                style={{ padding:"3px 9px", borderRadius:5, cursor:"pointer",
                  fontSize:10, fontWeight: year===y ? 700 : 500,
                  border:`1px solid ${year===y ? T.green : T.border}`,
                  background: year===y ? T.greenSoft : T.bgEl,
                  color: year===y ? T.greenInk : T.ink3 }}>
                Year {y}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
          <thead>
            <tr style={{ background:T.bgSoft }}>
              <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Component</th>
              {months.map((_, i)=>(
                <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                  fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                  M{(year-1)*12+i+1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, calc, label, col, bg, bold, sep }) => (
              <tr key={label} style={{
                borderBottom: sep ? `2px solid ${T.borderS}` : `1px solid ${T.border}`, background:bg,
              }}>
                <td style={{ padding:"5px 12px", color: bold ? col : T.ink3,
                  fontSize: bold ? 10.5 : 9.5, fontWeight: bold ? 700 : 400,
                  whiteSpace:"nowrap" }}>{label}</td>
                {months.map((d, mi) => {
                  const v = d ? (calc ? calc(d) : (d[key]||0)) : 0;
                  return (
                    <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                      fontFamily:MONO, fontSize:10, color: v===0 ? T.ink5 : col,
                      fontWeight: bold ? 700 : 500 }}>
                      {v===0 ? "-" : fd(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* MAIN COMPONENT */
export default function BoundSimulator({ onOpenDocs }) {
  const [view, setView] = useState("inputs"); // "inputs" | "results" — two-page layout
  const goToResults = () => { setView("results"); window.scrollTo(0, 0); };
  const goToInputs  = () => { setView("inputs");  window.scrollTo(0, 0); };
  const [p, setP]       = useState({ ...PRESETS.default });
  const [ap, setAp]     = useState("default");
  const [ms, setMs]     = useState(12);
  const [feeYear, setFeeYear]         = useState(1);
  const [retailFeeYear, setRetailFeeYear] = useState(1);
  const [rwaFeeYear, setRwaFeeYear]   = useState(1);
  const [rwaFeeMarket, setRwaFeeMarket] = useState(-1); // -1 = All Markets

  // -- RWA Named Markets state ------------------------------------
  const DEFAULT_MARKET = {
    active: true,
    name: "OUSG / Ondo Finance",
    launchMonth: 1,
    mintStartMonth: 9,
    aum: 410_000_000,
    aumGrowth: 2,
    liqRate: 0.8,
    liqHaircut: 0.5,
    mintRate: 0.4,
    mintHaircut: 0.3,
    issuerRedemptionDays: 30, // days for issuer to return USDC after BOUND triggers redemption
    rwaTradeF: 0.3,
    integFee: 50_000,
    maintFee: 75_000,
  };
  // Onboarding pipeline: 10 markets over the 3-year (36-month) projection, launching
  // roughly every 3 months (M1 -> M28), leaving M29-36 as a steady-state period with
  // the full platform live. Mix of RWA categories with category-appropriate risk
  // profiles (haircut/liq rate/redemption days/trade fee).
  const [rwaMarkets, setRwaMarkets] = useState([
    { ...DEFAULT_MARKET },
    {
      active: true,
      name: "BUIDL / BlackRock (Securitize)",
      launchMonth: 4,
      mintStartMonth: 12,
      aum: 550_000_000,
      aumGrowth: 2.5,
      liqRate: 0.7,
      liqHaircut: 0.4,
      mintRate: 0.4,
      mintHaircut: 0.3,
      issuerRedemptionDays: 30,
      rwaTradeF: 0.3,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Private Credit Fund / Figure",
      launchMonth: 7,
      mintStartMonth: 15,
      aum: 180_000_000,
      aumGrowth: 3,
      liqRate: 1.2,
      liqHaircut: 0.8,
      mintRate: 0.5,
      mintHaircut: 0.5,
      issuerRedemptionDays: 45,
      rwaTradeF: 0.4,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Money Market Fund / Franklin Templeton (BENJI)",
      launchMonth: 10,
      mintStartMonth: 18,
      aum: 320_000_000,
      aumGrowth: 2,
      liqRate: 1.0,
      liqHaircut: 0.3,
      mintRate: 0.4,
      mintHaircut: 0.25,
      issuerRedemptionDays: 15,
      rwaTradeF: 0.25,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Real Estate Fund / Homebase",
      launchMonth: 13,
      mintStartMonth: 21,
      aum: 95_000_000,
      aumGrowth: 2,
      liqRate: 0.5,
      liqHaircut: 1.0,
      mintRate: 0.3,
      mintHaircut: 0.6,
      issuerRedemptionDays: 90,
      rwaTradeF: 0.4,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Private Credit Fund / Apollo",
      launchMonth: 16,
      mintStartMonth: 24,
      aum: 250_000_000,
      aumGrowth: 3,
      liqRate: 1.1,
      liqHaircut: 0.75,
      mintRate: 0.5,
      mintHaircut: 0.5,
      issuerRedemptionDays: 60,
      rwaTradeF: 0.4,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Short Treasury Fund / WisdomTree",
      launchMonth: 19,
      mintStartMonth: 27,
      aum: 150_000_000,
      aumGrowth: 2,
      liqRate: 0.6,
      liqHaircut: 0.45,
      mintRate: 0.4,
      mintHaircut: 0.3,
      issuerRedemptionDays: 25,
      rwaTradeF: 0.3,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Tokenized Gold / Paxos",
      launchMonth: 22,
      mintStartMonth: 30,
      aum: 120_000_000,
      aumGrowth: 2.5,
      liqRate: 0.6,
      liqHaircut: 0.35,
      mintRate: 0.4,
      mintHaircut: 0.25,
      issuerRedemptionDays: 20,
      rwaTradeF: 0.25,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Trade Finance Pool / Centrifuge",
      launchMonth: 25,
      mintStartMonth: 33,
      aum: 75_000_000,
      aumGrowth: 3,
      liqRate: 0.9,
      liqHaircut: 0.6,
      mintRate: 0.45,
      mintHaircut: 0.4,
      issuerRedemptionDays: 30,
      rwaTradeF: 0.35,
      integFee: 50_000,
      maintFee: 75_000,
    },
    {
      active: true,
      name: "Municipal Bond Fund / Republic",
      launchMonth: 28,
      mintStartMonth: 36,
      aum: 60_000_000,
      aumGrowth: 2,
      liqRate: 0.5,
      liqHaircut: 0.4,
      mintRate: 0.35,
      mintHaircut: 0.3,
      issuerRedemptionDays: 30,
      rwaTradeF: 0.3,
      integFee: 50_000,
      maintFee: 75_000,
    },
  ]);
  const [rwaMarketOpen, setRwaMarketOpen] = useState(Array(10).fill(false));

  const addMarket = () => {
    if (rwaMarkets.length >= 10) return;
    setRwaMarkets(prev => [...prev, {
      ...DEFAULT_MARKET,
      name: "",
      launchMonth: Math.min(prev.length * 3 + 1, 36),
      mintStartMonth: Math.min(prev.length * 3 + 9, 60),
      aum: 100_000_000,
    }]);
    setRwaMarketOpen(prev => [...prev, true]);
  };
  const removeMarket = (i) => {
    setRwaMarkets(prev => prev.filter((_,idx) => idx !== i));
    setRwaMarketOpen(prev => prev.filter((_,idx) => idx !== i));
  };
  const upMarket = (i, key, val) => {
    setRwaMarkets(prev => prev.map((mk, idx) => idx === i ? { ...mk, [key]: val } : mk));
    setAp("custom");
  };
  const toggleMarketOpen = (i) => {
    setRwaMarketOpen(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  // BND Governance Token assumptions (separate from simulation engine)
  const [bnd, setBnd] = useState({
    totalSupply:       1_000_000_000,
    privatePrice:      0.025,
    privateAllocation: 24.8,   // % of total supply -> 248M tokens -> $6.2M raise
    publicPrice:       0.10,
    publicAllocation:  10.0,   // % of total supply -> 100M tokens -> $10M raise
  });
  const upBnd = (k, v) => setBnd(prev => ({ ...prev, [k]: v }));

  // BND derived calculations
  const bndPrivateTokens = Math.round(bnd.totalSupply * bnd.privateAllocation / 100);
  const bndPublicTokens  = Math.round(bnd.totalSupply * bnd.publicAllocation  / 100);
  const bndPrivateRaise  = bndPrivateTokens * bnd.privatePrice;
  const bndPublicRaise   = bndPublicTokens  * bnd.publicPrice;
  const bndTotalSold     = bndPrivateTokens + bndPublicTokens;
  const bndTotalRaised   = bndPrivateRaise  + bndPublicRaise;
  const bndPctSold       = (bndTotalSold / bnd.totalSupply) * 100;
  const bndImpliedFDV    = bnd.totalSupply * bnd.publicPrice;

  // -- Liquidity Layer state --------------------------------------
  const [yld, setYld] = useState({
    // (Legacy Bound Core FYP fields removed 2026-07-09 — bcFypPct/bcFypYield/
    //  bcDailySellVol/bcMinBufferDays/bcGasDeploy/bcGasRedeem were state-only,
    //  never read by the engine or rendered by any slider.)

    // === LIQUIDITY LAYER v4 =======================================
    // Structural — recalibrated 2026-07-10 (owner-directed)
    layerMinBuffer:        10,
    layerRedemptionDays:   14,
    layerRwaCoverageDays:  14,
    maxRwaPct:             20,
    mkMaxPct:              10,
    morphoMinReserve:      22,
    enhancedMaxPct:        20,

    // Yield sources (all T+0/T+1) — recalibrated 2026-07-10 (owner-directed)
    aaveYield:             2.2,
    morphoYield:           5.3,
    enhancedYield:         6.2,

    // LCR thresholds
    lcrHealthy:            1.5,
    lcrWarning:            1.0,
    lcrStress:             0.7,

    // (BCI lock extensions removed from UI 2026-07-09 — display-only values; the
    //  engine's own defaults of +15/+30/+60d drive the stress-box readout instead)

    // Minting haircut discounts (% off baseline)
    mintDiscountRwa15:     20,
    mintDiscountRwa18:     40,
    mintDiscountRwaCap:    60,
    mintDiscountWarning:   50,
    mintDiscountStress:    70,
    mintDiscountEmergency: 90,

    // RWA acceptance in EMERGENCY
    rwaAcceptEmergency:    50,

    // LCR floor that RWA acceptance may not breach (capacity guard)
    rwaLcrTarget:          1.5,

    // Protocol Reserve
    protocolReservePct:    10,

    // -- Bound Core — USDC coverage of idle rwaUSD --------------------
    // Recalibrated 2026-07-10 (owner-directed): was 100 (yield position always
    // $0 at that setting); 24% activates the USDC Yield Position / float yield stream.
    bcUsdcCoverage:        24,      // % of idle rwaUSD TVL held as raw USDC for instant redemption
    bcYieldUsdcRate:       4.5,     // annual yield on USDC Yield Position (instant)
    bcOutflowRate:         2,       // %/month of idle rwaUSD redeemed / converted out of Bound Core

    // -- Legacy for existing UI compatibility (dead — not read by engine v4) --
    layerAYLYield:         4.5,
  });
  const upYld = (k, v) => setYld(prev => ({ ...prev, [k]: v }));

  const layerCfg = useMemo(() => ({
    // Structural
    minBufferPct:          yld.layerMinBuffer,
    redemptionDays:        yld.layerRedemptionDays,
    rwaCoverageDays:       yld.layerRwaCoverageDays,
    maxRwaPct:             yld.maxRwaPct,
    mkMaxPct:              yld.mkMaxPct,
    morphoMinReserve:      yld.morphoMinReserve,
    enhancedMaxPct:        yld.enhancedMaxPct,
    // Yield
    aaveYield:             yld.aaveYield,
    morphoYield:           yld.morphoYield,
    enhancedYield:         yld.enhancedYield,
    // LCR
    lcrHealthy:            yld.lcrHealthy,
    lcrWarning:            yld.lcrWarning,
    lcrStress:             yld.lcrStress,
    // Stress response (lock-ext values use engine defaults +15/+30/+60d — display only)
    mintDiscountRwa15:     yld.mintDiscountRwa15,
    mintDiscountRwa18:     yld.mintDiscountRwa18,
    mintDiscountRwaCap:    yld.mintDiscountRwaCap,
    mintDiscountWarning:   yld.mintDiscountWarning,
    mintDiscountStress:    yld.mintDiscountStress,
    mintDiscountEmergency: yld.mintDiscountEmergency,
    rwaAcceptEmergency:    yld.rwaAcceptEmergency,
    rwaLcrTarget:          yld.rwaLcrTarget,
    // Reserve
    protocolReservePct:    yld.protocolReservePct,
    // Bound Core
    bcUsdcCoverage:        yld.bcUsdcCoverage,
    bcYieldUsdcRate:       yld.bcYieldUsdcRate,
    bcOutflowRate:         yld.bcOutflowRate,
  }), [yld]);

  const sim  = useMemo(() => simulate(p, rwaMarkets, layerCfg), [p, rwaMarkets, layerCfg]);
  const defaultSim = useMemo(() => simulate(PRESETS.default, [], {}), []);

  const up   = (k, v) => { setP(prev => ({...prev,[k]:v})); setAp("custom"); };
  const load = key    => { setP({...PRESETS[key]}); setAp(key); };

  const md        = sim[ms-1] || sim[sim.length-1];

  // Pool volume table - 5 years x 12 months (60 months total)
  const poolVolumeTableData = useMemo(() => {
    const volumes = [];
    let tv = 0;
    for (let sm = 1; sm <= 60; sm++) {
      if (sm < p.poolStart) {
        volumes.push(0);
      } else if (sm === p.poolStart) {
        tv = p.poolInitialVolume || 50_000;
        volumes.push(tv);
      } else {
        const monthsSince = sm - p.poolStart;
        const yearIdx = Math.min(Math.floor(monthsSince / 12), 4);
        const rates = [p.poolGrowthY1||20, p.poolGrowthY2||10, p.poolGrowthY3||6, p.poolGrowthY4||4, p.poolGrowthY5||2];
        tv = Math.min(tv * (1 + rates[yearIdx] / 100), 200e6);
        volumes.push(tv);
      }
    }
    return Array.from({ length: 5 }, (_, yi) => ({
      year: yi + 1,
      months: volumes.slice(yi * 12, yi * 12 + 12),
    }));
  }, [p.poolStart, p.poolInitialVolume, p.poolGrowthY1, p.poolGrowthY2, p.poolGrowthY3, p.poolGrowthY4, p.poolGrowthY5]);

  // Private capital table — sourced ENTIRELY from engine sim rows: newCapital = lpIn
  // (gross deposit, before any fee), outflow = privateLayerOut (this month's exit volume,
  // net of the mint/conversion fees already deducted when it entered), remaining =
  // privateLayerBal (actual Liquidity Layer position). No independent recomputation, no
  // invented lock period — the engine has none. Months beyond 36 show zero like every
  // other table (the engine does not project past M36).
  const privateCapitalTableData = useMemo(() => {
    // The engine projects 36 months (3 years) only — no Year 4/5 rows, since that data
    // does not exist rather than showing misleading zeros under a "Year 4/5" label.
    const monthData = Array.from({ length: 36 }, (_, i) => {
      const row = sim[i];
      return { newCapital: row.lpIn || 0, outflow: row.privateLayerOut || 0, remaining: row.privateLayerBal || 0 };
    });

    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: monthData.slice(yi * 12, yi * 12 + 12),
    }));
  }, [sim]);

  // Private LP fee table - shows every fee generated by private capital, split by beneficiary
  // Sourced ENTIRELY from engine sim rows (privMintBCI/privConvInBCI/etc, added to
  // simulate()'s return object as the single source of truth) — no independent UI-side
  // recomputation. The engine's real 6-month exit lock (lockPeriod) already zeroes out
  // privRedeemBCI/PR and the exit-side conversion fees for months 1-6 upstream — this
  // table just displays whatever the engine produced, months 1-36 only (see below).
  const privateFeesTableData = useMemo(() => {
    const monthData = Array.from({ length: 36 }, (_, i) => {
      const m = i + 1;
      const row = sim[i];
      const totalBCI = row.privMintBCI + row.privConvInBCI + row.privConvOutBCI + row.privRedeemBCI;
      const totalPR  = row.privMintPR + row.privRedeemPR;
      const totalBND = row.privConvInBND + row.privConvOutBND;
      const bciSC = row.bciSC || 0;
      const annG  = row.annG  || 0;
      const bciAnnualYield = (bciSC > 0 && annG > 0) ? ((totalBCI * 12 / bciSC) / annG) * 100 : 0;
      return {
        m,
        mintInBCI: row.privMintBCI, mintInPR: row.privMintPR,
        convInBCI: row.privConvInBCI, convInBND: row.privConvInBND,
        convOutBCI: row.privConvOutBCI, convOutBND: row.privConvOutBND,
        redeemOutBCI: row.privRedeemBCI, redeemOutPR: row.privRedeemPR,
        totalBCI, totalPR, totalBND, bciAnnualYield,
      };
    });

    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: monthData.slice(yi * 12, yi * 12 + 12),
    }));
  }, [sim]);

  // Full pool volume table - retail buy + RWA sell + RWA buy + retail exits + total
  const poolVolumeFull = useMemo(() => {
    const retailMonths = poolVolumeTableData.flatMap(yr => yr.months); // 60 months
    return Array.from({ length: 5 }, (_, yi) => ({
      year: yi + 1,
      months: retailMonths.slice(yi * 12, yi * 12 + 12).map((retailBuy, mi) => {
        const simIdx   = yi * 12 + mi;
        const row      = sim[simIdx];
        const rwaSell  = row?.rwaPoolSellVol    || 0;
        const rwaBuy   = row?.rwaPoolBuyVol     || 0;
        const retailExit = row?.retailExitSellVol || 0;
        return { retailBuy, rwaSell, rwaBuy, retailExit, total: retailBuy + rwaSell + rwaBuy + retailExit };
      }),
    }));
  }, [poolVolumeTableData, sim]);

  // Retail LP fee table - built from simulation return values, 36 months / 3 years
  // (matches the engine horizon — no implied-zero Year 4/5 rows)
  const retailFeesTableData = useMemo(() => {
    const months36 = Array.from({ length: 36 }, (_, i) => {
      const row = sim[i];
      const totalBCI = row.retBuyPoolFeeBCI + row.retBuyAPSSBCI + row.retBuyConvBCI
                     + row.retExitConvBCI + row.retExitPoolFeeBCI + row.retExitAPSSBCI;
      const totalPR  = row.retBuyPoolFeePR  + row.retBuyAPSSPR
                     + row.retExitPoolFeePR  + row.retExitAPSSPR;
      const totalBND = row.retBuyConvBND + row.retExitConvBND;
      const bciAnnualYield = (row.bciSC > 0 && row.annG > 0)
        ? ((totalBCI * 12 / row.bciSC) / row.annG) * 100 : 0;
      return { ...row, totalBCI, totalPR, totalBND, bciAnnualYield };
    });
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: months36.slice(yi * 12, yi * 12 + 12),
    }));
  }, [sim]);

  // RWA fee table - per-market and combined, 60 months.
  // Sourced from the engine's per-market ledger (sim[i].marketStats): served volumes
  // reflect the actual pro-rata liquidation allocation and per-market mint inventory,
  // and rates include the live concentration-escalation bumps — no parallel
  // re-derivation. Months beyond the 36-month engine horizon show zero (consistent
  // with every other table; the engine does not project past M36).
  const rwaFeesTableData = useMemo(() => {
    const ZERO = {
      liqVol:0, mintVol:0, totalVol:0, liqTradeBCI:0, liqTradePR:0,
      liqHaircutBCI:0, liqHaircutPR:0, mintTradeBCI:0, mintTradePR:0,
      mintHaircutBCI:0, mintHaircutPR:0, integPR:0, maintBCI:0, maintPR:0,
      totalBCI:0, totalPR:0, bciAnnualYield:0,
    };
    const perMarket = rwaMarkets.map((mk, mi) => {
      if (!mk.active) return { name: mk.name || "Market", months: Array(36).fill(ZERO) };

      // Fallback chain matches the engine exactly (mk -> preset -> hardcoded default)
      const maintMonthly = (mk.maintFee ?? p.maintFee ?? 75_000) / 12;
      const integFee     = mk.integFee ?? p.integFee ?? 50_000;

      const months = Array.from({ length: 36 }, (_, i) => {
        const m = i + 1;
        const simRow = sim[i];
        const st = simRow?.marketStats?.[mi];
        if (!simRow || !st || !st.active) return ZERO;

        // Served volumes + effective (escalated) rates straight from the engine ledger
        const liqVol    = st.liqServed  || 0;
        const mintVol   = st.mintServed || 0;
        const tradeRate = (st.tradeFPct  || 0) / 100;
        const liqHcut   = (st.haircutPct || 0) / 100;
        const mintHcut  = (st.mintHcPct  || 0) / 100;
        const integPR   = m === mk.launchMonth ? integFee : 0;

        // RWA trade + haircut flipped to 80% BCI / 20% PR (owner, 2026-07-10);
        // maintenance unchanged at 20/80.
        const liqTradeBCI     = liqVol  * tradeRate * 0.80;
        const liqTradePR      = liqVol  * tradeRate * 0.20;
        const liqHaircutBCI   = liqVol  * liqHcut   * 0.80;
        const liqHaircutPR    = liqVol  * liqHcut   * 0.20;
        const mintTradeBCI    = mintVol * tradeRate * 0.80;
        const mintTradePR     = mintVol * tradeRate * 0.20;
        const mintHaircutBCI  = mintVol * mintHcut  * 0.80;
        const mintHaircutPR   = mintVol * mintHcut  * 0.20;
        const maintBCI        = maintMonthly * 0.20;
        const maintPR         = maintMonthly * 0.80;

        const totalBCI = liqTradeBCI + liqHaircutBCI + mintTradeBCI + mintHaircutBCI + maintBCI;
        const totalPR  = liqTradePR  + liqHaircutPR  + mintTradePR  + mintHaircutPR  + maintPR + integPR;
        const totalVol = liqVol + mintVol;
        const bciAnnualYield = (() => {
          const bciSC = simRow.bciSC || 0;
          const annG  = simRow.annG  || 0;
          if (bciSC <= 0 || annG <= 0) return 0;
          return ((totalBCI * 12 / bciSC) / annG) * 100;
        })();

        return {
          liqVol, mintVol, totalVol,
          liqTradeBCI, liqTradePR,
          liqHaircutBCI, liqHaircutPR,
          mintTradeBCI, mintTradePR,
          mintHaircutBCI, mintHaircutPR,
          integPR, maintBCI, maintPR,
          totalBCI, totalPR, bciAnnualYield,
        };
      });

      return { name: mk.name || "Market", months };
    });

    // Combined = sum across all markets
    const combined = {
      name: "All Markets",
      months: Array.from({ length: 36 }, (_, i) => {
        const z = { liqVol:0, mintVol:0, totalVol:0, liqTradeBCI:0, liqTradePR:0,
          liqHaircutBCI:0, liqHaircutPR:0, mintTradeBCI:0, mintTradePR:0,
          mintHaircutBCI:0, mintHaircutPR:0, integPR:0, maintBCI:0, maintPR:0,
          totalBCI:0, totalPR:0 };
        perMarket.forEach(mk => {
          const d = mk.months[i];
          Object.keys(z).forEach(k => { z[k] += d[k] || 0; });
        });
        // bciAnnualYield for combined = combined totalBCI contribution to annG
        const bciSC = sim[i]?.bciSC || 0;
        const annG  = sim[i]?.annG  || 0;
        z.bciAnnualYield = (bciSC > 0 && annG > 0)
          ? ((z.totalBCI * 12 / bciSC) / annG) * 100
          : 0;
        return z;
      }),
    };

    // Split into years (36-month engine horizon = 3 years, not 5 — no implied-zero
    // Year 4/5 rows for data that was never simulated)
    const toYears = data => Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: data.months.slice(yi * 12, yi * 12 + 12),
    }));

    return {
      perMarket: perMarket.map(mk => ({ name: mk.name, years: toYears(mk) })),
      combined: toYears(combined),
    };
  }, [rwaMarkets, sim, p.maintFee, p.integFee]);
  // -- Bound Core analytics -----------------------------------------
  const rwaUSDIdle      = md?.rwaUSDIdle       || md?.boundCoreBal || 0;
  const bcUsdcNav       = md?.bcUsdcNav        || 0;
  const bcUsdcRequired  = md?.bcUsdcRequired   || 0;
  const bcUsdcShortfall = md?.bcUsdcShortfall  || 0;
  const bcCoverageOk    = md?.bcCoverageOk     ?? true;
  const bcCoverageAchieved = md?.bcCoverageAchieved ?? 100;
  const bcUsdcAmt       = md?.bcUsdcAmt        || 0;
  const bcYieldUsdcAmt  = md?.bcYieldUsdcAmt   || 0;
  const bcUsdcPct       = md?.bcUsdcPct        || 0;
  const bcYieldUsdcPct  = md?.bcYieldUsdcPct   || 0;
  const bcYieldUsdcMo   = md?.bcYieldUsdcMo    || 0;
  const bcCoverageColor = bcCoverageOk ? T.green : T.red;

  // -- Bound Core revenue table data --------------------------------
  const bcTableData = useMemo(() => {
    // 3 years only — engine horizon is 36 months (P10: no Year 4/5 fiction)
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        return {
          idle:     row.rwaUSDIdle        || row.boundCoreBal || 0,
          total:    row.bcUsdcNav         || 0,
          usdc:     row.bcUsdcAmt         || 0,
          yieldPos: row.bcYieldUsdcAmt    || 0,
          covAch:   row.bcCoverageAchieved|| 0,
          yieldMo:  row.bcYieldUsdcMo     || 0,
          grossMo:  row.bcYieldGrossMo    || 0,
          toBCI:    row.bcYieldToBCI      || 0,
          toPR:     row.bcYieldToPR       || 0,
          blended:  row.bcBlendedAnn      || 0,
        };
      }),
    }));
  }, [sim]);
  const [bcTableYear, setBcTableYear] = useState(1);
  const [flowsTableYear, setFlowsTableYear] = useState(1);

  // -- Capital Flow Reconciliation table data -------------------------
  // Every field here is read directly off an engine export — nothing is
  // re-derived (rule 8). 3 years only — engine horizon is 36 months (P10).
  //
  // IMPORTANT (fixed 2026-07-09): "Total Pool Volume" (pVol) is the AMM pool's
  // own volume only — retail buy/exit + RWA sell/mint. The Private LP path
  // (lpIn) is a SEPARATE direct-to-contract channel that never touches the
  // pool; the engine's own pVol formula (line ~444) excludes it. The previous
  // table nested "Private Contract Volume" under "Total Pool Volume" with a
  // section-separator rule, implying it was already counted in the total —
  // it was not. Kept as its own top-level row here, plus an explicit
  // "Total Capital Entering Protocol" row that sums both channels honestly.
  const protocolFlowsTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        return {
          // Market volume — two independent channels, not one total
          poolRetailBuy:      row.retailPoolVol || 0,
          poolRetailExit:     row.retailExitSellVol || 0,
          poolRwaSell:        row.rwaPoolSellVol || 0,
          poolRwaBuy:         row.rwaPoolBuyVol || 0,
          pVolTotal:          row.pVol || 0,               // AMM pool channel only
          privateContractVol: row.lpIn || 0,                // direct-contract channel, NOT pool volume
          totalAllChannels:   (row.pVol || 0) + (row.lpIn || 0), // honest combined total

          // Private LP — capital flow (deposit -> BCI / idle / layer -> exit)
          privDeposit:      row.lpIn || 0,
          privMintFee:      (row.privMintBCI || 0) + (row.privMintPR || 0),
          privRwaReceived:  row.rwaUSDReceived || 0,
          privConvFee:      row.privConvInBCI || 0,          // conv fee, 100% to BCI SC
          privToBci:        row.convAmountEntry || 0,
          privToBcIdle:     row.privateBoundCore || 0,
          privToLayer:      row.privateToLayer || 0,
          privLayerOut:     row.privateLayerOut || 0,

          // Retail LP — capital flow (pool buy -> BCI / idle / layer -> exit)
          retailPoolBuy:      row.retailPoolVol || 0,
          retailPoolFee:      row.retailPoolFeeEntry || 0,
          retailRwaReceived:  row.retailRwaUSDRecv || 0,
          retailConvFee:      row.retailConvFeeEntry || 0,   // conv fee, 100% to BCI SC
          retailToBci:        row.convAmountRetail || 0,
          retailToBcIdle:     row.retailBoundCore || 0,
          retailToLayer:      row.retailToLayer || 0,
          retailLayerOut:     row.retailLayerOut || 0,

          // Bound Core — flow only (stock/balance sheet lives in its own section)
          bcInPriv:     row.privateBoundCore || 0,
          bcInRetail:   row.retailBoundCore || 0,
          bcInTotal:    row.newToBoundCore || 0,
          bcOutflow:    row.boundCoreOutflow || 0,

          // Liquidity Layer — flow only (balance/composition lives in Layer Composition table)
          layerInPriv:    row.privateToLayer || 0,
          layerInRetail:  row.retailToLayer || 0,
          layerInTotal:   row.rwaUSDToLayer || 0,
          layerOutPriv:   row.privateLayerOut || 0,
          layerOutRetail: row.retailLayerOut || 0,
          layerOutTotal:  row.bciOutflowThisMonth || 0,
          rwaLiqServed:   row.rwaLiq || 0,
          rwaMintServed:  row.rwaMint || 0,
        };
      }),
    }));
  }, [sim]);

  const layerTotal      = md?.layer || 0;
  // Use raw dollar amounts from engine (computed on pre-update layer).
  // NEVER recompute via pct x post-update layer - that causes the gap bug.
  const usdcBufferAmt   = md?.usdcBufferAmt          || 0;
  const morphoAmt       = md?.morphoAmt              || 0;
  const enhancedAmt     = md?.enhancedAmt            || 0;
  const rwaCollatAmt    = md?.rwaCollateralInLayer   || 0;
  const liquidAmt       = usdcBufferAmt + morphoAmt + enhancedAmt;
  const yieldBucketAmt  = morphoAmt + enhancedAmt + rwaCollatAmt;
  // Percentages derived from the raw amounts / post-update layer (honest display)
  const usdcBufferPct   = layerTotal > 0 ? usdcBufferAmt / layerTotal * 100 : 0;
  const morphoPct       = layerTotal > 0 ? morphoAmt     / layerTotal * 100 : 0;
  const enhancedPct     = layerTotal > 0 ? enhancedAmt   / layerTotal * 100 : 0;
  const rwaCollatPct    = layerTotal > 0 ? rwaCollatAmt  / layerTotal * 100 : 0;
  const yieldBucketPct  = layerTotal > 0 ? yieldBucketAmt/ layerTotal * 100 : 0;
  const liquidPct       = layerTotal > 0 ? liquidAmt     / layerTotal * 100 : 0;

  // Yields
  const aaveYieldMo     = md?.aaveYieldMonthly || 0;
  const morphoYieldMo   = md?.morphoYieldMonthly || 0;
  const enhancedYieldMo = md?.enhancedYieldMonthly || 0;
  const layerNetYieldMo = md?.layerYieldGross || (aaveYieldMo + morphoYieldMo + enhancedYieldMo);
  const layerNetYieldAnn= md?.blendedAnnualYield || (layerTotal > 0 ? (layerNetYieldMo * 12 / layerTotal) * 100 : 0);

  // LCR and stress mode
  const currentLCR      = md?.lcr || 99;
  const currentMode     = md?.stressMode || "HEALTHY";
  const rwaAcceptPct    = md?.rwaAcceptancePct || 100;
  const bciLockExt      = md?.bciLockExtension || 0;
  const mintDiscount    = md?.appliedMintingDiscount || 0; // discount actually applied to THIS month's mint haircut
  const preventiveDisc  = md?.preventiveDiscount || 0;
  const reactiveDisc    = md?.reactiveDiscount || 0;
  const reserveTrig     = md?.reserveTriggered || false;
  const protocolRsvTgt  = md?.protocolReserveTarget || 0;

  // Mode colors
  const modeColor = currentMode === "HEALTHY" ? T.green
                  : currentMode === "WARNING" ? T.amber
                  : currentMode === "STRESS"  ? T.red
                  : T.red;
  const modeSoft  = currentMode === "HEALTHY" ? T.greenSoft
                  : currentMode === "WARNING" ? T.amberSoft
                  : T.redSoft;

  // Legacy aliases used in Bound Core UI
  const layerILBAmount  = usdcBufferAmt;
  const layerAYLAmount  = morphoAmt;
  const layerEYLAmount  = enhancedAmt;
  const layerRwaPct     = rwaCollatPct;
  const layerRWAAmount  = rwaCollatAmt;

  // BCI outflows derived from sim
  const expectedRdmpMo  = (md?.privateLayerOut || 0) + (md?.retailLayerOut || 0);
  // Engine obligations are based on COMMITTED (served) RWA volume, not raw demand
  const dailyRWADemand  = md?.dailyRWALiqDemand ?? (md?.rwaLiq || 0) / 30;
  const bindingCon      = md?.bindingConstraint || "floor";
  const bciCovPct       = md?.bciRedemptionCovPct || 0;
  const rwaCovPct       = md?.rwaLiqCovPct || 0;
  const covInstant      = expectedRdmpMo > 0 ? usdcBufferAmt / expectedRdmpMo : 99;
  const covT1           = expectedRdmpMo > 0 ? liquidAmt / expectedRdmpMo : 99;
  const covT14          = covT1;
  const covColor        = (r) => r >= 3 ? T.green : r >= 1.5 ? T.amber : T.red;

  const avgRWADays      = md?.weightedRedemptionDays || 30;
  // Risk coloring uses HELD-ONLY concentration (excludes issuer-redemption pipeline
  // cash) — pipeline cash is a bounded, short-duration wait, not open-ended RWA risk.
  // rwaCollatPct (blended with pipeline) is kept for the yield-bucket total reconstruction
  // above; it is NOT a risk metric and must not drive warn/alert coloring.
  const rwaHeldPctDisplay = md?.rwaHeldPct || 0;
  const rwaHeldAmt      = md?.rwaCollateralBal || 0;
  const rwaPipelineAmt  = md?.rwaPipelineBal || 0;
  const rwaPipelinePct  = layerTotal > 0 ? rwaPipelineAmt / layerTotal * 100 : 0;
  const rwaWarn         = rwaHeldPctDisplay > yld.maxRwaPct * 0.5;
  const rwaAlert        = rwaHeldPctDisplay > yld.maxRwaPct * 0.75;
  const rwaColor        = rwaAlert ? T.red : rwaWarn ? T.amber : T.green;

  // Layer composition table — 36 months from engine sim (single source of truth).
  const layerTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;

        const layer       = row.layer;
        const usdc        = row.usdcBufferAmt          || 0;
        const morpho      = row.morphoAmt              || 0;
        const enhanced    = row.enhancedAmt            || 0;
        const rwaTotal    = row.rwaCollateralBal       || 0;
        const rwaPipeline = row.rwaPipelineBal         || 0;
        const liquid      = row.liquidCapital ?? (usdc + morpho + enhanced);
        const obligations = row.totalObligations ?? 0;

        const mkBreakdown = rwaMarkets.map((mk, mki) => ({
          name: mk.name || `Market ${mki+1}`,
          amt: row.marketStats?.[mki]?.held || 0,
        }));

        return {
          layer, usdc, morpho, enhanced, rwaTotal, rwaPipeline, liquid, obligations,
          mkBreakdown,
          lcr: row.lcr || 99,
          mode: row.stressMode || "HEALTHY",
          // Yield — read from engine (never re-derive from current slider values)
          aaveYieldMo:     row.aaveYieldMonthly     || 0,
          morphoYieldMo:   row.morphoYieldMonthly   || 0,
          enhancedYieldMo: row.enhancedYieldMonthly || 0,
          totalYieldMo:    row.layerYieldGross      || 0,
          blendedAnnual:   row.blendedAnnualYield   || 0,
          bciShare:        row.bci_morpho             || 0,
          prShare:         row.pr_morpho              || 0,
          erShare:         row.er_morpho              || 0,
        };
      }),
    }));
  }, [sim, rwaMarkets]);
  const [layerTableYear, setLayerTableYear] = useState(1);

  // BCI price chart + linked BCI SC Balance table (0 = All, 1–3 = Year) — also drives
  // the Simulation Results KPI row (moved into the shared header control there).
  const [bciPriceView, setBciPriceView] = useState(1);
  const resultsMonth = bciPriceView === 0 ? 36 : bciPriceView * 12;
  const resultsRow   = sim[resultsMonth - 1];
  // BCI Price & Backing table — linked to the SAME Range control as the KPI cards
  // and price chart above it (bciPriceView) — owner reversed an earlier "own
  // independent selector" request, since the table sits directly under the chart
  // it describes and having a second control there was one too many controls.

  // Simulation Results page — tab layout (owner request 2026-07-09): Overview
  // (KPI cards + price chart + Price & Backing table), BCI SC Revenue, Protocol
  // Reserve Revenue, Participant Economics. One topic per tab so investors aren't
  // scrolling one endless page.
  const [resultsTab, setResultsTab] = useState("overview");

  // Participant Economics — each category is its own calculator: investment amount +
  // holding period drive EVERYTHING shown for that card (fees paid, APY, projected
  // value) — there is deliberately no separate "Year" selector, so the holding period
  // the user picks is the only thing that moves the APY figures (2026-07-09 rework:
  // previously a section-wide Year selector and each card's own holding-period control
  // disagreed with each other; consolidated into one control per card).
  const [peBreakdownOpen, setPeBreakdownOpen] = useState({});
  const [privAmount, setPrivAmount] = useState(500_000);
  const [privYears, setPrivYears] = useState(3);
  const [retailAmount, setRetailAmount] = useState(10_000);
  const [retailYears, setRetailYears] = useState(3);

  const priceChart = useMemo(() => {
    const slice = bciPriceView === 0
      ? sim.slice(0, 36)
      : sim.slice((bciPriceView - 1) * 12, bciPriceView * 12);
    return slice.map((d, i) => {
      const m = bciPriceView === 0 ? i + 1 : (bciPriceView - 1) * 12 + i + 1;
      const price = +(d.bciPrice || 0).toFixed(4);
      const showPriceLabel = bciPriceView > 0 || m % 6 === 0 || m === 1;
      return {
        m,
        l: `M${m}`,
        Price: price,
        annG: +(d.annG || 0).toFixed(1),
        bciSC: d.bciSC || 0,
        supply: d.bciSupply || 0,
        showPriceLabel,
      };
    });
  }, [sim, bciPriceView]);

  const bciScBalanceYearSummary = useMemo(() => {
    return [1, 2, 3].map(y => {
      const months = sim.slice((y - 1) * 12, y * 12);
      const end = months[11];
      return {
        // (scStart/privGross removed 2026-07-10 — their table rows were dropped in
        //  the Overview restructure; every remaining field is rendered.)
        privLayer: months.reduce((s, r) => s + (r.privateToLayer || 0), 0),
        retailIn: months.reduce((s, r) => s + (r.retailToLayer || 0), 0),
        layerOut: months.reduce((s, r) => s + ((r.privateLayerOut || 0) + (r.retailLayerOut || 0)), 0),
        layerNav: end?.layerNav || 0,
        revenue: months.reduce((s, r) => s + (r.totalBci || 0), 0),
        scEnd: end?.bciSC || 0,
        bciNav: end?.bciNav || 0,
        supply: end?.bciSupply || 0,
        price: end?.bciPrice || 0,
        annG: end?.annG || 0,
      };
    });
  }, [sim]);

  const priceChartDomain = useMemo(() => {
    if (!priceChart.length) return [0.99, 1.01];
    const prices = priceChart.map(d => d.Price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = Math.max((max - min) * 0.15, 0.02);
    return [+(min - pad).toFixed(4), +(max + pad).toFixed(4)];
  }, [priceChart]);

  const [bciRevYear, setBciRevYear] = useState(1);
  const [prRevYear, setPrRevYear] = useState(1);

  const bciRevChart = useMemo(() => {
    return sim.slice((bciRevYear - 1) * 12, bciRevYear * 12).map(d => ({
      m: d.m,
      l: `M${d.m}`,
      "Conv. Fees":  +((d.bci_conv   || 0) / 1000).toFixed(1),
      "Mint/Redem":  +((d.bci_entry  || 0) / 1000).toFixed(1),
      "Pool+APSS":   +((d.bci_pool   || 0) / 1000).toFixed(1),
      "RWA Fees":    +((d.bci_rwa    || 0) / 1000).toFixed(1),
      "Layer Yield": +((d.bci_morpho || 0) / 1000).toFixed(1),
      "BC Yield":    +((d.bci_float  || 0) / 1000).toFixed(1),
      "Maintenance": +((d.bci_maint  || 0) / 1000).toFixed(1),
      total: d.totalBci || 0,
    }));
  }, [sim, bciRevYear]);

  const prRevChart = useMemo(() => {
    return sim.slice((prRevYear - 1) * 12, prRevYear * 12).map(d => ({
      m: d.m,
      l: `M${d.m}`,
      "RWA Fees":    +((d.pr_rwa    || 0) / 1000).toFixed(1),
      "Mint/Redem":  +((d.pr_entry  || 0) / 1000).toFixed(1),
      "Pool+APSS":   +((d.pr_pool   || 0) / 1000).toFixed(1),
      "Maintenance": +((d.pr_maint  || 0) / 1000).toFixed(1),
      "Integration": +((d.pr_integ  || 0) / 1000).toFixed(1),
      "Layer Yield": +((d.pr_morpho || 0) / 1000).toFixed(1),
      "Float Yield": +((d.pr_float  || 0) / 1000).toFixed(1),
      gross:   d.totalPrRaw || 0,   // what the stacked bars sum to
      erTopUp: d.erTopUp    || 0,
      total:   d.totalPr    || 0,   // net (gross − ER top-up)
    }));
  }, [sim, prRevYear]);

  const bciYearEndRow = sim[bciRevYear * 12 - 1];
  const prYearEndRow  = sim[prRevYear * 12 - 1];

  const yc = [
    {n:"US Treasuries",          y:4.5,  col:T.ink4},
    {n:"Morpho DeFi Lending",    y:6.0,  col:T.ink4},
    {n:"Private Credit (avg)",   y:11.0, col:T.ink4},
    {n:`BCI Default · M${ms}`,   y:+(defaultSim[ms-1]?.annG||0).toFixed(1), col:T.blue},
    ...(ap==="custom"?[{n:`BCI Custom . M${ms}`, y:+(sim[ms-1]?.annG||0).toFixed(1), col:T.amber}]:[]),
  ].sort((a,b)=>a.y-b.y);

  // Revenue tables — 3 years only (engine horizon 36 months, P10); every field is a
  // direct engine-export read, including the totals (rule 8 — no parallel re-sum).
  const bciScRevenueTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        return {
          conv:     row.bci_conv    || 0,
          entry:    row.bci_entry   || 0,   // mint + redemption (smart-contract) fees
          pool:     row.bci_pool    || 0,   // pure pool + APSS (decentralized pool)
          rwa:      row.bci_rwa    || 0,
          layer:    row.bci_morpho || 0,
          bcYield:  row.bci_float  || 0,
          maint:    row.bci_maint  || 0,
          gross:    row.totalBci   || 0,    // engine export (S6 guards = component sum)
        };
      }),
    }));
  }, [sim]);

  // BCI SC Revenue — % composition (re-added 2026-07-10, owner request): each
  // stream's share of that month's BCI SC revenue, so a reader can connect the
  // headline annualized-growth number to what actually drove it (e.g. "12%
  // annualized this month, 60% of that revenue was conversion fees"). Every
  // percentage is derived from the same engine exports as the $ table above —
  // no re-derivation of the totals themselves, just a different unit (rule 8).
  const bciMonthlyCompositionData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        const total = row.totalBci || 0;
        const pct = (v) => total > 0 ? (v || 0) / total * 100 : 0;
        return {
          convPct:    pct(row.bci_conv),
          entryPct:   pct(row.bci_entry),
          poolPct:    pct(row.bci_pool),
          rwaPct:     pct(row.bci_rwa),
          layerPct:   pct(row.bci_morpho),
          bcYieldPct: pct(row.bci_float),
          maintPct:   pct(row.bci_maint),
          annG:       row.annG || 0, // connecting metric — the last row of the table
        };
      }),
    }));
  }, [sim]);

  const prRevenueTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        return {
          rwa:     row.pr_rwa    || 0,
          entry:   row.pr_entry  || 0,
          pool:    row.pr_pool   || 0,
          maint:   row.pr_maint  || 0,
          integ:   row.pr_integ  || 0,
          layer:   row.pr_morpho || 0,
          float:   row.pr_float  || 0,
          grossRaw: row.totalPrRaw || 0,   // sum of the 7 source rows (pre-ER)
          erTopUp: row.erTopUp   || 0,     // deducted for the Emergency Reserve — shown
                                           // explicitly so the column actually adds up
          gross:   row.totalPr   || 0,     // net credited to PR (post-ER)
          prCum:   row.prCum     || 0,
        };
      }),
    }));
  }, [sim]);

  // Protocol Reserve Revenue — % composition (2026-07-10, owner request): mirrors
  // bciMonthlyCompositionData exactly — each of the 7 sources as a share of that
  // month's GROSS PR revenue (totalPrRaw, i.e. before the Emergency Reserve
  // top-up is deducted — the same base the 7 rows themselves sum to, so the
  // composition check row is a genuine 100%, not skewed by the ER deduction).
  const prMonthlyCompositionData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        const total = row.totalPrRaw || 0;
        const pct = (v) => total > 0 ? (v || 0) / total * 100 : 0;
        return {
          rwaPct:   pct(row.pr_rwa),
          entryPct: pct(row.pr_entry),
          poolPct:  pct(row.pr_pool),
          maintPct: pct(row.pr_maint),
          integPct: pct(row.pr_integ),
          layerPct: pct(row.pr_morpho),
          floatPct: pct(row.pr_float),
          prCum:    row.prCum || 0, // connecting metric — the last row of the table
        };
      }),
    }));
  }, [sim]);

  // Emergency Reserve — performance table (2026-07-10, owner request): its own
  // section, separate from the PR revenue tables. Every field is a direct engine
  // export: `er` (running balance), `erTarget` (at-risk assets x year rate),
  // `er_morpho` (10% of gross Layer yield, credited directly every month), and
  // `erTopUp` (the same top-up shown/removed from the PR breakdown table above —
  // capped at 10% of that month's gross PR revenue). Balance roll-forward:
  // er(t) = er(t-1) + er_morpho(t) + erTopUp(t) — guarded by conservation C5.
  //
  // `atRisk` and `targetRatePct` (added 2026-07-10, owner request, to show the
  // Target formula in full: At-Risk x Rate = Target) are NOT new engine exports —
  // `atRisk` is the exact sum the engine itself uses (morphoAmt + bcDeployed, both
  // already direct exports; identical to how bciNav = layerNav + bciSC is treated
  // as a display identity elsewhere — not a re-derivation of business logic, the
  // same two numbers the engine already added together for erTarget). `targetRatePct`
  // reads ER_RATES — the same module-level constant the engine itself indexes one
  // line above erTarget's own formula — by month, so it can never drift from the
  // engine's actual rate even if ER_RATES is retuned later.
  const erPerformanceTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        const balance = row.er || 0;
        const target  = row.erTarget || 0;
        const atRisk  = (row.morphoAmt || 0) + (row.bcDeployed || 0);
        const targetRatePct = ER_RATES[Math.min(Math.ceil(row.m / 12) - 1, 4)] * 100;
        return {
          balance,
          layerCredit: row.er_morpho || 0,
          topUp:       row.erTopUp || 0,
          atRisk,
          targetRatePct,
          target,
          coveragePct: target > 0 ? (balance / target) * 100 : 100,
        };
      }),
    }));
  }, [sim]);

  const bciPriceCalcTableData = useMemo(() => {
    return Array.from({ length: 3 }, (_, yi) => ({
      year: yi + 1,
      months: Array.from({ length: 12 }, (_, mi) => {
        const row = sim[yi * 12 + mi];
        if (!row) return null;
        // Every field below has a rendered table row (scStart/privGross removed
        // 2026-07-10 with their rows). All direct engine exports — identities
        // (scEnd = prev scEnd + revenue; NAV roll-forward; price x supply = backing)
        // are guarded by conservation C1/C3/C4 + invariant S1.
        const privLayer = row.privateToLayer || 0;
        const retailIn  = row.retailToLayer || 0;
        const layerOut  = (row.privateLayerOut || 0) + (row.retailLayerOut || 0);
        const layerNav  = row.layerNav || 0;
        const revenue   = row.totalBci || 0;
        const scEnd     = row.bciSC || 0;
        const bciNav    = row.bciNav || 0;
        const supply    = row.bciSupply || 0;
        const price     = row.bciPrice || 0;
        const annG      = row.annG    || 0;
        return { privLayer, retailIn, layerOut, layerNav, revenue, scEnd, bciNav, supply, price, annG };
      }),
    }));
  }, [sim]);



  /* Button styles */
  const scenarioBtn = (key, label) => {
    const colors = { default:T.blue, custom:T.green };
    const col = colors[key] || T.amber;
    const active = ap === key;
    return (
      <button key={key} onClick={() => key==="custom" ? setAp("custom") : load(key)}
        style={{ padding:"6px 14px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:500,
          border:`1.5px solid ${active ? col : T.border}`,
          background: active ? col : T.bgEl,
          color: active ? (col === T.amber ? T.ink : "#fff") : T.ink2,
          boxShadow: active ? "none" : SHADOW,
          transition:"all .15s",
        }}>
        {label}
      </button>
    );
  };

  const tabBtn = key => (
    <button key={key} onClick={() => setTab(key)}
      style={{ padding:"5px 12px", borderRadius:6, cursor:"pointer", fontSize:10.5,
        fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em",
        border:`1px solid ${tab===key?T.green:T.border}`,
        background: tab===key ? T.greenSoft : "transparent",
        color: tab===key ? T.greenInk : T.ink3,
      }}>
      {key === "lp" ? "LP Flow" : key === "rwa" ? "RWA Mkt" : "Fees"}
    </button>
  );

  const feeRow = (items) => items.map(([k,v,d]) => (
    <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:4, gap:8 }}>
      <span style={{ fontSize:11, color:T.ink3, flexShrink:0 }}>{k}</span>
      <div style={{ textAlign:"right" }}>
        <span style={{ color:T.green, fontFamily:MONO, fontSize:11, marginRight:8 }}>{v}</span>
        <span style={{ color:T.ink4, fontSize:10.5 }}>{d}</span>
      </div>
    </div>
  ));

  return (
    <>

      <div style={{ background:T.bg, minHeight:"100vh", fontFamily:SANS,
        fontSize:14, color:T.ink, WebkitFontSmoothing:"antialiased" }}>

        {/* ── HEADER ── */}
        <div style={{ background:T.bgEl, borderBottom:`1px solid ${T.border}`,
          padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:T.green2,
                boxShadow:`0 0 0 3px rgba(44,106,87,0.16)` }} />
              <span style={{ fontSize:15, fontWeight:600, color:T.ink, letterSpacing:"-0.01em" }}>
                BOUND Protocol
              </span>
            </div>
            <div style={{ fontSize:11, color:T.ink4, paddingLeft:17 }}>
              Architecture v4 · 10 Revenue Streams · Dynamic Liquidity Waterfall
            </div>
          </div>
          {onOpenDocs && (
            <button onClick={onOpenDocs}
              style={{ padding:"7px 14px", borderRadius:7, cursor:"pointer", fontSize:12,
                fontWeight:600, border:`1px solid ${T.border}`, background:T.bgSoft,
                color:T.ink2, boxShadow:SHADOW, flexShrink:0 }}>
              Documentation
            </button>
          )}
        </div>

        {/* ── SCENARIO BAR ── inputs page shows the scenario buttons; the results
            page shows a Back-to-Inputs button in the same spot instead (owner
            request — replaces the floating sticky button). */}
        <div style={{ background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
          padding:"10px 24px", display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:10 }}>
          {view === "inputs" ? (
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:10.5, color:T.ink3, fontWeight:600, marginRight:4 }}>SCENARIO</span>
              {scenarioBtn("default", "Default")}
              {scenarioBtn("custom","* Custom")}
            </div>
          ) : (
            <button onClick={goToInputs}
              style={{ display:"flex", alignItems:"center", gap:8,
                padding:"6px 14px", borderRadius:7, cursor:"pointer",
                border:`1.5px solid ${T.border}`, background:T.bgEl, color:T.ink2,
                fontSize:12, fontWeight:500, boxShadow:SHADOW }}>
              <span aria-hidden="true" style={{ fontSize:14, lineHeight:1 }}>←</span>
              Back to Inputs
            </button>
          )}
        </div>

        {view === "inputs" && <>
        {/* -- ASSUMPTION SECTIONS -- */}
        <div style={{ padding:"0 24px 4px" }}>

          {/* Private Liquidity Providers */}
          <CollapsibleSection title="Private Liquidity Providers" defaultOpen={true}>
            <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:14 }}>

              <div>
                <div style={{ display:"flex", gap:24, marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <Slider label="Private Seed Allocation ($)" value={p.initPrivateLp} min={100_000} max={10_000_000} step={100_000}
                      onChange={v=>up("initPrivateLp",v)} fmt={fd}
                      hint="One-time institutional deposit at Month 1 only, on top of that month's Monthly Growth. This is the LP's own capital — the protocol does not co-invest or match it." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Monthly Growth ($)" value={p.lpGrowth} min={0} max={5_000_000} step={100_000}
                      onChange={v=>up("lpGrowth",v)} fmt={fd}
                      hint="New institutional capital deposited every month, including Month 1 (added on top of the Seed Allocation that month only). Shown as 'New Capital' in the table below." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="BCI Conversion Rate (%)" value={p.privateBCIConversion||95} min={50} max={100} step={1}
                      onChange={v=>up("privateBCIConversion",v)} fmt={v=>`${v}%`}
                      hint={`Share of the LP's rwaUSD (after the mint fee) that converts to BCI and enters the Liquidity Layer. The other ${100-(p.privateBCIConversion||95)}% stays as idle rwaUSD backing in Bound Core instead — it does not earn BCI's collateral performance.`} />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Monthly Outflow - % of Layer Balance" value={p.lpOutflow} min={0.5} max={50} step={0.5}
                      onChange={v=>up("lpOutflow",v)} fmt={v=>`${v}%`}
                      hint={`Share of the LP's CURRENT Liquidity Layer balance (not the original deposit total) that exits every month via direct contract redemption. No exits at all in the first ${p.lockPeriod ?? 6} months (capital lock) — this rate only applies from month ${(p.lockPeriod ?? 6) + 1} onward.`} />
                  </div>
                </div>

                {/* Private LP - Fees subtitle */}
                <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:10, marginTop:4,
                  paddingBottom:4, borderBottom:`1px solid ${T.border}` }}>
                  Fees
                </div>
                <div style={{ display:"flex", gap:24, marginBottom:16 }}>
                  <div style={{ flex:1 }}>
                    <Slider label="Conversion Fee (%)" value={p.convFeeRwaUSD||0.88} min={0.1} max={2.0} step={0.01}
                      onChange={v=>up("convFeeRwaUSD",v)} fmt={v=>`${v}%`}
                      hint="Charged on the rwaUSD amount converting to/from BCI, on BOTH entry and exit. 100% credited to BCI SC as collateral surplus — the single biggest driver of BCI price growth." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Discounted Conversion Fee (%)" value={p.convFeeBND||0.44} min={0.05} max={1.0} step={0.01}
                      onChange={v=>up("convFeeBND",v)} fmt={v=>`${v}%`}
                      hint="Rate charged when a conversion is paid in BND instead of rwaUSD. Applies to Private AND Retail LPs alike, gated by the single 'BND Discount Usage %' slider in the Retail LP section below. 100% burned — zero credited to BCI SC or Protocol Reserve." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Private Mint / Redeem Fee (%)" value={p.mintRedeemFee||0.3} min={0.05} max={1.0} step={0.05}
                      onChange={v=>up("mintRedeemFee",v)} fmt={v=>`${v}%`}
                      hint="Charged twice at this same rate: on the full deposit at entry (mint), and on the post-conversion-fee rwaUSD at exit (redeem). Both split 80% BCI SC / 20% Protocol Reserve." />
                  </div>
                  <div style={{ flex:1 }} />
                </div>

                {/* Private Capital Allocation - description card, then the 5-year table */}
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                  overflow:"hidden", marginBottom:10 }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft,
                    borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                      textTransform:"uppercase", letterSpacing:"0.08em" }}>
                      Private Capital Allocation — What Each Row Means
                    </span>
                  </div>
                  <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
                    {[
                      { row:"New Capital", col:T.green,
                        what:"The gross monthly deposit — month 1 includes the seed allocation plus that month's growth; every month after is just the monthly growth. This is BEFORE the mint fee or any conversion — the full amount the LP wires in." },
                      { row:"Outflow", col:T.red,
                        what:`This month's exit volume: the Monthly Outflow % applied to the CURRENT Layer balance (Remaining), not to the original deposit. Always zero for the first ${p.lockPeriod ?? 6} months — Private LP capital is locked and cannot exit at all during that window.` },
                      { row:"Remaining", col:T.ink,
                        what:"The actual Liquidity Layer position after fees: New Capital arrives net of the mint fee, the Bound-Core-retained share, and the conversion fee — then Outflow leaves. This is the real number that backs BCI price, not the gross deposit total." },
                    ].map(({ row, col, what }, i, arr) => (
                      <div key={row} style={{
                        flex:1, padding:"12px 14px",
                        borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ fontSize:11.5, fontWeight:600, color:col,
                          marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                          {row}
                        </div>
                        <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                      textTransform:"uppercase", letterSpacing:"0.08em" }}>
                      Private Capital Allocation - 3 Years
                    </span>
                    <div style={{ display:"flex", gap:12, fontSize:10 }}>
                      {[["New Capital",T.green],["Outflow",T.red],["Remaining",T.ink]].map(([l,c])=>(
                        <span key={l} style={{ color:c, fontWeight:600 }}>* {l}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <tbody>
                        {privateCapitalTableData.map(({ year, months }) => (
                          [
                            <tr key={`${year}-hdr`} style={{ background:T.bgSoft }}>
                              <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                                fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                                borderBottom:`1px solid ${T.border}`, width:110 }}>Year {year}</th>
                              {months.map((_,mi)=>(
                                <th key={mi} style={{ padding:"6px 6px", textAlign:"right", color:T.ink3,
                                  fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}` }}>
                                  M{(year-1)*12+mi+1}
                                </th>
                              ))}
                            </tr>,
                            ...[
                              { key:"newCapital", label:"New Capital", col:T.green,  bold:false },
                              { key:"outflow",    label:"Outflow",     col:T.red,    bold:false },
                              { key:"remaining",  label:"Remaining",   col:T.ink,    bold:true  },
                            ].map(({ key, label, col, bold }) => (
                              <tr key={`${year}-${key}`} style={{
                                borderBottom: key==="remaining" ? `2px solid ${T.borderS}` : `1px solid ${T.border}`,
                                background: key==="remaining" ? T.bgSoft : T.bgEl,
                              }}>
                                <td style={{ padding:"5px 12px", color:bold?T.ink:T.ink3,
                                  fontSize:9.5, fontWeight:bold?700:400, whiteSpace:"nowrap" }}>{label}</td>
                                {months.map((d,mi)=>(
                                  <td key={mi} style={{ padding:"5px 6px", textAlign:"right",
                                    fontFamily:MONO, fontSize:10,
                                    color: d[key]===0?T.ink5:col, fontWeight:bold?700:500 }}>
                                    {d[key]===0?"-":fd(d[key],d[key]>=1e6?1:0)}
                                  </td>
                                ))}
                              </tr>
                            )),
                          ]
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Private LP - Fee Reference Card */}
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                  overflow:"hidden", marginBottom:10 }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft,
                    borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                      textTransform:"uppercase", letterSpacing:"0.08em" }}>
                      Private LP - Fee Structure & Distribution
                    </span>
                  </div>
                  <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
                    {[
                      { fee:"Mint Fee", rate:"On full deposit . direct contract",
                        bci:"80%", pr:"20%",
                        what:"Charged when a private LP deposits USDC directly into the protocol contract (bypassing the pool). Applied to the full deposit amount before any conversion." },
                      { fee:"Conversion Fee - rwaUSD path", rate:"On rwaUSD amount converting to BCI",
                        bci:"100%", pr:"0%",
                        what:`Charged when rwaUSD is converted to BCI. At ${p.convFeeRwaUSD||0.88}%, converting $1M rwaUSD costs $${Math.round((p.convFeeRwaUSD||0.88)*10_000).toLocaleString()} - credited entirely to BCI SC as collateral surplus, directly supporting BCI price.` },
                      { fee:"Conversion Fee - BND path", rate:"Set independently by the Discounted Conversion Fee slider",
                        bci:"0%", pr:"0%",
                        what:`When the conversion fee is paid using BND governance tokens, ${p.convFeeBND||0.44}% is charged instead of ${p.convFeeRwaUSD||0.88}% (both sliders set independently — not automatically 50%). BND tokens are burned permanently - reducing BND supply, no revenue credited to any pool.` },
                      { fee:"Redeem Fee", rate:"On rwaUSD after conversion fee deducted",
                        bci:"80%", pr:"20%",
                        what:"Charged when a private LP exits - applied to the rwaUSD amount after the conversion fee has already been deducted. The LP receives USDC net of both the conversion and redeem fees." },
                    ].map(({ fee, rate, bci, pr, what }, i, arr) => (
                      <div key={fee} style={{
                        flex:1, padding:"12px 14px",
                        borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ fontSize:11.5, fontWeight:600, color:T.ink,
                          marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                          {fee}
                        </div>
                        <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color: bci==="0%" ? T.ink4 : T.green,
                            background: bci==="0%" ? T.bgInset : T.greenSoft,
                            padding:"2px 7px", borderRadius:3 }}>
                            {bci} BCI SC
                          </span>
                          <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color: pr==="0%" ? T.ink4 : T.blue,
                            background: pr==="0%" ? T.bgInset : T.blueSoft,
                            padding:"2px 7px", borderRadius:3 }}>
                            {pr} Protocol
                          </span>
                          {bci==="0%" && pr==="0%" && (
                            <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                              color:T.amber, background:T.amberSoft,
                              padding:"2px 7px", borderRadius:3 }}>
                              100% Burned
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private LP Fee Revenue — split by fee type (Minting/Redemption vs
                    Conversion), hierarchical main-row + destination-subrow format, plus
                    a separate Totals table. Sourced from privateFeesTableData, which in
                    turn reads engine sim fields directly (no independent recompute). */}
                {(() => {
                  const { months } = privateFeesTableData[feeYear - 1] || { months: [] };
                  return (
                    <>
                      <FeeTable title="Private LP — Minting & Redemption Fees"
                        legend={[["-> BCI SC",T.green],["-> Protocol Reserve",T.blue]]}
                        year={feeYear} onYear={setFeeYear} years={3} months={months}
                        rows={[
                          { label:"Mint Fee (Entry)", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>d.mintInBCI+d.mintInPR },
                          { key:"mintInBCI", label:"  -> BCI SC",             col:T.green, bg:T.bgSoft },
                          { key:"mintInPR",  label:"  -> Protocol Reserve",   col:T.blue,  bg:T.bgSoft, sep:true },
                          { label:"Redeem Fee (Exit)", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>d.redeemOutBCI+d.redeemOutPR },
                          { key:"redeemOutBCI", label:"  -> BCI SC",           col:T.green, bg:T.bgSoft },
                          { key:"redeemOutPR",  label:"  -> Protocol Reserve", col:T.blue,  bg:T.bgSoft, sep:true },
                        ]} />
                      <FeeTable title="Private LP — Conversion Fees (rwaUSD <-> BCI)"
                        legend={[["-> BCI SC",T.green2],["BND Burn",T.amber]]}
                        year={feeYear} months={months}
                        rows={[
                          { label:"Entry Conversion Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>d.convInBCI+d.convInBND },
                          { key:"convInBCI", label:"  -> BCI SC",   col:T.green2, bg:T.bgSoft },
                          { key:"convInBND", label:"  -> BND Burn", col:T.amber,  bg:T.bgSoft, sep:true },
                          { label:"Exit Conversion Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>d.convOutBCI+d.convOutBND },
                          { key:"convOutBCI", label:"  -> BCI SC",   col:T.green2, bg:T.bgSoft },
                          { key:"convOutBND", label:"  -> BND Burn", col:T.amber,  bg:T.bgSoft, sep:true },
                        ]} />
                      <FeeTable title="Private LP — Totals" year={feeYear} months={months}
                        rows={[
                          { key:"totalBCI", label:"TOTAL -> BCI SC",             col:T.green, bg:T.greenSoft, bold:true },
                          { key:"totalPR",  label:"TOTAL -> Protocol Reserve",   col:T.blue,  bg:T.blueSoft,  bold:true },
                          { key:"totalBND", label:"TOTAL   BND Burn Value",     col:T.amber, bg:T.amberSoft, bold:true, sep:true },
                        ]} />
                    </>
                  );
                })()}
              </div>

            </div>
          </CollapsibleSection>

          {/* Retail Liquidity Providers (Pool) */}
          <CollapsibleSection title="Retail Liquidity Providers (Pool)" defaultOpen={true}>
            <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:14 }}>

              <div>
                {/* Row 1 - pool config sliders */}
                <div style={{ display:"flex", gap:24, marginBottom:18 }}>
                  <div style={{ flex:1 }}>
                    <Slider label="Initial Pool Volume at Launch ($)" value={p.poolInitialVolume||50_000} min={10_000} max={500_000} step={10_000}
                      onChange={v=>up("poolInitialVolume",v)} fmt={fd}
                      hint="Trading volume on the day the pool opens" />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Pool Start Month" value={p.poolStart} min={1} max={12} step={1}
                      onChange={v=>up("poolStart",v)} fmt={v=>`Month ${v}`}
                      hint="Months before this show $0 in the table below" />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Retail BCI Conversion Rate (%)" value={p.retailBCIConversion||98} min={50} max={100} step={1}
                      onChange={v=>up("retailBCIConversion",v)} fmt={v=>`${v}%`}
                      hint={`${100-(p.retailBCIConversion||98)}% stays idle as rwaUSD in Bound Core`} />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="BND Discount Usage (%)" value={p.bndUsage} min={0} max={60} step={5}
                      onChange={v=>up("bndUsage",v)} fmt={v=>`${v}%`}
                      hint="Conversions paying with BND token (100% burned)" />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="Monthly Outflow - % of Retail Layer" value={p.retailOutflowRate||5} min={0.5} max={50} step={0.5}
                      onChange={v=>up("retailOutflowRate",v)} fmt={v=>`${v}%`}
                      hint="Percentage of retail BCI capital in the Layer that converts BCI->rwaUSD and sells on pool each month." />
                  </div>
                </div>

                {/* Retail LP - Fees subtitle */}
                <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:10, marginTop:4,
                  paddingBottom:4, borderBottom:`1px solid ${T.border}` }}>
                  Fees
                </div>
                <div style={{ display:"flex", gap:24, marginBottom:18 }}>
                  <div style={{ flex:1 }}>
                    <Slider label="Pool Trading Fee (%)" value={p.poolFee||0.3} min={0.05} max={1.0} step={0.05}
                      onChange={v=>up("poolFee",v)} fmt={v=>`${v}%`}
                      hint="Fee charged on every rwaUSD/USDC swap on the Uniswap v4 pool -> 80% BCI SC / 20% Protocol Reserve" />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="APSS Profit Capture (%)" value={p.apssFee||0.5} min={0.05} max={2.0} step={0.05}
                      onChange={v=>up("apssFee",v)} fmt={v=>`${v}%`}
                      hint="Protocol arbitrage profit from peg stabilization - not a fee charged to users -> 80% BCI SC / 20% Protocol Reserve" />
                  </div>
                  <div style={{ flex:3 }} />
                </div>

                {/* Row 2 - year-by-year growth rates. Year 4/5 sliders removed
                    2026-07-10 (owner-directed) — the engine horizon is a hard 36
                    months (3 years), so poolYearIdx (see simulate()) can never
                    exceed index 2 (Year 3); Year 4/5 rates were unreachable dead
                    controls (P10 pitfall). */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>
                    Pool Trading Volume - Monthly Growth Rate by Year
                  </div>
                  <div style={{ display:"flex", gap:24 }}>
                    {[
                      ["Year 1 (%/mo)", "poolGrowthY1", p.poolGrowthY1||20, "Fastest - early stage"],
                      ["Year 2 (%/mo)", "poolGrowthY2", p.poolGrowthY2||10, "Growth begins to slow"],
                      ["Year 3 (%/mo)", "poolGrowthY3", p.poolGrowthY3||6,  "Protocol maturing"],
                    ].map(([label, key, val, hint]) => (
                      <div key={key} style={{ flex:1 }}>
                        <Slider label={label} value={val} min={1} max={60} step={1}
                          onChange={v=>up(key,v)} fmt={v=>`${v}%`} hint={hint} />
                      </div>
                    ))}
                    <div style={{ flex:2 }} />
                  </div>
                </div>

                {/* Retail LP - Fee Reference Card */}
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                  overflow:"hidden", marginBottom:10 }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft,
                    borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                      textTransform:"uppercase", letterSpacing:"0.08em" }}>
                      Retail LP - Fee Structure & Distribution
                    </span>
                  </div>
                  <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
                    {[
                      { fee:"Pool Trading Fee - Buy", rate:"On retail pool buy volume",
                        bci:"80%", pr:"20%",
                        what:"Charged on every rwaUSD purchase on the Uniswap v4 pool. Retail LPs pay this when buying rwaUSD to then convert to BCI. The large majority flows to BCI SC, directly supporting BCI price growth." },
                      { fee:"APSS Revenue - Buy", rate:"On retail pool buy volume",
                        bci:"80%", pr:"20%",
                        what:"Protocol arbitrage profit captured by the Atomic Peg Stabilization System when retail buy pressure pushes rwaUSD above $1. Not a fee charged to users - BOUND captures the spread from peg restoration." },
                      { fee:"Conversion Fee - Buy", rate:"On rwaUSD amount converting to BCI",
                        bci:"100%", pr:"0%",
                        what:"Charged when retail buyers convert rwaUSD to BCI after purchasing on the pool. Credited entirely to BCI SC as collateral surplus. BND discount path (50% off) results in BND burn instead." },
                      { fee:"Conversion Fee - Exit", rate:"On BCI amount converting back to rwaUSD",
                        bci:"100%", pr:"0%",
                        what:"Charged when retail LPs exit by converting BCI back to rwaUSD before selling on the pool. Same 100% BCI SC credit as on entry - supports BCI price on both the way in and out." },
                      { fee:"Pool Trading Fee - Exit", rate:"On retail exit sell volume",
                        bci:"80%", pr:"20%",
                        what:"Charged when retail LPs sell rwaUSD on the pool to exit their position. The exit creates sell-side pool volume which generates both pool fees and APSS revenue - retail exits contribute to BCI SC twice (conversion + pool)." },
                      { fee:"APSS Revenue - Exit", rate:"On retail exit sell volume",
                        bci:"80%", pr:"20%",
                        what:"APSS arbitrage profit captured when retail exit sell pressure pushes rwaUSD below $1. BOUND buys rwaUSD cheaply and burns it, restoring the peg and capturing the spread as protocol revenue." },
                    ].map(({ fee, rate, bci, pr, what }, i, arr) => (
                      <div key={fee} style={{
                        flex:1, padding:"12px 14px",
                        borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ fontSize:11.5, fontWeight:600, color:T.ink,
                          marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                          {fee}
                        </div>
                        <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                        <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color:T.green, background:T.greenSoft,
                            padding:"2px 7px", borderRadius:3 }}>
                            {bci} BCI SC
                          </span>
                          <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color: pr==="0%" ? T.ink4 : T.blue,
                            background: pr==="0%" ? T.bgInset : T.blueSoft,
                            padding:"2px 7px", borderRadius:3 }}>
                            {pr} Protocol
                          </span>
                        </div>
                        <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Retail LP Fee Revenue — Trading Volume, then split by fee type
                    (Trading+APSS vs Conversion), hierarchical rows, plus Totals. */}
                {(() => {
                  const { months } = retailFeesTableData[retailFeeYear - 1] || { months: [] };
                  return (
                    <>
                      <FeeTable title="Retail LP — Pool Trading Volume"
                        year={retailFeeYear} onYear={setRetailFeeYear} years={3} months={months}
                        rows={[
                          { label:"Pool Trading Volume", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retailPoolVol||0)+(d.retailExitSellVol||0) },
                          { key:"retailPoolVol",      label:"  -> Buy (entry)", col:T.green2, bg:T.bgSoft },
                          { key:"retailExitSellVol",  label:"  -> Sell (exit)", col:T.amber,  bg:T.bgSoft, sep:true },
                        ]} />
                      <FeeTable title="Retail LP — Trading & APSS Fees"
                        legend={[["-> BCI SC",T.green],["-> Protocol Reserve",T.blue]]}
                        year={retailFeeYear} onYear={setRetailFeeYear} years={3} months={months}
                        rows={[
                          { label:"Buy - Pool Trading Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retBuyPoolFeeBCI||0)+(d.retBuyPoolFeePR||0) },
                          { key:"retBuyPoolFeeBCI", label:"  -> BCI SC",           col:T.green, bg:T.bgSoft },
                          { key:"retBuyPoolFeePR",  label:"  -> Protocol Reserve", col:T.blue,  bg:T.bgSoft, sep:true },
                          { label:"Buy - APSS Revenue", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retBuyAPSSBCI||0)+(d.retBuyAPSSPR||0) },
                          { key:"retBuyAPSSBCI", label:"  -> BCI SC",           col:T.green, bg:T.bgSoft },
                          { key:"retBuyAPSSPR",  label:"  -> Protocol Reserve", col:T.blue,  bg:T.bgSoft, sep:true },
                          { label:"Exit - Pool Trading Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retExitPoolFeeBCI||0)+(d.retExitPoolFeePR||0) },
                          { key:"retExitPoolFeeBCI", label:"  -> BCI SC",           col:T.green, bg:T.bgSoft },
                          { key:"retExitPoolFeePR",  label:"  -> Protocol Reserve", col:T.blue,  bg:T.bgSoft, sep:true },
                          { label:"Exit - APSS Revenue", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retExitAPSSBCI||0)+(d.retExitAPSSPR||0) },
                          { key:"retExitAPSSBCI", label:"  -> BCI SC",           col:T.green, bg:T.bgSoft },
                          { key:"retExitAPSSPR",  label:"  -> Protocol Reserve", col:T.blue,  bg:T.bgSoft, sep:true },
                        ]} />
                      <FeeTable title="Retail LP — Conversion Fees (rwaUSD <-> BCI)"
                        legend={[["-> BCI SC",T.green2],["BND Burn",T.amber]]}
                        year={retailFeeYear} onYear={setRetailFeeYear} years={3} months={months}
                        rows={[
                          { label:"Buy Conversion Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retBuyConvBCI||0)+(d.retBuyConvBND||0) },
                          { key:"retBuyConvBCI", label:"  -> BCI SC",   col:T.green2, bg:T.bgSoft },
                          { key:"retBuyConvBND", label:"  -> BND Burn", col:T.amber,  bg:T.bgSoft, sep:true },
                          { label:"Exit Conversion Fee", col:T.ink, bg:T.bgEl, bold:true,
                            calc:d=>(d.retExitConvBCI||0)+(d.retExitConvBND||0) },
                          { key:"retExitConvBCI", label:"  -> BCI SC",   col:T.green2, bg:T.bgSoft },
                          { key:"retExitConvBND", label:"  -> BND Burn", col:T.amber,  bg:T.bgSoft, sep:true },
                        ]} />
                      <FeeTable title="Retail LP — Totals" year={retailFeeYear} months={months}
                        rows={[
                          { key:"totalBCI", label:"TOTAL -> BCI SC",           col:T.green, bg:T.greenSoft, bold:true },
                          { key:"totalPR",  label:"TOTAL -> Protocol Reserve", col:T.blue,  bg:T.blueSoft,  bold:true },
                          { key:"totalBND", label:"TOTAL   BND Burn Value",   col:T.amber, bg:T.amberSoft, bold:true, sep:true },
                        ]} />
                    </>
                  );
                })()}

              </div>

            </div>
          </CollapsibleSection>

          {/* ── RWA USERS — LIQUIDATION & MINTING ── */}
          <CollapsibleSection title="RWA Markets - Liquidation & Minting">
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:14 }}>

              {/* Intro text */}
              <div style={{ fontSize:11, color:T.ink3, lineHeight:1.6 }}>
                Each market has its own liquidation and minting open dates. Capacity for RWA liquidations is allocated in strict order each month: (1) estimated USDC on hand is sized off THIS month's real Layer minus what is already committed to held RWA inventory and pipeline cash, plus pipeline cash returning this month; (2) BCI redemptions are served FIRST — LP exits are an obligation, RWA liquidation service is discretionary; (3) an LCR guard caps acceptance so the month-end LCR never drops below the configured floor ({(yld.rwaLcrTarget ?? 1.5).toFixed(2)}x); (4) whatever remains serves market demand ({fd(Math.min(md?.rwaFundsAfterBci ?? 0, md?.rwaLcrCap ?? Infinity))} at M{ms}) — see the Layer Capacity card below for the full waterfall. Minting volume = min(held RWA inventory, market demand).
              </div>

              {/* Named Markets */}
              {rwaMarkets.map((mk, i) => {
                const isOpen = rwaMarketOpen[i];
                const monthsLive = ms > mk.launchMonth ? ms - mk.launchMonth : 0;
                const aumAtMs = mk.aum * Math.pow(1 + (mk.aumGrowth ?? 2) / 100, monthsLive);
                const liqDemandAtMs = ms >= mk.launchMonth
                  ? aumAtMs * (mk.liqRate ?? 0.8) / 100 : 0;
                const mintDemandAtMs = ms >= (mk.mintStartMonth || mk.launchMonth+8)
                  ? aumAtMs * (mk.mintRate ?? 0.4) / 100 : 0;
                const liqActive = ms >= mk.launchMonth;
                const mintActive = ms >= mk.launchMonth && ms >= (mk.mintStartMonth || mk.launchMonth+8);

                return (
                  <div key={i} style={{ border:`1px solid ${T.border}`, borderRadius:8,
                    overflow:"hidden", background:T.bgEl }}>
                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"9px 14px", background:T.bgSoft, cursor:"pointer",
                      borderBottom: isOpen ? `1px solid ${T.border}` : "none" }}
                      onClick={() => toggleMarketOpen(i)}>
                      <span style={{ fontSize:13, color:T.ink3, display:"inline-block",
                        transition:"transform .2s",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>{'>'}</span>
                      <span style={{ fontSize:11.5, fontWeight:600, color:T.ink, flex:1 }}>
                        {mk.name || `Market ${i+1}`}
                      </span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:10, color:T.ink4, fontFamily:MONO }}>
                          Live M{mk.launchMonth} . {fd(mk.aum)} AUM
                        </span>
                        {liqActive && (
                          <span style={{ fontSize:9.5, fontFamily:MONO, color:T.amber,
                            background:T.amberSoft, padding:"1px 6px", borderRadius:3 }}>
                            Liq {fd(liqDemandAtMs)}/mo
                          </span>
                        )}
                        {mintActive && (
                          <span style={{ fontSize:9.5, fontFamily:MONO, color:T.green2,
                            background:T.greenSoft, padding:"1px 6px", borderRadius:3 }}>
                            Mint {fd(mintDemandAtMs)}/mo
                          </span>
                        )}
                        {/* Upcoming market: show when liquidation opens. (Condition was
                            previously `!liqActive && ms >= launchMonth`, which is
                            self-contradictory — liqActive IS ms >= launchMonth — so the
                            badge could never render.) */}
                        {!liqActive && mk.active && (
                          <span style={{ fontSize:9.5, color:T.ink4,
                            background:T.bgInset, padding:"1px 6px", borderRadius:3 }}>
                            Liq opens M{mk.launchMonth}
                          </span>
                        )}
                      </div>
                      {rwaMarkets.length > 1 && (
                        <button onClick={e=>{e.stopPropagation();removeMarket(i);}}
                          style={{ fontSize:10, color:T.red, background:"transparent",
                            border:`1px solid ${T.red}40`, borderRadius:4, padding:"2px 7px",
                            cursor:"pointer", marginLeft:4 }}>Remove</button>
                      )}
                    </div>

                    {isOpen && (
                      <div style={{ padding:"14px 16px" }}>
                        {/* Market name */}
                        <div style={{ marginBottom:14 }}>
                          <div style={{ fontSize:10.5, color:T.ink3, textTransform:"uppercase",
                            letterSpacing:"0.08em", fontWeight:600, marginBottom:4 }}>Market Name</div>
                          <input value={mk.name}
                            onChange={e=>upMarket(i,"name",e.target.value)}
                            placeholder="e.g. OUSG / Ondo Finance"
                            style={{ width:"100%", padding:"6px 10px", fontSize:12,
                              border:`1px solid ${T.border}`, borderRadius:6,
                              background:T.bgSoft, color:T.ink, fontFamily:SANS,
                              outline:"none", boxSizing:"border-box" }} />
                        </div>

                        {/* Row 1 - Demand & Timing */}
                        <div style={{ fontSize:10, color:T.ink3, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.08em",
                          marginBottom:10, borderBottom:`1px solid ${T.border}`, paddingBottom:4 }}>
                          Market & Demand Parameters
                        </div>
                        <div style={{ display:"flex", gap:20, marginBottom:16 }}>
                          <div style={{ flex:1 }}>
                            <Slider label="Market Launch Month" value={mk.launchMonth} min={1} max={60} step={1}
                              onChange={v=>upMarket(i,"launchMonth",v)} fmt={v=>`Month ${v}`}
                              hint="When this market goes live on BOUND. Integration fee credited on this month." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Partner AUM at Launch ($)" value={mk.aum} min={10_000_000} max={1_000_000_000} step={10_000_000}
                              onChange={v=>upMarket(i,"aum",v)} fmt={fd}
                              hint="Total assets issued by this partner at launch (e.g. OUSG = $410M TVL). Determines the pool of holders who might want to exit via BOUND." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Monthly AUM Growth (%)" value={mk.aumGrowth ?? 2} min={0} max={10} step={0.5}
                              onChange={v=>upMarket(i,"aumGrowth",v)} fmt={v=>`${v}%/mo`}
                              hint="How fast this partner's total issuance grows per month." />
                          </div>
                        </div>

                        {/* Row 2 - Liquidation */}
                        <div style={{ fontSize:10, color:T.ink3, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.08em",
                          marginBottom:10, borderBottom:`1px solid ${T.border}`, paddingBottom:4 }}>
                          Liquidation Service (opens on Market Launch)
                        </div>
                        <div style={{ display:"flex", gap:20, marginBottom:16 }}>
                          <div style={{ flex:1 }}>
                            <Slider label="Monthly Liquidation Rate (% of AUM)" value={mk.liqRate ?? 0.8} min={0.1} max={5} step={0.1}
                              onChange={v=>upMarket(i,"liqRate",v)} fmt={v=>`${v}%`}
                              hint={`% of partner AUM that routes through BOUND monthly. At M${ms}: ${mk.liqRate ?? 0.8}% x ${fd(aumAtMs)} (AUM at M${ms}) = ${fd(liqDemandAtMs)}/mo demand.`} />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Liquidation Haircut - Baseline (%)" value={mk.liqHaircut ?? 0.5} min={0.1} max={5} step={0.1}
                              onChange={v=>upMarket(i,"liqHaircut",v)} fmt={v=>`${v}%`}
                              hint="BOUND's spread when buying this RWA. This is the BASELINE only — a gentle 3-step ladder adds up to +0.30pp on top as concentration rises, both for this market specifically and for total RWA held across all markets (see the RWA Concentration bars below). The effective (baseline + live escalation) rate is what actually applies each month." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Issuer Redemption Period (days)" value={mk.issuerRedemptionDays ?? 30} min={1} max={180} step={1}
                              onChange={v=>upMarket(i,"issuerRedemptionDays",v)} fmt={v=>`T+${v} days`}
                              hint="How long it takes this issuer to return USDC to BOUND after redemption is triggered. OUSG is typically T+30. More illiquid assets can be T+90 or longer. This determines how fast the Layer recovers liquidity after a concentration breach." />
                          </div>
                        </div>

                        {/* Row 3 - Minting */}
                        <div style={{ fontSize:10, color:T.ink3, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.08em",
                          marginBottom:10, borderBottom:`1px solid ${T.border}`, paddingBottom:4 }}>
                          Minting Service
                        </div>
                        <div style={{ display:"flex", gap:20 }}>
                          <div style={{ flex:1 }}>
                            <Slider label="Minting Opens - Month" value={mk.mintStartMonth ?? mk.launchMonth+8} min={mk.launchMonth} max={60} step={1}
                              onChange={v=>upMarket(i,"mintStartMonth",Math.max(v, mk.launchMonth))} fmt={v=>`Month ${v}`}
                              hint="When BOUND enables users to buy this RWA from Layer collateral. Opens after liquidation has built sufficient inventory." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Monthly Minting Rate (% of AUM)" value={mk.mintRate ?? 0.4} min={0.1} max={5} step={0.1}
                              onChange={v=>upMarket(i,"mintRate",v)} fmt={v=>`${v}%`}
                              hint={`% of partner AUM that mints via BOUND monthly. At M${ms}: ${mk.mintRate ?? 0.4}% x ${fd(aumAtMs)} (AUM at M${ms}) = ${fd(mintDemandAtMs)}/mo demand.`} />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Minting Haircut - Baseline (%)" value={mk.mintHaircut ?? 0.3} min={0.05} max={3} step={0.05}
                              onChange={v=>upMarket(i,"mintHaircut",v)} fmt={v=>`${v}%`}
                              hint="BOUND's spread when selling RWA to buyers. Lower than liquidation - no funding risk on inventory already held. This is the BASELINE - the minting discount (Liquidity Layer section) reduces the applied rate when held RWA concentration is high or the protocol is in stress, to attract buyers and drain inventory." />
                          </div>
                        </div>

                        {/* Row 4 - Per-market Fees */}
                        <div style={{ fontSize:10, color:T.ink3, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.08em",
                          marginBottom:10, marginTop:16, borderBottom:`1px solid ${T.border}`, paddingBottom:4 }}>
                          Fees - This Market
                        </div>
                        <div style={{ display:"flex", gap:20 }}>
                          <div style={{ flex:1 }}>
                            <Slider label="RWA Pool Trading Fee (%)" value={mk.rwaTradeF ?? 0.3} min={0.05} max={1.0} step={0.05}
                              onChange={v=>upMarket(i,"rwaTradeF",v)} fmt={v=>`${v}%`}
                              hint="Charged per direction on each RWA transaction through this market. This is the BASELINE only — the same concentration escalation ladder that bumps the liquidation haircut also adds up to +0.15pp here as held RWA rises." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Integration Fee ($)" value={mk.integFee ?? 50_000} min={0} max={500_000} step={25_000}
                              onChange={v=>upMarket(i,"integFee",v)} fmt={fd}
                              hint="One-time onboarding fee for this market -> 100% Protocol Reserve. Credited on the market launch month." />
                          </div>
                          <div style={{ flex:1 }}>
                            <Slider label="Annual Maintenance Fee ($)" value={mk.maintFee ?? 75_000} min={0} max={250_000} step={25_000}
                              onChange={v=>upMarket(i,"maintFee",v)} fmt={fd}
                              hint="Recurring annual fee for this market -> 20% BCI SC / 80% Protocol Reserve." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {rwaMarkets.length < 10 && (
                <button onClick={addMarket}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px",
                    border:`1.5px dashed ${T.border}`, borderRadius:7, cursor:"pointer",
                    background:"transparent", color:T.ink3, fontSize:11.5, fontWeight:500,
                    transition:"all .15s" }}>
                  <span style={{ fontSize:16, color:T.amber, lineHeight:1 }}>+</span>
                  Add RWA Market ({rwaMarkets.length}/10 used)
                </button>
              )}

              {/* -- RWA Fee Reference Card -- */}
              <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                overflow:"hidden" }}>
                <div style={{ padding:"8px 14px", background:T.bgSoft,
                  borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                    textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    RWA Market - Fee Structure & Distribution
                  </span>
                </div>
                <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
                  {[
                    { fee:"Liquidation Trade Fee", rate:"Per market . set in market card",
                      bci:"80%", pr:"20%",
                      what:"Charged on each liquidation routed through BOUND. The RWA holder sells their position to BOUND, receives rwaUSD, and this fee is applied to the volume processed." },
                    { fee:"Liquidation Haircut", rate:"Baseline + escalation if concentrated",
                      bci:"80%", pr:"20%",
                      what:"BOUND's spread when purchasing an RWA below face value. At 0.5%, BOUND pays $995K for a $1M position and recovers $1M at issuer redemption - the $5K spread is protocol revenue. Rises automatically if this RWA exceeds its Layer concentration limit." },
                    { fee:"Minting Trade Fee", rate:"Per market . set in market card",
                      bci:"80%", pr:"20%",
                      what:"Charged when a user buys rwaUSD on the pool to mint a new RWA position. BOUND sells RWA from Layer inventory to the buyer and applies this fee to the volume." },
                    { fee:"Minting Haircut", rate:"Baseline − concentration discount",
                      bci:"80%", pr:"20%",
                      what:"BOUND's spread when selling RWA inventory back to buyers. At 0.3%, a buyer acquiring a $1M position pays $1.003M in rwaUSD - the $3K spread is protocol revenue. Lower than the liquidation haircut because BOUND already holds the asset and has no funding risk. When held RWA concentration is high (or the protocol is in stress), the minting discount reduces this spread to attract buyers and drain inventory - the discounted rate is what the engine actually books." },
                    { fee:"Integration Fee", rate:"Per market . one-time on launch",
                      bci:"0%", pr:"100%",
                      what:"One-time onboarding fee paid by the RWA issuer when their market goes live on BOUND. Covers the cost of building the minting, redemption, and pricing infrastructure for that specific asset." },
                    { fee:"Annual Maintenance Fee", rate:"Per market . billed monthly",
                      bci:"20%", pr:"80%",
                      what:"Recurring annual fee per active RWA market, charged monthly. Covers ongoing infrastructure, oracle maintenance, and issuer relationship management for that market." },
                  ].map(({ fee, rate, bci, pr, what }, i, arr) => (
                    <div key={fee} style={{
                      flex:1, padding:"12px 14px",
                      borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:T.ink,
                        marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                        {fee}
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                        <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                          color:T.green, background:T.greenSoft,
                          padding:"2px 7px", borderRadius:3 }}>
                          {bci} BCI SC
                        </span>
                        <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                          color:T.blue, background:T.blueSoft,
                          padding:"2px 7px", borderRadius:3 }}>
                          {pr} Protocol
                        </span>
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* -- RWA Fee Revenue Table -- */}
              {(() => {
                // Indexed by the FULL rwaMarkets array (matching rwaFeesTableData.perMarket)
                // — filtering to active-only here would re-index sequentially and mismatch
                // the selector buttons against the per-market data (same defect class as
                // the Layer Composition mkNames fix). Inactive markets are skipped in render.
                const marketTabs = rwaMarkets.map((mk,i)=>({ idx:i, active:mk.active, name:mk.name||`Market ${i+1}` }));
                const selectedData = rwaFeeMarket === -1
                  ? rwaFeesTableData.combined
                  : rwaFeesTableData.perMarket[rwaFeeMarket]?.years || rwaFeesTableData.combined;
                const { months } = selectedData[rwaFeeYear - 1] || { months: [] };

                const rows = [
                  { key:"liqVol",        label:"Liq. Volume",                    col:T.amber,  bg:T.bgEl,      bold:false, sep:false, isVol:true  },
                  { key:"liqTradeBCI",   label:"Liq. Trade Fee -> BCI SC",        col:T.green,  bg:T.bgEl,      bold:false, sep:false, isVol:false },
                  { key:"liqTradePR",    label:"Liq. Trade Fee -> Protocol",      col:T.blue,   bg:T.bgEl,      bold:false, sep:false, isVol:false },
                  { key:"liqHaircutBCI", label:"Liq. Haircut -> BCI SC",          col:T.green,  bg:T.bgEl,      bold:false, sep:false, isVol:false },
                  { key:"liqHaircutPR",  label:"Liq. Haircut -> Protocol",        col:T.blue,   bg:T.bgEl,      bold:false, sep:true,  isVol:false },
                  { key:"mintVol",       label:"Mint Volume",                    col:T.green2, bg:T.bgSoft,    bold:false, sep:false, isVol:true  },
                  { key:"mintTradeBCI",  label:"Mint Trade Fee -> BCI SC",        col:T.green,  bg:T.bgSoft,    bold:false, sep:false, isVol:false },
                  { key:"mintTradePR",   label:"Mint Trade Fee -> Protocol",      col:T.blue,   bg:T.bgSoft,    bold:false, sep:false, isVol:false },
                  { key:"mintHaircutBCI",label:"Mint Haircut -> BCI SC",          col:T.green,  bg:T.bgSoft,    bold:false, sep:false, isVol:false },
                  { key:"mintHaircutPR", label:"Mint Haircut -> Protocol",        col:T.blue,   bg:T.bgSoft,    bold:false, sep:true,  isVol:false },
                  { key:"integPR",       label:"Integration Fee -> Protocol",     col:T.blue,   bg:T.bgEl,      bold:false, sep:false, isVol:false },
                  { key:"maintBCI",      label:"Maintenance Fee -> BCI SC",       col:T.green,  bg:T.bgEl,      bold:false, sep:false, isVol:false },
                  { key:"maintPR",       label:"Maintenance Fee -> Protocol",     col:T.blue,   bg:T.bgEl,      bold:false, sep:true,  isVol:false },
                  { key:"totalVol",      label:"TOTAL Volume",                   col:T.ink,    bg:T.bgInset,   bold:true,  sep:false, isVol:true  },
                  { key:"totalBCI",      label:"TOTAL -> BCI SC",                 col:T.green,  bg:T.greenSoft, bold:true,  sep:false, isVol:false },
                  { key:"totalPR",       label:"TOTAL -> Protocol Reserve",       col:T.blue,   bg:T.blueSoft,  bold:true,  sep:true,  isVol:false },
                ];

                return (
                  <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                    {/* Header — title/legend left, Year selector top-right (matches the
                        Retail LP FeeTable design), Market selector on its own row below */}
                    <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                          textTransform:"uppercase", letterSpacing:"0.08em" }}>
                          RWA Fee Revenue
                        </span>
                        <div style={{ display:"flex", gap:8 }}>
                          {[["-> BCI SC",T.green],["-> Protocol",T.blue]].map(([l,c])=>(
                            <span key={l} style={{ fontSize:9.5, color:c, fontWeight:600 }}>* {l}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:4 }}>
                        {[1,2,3].map(y => (
                          <button key={y} onClick={()=>setRwaFeeYear(y)}
                            style={{ padding:"3px 9px", borderRadius:5, cursor:"pointer",
                              fontSize:10, fontWeight: rwaFeeYear===y ? 700 : 500,
                              border:`1px solid ${rwaFeeYear===y ? T.green : T.border}`,
                              background: rwaFeeYear===y ? T.greenSoft : T.bgEl,
                              color: rwaFeeYear===y ? T.greenInk : T.ink3 }}>
                            Year {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Market selector row */}
                    <div style={{ padding:"7px 14px", background:T.bgEl, borderBottom:`1px solid ${T.border}`,
                      display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:9.5, color:T.ink4, fontWeight:600,
                        textTransform:"uppercase", letterSpacing:"0.06em", marginRight:2 }}>Market</span>
                      <button onClick={()=>setRwaFeeMarket(-1)}
                        style={{ padding:"2px 8px", borderRadius:4, cursor:"pointer", fontSize:9.5,
                          fontWeight: rwaFeeMarket===-1 ? 700 : 500,
                          border:`1px solid ${rwaFeeMarket===-1 ? T.amber : T.border}`,
                          background: rwaFeeMarket===-1 ? T.amberSoft : T.bgEl,
                          color: rwaFeeMarket===-1 ? T.amber : T.ink3 }}>All</button>
                      {marketTabs.map(({ idx, active, name }) => active && (
                        <button key={idx} onClick={()=>setRwaFeeMarket(idx)}
                          style={{ padding:"2px 8px", borderRadius:4, cursor:"pointer", fontSize:9.5,
                            fontWeight: rwaFeeMarket===idx ? 700 : 500,
                            border:`1px solid ${rwaFeeMarket===idx ? T.amber : T.border}`,
                            background: rwaFeeMarket===idx ? T.amberSoft : T.bgEl,
                            color: rwaFeeMarket===idx ? T.amber : T.ink3,
                            maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {name.length > 14 ? name.slice(0,14)+"..." : name}
                        </button>
                      ))}
                    </div>
                    {/* Table */}
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                        <thead>
                          <tr style={{ background:T.bgSoft }}>
                            <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                              fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                              borderBottom:`1px solid ${T.border}`, width:220, whiteSpace:"nowrap" }}>
                              {rwaFeeMarket === -1 ? "All Markets" : marketTabs[rwaFeeMarket]?.name || "Market"}
                            </th>
                            {Array.from({length:12},(_,i)=>(
                              <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                                fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`,
                                whiteSpace:"nowrap" }}>
                                M{(rwaFeeYear-1)*12+i+1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(({ key, label, col, bg, bold, sep, isVol, isPct }) => (
                            <tr key={key} style={{
                              borderBottom: sep ? `2px solid ${T.borderS}` : `1px solid ${T.border}`,
                              background: bg,
                            }}>
                              <td style={{ padding:"5px 12px", color: bold ? col : T.ink3,
                                fontSize: bold ? 10.5 : 9.5, fontWeight: bold ? 700 : 400,
                                whiteSpace:"nowrap" }}>{label}</td>
                              {months.map((d, mi) => {
                                const val = d?.[key] || 0;
                                return (
                                  <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                    fontFamily:MONO, fontSize:10,
                                    color: val === 0 ? T.ink5 : col,
                                    fontWeight: bold ? 700 : 500 }}>
                                    {val === 0 ? "-" : isPct ? val.toFixed(2)+"%" : fd(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Summary Card */}
              {(() => {
                const capacity = md?.layerUSDCAvailable || 0;
                const demand   = md?.totalLiqDemand  || 0;
                const mintDem  = md?.totalMintDemand || 0;
                const actualLiq  = md?.rwaLiq  || 0;
                const actualMint = md?.rwaMint || 0;
                const constrained = md?.layerConstrained;
                const statusCol = constrained ? T.amber : T.green;
                // All figures read directly from the engine (single source of truth, no
                // re-derivation). Capacity waterfall: this month's real Layer, minus what
                // is already committed to RWA, plus pipeline cash returning this month;
                // BCI redemptions are served FIRST, then an LCR guard caps acceptance,
                // then market demand binds.
                const capacityBasis = md?.layerPostUpdate || 0;
                const committed     = md?.rwaInLayerNow || 0;
                const committedPct  = capacityBasis > 0 ? committed / capacityBasis * 100 : 0;
                const pipeReturn    = md?.rwaPipelineReturn || 0;
                const bciServed     = md?.bciServedTotal || 0;
                const fundsAfterBci = md?.rwaFundsAfterBci || 0;
                const lcrCap        = md?.rwaLcrCap ?? Infinity;
                const effectiveCap  = Math.min(fundsAfterBci, lcrCap);
                const bindingLabel  = demand <= effectiveCap ? "OK Market demand"
                  : lcrCap < fundsAfterBci ? "! LCR guard" : "! Layer USDC";
                return (
                  <div>
                    <div style={{ fontSize:10.5, fontWeight:600, color:T.amber, textTransform:"uppercase",
                      letterSpacing:"0.09em", marginBottom:12, paddingBottom:6,
                      borderBottom:`1px solid ${T.border}` }}>
                      How RWA Markets Contribute to Pool Volume . M{ms}
                    </div>
                    <div style={{ display:"flex", gap:12 }}>

                      {/* Demand */}
                      <div style={{ flex:1, background:T.bgEl, border:`1px solid ${T.border}`,
                        borderRadius:8, overflow:"hidden" }}>
                        <div style={{ padding:"7px 12px", background:T.bgSoft,
                          borderBottom:`1px solid ${T.border}` }}>
                          <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                            textTransform:"uppercase", letterSpacing:"0.07em" }}>Market Demand</span>
                        </div>
                        <div style={{ padding:"10px 12px" }}>
                          {/* Per-market demand read from the engine's own ledger
                              (marketStats[i].liqDemand/mintDemand) — no parallel
                              re-derivation of the AUM compounding here. */}
                          {(md?.marketStats||[]).filter(s=>s.active).map(s=>(
                            <div key={s.i} style={{ display:"flex", justifyContent:"space-between",
                              alignItems:"center", padding:"3px 0", borderBottom:`1px solid ${T.border}` }}>
                              <span style={{ fontSize:10.5, color:T.ink3, flex:1 }}>{s.name}</span>
                              <span style={{ fontSize:10, fontFamily:MONO, color:T.amber }}>{s.liqDemand>0?fd(s.liqDemand):"-"} liq</span>
                              {s.mintDemand>0 && <span style={{ fontSize:10, fontFamily:MONO, color:T.green2, marginLeft:6 }}>{fd(s.mintDemand)} mint</span>}
                            </div>
                          ))}
                          {rwaMarkets.filter(m=>m.active && ms>=m.launchMonth).length === 0 && (
                            <div style={{ fontSize:11, color:T.ink5, fontStyle:"italic" }}>
                              No markets active at M{ms}
                            </div>
                          )}
                          <div style={{ display:"flex", justifyContent:"space-between",
                            padding:"5px 0 2px", marginTop:4, borderTop:`1px solid ${T.border}` }}>
                            <span style={{ fontSize:11, fontWeight:700, color:T.ink }}>Total liq. demand</span>
                            <span style={{ fontSize:11, fontFamily:MONO, fontWeight:700, color:T.amber }}>{fd(demand)}/mo</span>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", padding:"2px 0" }}>
                            <span style={{ fontSize:11, fontWeight:700, color:T.ink }}>Total mint demand</span>
                            <span style={{ fontSize:11, fontFamily:MONO, fontWeight:700, color:T.green2 }}>{fd(mintDem)}/mo</span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity */}
                      <div style={{ flex:1, background:T.bgEl, border:`1px solid ${T.border}`,
                        borderRadius:8, overflow:"hidden" }}>
                        <div style={{ padding:"7px 12px", background:T.bgSoft,
                          borderBottom:`1px solid ${T.border}` }}>
                          <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                            textTransform:"uppercase", letterSpacing:"0.07em" }}>Layer Capacity . M{ms}</span>
                        </div>
                        <div style={{ padding:"10px 12px" }}>
                          {[
                            ["Total Layer (this month)", fd(capacityBasis), T.ink],
                            ["  − already committed (held RWA + pipeline)", `${fd(committed)} (${committedPct.toFixed(0)}%)`, T.ink4],
                            ["  = est. USDC on hand", fd(capacity), T.ink4],
                            ["  + pipeline cash returning this month", fd(pipeReturn), T.ink4],
                            ["  − BCI redemptions (served first)", fd(bciServed), T.ink4],
                            ["  − LCR guard withholding", fd(Math.max(0, fundsAfterBci - effectiveCap)), T.ink4],
                            ["Available for RWA liquidations", fd(effectiveCap), T.blue],
                            ["Liq. demand this month", fd(demand), T.amber],
                            ["Binding constraint", bindingLabel,
                              demand <= effectiveCap ? T.green : T.amber],
                          ].map(([k,v,col],idx,arr)=>(
                            <div key={k} style={{ display:"flex", justifyContent:"space-between",
                              padding:"4px 0", borderBottom: idx<arr.length-1?`1px solid ${T.border}`:"none" }}>
                              <span style={{ fontSize:11, color:T.ink3 }}>{k}</span>
                              <span style={{ fontSize:11, fontFamily:MONO, fontWeight:600, color:col }}>{v}</span>
                            </div>
                          ))}
                          <div style={{ fontSize:10, color:T.ink4, marginTop:6, lineHeight:1.5 }}>
                            Sized off THIS month's real Layer (prior balances + this month's
                            LP entry/exit flows — Layer yield is paid out as protocol revenue,
                            never compounded into the Layer, so this IS the final figure).
                            BCI redemptions are senior: they are served before any RWA capacity
                            is allocated. The LCR guard then caps acceptance so the month-end
                            LCR never drops below {(yld.rwaLcrTarget ?? 1.5).toFixed(2)}x.
                          </div>
                        </div>
                        <div style={{ padding:"6px 12px",
                          background: constrained ? T.amberSoft : T.greenSoft,
                          borderTop:`1px solid ${statusCol}22` }}>
                          <span style={{ fontSize:10.5, fontWeight:600,
                            color: constrained ? T.amber : T.greenInk }}>
                            {constrained
                              ? `! Layer constrained - ${fp(demand>0?actualLiq/demand*100:0)} of demand served`
                              : demand > 0 ? "OK Full demand served" : "No active liq. demand"}
                          </span>
                        </div>
                      </div>

                      {/* Pool volume */}
                      <div style={{ flex:1, background:T.bgEl, border:`1px solid ${T.border}`,
                        borderRadius:8, overflow:"hidden" }}>
                        <div style={{ padding:"7px 12px", background:T.bgSoft,
                          borderBottom:`1px solid ${T.border}` }}>
                          <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                            textTransform:"uppercase", letterSpacing:"0.07em" }}>Pool Volume . M{ms}</span>
                        </div>
                        <div style={{ padding:"10px 12px" }}>
                          {[
                            ["RWA Sell (liquidation)", fd(actualLiq), T.amber, "-> pool sell for USDC"],
                            ["RWA Buy (minting)", fd(actualMint), T.green2, "-> pool buy for rwaUSD"],
                            ["Retail Buy", fd(md?.retailPoolVol), T.blue, ""],
                            ["Retail Exit Sell", fd(md?.retailExitSellVol), T.ink3, ""],
                          ].map(([k,v,col,desc])=>(
                            <div key={k} style={{ marginBottom:5 }}>
                              <div style={{ display:"flex", justifyContent:"space-between" }}>
                                <span style={{ fontSize:10.5, color:T.ink3 }}>{k}</span>
                                <span style={{ fontSize:11, fontFamily:MONO, fontWeight:600, color:col }}>{v}/mo</span>
                              </div>
                              {desc && <div style={{ fontSize:9.5, color:T.ink5 }}>{desc}</div>}
                            </div>
                          ))}
                          <div style={{ borderTop:`2px solid ${T.border}`, paddingTop:5, marginTop:3,
                            display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:12, fontWeight:700, color:T.ink }}>Total pool</span>
                            <span style={{ fontSize:12, fontFamily:MONO, fontWeight:700, color:T.ink }}>
                              {fd(md?.pVol)}/mo
                            </span>
                          </div>
                          <div style={{ marginTop:8, padding:"6px 8px", background:T.bgSoft,
                            borderRadius:5, border:`1px solid ${T.border}` }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                              <span style={{ fontSize:10, color:T.ink3 }}>RWA trade fee rev.</span>
                              <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.green }}>
                                {fd(md?.rwaTradeRevenue)}/mo
                              </span>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-between" }}>
                              <span style={{ fontSize:10, color:T.ink3 }}>Haircut revenue</span>
                              <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.green }}>
                                {fd(md?.haircutRevenue)}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Concentration bars */}
                    {rwaMarkets.filter(m=>m.active && ms>=m.launchMonth).length > 0 && (
                      <div style={{ marginTop:10, padding:"10px 14px",
                        background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8 }}>
                        <div style={{ fontSize:10, color:T.ink3, fontWeight:600,
                          textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>
                          RWA Concentration in Layer . M{ms}
                        </div>
                        {/* Concentration = RWA actually HELD in the Layer per market (engine
                            ledger), not monthly demand. Neither cap refuses liquidations —
                            they only decide how much stays as inventory vs. converts to cash
                            via the issuer-redemption pipeline. Bars show live fee escalation. */}
                        {rwaMarkets.map((mk,i)=>{
                          if (!mk.active || ms < mk.launchMonth) return null;
                          const st = md?.marketStats?.[i];
                          const concPct = st?.concPct || 0;
                          const held = st?.held || 0;
                          const limit = yld.mkMaxPct ?? 10;
                          const softLimit = limit * 0.5;
                          const barCol = concPct >= limit ? T.red
                            : concPct > softLimit ? T.amber : T.green;
                          const bump = (st?.haircutBumpPct||0) + (st?.tradeFBumpPct||0) > 0;
                          return (
                            <div key={i} style={{ marginBottom:8 }}>
                              <div style={{ display:"flex", justifyContent:"space-between",
                                marginBottom:3, alignItems:"center" }}>
                                <span style={{ fontSize:10.5, color:T.ink2 }}>{mk.name||`Market ${i+1}`}</span>
                                <span style={{ fontSize:10.5, fontFamily:MONO, fontWeight:600, color:barCol }}>
                                  {fd(held)} held · {fp(concPct,1)} of Layer
                                  {bump && ` · haircut ${fp(st.haircutPct,2)} (+${st.haircutBumpPct.toFixed(2)}pp) · fee ${fp(st.tradeFPct,2)} (+${st.tradeFBumpPct.toFixed(2)}pp)`}
                                </span>
                              </div>
                              <div style={{ height:4, background:T.bgInset, borderRadius:2, overflow:"hidden" }}>
                                <div style={{ height:"100%", borderRadius:2, background:barCol,
                                  width:`${Math.min(concPct/Math.max(limit,1)*100,100)}%`,
                                  transition:"width .4s" }} />
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6,
                          paddingTop:6, borderTop:`1px solid ${T.border}` }}>
                          <span style={{ fontSize:10.5, fontWeight:700, color:T.ink }}>Total RWA held (cap {yld.maxRwaPct}%)</span>
                          <span style={{ fontSize:10.5, fontFamily:MONO, fontWeight:700,
                            color:(md?.rwaHeldPct||0) >= yld.maxRwaPct - 0.5 ? T.amber : T.green }}>
                            {fd(md?.rwaCollateralBal)} · {fp(md?.rwaHeldPct||0,1)} of Layer
                            {(md?.categoryHaircutBumpPct||0) > 0 && ` · category haircut +${md.categoryHaircutBumpPct.toFixed(2)}pp`}
                          </span>
                        </div>
                        {(md?.rwaPipelineBal||0) > 1 && (
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                            <span style={{ fontSize:10.5, color:T.ink3 }}>In issuer-redemption pipeline (returns ~T+{avgRWADays.toFixed(0)}d)</span>
                            <span style={{ fontSize:10.5, fontFamily:MONO, color:T.ink3 }}>{fd(md?.rwaPipelineBal)}</span>
                          </div>
                        )}
                        {(md?.bciQueueBal||0) > 1 && (
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                            <span style={{ fontSize:10.5, color:T.red }}>BCI redemption queue (waiting on Layer liquidity)</span>
                            <span style={{ fontSize:10.5, fontFamily:MONO, fontWeight:600, color:T.red }}>{fd(md?.bciQueueBal)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Retention caps + minting discount ladder — engine reads via layerCfg/yld.
                  Controls live here (RWA economics) rather than duplicating in Liquidity Layer. */}
              <div style={{ background:T.bgSoft, border:`1px solid ${T.border}`, borderRadius:8,
                padding:"14px 16px" }}>
                <div style={{ fontSize:10.5, fontWeight:600, color:T.ink, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:12 }}>
                  Retention Caps & Minting Discounts
                </div>
                <div style={{ display:"flex", gap:20 }}>
                  <div style={{ flex:1 }}>
                    <Slider label="RWA Category Retention Cap (%)" value={yld.maxRwaPct} min={10} max={30} step={1}
                      onChange={v=>upYld("maxRwaPct",v)} fmt={v=>`${v}% cap`}
                      hint="Total RWA held across all markets before excess routes to the issuer-redemption pipeline. Never refuses a liquidation — only decides inventory vs. pipeline split." />
                    <Slider label="Per-Market Retention Cap (%)" value={yld.mkMaxPct ?? 10} min={2} max={20} step={1}
                      onChange={v=>upYld("mkMaxPct",v)} fmt={v=>`${v}% cap`}
                      hint="No single RWA market can exceed this share of the Layer — checked before the category cap." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label={`Held >= ${(yld.maxRwaPct*0.75).toFixed(0)}% of Layer -> mint discount`} value={yld.mintDiscountRwa15} min={0} max={50} step={5}
                      onChange={v=>upYld("mintDiscountRwa15",v)} fmt={v=>`${v}% off`}
                      hint="Reduces NEXT month's mint-haircut revenue when held RWA reaches 75% of the category cap (one-month lag)." />
                    <Slider label={`Held >= ${(yld.maxRwaPct*0.90).toFixed(0)}% -> mint discount`} value={yld.mintDiscountRwa18} min={20} max={70} step={5}
                      onChange={v=>upYld("mintDiscountRwa18",v)} fmt={v=>`${v}% off`}
                      hint="Escalated discount at 90% of the category cap." />
                    <Slider label="Held at category cap -> mint discount" value={yld.mintDiscountRwaCap} min={40} max={95} step={5}
                      onChange={v=>upYld("mintDiscountRwaCap",v)} fmt={v=>`${v}% off`}
                      hint="Maximum discount when held RWA hits the category cap." />
                  </div>
                  <div style={{ flex:1 }}>
                    <Slider label="WARNING mode mint discount (%)" value={yld.mintDiscountWarning} min={20} max={70} step={5}
                      onChange={v=>upYld("mintDiscountWarning",v)} fmt={v=>`${v}% off`}
                      hint="Reactive discount when LCR enters WARNING (applied to next month's mint haircut)." />
                    <Slider label="STRESS mode mint discount (%)" value={yld.mintDiscountStress} min={40} max={90} step={5}
                      onChange={v=>upYld("mintDiscountStress",v)} fmt={v=>`${v}% off`} hint="STRESS mode discount." />
                    <Slider label="EMERGENCY mint discount (%)" value={yld.mintDiscountEmergency} min={60} max={99} step={5}
                      onChange={v=>upYld("mintDiscountEmergency",v)} fmt={v=>`${v}% off`}
                      hint="Near-free RWA minting to drain concentration fast." />
                  </div>
                </div>
              </div>

            </div>
          </CollapsibleSection>

          {/* -- LIQUIDITY LAYER -- */}
          <CollapsibleSection title="Liquidity Layer">
            <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:14 }}>

              {/* Architecture explanation */}
              <div style={{ background:T.bgSoft, border:`1px solid ${T.border}`, borderRadius:8,
                padding:"12px 14px", fontSize:11, color:T.ink2, lineHeight:1.7 }}>
                <span style={{ fontWeight:600, color:T.ink }}>Liquidity Waterfall (v4):</span>{" "}
                LP collateral splits into four tiers by settlement speed —{" "}
                <span style={{ fontWeight:600 }}>USDC in Aave</span> (T+0, {yld.aaveYield}%/yr operational buffer),{" "}
                <span style={{ fontWeight:600 }}>Morpho vaults</span> (T+0–T+1, {yld.morphoYield}%/yr stress buffer),{" "}
                <span style={{ fontWeight:600 }}>Enhanced yield</span> (T+0–T+1, {yld.enhancedYield}%/yr, capped at {yld.enhancedMaxPct}% of yield bucket), and{" "}
                <span style={{ fontWeight:600, color:rwaColor }}>RWA inventory + pipeline</span> (T+30–90, illiquid, capped at {yld.maxRwaPct}% held).{" "}
                The USDC buffer is sized to the largest of three constraints: the {yld.layerMinBuffer}% floor,{" "}
                {yld.layerRedemptionDays}-day BCI redemption coverage, or {yld.layerRwaCoverageDays}-day served-RWA coverage.{" "}
                <span style={{ fontWeight:600 }}>LCR</span> = liquid capital (USDC + Morpho + Enhanced) ÷ near-term obligations (30-day BCI exits + {yld.layerRwaCoverageDays}-day served RWA).{" "}
                Circuit breakers fire at {yld.lcrHealthy.toFixed(1)}× / {yld.lcrWarning.toFixed(2)}× / {yld.lcrStress.toFixed(2)}×.{" "}
                <span style={{ fontWeight:600 }}>BCI redemptions are senior</span> to RWA liquidation capacity — LP exits are served first; RWA acceptance is further capped by the LCR floor ({yld.rwaLcrTarget.toFixed(2)}×).
              </div>

              {/* LCR GAUGE - the primary risk metric */}
              <div>
                <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:10 }}>
                  Liquidity Coverage Ratio (LCR) . M{ms}
                </div>
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:20 }}>
                    <div style={{ minWidth:120 }}>
                      <div style={{ fontSize:32, fontFamily:MONO, fontWeight:700, color:modeColor, lineHeight:1 }}>
                        {currentLCR >= 99 ? "inf" : currentLCR.toFixed(2)}<span style={{ fontSize:18, color:T.ink3 }}>x</span>
                      </div>
                      <div style={{ fontSize:10, color:T.ink3, marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        Current Ratio
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      {/* Threshold bar */}
                      <div style={{ position:"relative", height:24, background:T.bgInset, borderRadius:6, overflow:"hidden" }}>
                        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${yld.lcrStress/3*100}%`, background:T.red, opacity:0.7 }} />
                        <div style={{ position:"absolute", left:`${yld.lcrStress/3*100}%`, top:0, bottom:0, width:`${(yld.lcrWarning-yld.lcrStress)/3*100}%`, background:T.amber, opacity:0.7 }} />
                        <div style={{ position:"absolute", left:`${yld.lcrWarning/3*100}%`, top:0, bottom:0, width:`${(yld.lcrHealthy-yld.lcrWarning)/3*100}%`, background:T.amber, opacity:0.4 }} />
                        <div style={{ position:"absolute", left:`${yld.lcrHealthy/3*100}%`, top:0, right:0, background:T.greenSoft }} />
                        {/* Current position marker */}
                        <div style={{ position:"absolute", left:`${Math.min(currentLCR/3*100, 99)}%`, top:-2, bottom:-2, width:3, background:T.ink, boxShadow:"0 0 4px rgba(0,0,0,0.3)" }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:T.ink4, marginTop:4, fontFamily:MONO }}>
                        <span>0.0</span>
                        <span style={{ marginLeft:`${yld.lcrStress/3*100 - 5}%` }}>{yld.lcrStress.toFixed(1)}</span>
                        <span style={{ marginLeft:`${(yld.lcrWarning-yld.lcrStress)/3*100 - 3}%` }}>{yld.lcrWarning.toFixed(1)}</span>
                        <span style={{ marginLeft:`${(yld.lcrHealthy-yld.lcrWarning)/3*100 - 3}%` }}>{yld.lcrHealthy.toFixed(1)}</span>
                        <span>3.0+</span>
                      </div>
                    </div>
                    <div style={{ padding:"8px 14px", background:modeSoft, border:`1px solid ${modeColor}30`,
                      borderRadius:8, minWidth:140, textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:modeColor }}>{currentMode}</div>
                      <div style={{ fontSize:9.5, color:T.ink3, marginTop:2 }}>
                        {currentMode === "HEALTHY" && "All ops normal"}
                        {currentMode === "WARNING" && "Small adjustments"}
                        {currentMode === "STRESS" && "Redemption delays"}
                        {currentMode === "EMERGENCY" && "Survival mode"}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:"9px 16px", borderTop:`1px solid ${T.border}`, background:T.bgSoft,
                    display:"flex", justifyContent:"space-between", fontSize:10.5, fontFamily:MONO, color:T.ink3 }}>
                    <span>Liquid capital: <span style={{ color:T.ink, fontWeight:600 }}>{fd(liquidAmt)}</span> ({fp(liquidPct)})</span>
                    <span>Obligations: <span style={{ color:T.ink, fontWeight:600 }}>{fd(md?.totalObligations ?? (expectedRdmpMo + dailyRWADemand * yld.layerRwaCoverageDays))}</span></span>
                    <span>Blended yield: <span style={{ color:T.green, fontWeight:600 }}>{fp(layerNetYieldAnn)}/yr</span></span>
                  </div>
                </div>
              </div>

              {/* 4-TIER COMPOSITION TILES */}
              <div>
                <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:10 }}>
                  Composition . M{ms}
                </div>
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ display:"flex" }}>
                    {[
                      { label:"USDC (Aave)", pct:usdcBufferPct, amt:usdcBufferAmt, col:T.green,
                        sub:`T+0 . ${yld.aaveYield}%/yr . ${fd(aaveYieldMo)}/mo` },
                      { label:"Morpho Vaults", pct:morphoPct, amt:morphoAmt, col:T.blue,
                        sub:`T+0-T+1 . ${yld.morphoYield}%/yr . ${fd(morphoYieldMo)}/mo` },
                      { label:"Enhanced Yield", pct:enhancedPct, amt:enhancedAmt, col:T.amber,
                        sub:`Sky/Ethena . ${yld.enhancedYield}%/yr . ${fd(enhancedYieldMo)}/mo` },
                      { label:"RWA Held", pct:rwaHeldPctDisplay, amt:rwaHeldAmt, col:rwaColor,
                        sub:`cap ${yld.maxRwaPct}% . ${rwaAlert?"!":rwaWarn?"!":"OK"}` },
                      { label:"RWA In Pipeline", pct:rwaPipelinePct, amt:rwaPipelineAmt, col:T.ink3,
                        sub:`returns ~T+${avgRWADays.toFixed(0)} . awaiting issuer` },
                    ].map(({ label, pct, amt, col, sub }, i) => (
                      <div key={label} style={{ flex:1, padding:"12px 14px",
                        borderRight: i<4 ? `1px solid ${T.border}` : "none" }}>
                        <div style={{ fontSize:10, color:T.ink3, marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:22, fontWeight:500, fontFamily:MONO, color:col,
                          marginBottom:2 }}>{fp(pct)}</div>
                        <div style={{ fontSize:12, fontFamily:MONO, color:T.ink2, marginBottom:4 }}>{fd(amt)}</div>
                        <div style={{ height:4, background:T.bgInset, borderRadius:2, overflow:"hidden", marginBottom:5 }}>
                          <div style={{ height:"100%", background:col, borderRadius:2,
                            width:`${Math.min(pct,100)}%`, transition:"width .5s" }} />
                        </div>
                        <div style={{ fontSize:10, color:T.ink4 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  {/* Liquid vs illiquid summary */}
                  <div style={{ padding:"8px 14px", borderTop:`1px solid ${T.border}`, background:T.bgSoft,
                    display:"flex", justifyContent:"space-between", fontSize:10.5, color:T.ink3 }}>
                    <span>
                      <span style={{ fontWeight:600, color:T.ink }}>Liquid (T+0 to T+1):</span>{" "}
                      <span style={{ fontFamily:MONO }}>{fd(liquidAmt)} ({fp(liquidPct)})</span>
                    </span>
                    <span>
                      <span style={{ color:rwaColor, fontWeight:600 }}>Illiquid (T+30 to T+90):</span>{" "}
                      <span style={{ fontFamily:MONO }}>{fd(rwaCollatAmt)} ({fp(rwaCollatPct)})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* STRESS RESPONSE STATUS (only visible when not healthy) */}
              {currentMode !== "HEALTHY" && (
                <div style={{ background:modeSoft, border:`1px solid ${modeColor}40`, borderRadius:8,
                  padding:"12px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:modeColor, marginBottom:8, textTransform:"uppercase",
                    letterSpacing:"0.06em" }}>
                    ! {currentMode} Mode Active
                  </div>
                  <div style={{ display:"flex", gap:24, fontSize:11 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.ink3, marginBottom:3 }}>RWA Liquidations</div>
                      <div style={{ fontFamily:MONO, fontWeight:600, color:rwaAcceptPct>=100?T.green:T.red }}>
                        {rwaAcceptPct}% accepted
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.ink3, marginBottom:3 }}>BCI Lock Extension</div>
                      <div style={{ fontFamily:MONO, fontWeight:600, color:T.amber }}>
                        +{bciLockExt} days ({30+bciLockExt}d total)
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.ink3, marginBottom:3 }}>Minting Discount</div>
                      <div style={{ fontFamily:MONO, fontWeight:600, color:T.green }}>
                        {mintDiscount}% off haircut
                      </div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:T.ink3, marginBottom:3 }}>Protocol Reserve</div>
                      <div style={{ fontFamily:MONO, fontWeight:600, color:reserveTrig?T.red:T.ink3 }}>
                        {reserveTrig?"! DEPLOYED":`Standby ${fd(protocolRsvTgt)}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS - 3 columns (RWA retention caps + mint discounts live in RWA Markets) */}
              <div style={{ display:"flex", gap:20 }}>

                {/* Column 1: Structural */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>Buffer & Coverage</div>
                  <Slider label="USDC Minimum Floor (%)" value={yld.layerMinBuffer} min={2} max={20} step={1}
                    onChange={v=>upYld("layerMinBuffer",v)} fmt={v=>`${v}%`}
                    hint="Absolute minimum USDC % — operational floor. Recommended 5%." />
                  <Slider label="BCI Redemption Coverage (days)" value={yld.layerRedemptionDays} min={7} max={30} step={1}
                    onChange={v=>upYld("layerRedemptionDays",v)} fmt={v=>`${v} days`}
                    hint={`Days of BCI outflows to keep liquid. Currently reserves ${fd(expectedRdmpMo/30*yld.layerRedemptionDays)}.`} />
                  <Slider label="RWA Liquidation Coverage (days)" value={yld.layerRwaCoverageDays} min={7} max={30} step={1}
                    onChange={v=>upYld("layerRwaCoverageDays",v)} fmt={v=>`${v} days`}
                    hint={`Days of SERVED RWA liq volume ready in USDC. Currently reserves ${fd((md?.dailyRWALiqDemand||0)*yld.layerRwaCoverageDays)}.`} />
                  <Slider label="Morpho Minimum Reserve (%)" value={yld.morphoMinReserve} min={10} max={40} step={1}
                    onChange={v=>upYld("morphoMinReserve",v)} fmt={v=>`${v}% floor`}
                    hint="Never drain Morpho below this share of the Layer. Protects the yield engine." />
                  <Slider label="Enhanced Max (% of Yield Bucket)" value={yld.enhancedMaxPct} min={0} max={40} step={1}
                    onChange={v=>upYld("enhancedMaxPct",v)} fmt={v=>`${v}%`}
                    hint="Cap on Enhanced tier as % of the yield bucket (Layer minus USDC buffer minus RWA). Diversification limit." />
                </div>

                {/* Column 2: Yields */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>Yield Sources</div>
                  <Slider label="Aave USDC Yield (%/yr)" value={yld.aaveYield} min={1} max={8} step={0.1}
                    onChange={v=>upYld("aaveYield",v)} fmt={v=>`${v}%`}
                    hint="Yield on USDC deposited in Aave lending. Realistic range 2.5–5%." />
                  <Slider label="Morpho Vaults Yield (%/yr)" value={yld.morphoYield} min={1} max={10} step={0.1}
                    onChange={v=>upYld("morphoYield",v)} fmt={v=>`${v}%`}
                    hint="Blended Morpho blue-chip vaults. Realistic 4–6%." />
                  <Slider label="Enhanced Yield Source (%/yr)" value={yld.enhancedYield} min={3} max={15} step={0.1}
                    onChange={v=>upYld("enhancedYield",v)} fmt={v=>`${v}%`}
                    hint="Sky Farm, Ethena, or similar higher-yield. Realistic 6–9%." />
                </div>

                {/* Column 3: LCR, circuit breakers & reserve */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>LCR Thresholds</div>
                  <Slider label="Healthy Minimum (LCR)" value={yld.lcrHealthy} min={1.2} max={3.0} step={0.1}
                    onChange={v=>upYld("lcrHealthy",v)} fmt={v=>`${v.toFixed(1)}x`}
                    hint="Above this: all systems normal. Basel III suggests 1.5×." />
                  <Slider label="Warning Minimum (LCR)" value={yld.lcrWarning} min={0.8} max={1.5} step={0.05}
                    onChange={v=>upYld("lcrWarning",v)} fmt={v=>`${v.toFixed(2)}x`}
                    hint="Below Healthy but above this: WARNING mode." />
                  <Slider label="Stress Minimum (LCR)" value={yld.lcrStress} min={0.5} max={1.0} step={0.05}
                    onChange={v=>upYld("lcrStress",v)} fmt={v=>`${v.toFixed(2)}x`}
                    hint="Below this: EMERGENCY mode." />

                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginTop:14, marginBottom:10 }}>Stress Response</div>
                  <Slider label="RWA Acceptance in EMERGENCY (%)" value={yld.rwaAcceptEmergency} min={20} max={100} step={5}
                    onChange={v=>upYld("rwaAcceptEmergency",v)} fmt={v=>`${v}%`}
                    hint="RWA liq acceptance rate in EMERGENCY (prior-month throttle). 100% in all other modes." />
                  <Slider label="RWA Acceptance LCR Floor (x)" value={yld.rwaLcrTarget} min={0.8} max={2.0} step={0.05}
                    onChange={v=>upYld("rwaLcrTarget",v)} fmt={v=>`${v.toFixed(2)}x`}
                    hint="Caps RWA liquidations so projected month-end LCR stays at or above this floor. BCI redemptions are always served first." />
                  <Slider label="Protocol Reserve Target (% of Layer)" value={yld.protocolReservePct} min={0} max={20} step={1}
                    onChange={v=>upYld("protocolReservePct",v)} fmt={v=>`${v}%`}
                    hint={`Separate treasury target. Auto-deploys when LCR < 0.5x for 7 straight months — with the RWA LCR floor at ${yld.rwaLcrTarget.toFixed(2)}x this cannot fire in the default run; it is a tail-risk backstop for stress scenarios.`} />
                </div>
              </div>

              {/* Layer Composition — Structure reference (same pattern as Retail LP fee card) */}
              <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                overflow:"hidden", marginBottom:10 }}>
                <div style={{ padding:"8px 14px", background:T.bgSoft,
                  borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                    textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    Layer Composition — Structure & Distribution
                  </span>
                </div>
                <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
                  {[
                    { fee:"Total Layer NAV", rate:"All LP money currently in the Layer",
                      tags:[{ l:"Backs BCI price", c:T.ink, bg:T.bgInset }],
                      what:"Everything private and retail LPs have deposited (after fees), minus what has exited. Together with BCI SC, this is what backs the BCI price. The yield the Layer earns is paid out as protocol revenue every month — it does not grow this balance." },
                    { fee:"LCR (Liquidity Coverage Ratio)", rate:`Can we cover what we owe soon?`,
                      tags:[
                        { l:`≥ ${yld.lcrHealthy.toFixed(1)}× HEALTHY`, c:T.green, bg:T.greenSoft },
                        { l:`≥ ${yld.lcrWarning.toFixed(2)}× WARNING`, c:T.amber, bg:T.amberSoft },
                      ],
                      what:`Liquid money (USDC + Morpho + Enhanced) divided by what is owed in the near term (a month of LP exits plus ${yld.layerRwaCoverageDays} days of the RWA volume we actually accepted). Above ${yld.lcrHealthy.toFixed(1)}x = healthy. The engine refuses new RWA volume before letting this drop below ${yld.rwaLcrTarget.toFixed(2)}x.` },
                    { fee:"USDC Buffer (Aave)", rate:`Instant cash · ${yld.aaveYield}%/yr`,
                      tags:[{ l:"Liquid . pays exits today", c:T.green, bg:T.greenSoft }],
                      what:`The Layer's checking account: always enough for ${yld.layerRedemptionDays} days of LP exits and ${yld.layerRwaCoverageDays} days of accepted RWA volume, never less than ${yld.layerMinBuffer}% of the Layer. Earns a small yield in Aave while it waits.` },
                    { fee:"Morpho Vaults", rate:`1-day access · ${yld.morphoYield}%/yr`,
                      tags:[{ l:"Liquid . main yield engine", c:T.blue, bg:T.blueSoft }],
                      what:`Where most of the Layer's yield is earned. Can be pulled back within a day if the buffer needs refilling. Never drained below ${yld.morphoMinReserve}% of the Layer, so the yield engine keeps running even under stress.` },
                    { fee:"Enhanced Yield", rate:`1-day access · ${yld.enhancedYield}%/yr`,
                      tags:[{ l:"Liquid . extra return", c:T.amber, bg:T.amberSoft }],
                      what:`A higher-yield sleeve (Sky Farm / Ethena style), limited to ${yld.enhancedMaxPct}% of what's left after the buffer and RWA — a diversification cap. Shows $0 in months where RWA positions take up all the remaining room.` },
                    { fee:"RWA Held & Pipeline", rate:`Locked ~T+${avgRWADays.toFixed(0)} days · held cap ${yld.maxRwaPct}%`,
                      tags:[{ l:"Illiquid", c:T.amber, bg:T.amberSoft }],
                      what:`Held = RWA we keep to sell to minting buyers (max ${yld.mkMaxPct}% per market, ${yld.maxRwaPct}% total). Pipeline = the overflow already sent back to issuers — cash on its way home, each market at its own speed. Neither earns Layer yield while locked.` },
                  ].map(({ fee, rate, tags, what }, i, arr) => (
                    <div key={fee} style={{
                      flex:1, padding:"12px 14px", minWidth:0,
                      borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:T.ink,
                        marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                        {fee}
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        {tags.map(({ l, c, bg }) => (
                          <span key={l} style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color:c, background:bg, padding:"2px 7px", borderRadius:3 }}>
                            {l}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex" }}>
                  {[
                    { fee:"Near-Term Obligations", rate:"What the Layer owes soon",
                      tags:[{ l:"LP exits + accepted RWA", c:T.ink3, bg:T.bgInset }],
                      what:"One month of LP exit volume plus the RWA volume we actually said yes to (scaled to the coverage window). RWA demand we turned away doesn't count — you don't reserve cash for business you declined." },
                    { fee:"Layer Yield (Gross)", rate:"What the three liquid tiers earn per month",
                      tags:[{ l:"Paid out as revenue", c:T.ink, bg:T.bgInset }],
                      what:"Aave + Morpho + Enhanced earnings on this month's actual balances. This money leaves the Layer as protocol revenue (split below) — it does not compound inside the Layer. The table reads these numbers from the engine, never re-computes them." },
                    { fee:"Yield → BCI SC", rate:"80 cents of every yield dollar",
                      tags:[{ l:"80% BCI SC", c:T.green, bg:T.greenSoft }],
                      what:"The biggest share goes to BCI SC, directly pushing the BCI index price up. This exact figure appears as the 'Layer Yield' slice in the BCI SC Revenue chart below." },
                    { fee:"Yield → Protocol Reserve", rate:"10 cents of every yield dollar",
                      tags:[{ l:"10% Protocol Reserve", c:T.blue, bg:T.blueSoft }],
                      what:"Funds protocol operations. Appears as 'Layer Yield' in the Protocol Reserve Revenue table below." },
                    { fee:"Yield → Emergency Reserve", rate:"10 cents of every yield dollar",
                      tags:[{ l:"10% Emergency Reserve", c:T.ink3, bg:T.bgInset }],
                      what:"Builds the safety fund that absorbs losses before LPs ever would. Grows toward its target (a % of the capital actually at risk in Morpho and Bound Core deployments)." },
                    { fee:"Blended Annual Yield", rate:"Yearly % the whole Layer earns",
                      tags:[{ l:"% on full Layer", c:T.ink, bg:T.bgInset }],
                      what:"Gross monthly yield annualised, as a % of the full Layer. This is the Layer's own earning rate — NOT the BCI index growth rate (annG), which also includes fee revenue from every other source." },
                  ].map(({ fee, rate, tags, what }, i, arr) => (
                    <div key={fee} style={{
                      flex:1, padding:"12px 14px", minWidth:0,
                      borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:T.ink,
                        marginBottom:5, paddingBottom:5, borderBottom:`1px solid ${T.border}` }}>
                        {fee}
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                        {tags.map(({ l, c, bg }) => (
                          <span key={l} style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                            color:c, background:bg, padding:"2px 7px", borderRadius:3 }}>
                            {l}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LAYER COMPOSITION TABLE */}
              {(() => {
                const { months } = layerTableData[layerTableYear - 1] || { months: [] };
                const mkNames = rwaMarkets.map((mk,i)=>mk.name||`Market ${i+1}`);
                const INK = T.ink;
                const INK3 = T.ink3;
                const fmtCell = (val, layer) => {
                  if (!val) return "-";
                  const pct = layer > 0 ? ` (${(val/layer*100).toFixed(0)}%)` : "";
                  return fd(val) + pct;
                };
                const tableRows = [
                  { section: "1 · Layer health — size, coverage, what's owed" },
                  { key:"layer", label:"Total Layer NAV", col:INK, bold:true, sep:false, bg:T.bgSoft },
                  { key:"lcr", label:"LCR (liquid ÷ obligations)", col:INK3, bold:false, sep:false, bg:T.bgEl, isLCR:true },
                  { key:"mode", label:"Stress mode", col:INK3, bold:false, sep:false, bg:T.bgEl, isMode:true },
                  { key:"obligations", label:"Near-term obligations", col:INK3, bold:false, sep:true, bg:T.bgEl },

                  { section: "2 · Composition — where the Layer sits right now" },
                  { key:"liquid", label:"Liquid capital (T+0/T+1)", col:INK, bold:true, sep:false, bg:T.bgEl },
                  { key:"usdc", label:"  → USDC buffer (Aave)", col:T.green, bold:false, sep:false, bg:T.bgSoft },
                  { key:"morpho", label:"  → Morpho vaults", col:T.blue, bold:false, sep:false, bg:T.bgSoft },
                  { key:"enhanced", label:"  → Enhanced yield", col:T.amber, bold:false, sep:true, bg:T.bgSoft },
                  { key:"rwaTotal", label:"RWA held inventory (illiquid)", col:T.amber, bold:true, sep:false, bg:T.bgEl },
                  ...mkNames.map((name, mki) => ({
                    key: `mk_${mki}`, label: `  → ${name.length>20?name.slice(0,20)+"...":name}`,
                    col: INK3, bold:false, sep:false, bg:T.bgSoft, isMk:true, mkIdx: mki,
                  })),
                  { key:"rwaPipeline", label:"RWA in issuer pipeline (cash returning)", col:INK, bold:false, sep:true, bg:T.bgSoft },

                  { section: "3 · Monthly yield — earned by the Layer, paid out 80/10/10" },
                  { key:"totalYieldMo", label:"Gross layer yield / mo", col:INK, bold:true, sep:false, bg:T.bgEl },
                  { key:"aaveYieldMo", label:"  → from USDC buffer (Aave)", col:T.green, bold:false, sep:false, bg:T.bgSoft },
                  { key:"morphoYieldMo", label:"  → from Morpho", col:T.blue, bold:false, sep:false, bg:T.bgSoft },
                  { key:"enhancedYieldMo", label:"  → from Enhanced", col:T.amber, bold:false, sep:false, bg:T.bgSoft },
                  { key:"blendedAnnual", label:"Blended annual yield (% of Layer)", col:INK, bold:false, sep:true, bg:T.bgEl, isPct:true },
                  { key:"bciShare", label:"Paid → BCI SC (80%)", col:T.green, bold:false, sep:false, bg:T.greenSoft },
                  { key:"prShare", label:"Paid → Protocol Reserve (10%)", col:T.blue, bold:false, sep:false, bg:T.blueSoft },
                  { key:"erShare", label:"Paid → Emergency Reserve (10%)", col:INK3, bold:false, sep:true, bg:T.bgSoft },
                ];
                return (
                  <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                    <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>
                        Layer Composition — Monthly Breakdown
                      </span>
                      <div style={{ display:"flex", gap:3 }}>
                        {[1,2,3].map(y=>(
                          <button key={y} onClick={()=>setLayerTableYear(y)}
                            style={{ padding:"2px 8px", borderRadius:4, cursor:"pointer", fontSize:9.5,
                              fontWeight:layerTableYear===y?700:500,
                              border:`1px solid ${layerTableYear===y?T.green:T.border}`,
                              background:layerTableYear===y?T.greenSoft:T.bgEl,
                              color:layerTableYear===y?T.greenInk:T.ink3 }}>
                            Year {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                        <thead>
                          <tr style={{ background:T.bgSoft }}>
                            <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                              fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                              borderBottom:`1px solid ${T.border}`, width:220, whiteSpace:"nowrap" }}>Component</th>
                            {Array.from({length:12},(_,i)=>(
                              <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                                fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                                M{(layerTableYear-1)*12+i+1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map(({ section, key, label, col, bold, sep, bg, isMk, mkIdx, isLCR, isMode, isPct }) => {
                            if (section) return (
                              <tr key={section} style={{ background:T.bgInset }}>
                                <td colSpan={13} style={{ padding:"5px 12px", fontSize:9, fontWeight:700,
                                  color:T.ink3, textTransform:"uppercase", letterSpacing:"0.07em",
                                  borderBottom:`1px solid ${T.border}` }}>{section}</td>
                              </tr>
                            );
                            return (
                            <tr key={key} style={{
                              borderBottom: sep ? `2px solid ${T.borderS}` : `1px solid ${T.border}`,
                              background: bg,
                            }}>
                              <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                                fontSize:bold?10.5:9.5, fontWeight:bold?700:400,
                                whiteSpace:"nowrap" }}>{label}</td>
                              {months.map((d, mi2) => {
                                if (!d) return <td key={mi2} style={{ padding:"5px 5px",
                                  textAlign:"right", fontFamily:MONO, fontSize:10, color:T.ink5 }}>-</td>;

                                if (isLCR) {
                                  const lcrCol = d.mode==="HEALTHY"?T.green:d.mode==="WARNING"?T.amber:T.red;
                                  return (
                                    <td key={mi2} style={{ padding:"5px 5px", textAlign:"right",
                                      fontFamily:MONO, fontSize:10, color:lcrCol, fontWeight:600 }}>
                                      {d.lcr >= 99 ? "inf" : d.lcr.toFixed(2)+"x"}
                                    </td>
                                  );
                                }
                                if (isMode) {
                                  const mCol = d.mode==="HEALTHY"?T.green:d.mode==="WARNING"?T.amber:T.red;
                                  const short = d.mode==="HEALTHY"?"OK":d.mode==="WARNING"?"WARN":d.mode==="STRESS"?"STRESS":"EMERG";
                                  return (
                                    <td key={mi2} style={{ padding:"5px 5px", textAlign:"right",
                                      fontFamily:MONO, fontSize:10, color:mCol, fontWeight:600 }}>
                                      {short}
                                    </td>
                                  );
                                }
                                if (isPct) {
                                  const v = d[key] || 0;
                                  return (
                                    <td key={mi2} style={{ padding:"5px 5px", textAlign:"right",
                                      fontFamily:MONO, fontSize:10, color:v===0?T.ink5:INK, fontWeight:600 }}>
                                      {v === 0 ? "-" : v.toFixed(2)+"%"}
                                    </td>
                                  );
                                }
                                if (isMk) {
                                  const val = d.mkBreakdown?.[mkIdx]?.amt || 0;
                                  return (
                                    <td key={mi2} style={{ padding:"5px 5px", textAlign:"right",
                                      fontFamily:MONO, fontSize:9.5, color:val===0?T.ink5:INK3 }}>
                                      {val === 0 ? "-" : fmtCell(val, d.layer)}
                                    </td>
                                  );
                                }
                                const val = d[key] || 0;
                                const showPct = ["usdc","morpho","enhanced","liquid","rwaTotal","rwaPipeline"].includes(key);
                                return (
                                  <td key={mi2} style={{ padding:"5px 5px", textAlign:"right",
                                    fontFamily:MONO, fontSize:10,
                                    color: val === 0 ? T.ink5 : col,
                                    fontWeight: bold ? 700 : 500 }}>
                                    {val === 0 ? "-" : showPct ? fmtCell(val, d.layer) : fd(val)}
                                  </td>
                                );
                              })}
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Bound Core Reserve">
            <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:14 }}>

              {/* Architecture note */}
              <div style={{ background:T.bgSoft, border:`1px solid ${T.border}`, borderRadius:8,
                padding:"12px 14px", fontSize:11, color:T.ink2, lineHeight:1.7 }}>
                <span style={{ fontWeight:600, color:T.ink }}>Bound Core split:</span> This section covers <span style={{ fontWeight:600 }}>idle rwaUSD</span> — rwaUSD that never converted to BCI (private 5% + retail 2%). It can exit instantly via direct redemption or the pool. <span style={{ fontWeight:600, color:T.green }}>Raw USDC</span> in the smart contract is sized to <span style={{ fontWeight:600 }}>coverage % × idle rwaUSD TVL</span> (0% yield). Any USDC NAV above that requirement is deployed to the <span style={{ fontWeight:600, color:T.blue }}>USDC Yield Position</span> (T+0, earns yield). BCI exit flows are handled separately.
              </div>

              {/* Liability + asset composition */}
              <div>
                <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:10 }}>Balance Sheet . M{ms}</div>
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  {/* Idle rwaUSD liability */}
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:T.amberSoft }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:10.5, color:T.ink2, fontWeight:600 }}>Idle rwaUSD in Circulation (liability)</span>
                      <span style={{ fontSize:16, fontFamily:MONO, fontWeight:600, color:T.amber }}>{fd(rwaUSDIdle)}</span>
                    </div>
                    <div style={{ fontSize:10, color:T.ink4, marginTop:3 }}>Instant exit — pool sell or direct redemption · no lock period</div>
                  </div>
                  <div style={{ display:"flex" }}>
                    {[
                      { label:"USDC (Peg Defence)", pct:bcUsdcPct, amt:bcUsdcAmt,
                        col:T.green, sub:`Required ${fd(bcUsdcRequired)} · 0% yield · instant redemption` },
                      { label:"USDC Yield Position", pct:bcYieldUsdcPct, amt:bcYieldUsdcAmt,
                        col:T.blue,  sub:`Surplus NAV · ${yld.bcUsdcCoverage}% coverage · ${yld.bcYieldUsdcRate}%/yr · ${fd(bcYieldUsdcMo)}/mo` },
                    ].map(({ label, pct, amt, col, sub }, i) => (
                      <div key={label} style={{ flex:1, padding:"12px 14px",
                        borderRight: i===0 ? `1px solid ${T.border}` : "none" }}>
                        <div style={{ fontSize:10, color:T.ink3, marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:22, fontWeight:500, fontFamily:MONO, color:col, marginBottom:2 }}>
                          {pct.toFixed(1)}%
                        </div>
                        <div style={{ fontSize:12, fontFamily:MONO, color:T.ink2, marginBottom:4 }}>{fd(amt)}</div>
                        <div style={{ height:4, background:T.bgInset, borderRadius:2, overflow:"hidden", marginBottom:5 }}>
                          <div style={{ height:"100%", background:col, borderRadius:2, width:`${Math.min(pct,100)}%` }} />
                        </div>
                        <div style={{ fontSize:10, color:T.ink4 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"8px 14px", borderTop:`1px solid ${T.border}`,
                    background: bcCoverageOk ? T.greenSoft : T.redSoft,
                    display:"flex", justifyContent:"space-between", fontSize:10.5 }}>
                    <span style={{ color: bcCoverageOk ? T.greenInk : T.red, fontWeight:600 }}>
                      {bcCoverageOk
                        ? `Coverage OK — ${bcCoverageAchieved.toFixed(1)}% of idle rwaUSD USDC-backed`
                        : `Coverage short — ${fd(bcUsdcShortfall)} USDC below target`}
                    </span>
                    <span style={{ fontFamily:MONO, color:T.ink3 }}>
                      USDC NAV {fd(bcUsdcNav)} · Target {yld.bcUsdcCoverage}% of {fd(rwaUSDIdle)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls — 2 columns */}
              <div style={{ display:"flex", gap:20 }}>

                {/* Column 1: USDC coverage */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>USDC Instant Redemption Coverage</div>
                  <Slider label="USDC Coverage of Idle rwaUSD (%)" value={yld.bcUsdcCoverage} min={0} max={100} step={1}
                    onChange={v=>upYld("bcUsdcCoverage",v)} fmt={v=>`${v}%`}
                    hint={`Raw USDC for instant redemption = ${yld.bcUsdcCoverage}% × idle rwaUSD TVL (${fd(rwaUSDIdle)}). Required now: ${fd(bcUsdcRequired)}. Remainder of USDC NAV → Yield Position.`} />
                  <Slider label="Monthly Outflow - % of Idle rwaUSD" value={yld.bcOutflowRate ?? 2} min={0} max={20} step={0.5}
                    onChange={v=>upYld("bcOutflowRate",v)} fmt={v=>`${v}%`}
                    hint="Share of idle rwaUSD leaving Bound Core each month (redeemed to USDC or converted to BCI). Drains the rwaUSD liability and its USDC backing 1:1." />
                </div>

                {/* Column 2: USDC Yield Position */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>USDC Yield Position</div>
                  <Slider label="USDC Yield Position (%/yr)" value={yld.bcYieldUsdcRate} min={1} max={12} step={0.1}
                    onChange={v=>upYld("bcYieldUsdcRate",v)} fmt={v=>`${v}%`}
                    hint="Annual yield on USDC NAV surplus above the redemption coverage requirement. Instant liquidity (T+0). Realistic 3.5–6%." />
                </div>

                {/* Column 3: capital flows snapshot */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:T.ink3, fontWeight:600, textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:10 }}>Capital Flows . M{ms}</div>
                  <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                    overflow:"hidden" }}>
                    <div style={{ padding:"7px 12px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>Inflows & Outflows</span>
                    </div>
                    <div style={{ padding:"10px 12px" }}>
                      {[
                        ["Private LP idle (5%)",    fd(md?.privateBoundCore||0),    T.green],
                        ["Retail idle (pool)",       fd(md?.retailBoundCore||0),     T.green],
                        ["Idle rwaUSD TVL",          fd(rwaUSDIdle),                T.amber],
                        ["USDC required",            fd(bcUsdcRequired),            T.green],
                        ["USDC coverage achieved",   `${bcCoverageAchieved.toFixed(1)}%`, bcCoverageColor],
                        ["Monthly rwaUSD drain",     fd(md?.boundCoreOutflow||0), T.amber],
                      ].map(([k,v,col],i,arr) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between",
                          padding:"3px 0", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                          <span style={{ fontSize:10.5, color:T.ink3 }}>{k}</span>
                          <span style={{ fontSize:10.5, fontFamily:MONO, fontWeight:600, color:col }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component descriptions */}
              <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>Bound Core Reserve — Component Reference</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap" }}>
                  {[
                    { fee:"Total Bound Core", rate:"USDC NAV in Bound Core", col:T.ink,
                      what:"Total USDC assets deployed in Bound Core — peg defence USDC plus yield position. Separate from idle rwaUSD liability above." },
                    { fee:"USDC (Peg Defence)", rate:"Coverage % × idle rwaUSD", col:T.green,
                      what:"Raw USDC held in the smart contract for instant redemption of idle rwaUSD — via direct contract exit or pool sell. Earns 0%." },
                    { fee:"USDC Yield Position", rate:"NAV surplus above peg requirement", col:T.blue,
                      what:"USDC NAV above the coverage requirement. Instant T+0 liquidity, earns the configured annual yield." },
                    { fee:"Coverage Achieved", rate:"USDC peg defence ÷ idle rwaUSD", col:T.green,
                      what:"How much of idle rwaUSD TVL is actually USDC-backed this month. Below target % = under-collateralized for instant exit." },
                    { fee:"USDC Yield / mo", rate:"On yield position only", col:T.blue,
                      what:"Monthly yield earned on the USDC Yield Position. Raw peg-defence USDC earns nothing." },
                    { fee:"Total Gross Yield / mo", rate:"Same as USDC Yield / mo", col:T.ink,
                      what:"Total Bound Core yield — entirely from the yield position since peg defence USDC is at 0%." },
                  ].map(({ fee, rate, what, col }, i, arr) => (
                    <div key={fee} style={{ flex:"1 1 280px", minWidth:0, padding:"12px 14px",
                      borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                      borderTop: i >= 3 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ fontSize:11.5, fontWeight:600, color:T.ink, marginBottom:5, paddingBottom:5,
                        borderBottom:`2px solid ${col}` }}>{fee}</div>
                      <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                      <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVENUE TABLE - monthly breakdown */}
              {(() => {
                const { months } = bcTableData[bcTableYear - 1] || { months: [] };
                const bcRows = [
                  { key:"idle",       label:"Idle rwaUSD in circulation (liability)", col:T.amber, bold:true, sep:false, bg:T.amberSoft },
                  { key:"total",      label:"USDC NAV backing it (assets)",  col:T.ink,   bold:true,  sep:false, bg:T.bgSoft },
                  { key:"usdc",       label:"  USDC (Peg Defence)",          col:T.green, bold:false, sep:false, bg:T.bgEl },
                  { key:"yieldPos",   label:"  USDC Yield Position",         col:T.blue,  bold:false, sep:true,  bg:T.bgEl },
                  { key:"covAch",     label:"Coverage Achieved (%)",         col:T.green, bold:false, sep:false, bg:T.bgSoft, isPct:true },
                  { key:"yieldMo",    label:"USDC Yield / mo",               col:T.blue,  bold:false, sep:false, bg:T.bgSoft },
                  { key:"grossMo",    label:"Total Gross Yield / mo",        col:T.ink,   bold:true,  sep:true,  bg:T.bgEl },
                  { key:"toBCI",      label:"-> BCI SC (80%)",                col:T.green, bold:false, sep:false, bg:T.greenSoft },
                  { key:"toPR",       label:"-> Protocol Reserve (20%)",      col:T.blue,  bold:false, sep:true,  bg:T.blueSoft },
                  { key:"blended",    label:"Blended Annual Yield",          col:T.green, bold:true,  sep:false, bg:T.bgEl, isPct:true },
                ];
                return (
                  <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                    <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>
                        Bound Core Reserve - Monthly Breakdown
                      </span>
                      <div style={{ display:"flex", gap:3 }}>
                        {[1,2,3].map(y=>(
                          <button key={y} onClick={()=>setBcTableYear(y)}
                            style={{ padding:"2px 8px", borderRadius:4, cursor:"pointer", fontSize:9.5,
                              fontWeight:bcTableYear===y?700:500,
                              border:`1px solid ${bcTableYear===y?T.green:T.border}`,
                              background:bcTableYear===y?T.greenSoft:T.bgEl,
                              color:bcTableYear===y?T.greenInk:T.ink3 }}>
                            Year {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                        <thead>
                          <tr style={{ background:T.bgSoft }}>
                            <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                              fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                              borderBottom:`1px solid ${T.border}`, width:220, whiteSpace:"nowrap" }}>Component</th>
                            {Array.from({length:12},(_,i)=>(
                              <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                                fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                                M{(bcTableYear-1)*12+i+1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bcRows.map(({ key, label, col, bold, sep, bg, isPct }) => (
                            <tr key={key} style={{
                              borderBottom: sep ? `2px solid ${T.borderS}` : `1px solid ${T.border}`,
                              background: bg,
                            }}>
                              <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                                fontSize:bold?10.5:9.5, fontWeight:bold?700:400,
                                whiteSpace:"nowrap" }}>{label}</td>
                              {months.map((d, mi) => {
                                if (!d) return <td key={mi} style={{ padding:"5px 5px",
                                  textAlign:"right", fontFamily:MONO, fontSize:10, color:T.ink5 }}>-</td>;
                                const val = d[key] || 0;
                                return (
                                  <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                    fontFamily:MONO, fontSize:10,
                                    color: val===0 ? T.ink5 : col,
                                    fontWeight: bold ? 700 : 500 }}>
                                    {val===0 ? "-" : isPct ? val.toFixed(2)+"%" : fd(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

            </div>
          </CollapsibleSection>

          {/* Capital Flow Reconciliation — renamed from "Protocol Capital Flows —
              Monthly Overview" and moved to LAST (was above Bound Core Reserve).
              It is a pure consumer of every section above it (rule: Section 5 in
              AUDIT_PLAN_SECTIONS.md runs after 1-4 and 6 for exactly this reason),
              so it belongs after every source section, not before. */}
          <CollapsibleSection title="Capital Flow Reconciliation">
            <div style={{ marginTop:14 }}>
              <div style={{ background:T.bgSoft, border:`1px solid ${T.border}`, borderRadius:8,
                padding:"12px 14px", fontSize:11, color:T.ink2, lineHeight:1.7, marginBottom:16 }}>
                <span style={{ fontWeight:600, color:T.ink }}>What this section is:</span> a month-by-month
                trace of every dollar entering and leaving the protocol, split by the section that generated
                it — so any number above can be followed here and back again. <span style={{ fontWeight:600 }}>Two
                separate capital channels reach the protocol:</span> the <span style={{ fontWeight:600, color:T.blue }}>AMM
                pool</span> (retail buy/exit, RWA liquidation/minting) and the <span style={{ fontWeight:600, color:T.green }}>private
                contract</span> (institutional LP deposits) — they are never summed into one "total volume"
                figure below, since the private path never touches the pool. Balance-sheet/stock figures
                (Layer NAV, Bound Core NAV, BCI Supply) are not repeated here — see the Liquidity Layer, Bound
                Core Reserve, and Simulation Results sections for those; this section shows flow only.
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                <div style={{ display:"flex", gap:3 }}>
                  {[1,2,3].map(y=>(
                    <button key={y} onClick={()=>setFlowsTableYear(y)}
                      style={{ padding:"3px 10px", borderRadius:4, cursor:"pointer", fontSize:10,
                        fontWeight:flowsTableYear===y?700:500,
                        border:`1px solid ${flowsTableYear===y?T.green:T.border}`,
                        background:flowsTableYear===y?T.greenSoft:T.bgEl,
                        color:flowsTableYear===y?T.greenInk:T.ink3 }}>
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const { months } = protocolFlowsTableData[flowsTableYear - 1] || { months: [] };
                const fmtCell = (val, { isPct } = {}) => {
                  if (val === undefined || val === null || val === 0) return "-";
                  return isPct ? `${val.toFixed(1)}%` : fd(val);
                };
                const renderTable = (title, rows) => (
                  <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                    overflow:"hidden", marginBottom:16 }}>
                    <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:10, fontWeight:600, color:T.ink3,
                        textTransform:"uppercase", letterSpacing:"0.08em" }}>{title}</span>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                        <thead>
                          <tr style={{ background:T.bgSoft }}>
                            <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                              fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                              borderBottom:`1px solid ${T.border}`, width:260, whiteSpace:"nowrap" }}>Flow</th>
                            {Array.from({length:12},(_,i)=>(
                              <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                                fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                                M{(flowsTableYear-1)*12+i+1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(({ key, label, col, bold, sep, bg, isPct }) => (
                            <tr key={key} style={{
                              borderBottom: sep ? `2px solid ${T.borderS}` : `1px solid ${T.border}`,
                              background: bg,
                            }}>
                              <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                                fontSize:bold?10.5:9.5, fontWeight:bold?700:400,
                                whiteSpace:"nowrap" }}>{label}</td>
                              {months.map((d, mi) => {
                                if (!d) return <td key={mi} style={{ padding:"5px 5px",
                                  textAlign:"right", fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                                const val = d[key];
                                return (
                                  <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                    fontFamily:MONO, fontSize:10,
                                    color: !val ? T.ink5 : col,
                                    fontWeight: bold ? 700 : 500 }}>
                                    {fmtCell(val, { isPct })}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );

                const marketVolRows = [
                  { key:"pVolTotal",          label:"AMM Pool Volume (total)",          col:T.blue,  bold:true,  sep:false, bg:T.bgSoft },
                  { key:"poolRetailBuy",      label:"  Retail — Buy (pool)",             col:T.blue,  bold:false, sep:false, bg:T.bgEl },
                  { key:"poolRetailExit",     label:"  Retail — Exit Sell (pool)",       col:T.blue,  bold:false, sep:false, bg:T.bgEl },
                  { key:"poolRwaSell",        label:"  RWA — Liquidation Sell (pool)",   col:RC.rwa,  bold:false, sep:false, bg:T.bgEl },
                  { key:"poolRwaBuy",         label:"  RWA — Minting Buy (pool)",        col:RC.rwa,  bold:false, sep:true,  bg:T.bgEl },
                  { key:"privateContractVol", label:"Private Contract Volume (direct — not pool)", col:T.green, bold:true, sep:true, bg:T.bgSoft },
                  { key:"totalAllChannels",   label:"Total Capital Entering Protocol (both channels)", col:T.ink, bold:true, sep:false, bg:T.bgEl },
                ];

                const privateRows = [
                  { key:"privDeposit",     label:"Private Deposit (seed + monthly growth)", col:T.green, bold:true,  sep:false, bg:T.bgSoft },
                  { key:"privMintFee",     label:"  Mint Fee (0.3% · 80/20 BCI/PR)",        col:T.red,   bold:false, sep:false, bg:T.bgEl },
                  { key:"privRwaReceived", label:"  rwaUSD Received (post mint fee)",       col:T.green, bold:false, sep:false, bg:T.bgEl },
                  { key:"privToBci",       label:`  → Converting to BCI (${p.privateBCIConversion||95}%, gross)`, col:T.green, bold:false, sep:false, bg:T.bgEl },
                  { key:"privConvFee",     label:"    Conversion Fee (100% BCI SC)",        col:T.red,   bold:false, sep:false, bg:T.bgEl },
                  { key:"privToLayer",     label:"    → Net to Liquidity Layer",           col:T.blue,  bold:false, sep:false, bg:T.bgEl },
                  { key:"privToBcIdle",    label:`  → Idle (${100-(p.privateBCIConversion||95)}%) → Bound Core`, col:T.amber, bold:false, sep:true, bg:T.bgEl },
                  { key:"privLayerOut",    label:"Monthly Layer Exit (outflow)",            col:T.red,   bold:true,  sep:false, bg:T.bgSoft },
                ];

                const retailRows = [
                  { key:"retailPoolBuy",     label:"Retail Pool Buy Volume",                 col:T.blue,  bold:true,  sep:false, bg:T.bgSoft },
                  { key:"retailPoolFee",     label:"  Pool Fee (0.3%)",                      col:T.red,   bold:false, sep:false, bg:T.bgEl },
                  { key:"retailRwaReceived", label:"  rwaUSD Received (post pool fee)",       col:T.blue,  bold:false, sep:false, bg:T.bgEl },
                  { key:"retailToBci",       label:`  → Converting to BCI (${p.retailBCIConversion||98}%, gross)`, col:T.blue, bold:false, sep:false, bg:T.bgEl },
                  { key:"retailConvFee",     label:"    Conversion Fee (100% BCI SC)",        col:T.red,   bold:false, sep:false, bg:T.bgEl },
                  { key:"retailToLayer",     label:"    → Net to Liquidity Layer",           col:T.blue,  bold:false, sep:false, bg:T.bgEl },
                  { key:"retailToBcIdle",    label:`  → Idle (${100-(p.retailBCIConversion||98)}%) → Bound Core`, col:T.amber, bold:false, sep:true, bg:T.bgEl },
                  { key:"retailLayerOut",    label:"Monthly Layer Exit (outflow)",            col:T.red,   bold:true,  sep:false, bg:T.bgSoft },
                ];

                const boundCoreRows = [
                  { key:"bcInTotal",   label:"Total Inflow (idle rwaUSD, both LP paths)", col:T.amber, bold:true,  sep:false, bg:T.bgSoft },
                  { key:"bcInPriv",    label:"  From Private LP",                         col:T.green, bold:false, sep:false, bg:T.bgEl },
                  { key:"bcInRetail",  label:"  From Retail LP",                          col:T.blue,  bold:false, sep:true,  bg:T.bgEl },
                  { key:"bcOutflow",   label:"Outflow (redeemed / converted out)",        col:T.red,   bold:true,  sep:false, bg:T.bgSoft },
                ];

                const layerRows = [
                  { key:"layerInTotal",    label:"Total Inflow (net of conversion fee)", col:T.green, bold:true,  sep:false, bg:T.bgSoft },
                  { key:"layerInPriv",     label:"  From Private LP",                    col:T.green, bold:false, sep:false, bg:T.bgEl },
                  { key:"layerInRetail",   label:"  From Retail LP",                     col:T.blue,  bold:false, sep:true,  bg:T.bgEl },
                  { key:"layerOutTotal",   label:"Total Outflow (LP exits)",             col:T.red,   bold:true,  sep:false, bg:T.bgSoft },
                  { key:"layerOutPriv",    label:"  Private LP exit",                    col:T.red,   bold:false, sep:false, bg:T.bgEl },
                  { key:"layerOutRetail",  label:"  Retail LP exit",                     col:T.red,   bold:false, sep:true,  bg:T.bgEl },
                  { key:"rwaLiqServed",    label:"RWA Liquidation Served (Layer → RWA holder)", col:RC.rwa, bold:false, sep:false, bg:T.bgSoft },
                  { key:"rwaMintServed",   label:"RWA Minting Served (RWA holder → Layer)",     col:RC.rwa, bold:false, sep:false, bg:T.bgSoft },
                ];

                return (
                  <>
                    {renderTable("1 · Market Volume by Channel", marketVolRows)}
                    {renderTable("2 · Private LP — Capital Flow", privateRows)}
                    {renderTable("3 · Retail LP — Capital Flow", retailRows)}
                    {renderTable("4 · Bound Core — Inflow / Outflow (balance sheet in its own section)", boundCoreRows)}
                    {renderTable("5 · Liquidity Layer — Inflow / Outflow (composition in its own section)", layerRows)}
                  </>
                );
              })()}
            </div>
          </CollapsibleSection>

        </div>

        {/* ── STICKY "SEE SIMULATION RESULTS" BUTTON ──
            Fixed to the viewport so it stays reachable while scrolling through the
            long assumptions page; jumps to the separate Simulation Results page. */}
        <button onClick={goToResults}
          style={{ position:"fixed", right:24, bottom:24, zIndex:50,
            display:"flex", alignItems:"center", gap:8,
            padding:"12px 20px", borderRadius:999, cursor:"pointer",
            border:"none", background:T.green, color:"#fff",
            fontSize:13, fontWeight:600, letterSpacing:"-0.01em",
            boxShadow:"0 4px 16px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.15)" }}>
          See Simulation Results
          <span aria-hidden="true" style={{ fontSize:15, lineHeight:1 }}>→</span>
        </button>
        </>}

        {view === "results" && <>
        {/* ══ SIMULATION RESULTS — header + tab bar ═══════════════════ */}
        <div style={{ padding:"0 24px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            padding:"16px 0 0", borderBottom:`2px solid ${T.borderS}`, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:18, fontWeight:700, color:T.ink, letterSpacing:"-0.01em",
              paddingBottom:10 }}>
              Simulation Results
            </div>
            <div style={{ display:"flex", gap:2 }}>
              {[
                ["overview", "Overview"],
                ["bci", "BCI SC Revenue"],
                ["pr", "Protocol Reserve Revenue"],
                ["participants", "Participant Economics"],
              ].map(([key, label]) => (
                <button key={key} onClick={()=>setResultsTab(key)}
                  style={{ padding:"8px 16px", cursor:"pointer", fontSize:12,
                    fontWeight:resultsTab===key?700:500,
                    border:"none", borderBottom:`2px solid ${resultsTab===key?T.green:"transparent"}`,
                    marginBottom:-2, background:"transparent",
                    color:resultsTab===key?T.ink:T.ink3 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════ TAB 1 — OVERVIEW: KPI cards + price chart + Price & Backing ════ */}
        {resultsTab === "overview" && <>
        {/* Range control — drives the KPI row AND the BCI Index Price chart together */}
        <div style={{ padding:"0 24px 10px", display:"flex", justifyContent:"flex-end" }}>
          <div style={{ display:"flex", gap:3, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:T.ink4, fontWeight:600, textTransform:"uppercase",
              letterSpacing:"0.07em", marginRight:4 }}>Range</span>
            {[0,1,2,3].map(y=>(
              <button key={y} onClick={()=>setBciPriceView(y)}
                style={{ padding:"3px 10px", borderRadius:5, cursor:"pointer", fontSize:10,
                  fontWeight:bciPriceView===y?700:500,
                  border:`1px solid ${bciPriceView===y?T.green:T.border}`,
                  background:bciPriceView===y?T.greenSoft:T.bgEl,
                  color:bciPriceView===y?T.greenInk:T.ink3 }}>
                {y===0?"All":`Year ${y}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI ROW — linked to the Range control above (resultsMonth = end of the
             selected window: Year N -> M(N*12), All -> M36) so the cards and the chart
             always describe the same month. */}
        <div style={{ padding:"0 24px 16px", display:"flex", gap:10 }}>
          <KPI
            label={`BCI Annualized Growth · M${resultsMonth}`}
            value={fp(resultsRow?.annG)}
            sub={`Price ${fpr(resultsRow?.bciPrice)} rwaUSD at M${resultsMonth}`}
            accent
          />
          <KPI
            label={`Liquidity Layer · M${resultsMonth}`}
            value={fd(resultsRow?.layer)}
            sub="Backs all BCI tokens"
          />
          <KPI
            label={`BCI Supply · M${resultsMonth}`}
            value={resultsRow?.bciSupply ? `${(resultsRow.bciSupply/1e6).toFixed(2)}M` : "—"}
            sub={`Price: ${fpr(resultsRow?.bciPrice)} rwaUSD`}
          />
          <KPI
            label={`Bound Core USDC · M${resultsMonth}`}
            value={fd(resultsRow?.bcUsdcAmt)}
            sub={`${fp(resultsRow?.bcCoverageAchieved)} of idle rwaUSD · ${fd(resultsRow?.bcUsdcRequired)} required`}
          />
          <KPI
            label={`rwaUSD in Circulation · M${resultsMonth}`}
            value={fd(resultsRow?.rwaUSDIdle)}
            sub={`Idle in Bound Core · instant exit`}
          />
        </div>

        {/* ── BCI PRICE CHART + LINKED BCI SC BALANCE TABLE ── */}
        <div style={{ padding:"0 24px", marginBottom:12 }}>
          <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10,
            padding:16, boxShadow:SHADOW }}>
            <div style={{ marginBottom:12 }}>
              <SectionTitle sub="Layer NAV + BCI SC revenue ÷ BCI Supply · active scenario · starts at 1.0000 rwaUSD">
                BCI Index Price — 36-Month Projection
              </SectionTitle>
            </div>
            <ResponsiveContainer width="100%" height={bciPriceView===0?280:320}>
              <LineChart data={priceChart} margin={{top:28,right:20,bottom:bciPriceView>0?8:4,left:4}}>
                <CartesianGrid stroke={T.border} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="l"
                  interval={bciPriceView>0?0:5}
                  angle={bciPriceView>0?-40:0}
                  textAnchor={bciPriceView>0?"end":"middle"}
                  height={bciPriceView>0?52:28}
                  tick={{fill:T.ink3,fontSize:9,fontFamily:MONO}}
                />
                <YAxis
                  domain={priceChartDomain}
                  tick={{fill:T.ink3,fontSize:10,fontFamily:MONO}}
                  tickFormatter={v=>v.toFixed(4)}
                  width={62}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                        padding:"8px 12px", fontSize:11, boxShadow:SHADOW }}>
                        <div style={{ fontWeight:700, color:T.ink, marginBottom:4 }}>Month {d.m}</div>
                        <div style={{ fontFamily:MONO, color:T.greenInk }}>Price: {d.Price.toFixed(4)} rwaUSD</div>
                        <div style={{ fontFamily:MONO, color:T.ink3, marginTop:2 }}>annG: {d.annG}%</div>
                        <div style={{ fontFamily:MONO, color:T.ink3 }}>BCI SC: {fd(d.bciSC)}</div>
                        <div style={{ fontFamily:MONO, color:T.ink3 }}>Supply: {fSupply(d.supply)}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={1} stroke={T.borderS} strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value:"1.0000", position:"insideTopLeft", fill:T.ink4, fontSize:9, fontFamily:MONO }} />
                <Line type="monotone" dataKey="Price" stroke={T.green} strokeWidth={2.5}
                  dot={{ r:bciPriceView>0?4:2.5, fill:T.green, stroke:T.bgEl, strokeWidth:2 }}
                  activeDot={{ r:6, fill:T.greenInk, stroke:T.bgEl, strokeWidth:2 }}>
                  <LabelList
                    dataKey="Price"
                    position="top"
                    offset={10}
                    formatter={(v, _n, props) => props?.payload?.showPriceLabel ? v.toFixed(4) : ""}
                    style={{ fill:T.greenInk, fontSize:9, fontFamily:MONO, fontWeight:600 }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>

            {/* Linked BCI SC Balance table — shares bciPriceView with the chart/KPIs above */}
            {(() => {
              const isAll = bciPriceView === 0;
              const monthCols = isAll
                ? bciScBalanceYearSummary
                : (bciPriceCalcTableData[bciPriceView - 1]?.months || []);
              const colLabels = isAll
                ? ["Y1","Y2","Y3"]
                : Array.from({length:12}, (_, i) => `M${(bciPriceView - 1) * 12 + i + 1}`);
              const rows = [
                { section: "1 · Liquidity Providers — capital in the Layer" },
                { key:"layerNav",   label:"Liquidity Layer NAV (end)",            col:T.blue,  bold:true,  sep:false, bg:T.bgEl },
                { key:"privLayer",  label:"  → Private net to Layer",             col:T.blue,  bold:false, sep:false, bg:T.bgSoft },
                { key:"retailIn",   label:"  → Retail pool to Layer",             col:T.blue,  bold:false, sep:false, bg:T.bgSoft },
                { key:"layerOut",   label:"  − Layer redemptions",                col:T.red,   bold:false, sep:true,  bg:T.bgSoft },

                { section: "2 · BCI Smart Contract — accumulated fee revenue" },
                { key:"scEnd",      label:"BCI SC Balance (fee revenue, running total)", col:T.green, bold:true,  sep:false, bg:T.greenSoft },
                { key:"revenue",    label:isAll ? "  + New fee revenue this year" : "  + New fee revenue this month", col:T.green, bold:false, sep:true,  bg:T.bgSoft },

                { section: "3 · BCI Price Calculation" },
                { key:"bciNav",     label:"Total backing (Layer + BCI SC)",       col:T.ink,   bold:true,  sep:false, bg:T.bgSoft },
                { key:"supply",     label:"÷ BCI Supply (tokens)",                col:T.ink3,  bold:false, sep:false, bg:T.bgEl, isTokens:true },
                { key:"price",      label:"= BCI Price (rwaUSD)",                 col:T.green, bold:true,  sep:false, bg:T.greenSoft, isDec:true },
                { key:"annG",       label:"Annualized Growth",                    col:T.green, bold:false, sep:false, bg:T.bgSoft, isPct:true },
              ];
              return (
                <div style={{ marginTop:14, borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    flexWrap:"wrap", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                      letterSpacing:"0.08em" }}>
                      BCI Price & Backing — {isAll ? "Annual Summary" : `Monthly Breakdown · Year ${bciPriceView}`}
                    </span>
                  </div>
                  <div style={{ overflowX:"auto", border:`1px solid ${T.border}`, borderRadius:8 }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead>
                        <tr style={{ background:T.bgSoft }}>
                          <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                            fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                            borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Component</th>
                          {colLabels.map(lbl => (
                            <th key={lbl} style={{ padding:"6px 6px", textAlign:"right", color:T.ink3,
                              fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap",
                              minWidth:isAll?72:58 }}>
                              {lbl}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(({ section, key, label, col, bold, sep, bg, isTokens, isDec, isPct }) => {
                          if (section) return (
                            <tr key={section} style={{ background:T.bgInset }}>
                              <td colSpan={colLabels.length + 1} style={{ padding:"5px 12px", fontSize:9,
                                fontWeight:700, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.07em",
                                borderBottom:`1px solid ${T.border}` }}>{section}</td>
                            </tr>
                          );
                          return (
                          <tr key={key} style={{ borderBottom:sep?`2px solid ${T.borderS}`:`1px solid ${T.border}`, background:bg }}>
                            <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                              fontSize:bold?10.5:9.5, fontWeight:bold?700:400, whiteSpace:"nowrap" }}>{label}</td>
                            {monthCols.map((d, mi) => {
                              if (!d) return <td key={mi} style={{ padding:"5px 6px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = d[key] || 0;
                              const disp = val === 0 ? "—"
                                : isDec    ? val.toFixed(4)
                                : isTokens ? `${(val/1e6).toFixed(2)}M`
                                : isPct    ? `${val.toFixed(1)}%`
                                : fd(val);
                              return (
                                <td key={mi} style={{ padding:"5px 6px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col,
                                  fontWeight:bold?700:500 }}>
                                  {disp}
                                </td>
                              );
                            })}
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        </>}

        {/* ════ TAB 2 — BCI SC REVENUE ════ */}
        {resultsTab === "bci" && (
        <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.ink, letterSpacing:"-0.01em" }}>
                BCI SC Revenue
              </span>
              <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                <span style={{ fontSize:10, color:T.ink4, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.07em", marginRight:4 }}>Year</span>
                {[1,2,3].map(y=>(
                  <button key={y} onClick={()=>setBciRevYear(y)}
                    style={{ padding:"3px 10px", borderRadius:5, cursor:"pointer", fontSize:10,
                      fontWeight:bciRevYear===y?700:500,
                      border:`1px solid ${bciRevYear===y?T.green:T.border}`,
                      background:bciRevYear===y?T.greenSoft:T.bgEl,
                      color:bciRevYear===y?T.greenInk:T.ink3 }}>
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* BCI SC Revenue — stacked chart (linked to year + tables below) */}
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10,
              padding:16, boxShadow:SHADOW }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                flexWrap:"wrap", gap:10, marginBottom:10 }}>
                <SectionTitle sub={`Monthly revenue by source · $K · Year ${bciRevYear} · stacked = total to BCI SC`}>
                  BCI SC Revenue — Chart
                </SectionTitle>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                    M{bciRevYear * 12} · monthly revenue
                  </div>
                  <div style={{ fontSize:22, fontWeight:500, color:T.greenInk, fontFamily:MONO, letterSpacing:"-0.02em" }}>
                    {fd(bciYearEndRow?.totalBci)}
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bciRevChart} margin={{top:4,right:8,bottom:4,left:-8}}>
                  <CartesianGrid stroke={T.border} strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="l" interval={0} angle={-40} textAnchor="end" height={48}
                    tick={{fill:T.ink3,fontSize:9,fontFamily:MONO}} />
                  <YAxis tick={{fill:T.ink3,fontSize:9,fontFamily:MONO}} tickFormatter={v=>`${v}K`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                          padding:"8px 12px", fontSize:11, boxShadow:SHADOW }}>
                          <div style={{ fontWeight:700, color:T.ink, marginBottom:6 }}>Month {d.m}</div>
                          {payload.filter(p => p.value > 0).map(p => (
                            <div key={p.dataKey} style={{ fontFamily:MONO, color:p.color, marginBottom:2 }}>
                              {p.dataKey}: ${p.value}K
                            </div>
                          ))}
                          <div style={{ fontFamily:MONO, color:T.greenInk, marginTop:4, fontWeight:700,
                            borderTop:`1px solid ${T.border}`, paddingTop:4 }}>
                            Total: {fd(d.total)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="Conv. Fees"  stackId="a" fill={RC.conv}   />
                  <Bar dataKey="Mint/Redem"  stackId="a" fill={RC.entry}  />
                  <Bar dataKey="Pool+APSS"   stackId="a" fill={RC.pool}   />
                  <Bar dataKey="RWA Fees"    stackId="a" fill={RC.rwa}    />
                  <Bar dataKey="Layer Yield" stackId="a" fill={RC.morpho} />
                  <Bar dataKey="BC Yield"    stackId="a" fill={RC.float}  />
                  <Bar dataKey="Maintenance" stackId="a" fill={RC.maint}  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 14px", marginTop:10, paddingTop:10,
                borderTop:`1px solid ${T.border}` }}>
                {[
                  ["Conv. Fees", RC.conv], ["Mint/Redem", RC.entry], ["Pool+APSS", RC.pool],
                  ["RWA Fees", RC.rwa], ["Layer Yield", RC.morpho], ["BC Yield", RC.float],
                  ["Maintenance", RC.maint],
                ].map(([lbl, col]) => (
                  <span key={lbl} style={{ display:"flex", alignItems:"center", gap:5, fontSize:9.5, color:T.ink3 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:col, flexShrink:0 }} />
                    {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Fee Sources & Allocation */}
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                  letterSpacing:"0.08em" }}>BCI SC Revenue — Fee Sources & Allocation to BCI</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", borderBottom:`1px solid ${T.border}` }}>
                {[
                  { fee:"Conversion Fees", rate:"On rwaUSD ↔ BCI conversion", bci:"100%", pr:"0%", col:RC.conv,
                    what:"Charged when rwaUSD converts to/from BCI. Credited entirely to BCI SC — the strongest driver of BCI price." },
                  { fee:"Mint / Redemption", rate:`${p.mintRedeemFee||0.3}% · rwaUSD mint & redeem (protocol)`, bci:"80%", pr:"20%", col:RC.entry,
                    what:"Smart-contract fee when rwaUSD is minted or redeemed via the protocol — including pre-pool RWA liquidations." },
                  { fee:"Pool + APSS", rate:"On ALL pool volume (retail + RWA)", bci:"80%", pr:"20%", col:RC.pool,
                    what:"Pool trading fee plus APSS arbitrage on every pool swap — retail buys/exits AND RWA liquidation/minting legs routed through the pool. Zero before pool launch (month poolStart)." },
                  { fee:"RWA Fees", rate:"On RWA liquidation + minting volume", bci:"80%", pr:"20%", col:RC.rwa,
                    what:"Liquidation trade fee and dynamic haircut from RWA markets." },
                  { fee:"Layer Yield", rate:"On Liquidity Layer deployed capital", bci:"80%", pr:"10%", er:"10%", col:RC.morpho,
                    what:"Aave / Morpho / Enhanced yield on the Liquidity Layer. 10% tops up the Emergency Reserve." },
                  { fee:"Bound Core Yield", rate:"USDC Yield Position · flat split", bci:"80%", pr:"20%", col:RC.float,
                    what:"Yield on the USDC Yield Position. Flat 80% to BCI SC, 20% to Protocol Reserve." },
                  { fee:"Maintenance", rate:"Annual · per active market", bci:"20%", pr:"80%", col:RC.maint,
                    what:"Recurring per-market maintenance fee." },
                ].map(({ fee, rate, bci, pr, er, what, col }, i, arr) => (
                  <div key={fee} style={{ flex:"1 1 200px", minWidth:0, padding:"12px 14px",
                    borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                    borderTop: i >= 3 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ fontSize:11.5, fontWeight:600, color:T.ink, marginBottom:5, paddingBottom:5,
                      borderBottom:`2px solid ${col}` }}>{fee}</div>
                    <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                    <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.green,
                        background:T.greenSoft, padding:"2px 7px", borderRadius:3 }}>{bci} BCI SC</span>
                      <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                        color: pr==="0%" ? T.ink4 : T.blue, background: pr==="0%" ? T.bgInset : T.blueSoft,
                        padding:"2px 7px", borderRadius:3 }}>{pr} Protocol</span>
                      {er && (
                        <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.amber,
                          background:T.amberSoft, padding:"2px 7px", borderRadius:3 }}>{er} ER</span>
                      )}
                    </div>
                    <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* BCI SC Revenue — Monthly Breakdown */}
            {(() => {
              const { months } = bciScRevenueTableData[bciRevYear - 1] || { months:[] };
              const rows = [
                { key:"conv",    label:"Conv. Fees → BCI SC",        col:RC.conv,   bold:false, sep:false, bg:T.bgEl },
                { key:"entry",   label:"Mint / Redemption → BCI SC", col:RC.entry,  bold:false, sep:false, bg:T.bgEl },
                { key:"pool",    label:"Pool + APSS → BCI SC",       col:RC.pool,   bold:false, sep:false, bg:T.bgEl },
                { key:"rwa",     label:"RWA Fees → BCI SC",          col:RC.rwa,    bold:false, sep:false, bg:T.bgEl },
                { key:"layer",   label:"Layer Yield → BCI SC",       col:RC.morpho, bold:false, sep:false, bg:T.bgEl },
                { key:"bcYield", label:"Bound Core Yield → BCI SC",  col:RC.float,  bold:false, sep:false, bg:T.bgEl },
                { key:"maint",   label:"Maintenance → BCI SC",       col:RC.maint,  bold:false, sep:true,  bg:T.bgEl },
                { key:"gross",   label:"Total to BCI SC",            col:T.green,   bold:true,  sep:false, bg:T.greenSoft },
              ];
              return (
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                      letterSpacing:"0.08em" }}>BCI SC Revenue — Monthly Breakdown · Year {bciRevYear}</span>
                    <span style={{ fontSize:9, color:T.ink4 }}>Linked to Year {bciRevYear} selector above</span>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead><tr style={{ background:T.bgSoft }}>
                        <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                          fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                          borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Component</th>
                        {Array.from({length:12},(_,i)=>(
                          <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                            fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                            M{(bciRevYear-1)*12+i+1}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map(({ key, label, col, bold, sep, bg }) => (
                          <tr key={key} style={{ borderBottom:sep?`2px solid ${T.borderS}`:`1px solid ${T.border}`, background:bg }}>
                            <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                              fontSize:bold?10.5:9.5, fontWeight:bold?700:400, whiteSpace:"nowrap" }}>{label}</td>
                            {months.map((d,mi) => {
                              if (!d) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = d[key]||0;
                              return (
                                <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col,
                                  fontWeight:bold?700:500 }}>
                                  {val===0?"—":fd(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* BCI SC Revenue — % Composition. Re-added 2026-07-10 (owner request):
                connects the headline annualized-growth number to what drove it —
                the LAST row is Annualized Growth for that month, directly below
                the composition rows, so a reader can read down the column and see
                "12% annualized, 60% of that revenue was conversion fees." */}
            {(() => {
              const { months } = bciMonthlyCompositionData[bciRevYear - 1] || { months:[] };
              const rows = [
                { key:"convPct",    label:"Conv. Fees",        col:RC.conv   },
                { key:"entryPct",   label:"Mint / Redemption", col:RC.entry  },
                { key:"poolPct",    label:"Pool + APSS",       col:RC.pool   },
                { key:"rwaPct",     label:"RWA Fees",          col:RC.rwa    },
                { key:"layerPct",   label:"Layer Yield",       col:RC.morpho },
                { key:"bcYieldPct", label:"Bound Core Yield",  col:RC.float  },
                { key:"maintPct",   label:"Maintenance",       col:RC.maint  },
              ];
              return (
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                      letterSpacing:"0.08em" }}>BCI SC Revenue — % Composition · Year {bciRevYear}</span>
                    <div style={{ fontSize:9, color:T.ink5, marginTop:2, fontWeight:400 }}>
                      Each source as a share of that month's fee revenue credited to BCI SC (sums to 100%). Bottom row: that month's annualized index growth.
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead><tr style={{ background:T.bgSoft }}>
                        <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                          fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                          borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Source</th>
                        {Array.from({length:12},(_,i)=>(
                          <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                            fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                            M{(bciRevYear-1)*12+i+1}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map(({ key, label, col }) => (
                          <tr key={key} style={{ borderBottom:`1px solid ${T.border}`, background:T.bgEl }}>
                            <td style={{ padding:"5px 12px", color:col, fontSize:9.5, whiteSpace:"nowrap" }}>{label}</td>
                            {months.map((c,mi) => {
                              if (!c) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = c[key]||0;
                              return (
                                <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col, fontWeight:500 }}>
                                  {val===0?"—":`${val.toFixed(1)}%`}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr style={{ borderTop:`2px solid ${T.borderS}`, borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>
                          <td style={{ padding:"5px 12px", color:T.ink, fontSize:9.5, fontWeight:600 }}>Total (composition check)</td>
                          {months.map((c,mi) => {
                            if (!c) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                              fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                            const tot = (c.convPct||0)+(c.entryPct||0)+(c.poolPct||0)+(c.rwaPct||0)
                              +(c.layerPct||0)+(c.bcYieldPct||0)+(c.maintPct||0);
                            return (
                              <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:tot===0?T.ink5:T.ink3, fontWeight:600 }}>
                                {tot===0?"—":`${tot.toFixed(1)}%`}
                              </td>
                            );
                          })}
                        </tr>
                        <tr style={{ background:T.greenSoft }}>
                          <td style={{ padding:"6px 12px", color:T.ink, fontSize:10.5, fontWeight:700 }}>Annualized Growth (BCI Index)</td>
                          {months.map((c,mi) => {
                            if (!c) return <td key={mi} style={{ padding:"6px 5px", textAlign:"right",
                              fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                            return (
                              <td key={mi} style={{ padding:"6px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10.5, color:T.greenInk, fontWeight:700 }}>
                                {c.annG.toFixed(1)}%
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        )}

        {/* ════ TAB 3 — PROTOCOL RESERVE REVENUE ════ */}
        {resultsTab === "pr" && (
        <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.ink, letterSpacing:"-0.01em" }}>
                Protocol Reserve Revenue
              </span>
              <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                <span style={{ fontSize:10, color:T.ink4, fontWeight:600, textTransform:"uppercase",
                  letterSpacing:"0.07em", marginRight:4 }}>Year</span>
                {[1,2,3].map(y=>(
                  <button key={y} onClick={()=>setPrRevYear(y)}
                    style={{ padding:"3px 10px", borderRadius:5, cursor:"pointer", fontSize:10,
                      fontWeight:prRevYear===y?700:500,
                      border:`1px solid ${prRevYear===y?T.blue:T.border}`,
                      background:prRevYear===y?T.blueSoft:T.bgEl,
                      color:prRevYear===y?T.blue:T.ink3 }}>
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol Reserve Revenue — stacked chart */}
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10,
              padding:16, boxShadow:SHADOW }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                flexWrap:"wrap", gap:10, marginBottom:10 }}>
                <SectionTitle sub={`Monthly revenue by source · $K · Year ${prRevYear} · dashed = op. cost ($333K/mo)`}>
                  Protocol Reserve Revenue — Chart
                </SectionTitle>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:9.5, color:T.ink3, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                    M{prRevYear * 12} · cumul.
                  </div>
                  <div style={{ fontSize:22, fontWeight:500, color:T.ink, fontFamily:MONO, letterSpacing:"-0.02em" }}>
                    {fd(prYearEndRow?.prCum)}
                  </div>
                  <div style={{ fontSize:10.5, color:T.ink3 }}>month: {fd(prYearEndRow?.totalPr)}</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={prRevChart} margin={{top:4,right:8,bottom:4,left:-8}}>
                  <CartesianGrid stroke={T.border} strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="l" interval={0} angle={-40} textAnchor="end" height={48}
                    tick={{fill:T.ink3,fontSize:9,fontFamily:MONO}} />
                  <YAxis tick={{fill:T.ink3,fontSize:9,fontFamily:MONO}} tickFormatter={v=>`${v}K`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8,
                          padding:"8px 12px", fontSize:11, boxShadow:SHADOW }}>
                          <div style={{ fontWeight:700, color:T.ink, marginBottom:6 }}>Month {d.m}</div>
                          {payload.filter(p => p.value > 0).map(p => (
                            <div key={p.dataKey} style={{ fontFamily:MONO, color:p.color, marginBottom:2 }}>
                              {p.dataKey}: ${p.value}K
                            </div>
                          ))}
                          <div style={{ fontFamily:MONO, color:T.ink2, marginTop:4,
                            borderTop:`1px solid ${T.border}`, paddingTop:4 }}>
                            Gross: {fd(d.gross)}
                          </div>
                          {d.erTopUp > 0 && (
                            <div style={{ fontFamily:MONO, color:T.red }}>
                              − ER top-up: {fd(d.erTopUp)}
                            </div>
                          )}
                          <div style={{ fontFamily:MONO, color:T.blue, fontWeight:700 }}>
                            Net to PR: {fd(d.total)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={333} stroke={T.amber} strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value:"Op. cost", fill:T.amber, fontSize:8, position:"insideTopRight" }} />
                  <Bar dataKey="RWA Fees"    stackId="a" fill={RC.rwa}    />
                  <Bar dataKey="Mint/Redem"  stackId="a" fill={RC.entry}  />
                  <Bar dataKey="Pool+APSS"   stackId="a" fill={RC.pool}   />
                  <Bar dataKey="Maintenance" stackId="a" fill={RC.maint}  />
                  <Bar dataKey="Integration" stackId="a" fill={RC.integ}  />
                  <Bar dataKey="Layer Yield" stackId="a" fill={RC.morpho} />
                  <Bar dataKey="Float Yield" stackId="a" fill={RC.float}  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 14px", marginTop:10, paddingTop:10,
                borderTop:`1px solid ${T.border}` }}>
                {[
                  ["RWA Fees", RC.rwa], ["Mint/Redem", RC.entry], ["Pool+APSS", RC.pool],
                  ["Maintenance", RC.maint], ["Integration", RC.integ], ["Layer Yield", RC.morpho],
                  ["Float Yield", RC.float],
                ].map(([lbl, col]) => (
                  <span key={lbl} style={{ display:"flex", alignItems:"center", gap:5, fontSize:9.5, color:T.ink3 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:col, flexShrink:0 }} />
                    {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Fee Sources & Allocation to Protocol Reserve */}
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                  letterSpacing:"0.08em" }}>Protocol Reserve Revenue — Fee Sources & Allocation to Protocol Reserve</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {[
                  { fee:"Mint / Redemption", rate:`${p.mintRedeemFee||0.3}% · rwaUSD mint & redeem (protocol)`, pr:"20%", bci:"80%", col:RC.entry,
                    what:"Smart-contract fee on rwaUSD mint and redeem — including pre-pool RWA liquidations. Majority to BCI SC." },
                  { fee:"RWA Fees", rate:"On RWA liquidation + minting volume", pr:"20%", bci:"80%", col:RC.rwa,
                    what:"Liquidation trade fee and dynamic haircut from RWA markets. Majority to BCI SC." },
                  { fee:"Maintenance", rate:"Annual · per active market", pr:"80%", bci:"20%", col:RC.maint,
                    what:"Recurring per-market maintenance fee. Majority to Protocol Reserve." },
                  { fee:"Pool + APSS", rate:"On ALL pool volume (retail + RWA)", pr:"20%", bci:"80%", col:RC.pool,
                    what:"Pool trading fee plus APSS on every pool swap — retail AND RWA legs routed through the pool. Zero before pool launch (month poolStart)." },
                  { fee:"Bound Core Yield", rate:"USDC Yield Position · flat split", pr:"20%", bci:"80%", col:RC.float,
                    what:"Yield on the USDC Yield Position. Flat 20% to Protocol Reserve, 80% to BCI SC." },
                  { fee:"Layer Yield", rate:"On Liquidity Layer deployed capital", pr:"10%", bci:"80%", er:"10%", col:RC.morpho,
                    what:"Aave / Morpho / Enhanced yield on the Liquidity Layer. 10% to Protocol Reserve, 10% to ER." },
                  { fee:"Integration", rate:"One-time · per market launch", pr:"100%", bci:"0%", col:RC.integ,
                    what:"One-time onboarding fee when a new RWA market goes live. Credited entirely to Protocol Reserve." },
                ].map(({ fee, rate, pr, bci, er, what, col }, i, arr) => (
                  <div key={fee} style={{ flex:"1 1 200px", minWidth:0, padding:"12px 14px",
                    borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none",
                    borderTop: i >= 3 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ fontSize:11.5, fontWeight:600, color:T.ink, marginBottom:5, paddingBottom:5,
                      borderBottom:`2px solid ${col}` }}>{fee}</div>
                    <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                    <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.blue,
                        background:T.blueSoft, padding:"2px 7px", borderRadius:3 }}>{pr} Protocol</span>
                      <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600,
                        color: bci==="0%" ? T.ink4 : T.green, background: bci==="0%" ? T.bgInset : T.greenSoft,
                        padding:"2px 7px", borderRadius:3 }}>{bci} BCI SC</span>
                      {er && (
                        <span style={{ fontSize:10, fontFamily:MONO, fontWeight:600, color:T.amber,
                          background:T.amberSoft, padding:"2px 7px", borderRadius:3 }}>{er} ER</span>
                      )}
                    </div>
                    <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Reserve — Monthly Breakdown ($). Restructured 2026-07-10
                (owner request) to mirror the BCI SC Revenue tab exactly: 7 source
                rows + one bold Total. The "Gross (sum of sources)" / "− ER top-up"
                rows that used to live here (added when the S30 audit found the net
                total didn't visibly add up to the sources) have moved to their own
                Emergency Reserve section below, where the full funding picture
                (balance, target, coverage) lives — not removed, relocated. */}
            {(() => {
              const { months } = prRevenueTableData[prRevYear - 1] || { months:[] };
              const rows = [
                { key:"rwa",   label:"RWA Fees → Protocol Reserve",          col:RC.rwa,    bold:false, sep:false, bg:T.bgEl },
                { key:"entry", label:"Mint / Redemption → Protocol Reserve", col:RC.entry,  bold:false, sep:false, bg:T.bgEl },
                { key:"pool",  label:"Pool + APSS → Protocol Reserve",       col:RC.pool,   bold:false, sep:false, bg:T.bgEl },
                { key:"maint", label:"Maintenance → Protocol Reserve",       col:RC.maint,  bold:false, sep:false, bg:T.bgEl },
                { key:"integ", label:"Integration → Protocol Reserve",       col:RC.integ,  bold:false, sep:false, bg:T.bgEl },
                { key:"layer", label:"Layer Yield → Protocol Reserve",       col:RC.morpho, bold:false, sep:false, bg:T.bgEl },
                { key:"float", label:"Float Yield → Protocol Reserve",       col:RC.float,  bold:false, sep:true,  bg:T.bgEl },
                { key:"gross", label:"Total to Protocol Reserve (net)",      col:T.blue,    bold:true,  sep:false, bg:T.blueSoft },
                { key:"prCum", label:"Cumulative",                           col:T.ink3,    bold:false, sep:false, bg:T.bgSoft },
              ];
              return (
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                        letterSpacing:"0.08em" }}>Protocol Reserve Revenue — Monthly Breakdown · Year {prRevYear}</span>
                      <span style={{ fontSize:9, color:T.ink4 }}>Linked to Year {prRevYear} selector above</span>
                    </div>
                    <div style={{ fontSize:9, color:T.ink5, marginTop:2 }}>
                      "Total (net)" is after the Emergency Reserve top-up — see the Emergency Reserve section below for that deduction in full.
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead><tr style={{ background:T.bgSoft }}>
                        <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                          fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                          borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Source</th>
                        {Array.from({length:12},(_,i)=>(
                          <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                            fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                            M{(prRevYear-1)*12+i+1}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map(({ key, label, col, bold, sep, bg }) => (
                          <tr key={key} style={{ borderBottom:sep?`2px solid ${T.borderS}`:`1px solid ${T.border}`, background:bg }}>
                            <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                              fontSize:bold?10.5:9.5, fontWeight:bold?700:400, whiteSpace:"nowrap" }}>{label}</td>
                            {months.map((d,mi) => {
                              if (!d) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = d[key]||0;
                              return (
                                <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col,
                                  fontWeight:bold?700:500 }}>
                                  {val===0?"—":fd(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Protocol Reserve Revenue — % Composition (re-added 2026-07-10,
                mirrors the BCI SC Revenue % Composition table). Last row is the
                cumulative Protocol Reserve balance — the connecting metric, same
                role annG plays on the BCI SC tab. */}
            {(() => {
              const { months } = prMonthlyCompositionData[prRevYear - 1] || { months:[] };
              const rows = [
                { key:"rwaPct",   label:"RWA Fees",          col:RC.rwa    },
                { key:"entryPct", label:"Mint / Redemption", col:RC.entry  },
                { key:"poolPct",  label:"Pool + APSS",       col:RC.pool   },
                { key:"maintPct", label:"Maintenance",       col:RC.maint  },
                { key:"integPct", label:"Integration",       col:RC.integ  },
                { key:"layerPct", label:"Layer Yield",       col:RC.morpho },
                { key:"floatPct", label:"Float Yield",       col:RC.float  },
              ];
              return (
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                      letterSpacing:"0.08em" }}>Protocol Reserve Revenue — % Composition · Year {prRevYear}</span>
                    <div style={{ fontSize:9, color:T.ink5, marginTop:2, fontWeight:400 }}>
                      Each source as a share of that month's GROSS fee revenue routed to Protocol Reserve (before the ER top-up; sums to 100%).
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead><tr style={{ background:T.bgSoft }}>
                        <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                          fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                          borderBottom:`1px solid ${T.border}`, width:230, whiteSpace:"nowrap" }}>Source</th>
                        {Array.from({length:12},(_,i)=>(
                          <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                            fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                            M{(prRevYear-1)*12+i+1}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map(({ key, label, col }) => (
                          <tr key={key} style={{ borderBottom:`1px solid ${T.border}`, background:T.bgEl }}>
                            <td style={{ padding:"5px 12px", color:col, fontSize:9.5, whiteSpace:"nowrap" }}>{label}</td>
                            {months.map((c,mi) => {
                              if (!c) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = c[key]||0;
                              return (
                                <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col, fontWeight:500 }}>
                                  {val===0?"—":`${val.toFixed(1)}%`}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr style={{ borderTop:`2px solid ${T.borderS}`, borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>
                          <td style={{ padding:"5px 12px", color:T.ink, fontSize:9.5, fontWeight:600 }}>Total (composition check)</td>
                          {months.map((c,mi) => {
                            if (!c) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                              fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                            const tot = (c.rwaPct||0)+(c.entryPct||0)+(c.poolPct||0)+(c.maintPct||0)
                              +(c.integPct||0)+(c.layerPct||0)+(c.floatPct||0);
                            return (
                              <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:tot===0?T.ink5:T.ink3, fontWeight:600 }}>
                                {tot===0?"—":`${tot.toFixed(1)}%`}
                              </td>
                            );
                          })}
                        </tr>
                        <tr style={{ background:T.blueSoft }}>
                          <td style={{ padding:"6px 12px", color:T.ink, fontSize:10.5, fontWeight:700 }}>Cumulative Protocol Reserve</td>
                          {months.map((c,mi) => {
                            if (!c) return <td key={mi} style={{ padding:"6px 5px", textAlign:"right",
                              fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                            return (
                              <td key={mi} style={{ padding:"6px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10.5, color:T.blue, fontWeight:700 }}>
                                {fd(c.prCum)}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── EMERGENCY RESERVE — separate section (owner request 2026-07-10) ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.ink, letterSpacing:"-0.01em" }}>
                Emergency Reserve
              </span>
              <span style={{ fontSize:9, color:T.ink4 }}>Linked to Year {prRevYear} selector above</span>
            </div>

            {/* Emergency Reserve — reference card (same pattern as the Fee Sources
                & Allocation cards above): explains the logic, not just the numbers. */}
            <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                  letterSpacing:"0.08em" }}>Emergency Reserve — How It's Funded & Sized</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {[
                  { fee:"Seed", rate:"$500,000 at launch", col:T.amber,
                    what:"One-time protocol treasury seed at Month 1, insured. Starting balance for the loss-absorption reserve." },
                  { fee:"Layer Yield Credit", rate:"10% of gross Layer yield, every month", col:RC.morpho,
                    what:"A direct, automatic credit — separate from Protocol Reserve revenue. Grows the ER continuously as the Liquidity Layer earns yield, regardless of PR's own performance." },
                  { fee:"Protocol Reserve Top-Up", rate:"Only when ER balance < target; capped at 10% of gross PR revenue that month", col:T.blue,
                    what:"Fires only when the reserve has fallen behind its target. Since it's capped at 10% of PR revenue, a big shortfall closes gradually, never all at once." },
                  { fee:"Target Size", rate:"At-risk assets × year rate", col:T.ink,
                    what:"At-risk assets = Morpho deployment + Bound Core's USDC Yield Position. Rate rises each year: 10% (Year 1) → 15% (Year 2) → 20% (Year 3) → 25% cap beyond the simulator's 36-month horizon." },
                  { fee:"Loss Waterfall", rate:"3 layers, in order", col:T.red,
                    what:"(1) Emergency Reserve absorbs first. (2) Insurance policy covers losses beyond the ER's balance. (3) BCI index reduction — debiting the BCI SC directly — is the last resort, reached only if both prior layers are exhausted." },
                ].map(({ fee, rate, what, col }, i, arr) => (
                  <div key={fee} style={{ flex:"1 1 220px", minWidth:0, padding:"12px 14px",
                    borderRight: i < arr.length-1 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ fontSize:11.5, fontWeight:600, color:T.ink, marginBottom:5, paddingBottom:5,
                      borderBottom:`2px solid ${col}` }}>{fee}</div>
                    <div style={{ fontSize:10.5, color:T.ink3, marginBottom:8 }}>{rate}</div>
                    <div style={{ fontSize:10.5, color:T.ink4, lineHeight:1.5 }}>{what}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Reserve — Performance table */}
            {(() => {
              const { months } = erPerformanceTableData[prRevYear - 1] || { months:[] };
              const rows = [
                { key:"balance",       label:"ER Balance (end of month)",              col:T.amber, bold:true,  sep:false, bg:T.amberSoft },
                { key:"layerCredit",   label:"  → From Layer yield (10% credit)",      col:RC.morpho, bold:false, sep:false, bg:T.bgEl },
                { key:"topUp",         label:"  → Top-up from Protocol Reserve",       col:T.blue,  bold:false, sep:true,  bg:T.bgEl },
                { key:"atRisk",        label:"Total Value at Risk (Morpho + BC Yield Position)", col:T.ink3, bold:false, sep:false, bg:T.bgSoft },
                { key:"targetRatePct", label:"  × Target Rate (this year)",            col:T.ink3,  bold:false, sep:false, bg:T.bgSoft, isPct:true },
                { key:"target",        label:"= ER Target",                           col:T.ink,   bold:true,  sep:true,  bg:T.bgSoft },
                { key:"coveragePct",   label:"Coverage (Balance ÷ Target)",            col:T.green, bold:true,  sep:false, bg:T.greenSoft, isPct:true },
              ];
              return (
                <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px", background:T.bgSoft, borderBottom:`1px solid ${T.border}` }}>
                    <span style={{ fontSize:10, fontWeight:600, color:T.ink3, textTransform:"uppercase",
                      letterSpacing:"0.08em" }}>Emergency Reserve — Performance · Year {prRevYear}</span>
                    <div style={{ fontSize:9, color:T.ink5, marginTop:2, fontWeight:400 }}>
                      Balance rolls forward from the two credits above it. Target = Total Value at Risk × this year's Target Rate. Coverage below 100% means the reserve is still catching up to its target — not a shortfall against any current obligation.
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                      <thead><tr style={{ background:T.bgSoft }}>
                        <th style={{ padding:"6px 12px", textAlign:"left", color:T.ink3, fontWeight:600,
                          fontSize:9, textTransform:"uppercase", letterSpacing:"0.06em",
                          borderBottom:`1px solid ${T.border}`, width:260, whiteSpace:"nowrap" }}>Component</th>
                        {Array.from({length:12},(_,i)=>(
                          <th key={i} style={{ padding:"6px 5px", textAlign:"right", color:T.ink3,
                            fontWeight:600, fontSize:9, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>
                            M{(prRevYear-1)*12+i+1}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map(({ key, label, col, bold, sep, bg, isPct }) => (
                          <tr key={key} style={{ borderBottom:sep?`2px solid ${T.borderS}`:`1px solid ${T.border}`, background:bg }}>
                            <td style={{ padding:"5px 12px", color:bold?T.ink:col,
                              fontSize:bold?10.5:9.5, fontWeight:bold?700:400, whiteSpace:"nowrap" }}>{label}</td>
                            {months.map((d,mi) => {
                              if (!d) return <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                fontFamily:MONO, fontSize:10, color:T.ink5 }}>—</td>;
                              const val = d[key]||0;
                              return (
                                <td key={mi} style={{ padding:"5px 5px", textAlign:"right",
                                  fontFamily:MONO, fontSize:10, color:val===0?T.ink5:col,
                                  fontWeight:bold?700:500 }}>
                                  {isPct ? `${val.toFixed(0)}%` : (val===0?"—":fd(val))}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        )}

        {/* ════ TAB 4 — PARTICIPANT ECONOMICS ════ */}
        {resultsTab === "participants" && <>
        {/* ── PARTICIPANT ECONOMICS — WHO PAYS · WHO EARNS ──
            Rework 2026-07-09 (owner feedback): each card is now a self-contained
            calculator — investment amount + holding period are the ONLY controls,
            and everything shown (fees paid, Gross/Fee-Drag/Net APY, projected value)
            is computed for exactly that amount and that holding period. There is no
            separate section-wide "Year" selector anymore — it used to disagree with
            the simulator's own holding-period control. RWA Holder / rwaUSD Holder
            cards removed per owner request; this section is Private LP and Retail LP
            only. Styling flattened to a minimal, mostly-monochrome look — no filled
            color blocks, color used only as small text accents. */}
        <div style={{ margin:"0 24px 14px", background:T.bgEl, border:`1px solid ${T.border}`,
          borderRadius:10, overflow:"hidden", boxShadow:SHADOW }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:T.ink }}>Participant Economics — Who Pays · Who Earns</div>
            <div style={{ fontSize:10.5, color:T.ink3, marginTop:2 }}>
              Enter an amount and a holding period for each participant type — fees, APY, and projected return all update for exactly what you enter.
            </div>
          </div>

          {(() => {
            const toggleBreakdown = (key) => setPeBreakdownOpen(prev => ({ ...prev, [key]: !prev[key] }));

            // RWA Holder rate snapshot — current month (md), live average across active
            // markets (same convention used for every other "current month" figure).
            const activeMk = (md?.marketStats || []).filter(s => s.active);
            const avgHaircutPct = activeMk.length ? activeMk.reduce((a,s)=>a+s.haircutPct,0) / activeMk.length : 0;
            const avgTradeFPct  = activeMk.length ? activeMk.reduce((a,s)=>a+s.tradeFPct,0)  / activeMk.length : 0;

            // Shared rate inputs, read straight from the current assumption sliders
            // (p) — never hardcoded — so this stays correct if the user changes them.
            const bnd          = (p.bndUsage || 0) / 100;
            const convFeeRate  = ((p.convFeeRwaUSD || 0.89) / 100) * (1 - bnd); // blended rwaUSD-path rate, matches engine's own netToLayer formula
            const mintRdmRate  = (p.mintRedeemFee || 0.3) / 100;
            const poolFeeRate  = (p.poolFee || 0.3) / 100;

            const privRow  = sim[privYears * 12 - 1] || {};
            const privOut = computeLpOutcome({
              amount: privAmount, years: privYears,
              entryFeeRate: mintRdmRate, convPct: p.privateBCIConversion || 95,
              convFeeRate, exitFeeRate: mintRdmRate, bciPriceEnd: privRow.bciPrice || 1,
            });
            const privFeeLegs = [
              { label:`Mint fee — ${p.mintRedeemFee||0.3}% of ${fd(privAmount)} (full deposit), at entry`, value: privOut.entryFeeDollar },
              { label:`Conversion fee — ${((p.convFeeRwaUSD||0.89)*(1-bnd)).toFixed(2)}% of ${fd(privOut.convertingAmt)} (the ${p.privateBCIConversion||95}% that converts to BCI), at entry`, value: privOut.entryConvFee },
              { label:`Conversion fee — ${((p.convFeeRwaUSD||0.89)*(1-bnd)).toFixed(2)}% of ${fd(privOut.grown)} (grown BCI value), at exit`, value: privOut.exitConvFee },
              { label:`Redeem fee — ${p.mintRedeemFee||0.3}% of ${fd(privOut.afterExitConv)} (post-conversion exit amount), at exit`, value: privOut.exitFeeDollar },
            ];
            const privFeesPaidTotal = privFeeLegs.reduce((a,x)=>a+x.value, 0);
            const privGrossApy = privRow.annG || 0;

            const retailRow = sim[retailYears * 12 - 1] || {};
            const retailOut = computeLpOutcome({
              amount: retailAmount, years: retailYears,
              entryFeeRate: poolFeeRate, convPct: p.retailBCIConversion || 98,
              convFeeRate, exitFeeRate: poolFeeRate, bciPriceEnd: retailRow.bciPrice || 1,
            });
            const retailFeeLegs = [
              { label:`Pool trading fee — ${p.poolFee||0.3}% of ${fd(retailAmount)} (full deposit), at entry`, value: retailOut.entryFeeDollar },
              { label:`Conversion fee — ${((p.convFeeRwaUSD||0.89)*(1-bnd)).toFixed(2)}% of ${fd(retailOut.convertingAmt)} (the ${p.retailBCIConversion||98}% that converts to BCI), at entry`, value: retailOut.entryConvFee },
              { label:`Conversion fee — ${((p.convFeeRwaUSD||0.89)*(1-bnd)).toFixed(2)}% of ${fd(retailOut.grown)} (grown BCI value), at exit`, value: retailOut.exitConvFee },
              { label:`Pool trading fee — ${p.poolFee||0.3}% of ${fd(retailOut.afterExitConv)} (post-conversion exit amount), at exit`, value: retailOut.exitFeeDollar },
            ];
            const retailFeesPaidTotal = retailFeeLegs.reduce((a,x)=>a+x.value, 0);
            const retailGrossApy = retailRow.annG || 0;

            return (
              <div style={{ padding:14, display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <CapitalCard name="Private LP"
                    blurb="Institutional capital, direct contract deposit — 6-month lock, then scheduled monthly exits."
                    amount={privAmount} setAmount={setPrivAmount} years={privYears} setYears={setPrivYears}
                    grossApy={privGrossApy} netApy={privOut.netApy}
                    feeLegs={privFeeLegs} feesPaidTotal={privFeesPaidTotal}
                    projected={privOut.finalValue} gain={privOut.finalValue - privAmount}
                    open={!!peBreakdownOpen.private} onToggleBreakdown={()=>toggleBreakdown("private")} />
                  <CapitalCard name="Retail LP (Pool)"
                    blurb="Any wallet, AMM pool entry/exit — no lock, no minimum."
                    amount={retailAmount} setAmount={setRetailAmount} years={retailYears} setYears={setRetailYears}
                    grossApy={retailGrossApy} netApy={retailOut.netApy}
                    feeLegs={retailFeeLegs} feesPaidTotal={retailFeesPaidTotal}
                    projected={retailOut.finalValue} gain={retailOut.finalValue - retailAmount}
                    open={!!peBreakdownOpen.retail} onToggleBreakdown={()=>toggleBreakdown("retail")} />
                </div>

                {/* Transactional participants — RWA Holder and rwaUSD Holder don't
                    hold an ongoing capital position the way an LP does (no deposit to
                    grow, no holding-period choice), so they get a lighter card: a rate
                    snapshot (current month) plus a plain Pays/Earns list, styled to
                    match the LP cards' minimal borders/dividers rather than the old
                    bullet-list-only version. */}
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  {[
                    { name:"RWA Holder", blurb:"Institutions liquidating or minting RWA tokens through BOUND's per-market waterfall.",
                      stats:[
                        { label:"Haircut Rate", value:`${fp(avgHaircutPct,2)}` , note:"baseline + concentration escalation" },
                        { label:"Trade Fee", value:`${fp(avgTradeFPct,2)}`, note:"per direction" },
                      ],
                      pays:["Haircut on liquidation/minting volume","Trade fee each direction"],
                      earns:["Instant T+0 exit guaranteed","No issuer wait (T+30–T+120 avoided)","rwaUSD received instantly"] },
                    { name:"rwaUSD Holder", blurb:"Anyone holding rwaUSD outside the BCI conversion path — no minimum, redeemable any time.",
                      stats:[
                        { label:"Holding Cost", value:"0%", note:"free to hold" },
                        { label:"Exit Fee", value:`${p.poolFee||0.3}%`, note:"only if sold via the pool" },
                      ],
                      pays:["Nothing to hold $1 freely","0.3% pool fee only on USDC exit"],
                      earns:["$1 peg stability via APSS","DeFi composability","Passively generates float yield for BCI SC","Stake rwaUSD for BND — governance token + partner benefits"] },
                  ].map(({ name, blurb, stats, pays, earns }) => (
                    <div key={name} style={{ flex:1, minWidth:340, border:`1px solid ${T.border}`,
                      borderRadius:10, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                      <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>
                        <div style={{ fontSize:13, fontWeight:700, color:T.ink }}>{name}</div>
                        <div style={{ fontSize:10.5, color:T.ink3, marginTop:2 }}>{blurb}</div>
                      </div>
                      <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:14 }}>
                        <div style={{ display:"flex" }}>
                          {stats.map((s, i) => (
                            <div key={s.label} style={{ flex:1, padding: i===0 ? "4px 12px 4px 0" : "4px 0 4px 12px",
                              borderLeft: i>0 ? `1px solid ${T.border}` : "none" }}>
                              <div style={{ fontSize:9, color:T.ink4, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{s.label}</div>
                              <div style={{ fontSize:16, fontWeight:600, fontFamily:MONO, color:T.ink }}>{s.value}</div>
                              <div style={{ fontSize:9.5, color:T.ink4, marginTop:2 }}>{s.note}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:"flex", gap:20 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:9.5, color:T.ink4, fontWeight:600, textTransform:"uppercase",
                              letterSpacing:"0.06em", marginBottom:6 }}>Pays</div>
                            {pays.map((t,j)=><div key={j} style={{ fontSize:11, color:T.ink2,
                              marginBottom:4, lineHeight:1.4 }}>· {t}</div>)}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:9.5, color:T.ink4, fontWeight:600, textTransform:"uppercase",
                              letterSpacing:"0.06em", marginBottom:6 }}>Earns</div>
                            {earns.map((t,j)=><div key={j} style={{ fontSize:11, color:T.ink2,
                              marginBottom:4, lineHeight:1.4 }}>· {t}</div>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        </>}
        {/* (Floating sticky Back-to-Inputs button removed — the button now lives
            in the scenario bar at the top of the page, per owner request.) */}
        </>}

      </div>
    </>
  );
}
// end
