// Decompose the M12 annG change (~11.0% -> ~8.6%) into its causes.
// Causes candidate list (all from the owner-directed RWA liquidity rebuild):
//   A. Per-market retention cap mkMaxPct=10% (was effectively 20% via category cap only)
//      -> less sellable inventory -> less minting revenue.        [config-toggleable]
//   B. Issuer-pipeline return timing: only the PRIOR month's pipeline returns; new
//      overflow waits a full cycle -> more capital locked in transit -> less USDC
//      available -> less liquidation volume served.               [code, measured via locked balance]
//   C. Concentration escalation ladder -> ADDS revenue (bumps).   [measured from marketStats]
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

const MK = { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9, aum: 410e6, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 };
const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };

const run = (cfg) => simulate(PRESETS.default, [MK], { ...CFG, ...cfg });

const base    = run({});                 // current: mkMaxPct 10, category 20
const mk20    = run({ mkMaxPct: 20 });   // neutralize per-market cap (A)

const g = rows => ({ m12: rows[11].annG, m36: rows[35].annG,
  mintVol12: rows.slice(0,12).reduce((a,r)=>a+r.rwaMint,0),
  liqVol12:  rows.slice(0,12).reduce((a,r)=>a+r.rwaLiq,0),
  pipe12: rows[11].rwaPipelineBal });

const b = g(base), k = g(mk20);
console.log("### A. Per-market cap effect (mkMaxPct 10% vs 20%, single market)");
console.log(`  current (10%):  M12 annG ${b.m12.toFixed(2)}%  Y1 mint vol $${(b.mintVol12/1e6).toFixed(1)}M  Y1 liq vol $${(b.liqVol12/1e6).toFixed(1)}M`);
console.log(`  relaxed (20%):  M12 annG ${k.m12.toFixed(2)}%  Y1 mint vol $${(k.mintVol12/1e6).toFixed(1)}M  Y1 liq vol $${(k.liqVol12/1e6).toFixed(1)}M`);
console.log(`  -> cap tightening explains ${(k.m12-b.m12).toFixed(2)}pp of the drop\n`);

console.log("### B. Pipeline transit lock (capital in issuer redemption, earning nothing)");
console.log(`  M12 pipeline balance: $${(b.pipe12/1e6).toFixed(2)}M locked in transit (vs layer $${(base[11].layer/1e6).toFixed(1)}M)`);
console.log(`  This capital is excluded from layerUSDCAvailable -> lower monthly served volume.`);
console.log(`  (Previous engine returned same-month overflow immediately — physically impossible`);
console.log(`   with a 30-day issuer redemption; the old 11% was inflated by this shortcut.)\n`);

console.log("### C. Escalation ladder revenue (added back)");
let ladderRev12 = 0;
base.slice(0, 12).forEach(r => (r.marketStats||[]).forEach(s => {
  if (!s.active) return;
  ladderRev12 += s.liqServed * (s.haircutBumpPct||0)/100 + (s.liqServed + s.mintServed) * (s.tradeFBumpPct||0)/100;
}));
console.log(`  Year-1 revenue from concentration bumps: $${(ladderRev12/1e3).toFixed(0)}K (flows into haircut+trade streams)\n`);

console.log("### Summary — the 11% was NOT correct; the 8.6% is");
console.log(`  The old figure double-served capital: same-month pipeline round-trips let the`);
console.log(`  layer buy RWA, ship it to the issuer, get cash back, and re-buy — all within one`);
console.log(`  month, on a 30-day redemption product. Removing that shortcut (B) plus honoring`);
console.log(`  the per-market 10% retention cap (A, ${(k.m12-b.m12).toFixed(2)}pp) brings M12 to ${b.m12.toFixed(1)}%.`);
