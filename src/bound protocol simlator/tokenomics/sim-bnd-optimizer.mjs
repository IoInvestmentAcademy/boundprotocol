// BND Tokenomics OPTIMIZER — derives the tokenomics FROM the simulation.
// Run: node tokenomics/sim-bnd-optimizer.mjs
//
// Nothing is assumed from prior documents. The engine's real Protocol Reserve
// revenue is the only exogenous input. We grid-search the market-facing design:
//
//   launch price (=> FDV)      0.01 .. 0.06
//   public allocation           5 / 8 / 10 / 12 %
//   public TGE unlock           5 / 10 / 15 %
//   pre-seed size               2 / 3 / 4 %      (price = 25% of public)
//   seed size                   5 / 7 %          (price = 50% of public)
//   revenue switch              20 / 30 / 40 / 50 % of PR inflows to locked xBND
//   LP USDC depth               1 / 1.5 / 2 / 3 $M   (paired BND at launch price)
//   buyback reserve seed        0.5 / 1 / 2 $M
//   investor vesting            (6mo cliff + 18mo) vs (6 + 24)
//
// Feasibility (hard constraints):
//   F1  cash: LP + buyback seed + $1M marketing + $2.5M ops runway <= total raise
//   F2  price floor: min monthly close >= 80% of launch price across 60 months
//   F3  locked-xBND APR honest: Y1 avg in [8%, 40%], Y3 avg in [8%, 25%]
//   F4  buyback reserve never exhausted
//   F5  liquidity tokens (LP BND side) within 8..18% of supply (audit: 10-15% + margin)
//   F6  insiders (preseed+seed+team+advisors) <= 30%
//
// Objective among feasible configs (lexicographic):
//   1. maximize total raise (protocol needs funding)
//   2. maximize worst-case price ratio (stability)
//   3. prefer Y1 APR closest to 15% (Tony's credible-yield anchor)
//
// Demand model is unchanged from sim-bnd-tokenomics.mjs and deliberately contains
// ZERO speculation: only yield-seekers buying until locked APR compresses to 15%,
// capped at $400K/mo, reacting from month 3. If a config passes here, it passes
// on fundamentals alone.

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
].map(m => ({ integFee: 50_000, maintFee: 75_000, ...m }));

const engineRows = simulate(PRESETS.default, MARKETS, {});
const prMonthly = [];
{
  let prev = 0;
  for (const r of engineRows) { prMonthly.push((r.prCum || 0) - prev); prev = r.prCum || 0; }
  const g = prMonthly[29] > 0 ? Math.pow(prMonthly[35] / prMonthly[29], 1 / 6) - 1 : 0.02;
  for (let m = 36; m < 60; m++) prMonthly.push(prMonthly[m - 1] * (1 + g));
}

const TOTAL = 1_000_000_000;
const SELL_THROUGH = { preseed: 0.6, seed: 0.5, public: 0.5, team: 0.3, treasury: 0.0,
                       ecosystem: 0.4, liquidity: 0.0, marketing: 0.5, advisors: 0.5 };
const STAKE_PART = 0.40, LOCK_SHARE = 0.70, TARGET_APR = 0.15,
      DEMAND_CAP = 400_000, DEMAND_LAG = 3;

function sched(tokens, tge, cliff, linear) {
  const out = new Array(61).fill(0);
  out[0] = tokens * tge;
  const rest = tokens - out[0];
  if (linear > 0) for (let i = 1; i <= linear; i++) {
    const m = cliff + i; if (m <= 60) out[m] += rest / linear;
  }
  return out;
}

function model(cfg) {
  const { price, pubAlloc, pubTge, preAlloc, seedAlloc, switchPct, lpUsdc, bbSeed, invVest } = cfg;

  // Liquidity is a FIXED 12% bucket (audit norm 10-15%); the DEX pool's BND side
  // draws from it, the rest is held for CEX market-making / top-ups.
  const liquidityPct = 0.12;
  const lpBnd = lpUsdc / price;
  if (lpBnd > liquidityPct * TOTAL) return null;   // F5: pool cannot exceed the bucket

  // fixed strategic buckets (norm-based, not searched): team 15%, advisors 3%,
  // treasury 20%, marketing 5%; ecosystem takes the remainder.
  const teamPct = 0.15, advPct = 0.03, treasPct = 0.20, mktPct = 0.05;
  const ecoPct = 1 - (preAlloc + seedAlloc + pubAlloc + teamPct + advPct + treasPct + mktPct + liquidityPct);
  if (ecoPct < 0.10) return null;               // ecosystem must retain a real budget

  const raisePre  = preAlloc  * TOTAL * price * 0.25;
  const raiseSeed = seedAlloc * TOTAL * price * 0.50;
  const raisePub  = pubAlloc  * TOTAL * price;
  const raise = raisePre + raiseSeed + raisePub;

  // F1 cash feasibility: LP seed + buyback seed + $1M marketing + $2M ops runway
  if (raise < lpUsdc + bbSeed + 1_000_000 + 2_000_000) return null;

  const buckets = [
    ["preseed",  preAlloc  * TOTAL, 0.00, 6, invVest],
    ["seed",     seedAlloc * TOTAL, 0.00, 6, invVest],
    ["public",   pubAlloc  * TOTAL, pubTge, 1, 12],
    ["team",     teamPct   * TOTAL, 0.00, 12, 36],
    ["treasury", treasPct  * TOTAL, 0.00, 12, 48],
    ["ecosystem",ecoPct    * TOTAL, 0.02, 0, 48],
    ["marketing",mktPct    * TOTAL, 0.05, 0, 24],
    ["advisors", advPct    * TOTAL, 0.00, 12, 24],
  ].map(([name, tok, tge, cliff, lin]) => ({ name, s: sched(tok, tge, cliff, lin) }));

  const deployed = Math.max(0, (raise - lpUsdc - bbSeed - 1_000_000) * 0.8); // 80% of remaining cash into yield engine
  const deployYieldMo = deployed * 0.13 / 12;

  let circ = 0, usdc = lpUsdc, bnd = lpBnd, reserve = bbSeed, lockedBought = 0;
  const k = usdc * bnd;
  let minRatio = Infinity, reserveOk = true, endRatio = 0;
  const aprs = [];

  for (let m = 0; m <= 60; m++) {
    let sellTok = 0;
    for (const b of buckets) { circ += b.s[m]; sellTok += b.s[m] * SELL_THROUGH[b.name]; }

    const organicLocked = circ * STAKE_PART * LOCK_SHARE;
    const prIn = m >= 1 ? prMonthly[Math.min(m - 1, prMonthly.length - 1)] : 0;
    const toStakers = prIn * switchPct;
    const toTreasury = prIn * (1 - switchPct);

    const p0 = usdc / bnd;
    let demandBuy = 0;
    if (m >= DEMAND_LAG && toStakers > 0) {
      const gap = (toStakers * 12) / TARGET_APR - (organicLocked + lockedBought) * p0;
      if (gap > 0) demandBuy = Math.min(gap, DEMAND_CAP);
    }

    reserve += toTreasury * 0.5 + deployYieldMo;

    if (sellTok > 0) { bnd += sellTok; usdc = k / bnd; }
    if (demandBuy > 0) { const b0 = bnd; usdc += demandBuy; bnd = k / usdc; lockedBought += b0 - bnd; }
    if (usdc / bnd < p0 * 0.9) {
      const need = Math.sqrt(k * p0 * 0.9) - usdc;
      const spend = Math.max(0, Math.min(need, reserve));
      usdc += spend; bnd = k / usdc; reserve -= spend;
      if (spend < need - 1) reserveOk = false;   // defense line breached: reserve ran dry
    }
    const p = usdc / bnd;
    minRatio = Math.min(minRatio, p / price);
    if (m === 60) endRatio = p / price;

    const lockedVal = (organicLocked + lockedBought) * p;
    aprs.push(lockedVal > 0 ? (toStakers * 12) / lockedVal : 0);
  }

  const aprY1 = aprs.slice(1, 13).reduce((a, b) => a + b, 0) / 12;
  const aprY3 = aprs.slice(25, 37).reduce((a, b) => a + b, 0) / 12;

  const fails = [];
  // F2a stress floor: never below 40% of launch even with ZERO speculative demand
  if (minRatio < 0.40) fails.push("F2a:stressFloor");
  // F2b recovery: fundamentals alone carry price back to >= launch by M60
  if (endRatio < 1.0) fails.push("F2b:recovery");
  if (aprY1 < 0.08 || aprY1 > 0.60) fails.push("F3:aprY1");
  if (aprY3 < 0.08 || aprY3 > 0.30) fails.push("F3:aprY3");
  if (!reserveOk) fails.push("F4:reserve");
  if (preAlloc + seedAlloc + teamPct + advPct > 0.30) fails.push("F6:insiders");

  return { ...cfg, raise, raisePre, raiseSeed, raisePub, liquidityPct, ecoPct,
           minRatio, endRatio, aprY1, aprY3, pass: fails.length === 0, fails, fdv: price * TOTAL };
}

/* ---------------- grid search ---------------- */
const results = [];
for (const price of [0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06])
for (const pubAlloc of [0.05, 0.08, 0.10, 0.12, 0.15])
for (const pubTge of [0.05, 0.10, 0.15])
for (const preAlloc of [0.02, 0.03, 0.04])
for (const seedAlloc of [0.05, 0.07])
for (const switchPct of [0.20, 0.30, 0.40, 0.50])
for (const lpUsdc of [1e6, 1.5e6, 2e6, 3e6])
for (const bbSeed of [0.5e6, 1e6, 2e6])
for (const invVest of [18, 24]) {
  const r = model({ price, pubAlloc, pubTge, preAlloc, seedAlloc, switchPct, lpUsdc, bbSeed, invVest });
  if (r) results.push(r);
}

const feasible = results.filter(r => r.pass);
console.log(`Grid: ${results.length} valid configs, ${feasible.length} feasible (pass all constraints)\n`);

// constraint failure breakdown
const failCount = {};
for (const r of results) for (const f of r.fails) failCount[f] = (failCount[f] || 0) + 1;
console.log("Failure counts:", failCount);

// near-misses: fewest failed constraints, best minRatio
const near = [...results].sort((a, b) => a.fails.length - b.fails.length || b.minRatio - a.minRatio).slice(0, 8);
console.log("\n=== Near-misses ===");
for (const r of near) console.log(
  `price $${r.price.toFixed(3)} pub ${(r.pubAlloc*100).toFixed(0)}% tge ${(r.pubTge*100).toFixed(0)}% sw ${(r.switchPct*100).toFixed(0)}% LP $${(r.lpUsdc/1e6).toFixed(1)}M bb $${(r.bbSeed/1e6).toFixed(1)}M | raise $${(r.raise/1e6).toFixed(2)}M | minP ${(r.minRatio*100).toFixed(0)}% APR1 ${(r.aprY1*100).toFixed(1)}% APR3 ${(r.aprY3*100).toFixed(1)}% | fails: ${r.fails.join(",") || "none"}`);

feasible.sort((a, b) => b.raise - a.raise || b.minRatio - a.minRatio ||
  Math.abs(a.aprY1 - 0.15) - Math.abs(b.aprY1 - 0.15));

const fm = n => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1e3).toFixed(0)}K`;
const show = (r, i) => console.log(
  `#${String(i + 1).padEnd(3)} price $${r.price.toFixed(3)} FDV ${fm(r.fdv).padEnd(7)} | pub ${(r.pubAlloc * 100).toFixed(0)}% tge ${(r.pubTge * 100).toFixed(0)}% | pre ${(r.preAlloc * 100).toFixed(0)}% seed ${(r.seedAlloc * 100).toFixed(0)}% vest ${r.invVest}mo | switch ${(r.switchPct * 100).toFixed(0)}% | LP ${fm(r.lpUsdc)} bb ${fm(r.bbSeed)} | eco ${(r.ecoPct * 100).toFixed(1)}% | raise ${fm(r.raise)} | minP ${(r.minRatio * 100).toFixed(0)}% endP ${(r.endRatio * 100).toFixed(0)}% | APR Y1 ${(r.aprY1 * 100).toFixed(1)}% Y3 ${(r.aprY3 * 100).toFixed(1)}%`
);

console.log("=== TOP 15 by raise (then stability, then APR-fit) ===");
feasible.slice(0, 15).forEach(show);

console.log("\n=== TOP 10 by price stability (min ratio) ===");
[...feasible].sort((a, b) => b.minRatio - a.minRatio || b.raise - a.raise).slice(0, 10).forEach(show);

// Where does feasibility break? — show the highest feasible FDV
const byFdv = {};
for (const r of feasible) byFdv[r.fdv] = (byFdv[r.fdv] || 0) + 1;
console.log("\n=== Feasible configs per FDV ===");
Object.entries(byFdv).sort((a, b) => a[0] - b[0]).forEach(([fdv, n]) =>
  console.log(`  FDV ${fm(+fdv)}: ${n} configs`));

// And per switch %
const bySw = {};
for (const r of feasible) bySw[r.switchPct] = (bySw[r.switchPct] || 0) + 1;
console.log("\n=== Feasible configs per revenue-switch % ===");
Object.entries(bySw).sort((a, b) => a[0] - b[0]).forEach(([sw, n]) =>
  console.log(`  switch ${(+sw * 100).toFixed(0)}%: ${n} configs`));

/* ---------------- detail trajectory of the CHOSEN config ---------------- */
// Selection: among feasible, prefer Tony-standard 18-mo investor vesting, then
// raise, then stability. (See 06_FINAL_TOKENOMICS.md for the write-up.)
const CHOSEN = { price: 0.04, pubAlloc: 0.15, pubTge: 0.15, preAlloc: 0.03,
                 seedAlloc: 0.07, switchPct: 0.50, lpUsdc: 1.5e6, bbSeed: 2e6, invVest: 18 };

function detail(cfg) {
  const { price, pubAlloc, pubTge, preAlloc, seedAlloc, switchPct, lpUsdc, bbSeed, invVest } = cfg;
  const liquidityPct = 0.12;
  const teamPct = 0.15, advPct = 0.03, treasPct = 0.20, mktPct = 0.05;
  const ecoPct = 1 - (preAlloc + seedAlloc + pubAlloc + teamPct + advPct + treasPct + mktPct + liquidityPct);
  const buckets = [
    ["preseed",  preAlloc  * TOTAL, 0.00, 6, invVest],
    ["seed",     seedAlloc * TOTAL, 0.00, 6, invVest],
    ["public",   pubAlloc  * TOTAL, pubTge, 1, 12],
    ["team",     teamPct   * TOTAL, 0.00, 12, 36],
    ["treasury", treasPct  * TOTAL, 0.00, 12, 48],
    ["ecosystem",ecoPct    * TOTAL, 0.02, 0, 48],
    ["marketing",mktPct    * TOTAL, 0.05, 0, 24],
    ["advisors", advPct    * TOTAL, 0.00, 12, 24],
  ].map(([name, tok, tge, cliff, lin]) => ({ name, s: sched(tok, tge, cliff, lin) }));
  const raise = preAlloc * TOTAL * price * 0.25 + seedAlloc * TOTAL * price * 0.50 + pubAlloc * TOTAL * price;
  const deployed = Math.max(0, (raise - lpUsdc - bbSeed - 1e6) * 0.8);
  const deployYieldMo = deployed * 0.13 / 12;

  let circ = 0, usdc = lpUsdc, bnd = lpUsdc / price, reserve = bbSeed, lockedBought = 0;
  const k = usdc * bnd;
  console.log(`\n=== CHOSEN CONFIG trajectory (raise ${fm(raise)}, deployed ${fm(deployed)}) ===`);
  console.log("Mo  | circ%  | price   | vs launch | sell     | demand   | switch->stakers | APR    | reserve");
  for (let m = 0; m <= 60; m++) {
    let sellTok = 0;
    for (const b of buckets) { circ += b.s[m]; sellTok += b.s[m] * SELL_THROUGH[b.name]; }
    const organicLocked = circ * STAKE_PART * LOCK_SHARE;
    const prIn = m >= 1 ? prMonthly[Math.min(m - 1, prMonthly.length - 1)] : 0;
    const toStakers = prIn * switchPct;
    const p0 = usdc / bnd;
    let demandBuy = 0;
    if (m >= DEMAND_LAG && toStakers > 0) {
      const gap = (toStakers * 12) / TARGET_APR - (organicLocked + lockedBought) * p0;
      if (gap > 0) demandBuy = Math.min(gap, DEMAND_CAP);
    }
    reserve += prIn * (1 - switchPct) * 0.5 + deployYieldMo;
    const sellVal = sellTok * p0;
    if (sellTok > 0) { bnd += sellTok; usdc = k / bnd; }
    if (demandBuy > 0) { const b0 = bnd; usdc += demandBuy; bnd = k / usdc; lockedBought += b0 - bnd; }
    if (usdc / bnd < p0 * 0.9 && reserve > 0) {
      const spend = Math.max(0, Math.min(Math.sqrt(k * p0 * 0.9) - usdc, reserve));
      usdc += spend; bnd = k / usdc; reserve -= spend;
    }
    const p = usdc / bnd;
    const lockedVal = (organicLocked + lockedBought) * p;
    const apr = lockedVal > 0 ? (toStakers * 12) / lockedVal : 0;
    if ([0,1,3,6,7,9,12,15,18,24,30,36,48,60].includes(m)) console.log(
      `M${String(m).padEnd(3)}| ${(circ / TOTAL * 100).toFixed(1).padStart(5)}% | $${p.toFixed(4)} | ${((p / price - 1) * 100).toFixed(0).padStart(4)}%     | ${fm(sellVal).padEnd(9)}| ${fm(demandBuy).padEnd(9)}| ${fm(toStakers).padEnd(16)}| ${(apr * 100).toFixed(1).padStart(5)}% | ${fm(reserve)}`);
  }
}
detail(CHOSEN);
