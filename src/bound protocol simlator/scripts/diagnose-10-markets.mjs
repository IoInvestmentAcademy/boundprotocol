// Diagnose the new 10-market default onboarding pipeline (M1-M28 launches).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

const MARKETS = [
  { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9, aum: 410e6, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3 },
  { active: true, name: "BUIDL", launchMonth: 4, mintStartMonth: 12, aum: 550e6, aumGrowth: 2.5, liqRate: 0.7, liqHaircut: 0.4, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3 },
  { active: true, name: "PrivCredit-Figure", launchMonth: 7, mintStartMonth: 15, aum: 180e6, aumGrowth: 3, liqRate: 1.2, liqHaircut: 0.8, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 45, rwaTradeF: 0.4 },
  { active: true, name: "BENJI", launchMonth: 10, mintStartMonth: 18, aum: 320e6, aumGrowth: 2, liqRate: 1.0, liqHaircut: 0.3, mintRate: 0.4, mintHaircut: 0.25, issuerRedemptionDays: 15, rwaTradeF: 0.25 },
  { active: true, name: "Homebase-RE", launchMonth: 13, mintStartMonth: 21, aum: 95e6, aumGrowth: 2, liqRate: 0.5, liqHaircut: 1.0, mintRate: 0.3, mintHaircut: 0.6, issuerRedemptionDays: 90, rwaTradeF: 0.4 },
  { active: true, name: "PrivCredit-Apollo", launchMonth: 16, mintStartMonth: 24, aum: 250e6, aumGrowth: 3, liqRate: 1.1, liqHaircut: 0.75, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 60, rwaTradeF: 0.4 },
  { active: true, name: "WisdomTree-ST", launchMonth: 19, mintStartMonth: 27, aum: 150e6, aumGrowth: 2, liqRate: 0.6, liqHaircut: 0.45, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 25, rwaTradeF: 0.3 },
  { active: true, name: "Paxos-Gold", launchMonth: 22, mintStartMonth: 30, aum: 120e6, aumGrowth: 2.5, liqRate: 0.6, liqHaircut: 0.35, mintRate: 0.4, mintHaircut: 0.25, issuerRedemptionDays: 20, rwaTradeF: 0.25 },
  { active: true, name: "Centrifuge-TF", launchMonth: 25, mintStartMonth: 33, aum: 75e6, aumGrowth: 3, liqRate: 0.9, liqHaircut: 0.6, mintRate: 0.45, mintHaircut: 0.4, issuerRedemptionDays: 30, rwaTradeF: 0.35 },
  { active: true, name: "Republic-Muni", launchMonth: 28, mintStartMonth: 36, aum: 60e6, aumGrowth: 2, liqRate: 0.5, liqHaircut: 0.4, mintRate: 0.35, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3 },
].map(m => ({ integFee: 150_000, maintFee: 75_000, ...m }));

const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };
const rows = simulate(PRESETS.default, MARKETS, CFG);

console.log("Month | markets | annG   | LCR   | mode      | rwaColl% | queue    | pipeline  | totalLiqDemand | rwaLiq served");
[1,4,7,10,13,16,19,22,25,28,30,32,34,36].forEach(m => {
  const r = rows[m-1];
  console.log(
    `M${String(m).padEnd(4)}`,
    `${String(r.markets).padEnd(7)}`,
    `${r.annG.toFixed(1)}%`.padEnd(7),
    r.lcr.toFixed(2).padEnd(6),
    r.stressMode.padEnd(10),
    `held ${r.rwaHeldPct.toFixed(1)}%`.padEnd(11),
    `$${(r.bciQueueBal/1e3).toFixed(0)}K`.padEnd(9),
    `$${(r.rwaPipelineBal/1e6).toFixed(2)}M`.padEnd(10),
    `$${(r.totalLiqDemand/1e6).toFixed(1)}M`.padEnd(15),
    `$${(r.rwaLiq/1e6).toFixed(1)}M (${(r.rwaLiq/Math.max(r.totalLiqDemand,1)*100).toFixed(0)}%)`,
  );
});

const stressMonths = rows.filter(r => r.stressMode !== "HEALTHY").length;
const emergMonths = rows.filter(r => r.stressMode === "EMERGENCY").length;
console.log(`\nStress months: ${stressMonths}/36 (EMERGENCY: ${emergMonths})`);
console.log(`M12 annG: ${rows[11].annG.toFixed(2)}%  M36 annG: ${rows[35].annG.toFixed(2)}%  prCum M36: $${(rows[35].prCum/1e6).toFixed(2)}M`);
console.log(`Max queue: $${(Math.max(...rows.map(r=>r.bciQueueBal))/1e6).toFixed(2)}M  Max pipeline: $${(Math.max(...rows.map(r=>r.rwaPipelineBal))/1e6).toFixed(2)}M`);
