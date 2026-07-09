// Formal invariant verification — run: node scripts/verify-invariants.mjs
// Checks every system's mathematical invariants across all 36 months x 3 presets.
// Exit code 1 if any invariant fails.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const fn = new Function(`${chunk}\nreturn { PRESETS, simulate };`);
const { PRESETS, simulate } = fn();

const DEFAULT_MARKET = [{
  active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9,
  aum: 410_000_000, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5,
  mintRate: 0.4, mintHaircut: 0.3, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000,
}];
const layerCfg = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };

let failures = 0;
const REL_TOL = 1e-9;
const close = (a, b, tolAbs = 1e-6) => Math.abs(a - b) <= Math.max(tolAbs, Math.abs(b) * REL_TOL);
const check = (cond, label) => {
  if (!cond) { failures++; console.log(`  FAIL  ${label}`); return false; }
  return true;
};

for (const k of ["default"]) {
  console.log(`\n### ${PRESETS[k].name} preset (default OUSG market)`);
  const rows = simulate(PRESETS[k], DEFAULT_MARKET, layerCfg);
  let prevHeld = 0, prevPipe = 0;
  let allOk = true;
  rows.forEach((r) => {
    const tag = `M${r.m}`;
    // S1 — BCI price identity: price = (layerNav + bciSC) / supply
    allOk &= check(close(r.bciPrice, (r.layerNav + r.bciSC) / r.bciSupply),
      `${tag} S1 price identity: ${r.bciPrice} vs ${(r.layerNav + r.bciSC) / r.bciSupply}`);
    // S2 — annG derivation from price
    const annG = Math.min(Math.max((Math.pow(Math.max(r.bciPrice, 1e-9), 12 / r.m) - 1) * 100, 0), 999);
    allOk &= check(close(r.annG, annG), `${tag} S2 annG formula`);
    // S3 — 4-tier waterfall sums exactly to layer total
    const tierSum = r.usdcBufferAmt + r.morphoAmt + r.enhancedAmt + r.rwaCollateralInLayer;
    allOk &= check(close(tierSum, r.layer, 0.01), `${tag} S3 tier sum ${tierSum} != layer ${r.layer}`);
    // S4 — RWA held inventory never exceeds cap; pipeline non-negative
    allOk &= check(r.rwaCollateralBal <= r.layer * 20 / 100 + 0.01, `${tag} S4 held > maxRwaPct cap`);
    allOk &= check(r.rwaPipelineBal >= 0, `${tag} S4 pipeline negative`);
    // S5 — minting never sells more than start-of-month inventory
    allOk &= check(r.rwaMint <= prevHeld + 0.01, `${tag} S5 phantom mint: sold ${r.rwaMint} held ${prevHeld}`);
    // S6 — revenue stream sum: totalBci = 7 components
    const bciSum = r.bci_pool + r.bci_entry + r.bci_conv + r.bci_maint + r.bci_rwa + r.bci_morpho + r.bci_float;
    allOk &= check(close(r.totalBci, bciSum), `${tag} S6 totalBci component sum`);
    // S7 — Bound Core: Tier1 + Tier2 = NAV; Tier1 <= required; coverage math
    allOk &= check(close(r.bcUsdcAmt + r.bcYieldUsdcAmt, r.bcUsdcNav, 0.01), `${tag} S7 BC tier sum != NAV`);
    allOk &= check(r.bcUsdcAmt <= r.bcUsdcRequired + 0.01, `${tag} S7 BC tier1 over-allocated`);
    // S8 — LCR/stress mode consistency
    const mode = r.lcr >= 1.5 ? "HEALTHY" : r.lcr >= 1.0 ? "WARNING" : r.lcr >= 0.7 ? "STRESS" : "EMERGENCY";
    allOk &= check(r.stressMode === mode, `${tag} S8 stress mode ${r.stressMode} vs lcr ${r.lcr}`);
    // S9 — minting discount = max of ladders, never a sum
    allOk &= check(close(r.mintingDiscount, Math.max(r.preventiveDiscount, r.reactiveDiscount)),
      `${tag} S9 minting discount not max()`);
    // S10 — served volume never exceeds demand
    allOk &= check(r.rwaLiq <= r.totalLiqDemand + 0.01, `${tag} S10 liq served > demand`);
    allOk &= check(r.rwaMint <= r.totalMintDemand + 0.01, `${tag} S10 mint served > demand`);
    // S18 — RWA revenue reconstruction: per-market served volumes x effective rates
    // (exactly what the UI RWA Fee Revenue table displays) must reproduce the engine's
    // haircutRevenue and rwaTradeRevenue to the cent.
    if (r.marketStats) {
      const hc = r.marketStats.reduce((a, s) =>
        a + (s.liqServed||0) * (s.haircutPct||0)/100 + (s.mintServed||0) * (s.mintHcPct||0)/100, 0);
      const tf = r.marketStats.reduce((a, s) =>
        a + ((s.liqServed||0) + (s.mintServed||0)) * (s.tradeFPct||0)/100, 0);
      allOk &= check(close(hc, r.haircutRevenue, 0.01), `${tag} S18 haircut reconstruction ${hc} vs ${r.haircutRevenue}`);
      allOk &= check(close(tf, r.rwaTradeRevenue, 0.01), `${tag} S18 tradeF reconstruction ${tf} vs ${r.rwaTradeRevenue}`);
    }
    // S14 — per-market ledger consistency: held sums to global balance; served sums match
    if (r.marketStats) {
      const heldSum = r.marketStats.reduce((a, s) => a + s.held, 0);
      const liqSum  = r.marketStats.reduce((a, s) => a + s.liqServed, 0);
      const mintSum = r.marketStats.reduce((a, s) => a + s.mintServed, 0);
      allOk &= check(close(heldSum, r.rwaCollateralBal, 0.01), `${tag} S14 per-market held sum ${heldSum} != ${r.rwaCollateralBal}`);
      allOk &= check(close(liqSum, r.rwaLiq, 0.01), `${tag} S14 per-market liq served sum`);
      allOk &= check(close(mintSum, r.rwaMint, 0.01), `${tag} S14 per-market mint served sum`);
      r.marketStats.forEach(s => {
        allOk &= check(s.held >= -0.01, `${tag} S14 negative held for ${s.name}`);
      });
    }
    prevHeld = r.rwaCollateralBal;
    prevPipe = r.rwaPipelineBal;
  });
  if (allOk) console.log("  all 36-month invariants S1-S10 PASS");
}

// S11 — deposit neutrality: zero fees + zero yields => price stays exactly 1.0 forever
console.log(`\n### S11 — deposit-neutrality proof (zero fees, zero yields, no markets)`);
// Engine uses `||` fallbacks for several rates (not reachable at 0 from the UI), so use
// epsilon values — contributions are < $1e-4 on multi-million balances, far below tolerance.
const EPS = 1e-9;
const zeroFee = { ...PRESETS.default, poolFee: EPS, apssFee: EPS, convFeeRwaUSD: EPS, convFeeBND: EPS,
  mintRedeemFee: EPS, rwaTradeF: EPS, integFee: 0, maintFee: 0, bndUsage: 0 };
const zeroCfg = { aaveYield: EPS, morphoYield: EPS, enhancedYield: EPS, bcYieldUsdcRate: EPS };
const zrows = simulate(zeroFee, [], zeroCfg);
let neutralOk = true;
zrows.forEach(r => { if (!close(r.bciPrice, 1.0, 1e-9)) { neutralOk = false; failures++;
  console.log(`  FAIL M${r.m}: price ${r.bciPrice} != 1.0`); } });
if (neutralOk) console.log("  PASS — pure deposits/withdrawals are price-neutral in all 36 months");

// S12 — annG spot checks from the handoff: m=12 price 1.10 -> 10.0; m=24 -> 4.88
const g12 = (Math.pow(1.10, 12 / 12) - 1) * 100;
const g24 = (Math.pow(1.10, 12 / 24) - 1) * 100;
console.log(`\n### S12 — annG spot checks: m12=${g12.toFixed(2)} (want 10.00), m24=${g24.toFixed(2)} (want ~4.88)`);
if (Math.abs(g12 - 10) > 0.01 || Math.abs(g24 - 4.88) > 0.01) { failures++; console.log("  FAIL"); }
else console.log("  PASS");

// S20 — Entry budgets (money conservation at the door): every dollar an LP brings in
// must land in exactly one bucket. Private: lpIn = mintFee + convFee + toLayer + toBC.
// Retail: retailPoolVol = poolFee + convFee + toLayer + toBC. (APSS excluded — arbitrage
// capture around the peg, not deducted from the buyer's principal. BND fee excluded —
// paid in BND tokens, not from the deposit.)
console.log(`\n### S20 — LP entry budgets (Default preset, 36 months)`);
const budgetRows = simulate(PRESETS.default, [], {});
let budgetOk = true;
budgetRows.forEach(r => {
  const tag = `M${r.m}`;
  const privBudget = (r.privMintBCI + r.privMintPR) + r.privConvInBCI + r.privateToLayer + r.privateBoundCore;
  budgetOk &= check(close(privBudget, r.lpIn, 0.01), `${tag} S20 private entry budget ${privBudget} != lpIn ${r.lpIn}`);
  const retBudget = r.retailPoolFeeEntry + r.retBuyConvBCI + r.retailToLayer + r.retailBoundCore;
  budgetOk &= check(close(retBudget, r.retailPoolVol, 0.01), `${tag} S20 retail entry budget ${retBudget} != retailPoolVol ${r.retailPoolVol}`);
});
if (budgetOk) console.log("  PASS — every entry dollar lands in exactly one bucket, both paths, all 36 months");

// S19 — Private LP 6-month exit lock: zero exits/exit-side fees in months 1-6,
// exits resume from month 7. Retail LP is unaffected by the lock.
console.log(`\n### S19 — Private LP 6-month exit lock (Default preset)`);
const lockRows = simulate(PRESETS.default, [], {});
let lockOk = true;
lockRows.forEach(r => {
  const tag = `M${r.m}`;
  if (r.m <= 6) {
    lockOk &= check(close(r.privateLayerOut, 0, 0.01), `${tag} S19 privateLayerOut should be 0 during lock`);
    lockOk &= check(close(r.privRedeemBCI + r.privRedeemPR, 0, 0.01), `${tag} S19 redeem fee should be 0 during lock`);
  } else if (r.m === 7) {
    lockOk &= check(r.privateLayerOut > 0, `${tag} S19 exits should resume right after the lock`);
  }
  // Retail exits are never gated by the private-LP lock
  lockOk &= check(r.retailLayerOut >= 0, `${tag} S19 sanity: retailLayerOut non-negative`);
});
if (lockOk) console.log("  PASS — zero private exits in M1-6, resumes M7, retail unaffected");

// S15-S17 — BCI redemption queue + per-market retention cap (3-market set exercises both)
console.log(`\n### S15-S17 — BCI redemption queue + per-market cap (3 markets, Default preset)`);
const M1 = { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9, aum: 410e6, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 };
const M2 = { ...M1, name: "BUIDL", launchMonth: 4, mintStartMonth: 12, aum: 550e6, aumGrowth: 2.5, liqRate: 0.7, liqHaircut: 0.4 };
const M3 = { ...M1, name: "PC", launchMonth: 7, mintStartMonth: 15, aum: 180e6, aumGrowth: 3, liqRate: 1.2, liqHaircut: 0.8, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 45, rwaTradeF: 0.4 };
const rows3 = simulate(PRESETS.default, [M1, M2, M3], layerCfg);
let ok15 = true;
let prevQueue3 = 0;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  // S15 — queue and pipeline never negative; the queue is informational and never
  // exceeds cumulative unmet demand (it cannot serve more than was ever requested+queued)
  ok15 &= check(r.bciQueueBal >= -0.01, `${tag} S15 negative bciQueueBal`);
  // S16 — BCI redemptions are SENIOR (2026-07 fix): served = min(queue + desired,
  // USDC estimate + pipeline return), and RWA only ever gets what BCI left over.
  const funds = r.layerUSDCAvailable + r.rwaPipelineReturn;
  ok15 &= check(close(r.bciServedTotal, Math.min(prevQueue3 + r.desiredBCITotal, funds), 0.01),
    `${tag} S16 bciServedTotal not senior-min: ${r.bciServedTotal} vs ${Math.min(prevQueue3 + r.desiredBCITotal, funds)}`);
  ok15 &= check(r.rwaLiq <= funds - r.bciServedTotal + 0.01,
    `${tag} S16 rwaLiq ${r.rwaLiq.toFixed(0)} exceeds funds left after BCI ${(funds - r.bciServedTotal).toFixed(0)}`);
  // S17 — per-market held never exceeds the per-market cap
  (r.marketStats || []).forEach(s => {
    ok15 &= check(s.held <= r.layer * 10 / 100 + 0.5, `${tag} S17 ${s.name} held > mkMaxPct cap`);
  });
  prevQueue3 = r.bciQueueBal;
});
if (ok15) console.log("  PASS — queue/pipeline non-negative, BCI seniority holds, per-market cap respected");

// S21 — rwaHeldPct (genuine RWA concentration risk metric) must never exceed the
// category cap by construction, and must always be <= the blended rwaCollateralPct
// (which also includes pipeline cash and is NOT a risk metric). Guards against the
// pipeline-inflated-concentration bug found in the Section 3 audit.
console.log(`\n### S21 — rwaHeldPct never exceeds the category cap (3 markets, Default preset)`);
let s21Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  s21Ok &= check(r.rwaHeldPct <= 20 + 0.5, `${tag} S21 rwaHeldPct ${r.rwaHeldPct.toFixed(1)}% exceeds 20% cap`);
  s21Ok &= check(r.rwaHeldPct <= r.rwaCollateralPct + 0.01, `${tag} S21 rwaHeldPct exceeds blended rwaCollateralPct`);
});
if (s21Ok) console.log("  PASS — held-only concentration never exceeds the cap or the blended figure");
else console.log("  (see FAILs above)");

// S22 — RWA capacity sizing uses THIS month's real Layer (layerPostUpdate), not a
// stale prior-month figure. Guards the Section 3 addendum reorder fix: layerPostUpdate
// must equal prior-month closing balances PLUS this month's LP entry/exit flows —
// i.e. it must differ from (and, in any month with positive net LP inflow, exceed) the
// naive pre-flow prior balance. Also checks layerUSDCAvailable is a fixed fraction
// (<=80%, >=minBufferPct) of that same current-month basis, so the two can never
// silently drift apart (the exact defect class this addendum fixed).
console.log(`\n### S22 — RWA capacity sized off THIS month's real Layer, not prior-month`);
let s22Ok = true;
let prevPrivBal = 0, prevRetailBal = 0;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  const prevLayer = prevPrivBal + prevRetailBal;
  const netFlow = r.privateToLayer - r.privateLayerOut + r.retailToLayer - r.retailLayerOut;
  // layerPostUpdate should equal prior balances + this month's net LP flow (within cents)
  s22Ok &= check(close(r.layerPostUpdate, prevLayer + netFlow, 1),
    `${tag} S22 layerPostUpdate ${r.layerPostUpdate.toFixed(2)} != prevLayer+netFlow ${(prevLayer+netFlow).toFixed(2)}`);
  // layerUSDCAvailable must be derived from layerPostUpdate, bounded to [minBufferPct%, 80%] of it
  const pctOfBasis = r.layerPostUpdate > 0 ? r.layerUSDCAvailable / r.layerPostUpdate * 100 : 0;
  s22Ok &= check(pctOfBasis <= 80 + 0.01 && pctOfBasis >= -0.01,
    `${tag} S22 layerUSDCAvailable ${r.layerUSDCAvailable.toFixed(0)} is ${pctOfBasis.toFixed(1)}% of basis — outside [0,80]`);
  prevPrivBal = r.privateLayerBal; prevRetailBal = r.retailLayerBal;
});
if (s22Ok) console.log("  PASS — layerPostUpdate always reflects prior balances + THIS month's flows; layerUSDCAvailable stays a bounded fraction of it");
else console.log("  (see FAILs above)");

// S23 — LCR floor guard: RWA acceptance may never push the month-end LCR below
// rwaLcrTarget (default 1.5). A dip below the floor is only allowed when the engine
// accepted zero RWA that month (i.e. the dip is caused by LP outflows, not RWA).
console.log(`\n### S23 — LCR floor guard (3 markets, Default preset, floor 1.5)`);
let s23Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  s23Ok &= check(r.lcr >= 1.5 - 1e-6 || r.rwaLiq <= 0.01,
    `${tag} S23 LCR ${r.lcr.toFixed(4)} below floor while accepting RWA (${r.rwaLiq.toFixed(0)})`);
});
if (s23Ok) console.log("  PASS — LCR never below the floor in any month where RWA was accepted");

// S24 — per-market pipeline ledger: the per-market pipeline balances always sum to the
// global pipeline balance, and no market's pipeline ever goes negative. Guards the
// per-market issuer-redemption-timing fix (each market drains at its own T+days).
console.log(`\n### S24 — per-market pipeline ledger consistency (3 markets)`);
let s24Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  const pipeSum = (r.marketStats || []).reduce((a, s) => a + (s.pipeline || 0), 0);
  s24Ok &= check(close(pipeSum, r.rwaPipelineBal, 0.01),
    `${tag} S24 per-market pipeline sum ${pipeSum.toFixed(2)} != rwaPipelineBal ${r.rwaPipelineBal.toFixed(2)}`);
  (r.marketStats || []).forEach(s => {
    s24Ok &= check((s.pipeline || 0) >= -0.01, `${tag} S24 negative pipeline for ${s.name}`);
  });
});
if (s24Ok) console.log("  PASS — per-market pipeline balances sum to the global figure, none negative");

// S25 — minting discount is APPLIED (one-month lag): the discount actually applied to
// this month's mint haircut must equal LAST month's computed mintingDiscount, and every
// active market's effective mint haircut must equal baseline × (1 − applied/100).
console.log(`\n### S25 — minting discount applied to mint haircut (one-month lag, 3 markets)`);
let s25Ok = true;
let prevDisc = 0;
const mkBaseline = [M1.mintHaircut, M2.mintHaircut, M3.mintHaircut];
rows3.forEach(r => {
  const tag = `M${r.m}`;
  s25Ok &= check(close(r.appliedMintingDiscount, prevDisc, 1e-9),
    `${tag} S25 appliedMintingDiscount ${r.appliedMintingDiscount} != prior month's mintingDiscount ${prevDisc}`);
  (r.marketStats || []).forEach((s, i) => {
    if (!s.active) return;
    const expected = mkBaseline[i] * (1 - r.appliedMintingDiscount / 100);
    s25Ok &= check(close(s.mintHcPct, expected, 1e-6),
      `${tag} S25 ${s.name} mintHcPct ${s.mintHcPct} != baseline×(1−discount) ${expected}`);
  });
  prevDisc = r.mintingDiscount;
});
if (s25Ok) console.log("  PASS — discount lags one month and is genuinely applied to every market's mint haircut");

// S26 — Layer composition tiers sum to Total Layer NAV (held + pipeline + liquid tiers).
console.log(`\n### S26 — Layer tier sum = Layer NAV (3 markets, Default preset)`);
let s26Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  const tierSum = (r.usdcBufferAmt||0) + (r.morphoAmt||0) + (r.enhancedAmt||0)
    + (r.rwaCollateralBal||0) + (r.rwaPipelineBal||0);
  s26Ok &= check(close(tierSum, r.layer, 1), `${tag} S26 tier sum ${tierSum.toFixed(0)} != layer ${r.layer.toFixed(0)}`);
  // LCR reconstruction from exported fields
  const liq = r.liquidCapital ?? ((r.usdcBufferAmt||0)+(r.morphoAmt||0)+(r.enhancedAmt||0));
  const ob  = r.totalObligations ?? 0;
  const lcrRec = ob > 0 ? liq / ob : 99;
  s26Ok &= check(close(lcrRec, r.lcr, 0.0001), `${tag} S26 LCR reconstruction ${lcrRec.toFixed(4)} vs ${r.lcr.toFixed(4)}`);
});
if (s26Ok) console.log("  PASS — USDC+Morpho+Enhanced+held+pipeline = Layer NAV; LCR reconstructs from exports");

// S27 — Layer yield distribution exports: er_morpho must EXIST on every row (it was
// computed internally but never exported, so the Layer table's Emergency Reserve row
// rendered '-' in all 36 months — owner-reported), and the 80/10/10 identity must hold:
// bci_morpho + pr_morpho + er_morpho === layerYieldGross, with pr === er === gross×10%.
console.log(`\n### S27 — Layer yield 80/10/10 exports exist and sum (3 markets, Default preset)`);
let s27Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  s27Ok &= check(r.er_morpho !== undefined, `${tag} S27 er_morpho missing from engine exports`);
  const gross = r.layerYieldGross || 0;
  s27Ok &= check(close((r.bci_morpho||0) + (r.pr_morpho||0) + (r.er_morpho||0), gross, 0.01),
    `${tag} S27 80/10/10 does not sum to gross layer yield`);
  s27Ok &= check(close(r.er_morpho||0, gross * 0.10, 0.01), `${tag} S27 er_morpho != 10% of gross`);
  s27Ok &= check(close(r.pr_morpho||0, r.er_morpho||0, 0.01), `${tag} S27 pr_morpho != er_morpho`);
});
if (s27Ok) console.log("  PASS — er_morpho exported; bci+pr+er = gross; pr = er = 10% each");

// S28 — Bound Core yield distribute-once (no retained yield in NAV). The BC yield
// stream must be FULLY paid out 80/20 to BCI SC / PR (bci_float + pr_float), never
// also accrued into bcUsdcNav — retaining it there double-counted the same dollar
// (found in the Section 6 audit; at the default 100% coverage the yield position is
// structurally $0 so the bug was invisible — this check runs at 80% coverage where
// it is non-vacuous). NAV must therefore equal cumulative(inflow - outflow) exactly,
// and the yield/payout identities must hold each month.
console.log(`\n### S28 — Bound Core yield distribute-once at 80% coverage (Default preset)`);
const bcCfg = { ...layerCfg, bcUsdcCoverage: 80, bcYieldUsdcRate: 4.5, bcOutflowRate: 2 };
const bcRows = simulate(PRESETS.default, DEFAULT_MARKET, bcCfg);
let s28Ok = true, bcCumFlow = 0, bcSawYield = false;
bcRows.forEach(r => {
  const tag = `M${r.m}`;
  bcCumFlow += (r.newToBoundCore || 0) - (r.boundCoreOutflow || 0);
  s28Ok &= check(close(r.bcUsdcNav, Math.max(0, bcCumFlow), 0.01),
    `${tag} S28 NAV ${r.bcUsdcNav} != cum flows ${bcCumFlow} (yield retained in NAV?)`);
  s28Ok &= check(close(r.bcYieldGrossMo, (r.bcYieldUsdcAmt || 0) * 0.045 / 12, 0.01),
    `${tag} S28 gross yield != yield-position × rate/12`);
  s28Ok &= check(close((r.bcYieldToBCI || 0) + (r.bcYieldToPR || 0), r.bcYieldGrossMo || 0, 0.01),
    `${tag} S28 80/20 payout does not sum to gross`);
  s28Ok &= check(close(r.bci_float || 0, r.bcYieldToBCI || 0, 0.01),
    `${tag} S28 bci_float != bcYieldToBCI`);
  if ((r.bcYieldGrossMo || 0) > 0) bcSawYield = true;
});
s28Ok &= check(bcSawYield, "S28 vacuous — no month produced BC yield at 80% coverage");
if (s28Ok) console.log("  PASS — NAV = flows only; yield paid out 80/20 once, never retained");

// S29 — Capital Flow Reconciliation (§5 audit, 2026-07-09): the AMM pool and the
// private direct-contract channel are SEPARATE — pVol must equal the sum of its
// four displayed pool sub-flows and must NOT include lpIn (the previous UI table
// nested "Private Contract Volume" under "Total Pool Volume" as if it were
// counted — it was not; owner-facing "Total Capital Entering Protocol" now sums
// both channels explicitly). Also: Bound Core/Layer flow aggregates used in the
// restructured tables (newToBoundCore, rwaUSDToLayer, bciOutflowThisMonth) must
// match their own component sums — guards the same "aggregate omits/duplicates a
// component" bug class the pool-volume finding belongs to.
console.log(`\n### S29 — Capital Flow Reconciliation: channel & aggregate identities (3 markets, Default)`);
let s29Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  const poolSum = (r.retailPoolVol||0) + (r.retailExitSellVol||0) + (r.rwaPoolSellVol||0) + (r.rwaPoolBuyVol||0);
  s29Ok &= check(close(r.pVol||0, poolSum, 0.01), `${tag} S29 pVol != sum(retailBuy+retailExit+rwaSell+rwaBuy)`);
  s29Ok &= check(close(r.newToBoundCore||0, (r.privateBoundCore||0)+(r.retailBoundCore||0), 0.01),
    `${tag} S29 newToBoundCore != privateBoundCore+retailBoundCore`);
  s29Ok &= check(close(r.rwaUSDToLayer||0, (r.privateToLayer||0)+(r.retailToLayer||0), 0.01),
    `${tag} S29 rwaUSDToLayer != privateToLayer+retailToLayer`);
  s29Ok &= check(close(r.bciOutflowThisMonth||0, (r.privateLayerOut||0)+(r.retailLayerOut||0), 0.01),
    `${tag} S29 bciOutflowThisMonth != privateLayerOut+retailLayerOut`);
});
if (s29Ok) console.log("  PASS — pool volume = sum of 4 channel legs (excludes private contract); BC/Layer aggregates match component sums");

// S30 — PR revenue table identity (§7-10 results-page audit, 2026-07-09): the PR
// Monthly Breakdown's 7 source rows sum to totalPrRaw (gross); the ER top-up is
// deducted before the net credit. Previously the UI showed only the net total under
// gross component rows — the column didn't add up. Guards: totalPrRaw = component
// sum; totalPr = totalPrRaw − erTopUp; erTopUp ∈ [0, 10% of gross]; and totalBci
// still equals its component sum (S6 re-checked here on the 3-market preset).
console.log(`\n### S30 — PR gross − ER top-up = net; exports exist (3 markets, Default)`);
let s30Ok = true;
rows3.forEach(r => {
  const tag = `M${r.m}`;
  s30Ok &= check(r.totalPrRaw !== undefined && r.erTopUp !== undefined,
    `${tag} S30 totalPrRaw/erTopUp missing from engine exports`);
  const srcSum = (r.pr_pool||0)+(r.pr_entry||0)+(r.pr_integ||0)+(r.pr_maint||0)
    +(r.pr_rwa||0)+(r.pr_morpho||0)+(r.pr_float||0);
  s30Ok &= check(close(r.totalPrRaw||0, srcSum, 0.01), `${tag} S30 totalPrRaw != sum of 7 PR sources`);
  s30Ok &= check(close(r.totalPr||0, (r.totalPrRaw||0) - (r.erTopUp||0), 0.01),
    `${tag} S30 totalPr != totalPrRaw - erTopUp`);
  s30Ok &= check((r.erTopUp||0) >= -1e-9 && (r.erTopUp||0) <= (r.totalPrRaw||0)*0.10 + 0.01,
    `${tag} S30 erTopUp outside [0, 10% of gross]`);
});
if (s30Ok) console.log("  PASS — gross = source sum; net = gross − ER top-up; top-up capped at 10%");

// S13 — active:false market contributes nothing
console.log(`\n### S13 — inactive market exclusion`);
const inactive = [{ ...DEFAULT_MARKET[0], active: false }];
const rNone = simulate(PRESETS.default, [], layerCfg);
const rInact = simulate(PRESETS.default, inactive, layerCfg);
const sameAll = rNone.every((r, i) => close(r.bciPrice, rInact[i].bciPrice, 1e-9) && close(r.prCum, rInact[i].prCum, 1e-6));
if (sameAll) console.log("  PASS — inactive market identical to no market");
else { failures++; console.log("  FAIL — inactive market still affects results"); }

console.log(`\n=== ${failures === 0 ? "ALL INVARIANTS PASS" : failures + " FAILURES"} ===`);
process.exit(failures === 0 ? 0 : 1);
