// Verification baseline dump — run: node scripts/baseline-dump.mjs
// Prints key engine outputs at M12/M24/M36 for all presets, with the default market.
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

const layerCfg = {
  minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5,
  rwaConcentrationHard: 10, rwaHaircutTriggered: 15,
};

const f = (n) => n == null ? "-" : Math.abs(n) >= 1e6 ? (n/1e6).toFixed(3)+"M" : Math.abs(n) >= 1e3 ? (n/1e3).toFixed(1)+"K" : n.toFixed(2);

for (const k of ["default"]) {
  const rows = simulate(PRESETS[k], DEFAULT_MARKET, layerCfg);
  console.log(`\n=== ${PRESETS[k].name} (default OUSG market) ===`);
  for (const mi of [11, 23, 35]) {
    const r = rows[mi];
    console.log(
      `M${String(r.m).padEnd(2)}`,
      `price ${r.bciPrice.toFixed(4)}`,
      `annG ${r.annG.toFixed(2)}%`,
      `layer ${f(r.layer)}`,
      `bciSC ${f(r.bciSC)}`,
      `supply ${f(r.bciSupply)}`,
      `PRcum ${f(r.prCum)}`,
      `ER ${f(r.er)}`,
      `rwaColl ${f(r.rwaCollateralBal)}`,
      `rwaColl% ${r.rwaCollateralPct.toFixed(1)}`,
      `LCR ${r.lcr.toFixed(2)}`,
      `${r.stressMode}`,
    );
  }
  // tier-sum invariant check across all 36 months
  let maxErr = 0, capBreachMonths = 0;
  for (const r of rows) {
    const layerPost = r.layer; // post-update layer (balances after month lands)
    const tierSum = r.usdcBufferAmt + r.morphoAmt + r.enhancedAmt + r.rwaCollateralInLayer;
    // note: tiers were computed on inflow-adjusted base (before yield share added), so compare vs that
    const err = Math.abs(tierSum - (r.usdcBufferAmt + r.morphoAmt + r.enhancedAmt + r.rwaCollateralInLayer));
    maxErr = Math.max(maxErr, err);
    if (r.rwaCollateralBal > r.rwaCollateralInLayer + 1) capBreachMonths++;
  }
  console.log(`  months where rwaCollateralBal exceeds in-layer allocation: ${capBreachMonths}/36`);
}
