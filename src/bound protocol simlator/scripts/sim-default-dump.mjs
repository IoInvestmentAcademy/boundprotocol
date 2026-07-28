// Dump the simulator's DEFAULT-case monthly series to scripts/sim-default.json.
//
// Two documents are built from this feed — the Operating Cost Analysis (which
// rebases revenue-scaling cost lines onto it) and the Business Plan (which is
// built entirely from it). Regenerate with `node scripts/sim-default-dump.mjs`
// whenever the engine or the default preset changes, then rebuild both.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(
  src.indexOf("const PRESETS"),
  src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */")
);
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

// Same default market and layer configuration the app boots with.
const DEFAULT_MARKET = [{
  active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9,
  aum: 410_000_000, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5,
  mintRate: 0.4, mintHaircut: 0.3, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000,
}];
const layerCfg = {
  minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5,
  rwaConcentrationHard: 10, rwaHaircutTriggered: 15,
};

const n = (x) => (typeof x === "number" && isFinite(x) ? x : 0);
const rows = simulate(PRESETS.default, DEFAULT_MARKET, layerCfg);

// The ten revenue streams, split by destination. The bci_* set sums exactly to
// totalBci; the pr_* set sums to totalPr before the Emergency Reserve top-up,
// which is why totalPr (net) is carried separately.
const BCI = ["bci_pool", "bci_entry", "bci_conv", "bci_maint", "bci_rwa", "bci_morpho", "bci_float"];
const PR = ["pr_pool", "pr_entry", "pr_integ", "pr_maint", "pr_rwa", "pr_morpho", "pr_float"];

const months = rows.map((r) => {
  const o = {
    m: r.m,

    // --- index and supply ---
    bciPrice: n(r.bciPrice),          // BLI price
    annG: n(r.annG),                  // Annualized Index Growth, %
    bciSupply: n(r.bciSupply),
    bciNav: n(r.bciNav),
    layerNav: n(r.layerNav),

    // --- balances ---
    layer: n(r.layer),                // Liquidity Layer
    boundCoreBal: n(r.boundCoreBal),  // Bound Core
    er: n(r.er),                      // Emergency Reserve
    bciSC: n(r.bciSC),                // BCI surplus capital
    rwaCollateralBal: n(r.rwaCollateralBal),
    privateLayerBal: n(r.privateLayerBal),
    retailLayerBal: n(r.retailLayerBal),
    lcr: n(r.lcr),

    // --- capital flows ---
    lpIn: n(r.lpIn),
    privateToLayer: n(r.privateToLayer),
    retailToLayer: n(r.retailToLayer),
    privateLayerOut: n(r.privateLayerOut),
    retailLayerOut: n(r.retailLayerOut),

    // --- volumes ---
    rwaLiq: n(r.rwaLiq),
    rwaMint: n(r.rwaMint),
    pVol: n(r.pVol),
    retailPoolVol: n(r.retailPoolVol),
    rwaPoolSellVol: n(r.rwaPoolSellVol),
    rwaPoolBuyVol: n(r.rwaPoolBuyVol),
    retailExitSellVol: n(r.retailExitSellVol),

    // --- revenue ---
    totalBci: n(r.totalBci),
    totalPr: n(r.totalPr),
    totalPrRaw: n(r.totalPrRaw),
    erTopUp: n(r.erTopUp),
  };
  for (const k of BCI) o[k] = n(r[k]);
  for (const k of PR) o[k] = n(r[k]);

  // Derived, so every consumer computes them identically.
  o.tvl = o.layer + o.boundCoreBal;
  o.volume = o.rwaLiq + o.rwaMint + o.pVol + o.retailPoolVol +
             o.rwaPoolSellVol + o.rwaPoolBuyVol + o.retailExitSellVol;
  o.revenue = o.totalBci + o.totalPr;
  return o;
});

writeFileSync(
  path.join(root, "scripts/sim-default.json"),
  JSON.stringify({
    preset: PRESETS.default.name,
    market: DEFAULT_MARKET[0].name,
    horizonMonths: months.length,
    generated: new Date().toISOString().slice(0, 10),
    streams: { bci: BCI, pr: PR },
    months,
  }, null, 2) + "\n"
);

console.log(`wrote scripts/sim-default.json — ${months.length} months, preset "${PRESETS.default.name}"`);
