// BND Tokenomics Simulation — v1 (2026-07-21)
// Run: node tokenomics/sim-bnd-tokenomics.mjs
//
// Feeds on REAL protocol revenue from the v8 engine (same extraction pattern as
// scripts/audit-*.mjs — single source of truth, never re-typed), then models the
// token side per tokenomics/03_TOKENOMICS_STRUCTURE.md:
//   - unlock schedule -> circulating float (60 months)
//   - xBND staking participation + lock mix
//   - Revenue Switch: 30% of Protocol Reserve inflows -> locked xBND (rwaUSD)
//   - staking APR honesty check at the modeled price
//   - buyback capacity vs audit-style monthly buy-pressure requirement
//   - constant-product price impact of the worst unlock month vs LP depth
//
// Scenarios: base engine revenue / 5x / 10x (protocol scale sensitivity).

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const chunk = src.slice(src.indexOf("const PRESETS"), src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const { PRESETS, simulate } = new Function(`${chunk}\nreturn { PRESETS, simulate };`)();

// 10-market default lineup (mirror of scripts/diagnose-10-markets.mjs, integFee at current $50K default)
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

// Monthly Protocol Reserve inflow (delta of prCum), months 1..36; extrapolate 37..60
// with the trailing 6-month average growth rate (protocol keeps scaling with AUM).
const prMonthly = [];
let prev = 0;
for (const r of engineRows) { prMonthly.push((r.prCum || 0) - prev); prev = r.prCum || 0; }
const tailGrowth = (() => {
  const a = prMonthly[35], b = prMonthly[29];
  return b > 0 ? Math.pow(a / b, 1 / 6) - 1 : 0.02;
})();
for (let m = 36; m < 60; m++) prMonthly.push(prMonthly[m - 1] * (1 + tailGrowth));

/* ============================== TOKENOMICS PARAMS ============================== */
// Everything below mirrors 03_TOKENOMICS_STRUCTURE.md — change there, change here.
const P = {
  totalSupply: 1_000_000_000,
  publicPrice: 0.10,

  // [name, tokens, tgePct, cliffMonths, linearMonths]
  buckets: [
    ["Pre-seed",  30e6, 0.00,  6, 18],
    ["Seed",      70e6, 0.00,  6, 18],
    ["Public",    80e6, 0.10,  1, 12],   // tuned: 20%->10% TGE + 1-mo gap (sim v1 finding: TGE dump was the worst month)
    ["Team",     150e6, 0.00, 12, 36],
    ["Treasury", 200e6, 0.00, 12, 48],
    ["Ecosystem",220e6, 0.02,  0, 48],   // budgeted; modeled linearly as worst case
    ["Liquidity",120e6, 0.00,  0,  0],   // deployed in LP, not sellable float
    ["Marketing", 50e6, 0.05,  0, 24],
    ["Advisors",  30e6, 0.00, 12, 24],
  ],

  // Investor sell-through assumption per unlocked cohort (audit-style conservative):
  // what fraction of newly unlocked tokens hits the market that month.
  sellThrough: { "Pre-seed": 0.6, "Seed": 0.5, "Public": 0.5, "Team": 0.3, "Treasury": 0.0,
                 "Ecosystem": 0.4, "Liquidity": 0.0, "Marketing": 0.5, "Advisors": 0.5 },

  // Staking
  stakePartOfFloat: 0.40,       // share of circulating float staked (scenario-tested below)
  lockedShareOfStaked: 0.70,    // of staked, how much locks (eligible for revenue switch)
  revenueSwitchPct: 0.30,       // of PR inflow -> locked xBND

  // Demand side (the audit's utility-value-proxy logic, made dynamic):
  // yield-seeking capital buys BND until locked-xBND APR compresses to targetApr.
  // equilibriumLockedValue = annualized staker revenue / targetApr; buyers close
  // the gap at most demandFlowCap USD per month (capital doesn't arrive instantly).
  targetApr: 0.15,              // Tony: "15% staking yield reasonable"
  demandFlowCap: 400_000,       // max new yield-seeking USD inflow per month
  demandLag: 3,                 // months before yield-seekers react post-TGE

  // Liquidity pool (V2-style constant product as conservative backstop; V3 improves this)
  lpUsdc: 3_000_000,
  lpBnd: 30_000_000,

  // Buyback funding: treasury's 70% share of switched stream + yield on deployed public proceeds
  publicRaise: 8_000_000,
  deployedShare: 0.80,          // 80% of raise into protocol yield engine
  deployedApr: 0.13,            // engine's own annG neighborhood
  buybackShareOfTreasuryStream: 0.5, // half of treasury's stream reserved for reactive buybacks
};

/* ============================== MODEL ============================== */
function unlockScheduleFor(tokens, tgePct, cliff, linear) {
  // returns array[61] of tokens unlocking in month m (m=0 is TGE)
  const out = new Array(61).fill(0);
  out[0] = tokens * tgePct;
  const rest = tokens - out[0];
  if (linear > 0) {
    for (let i = 1; i <= linear; i++) {
      const m = cliff + i;
      if (m <= 60) out[m] += rest / linear;
    }
  }
  return out;
}

function run(scale, stakePart) {
  const pr = prMonthly.map(v => v * scale);
  const unlocks = P.buckets.map(([name, tok, tge, cliff, lin]) =>
    ({ name, sched: unlockScheduleFor(tok, tge, cliff, lin) }));

  let circulating = 0;
  let price = P.publicPrice;
  let usdc = P.lpUsdc, bndLp = P.lpBnd;
  const k = usdc * bndLp;
  let buybackReserve = 2_000_000; // seeded from raise (tuned from $1M — v1 run exhausted it at TGE)
  let lockedTokens = 0;           // tokens locked by yield-seekers + organic stakers
  const rows = [];

  for (let m = 0; m <= 60; m++) {
    // 1) unlocks
    let unlockedThisMonth = 0, sellTokens = 0;
    for (const u of unlocks) {
      const t = u.sched[m];
      unlockedThisMonth += t;
      sellTokens += t * (P.sellThrough[u.name] ?? 0.5);
    }
    circulating += unlockedThisMonth;

    // 2) organic staking absorbs a share of the float (holders who stake what they hold)
    const organicStaked = circulating * stakePart;
    const organicLocked = organicStaked * P.lockedShareOfStaked;

    // 3) revenue switch (m is 0-based TGE; engine month m maps 1:1 — TGE at engine M1)
    const prIn = m >= 1 ? pr[Math.min(m - 1, pr.length - 1)] : 0;
    const toStakers = prIn * P.revenueSwitchPct;
    const toTreasury = prIn * (1 - P.revenueSwitchPct);

    // 4) yield-seeking demand: capital buys+locks BND until locked APR compresses
    //    to targetApr (audit's utility-value proxy, dynamic form)
    let demandBuyUsd = 0;
    const p0 = usdc / bndLp;
    if (m >= P.demandLag && toStakers > 0) {
      const totalLocked = organicLocked + lockedTokens;
      const equilibriumValue = (toStakers * 12) / P.targetApr;
      const gapUsd = equilibriumValue - totalLocked * p0;
      if (gapUsd > 0) demandBuyUsd = Math.min(gapUsd, P.demandFlowCap);
    }

    // 5) buyback capacity: treasury stream share + deployed proceeds yield
    const deployYield = P.publicRaise * P.deployedShare * P.deployedApr / 12;
    buybackReserve += toTreasury * P.buybackShareOfTreasuryStream + deployYield;

    // 6) market on the constant-product pool: sells, then demand buys, then
    //    reactive buyback if the month still closed below -10%
    if (sellTokens > 0) { bndLp += sellTokens; usdc = k / bndLp; }
    if (demandBuyUsd > 0) {
      const bndBefore = bndLp;
      usdc += demandBuyUsd; bndLp = k / usdc;
      lockedTokens += bndBefore - bndLp;   // bought tokens go straight into locks
    }
    let buybackSpent = 0;
    if (usdc / bndLp < p0 * 0.9 && buybackReserve > 0) {
      const usdcTarget = Math.sqrt(k * p0 * 0.9);
      const need = usdcTarget - usdc;
      buybackSpent = Math.max(0, Math.min(need, buybackReserve));
      usdc += buybackSpent; bndLp = k / usdc;
      buybackReserve -= buybackSpent;
    }
    price = usdc / bndLp;

    // 7) staker APR (annualized, on all locked xBND at current price)
    const locked = organicLocked + lockedTokens;
    const lockedValue = locked * price;
    const aprLocked = lockedValue > 0 ? (toStakers * 12) / lockedValue : 0;

    rows.push({ m, circulating, staked: organicStaked + lockedTokens, locked, price,
      unlockedThisMonth, sellTokens, prIn, toStakers, toTreasury, demandBuyUsd,
      buybackReserve, buybackSpent, aprLocked,
      sellValue: sellTokens * p0 });
  }
  return rows;
}

/* ============================== REPORT ============================== */
const fm = (n, d = 2) => n >= 1e6 ? `$${(n / 1e6).toFixed(d)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;
const ft = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`;

console.log(`\nEngine tail growth for M37-60 extrapolation: ${(tailGrowth * 100).toFixed(2)}%/mo`);
console.log(`Engine PR monthly: M1 ${fm(prMonthly[0])}  M12 ${fm(prMonthly[11])}  M36 ${fm(prMonthly[35])}  M60(extrap) ${fm(prMonthly[59])}`);

for (const [label, scale] of [["BASE (engine as-is)", 1], ["5x SCALE", 5], ["10x SCALE", 10]]) {
  console.log(`\n================ SCENARIO: ${label} — revenue switch ${P.revenueSwitchPct * 100}%, staking ${P.stakePartOfFloat * 100}% of float ================`);
  const rows = run(scale, P.stakePartOfFloat);
  console.log("Mo  | circ    | float%  | price   | unlock sell | demand buy | PR in    | to stakers | APR(locked) | buyback res");
  for (const m of [0, 3, 6, 7, 12, 18, 24, 30, 36, 48, 60]) {
    const r = rows[m];
    console.log(
      `M${String(m).padEnd(3)}| ${ft(r.circulating).padEnd(8)}| ${(r.circulating / P.totalSupply * 100).toFixed(1).padStart(5)}%  | $${r.price.toFixed(4)} | ${fm(r.sellValue).padEnd(12)}| ${fm(r.demandBuyUsd).padEnd(11)}| ${fm(r.prIn).padEnd(9)}| ${fm(r.toStakers).padEnd(11)}| ${(r.aprLocked * 100).toFixed(1).padStart(6)}%     | ${fm(r.buybackReserve)}`
    );
  }
  const worst = rows.reduce((a, b) => b.sellValue > a.sellValue ? b : a);
  const minP = Math.min(...rows.map(r => r.price));
  const aprY1 = rows.slice(1, 13).reduce((s, r) => s + r.aprLocked, 0) / 12;
  const aprY3 = rows.slice(25, 37).reduce((s, r) => s + r.aprLocked, 0) / 12;
  console.log(`  Worst unlock month: M${worst.m} sells ${fm(worst.sellValue)} | min price $${minP.toFixed(4)} (${((minP / P.publicPrice - 1) * 100).toFixed(1)}% vs launch)`);
  console.log(`  Avg locked-xBND APR: Y1 ${(aprY1 * 100).toFixed(1)}%  Y3 ${(aprY3 * 100).toFixed(1)}%`);
}

// Staking-participation sensitivity at base revenue
console.log(`\n================ SENSITIVITY: locked-xBND APR (Y1 avg / Y3 avg) vs staking participation — BASE revenue ================`);
for (const sp of [0.2, 0.4, 0.6]) {
  const rows = run(1, sp);
  const aprY1 = rows.slice(1, 13).reduce((s, r) => s + r.aprLocked, 0) / 12;
  const aprY3 = rows.slice(25, 37).reduce((s, r) => s + r.aprLocked, 0) / 12;
  console.log(`  staking ${(sp * 100).toFixed(0)}% of float: Y1 ${(aprY1 * 100).toFixed(1)}%   Y3 ${(aprY3 * 100).toFixed(1)}%`);
}

// Acceptance criteria (03_TOKENOMICS_STRUCTURE.md §7)
console.log(`\n================ ACCEPTANCE CHECKS (base scenario) ================`);
const base = run(1, P.stakePartOfFloat);
const worst = base.reduce((a, b) => b.sellValue > a.sellValue ? b : a);
const minP = Math.min(...base.map(r => r.price));
const c1 = minP >= P.publicPrice * 0.8;
const aprAll = base.slice(1, 37).map(r => r.aprLocked);
const c2 = Math.min(...aprAll.slice(2)) > 0.005 && Math.max(...aprAll) < 5;
const stack = base.map(r => r.sellValue);
const c3 = worst.sellValue < P.lpUsdc * 0.5;
const negRes = base.filter(r => r.buybackReserve <= 0).length;
const c4 = negRes === 0;
console.log(`  1. Price floor >= -20% vs launch across 60 mo: ${c1 ? "PASS" : "FAIL"} (min $${minP.toFixed(4)})`);
console.log(`  2. Locked APR credible band (0.5%..500%):      ${c2 ? "PASS" : "FAIL"}`);
console.log(`  3. Worst unlock month < 50% of LP USDC depth:  ${c3 ? "PASS" : "FAIL"} (${fm(worst.sellValue)} vs ${fm(P.lpUsdc)})`);
console.log(`  4. Buyback reserve never exhausted:            ${c4 ? "PASS" : "FAIL"}`);
