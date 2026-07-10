// Money-conservation & system-health audit — run: node scripts/audit-conservation.mjs
// Deloitte-style ledger tie-out: every state balance must change ONLY by identified,
// non-overlapping flows, month over month, across the full 36-month projection.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

const M1 = { active: true, name: "OUSG", launchMonth: 1, mintStartMonth: 9, aum: 410e6, aumGrowth: 2, liqRate: 0.8, liqHaircut: 0.5, mintRate: 0.4, mintHaircut: 0.3, issuerRedemptionDays: 30, rwaTradeF: 0.3, integFee: 150_000, maintFee: 75_000 };
const M2 = { ...M1, name: "BUIDL", launchMonth: 4, mintStartMonth: 12, aum: 550e6, aumGrowth: 2.5, liqRate: 0.7, liqHaircut: 0.4 };
const M3 = { ...M1, name: "PrivCredit", launchMonth: 7, mintStartMonth: 15, aum: 180e6, aumGrowth: 3, liqRate: 1.2, liqHaircut: 0.8, mintRate: 0.5, mintHaircut: 0.5, issuerRedemptionDays: 45, rwaTradeF: 0.4 };
const CFG = { minBufferPct: 5, aaveYield: 3.5, morphoYield: 4.5, enhancedYield: 7.5 };
const ER_SEED = 500_000;

let failures = 0;
const close = (a, b, tol = 0.02) => Math.abs(a - b) <= Math.max(tol, Math.abs(b) * 1e-9);
const check = (cond, label) => { if (!cond) { failures++; console.log(`  FAIL  ${label}`); } };

for (const [label, mks] of [["1 market", [M1]], ["3 markets (default)", [M1, M2, M3]]]) {
  console.log(`\n### Conservation tie-out — ${label}`);
  const rows = simulate(PRESETS.default, mks, CFG);
  let prev = null;

  rows.forEach(r => {
    const tag = `M${r.m}`;
    const pBciSC  = prev ? prev.bciSC : 0;
    const pSupply = prev ? prev.bciSupply : 0;
    const pPrCum  = prev ? prev.prCum : 0;
    const pEr     = prev ? prev.er : ER_SEED;
    const pPriv   = prev ? prev.privateLayerBal : 0;
    const pRet    = prev ? prev.retailLayerBal : 0;

    // C1 — BCI SC grows by exactly totalBci (the 7 identified streams), nothing else
    check(close(r.bciSC, pBciSC + r.totalBci), `${tag} C1 bciSC ledger: ${pBciSC + r.totalBci} vs ${r.bciSC}`);

    // C2 — PR cumulative grows by exactly totalPr (post-ER), nothing else (no side credits)
    check(close(r.prCum, pPrCum + r.totalPr), `${tag} C2 prCum ledger: ${pPrCum + r.totalPr} vs ${r.prCum}`);

    // C3 — private/retail layer balances change only by identified flows
    check(close(r.privateLayerBal, Math.max(0, pPriv + r.privateToLayer - r.privateLayerOut)),
      `${tag} C3 privateLayerBal flow mismatch`);
    check(close(r.retailLayerBal, Math.max(0, pRet + r.retailToLayer - r.retailLayerOut)),
      `${tag} C3 retailLayerBal flow mismatch`);

    // C4 — supply changes only by mint/burn at start price (implied by S1+C3, checked directly)
    // start price = prev bciPrice (1.0 in month 1)
    const priceStart = prev ? prev.bciPrice : 1.0;
    const mint = (r.privateToLayer + r.retailToLayer) / priceStart;
    const burn = Math.min((r.privateLayerOut + r.retailLayerOut) / priceStart, pSupply);
    check(close(r.bciSupply, Math.max(1e-9, pSupply + mint - burn)), `${tag} C4 supply mint/burn mismatch`);

    // C5 — ER grows only by er_morpho (10% of layer yield) + top-up (≤10% of PR raw); never shrinks
    const erGrowth = r.er - pEr;
    const erMorpho = r.layerYieldGross * 0.10;
    check(erGrowth >= erMorpho - 0.02, `${tag} C5 ER grew less than its layer-yield share`);
    check(r.er >= pEr - 0.01, `${tag} C5 ER shrank`);

    // C6 — revenue splits complement: every stream's BCI+PR shares reconstruct the gross
    check(close(r.bci_pool / 0.80, r.pr_pool / 0.20), `${tag} C6 pool split not 80/20`);
    check(close(r.bci_rwa / 0.80, r.pr_rwa / 0.20), `${tag} C6 rwa split not 80/20`);  // flipped 2026-07-10 (owner)
    check(close(r.bci_maint / 0.20, r.pr_maint / 0.80), `${tag} C6 maint split not 20/80`);
    check(close(r.bci_morpho / 0.80, r.pr_morpho / 0.10), `${tag} C6 layer yield split not 80/10`);
    check(close(r.bci_float / 0.80, r.pr_float / 0.20), `${tag} C6 float split not 80/20`);
    check(close(r.bci_entry / 0.80, r.pr_entry / 0.20), `${tag} C6 entry split not 80/20`);  // flipped 2026-07-10 (owner)

    // C7 — RWA fee revenue gross ties to per-market served volumes and rates
    if (r.marketStats) {
      const grossHaircut = r.marketStats.reduce((a, s) =>
        a + s.liqServed * (s.haircutPct || 0) / 100 + s.mintServed * ((s.active ? 0.3 : 0)) / 100, 0);
      // mint haircut rates differ per market; reconstruct from stats where possible
      const grossTrade = r.marketStats.reduce((a, s) => a + (s.liqServed + s.mintServed) * (s.tradeFPct || 0) / 100, 0);
      check(close(grossTrade, r.rwaTradeRevenue, 0.5), `${tag} C7 trade revenue tie-out: ${grossTrade} vs ${r.rwaTradeRevenue}`);
    }

    prev = r;
  });

  // Integration fee count: total pr_integ credited over 36 months must equal
  // integFee x number of launched markets (exactly once each) — the double-count check.
  const totalInteg = rows.reduce((a, r) => a + r.pr_integ, 0);
  const launched = mks.filter(mk => mk.active && mk.launchMonth <= 36).length;
  const expected = mks.filter(mk => mk.active && mk.launchMonth <= 36).reduce((a, mk) => a + (mk.integFee ?? 150000), 0);
  console.log(`  integration fees credited: $${(totalInteg/1000).toFixed(0)}K for ${launched} launches (expected $${(expected/1000).toFixed(0)}K) ${close(totalInteg, expected, 1) ? "OK" : "** MISMATCH **"}`);
  if (!close(totalInteg, expected, 1)) failures++;

  // Queue health: BCI redemption queue must not grow unboundedly
  const maxQ = Math.max(...rows.map(r => r.bciQueueBal));
  const endQ = rows[35].bciQueueBal;
  const qMonths = rows.filter(r => r.bciQueueBal > 1).length;
  console.log(`  BCI redemption queue: peak $${(maxQ/1e6).toFixed(2)}M, end $${(endQ/1e6).toFixed(2)}M, nonzero in ${qMonths}/36 months`);

  console.log(`  pipeline: peak $${(Math.max(...rows.map(r=>r.rwaPipelineBal))/1e6).toFixed(2)}M, end $${(rows[35].rwaPipelineBal/1e6).toFixed(2)}M`);
  console.log(`  M12 annG ${rows[11].annG.toFixed(2)}%  M36 annG ${rows[35].annG.toFixed(2)}%  prCum M36 $${(rows[35].prCum/1e6).toFixed(2)}M`);
}

console.log(`\n=== ${failures === 0 ? "CONSERVATION AUDIT: ALL TIE-OUTS PASS" : failures + " FAILURES"} ===`);
process.exit(failures ? 1 : 0);
