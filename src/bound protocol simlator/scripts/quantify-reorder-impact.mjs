// Quantifies the profitability impact of the STEP 0 reorder (RWA capacity sizing off
// THIS month's real layer `layerPostUpdate` vs. the OLD behavior of sizing off last
// month's closing layer, i.e. the pre-flow `privateLayerBal + retailLayerBal` at the
// point the RWA block used to run).
//
// Method: build the CURRENT (fixed) engine as-is, then build an OLD-behavior variant by
// substituting `layerPostUpdate` with `(privateLayerBal + retailLayerBal)` ONLY in the
// 4 lines that size RWA capacity/concentration (categoryConcPct, mkConcPct,
// estimatedUSDCPct, layerUSDCAvailable). All other uses of layerPostUpdate (the Step 5+
// waterfall: LCR, yield bucket split, rwaHeldPct display, per-market concPct display)
// are left untouched in both variants — those were not part of the reorder and must size
// off the true current-month layer regardless, for both variants, to isolate exactly the
// change the reorder made.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));

// --- Build CURRENT (fixed / reordered) engine, verbatim ---
const { PRESETS, simulate: simulateNew } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

// --- Build OLD-behavior engine: patch the 4 capacity-sizing lines only ---
const LINES_TO_PATCH = [
  {
    from: "    const categoryConcPct     = layerPostUpdate > 0 ? rwaCollateralBal / layerPostUpdate * 100 : 0;",
    to:   "    const layerCapacityBasisOLD = privateLayerBal + retailLayerBal;\n    const categoryConcPct     = layerCapacityBasisOLD > 0 ? rwaCollateralBal / layerCapacityBasisOLD * 100 : 0;",
  },
  {
    from: "      const mkConcPct = layerPostUpdate > 0 ? mkHeld[i] / layerPostUpdate * 100 : 0;",
    to:   "      const mkConcPct = layerCapacityBasisOLD > 0 ? mkHeld[i] / layerCapacityBasisOLD * 100 : 0;",
  },
  {
    from: "    const estimatedUSDCPct   = Math.max(minBufferPct, 100 - (rwaInLayerNow / Math.max(layerPostUpdate, 1) * 100));",
    to:   "    const estimatedUSDCPct   = Math.max(minBufferPct, 100 - (rwaInLayerNow / Math.max(layerCapacityBasisOLD, 1) * 100));",
  },
  {
    from: "    const layerUSDCAvailable = layerPostUpdate * Math.min(estimatedUSDCPct, 80) / 100;",
    to:   "    const layerUSDCAvailable = layerCapacityBasisOLD * Math.min(estimatedUSDCPct, 80) / 100;",
  },
];

let oldChunk = chunk;
for (const { from, to } of LINES_TO_PATCH) {
  const count = oldChunk.split(from).length - 1;
  if (count !== 1) {
    console.error(`FATAL: expected exactly 1 occurrence of patch target, found ${count}:\n${from}`);
    process.exit(1);
  }
  oldChunk = oldChunk.replace(from, to);
}
const { simulate: simulateOld } = new Function(`${oldChunk}\nreturn { PRESETS, simulate };`)();

// --- 10-market default lineup (mirrors rwaMarkets initial state in BoundSimulator.jsx) ---
const MARKETS = [
  { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9, aum: 410_000_000, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "BUIDL", launchMonth: 4, mintStartMonth: 12, aum: 550_000_000, aumGrowth: 2.5, liqRate: 0.7, liqHaircut: 0.4, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "PC/Figure", launchMonth: 7, mintStartMonth: 15, aum: 180_000_000, aumGrowth: 3, liqRate: 1.2, liqHaircut: 0.8, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 45, rwaTradeF: 0.4, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "BENJI", launchMonth: 10, mintStartMonth: 18, aum: 320_000_000, aumGrowth: 2, liqRate: 1.0, liqHaircut: 0.3, mintRate: 0.4, mintHaircut: 0.25, issuerRedemptionDays: 15, rwaTradeF: 0.25, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "Homebase", launchMonth: 13, mintStartMonth: 21, aum: 95_000_000, aumGrowth: 2, liqRate: 0.5, liqHaircut: 1.0, mintRate: 0.3, mintHaircut: 0.6, issuerRedemptionDays: 90, rwaTradeF: 0.4, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "Apollo PC", launchMonth: 16, mintStartMonth: 24, aum: 250_000_000, aumGrowth: 3, liqRate: 1.1, liqHaircut: 0.75, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 60, rwaTradeF: 0.4, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "WisdomTree", launchMonth: 19, mintStartMonth: 27, aum: 150_000_000, aumGrowth: 2, liqRate: 0.6, liqHaircut: 0.45, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 25, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "Paxos Gold", launchMonth: 22, mintStartMonth: 30, aum: 120_000_000, aumGrowth: 2.5, liqRate: 0.6, liqHaircut: 0.35, mintRate: 0.4, mintHaircut: 0.25, issuerRedemptionDays: 20, rwaTradeF: 0.25, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "Centrifuge", launchMonth: 25, mintStartMonth: 33, aum: 75_000_000, aumGrowth: 3, liqRate: 0.9, liqHaircut: 0.6, mintRate: 0.45, mintHaircut: 0.4, issuerRedemptionDays: 30, rwaTradeF: 0.35, integFee: 150_000, maintFee: 75_000 },
  { active: true, name: "Republic Muni", launchMonth: 28, mintStartMonth: 36, aum: 60_000_000, aumGrowth: 2, liqRate: 0.5, liqHaircut: 0.4, mintRate: 0.35, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 },
];

const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };

function run(fn) { return fn(PRESETS.default, MARKETS, CFG); }
const rowsNew = run(simulateNew);
const rowsOld = run(simulateOld);

function pct(a, b) { return b !== 0 ? ((a - b) / b * 100) : 0; }

console.log("\n=== STEP 0 reorder — profitability impact (10-market default, Default preset) ===\n");
console.log("Milestone".padEnd(10), "annG(old)".padEnd(11), "annG(new)".padEnd(11), "Δpp".padEnd(9), "price(old)".padEnd(11), "price(new)".padEnd(11));
for (const mo of [12, 24, 36]) {
  const o = rowsOld[mo - 1], n = rowsNew[mo - 1];
  console.log(
    `M${mo}`.padEnd(10),
    o.annG.toFixed(3).padEnd(11), n.annG.toFixed(3).padEnd(11),
    (n.annG - o.annG).toFixed(3).padEnd(9),
    o.bciPrice.toFixed(4).padEnd(11), n.bciPrice.toFixed(4).padEnd(11),
  );
}

console.log("\n=== Cumulative revenue impact (M1-M36 sum) ===\n");
const sumBci = rows => rows.reduce((s, r) => s + r.totalBci, 0);
const sumPr  = rows => rows.reduce((s, r) => s + r.totalPr, 0);
const sumHaircut = rows => rows.reduce((s, r) => s + (r.haircutRevenue||0), 0);
const sumTrade    = rows => rows.reduce((s, r) => s + (r.rwaTradeRevenue||0), 0);
const bciOld = sumBci(rowsOld), bciNew = sumBci(rowsNew);
const prOld  = sumPr(rowsOld),  prNew  = sumPr(rowsNew);
const hcOld  = sumHaircut(rowsOld), hcNew = sumHaircut(rowsNew);
const trOld  = sumTrade(rowsOld),   trNew = sumTrade(rowsNew);
console.log(`BCI SC cumulative revenue:      old $${bciOld.toFixed(0)}  new $${bciNew.toFixed(0)}  Δ $${(bciNew-bciOld).toFixed(0)} (${pct(bciNew,bciOld).toFixed(2)}%)`);
console.log(`Protocol Reserve cumulative:     old $${prOld.toFixed(0)}  new $${prNew.toFixed(0)}  Δ $${(prNew-prOld).toFixed(0)} (${pct(prNew,prOld).toFixed(2)}%)`);
console.log(`RWA haircut revenue (36mo sum):  old $${hcOld.toFixed(0)}  new $${hcNew.toFixed(0)}  Δ $${(hcNew-hcOld).toFixed(0)} (${pct(hcNew,hcOld).toFixed(2)}%)`);
console.log(`RWA trade fee revenue (36mo sum):old $${trOld.toFixed(0)}  new $${trNew.toFixed(0)}  Δ $${(trNew-trOld).toFixed(0)} (${pct(trNew,trOld).toFixed(2)}%)`);

console.log("\n=== Capacity utilization: months layerConstrained (demand > available USDC) ===\n");
const constrainedOld = rowsOld.filter(r => r.layerConstrained).length;
const constrainedNew = rowsNew.filter(r => r.layerConstrained).length;
console.log(`old: ${constrainedOld}/36 months constrained`);
console.log(`new: ${constrainedNew}/36 months constrained`);

console.log("\n=== layerUSDCAvailable at key months (old vs new) ===\n");
for (const mo of [1, 4, 7, 12, 24, 36]) {
  const o = rowsOld[mo-1], n = rowsNew[mo-1];
  console.log(`M${mo}`.padEnd(6), `old $${o.layerUSDCAvailable.toFixed(0)}`.padEnd(20), `new $${n.layerUSDCAvailable.toFixed(0)}`.padEnd(20), `Δ $${(n.layerUSDCAvailable-o.layerUSDCAvailable).toFixed(0)}`);
}

console.log("\nNote: 'old' = RWA capacity/concentration sized off (privateLayerBal + retailLayerBal),");
console.log("i.e. the prior month's closing Layer balance BEFORE this month's LP flows — exactly");
console.log("what the code computed pre-reorder at the point the RWA block used to run. All other");
console.log("engine behavior (waterfall, LCR, yield split, display-only concentration fields) is");
console.log("IDENTICAL between old/new — only the 4 capacity-sizing lines differ, isolating the");
console.log("reorder's effect precisely.\n");
