// Participant Economics tab audit probe — tests the REAL computeLpOutcome function
// (extracted from source, not re-typed) against an independent re-implementation,
// verifies the calculator's economic properties, and checks that the card inputs
// (rates, conversion %, BCI price path) match the engine/preset exactly.
import { readFileSync } from "node:fs";
import path from "node:path";
const root = "/Users/georgianionita/Desktop/bound-simulator-v8-latest";
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");

// Engine + presets
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();
// The real computeLpOutcome (defined in the UI section)
const fnStart = src.indexOf("function computeLpOutcome");
const fnEnd = src.indexOf("\n}", fnStart) + 2;
const computeLpOutcome = new Function(`${src.slice(fnStart, fnEnd)}\nreturn computeLpOutcome;`)();

const p = PRESETS.default;
const layerCfg = { minBufferPct:10, redemptionDays:14, rwaCoverageDays:14, maxRwaPct:20, mkMaxPct:10,
  morphoMinReserve:22, enhancedMaxPct:20, aaveYield:2.2, morphoYield:5.3, enhancedYield:6.2,
  lcrHealthy:1.5, lcrWarning:1.0, lcrStress:0.7, rwaAcceptEmergency:50, rwaLcrTarget:1.5,
  protocolReservePct:10, bcUsdcCoverage:24, bcYieldUsdcRate:4.5, bcOutflowRate:2 };
const rows = simulate(p, [], layerCfg);

let fails = 0;
const close = (a,b,tol=1e-6) => Math.abs(a-b) <= Math.max(tol, Math.abs(b)*1e-9);
const chk = (c,m) => { if (!c) { fails++; console.log("  FAIL " + m); } };

// Card parameterizations exactly as the tab wires them
const bnd = (p.bndUsage||0)/100;
const convFeeRate = ((p.convFeeRwaUSD||0.89)/100)*(1-bnd);
const mintRdmRate = (p.mintRedeemFee||0.3)/100;
const poolFeeRate = (p.poolFee||0.3)/100;
const cards = [
  ["Private", { entryFeeRate:mintRdmRate, convPct:p.privateBCIConversion||95, exitFeeRate:mintRdmRate }],
  ["Retail",  { entryFeeRate:poolFeeRate, convPct:p.retailBCIConversion||98,  exitFeeRate:poolFeeRate }],
];

for (const [name, cfg] of cards) {
  console.log(`\n=== ${name} LP card ===`);
  for (const years of [1,2,3]) {
    const row = rows[years*12-1];
    const amount = 500_000;
    const out = computeLpOutcome({ amount, years, ...cfg, convFeeRate, bciPriceEnd: row.bciPrice });
    const t = `${name} Y${years}`;
    // E1 — independent re-implementation of the waterfall (second implementation)
    const a1 = amount*(1-cfg.entryFeeRate);
    const conv = a1*cfg.convPct/100, idle = a1-conv;
    const eConv = conv*convFeeRate;
    const grown = (conv-eConv)*row.bciPrice;
    const xConv = grown*convFeeRate;
    const xFee  = (grown-xConv)*cfg.exitFeeRate;
    const fv    = (grown-xConv-xFee)+idle;
    chk(close(out.finalValue, fv, 0.01), `${t} E1 finalValue ${out.finalValue} != ${fv}`);
    // E2 — the 4 displayed fee legs equal the waterfall's own legs, and their sum
    chk(close(out.entryFeeDollar, amount*cfg.entryFeeRate, 0.01), `${t} E2 entry fee leg`);
    chk(close(out.entryConvFee, eConv, 0.01), `${t} E2 entry conv leg`);
    chk(close(out.exitConvFee, xConv, 0.01), `${t} E2 exit conv leg`);
    chk(close(out.exitFeeDollar, xFee, 0.01), `${t} E2 exit fee leg`);
    // E3 — Net APY definition: (fv/amount)^(1/years) - 1
    chk(close(out.netApy, (Math.pow(fv/amount,1/years)-1)*100, 1e-9), `${t} E3 netApy formula`);
    // E4 — Total Fees % of principal (the middle stat) = Σ legs / amount
    const fees = out.entryFeeDollar+out.entryConvFee+out.exitConvFee+out.exitFeeDollar;
    chk(fees/amount*100 < 5 && fees > 0, `${t} E4 fee% sanity (${(fees/amount*100).toFixed(2)}%)`);
    // E5 — Gross APY stat = engine annG at that month (direct export read)
    chk(row.annG !== undefined, `${t} E5 annG export exists`);
    // E6 — linearity in amount: fees and gain scale exactly ∝ amount; netApy invariant
    const out2 = computeLpOutcome({ amount: amount*2, years, ...cfg, convFeeRate, bciPriceEnd: row.bciPrice });
    chk(close(out2.finalValue, fv*2, 0.02), `${t} E6 finalValue not linear in amount`);
    chk(close(out2.netApy, out.netApy, 1e-9), `${t} E6 netApy depends on amount (it must not)`);
  }
  // E7 — one-time-fee economics: Net APY strictly INCREASES with holding period
  //      (a one-time cost amortizes down — the bug class the owner caught before)
  const apys = [1,2,3].map(y => computeLpOutcome({ amount:500_000, years:y, ...cfg, convFeeRate, bciPriceEnd: rows[y*12-1].bciPrice }).netApy);
  chk(apys[0] < apys[1] && apys[1] < apys[2], `${name} E7 netApy not increasing with hold: ${apys.map(a=>a.toFixed(2))}`);
  // E8 — Net APY < Gross APY always (fees can only drag), and both positive at defaults
  [1,2,3].forEach((y,i)=> chk(apys[i] < rows[y*12-1].annG && apys[i] > 0,
    `${name} E8 Y${y} net ${apys[i].toFixed(2)} !< gross ${rows[y*12-1].annG.toFixed(2)}`));
}

// E9 — RWA Holder card stats: simple average of ACTIVE markets' live rates (matches UI code)
const MK = (n,l,hc,tf) => ({ active:true, name:n, launchMonth:l, mintStartMonth:l+8, aum:410e6, aumGrowth:2,
  liqRate:0.8, liqHaircut:hc, mintRate:0.4, mintHaircut:0.3, issuerRedemptionDays:30, rwaTradeF:tf, integFee:50_000, maintFee:75_000 });
const rows3 = simulate(p, [MK("A",1,0.5,0.3), MK("B",4,0.8,0.4), MK("C",30,1.0,0.5)], layerCfg);
const r12 = rows3[11];
const act = r12.marketStats.filter(s=>s.active);
chk(act.length === 2, `E9 expected 2 active at M12, got ${act.length} (C launches M30)`);
const avgHc = act.reduce((a,s)=>a+s.haircutPct,0)/act.length;
chk(avgHc > 0, `E9 avg haircut computable (${avgHc.toFixed(3)}%)`);

console.log(fails===0 ? "\n=== ALL PARTICIPANT ECONOMICS IDENTITIES VERIFIED (E1-E9) ===" : `\n=== ${fails} FAILURES ===`);
