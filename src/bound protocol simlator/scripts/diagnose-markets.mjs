// Diagnose: why does adding markets REDUCE BCI growth?
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

const M1 = { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9,
  aum: 410e6, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3,
  issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 };
const M2 = { ...M1, name: "BUIDL", launchMonth: 4, mintStartMonth: 12, aum: 550e6, aumGrowth: 2.5, liqRate: 0.7, liqHaircut: 0.4 };
const M3 = { ...M1, name: "PrivCredit", launchMonth: 7, mintStartMonth: 15, aum: 180e6, aumGrowth: 3, liqRate: 1.2, liqHaircut: 0.8, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 45, rwaTradeF: 0.4 };
const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };

for (const [label, mks] of [["1 market (OUSG)", [M1]], ["3 markets", [M1, M2, M3]]]) {
  const rows = simulate(PRESETS.default, mks, CFG);
  console.log(`\n=== ${label} ===`);
  for (const mi of [11, 23, 35]) {
    const r = rows[mi];
    console.log(`M${String(r.m).padEnd(2)} price ${r.bciPrice.toFixed(4)} annG ${r.annG.toFixed(1)}%`,
      `demand ${(r.totalLiqDemand/1e6).toFixed(1)}M served ${(r.rwaLiq/1e6).toFixed(1)}M`,
      `LCR ${r.lcr.toFixed(2)} ${r.stressMode}`,
      `accept ${r.rwaAcceptancePct}%`,
      `usdcAvail ${(r.layerUSDCAvailable/1e6).toFixed(1)}M`);
  }
  const stressMonths = rows.filter(r => r.stressMode !== "HEALTHY").length;
  const emergMonths = rows.filter(r => r.stressMode === "EMERGENCY").length;
  console.log(`stress months: ${stressMonths}/36 (EMERGENCY: ${emergMonths})`);
}
