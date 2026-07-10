// Independent hand-verification of month 12 (Default preset, single OUSG market).
// Recomputes M12 from the engine's M11 closing state using formulas derived from the
// handoff SPEC (not copied from engine code), then diffs every intermediate value.
// Ordered to match the engine's own sequence: LP entry/exit flows (which don't depend
// on RWA at all) are computed FIRST, giving an accurate layerPost BEFORE RWA capacity
// is sized off it — mirrors the profitability-fix reorder (owner-approved 2026-07-xx).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

const MK = { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9,
  aum: 410_000_000, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5,
  mintRate: 0.4, mintHaircut: 0.3, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 };
const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };
const p = PRESETS.default;

const rows = simulate(p, [MK], CFG);
const m11 = rows[10], m12 = rows[11];

// ---- M11 closing state (engine outputs) ----
const S = {
  privBal: m11.privateLayerBal, retBal: m11.retailLayerBal,
  held: m11.rwaCollateralBal, pipe: m11.rwaPipelineBal,
  queue: m11.bciQueueBal, mintDisc: m11.mintingDiscount,
  bcBal: m11.boundCoreBal, bcNav: m11.bcUsdcNav,
  bciSC: m11.bciSC, supply: m11.bciSupply, price: m11.bciPrice,
  poolVol: m11.retailPoolVol, stress: m11.stressMode,
};

let fails = 0;
const cmp = (label, mine, engine, tol = 0.01) => {
  const ok = Math.abs(mine - engine) <= Math.max(tol, Math.abs(engine) * 1e-9);
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(28)} mine=${mine.toFixed(4)}  engine=${engine.toFixed(4)}`);
};

const m = 12;
const bnd = p.bndUsage / 100;

// --- 1. RWA market demand (spec §5): demand = liqRate% × AUM grown from launch ---
const aum = MK.aum * Math.pow(1 + MK.aumGrowth / 100, m - MK.launchMonth);
const liqDemand  = aum * MK.liqRate / 100;
const mintDemand = aum * MK.mintRate / 100;   // mint open since M9
cmp("totalLiqDemand", liqDemand, m12.totalLiqDemand);
cmp("totalMintDemand", mintDemand, m12.totalMintDemand);

// --- 2. LP entry/exit flows FIRST — none of this depends on RWA (spec Step 0) ---
const lpIn = p.lpGrowth;                                  // m>1
const mintFee = lpIn * p.mintRedeemFee / 100;
const rwaUSDRecv = lpIn - mintFee;
const convEntry = rwaUSDRecv * p.privateBCIConversion / 100;
const convFeeEntry = convEntry * (1 - bnd) * p.convFeeRwaUSD / 100;
const privToLayer = convEntry - convFeeEntry;
const privOut = S.privBal * p.lpOutflow / 100;
const retOut  = S.retBal * p.retailOutflowRate / 100;
const convFeeExit = privOut * (1 - bnd) * p.convFeeRwaUSD / 100;
const redeemFee = (privOut - convFeeExit) * p.mintRedeemFee / 100;
// pool volume: compound from poolStart, using the actual per-year growth rate slider, cap 200M
let pv = p.poolInitialVolume;
for (let mm = p.poolStart + 1; mm <= m; mm++) {
  const yrIdx = Math.min(Math.floor((mm - p.poolStart) / 12), 4);
  const rate = [p.poolGrowthY1, p.poolGrowthY2, p.poolGrowthY3, p.poolGrowthY4, p.poolGrowthY5][yrIdx] / 100;
  pv = Math.min(pv * (1 + rate), 200e6);
}
cmp("retailPoolVol", pv, m12.retailPoolVol);
// Retail entry (money-conserving, mirrors private): pool fee taken from the swap,
// conversion fee deducted from the converting amount, remainder splits Layer/BoundCore.
const retRwaRecv  = pv - pv * p.poolFee / 100;
const retConvAmt  = retRwaRecv * p.retailBCIConversion / 100;
const retConvFeeE = retConvAmt * (1 - bnd) * p.convFeeRwaUSD / 100;
const retToLayer  = retConvAmt - retConvFeeE;
const retBCIdle   = retRwaRecv * (1 - p.retailBCIConversion / 100);
cmp("retailToLayer", retToLayer, m12.retailToLayer);
// S20 budget: buyer's USDC fully accounted for
cmp("retail entry budget", pv, pv * p.poolFee / 100 + retConvFeeE + retToLayer + retBCIdle);

// THIS MONTH's real layer — available now, before any RWA math (the whole point of
// the reorder: this used to be approximated from PRIOR month's layer instead).
const layerPost = Math.max(0, S.privBal + privToLayer - privOut + S.retBal + retToLayer - retOut);
cmp("layer (post-update)", layerPost, m12.layer);

// --- 3. Capacity waterfall (2026-07 redesign): BCI redemptions SENIOR, then an LCR
// guard, then market demand. Single OUSG market => pipeline drains fully each month
// (T+30 = 1 month).
const estUSDC = Math.max(5, 100 - (S.held + S.pipe) / Math.max(layerPost, 1) * 100);
const usdcAvail = layerPost * Math.min(estUSDC, 80) / 100;
cmp("layerUSDCAvailable", usdcAvail, m12.layerUSDCAvailable);
// (a) BCI redemptions first — LP exits are an obligation, RWA service is discretionary
const desired = privOut + retOut;
const pipeReturn = S.pipe / 1;                              // 30d redemption = 1 month
const funds = usdcAvail + pipeReturn;
const bciServed = Math.min(S.queue + desired, funds);
const fundsAfterBci = Math.max(0, funds - bciServed);
cmp("bciServedTotal", bciServed, m12.bciServedTotal);
// (b) LCR guard: cap acceptance X so projected month-end LCR >= 1.5 (+1e-3 margin)
const rwaMint = Math.min(S.held, mintDemand);               // sells from PRIOR inventory
const T = 1.5 + 1e-3;
const lcrCap = Math.max(0,
  (layerPost - (S.held + S.pipe) + pipeReturn + rwaMint - T * desired) / (1 + T * 14 / 30));
cmp("rwaLcrCap", lcrCap, m12.rwaLcrCap);
// (c) accept up to min(funds left, LCR guard, demand × stress throttle)
const throttle = S.stress === "EMERGENCY" ? 0.5 : 1;
const rwaLiq  = Math.min(fundsAfterBci, lcrCap, liqDemand * throttle);
cmp("rwaLiq", rwaLiq, m12.rwaLiq);
cmp("rwaMint", rwaMint, m12.rwaMint);

// --- 4. Haircut/trade-fee revenue, with the 3-step concentration escalation ladder ---
// Revenue projected at BASELINE haircut only — the punitive triggered haircut is a
// deterrent safeguard excluded from revenue projections (owner ruling 2026-07-08).
// On top of baseline, a gentle ladder bumps haircut/tradeF as concentration rises —
// both category-wide (vs maxRwaPct=20%) and per-market (vs mkMaxPct=10%), additive.
// Priced off layerPost now too (consistent with rwaHeldPct's own denominator).
const LADDER = [{ f: 0.50, hc: 0.10, tf: 0.05 }, { f: 0.75, hc: 0.20, tf: 0.10 }, { f: 1.00, hc: 0.30, tf: 0.15 }];
const bump = (concPct, capPct) => {
  const frac = capPct > 0 ? concPct / capPct : 0;
  let b = { hc: 0, tf: 0 };
  for (const step of LADDER) if (frac >= step.f) b = step;
  return b;
};
const categoryConcPct = layerPost > 0 ? S.held / layerPost * 100 : 0;
const catBump = bump(categoryConcPct, 20);
const mkBump  = bump(categoryConcPct, 10);   // single market: mkConcPct === categoryConcPct
const haircutBumpPct = catBump.hc + mkBump.hc;
const tradeFBumpPct  = catBump.tf + mkBump.tf;
const liqHc = (MK.liqHaircut + haircutBumpPct) / 100;
const tradeFRate = (MK.rwaTradeF + tradeFBumpPct) / 100;
// Mint haircut is discounted by LAST month's minting discount (one-month lag —
// the discount is genuinely applied to revenue since the 2026-07 fix, it is no
// longer a display-only figure).
const mintHc = (MK.mintHaircut / 100) * (1 - S.mintDisc / 100);
cmp("appliedMintingDiscount", S.mintDisc, m12.appliedMintingDiscount);
const haircut = rwaLiq * liqHc + rwaMint * mintHc;
cmp("haircutRevenue", haircut, m12.haircutRevenue);

// --- 5. Retail exit + RWA pool volume (now that rwaLiq/rwaMint are known) ---
const retConvFeeX = retOut * (1 - bnd) * p.convFeeRwaUSD / 100;
const retExitSell = retOut - retConvFeeX;
const pVol = pv + retExitSell + rwaLiq + rwaMint;         // pool live (m>=4)
cmp("pVol", pVol, m12.pVol);

// --- 6. Bound Core (spec §3a) ---
const newToBC = rwaUSDRecv * (1 - p.privateBCIConversion / 100) + retBCIdle;
const bcOut = S.bcBal * 0.02;
const idle = Math.max(0, S.bcBal + newToBC - bcOut);
// No yield accrual into NAV: BC yield is fully paid out 80/20 (distribute-once rule),
// never retained — retaining it was a double-count fixed in the Section 6 audit.
const bcNav = Math.max(0, S.bcNav + newToBC - bcOut);
const bcT1 = Math.min(bcNav, idle * 1.0);
const bcT2 = Math.max(0, bcNav - bcT1);
cmp("rwaUSDIdle", idle, m12.rwaUSDIdle);
cmp("bcUsdcAmt (Tier1)", bcT1, m12.bcUsdcAmt);
cmp("bcYieldUsdcAmt (Tier2)", bcT2, m12.bcYieldUsdcAmt);
const bcYieldMo = bcT2 * (4.5 / 100) / 12;
cmp("bcYieldGrossMo", bcYieldMo, m12.bcYieldGrossMo);

// --- 7. Layer waterfall (spec §3b) on post-update layer ---
const dailyOut = (privOut + retOut) / 30;
const bciCov = dailyOut * 14 / layerPost * 100;
// Obligations reflect COMMITTED (served) volume, not raw external demand
const rwaCov = (rwaLiq / 30) * 14 / layerPost * 100;
const bufPct = Math.min(80, Math.max(5, bciCov, rwaCov));
const bufAmt = layerPost * bufPct / 100;
cmp("usdcBufferAmt", bufAmt, m12.usdcBufferAmt);
// RWA inventory update: held += liq - mint, capped by the PER-MARKET cap first (10% —
// with a single market this binds tighter than the 20% category cap), overflow ->
// pipeline. Pipeline drains only its PRIOR balance this month (new overflow hasn't
// waited yet) — pipeReturn was already computed up in §3, where it funds the BCI
// redemption/RWA capacity waterfall. Per-market pipeline ledger: with a single OUSG
// market (T+30), the whole prior pipeline returns each month.
const mkCap = layerPost * 10 / 100;
const heldPre = Math.max(0, S.held + rwaLiq - rwaMint);
const toPipe = Math.max(0, heldPre - mkCap);
const held12 = Math.min(heldPre, mkCap);
const pipe12 = Math.max(0, S.pipe - pipeReturn + toPipe);
cmp("rwaCollateralBal (held)", held12, m12.rwaCollateralBal);
cmp("rwaPipelineBal", pipe12, m12.rwaPipelineBal);
const rwaInLayer = Math.min(held12 + pipe12, layerPost * (100 - bufPct) / 100);
cmp("rwaCollateralInLayer", rwaInLayer, m12.rwaCollateralInLayer);
const ybAfter = Math.max(0, layerPost * (100 - bufPct) / 100 - rwaInLayer);
const enh = Math.min(ybAfter * 0.20, Math.max(0, ybAfter - layerPost * 0.20));
const mor = Math.max(0, ybAfter - enh);
cmp("morphoAmt", mor, m12.morphoAmt);
cmp("enhancedAmt", enh, m12.enhancedAmt);

// --- 8. LCR ---
const lcr = (bufAmt + mor + enh) / (dailyOut * 30 + (rwaLiq / 30) * 14);
cmp("LCR", lcr, m12.lcr, 0.0001);

// --- 9. Revenue streams (spec §4 table) ---
const layerYield = bufAmt * 0.035 / 12 + mor * 0.045 / 12 + enh * 0.075 / 12;
cmp("layerYieldGross", layerYield, m12.layerYieldGross);
const poolRate = (p.poolFee + p.apssFee) / 100;
const bci_pool = pVol * poolRate * 0.80;
const bci_conv = convFeeEntry + convFeeExit + retConvFeeX + retConvFeeE;
const bci_entry = (mintFee + redeemFee + 0) * 0.80;       // pool live => no rwaRedeemFee; 80/20 since 2026-07-10 (owner flip, was 20/80)
const rwaTrade = (rwaLiq + rwaMint) * tradeFRate;
cmp("rwaTradeRevenue", rwaTrade, m12.rwaTradeRevenue);
const bci_rwa = (rwaTrade + haircut) * 0.80;              // 80/20 since 2026-07-10 (owner flip, was 20/80)
const bci_maint = MK.maintFee / 12 * 0.20;
const bci_morpho = layerYield * 0.80;
const bci_float = bcYieldMo * 0.80;
const totalBci = bci_pool + bci_entry + bci_conv + bci_maint + bci_rwa + bci_morpho + bci_float;
cmp("totalBci", totalBci, m12.totalBci);

// --- 10. BCI price (spec §2): mint/burn at start price, SC += totalBci ---
const mintQ = (privToLayer + retToLayer) / S.price;
const burnQ = Math.min((privOut + retOut) / S.price, S.supply);
const sc12 = S.bciSC + totalBci;
const sup12 = S.supply + mintQ - burnQ;
const price12 = (layerPost + sc12) / sup12;
cmp("bciSupply", sup12, m12.bciSupply);
cmp("bciSC", sc12, m12.bciSC);
cmp("bciPrice", price12, m12.bciPrice, 1e-9);
const annG = (Math.pow(price12, 12 / 12) - 1) * 100;
cmp("annG", annG, m12.annG, 0.0001);

console.log(`\n=== M12 hand-verification: ${fails === 0 ? "ALL VALUES MATCH" : fails + " MISMATCHES"} ===`);
process.exit(fails ? 1 : 0);
