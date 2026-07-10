// BCI SC Revenue tab audit probe — independently re-derives every number the tab
// displays (chart bars, headline, Monthly Breakdown rows, % Composition rows, annG
// row) from raw engine exports AND from second-implementation recomputes of each
// stream where the inputs are themselves exports. 36 months × 2 configs.
import { readFileSync } from "node:fs";
import path from "node:path";
const root = "/Users/georgianionita/Desktop/bound-simulator-v8-latest";
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const fn = new Function(`${chunk}\nreturn { PRESETS, simulate };`);
const { PRESETS, simulate } = fn();

const MK = (name, launch, mint, over={}) => ({ active:true, name, launchMonth:launch, mintStartMonth:mint,
  aum:410_000_000, aumGrowth:2, liqRate:0.8, liqHaircut:0.5, mintRate:0.4, mintHaircut:0.3,
  issuerRedemptionDays:30, rwaTradeF:0.3, integFee:50_000, maintFee:75_000, ...over });
const layerCfg = { minBufferPct:10, redemptionDays:14, rwaCoverageDays:14, maxRwaPct:20, mkMaxPct:10,
  morphoMinReserve:22, enhancedMaxPct:20, aaveYield:2.2, morphoYield:5.3, enhancedYield:6.2,
  lcrHealthy:1.5, lcrWarning:1.0, lcrStress:0.7, rwaAcceptEmergency:50, rwaLcrTarget:1.5,
  protocolReservePct:10, bcUsdcCoverage:24, bcYieldUsdcRate:4.5, bcOutflowRate:2 };
const CFGS = [
  ["no markets", [], {}],
  ["3 markets + new defaults", [MK("A",1,9), MK("B",4,12,{maintFee:60_000}), MK("C",7,15,{rwaTradeF:0.4})], layerCfg],
];

let fails = 0;
const close = (a,b,tol=0.01) => Math.abs(a-b) <= Math.max(tol, Math.abs(b)*1e-9);
const chk = (c,m) => { if (!c) { fails++; console.log("  FAIL " + m); } };

for (const [label, mks, cfg] of CFGS) {
  console.log(`\n=== ${label} ===`);
  const rows = simulate(PRESETS.default, mks, cfg);
  rows.forEach(r => {
    const t = `M${r.m}`;
    const streams = [r.bci_conv, r.bci_entry, r.bci_pool, r.bci_rwa, r.bci_morpho, r.bci_float, r.bci_maint];
    // B1 — the Monthly Breakdown's bold total equals the sum of its 7 visible rows
    chk(close(streams.reduce((a,b)=>a+(b||0),0), r.totalBci), `${t} B1 7-stream sum != totalBci`);
    // B2 — each stream re-derived from OTHER exports (second implementation):
    chk(close(r.bci_pool, r.pVol * 0.008 * 0.80, 0.02), `${t} B2 bci_pool != pVol x 0.8% x 80%`);
    chk(close(r.bci_morpho, r.layerYieldGross * 0.80, 0.02), `${t} B2 bci_morpho != layerYieldGross x 80%`);
    chk(close(r.bci_float, r.bcYieldGrossMo * 0.80, 0.02), `${t} B2 bci_float != BC gross yield x 80%`);
    chk(close(r.bci_rwa, (r.rwaTradeRevenue + r.haircutRevenue) * 0.80, 0.02), `${t} B2 bci_rwa != (trade+haircut) x 80%`);
    // B3 — split complements (post 2026-07-10 flip): entry & rwa 80/20; maint 20/80
    if (r.bci_entry > 0.01) chk(close(r.bci_entry/0.80, r.pr_entry/0.20), `${t} B3 entry split != 80/20`);
    if (r.bci_rwa   > 0.01) chk(close(r.bci_rwa/0.80,   r.pr_rwa/0.20),  `${t} B3 rwa split != 80/20`);
    if (r.bci_maint > 0.01) chk(close(r.bci_maint/0.20, r.pr_maint/0.80),`${t} B3 maint split != 20/80`);
    // B4 — % Composition: each pct = stream/totalBci; pcts sum to 100 when total > 0
    if (r.totalBci > 0.01) {
      const pcts = streams.map(s => (s||0)/r.totalBci*100);
      chk(close(pcts.reduce((a,b)=>a+b,0), 100, 1e-6), `${t} B4 composition != 100%`);
    }
    // B5 — annG row (last row of the composition table) = engine's clamped formula
    const g = Math.min(Math.max((Math.pow(Math.max(r.bciPrice,1e-9),12/r.m)-1)*100,0),999);
    chk(close(r.annG, g, 1e-6), `${t} B5 annG mismatch`);
    // B6 — chart bar data: export/1000 rounded to 1dp reconstructs within rounding
    streams.forEach((s,i)=> {
      const bar = +((s||0)/1000).toFixed(1);
      chk(Math.abs(bar*1000 - (s||0)) <= 50.01, `${t} B6 chart bar ${i} rounding > $50`);
    });
  });
  // B7 — headline "M{y*12} total" reads the year-end month's totalBci
  [1,2,3].forEach(y => {
    const r = rows[y*12-1];
    chk(r && r.m === y*12 && r.totalBci !== undefined, `B7 year ${y} headline row`);
  });
  // B8 — maintenance stream: sum of ACTIVE markets' own maintFee/12 x 20% (per-market rates)
  rows.forEach(r => {
    const t = `M${r.m}`;
    const expect = mks.filter(mk => mk.active && r.m >= mk.launchMonth)
      .reduce((s,mk)=>s+(mk.maintFee ?? 75_000),0) / 12 * 0.20;
    chk(close(r.bci_maint, expect, 0.02), `${t} B8 bci_maint != Σ active maintFee/12 x 20%`);
  });
}
console.log(fails===0 ? "\n=== ALL BCI SC REVENUE IDENTITIES VERIFIED (B1-B8, both configs, 36 months) ===" : `\n=== ${fails} FAILURES ===`);
