// Quick scenario comparison — run: node scripts/compare-scenarios.mjs
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

function report(label, markets) {
  console.log(`\n=== ${label} ===\n`);
  for (const k of ["default"]) {
    const r = simulate(PRESETS[k], markets, layerCfg)[11];
    console.log(PRESETS[k].name.padEnd(14),
      `price ${r.bciPrice.toFixed(4)}`,
      `annG ${r.annG.toFixed(1)}%`,
      `lpOut ${PRESETS[k].lpOutflow}%`,
    );
  }
}

report("M12 — no RWA markets", []);
report("M12 — default OUSG market", DEFAULT_MARKET);
