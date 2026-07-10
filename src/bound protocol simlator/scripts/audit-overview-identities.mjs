// Overview-tab audit probe — independently re-derives every identity the
// Overview tab (KPI cards, price chart, BCI Price & Backing table) displays,
// across all 36 months, from raw engine exports. Uses the 3-market config the
// invariant harness uses (non-trivial RWA activity) AND the empty-market default.
import { readFileSync } from "node:fs";
import path from "node:path";
const root = "/Users/georgianionita/Desktop/bound-simulator-v8-latest";
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const fn = new Function(`${chunk}\nreturn { PRESETS, simulate };`);
const { PRESETS, simulate } = fn();

const MK = (name, launch, mint) => ({ active:true, name, launchMonth:launch, mintStartMonth:mint,
  aum:410_000_000, aumGrowth:2, liqRate:0.8, liqHaircut:0.5, mintRate:0.4, mintHaircut:0.3,
  rwaTradeF:0.3, integFee:150_000, maintFee:75_000 });
const CFGS = [
  ["no markets", [], {}],
  ["3 markets", [MK("A",1,9), MK("B",4,12), MK("C",7,15)], { minBufferPct:5, aaveYield:3.5, morphoYield:4.5, enhancedYield:7.5 }],
];

let fails = 0;
const close = (a,b,tol=0.01) => Math.abs(a-b) <= Math.max(tol, Math.abs(b)*1e-9);
const chk = (cond, msg) => { if (!cond) { fails++; console.log("  FAIL " + msg); } };

for (const [label, mks, cfg] of CFGS) {
  console.log(`\n=== ${label} ===`);
  const rows = simulate(PRESETS.default, mks, cfg);
  let prevSC = 0, prevNav = 0, prevSupply = null, prevPrice = 1.0;
  rows.forEach(r => {
    const t = `M${r.m}`;
    // T1 — BCI SC ledger roll-forward: scEnd = scStart + totalBci (table sections 2)
    chk(close(r.bciSC, Math.max(0, prevSC + r.totalBci)), `${t} scEnd != scStart + totalBci (${r.bciSC} vs ${prevSC + r.totalBci})`);
    // T2 — Layer NAV roll-forward: NAV = prev + privIn + retailIn - out (table section 1)
    const navCalc = Math.max(0, prevNav + r.privateToLayer + r.retailToLayer - (r.privateLayerOut + r.retailLayerOut));
    chk(close(r.layerNav, navCalc), `${t} layerNav roll-forward (${r.layerNav} vs ${navCalc})`);
    // T3 — Total backing identity (table section 3 row 1)
    chk(close(r.bciNav, r.layerNav + r.bciSC), `${t} bciNav != layerNav + bciSC`);
    // T4 — price x supply = total backing (the division shown in the table)
    chk(close(r.bciPrice * r.bciSupply, r.bciNav, 0.05), `${t} price x supply != backing`);
    // T5 — supply roll-forward at START-of-month price
    if (prevSupply !== null) {
      const mint = (r.privateToLayer + r.retailToLayer) / prevPrice;
      const burn = Math.min((r.privateLayerOut + r.retailLayerOut) / prevPrice, prevSupply);
      chk(close(r.bciSupply, Math.max(1e-9, prevSupply + mint - burn), 0.5), `${t} supply roll-forward`);
    }
    // T6 — annG formula recompute (clamped 0..999)
    const g = Math.min(Math.max((Math.pow(Math.max(r.bciPrice,1e-9), 12/r.m) - 1)*100, 0), 999);
    chk(close(r.annG, g, 1e-6), `${t} annG formula (${r.annG} vs ${g})`);
    prevSC = r.bciSC; prevNav = r.layerNav; prevSupply = r.bciSupply; prevPrice = Math.max(r.bciPrice, 1e-9);
  });

  // T7 — Annual-summary aggregation (the "All" view of the table): flows sum, stocks end
  for (let y = 1; y <= 3; y++) {
    const months = rows.slice((y-1)*12, y*12);
    const end = months[11], prev = rows[(y-1)*12 - 1];
    const scStart = prev ? prev.bciSC : 0;
    const revSum = months.reduce((s,r)=>s+r.totalBci,0);
    chk(close(end.bciSC, scStart + revSum), `Y${y} annual: scEnd != scStart + Σrevenue`);
    const navStart = prev ? prev.layerNav : 0;
    const inSum = months.reduce((s,r)=>s+r.privateToLayer+r.retailToLayer,0);
    const outSum = months.reduce((s,r)=>s+r.privateLayerOut+r.retailLayerOut,0);
    chk(close(end.layerNav, navStart + inSum - outSum), `Y${y} annual: NAV != start + Σin - Σout`);
  }
  // T8 — KPI wiring: resultsMonth logic (view 0->M36, N->M(12N)) uses same rows
  [ [0,36],[1,12],[2,24],[3,36] ].forEach(([v,m]) => {
    const rr = rows[(v===0?36:v*12)-1];
    chk(rr && rr.m === m, `Range view ${v} maps to M${m}`);
  });
}
console.log(fails === 0 ? "\n=== ALL OVERVIEW IDENTITIES VERIFIED (T1-T8, both configs, 36 months) ===" : `\n=== ${fails} FAILURES ===`);
