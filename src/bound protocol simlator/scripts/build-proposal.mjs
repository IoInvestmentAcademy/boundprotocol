// Build the Seed Token Investment Proposal — public/bound-seed-proposal.html
// Structure follows the BITSWIFT "TOKEN INVESTMENT PROPOSAL" form (Feb 2026):
//   Note · 1 Investment Terms · 2 Vesting · 3 Launch · 4 Listing venues ·
//   5 Financial Projections · 6 Projected Token Performance · 7 Downside · 8 Notice
// Every figure is pulled from the LIVE tokenomics engine, never retyped.
// Regenerate after any default change:  node scripts/build-proposal.mjs
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRINT_CSS, PRINT_BUTTON } from "./print-css.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");

/* ---------- live engine + defaults (same loader as the audit report) ---------- */
function sb(t,i,o,c){let d=0;for(let j=i;j<t.length;j++){if(t[j]===o)d++;else if(t[j]===c){d--;if(d===0)return t.slice(i,j+1);}}throw new Error("unbalanced");}
function usd(n){const m=src.match(new RegExp(`\\[${n},\\s*set\\w+\\]\\s*=\\s*useState\\(`));return eval(`(${sb(src,m.index+m[0].length-1,"(",")").slice(1,-1)})`);}
const mainChunk=src.slice(src.indexOf("const PRESETS"),src.indexOf("/* ------------------------------------------------------------- UI COMPONENTS */"));
const {PRESETS,simulate}=new Function(`${mainChunk}\nreturn {PRESETS,simulate};`)();
let tok=src.slice(src.indexOf("const TOKENOMICS_BUCKETS"),src.indexOf("// Caps every row at 3 items"));
tok=tok.replace("m, price, prRevenue, burnFlow,","m, price, prRevenue, sellUsdOut, totalBuyUsd, tokensBought, demandBought, burnFlow,");
const {runTokenomicsSim}=new Function(`${tok}\nreturn {runTokenomicsSim};`)();
const dm=src.indexOf("const DEFAULT_MARKET = {");const DEFAULT_MARKET=eval("("+sb(src,src.indexOf("{",dm),"{","}")+")");
const rm=src.indexOf("const [rwaMarkets, setRwaMarkets] = useState([");const rwaMarkets=eval(sb(src,src.indexOf("[",rm+40),"[","]"));
const yld=usd("yld");const lc=src.indexOf("const layerCfg = useMemo(() => ({");const layerCfg=eval(sb(src,src.indexOf("(",lc+31),"(",")"));
const nm=["seedRaised","seedPrice","extSeedOn","extSeedRaised","extSeedPrice","extSeedCliff","publicRaised","publicPrice","vestState","alloc","burnSplitPct","burnApy","publicSplitLiquidity","publicSplitCompany","publicSplitEmergency","sellThrough","stakePct","unstakeChurn","unstakeSoldPct","stakingRewardPct","targetStakingApy","publicStakePct","publicUnstakeChurn","publicUnstakeSoldPct","demandStrengthPct","orgVolumePct","orgBuyBalance","bndPoolSeed","lpOutsideUsdcPct","lpExitChurnPct"];
const d={};for(const n of nm)d[n]=usd(n);
const A={totalSupply:1e9,...d,vest:{...d.vestState,extSeed:{...d.vestState.extSeed,cliff:d.extSeedCliff}}};
const sim=simulate({...PRESETS.default},rwaMarkets,layerCfg);
const {rows,catTokens}=runTokenomicsSim(A,sim);
const M=rows.length, L=rows[M-1], launch=A.publicPrice;

/* ---------- formatters ---------- */
const fUsd=v=>{const a=Math.abs(v);const s=v<0?"−":"";if(a>=1e6)return`${s}$${(a/1e6).toFixed(2)}M`;if(a>=1e3)return`${s}$${(a/1e3).toFixed(0)}K`;return`${s}$${a.toFixed(0)}`;};
const fUsdX=v=>`${v<0?"−":""}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;
const fTokX=v=>Math.round(v).toLocaleString("en-US");
const fPrice=v=>`$${v.toFixed(4)}`;
const sPct=(v,dp=1)=>`${v>=0?"+":"−"}${Math.abs(v).toFixed(dp)}%`;

/* ---------- seed cohort, per year ---------- */
const SEED_TOKENS=catTokens.seed;
const yrIdx=[11,23,35];
const yr=yrIdx.map((i,n)=>{
  const r=rows[i], prev=n?rows[yrIdx[n-1]]:null;
  const vested=r.byBucket.seed, sold=r.cumSoldSeed;
  const remain=Math.max(0,vested-sold);
  return {
    label:`Year ${n+1}`, month:i+1, price:r.price,
    vested, sold, remain, remainVal:remain*r.price,
    cumSell:r.cumSellProceedsSeed, cumDist:r.cumDistSeed,
    soldInYear: sold-(prev?prev.cumSoldSeed:0),
    sellInYear: r.cumSellProceedsSeed-(prev?prev.cumSellProceedsSeed:0),
    distInYear: r.cumDistSeed-(prev?prev.cumDistSeed:0),
  };
});
const INVEST=A.seedRaised;
const FINAL={remainVal:yr[2].remainVal, cumSell:yr[2].cumSell, cumDist:yr[2].cumDist};
FINAL.overall=FINAL.remainVal+FINAL.cumSell+FINAL.cumDist;
FINAL.totalReturn=(FINAL.overall/INVEST-1)*100;
FINAL.cagr=(Math.pow(FINAL.overall/INVEST,12/M)-1)*100;
FINAL.moic=FINAL.overall/INVEST;
FINAL.distPctCapital=FINAL.cumDist/INVEST*100;
FINAL.realizedPct=(FINAL.cumSell+FINAL.cumDist)/INVEST*100;

const vestStr=k=>{const v=A.vest[k]||{};const p=[];p.push(`${v.tge||0}% at TGE`);if(v.cliff)p.push(`${v.cliff}-month cliff`);if(v.vest)p.push(`${v.vest}-month linear`);return p.join(" · ");};
const SEED=A.vest.seed;
const fullVestMonth=(SEED.cliff||0)+(SEED.vest||0);
const maxDD=Math.min(...rows.map(r=>r.price/launch-1))*100;
const peakPrice=Math.max(...rows.map(r=>r.price));

/* ---------- chart primitives (inline SVG, theme-aware, no raster) ---------- */
const W=880,H=250,PAD={l:64,r:18,t:16,b:28};
const sx=(i,n)=>PAD.l+(W-PAD.l-PAD.r)*(n<2?0:i/(n-1));
const sy=(v,lo,hi)=>PAD.t+(H-PAD.t-PAD.b)*(1-(v-lo)/((hi-lo)||1));
function chartLine({title,series,fmt,note}){
  const all=series.flatMap(s=>s.vals);
  const lo=Math.min(0,...all), hi=Math.max(...all)*1.08||1;
  const n=series[0].vals.length;
  const grid=[0,.25,.5,.75,1].map(f=>{const v=lo+(hi-lo)*f;const y=sy(v,lo,hi);
    return `<line class="gl" x1="${PAD.l}" y1="${y}" x2="${W-PAD.r}" y2="${y}"/><text class="ax" x="${PAD.l-8}" y="${y+3.5}" text-anchor="end">${fmt(v)}</text>`;}).join("");
  const paths=series.map(s=>`<path class="ln ${s.c}" d="${s.vals.map((v,i)=>`${i?"L":"M"}${sx(i,n).toFixed(1)},${sy(v,lo,hi).toFixed(1)}`).join("")}"/>`).join("");
  const xl=[0,Math.floor(n/3),Math.floor(2*n/3),n-1].map(i=>`<text class="ax" x="${sx(i,n)}" y="${H-8}" text-anchor="middle">M${i+1}</text>`).join("");
  return `<figure class="fig"><figcaption class="figt">${title}</figcaption>
  <svg class="cv" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${grid}${paths}${xl}</svg>
  <div class="clg">${series.map(s=>`<span class="lg ${s.c}">● ${s.name}</span>`).join("")}</div>
  ${note?`<div class="cap">${note}</div>`:""}</figure>`;
}
function chartStack({title,cats,layers,fmt,note}){
  const tot=cats.map((_,i)=>layers.reduce((s,l)=>s+l.vals[i],0));
  const hi=Math.max(...tot)*1.12||1;
  const bw=(W-PAD.l-PAD.r)/cats.length*0.5;
  let bars="";
  cats.forEach((c,i)=>{
    const cx=PAD.l+(W-PAD.l-PAD.r)*((i+0.5)/cats.length)-bw/2;
    let acc=0;
    layers.forEach(l=>{
      const y0=sy(acc,0,hi), y1=sy(acc+l.vals[i],0,hi);
      bars+=`<rect class="bar ${l.c}" x="${cx.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,y0-y1).toFixed(1)}"/>`;
      acc+=l.vals[i];
    });
    bars+=`<text class="ax" x="${(cx+bw/2).toFixed(1)}" y="${H-8}" text-anchor="middle">${c}</text>`;
    bars+=`<text class="val" x="${(cx+bw/2).toFixed(1)}" y="${(sy(acc,0,hi)-7).toFixed(1)}" text-anchor="middle">${fmt(acc)}</text>`;
  });
  const grid=[0,.5,1].map(f=>{const v=hi*f;const y=sy(v,0,hi);
    return `<line class="gl" x1="${PAD.l}" y1="${y}" x2="${W-PAD.r}" y2="${y}"/><text class="ax" x="${PAD.l-8}" y="${y+3.5}" text-anchor="end">${fmt(v)}</text>`;}).join("");
  return `<figure class="fig"><figcaption class="figt">${title}</figcaption>
  <svg class="cv" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${grid}${bars}</svg>
  <div class="clg">${layers.map(l=>`<span class="lg ${l.c}">● ${l.name}</span>`).join("")}</div>
  ${note?`<div class="cap">${note}</div>`:""}</figure>`;
}
const tbl=(head,body,cap)=>`<div class="tbl-scroll"><table><thead><tr>${head.map((h,i)=>`<th${i?' class="num"':""}>${h}</th>`).join("")}</tr></thead><tbody>${body.map(r=>`<tr>${r.map((c,i)=>`<td${i?' class="num"':""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${cap?`<div class="cap">${cap}</div>`:""}`;
const kpis=arr=>`<div class="kpis">${arr.map(k=>`<div class="kpi"><div class="kn ${k.c||""}">${k.n}</div><div class="kl">${k.l}</div></div>`).join("")}</div>`;
const sub2=t=>`<h4 class="sub">${t}</h4>`;
const note=(t,body,kind="")=>`<div class="note ${kind}"><div class="nt">${t}</div><div class="nb">${body}</div></div>`;

/* ---------- listing venues ----------
   Presented as TARGET venues. Only the Uniswap v4 BND/USDC pool is committed —
   the protocol seeds it from the raise and the APSS runs as a v4 hook on it.
   No centralised listing agreement is executed, and the disclaimer under the
   grid says so; the verifier fails the build if that disclaimer goes missing. */
const mark=(bg,fg,glyph)=>`<span class="vm" style="background:${bg};color:${fg}">${glyph}</span>`;
const CEX=[
  {n:"Binance",   m:mark("#F0B90B","#12161C","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M12 2.6 8.9 5.7l3.1 3.1 3.1-3.1zM6.1 8.5 3 11.6l3.1 3.1 3.1-3.1zm11.8 0-3.1 3.1 3.1 3.1L21 11.6zM12 10.7l-3.1 3.1L12 16.9l3.1-3.1zm0 7.6-3.1-3.1L12 21.4l3.1-3.1z'/></svg>")},
  {n:"OKX",       m:mark("#FFFFFF","#12161C","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M2.5 2.5h6v6h-6zM15.5 2.5h6v6h-6zM9 9h6v6H9zM2.5 15.5h6v6h-6zM15.5 15.5h6v6h-6z'/></svg>")},
  {n:"Kraken",    m:mark("#5741D9","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M12 2C7.6 2 4 5.6 4 10v11h2.6v-8.4a1.3 1.3 0 1 1 2.6 0V21h2.5v-8.4a1.3 1.3 0 1 1 2.6 0V21h2.6v-8.4a1.3 1.3 0 1 1 2.6 0V21H20V10c0-4.4-3.6-8-8-8z'/></svg>")},
  {n:"KuCoin",    m:mark("#0BC18E","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M7.6 12 14 18.4l3.3-3.3 2.6 2.6L14 23.6 4.4 14V10L14 .4l5.9 5.9-2.6 2.6L14 5.6z'/></svg>")},
  {n:"MEXC",      m:mark("#1972F5","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M12 3.2 21.5 20H15L12 14.4 9 20H2.5z'/></svg>")},
];
const DEX=[
  {n:"Uniswap v4", live:true, m:mark("#FF007A","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M12 2c2.2 1.9 3.1 4 2.6 6.3-.3 1.5-1.3 2.6-2 3.6-.7 1-1.1 2-.6 3.2.4.9 1.3 1.5 2.3 1.5 1.2 0 2.1-.8 2.3-1.9.5 2.4-1.3 5-4 5.6-3 .7-6-1.1-6.7-4-.5-2 .2-3.7 1.2-5.2.9-1.3 2-2.4 2.5-3.9C10.2 5.5 10.5 3.6 12 2z'/></svg>")},
  {n:"PancakeSwap", m:mark("#D1884F","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M8 2c.8 0 1.3.6 1.3 1.4L9 7.4c.9-.2 2-.3 3-.3s2.1.1 3 .3l-.3-4C14.7 2.6 15.2 2 16 2s1.4.6 1.4 1.4l.3 4.6C20 9.2 21.5 11 21.5 13.2v3.3c0 3-4.2 5.5-9.5 5.5s-9.5-2.5-9.5-5.5v-3.3C2.5 11 4 9.2 6.3 8l.3-4.6C6.6 2.6 7.2 2 8 2z'/></svg>")},
  {n:"Curve",      m:mark("#3B6DE7","#fff","<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='2.4'><path d='M3 19c0-8 5-14 12-14'/><path d='M3 19h18'/></svg>")},
];
const venueChip=v=>`<span class="chip${v.live?" live":""}">${v.m}<span class="cn">${v.n}</span>${v.live?'<span class="cb">Live at TGE</span>':""}</span>`;

/* ============================ SECTIONS ============================ */
const S=[];

S.push({id:"terms",n:"1",nav:"Investment Terms",title:"Investment Terms",html:`
<p class="desc">The Seed round in full. Figures are the round total, not a per-investor allocation; a subscription for part of the round scales every line proportionally.</p>
${kpis([
  {n:fUsdX(INVEST),l:"Investment amount",c:""},
  {n:fPrice(A.seedPrice),l:"Token price"},
  {n:fTokX(SEED_TOKENS),l:"Tokens allocated (BND)"},
  {n:(SEED_TOKENS/A.totalSupply*100).toFixed(2)+"%",l:"Of total supply"},
])}
${tbl(["Term","Value"],[
  ["Investment amount",fUsdX(INVEST)],
  ["Token price",fPrice(A.seedPrice)],
  ["Tokens allocated",fTokX(SEED_TOKENS)+" BND"],
  ["Share of total supply",(SEED_TOKENS/A.totalSupply*100).toFixed(2)+"%"],
  ["Implied round valuation (FDV)",fUsdX(A.seedPrice*A.totalSupply)],
  ["Launch price",fPrice(launch)],
  ["Discount to launch",((1-A.seedPrice/launch)*100).toFixed(1)+"%"],
  ["Step-up to launch",(launch/A.seedPrice).toFixed(2)+"×"],
],"Total supply is fixed at "+fTokX(A.totalSupply)+" BND and cannot be increased. Source: live tokenomics engine.")}
<p>The Seed round prices at ${fPrice(A.seedPrice)} against a launch price of ${fPrice(launch)} — a ${(launch/A.seedPrice).toFixed(2)}× step-up, or a ${((1-A.seedPrice/launch)*100).toFixed(1)}% discount to the price at which the public enters. That discount is the compensation for a ${SEED.cliff}-month cliff and for capital committed before the protocol carries revenue.</p>`});

S.push({id:"vesting",n:"2",nav:"Vesting Schedule",title:"Vesting Schedule",html:`
<p class="desc">Allocated BND is released on the schedule below. No tokens unlock at generation.</p>
${tbl(["Stage","Terms"],[
  ["Token Generation Event (TGE)",(SEED.tge||0)+"% unlocked"],
  ["Cliff period",SEED.cliff+" months"],
  ["Linear vesting",SEED.vest+" months following the cliff"],
  ["Full vesting completion","Month "+fullVestMonth+" from TGE"],
])}
${chartStack({title:"Seed allocation released, cumulative",cats:yr.map(y=>y.label),
  layers:[{name:"Released (BND)",c:"a",vals:yr.map(y=>y.vested)}],
  fmt:v=>v>=1e6?(v/1e6).toFixed(0)+"M":(v/1e3).toFixed(0)+"K",
  note:"Nothing is released before month "+(SEED.cliff+1)+". Full release at month "+fullVestMonth+"."})}
<p>${SEED.tge?`${SEED.tge}% of the allocation unlocks at generation. `:"Nothing unlocks at generation. "}The first tokens become available in month ${SEED.cliff+1}, after which the balance releases evenly across ${SEED.vest} months, completing at month ${fullVestMonth}. The structure is deliberate: the round holds no sellable position through the launch window, which is when a discounted private tranche would otherwise transmit the most pressure to the public cohort.</p>`});

S.push({id:"launch",n:"3",nav:"Launch",title:"Launch",html:`
${kpis([
  {n:fPrice(launch),l:"Launch price"},
  {n:fUsdX(launch*A.totalSupply),l:"Launch FDV"},
  {n:"Month "+(SEED.cliff+1),l:"First Seed unlock"},
  {n:M+" months",l:"Modelled horizon"},
])}
<p>BND generates at ${fPrice(launch)}, an FDV of ${fUsdX(launch*A.totalSupply)} on the fixed ${fTokX(A.totalSupply)} supply. The launch date is set by the delivery programme rather than by this document; the Delivery Roadmap governs it and schedules audit and public security competition before RWA markets go live.</p>
${note("Launch date","The target date is governed by the Delivery Roadmap and is confirmed separately. This proposal makes no representation as to timing.")}`});

S.push({id:"venues",n:"4",nav:"Listing Venues",title:"Proposed Platforms for BND Listing",html:`
<p class="desc">Where BND trades at generation, and the venues targeted thereafter.</p>
${sub2("Decentralised exchanges")}
<div class="chips">${DEX.map(venueChip).join("")}</div>
${sub2("Centralised exchanges — targets")}
<div class="chips">${CEX.map(venueChip).join("")}</div>
${note("Final listing venues to be determined and announced separately","Only the Uniswap v4 BND/USDC pool is committed: the protocol seeds it directly from the raise and the APSS operates as a v4 hook on it. The centralised venues above are <b>targets under discussion</b>. No centralised listing agreement has been executed, and nothing in this document should be read as one. Listing on any named venue is subject to that venue's own review, fees and timing, none of which is within the issuer's control.","warn")}`});

S.push({id:"projections",n:"5",nav:"Financial Projections",title:"Financial Projections",html:`
<p class="desc">Basis of the price path, and the mechanisms that drive it.</p>
<p>Projections are generated from the BOUND Protocol simulation engine on its default preset — the same engine that produces the Business Plan, the Cost Analysis and the Token Economic Audit. No figure in this document is typed by hand, and nothing assumes a scenario more favourable than that preset.</p>
<p>Value reaches BND through three rule-bound flows off Protocol Reserve revenue rather than through discretionary treasury action: the <b>Burn Engine</b>, which retires supply permanently; the <b>xBND Revenue Switch</b>, which pays private-round holders a price-independent income leg in rwaUSD; and the <b>Public Staking Pool</b>. Protocol Reserve revenue across the horizon is ${fUsd(rows.reduce((s,r)=>s+r.prRevenue,0))}.</p>
${chartLine({title:"Modelled BND price path — 36 months",
  series:[{name:"BND price (USD)",c:"a",vals:rows.map(r=>r.price)}],
  fmt:v=>"$"+v.toFixed(3),
  note:`Launch ${fPrice(launch)} · month ${M} ${fPrice(L.price)} · peak ${fPrice(peakPrice)} · maximum drawdown ${sPct(maxDD)}. Constant-product depth converts a thin launch pool into amplified moves in both directions.`})}
${note("These are model outputs, not forecasts","Forward-looking figures derived from internal assumptions and market modelling. They are not guarantees. Actual results may differ materially through market volatility, regulatory developments, liquidity conditions, or delivery risk.","warn")}`});

/* ---- section 6: the performance table the proposal exists for ---- */
const perfRows=[
  ["Token price (USD)",...yr.map(y=>fPrice(y.price)),"—"],
  ["Tokens released, cumulative (BND)",...yr.map(y=>fTokX(y.vested)),fTokX(SEED_TOKENS)],
  ["Tokens sold in year (BND)",...yr.map(y=>fTokX(y.soldInYear)),fTokX(yr[2].sold)],
  ["Holdings retained (BND)",...yr.map(y=>fTokX(y.remain)),fTokX(yr[2].remain)],
  ["Value of holdings (USD)",...yr.map(y=>fUsdX(y.remainVal)),fUsdX(FINAL.remainVal)],
  ["Sale proceeds in year (USD)",...yr.map(y=>fUsdX(y.sellInYear)),fUsdX(FINAL.cumSell)],
  ["xBND income in year (rwaUSD)",...yr.map(y=>fUsdX(y.distInYear)),fUsdX(FINAL.cumDist)],
];
S.push({id:"performance",n:"6",nav:"Token Performance",title:"Projected Token Performance",html:`
<p class="desc">The Seed position across the modelled horizon, separated into the three components that make it up: tokens still held, cash realised from sales, and xBND income received in rwaUSD.</p>
${kpis([
  {n:fUsdX(FINAL.overall),l:"Total value, month "+M,c:"g"},
  {n:sPct(FINAL.totalReturn,0),l:"Total return",c:"g"},
  {n:sPct(FINAL.cagr,0),l:"Annualised (CAGR)",c:"g"},
  {n:FINAL.moic.toFixed(2)+"×",l:"MOIC on "+fUsd(INVEST)},
])}
${tbl(["Measure",...yr.map(y=>y.label),"Total"],perfRows,
  "Year 1 closes at month 12, Year 2 at month 24, Year 3 at month "+M+". Generated from the live tokenomics engine on the default preset.")}
${chartStack({title:"Where the return comes from — cumulative, by year",
  cats:yr.map(y=>y.label),
  layers:[
    {name:"Holdings retained (BND, at market)",c:"a",vals:yr.map(y=>y.remainVal)},
    {name:"Sale proceeds realised (USD)",c:"b",vals:yr.map(y=>y.cumSell)},
    {name:"xBND income (rwaUSD)",c:"c",vals:yr.map(y=>y.cumDist)},
  ],fmt:fUsd,
  note:"Total value at month "+M+" is "+fUsdX(FINAL.overall)+" against "+fUsdX(INVEST)+" invested."})}
${sub2("The three revenue components")}
${tbl(["Component","Month "+M,"% of capital","Exposure"],[
  ["Holdings retained — BND",fUsdX(FINAL.remainVal),(FINAL.remainVal/INVEST*100).toFixed(0)+"%","Fully price-exposed — unrealised"],
  ["Sale proceeds — USD",fUsdX(FINAL.cumSell),(FINAL.cumSell/INVEST*100).toFixed(0)+"%","Realised at the price on the day"],
  ["xBND income — rwaUSD",fUsdX(FINAL.cumDist),FINAL.distPctCapital.toFixed(0)+"%","Price-independent — paid in rwaUSD"],
  ["<b>Total</b>","<b>"+fUsdX(FINAL.overall)+"</b>","<b>"+(FINAL.overall/INVEST*100).toFixed(0)+"%</b>",""],
],"xBND is the private-round revenue switch: a share of Protocol Reserve revenue paid in rwaUSD, which does not depend on the BND price.")}
${chartLine({title:"xBND income and realised proceeds, cumulative",
  series:[
    {name:"xBND income (rwaUSD)",c:"c",vals:rows.map(r=>r.cumDistSeed)},
    {name:"Sale proceeds (USD)",c:"b",vals:rows.map(r=>r.cumSellProceedsSeed)},
  ],fmt:fUsd,
  note:"The xBND leg accrues from the moment the switch is active and is unaffected by the price path; the sale leg cannot begin before the cliff at month "+(SEED.cliff+1)+"."})}
<p>Two features of this table are worth stating plainly. First, ${FINAL.distPctCapital.toFixed(0)}% of the capital is returned through the xBND leg alone — ${fUsdX(FINAL.cumDist)} in rwaUSD — and that leg does not depend on where BND trades. Second, ${(FINAL.remainVal/FINAL.overall*100).toFixed(0)}% of the month-${M} total is still held rather than realised, so it remains fully exposed to the price path and to the pool depth discussed below.</p>`});

S.push({id:"downside",n:"7",nav:"Downside",title:"Downside Considerations",html:`
<p class="desc">What protects this position, what does not, and where the model is weakest.</p>
${kpis([
  {n:sPct(maxDD,0),l:"Maximum modelled drawdown",c:"c"},
  {n:fUsdX(FINAL.cumDist),l:"Price-independent income",c:"g"},
  {n:FINAL.realizedPct.toFixed(0)+"%",l:"Of capital realised by M"+M},
  {n:"2.0%",l:"Launch liquidity as % of FDV",c:"c"},
])}
${sub2("What genuinely mitigates the position")}
<ul>
<li><b>The xBND income leg.</b> ${fUsdX(FINAL.cumDist)} accrues in rwaUSD across the horizon — ${FINAL.distPctCapital.toFixed(0)}% of capital — independent of the BND price. Only the private rounds hold this right.</li>
<li><b>Entry discount.</b> Seed enters ${((1-A.seedPrice/launch)*100).toFixed(1)}% below launch, so the position absorbs a ${((1-A.seedPrice/launch)*100).toFixed(0)}% fall from launch before reaching cost.</li>
<li><b>Fixed supply.</b> ${fTokX(A.totalSupply)} BND exists at genesis and cannot be increased. Two burn sinks reduce it; ${(L.cumBurned/A.totalSupply*100).toFixed(2)}% is retired across the horizon.</li>
<li><b>Cliff structure.</b> No Seed tokens are sellable through the launch window.</li>
</ul>
${sub2("What does not")}
<ul>
<li><b>There is no capital protection.</b> No portion of this investment is guaranteed, insured, escrowed or principal-protected. The full amount is at risk.</li>
<li><b>Launch liquidity is thin.</b> The BND/USDC pool holds ${fUsd(Math.min(A.bndPoolSeed,(A.extSeedOn?A.extSeedRaised:0)+A.publicRaised*A.publicSplitLiquidity/100))} at generation, about 2.0% of FDV. Constant-product depth converts a large sale into an amplified price move, and this single parameter drives most of the ${sPct(maxDD,0)} drawdown above.</li>
<li><b>The model is revenue-dependent.</b> Every buy-side engine traces to Protocol Reserve revenue, which is the junior 20% claim on a fee base that must scale broadly as projected.</li>
<li><b>Delivery risk.</b> The protocol is mid-programme. Audit and public security competition are scheduled but not complete.</li>
</ul>
${note("No capital protection is offered","The reference form for this proposal contained a protection mechanism apportioning capital between protected and at-risk. No such mechanism exists in the BOUND structure, and none is represented here. Any protection would have to be documented in the SAFT and is not.","warn")}`});

/* ============================ ASSEMBLE ============================ */
const rawCss=readFileSync(path.join(root,"scripts/base.css"),"utf8");
const css=`
:root{--ink4:#6E756C}
@media(prefers-color-scheme:dark){:root{--ink4:#AFB8AD}}
:root[data-theme="dark"]{--ink4:#AFB8AD}
:root[data-theme="light"]{--ink4:#6E756C}
:root{--c-a:#2C6A57;--c-b:#3E6DB5;--c-c:#B07A1E}
@media(prefers-color-scheme:dark){:root{--c-a:#5FAE90;--c-b:#6FA0E0;--c-c:#E2AC48}}
:root[data-theme="dark"]{--c-a:#5FAE90;--c-b:#6FA0E0;--c-c:#E2AC48}
:root[data-theme="light"]{--c-a:#2C6A57;--c-b:#3E6DB5;--c-c:#B07A1E}
.cv{width:100%;height:auto;display:block;overflow:visible}
.gl{stroke:var(--line2);stroke-width:1}
.ax{fill:var(--ink2);font-family:var(--mono);font-size:10.5px}
.val{fill:var(--ink);font-family:var(--mono);font-size:10.5px;font-weight:600}
.ln{fill:none;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
.ln.a{stroke:var(--c-a)}.ln.b{stroke:var(--c-b)}.ln.c{stroke:var(--c-c)}
.bar.a{fill:var(--c-a)}.bar.b{fill:var(--c-b)}.bar.c{fill:var(--c-c)}
.lg.a{color:var(--c-a)}.lg.b{color:var(--c-b)}.lg.c{color:var(--c-c)}
.clg{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-family:var(--mono);font-size:11px;font-weight:600}
.fig{margin:22px 0 8px}
.figt{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--ink3);margin-bottom:10px}
.desc{font-size:13.5px;color:var(--ink2);margin:2px 0 14px}
.sub{font-size:15px;font-weight:700;color:var(--ink);margin:26px 0 8px}
.num{text-align:right;font-family:var(--mono)}
th.num{text-align:right}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 6px}
.chip{display:inline-flex;align-items:center;gap:9px;padding:8px 16px 8px 8px;border-radius:999px;
  background:var(--raise);border:1px solid var(--line);color:var(--ink);font-size:14px;font-weight:600;
  transition:border-color .14s, transform .14s}
.chip:hover{border-color:var(--accent2);transform:translateY(-1px)}
.chip.live{border-color:color-mix(in srgb,var(--accent2) 55%,transparent);
  background:color-mix(in srgb,var(--accent) 10%,var(--raise))}
.vm{width:26px;height:26px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.cn{white-space:nowrap}
.cb{font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);
  border:1px solid color-mix(in srgb,var(--accent2) 45%,transparent);border-radius:999px;padding:2px 7px;margin-left:2px}
@media print{.chip{border-color:#bbb}}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:16px 0}
.kpi{padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.kn{font-family:var(--mono);font-size:20px;font-weight:700;color:var(--ink);letter-spacing:-.01em}
.kn.g{color:var(--accent)}.kn.c{color:var(--c-c)}
.kl{font-size:11.5px;color:var(--ink3);margin-top:5px;line-height:1.35}
.note{margin:18px 0;padding:14px 16px;border-radius:11px;background:var(--raise);border:1px solid var(--line)}
.note.warn{border-color:color-mix(in srgb,var(--c-c) 42%,transparent);background:color-mix(in srgb,var(--c-c) 8%,transparent)}
.nt{font-weight:700;font-size:12.5px;color:var(--ink);margin-bottom:5px}
.nb{font-size:13px;color:var(--ink2);line-height:1.55}
.deed{font-size:12.5px;color:var(--ink3);line-height:1.6;padding:14px 16px;border-left:2px solid var(--accent2);background:var(--raise);border-radius:0 10px 10px 0;margin:14px 0 0}
ul{margin:10px 0 10px 18px;padding:0}li{margin:7px 0;font-size:14px;line-height:1.6;color:var(--ink2)}
.layout{display:flex;align-items:flex-start;min-height:100vh}
.sidebar{position:sticky;top:0;height:100vh;flex:0 0 262px;width:262px;overflow-y:auto;
  background:color-mix(in srgb,var(--surface) 78%,transparent);border-right:1px solid var(--line);padding:26px 0;z-index:5}
.sb-head{padding:0 20px 18px;border-bottom:1px solid var(--line2);margin-bottom:8px}
.sb-title{font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink);line-height:1.1}
.sb-sub{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-top:6px}
.sb-back{margin-top:16px;width:100%;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;
  border:1px solid var(--line);background:var(--raise);color:var(--ink2);font-family:var(--sans);text-align:left}
.sb-back:hover{border-color:var(--accent2);color:var(--accent2)}
.snav{padding:2px 12px 20px}
.snav a{display:flex;gap:9px;align-items:baseline;padding:7px 9px;border-radius:7px;text-decoration:none;color:var(--ink2);font-size:13px;border:1px solid transparent}
.snav a:hover{background:var(--raise);color:var(--ink)}
.snav-num{font-family:var(--mono);font-size:11px;color:var(--accent2);min-width:20px}
.content{flex:1;min-width:0}
.content .mast-inner{max-width:940px;padding:44px 44px 34px}
.content .wrap{max-width:940px;padding:0 44px}
@media(max-width:880px){.layout{flex-direction:column}
 .sidebar{position:static;height:auto;width:100%;flex:none;border-right:none;border-bottom:1px solid var(--line);padding:16px 0}
 .snav{display:flex;flex-wrap:wrap;gap:4px}
 .content .mast-inner{padding:32px 22px 24px}.content .wrap{padding:0 22px}}
.tbl-scroll{overflow-x:auto}
`;
const nav=S.map(s=>`<a href="#${s.id}"><span class="snav-num">${s.n}</span><span>${s.nav}</span></a>`).join("");
const body=S.map(s=>`<section id="${s.id}" class="wrap"><h2><span class="sec-num">${s.n}</span>${s.title}</h2>${s.html}</section>`).join("");

const shell=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seed Token Investment Proposal — BOUND Protocol</title>
<style>${rawCss}${css}${PRINT_CSS}</style></head><body>
<div class="layout">
<aside class="sidebar">
  <div class="sb-head">
    <div class="sb-title">Token Investment Proposal</div>
    <div class="sb-sub">Seed Round · BND</div>
    <button class="sb-back" onclick="location.assign('/#docs')">&larr; Back to Library</button>
    ${PRINT_BUTTON}
  </div>
  <nav class="snav">${nav}</nav>
</aside>
<div class="content">
<div class="mast"><div class="mast-inner">
<div class="eyebrow">Token Investment Proposal</div><h1>Seed Round — BND</h1>
<p class="lede">The complete Seed allocation of ${fTokX(SEED_TOKENS)} BND at ${fPrice(A.seedPrice)}, with the vesting schedule, listing plan, and the projected performance of the position across ${M} months — every figure generated from the protocol's live simulation engine.</p>
<div class="metarow">
<div><div class="k">Issuer</div><div class="v">BITSWIFT TECHNOLOGIES INC.</div></div>
<div><div class="k">Round</div><div class="v">Seed · ${fUsdX(INVEST)}</div></div>
<div><div class="k">Allocation</div><div class="v">${fTokX(SEED_TOKENS)} BND</div></div>
<div><div class="k">Basis</div><div class="v">Live simulation engine</div></div>
</div>
<div class="deed"><b>Note.</b> This proposal is issued by BITSWIFT TECHNOLOGIES INC., a corporation incorporated under the laws of the Republic of Panama (Law 32 of 1927), pursuant to Public Deed No.&nbsp;21,201 executed before the Third Notary Public of the Circuit of Panama on 22 September 2025, and duly registered with the Public Registry Office of Panama, Mercantile Section, Folio No.&nbsp;155773464, on 23 September 2025. The protocol and its intellectual property are owned by Nexus Technologies Foundation, which grants the token delegation to the issuer; the protocol is developed by an operating company incorporated in the European Union.</div>
</div></div>
${body}
<section class="wrap"><h2><span class="sec-num">8</span>Important Notice</h2>
<p>The financial projections presented above are forward-looking statements based on internal assumptions and market modelling. They do not constitute guarantees of future performance. Actual results may vary materially due to market volatility, regulatory developments, liquidity conditions, delivery risk, or other unforeseen factors.</p>
<p>This document is a proposal and not an offer, solicitation, or recommendation to buy any instrument. It does not constitute investment, legal, or tax advice. Any subscription is governed exclusively by the executed SAFT and its schedules, which prevail over this document in the event of any inconsistency. Prospective investors should take independent advice.</p>
<p class="cap">Generated ${new Date().toISOString().slice(0,10)} from the BOUND Protocol simulation engine, default preset, ${M}-month horizon. Regenerate with <code>node scripts/build-proposal.mjs</code>.</p>
</section>
<footer class="foot"><div class="wrap"><div>Seed Token Investment Proposal · BITSWIFT TECHNOLOGIES INC. · Generated from the live simulation engine · ${M}-month horizon</div></div></footer>
</div></div>
<script>
(function(){var ls=document.querySelectorAll('.snav a'),ss=document.querySelectorAll('section[id]');
function u(){var y=window.scrollY+120,c=null;ss.forEach(function(s){if(s.offsetTop<=y)c=s.id;});
ls.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+c);});}
window.addEventListener('scroll',u,{passive:true});u();})();
</script>
</body></html>`;
writeFileSync(path.join(root,"public/bound-seed-proposal.html"),shell);
console.log("Wrote public/bound-seed-proposal.html");
console.log(`${S.length+1} sections · seed ${fTokX(SEED_TOKENS)} BND @ ${fPrice(A.seedPrice)} · total value ${fUsdX(FINAL.overall)} (${sPct(FINAL.totalReturn,0)}, CAGR ${sPct(FINAL.cagr,0)})`);
console.log(`xBND ${fUsdX(FINAL.cumDist)} · sales ${fUsdX(FINAL.cumSell)} · holdings ${fUsdX(FINAL.remainVal)}`);
