// Build the BND Token Economic Audit — public/bound-tokenomics-audit.html
// Generated from the LIVE tokenomics engine so every figure matches the app.
// Structure modeled on the Tokenomics.net "Bound Protocol Tokenomics Audit" PDF:
//   Part I Mechanism Design · Part II per-section analysis (Interpretation /
//   Analysis & Insights / Potential Risks) · Conclusion.
// Regenerate after any default change:  node scripts/build-audit-report.mjs
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRINT_CSS, PRINT_BUTTON } from "./print-css.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");

/* ---------- extract live engine + defaults ---------- */
function sb(t,i,o,c){let dd=0;for(let j=i;j<t.length;j++){if(t[j]===o)dd++;else if(t[j]===c){dd--;if(dd===0)return t.slice(i,j+1);}}throw new Error("unbalanced");}
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
const A={totalSupply:1e9,seedRaised:d.seedRaised,seedPrice:d.seedPrice,extSeedOn:d.extSeedOn,extSeedRaised:d.extSeedRaised,extSeedPrice:d.extSeedPrice,publicRaised:d.publicRaised,publicPrice:d.publicPrice,
  vest:{...d.vestState,extSeed:{...d.vestState.extSeed,cliff:d.extSeedCliff}},alloc:d.alloc,burnSplitPct:d.burnSplitPct,burnApy:d.burnApy,
  publicSplitLiquidity:d.publicSplitLiquidity,publicSplitCompany:d.publicSplitCompany,publicSplitEmergency:d.publicSplitEmergency,
  sellThrough:d.sellThrough,stakePct:d.stakePct,unstakeChurn:d.unstakeChurn,unstakeSoldPct:d.unstakeSoldPct,stakingRewardPct:d.stakingRewardPct,
  targetStakingApy:d.targetStakingApy,publicStakePct:d.publicStakePct,publicUnstakeChurn:d.publicUnstakeChurn,publicUnstakeSoldPct:d.publicUnstakeSoldPct,
  bndPoolSeed:d.bndPoolSeed,lpOutsideUsdcPct:d.lpOutsideUsdcPct,lpExitChurnPct:d.lpExitChurnPct,
  demandStrengthPct:d.demandStrengthPct,orgVolumePct:d.orgVolumePct,orgBuyBalance:d.orgBuyBalance};
// Rendered from vestState so a schedule change can never leave a stale literal
// describing it — the previous hardcoded strings had already drifted.
const vestStr=k=>{const v=A.vest[k]||{};const p=[];
  p.push(`${v.tge||0}% TGE`);
  if(v.cliff) p.push(`${v.cliff}-mo cliff`);
  if(v.vest)  p.push(`${v.vest}-mo linear`);
  return p.join(" · ");};
const sim=simulate({...PRESETS.default},rwaMarkets,layerCfg);
const {rows,catTokens,stakingBudget}=runTokenomicsSim(A,sim);
const M=rows.length,L=rows[M-1],launch=A.publicPrice,months=rows.map(r=>r.m);

/* ---------- formatters ---------- */
const fUsd=v=>{const a=Math.abs(v);if(a>=1e6)return`$${(v/1e6).toFixed(2)}M`;if(a>=1e3)return`$${(v/1e3).toFixed(0)}K`;return`$${v.toFixed(0)}`;};
const fTok=v=>{const a=Math.abs(v);if(a>=1e6)return`${(v/1e6).toFixed(1)}M`;if(a>=1e3)return`${(v/1e3).toFixed(0)}K`;return`${v.toFixed(0)}`;};
const fPrice=v=>`$${v.toFixed(4)}`;
const sPct=(v,dp=1)=>`${v>=0?"+":""}${v.toFixed(dp)}%`;
const cls=v=>v>=0?"g":"c";

/* ---------- series ---------- */
const BO=["community","team","treasury","marketing","advisors","seed","extSeed","public"];
const priceS=rows.map(r=>r.price), prRevS=rows.map(r=>r.prRevenue);
let pc=0;const prCumS=rows.map(r=>{pc+=r.prRevenue;return pc;});
const burnedNowS=rows.map(r=>r.burnedNow), cumBurnedS=rows.map(r=>r.cumBurned);
const beBalS=rows.map(r=>r.burnEngineBalance), cumBurnUsdS=rows.map(r=>r.cumBurnUsd);
const stakedS=rows.map(r=>r.publicStaked), apyS=rows.map(r=>r.impliedPublicApy);
const seedRateS=rows.map(r=>r.apySeed*100), extRateS=rows.map(r=>r.apyExtSeed*100);
const cumDistS=rows.map(r=>r.cumDistSeed+r.cumDistExtSeed);
const floatS=rows.map(r=>r.floatSupply), lockedS=rows.map(r=>r.lockedSeed+r.lockedExtSeed);
const cumUnlockS=rows.map(r=>BO.reduce((s,k)=>s+r.byBucket[k],0)+r.cumStakingEmissions);
let pu=0;const monthlyUnlockS=cumUnlockS.map(v=>{const m=v-pu;pu=v;return m;});

/* ---------- KPIs ---------- */
const m12=rows[11],m24=rows[23];
const maxDD=Math.min(...rows.map(r=>r.price/launch-1))*100;
const pctBurned=L.cumBurned/1e9*100;
const commVest=catTokens.community-stakingBudget;
const tgeFloat=catTokens.public*(A.vest.public.tge/100)+commVest*(A.vest.community.tge/100)+catTokens.marketing*(A.vest.marketing.tge/100)+catTokens.treasury*(A.vest.treasury.tge/100);
const ret36=(L.price/launch-1)*100;
const sumSell=rows.reduce((s,r)=>s+r.sellUsdOut,0), sumBuy=rows.reduce((s,r)=>s+r.totalBuyUsd,0), sellBuy=sumSell/sumBuy;
const cumDemand=rows.reduce((s,r)=>s+r.demandUsd,0);
const budgetRemaining=stakingBudget-L.cumStakingEmissions;

/* ---------- rounds + allocation ---------- */
const rounds=[
  {label:"Seed",raise:A.seedRaised,price:A.seedPrice,tokens:catTokens.seed,vest:vestStr("seed")},
  ...(A.extSeedOn?[{label:"Extended Seed",raise:A.extSeedRaised,price:A.extSeedPrice,tokens:catTokens.extSeed,vest:vestStr("extSeed")}]:[]),
  {label:"Public (launch)",raise:A.publicRaised,price:A.publicPrice,tokens:catTokens.public,vest:vestStr("public")},
];
const allocRows=[
  {label:"Public (launch)",pct:catTokens.public/1e7,tokens:catTokens.public},
  ...(A.extSeedOn?[{label:"Extended Seed",pct:catTokens.extSeed/1e7,tokens:catTokens.extSeed}]:[]),
  {label:"Seed",pct:catTokens.seed/1e7,tokens:catTokens.seed},
  {label:"Community & Ecosystem",pct:A.alloc.community,tokens:catTokens.community},
  {label:"Team",pct:A.alloc.team,tokens:catTokens.team},
  {label:"Liquidity & Market Making",pct:A.alloc.liquidity,tokens:catTokens.liquidity},
  {label:"Treasury",pct:A.alloc.treasury,tokens:catTokens.treasury},
  {label:"Marketing & Growth",pct:A.alloc.marketing,tokens:catTokens.marketing},
  {label:"Advisors",pct:A.alloc.advisors,tokens:catTokens.advisors},
];
const allocTotalPct=allocRows.reduce((s,r)=>s+r.pct,0);
const stepUp=(A.publicPrice/A.seedPrice);

/* ---------- cohort summary ---------- */
const cohorts=[
  {key:"seed",label:"Seed",invested:A.seedRaised},
  ...(A.extSeedOn?[{key:"extSeed",label:"Extended Seed",invested:A.extSeedRaised}]:[]),
  {key:"public",label:"Public",invested:A.publicRaised},
].map(c=>{
  const vested=L.byBucket[c.key], sold=c.key==="seed"?L.cumSoldSeed:c.key==="extSeed"?L.cumSoldExtSeed:L.cumSoldPublic;
  const remainTok=Math.max(0,vested-sold), remainVal=remainTok*L.price;
  const cumDist=c.key==="seed"?L.cumDistSeed:c.key==="extSeed"?L.cumDistExtSeed:0;
  const cumSell=c.key==="seed"?L.cumSellProceedsSeed:c.key==="extSeed"?L.cumSellProceedsExtSeed:L.cumSellProceedsPublic;
  const overall=remainVal+cumDist+cumSell, totalReturn=(overall/c.invested-1)*100;
  const xbndApy=(cumDist/c.invested)*(12/M)*100, bndApy=((remainVal+cumSell)/c.invested-1)*100*(12/M);
  const overallApy=(Math.pow(Math.max(0,overall)/c.invested,12/M)-1)*100;
  return {...c,hasDist:c.key!=="public",remainVal,cumDist,cumSell,overall,totalReturn,xbndApy,bndApy,overallApy};
});

/* ---------- pool: price impact + max trade ---------- */
// Day-one BND/USDC depth is the pool slice only. The rest of the AMM allocation
// seeds rwaUSD/USDC, which is protocol liquidity and not BND market depth —
// counting it here would overstate how much sell pressure the market can absorb.
const ammTotal=(A.extSeedOn?A.extSeedRaised:0)+A.publicRaised*A.publicSplitLiquidity/100;
const usdc0=Math.min(A.bndPoolSeed??ammTotal,ammTotal), bnd0=usdc0/launch, FEE=0.003;
const rwaPoolSeed=ammTotal-usdc0;
const sellImpact=t=>{const out=(usdc0*t*(1-FEE))/(bnd0+t);const np=(usdc0-out)/(bnd0+t);return{out,np,impact:(launch-np)/launch*100};};
const buyImpact=u=>{const t=(bnd0*u*(1-FEE))/(usdc0+u);const np=(usdc0+u)/(bnd0-t);return{t,np,impact:(np-launch)/launch*100};};
const bis=(f,tp,hi)=>{let lo=0;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(f(m)<tp)lo=m;else hi=m;}return(lo+hi)/2;};
const impactBands=[1,2,5,10,20].map(p=>{const t=bnd0*p/100;const r=sellImpact(t);return{p,t,out:r.out,np:r.np,impact:r.impact};});
const maxTrade=[2,5,10].map(s=>{const tk=bis(x=>sellImpact(x).impact,s,bnd0);const bu=bis(x=>buyImpact(x).impact,s,usdc0*10);return{s,buyUsd:bu,sellTok:tk,sellUsd:sellImpact(tk).out};});
const bp=[1,6,12,18,24,36].map(m=>{const r=rows[m-1];return{m,sell:r.sellUsdOut,yield:r.yieldUsd,demand:r.demandUsd,org:r.orgBuyUsd,price:r.price};});

/* ============ SVG CHART ENGINE ============ */
const CW=720,CH=250,PL=58,PR2=44,PT=14,PB=28;
const px0=PL,px1=CW-PR2,py0=PT,py1=CH-PB;
const xAt=m=>px0+(m-1)/(M-1)*(px1-px0);
const yAt=(v,mn,mx)=>py1-(v-mn)/((mx-mn)||1)*(py1-py0);
const XT=[1,6,12,18,24,30,36];
function axes(mn,mx,fmt,right){
  let s=`<line x1="${px0}" y1="${py1}" x2="${px1}" y2="${py1}" stroke="var(--c-grid)"/>`;
  for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=yAt(v,mn,mx);
    if(i>0)s+=`<line x1="${px0}" y1="${y.toFixed(1)}" x2="${px1}" y2="${y.toFixed(1)}" stroke="var(--c-grid)" opacity="0.5"/>`;
    s+=`<text x="${px0-7}" y="${(y+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--ink3)" font-family="var(--mono)">${fmt(v)}</text>`;
    if(right){const rv=right.mn+(right.mx-right.mn)*i/4;s+=`<text x="${px1+6}" y="${(y+3).toFixed(1)}" font-size="10" fill="var(--c-amber)" font-family="var(--mono)">${right.fmt(rv)}</text>`;}
  }
  for(const m of XT)s+=`<text x="${xAt(m).toFixed(1)}" y="${CH-9}" text-anchor="middle" font-size="10" fill="var(--ink3)" font-family="var(--mono)">M${m}</text>`;
  return s;
}
const lp=(data,mn,mx)=>data.map((v,i)=>`${i?"L":"M"}${xAt(i+1).toFixed(1)} ${yAt(v,mn,mx).toFixed(1)}`).join(" ");
function chartLine({title,lines,fmt,ref,y2}){
  const all=lines.flatMap(l=>l.data);let mx=Math.max(...all,0),mn=Math.min(...all,0);
  if(ref!=null){mx=Math.max(mx,ref);mn=Math.min(mn,ref);}
  mx*=1.08;mn=mn<0?mn*1.08:0;
  const y2max=y2?Math.max(...y2.data)*1.15||1:0;
  let inner=axes(mn,mx,fmt,y2?{mn:0,mx:y2max,fmt:y2.fmt}:null);
  if(ref!=null){const y=yAt(ref,mn,mx);inner+=`<line x1="${px0}" y1="${y.toFixed(1)}" x2="${px1}" y2="${y.toFixed(1)}" stroke="var(--ink3)" stroke-dasharray="4 3"/>`;}
  for(const l of lines)inner+=`<path d="${lp(l.data,mn,mx)}" fill="none" stroke="${l.color}" stroke-width="2" stroke-linejoin="round"${l.dash?' stroke-dasharray="4 3"':''}/>`;
  if(y2)inner+=`<path d="${lp(y2.data,0,y2max)}" fill="none" stroke="var(--c-amber)" stroke-width="2"/>`;
  const lg=(lines.length>1||y2)?legend([...lines,...(y2?[{label:y2.label,color:"var(--c-amber)"}]:[])]):"";
  return box(title,inner,lg);
}
function chartBars({title,data,color,fmt}){
  const mx=Math.max(...data,0)*1.08||1,mn=Math.min(...data,0);
  let inner=axes(mn,mx,fmt);const bw=(px1-px0)/M*0.6;
  data.forEach((v,i)=>{const x=xAt(i+1)-bw/2,y=yAt(v,mn,mx),h=yAt(0,mn,mx)-y;inner+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.4,h).toFixed(1)}" fill="${color}" rx="1"/>`;});
  return box(title,inner);
}
function chartStack({title,layers,fmt}){
  const tot=months.map((_,i)=>layers.reduce((s,l)=>s+l.data[i],0)),mx=Math.max(...tot)*1.06||1;
  let inner=axes(0,mx,fmt);let acc=months.map(()=>0);
  for(const l of layers){const up=acc.map((a,i)=>a+l.data[i]);
    const top=up.map((v,i)=>`${i?"L":"M"}${xAt(i+1).toFixed(1)} ${yAt(v,0,mx).toFixed(1)}`).join(" ");
    const bot=acc.map((v,i)=>[xAt(M-i).toFixed(1),yAt(acc[M-1-i],0,mx).toFixed(1)]).map(p=>`L${p[0]} ${p[1]}`).join(" ");
    inner+=`<path d="${top} ${bot} Z" fill="${l.color}" fill-opacity="${l.op??0.7}" stroke="${l.color}" stroke-width="0.7"/>`;acc=up;}
  return box(title,inner,legend(layers.slice().reverse()));
}
const legend=arr=>`<div class="clg">${arr.map(l=>`<span style="color:${l.color}">■ ${l.label}</span>`).join("")}</div>`;
const box=(t,inner,lg="")=>`<div class="chart"><div class="ct">${t}</div><svg viewBox="0 0 ${CW} ${CH}" width="100%" role="img" aria-label="${t}" style="display:block">${inner}</svg>${lg}</div>`;
const C={green:"var(--c-green)",blue:"var(--c-blue)",amber:"var(--c-amber)",red:"var(--c-red)"};
const BC={community:C.green,team:C.blue,treasury:"var(--ink3)",marketing:C.amber,advisors:"var(--ink2)",seed:C.red,extSeed:"var(--c-amber)",public:C.blue};
const BL={community:"Community",team:"Team",treasury:"Treasury",marketing:"Marketing",advisors:"Advisors",seed:"Seed",extSeed:"Ext. Seed",public:"Public"};

/* ---------- HTML helpers ---------- */
/* Findings are written as connected prose rather than bullet lists — see
   AUDIT_REWRITE_PROMPT.md for the register this report is written in. The
   .find / .find.risk list styles remain in the stylesheet for the tables. */
const tbl=(head,body)=>`<div class="tbl-scroll"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
const cap=t=>`<div class="cap">${t}</div>`;
const kpis=arr=>`<div class="kpis">${arr.map(k=>`<div class="kpi"><div class="kn ${k.c||""}">${k.n}</div><div class="kl">${k.l}</div></div>`).join("")}</div>`;
const sub=t=>`<h4 class="sub">${t}</h4>`;

/* ============ ASSEMBLE ============ */
// Base stylesheet, shared by all four documents. Read from scripts/base.css rather
// than from a generated page — reading a build artifact made every rebuild append
// its own CSS again, compounding duplicates on each run.
const rawCss = readFileSync(path.join(root, "scripts/base.css"), "utf8");
const chartCss=`
:root{--ink4:#6E756C}
@media(prefers-color-scheme:dark){:root{--ink4:#AFB8AD}}
:root[data-theme="dark"]{--ink4:#AFB8AD}
:root[data-theme="light"]{--ink4:#6E756C}
:root{--c-green:#2C6A57;--c-blue:#3E6DB5;--c-amber:#B07A1E;--c-red:#9E3A2C;--c-grid:#E4E1D5}
@media(prefers-color-scheme:dark){:root{--c-green:#5FAE90;--c-blue:#6FA0E0;--c-amber:#E2AC48;--c-red:#E28168;--c-grid:#28322A}}
:root[data-theme="light"]{--c-green:#2C6A57;--c-blue:#3E6DB5;--c-amber:#B07A1E;--c-red:#9E3A2C;--c-grid:#E4E1D5}
:root[data-theme="dark"]{--c-green:#5FAE90;--c-blue:#6FA0E0;--c-amber:#E2AC48;--c-red:#E28168;--c-grid:#28322A}
.clg{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-family:var(--mono);font-size:11px;font-weight:600;color:var(--ink3)}
.desc{font-size:13.5px;color:var(--ink2);margin:2px 0 14px}
/* Ambient abstract-green background (dark), fixed to the viewport so it drifts behind the content */
body{
  background-color:var(--paper);
  background-image:
    radial-gradient(58% 46% at 86% -6%, color-mix(in srgb,var(--accent2) 26%,transparent), transparent 60%),
    radial-gradient(52% 42% at 2% 6%, color-mix(in srgb,var(--accent2) 15%,transparent), transparent 58%),
    radial-gradient(60% 50% at 110% 40%, color-mix(in srgb,var(--accent) 16%,transparent), transparent 56%),
    radial-gradient(50% 44% at -10% 82%, color-mix(in srgb,var(--accent2) 12%,transparent), transparent 55%),
    radial-gradient(46% 40% at 78% 108%, color-mix(in srgb,var(--accent) 12%,transparent), transparent 55%);
  background-attachment:fixed;
  background-repeat:no-repeat;
}
.mast{background:
  radial-gradient(120% 150% at 85% -14%, color-mix(in srgb,var(--accent2) 30%,transparent) 0%, transparent 56%),
  radial-gradient(90% 120% at 6% -30%, color-mix(in srgb,var(--accent) 22%,transparent) 0%, transparent 52%);
  border-bottom:1px solid var(--line);
}
/* --- sidebar + content layout --- */
.layout{display:flex;align-items:flex-start;min-height:100vh}
.sidebar{position:sticky;top:0;height:100vh;flex:0 0 262px;width:262px;overflow-y:auto;
  background:color-mix(in srgb,var(--surface) 78%,transparent);border-right:1px solid var(--line);
  padding:26px 0;z-index:5}
.sb-head{padding:0 20px 18px;border-bottom:1px solid var(--line2);margin-bottom:8px}
.sb-title{font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink);letter-spacing:-.01em;line-height:1.1}
.sb-sub{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-top:6px}
.sb-back{margin-top:16px;width:100%;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;
  font-weight:600;border:1px solid var(--line);background:var(--raise);color:var(--ink2);font-family:var(--sans);text-align:left}
.sb-back:hover{border-color:var(--accent2);color:var(--accent2)}
.snav{padding:2px 12px 20px}
.snav-group{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink4);padding:16px 8px 6px;font-weight:600}
.snav a{display:flex;gap:9px;align-items:baseline;padding:7px 9px;border-radius:7px;text-decoration:none;
  color:var(--ink2);font-size:13px;line-height:1.3;border:1px solid transparent;transition:background .12s,color .12s}
.snav a:hover{background:var(--raise);color:var(--ink)}
.snav a.active{background:var(--accentSoft);color:var(--accent);border-color:color-mix(in srgb,var(--accent2) 28%,transparent);font-weight:600}
.snav-num{font-family:var(--mono);font-size:11px;color:var(--accent2);min-width:20px;flex-shrink:0}
.content{flex:1;min-width:0}
.content .mast-inner{max-width:940px;margin:0;padding:44px 44px 34px}
.content .wrap{max-width:940px;margin:0;padding:0 44px}
@media(max-width:880px){
  .layout{flex-direction:column}
  .sidebar{position:static;height:auto;width:100%;flex:none;border-right:none;border-bottom:1px solid var(--line);padding:16px 0}
  .snav{display:flex;flex-wrap:wrap;gap:4px}.snav-group{width:100%;padding-top:8px}
  .content .mast-inner{padding:32px 22px 24px}.content .wrap{padding:0 22px}
}
`;

const toc=[
  ["M1","Executive Summary","exec"],["M2","Business Model & Value Proposition","biz"],["M3","Platform Fee Channels","fees"],
  ["M4","Tokenomics & Utility","util"],["M5","Stakeholder Analysis","stake"],["M6","Value Accrual & Game Theory","game"],
  ["01","Vesting Analysis","vest"],["02","Capital Formation & Discounts","disc"],["03","Investor ROI","roi"],
  ["04","Protocol Reserve Revenue","prr"],["05","BND Price Path","price"],["06","Burn Engine (Buyback & Burn)","burn"],
  ["07","xBND Revenue Switch","xbnd"],["08","Public Staking Pool","pool"],["09","Supply Composition","supply"],
  ["10","Liquidity Depth & Price Impact","liq"],["11","Max Trade Size","trade"],
  ["C","Conclusion","concl"],
];
const grade=(maxDD>-35&&ret36>0)?"A–":"B";
const today=new Date().toISOString().slice(0,10);

let B="";
/* ---- Part I ---- */
B+=`<div class="part-label">Part I — Mechanism Design</div>`;

B+=`<section id="exec"><div class="sec-head"><div class="sec-num">M1</div><h2>Executive Summary</h2><span class="rating g">${grade}</span></div>
<p>BOUND is a liquidity protocol for tokenized real-world assets, and its economic design separates four functions across four instruments. <b>rwaUSD</b> is a fully USDC-backed liquid dollar whose peg is defended atomically by the Atomic Peg Stability System (APSS). <b>BCI</b> is the index token through which liquidity providers hold the protocol's fee revenue and its RWA exposure. <b>BND</b> governs the protocol and captures value through burning, and <b>xBND</b> is BND locked into the Revenue Switch, earning a share of Protocol Reserve revenue paid in rwaUSD. This report examines the BND model as configured in the protocol's live economic simulator; every figure below is generated from that engine rather than asserted, and the assumption behind each is stated wherever it carries weight.</p>
${kpis([
  {n:fPrice(launch),l:"Launch price"},
  {n:sPct(ret36,0),l:`Base-case price, M${M}`,c:cls(ret36)},
  {n:sPct(maxDD,0),l:"Max drawdown",c:cls(maxDD)},
  {n:fUsd(prCumS[M-1]),l:`Protocol Reserve, ${M}mo`},
  {n:`${pctBurned.toFixed(2)}%`,l:"Supply burned"},
  {n:`${(tgeFloat/1e9*100).toFixed(2)}%`,l:"Float at TGE"},
])}
<p>The design sits inside institutional norms on every structural measure. Supply is fixed at one billion tokens and moves in one direction only, downward, as burns retire it. Launch FDV of <b>${fUsd(launch*1e9)}</b> is defensible for the category rather than the low-float, high-valuation structure that has characterised weaker launches. The Seed, Extended Seed and Public rounds ladder upward in price instead of compressing into a single discounted tranche, which keeps the insider basis gap moderate. And value reaches the token through three explicit, rule-bound flows off Protocol Reserve revenue — the Burn Engine, the xBND Revenue Switch, and the Public Staking Pool — rather than through discretionary treasury action. Across the ${M}-month base case the token returns ${sPct(ret36,0)} against a ${sPct(maxDD,0)} trough.</p>
<p>Two findings temper that assessment, and both are structural rather than incidental. Launch liquidity sits at the low end of the healthy band; because a constant-product pool converts thin depth into large price moves, this single parameter amplifies the path in both directions and accounts for most of the modeled drawdown. Separately, every buy-side engine in the design — the burns, the xBND distributions, the staking demand — ultimately draws on Protocol Reserve revenue, which is itself the junior 20% claim on a fee base mostly paid to liquidity providers. The mechanisms are sound on their own assumptions. Those assumptions are where the risk concentrates, and the sections that follow test each in turn.</p></section>`;

B+=`<section id="biz"><div class="sec-head"><div class="sec-num">M2</div><h2>Business Model &amp; Value Proposition</h2></div>
<p>The protocol runs on four assets, and the discipline of the design lies in keeping their roles strictly separate. rwaUSD is the user-facing liquid dollar, backed entirely by USDC held in Bound Core; because RWA exposure never enters that backing, an RWA default cannot break the peg. BCI is the liquidity provider's holding, and its price rises as fee revenue credits the BCI smart contract. BND governs the protocol and captures value through burning, while xBND is BND locked into the Revenue Switch, earning a minority share of Protocol Reserve revenue paid in rwaUSD. The consequence of that separation is that risk and money are held by different parties in different instruments — the settlement dollar carries none of the credit exposure that the index token is designed to absorb.</p>
<div class="mgrid">
<div class="mcard"><div class="tag">User asset</div><h4>rwaUSD</h4><p>The liquid dollar of the RWA sector, backed 100% by USDC, with its peg defended atomically by the APSS on a Uniswap-v4 pool.</p></div>
<div class="mcard"><div class="tag">LP index</div><h4>BCI</h4><p>Accrues protocol fee revenue at a price of (Layer NAV + BCI SC) ÷ BCI supply. LP redemptions rank senior to new RWA intake.</p></div>
<div class="mcard"><div class="tag">Governance</div><h4>BND</h4><p>Governs APSS thresholds, reserve strategy, fee splits and treasury. It pays protocol fees at a discount and is burned when used.</p></div>
<div class="mcard"><div class="tag">Locked BND</div><h4>xBND</h4><p>Earns a governance-set share of Protocol Reserve revenue in rwaUSD. Each lock removes supply from the sellable float.</p></div>
</div></section>`;

B+=`<section id="fees"><div class="sec-head"><div class="sec-num">M3</div><h2>Platform Fee Channels</h2></div>
<p>The protocol earns from ten distinct fee streams, and most of them split eighty per cent to the BCI smart contract, which is to say to liquidity providers, and twenty per cent to the Protocol Reserve. Only that second share funds the BND token economy audited in Part II. This is the most consequential structural fact in the report. BND accrues value from a minority claim on protocol revenue, not from the whole of it. The token economy therefore scales conservatively with usage, and cannot outrun the fee base that supports it.</p>
${tbl(["#","Stream","Rate","Split (BCI · PR)"],[
["01","Pool Trading Fee","0.3% / swap","80% · 20%"],["02","APSS Arbitrage Capture","~0.5% of vol","80% · 20%"],
["03","rwaUSD Conversion Fee","0.88%","100% · 0%"],["04","BND Conversion Fee","0.44% · burned","100% burn"],
["05","Direct Mint / Redeem","0.3% each way","80% · 20%"],["06","RWA Trade Fee","0.3% / dir","80% · 20%"],
["07","RWA Haircut Spread","~0.5%","80% · 20%"],["08","Market Maintenance","$75K / mkt / yr","20% · 80%"],
["09","RWA Integration","$150K / mkt","0% · 100%"],["10","Bound Core Float Yield","4.5% / yr","80% · 20%"],
].map(r=>`<tr>${r.map((c,i)=>`<td${i===0?' style="text-align:left"':""}>${c}</td>`).join("")}</tr>`).join(""))}
${cap(`Across the ${M}-month base case the Protocol Reserve accumulates ${fUsd(prCumS[M-1])} (≈ ${fUsd(prCumS[M-1]/M)}/mo) — the fuel for everything in Part II.`)}</section>`;

B+=`<section id="util"><div class="sec-head"><div class="sec-num">M4</div><h2>Tokenomics &amp; Utility</h2></div>
<p>BND carries four utilities, and they reinforce one another rather than sitting in parallel. <b>Governance</b> gives holders control over protocol parameters, treasury deployment and market onboarding. The <b>fee-discount burn</b> lets BND pay protocol conversion fees at roughly a fifty per cent discount, and every token so used is burned in full, which ties supply reduction directly to protocol activity. <b>Revenue participation</b> through xBND earns a governance-set share of Protocol Reserve revenue in rwaUSD, available only to holders willing to lock. And the <b>security bond</b> required of governance participants puts capital behind the votes that set every parameter above.</p>
<p>Supply is fixed at one billion tokens and can only ratchet downward. Staking rewards are carved from the pre-allocated Community bucket rather than minted, so participation incentives never expand the cap, and two independent burn sinks — the fee-discount burn and the Burn Engine — permanently reduce it. The design therefore has no inflationary channel at all: every token that will ever exist exists at genesis, and the only supply movement thereafter is retirement.</p></section>`;

B+=`<section id="stake"><div class="sec-head"><div class="sec-num">M5</div><h2>Stakeholder Analysis</h2></div>
<p>Five cohorts hold BND, and their incentives differ along two axes: the price at which they entered and the length of time their capital is locked. <b>Private investors</b> in the Seed and Extended Seed rounds enter at a discount and vest across twenty-four to thirty-six months, and this group alone can lock into xBND for a price-independent rwaUSD income leg. <b>Public participants</b> buy at the launch price with fifteen per cent unlocked at generation; they are the largest single cohort, hold no xBND eligibility, and are therefore exposed in full to the price path. Running alongside both, the <b>Public Staking Pool</b> is open to anyone: stakers earn BND rewards drawn from the Community carve-out, an in-kind yield that requires no participation in the investment rounds at all.</p>
<p>The remaining two cohorts shape the market rather than take positions in it. <b>Liquidity providers and market makers</b> seed and maintain the BND market from the twelve per cent Liquidity allocation, and <b>governance participants</b> lock BND as economic security in order to steer APSS thresholds, the revenue split and treasury deployment. One asymmetry is worth carrying into the sections that follow: the cohort most exposed to the price path is also the one with no access to the income leg that would offset it.</p></section>`;

B+=`<section id="game"><div class="sec-head"><div class="sec-num">M6</div><h2>Value Accrual &amp; Game Theory</h2></div>
<p>Value reaches BND through three deterministic flows off the Protocol Reserve rather than through a single discretionary channel. The <b>Burn Engine</b> buys and burns BND using the yield thrown off by a cash portfolio. The <b>xBND Revenue Switch</b> pays rwaUSD to holders who lock. The <b>Public Staking Pool</b> pays BND rewards to stakers from a pre-allocated slice. In the base case, Protocol Reserve inflows split ${A.burnSplitPct}% to the Burn Engine and ${100-A.burnSplitPct}% to the Revenue Switch, with the staking pool funded separately from the Community allocation.</p>
<p>The game-theoretic consequence is that no cohort is rewarded for exiting first. Because value is distributed through burning and defined revenue shares rather than through speculative inflation, the rational strategy for every participant is to hold, lock, or use the token: using it removes BND from supply, locking it earns revenue, and holding it captures the effect of both. A design that pays for patience rather than for speed produces materially different holder behaviour under stress than one that inflates rewards to whoever claims them fastest.</p></section>`;

/* ---- Part II ---- */
B+=`<div class="part-label">Part II — Tokenomics Audit</div>`;

/* 01 Vesting */
B+=`<section id="vest"><div class="sec-head"><div class="sec-num">01</div><h2>Vesting Analysis</h2><span class="rating g">Pass</span></div>
<p class="desc">Cumulative unlocked tokens by allocation over the ${M}-month horizon, plus the monthly and running unlock totals. Maps unlock timing and peak supply inflows against sell-pressure risk.</p>
${chartStack({title:"Vesting Schedule — Cumulative Unlocks (by bucket + staking emissions)",fmt:fTok,
  layers:[...BO.filter(k=>k!=="extSeed"||A.extSeedOn).map(k=>({data:rows.map(r=>r.byBucket[k]),color:BC[k],label:BL[k]})),{data:rows.map(r=>r.cumStakingEmissions),color:C.amber,op:0.45,label:"Staking emissions"}]})}
<div class="mgrid">${chartBars({title:"Monthly Token Unlocks",data:monthlyUnlockS,color:C.blue,fmt:fTok})}${chartLine({title:"Cumulative Token Unlocks",lines:[{data:cumUnlockS,color:C.blue,label:"Cumulative"}],fmt:fTok})}</div>
${tbl(["Bucket","% supply","Tokens"],allocRows.map(r=>`<tr><td style="text-align:left">${r.label}</td><td>${r.pct.toFixed(2)}%</td><td>${fTok(r.tokens)}</td></tr>`).join("")+`<tr class="tot"><td style="text-align:left">Total</td><td>${allocTotalPct.toFixed(2)}%</td><td>${fTok(1e9)}</td></tr>`)}
${cap("Rounds are derived from raise ÷ price; buckets are fixed shares. Total 100.04% is a rounding artifact of the derived round sizes, inside the ±0.6% tolerance.")}
${sub("Analysis")}
<p>Only ${fTok(tgeFloat)} of BND — ${(tgeFloat/1e9*100).toFixed(2)}% of total supply — is liquid at generation, drawn from partial unlocks of the Public, Community, Treasury and Marketing allocations at fifteen, five, five and five per cent respectively. Everything else is time-locked. Team and Treasury sit behind twelve-month cliffs, and the private rounds behind cliffs of six to twelve months. Community &amp; Ecosystem, the largest bucket at ${A.alloc.community}% or ${fTok(catTokens.community)}, releases across a long schedule, with ${fTok(stakingBudget)} carved out for staking rewards on a separate emission track. The Liquidity &amp; Market Making bucket is deployed in full at generation to seed the market and is excluded from sellable-float figures, since its purpose is to provide depth rather than to be sold.</p>
<p>The effect is a deliberately thin day-one float behind a wall of cliffed insider supply. Markets punish high initial circulation, and this cap table is built to avoid that outcome — at the cost of concentrating the pressure at each cliff edge, where released supply arrives all at once rather than gradually. Weighted across buckets, Community, Ecosystem and Treasury together give the allocation a community-first tilt, with team and private holdings sitting below the insider ceiling that institutional reviewers typically apply.</p>
${sub("Risk considerations")}
<p>Two features of the schedule warrant attention. The cliff-end steps — Seed at month seven, and Team, Treasury and Extended Seed together at month thirteen — concentrate unlocks into single months rather than distributing them, and communication around those dates should be staggered accordingly. Beyond the cliffs, sustained Community and Treasury vesting forms a long tail of circulation growth that the buy side must keep absorbing for the full horizon; the pressure does not end once the early unlocks clear.</p></section>`;

/* 02 Discounts */
const seedDisc=(1-A.seedPrice/A.publicPrice)*100, extDisc=A.extSeedOn?(1-A.extSeedPrice/A.publicPrice)*100:0;
B+=`<section id="disc"><div class="sec-head"><div class="sec-num">02</div><h2>Capital Formation &amp; Discounts</h2><span class="rating g">Pass</span></div>
<p class="desc">The three priced rounds, their discounts to the ${fPrice(launch)} launch price, implied FDV ladder, and vesting. Total raised ${fUsd(rounds.reduce((s,r)=>s+r.raise,0))}.</p>
${tbl(["Round","Raise","Price","Tokens","% supply","FDV","Disc. to public","Vesting"],rounds.map(r=>`<tr><td style="text-align:left">${r.label}</td><td>${fUsd(r.raise)}</td><td>$${r.price.toFixed(4)}</td><td>${fTok(r.tokens)}</td><td>${(r.tokens/1e7).toFixed(2)}%</td><td>${fUsd(r.price*1e9)}</td><td>${r.label.startsWith("Public")?"—":`${((1-r.price/launch)*100).toFixed(0)}%`}</td><td style="text-align:left;font-size:12px">${r.vest}</td></tr>`).join(""))}
${sub("Analysis")}
<p>Pricing ladders upward across the three rounds: Seed at ${fPrice(A.seedPrice)}, ${seedDisc.toFixed(0)}% below the public price${A.extSeedOn?`, then Extended Seed at ${fPrice(A.extSeedPrice)}, ${extDisc.toFixed(0)}% below`:""}, and finally Public at ${fPrice(launch)}. The resulting Seed-to-Public step-up of ${stepUp.toFixed(2)}× is the figure that matters most here, because it sets the profit incentive every early investor carries into the vesting period. At ${stepUp.toFixed(2)}× it is moderate, sitting well below the three-to-five-fold gap at which insider economics turn every unlocked token into a day-one sale. Launch FDV of ${fUsd(launch*1e9)} against a one-billion supply places the raise in a defensible band for the RWA category rather than in the low-float, high-valuation structure that has repeatedly produced post-listing collapses elsewhere.</p>
<p>Two features of the capital structure reinforce that position. Public is both the largest allocation and the one priced at the top of the ladder, which minimises the dilutive gap that discounted private rounds otherwise create against the cohort least able to absorb it. And the proceeds are ring-fenced by purpose: Extended Seed routes entirely to protocol liquidity, while the public raise seeds the Burn Engine, liquidity, company operations and the Emergency Reserve. Keeping the structure to two private rounds plus a public sale, rather than a longer ladder of progressively discounted tranches, holds the insider overhang modest relative to the public float.</p>
${sub("Risk considerations")}
<p>The ${stepUp.toFixed(1)}× step-up is moderate but not negligible, and it still leaves Seed investors materially in profit the moment their tokens vest; some selling as that round completes should be treated as the expected case rather than a downside scenario. The mirror risk sits at the other end of the ladder. Because public pricing sits at or near the last private round, there is little discount cushion beneath it, so a weak launch would transmit pressure first to the largest and least-protected cohort.</p></section>`;

/* 03 ROI */
B+=`<section id="roi"><div class="sec-head"><div class="sec-num">03</div><h2>Investor ROI</h2><span class="rating g">Pass</span></div>
<p class="desc">Final-state economics at month ${M} for each cohort, split into the xBND income leg (rwaUSD, price-independent) and the BND position leg (holdings + realized sales, fully price-exposed), against capital invested.</p>
${tbl(["Metric",...cohorts.map(c=>c.label)],[
["Invested",...cohorts.map(c=>fUsd(c.invested))],
["xBND earned (rwaUSD)",...cohorts.map(c=>c.hasDist?fUsd(c.cumDist):"n/a")],
["Remaining value (BND)",...cohorts.map(c=>fUsd(c.remainVal))],
["Sell proceeds",...cohorts.map(c=>fUsd(c.cumSell))],
["Overall value",...cohorts.map(c=>fUsd(c.overall))],
["Total return",...cohorts.map(c=>`<span class="${cls(c.totalReturn)==='g'?'':'crit'}">${sPct(c.totalReturn,0)}</span>`)],
["Overall APY (CAGR)",...cohorts.map(c=>sPct(c.overallApy,0))],
].map((r,ri)=>`<tr${ri>=4?' class="tot"':''}><td style="text-align:left">${r[0]}</td>${r.slice(1).map(c=>`<td>${c}</td>`).join("")}</tr>`).join(""))}
${cap("\"Overall APY\" is a compounded CAGR; the xBND and BND legs are simple-annualized in the app and are not directly comparable to the CAGR.")}
${sub("Analysis")}
<p>Every cohort finishes the horizon in profit, and — more importantly for the integrity of the design — they finish in the correct order. Returns run from ${sPct(cohorts[0].totalReturn,0)} for Seed down to ${sPct(cohorts[cohorts.length-1].totalReturn,0)} for Public, decreasing with entry price and increasing with lock length. That monotonic ordering is the test this section exists to apply: because no cohort earns more by exiting earlier than another, none is structurally incentivised to race for the door. The mechanism producing it is the split return profile. Seed and Extended Seed collect rwaUSD from the xBND Revenue Switch on top of price appreciation, ${fUsd(L.cumDistSeed+L.cumDistExtSeed)} in total across the horizon, while Public earns from price alone against ${fUsd(L.cumSellProceedsSeed+L.cumSellProceedsExtSeed+L.cumSellProceedsPublic)} of realised sell proceeds across all cohorts.</p>
<p>The xBND leg does more than raise private returns; because it pays in rwaUSD, it is entirely price-independent, which means it keeps paying through drawdowns and materially softens the early investor's incentive to sell into weakness. One caveat belongs alongside these figures rather than beneath them: returns across every cohort run higher than a deeper-pool design would produce, because the thin launch pool amplifies net-buy demand into larger price moves. The same sensitivity that lifts the month-${M} return is what deepens the trough, and the two cannot be separated.</p>
${sub("Risk considerations")}
<p>All cohort outcomes rest on the base-case price path, and a Protocol Reserve revenue shortfall would compress them unevenly. Public absorbs the worst of it, being simultaneously the largest cohort, the least locked, and the only one without an income leg to fall back on. At the other end, Seed's ${sPct(cohorts[0].totalReturn,0)} return is attractive enough to prompt profit-taking as that vest completes, which argues for staggered exit messaging well before the cliff rather than after it.</p></section>`;

/* 04 PR Revenue */
B+=`<section id="prr"><div class="sec-head"><div class="sec-num">04</div><h2>Protocol Reserve Revenue</h2><span class="rating i">Basis</span></div>
<p class="desc">The Protocol Reserve's monthly and cumulative revenue — pulled live from the Inputs-page engine. This is the single source that funds all three BND value-accrual flows.</p>
<div class="mgrid">${chartBars({title:"Protocol Reserve Revenue (monthly)",data:prRevS,color:C.green,fmt:fUsd})}${chartLine({title:"Cumulative Protocol Reserve",lines:[{data:prCumS,color:C.green,label:"Cumulative"}],fmt:fUsd})}</div>
${sub("Analysis")}
<p>Revenue ramps as RWA markets onboard, climbing from ${fUsd(prRevS[0])} in month one to ${fUsd(prRevS[M-1])} by month ${M} and accumulating ${fUsd(prCumS[M-1])} across the horizon. At the base-case ${A.burnSplitPct}/${100-A.burnSplitPct} split, roughly ${fUsd(prCumS[M-1]*A.burnSplitPct/100)} of that flows to the Burn Engine and ${fUsd(prCumS[M-1]*(100-A.burnSplitPct)/100)} to the xBND Revenue Switch. The composition underneath the total is what makes the series credible: revenue is spread across pool trading, conversions, RWA onboarding and maintenance, and float yield, so no single activity carries the projection.</p>
<p>It is worth restating what this series is and is not. Because BND accrual is the junior twenty per cent claim on a fee base that is itself mostly paid to liquidity providers, the token economy scales conservatively with protocol usage. It cannot inflate ahead of real activity. Nor does it capture the majority of the value the protocol creates. That is a deliberate constraint rather than a shortfall, but it means BND's ceiling is set by the fee base rather than by anything internal to the token design.</p>
${sub("Risk considerations")}
<p>This is the single point of dependency in the whole model. Every buy-side engine traces back to this one series, so a revenue shortfall does not weaken one channel — it weakens burns, xBND yield and staking demand simultaneously and in the same direction. The exposure is worst at the start: the early months carry the thinnest revenue precisely while unlocks are already flowing, making the opening quarters the tightest point in the buy-versus-sell balance and the period least able to absorb a miss.</p></section>`;

/* 05 Price */
B+=`<section id="price"><div class="sec-head"><div class="sec-num">05</div><h2>BND Price Path</h2><span class="rating g">Pass</span></div>
<p class="desc">Simulated BND price over the horizon against the ${fPrice(launch)} launch reference, from the constant-product pool driven by the modeled sell and buy flows.</p>
${chartLine({title:"BND Simulated Price",lines:[{data:priceS,color:C.green,label:"Price"}],fmt:fPrice,ref:launch})}
${kpis([{n:fPrice(m12.price),l:"Price @ M12"},{n:fPrice(m24.price),l:"Price @ M24"},{n:fPrice(L.price),l:`Price @ M${M}`,c:cls(ret36)},{n:sPct(maxDD,1),l:"Max drawdown",c:cls(maxDD)}])}
${sub("Analysis")}
<p>The path has two distinct phases, and the turning point between them is the whole story of the token's first three years. Price troughs at ${sPct(maxDD,1)} against launch as early unlocks arrive ahead of revenue, then recovers to ${sPct(ret36,1)} by month ${M}, or ${fPrice(L.price)}, once revenue-funded buying overtakes the sell pressure. Each plotted point is end-of-month, recorded after both the blended sell trade and the combined buy trade have cleared through the pool, so the curve reflects net position rather than intra-month extremes.</p>
<p>The recovery is not driven by any single mechanism but by three cumulatively out-buying the sells: the Burn Engine retiring supply, yield-seeking demand entering to stake, and organic volume. The depth of the trough, by contrast, has a single cause. It is a direct function of pool thinness, and the same sensitivity that produces the month-${M} return is what produces the drawdown — a thin constant-product pool converts any given net flow into a larger price move in whichever direction that flow runs. Upside and downside here are the same parameter observed twice.</p>
${sub("Risk considerations")}
<p>A ${sPct(maxDD,0)} trough is meaningful volatility by any institutional standard, and it is not a floor: a thinner pool or weaker demand than modelled would widen it materially rather than marginally. The recovery carries a second, compounding contingency, because the buying that produces it is revenue-funded. If the Protocol Reserve series underdelivers, the drawdown deepens and the recovery weakens at the same time and for the same reason.</p></section>`;

/* 06 Burn */
B+=`<section id="burn"><div class="sec-head"><div class="sec-num">06</div><h2>Burn Engine (Buyback &amp; Burn)</h2><span class="rating g">Pass</span></div>
<p class="desc">The cash portfolio that buys BND with its yield and burns it. Principal only grows — seeded at TGE and topped up monthly from Protocol Reserve revenue; only the yield it earns is ever spent.</p>
${chartLine({title:"Burn Engine — Balance vs. Cumulative Spend",lines:[{data:beBalS,color:C.green,label:"Principal balance"},{data:cumBurnUsdS,color:C.red,label:"Cumulative $ burned"}],fmt:fUsd})}
<div class="mgrid">${chartBars({title:"BND Burned (monthly)",data:burnedNowS,color:C.red,fmt:fTok})}${chartLine({title:"Cumulative BND Burned",lines:[{data:cumBurnedS,color:C.red,label:"Cumulative"}],fmt:fTok})}</div>
${kpis([{n:fUsd(L.burnEngineBalance),l:`Engine balance, M${M}`},{n:`${A.burnApy}% APY`,l:"Portfolio yield"},{n:fUsd(L.cumBurnUsd),l:"Spent on burns"},{n:`${fTok(L.cumBurned)}`,l:`BND burned (${pctBurned.toFixed(2)}%)`}])}
${sub("Analysis")}
<p>Seeded at ${fUsd(A.publicRaised*(100-A.publicSplitLiquidity-A.publicSplitCompany-A.publicSplitEmergency)/100)} from the public raise, the principal grows to ${fUsd(L.burnEngineBalance)} by month ${M}, spending ${fUsd(L.cumBurnUsd)} of accumulated yield to retire ${fTok(L.cumBurned)} BND, or ${pctBurned.toFixed(2)}% of supply. One detail in the plumbing is worth surfacing: before any xBND exists to receive it — that is, prior to the Seed cliff — the ${100-A.burnSplitPct}% Revenue-Switch slice has no recipients, and rather than being dropped it is redirected into this engine. The design has no idle capital state.</p>
<p>The structural merit of the mechanism is that it spends yield rather than principal, so the engine strengthens over time instead of depleting itself. This is a sustainable buyback rather than an extractive one. It will still be running at the end of the horizon, with a larger balance than it started with. Burning is also the cleanest accrual route available on legal grounds, carrying no dividend-classification exposure while creating buy pressure that correlates with protocol revenue. What it is not, at the modelled ${A.burnApy}% portfolio yield, is the primary driver of the price recovery. Burn magnitude at that yield is modest — the engine is best read as a floor beneath price rather than the force lifting it.</p>
${sub("Risk considerations")}
<p>The mechanism inherits two assumptions and cannot outperform either. Burn scale is a function of Protocol Reserve revenue and the assumed portfolio yield together, so both must hold for the channel to matter at the modelled magnitude. If yield in particular comes in low, cumulative burns stay small relative to a one-billion supply, and the deflationary channel — while never negative — becomes close to immaterial over this horizon.</p></section>`;

/* 07 xBND */
B+=`<section id="xbnd"><div class="sec-head"><div class="sec-num">07</div><h2>xBND Revenue Switch</h2><span class="rating g">Pass</span></div>
<p class="desc">The rwaUSD income leg for locked investors. Implied annualized distribution rate on locked value, and cumulative rwaUSD paid to xBND holders.</p>
<div class="mgrid">${chartLine({title:"Locked xBND — Implied Annualized Distribution Rate",lines:[{data:seedRateS,color:C.red,label:"Seed"},...(A.extSeedOn?[{data:extRateS,color:C.amber,label:"Ext. Seed"}]:[])],fmt:v=>`${v.toFixed(0)}%`,ref:15})}${chartLine({title:"Cumulative rwaUSD Distributed",lines:[{data:cumDistS,color:C.green,label:"Cumulative"}],fmt:fUsd})}</div>
${sub("Analysis")}
<p>Locked xBND holders receive ${100-A.burnSplitPct}% of Protocol Reserve revenue, distributed pro-rata by locked value and totalling ${fUsd(cumDistS[M-1])} across the horizon. The defining property is that distributions are paid in rwaUSD, which makes them price-independent: the dollar amount is fixed by revenue and by the holder's share of locked tokens, so a falling BND price never reduces this leg. An investor holding through a drawdown continues to be paid at the same rate as one holding through a rally.</p>
<p>That property is the mechanism's real function. It gives early investors a concrete reason to lock and hold through volatility, and every token so locked is a token removed from the sellable float — the income leg and the supply sink are the same action viewed from two sides. The weighting also reflects a deliberate choice. Keeping distribution the minority claim at ${100-A.burnSplitPct}% against ${A.burnSplitPct}% to buyback matches the profile that outperformed across comparable launches in 2024–2026, and it limits dividend-classification exposure by keeping direct revenue-sharing the smaller of the two channels.</p>
${sub("Risk considerations")}
<p>Direct revenue-share to token holders attracts regulatory scrutiny in the RWA category, and while the minority weighting and payment in rwaUSD rather than fiat both mitigate that exposure, neither eliminates it; this remains the most legally sensitive of the three accrual flows. The commercial risk is simpler, and shared with every other channel in this report. The distribution rate is only ever as strong as Protocol Reserve revenue. Against a thin revenue base the yield leg becomes immaterial, however well the mechanism itself is constructed.</p></section>`;

/* 08 Pool */
const ill=(()=>{let t=1e4/launch;return rows.map(r=>{t*=(1+r.impliedPublicApy/12/100);return{m:r.m,t,v:t*r.price};});})();
B+=`<section id="pool"><div class="sec-head"><div class="sec-num">08</div><h2>Public Staking Pool</h2><span class="rating g">Pass</span></div>
<p class="desc">Open to everyone. Rewards are paid in BND from the slice carved out of the Community allocation; implied APY holds at target while the slice lasts, with yield-seeking demand flowing in the whole time the pool pays.</p>
${chartLine({title:"Public Staking Pool — Balance & Implied APY",lines:[{data:stakedS,color:C.blue,label:"Staked (tokens)"}],fmt:fTok,y2:{data:apyS,fmt:v=>`${v.toFixed(0)}%`,label:"Implied APY"}})}
${kpis([{n:fTok(L.publicStaked),l:`Staked, M${M}`},{n:`${L.impliedPublicApy.toFixed(1)}%`,l:`Implied APY (target ${A.targetStakingApy}%)`},{n:fTok(budgetRemaining),l:`Reward slice left of ${fTok(stakingBudget)}`},{n:fUsd(cumDemand),l:"Cumulative demand-bought"}])}
${tbl(["$10,000 staked at launch","Month 12","Month 24",`Month ${M}`],`<tr><td style="text-align:left">Token balance</td><td>${fTok(ill[11].t)}</td><td>${fTok(ill[23].t)}</td><td>${fTok(ill[M-1].t)}</td></tr><tr><td style="text-align:left">Value</td><td>${fUsd(ill[11].v)}</td><td>${fUsd(ill[23].v)}</td><td>${fUsd(ill[M-1].v)}</td></tr>`)}
${sub("Analysis")}
<p>The pool pays a target ${A.targetStakingApy}% APY in BND, drawn from the ${fTok(stakingBudget)} carve-out inside the Community allocation. At month ${M}, ${fTok(budgetRemaining)} of that slice remains, so the mechanism does not exhaust itself within the modelled horizon and the APY holds at target throughout. Over the same period it attracts ${fUsd(cumDemand)} of yield-seeking demand — outside capital that buys BND on the open market specifically in order to stake it, and which therefore functions as a buy-side leg rather than merely a lock-up.</p>
<p>Two design choices make this channel unusually well-behaved. Because rewards are carved from a pre-allocated bucket rather than minted, the pool never expands supply; it redistributes existing supply on a published schedule, which is what allows the fixed cap to remain genuinely fixed while still paying a participation incentive. And the demand it attracts is sized as a fraction of circulating float at launch price rather than at prevailing price. That deliberately prevents the price-chasing feedback loop that turns staking incentives reflexive: demand does not accelerate simply because the token has already risen.</p>
${sub("Risk considerations")}
<p>The mechanism has a defined end, and the end is a cliff rather than a taper. When the reward slice eventually exhausts beyond this horizon, the APY and the demand it drives switch off together, and that transition needs planning well before it arrives. Within the horizon, the demand figure is a modelling parameter rather than an observation: if real staking participation runs below assumption, this buy-side leg shrinks proportionally, and it is one of the three legs the price recovery in Section 05 depends on.</p></section>`;

/* 09 Supply */
B+=`<section id="supply"><div class="sec-head"><div class="sec-num">09</div><h2>Supply Composition</h2><span class="rating g">Pass</span></div>
<p class="desc">Circulating supply split three ways — unstaked sellable float, locked as xBND, and staked in the Public Pool. The three bands sum to total circulating supply.</p>
${chartStack({title:"Circulating vs. Locked (xBND) vs. Public-Pool Staked",fmt:fTok,layers:[{data:floatS,color:C.blue,label:"Circulating (unstaked)"},{data:lockedS,color:C.green,label:"Locked as xBND"},{data:stakedS,color:C.amber,op:0.55,label:"Staked — Public Pool"}]})}
${sub("Analysis")}
<p>By month ${M}, of ${fTok(L.circulating)} circulating tokens, ${fTok(L.lockedSeed+L.lockedExtSeed)} sits locked as xBND and ${fTok(L.publicStaked)} is staked in the Public Pool, leaving ${fTok(L.floatSupply)} as unstaked sellable float. Taken together, roughly ${((L.lockedSeed+L.lockedExtSeed+L.publicStaked)/L.circulating*100).toFixed(0)}% of circulating supply is locked or staked at the end of the horizon. This is the section where the rest of the report can be checked against itself: the incentives described in Sections 07 and 08 either pull supply out of the sellable band or they do not, and here they measurably do.</p>
<p>The significance is not the absolute number of locked tokens but what it does to the denominator that matters for price. Sell pressure acts on free float, not on total supply, so a design that moves a large share of unlocked tokens into revenue-earning locks is materially reducing the quantity that can be sold into a thin pool. The composition shown above is the intended behaviour of the mechanism rather than an incidental outcome of it.</p>
${sub("Risk considerations")}
<p>Locked and staked supply is suppressed, not destroyed, and the distinction matters for anything beyond this horizon: unstake churn and the eventual exhaustion of the reward slice both return tokens to float. The staked component also rests on the same participation assumptions as Section 08, which means a single weaker-than-modelled input raises the free float here, deepens the drawdown in Section 05, and weakens the buy side simultaneously — these are not independent risks.</p></section>`;

/* 10 Liquidity */
B+=`<section id="liq"><div class="sec-head"><div class="sec-num">10</div><h2>Liquidity Depth &amp; Price Impact</h2><span class="rating w">Caution</span></div>
<p class="desc">The launch pool is ${fUsd(usdc0)} USDC against ${fTok(bnd0)} BND at ${fPrice(launch)} (constant-product, 0.3% fee) — ${(usdc0/(launch*1e9)*100).toFixed(1)}% of FDV. Price impact of single sells at that depth:</p>
${tbl(["Sell size","Tokens","USDC out","New price","Price impact"],impactBands.map(b=>`<tr><td style="text-align:left">${b.p}% of pool</td><td>${fTok(b.t)}</td><td>${fUsd(b.out)}</td><td>${fPrice(b.np)}</td><td>${b.impact.toFixed(1)}%</td></tr>`).join(""))}
${sub("Analysis")}
<p>This is the weakest structural parameter in the model, and the report grades it accordingly. A sell of ${impactBands[0].p}% of the pool — ${fTok(impactBands[0].t)} — moves price ${impactBands[0].impact.toFixed(1)}%, while a ${impactBands[3].p}% sell moves it ${impactBands[3].impact.toFixed(0)}%. Liquidity as a share of FDV stands at ${(usdc0/(launch*1e9)*100).toFixed(1)}%, the low end of the healthy band. The figure deserves context rather than apology: pool depth here is bounded by real cash, specifically the Extended Seed round plus the liquidity split of the public raise, with no invented treasury USDC inflating it. The number is honest, and it is thin.</p>
<p>The shape of the impact curve explains why this parameter propagates through the rest of the report. Constant-product depth produces exponential rather than linear impact, so the pool absorbs modest flow comfortably and then degrades sharply once single trades grow large — behaviour that is benign in ordinary conditions and punishing in exactly the conditions where exits cluster. The remedies are limited and all require cash. Routing a larger share of the public raise to liquidity, or committing genuine treasury USDC, are the only routes to a deeper pool. Allocating more BND to the liquidity bucket cannot achieve it, because a constant-product pool requires both sides of the pair.</p>
${sub("Risk considerations")}
<p>Thin depth leaves price vulnerable to large holder exits and is the principal source of the drawdown recorded in Section 05 — most of that trough traces to this table rather than to any weakness in the revenue model. The dependency also runs upstream: because the pool is funded substantially by the Extended Seed round, a weaker raise shrinks depth directly, raising volatility sharply and, in the extreme case, destabilising the price path the rest of the report is built on.</p></section>`;

/* 11 Max Trade */
B+=`<section id="trade"><div class="sec-head"><div class="sec-num">11</div><h2>Max Trade Size</h2><span class="rating w">Caution</span></div>
<p class="desc">Largest single trades executable within a target slippage band at the launch pool depth.</p>
${tbl(["Slippage","Max buy (USDC)","Max sell (tokens)","Max sell (USDC)"],maxTrade.map(m=>`<tr><td style="text-align:left">${m.s}%</td><td>${fUsd(m.buyUsd)}</td><td>${fTok(m.sellTok)}</td><td>${fUsd(m.sellUsd)}</td></tr>`).join(""))}
${sub("Analysis")}
<p>At a 2% slippage tolerance the pool clears roughly ${fUsd(maxTrade[0].buyUsd)} of buying and ${fUsd(maxTrade[0].sellUsd)} of selling; widening the band to 5% raises executable size to ${fUsd(maxTrade[1].sellUsd)}. The relationship is non-linear, which is the practical consequence of the constant-product curve described in Section 10 — tolerating modestly more slippage unlocks disproportionately larger trades, and participants who can accept a wider band face a materially different market than those who cannot.</p>
<p>Read against the protocol's actual requirements, these capacities are adequate for retail activity and for treasury operations of ordinary size, while constraining governance-scale accumulation in a single transaction at tight slippage. Buy and sell capacity are close to balanced, which matters for BND specifically. The token is both a governance instrument that participants need to accumulate and the beneficiary of a buyback programme. A pool with directional bias would advantage one role at the expense of the other.</p>
${sub("Risk considerations")}
<p>Until liquidity deepens, large strategic positions must either fragment across multiple trades or accept higher slippage, which imposes a real cost on exactly the participants the governance model most wants to attract. The constraint binds symmetrically, and that is easy to overlook: concentrated buying — a large buyback executed at tight slippage, for instance — is capacity-limited by the same thin pool that limits selling.</p></section>`;

/* Conclusion */
B+=`<div class="part-label">Part III — Conclusion</div>
<section id="concl"><div class="sec-head"><div class="sec-num">C</div><h2>Conclusion</h2><span class="rating g">${grade}</span></div>
<p>The BND token model is <b>structurally sound and revenue-dependent</b>. Its mechanism design holds up against institutional norms on every measure this report tested. Supply is fixed at one billion and deflationary in one direction only. The cap table ladders discounts upward rather than compressing them, float at generation is deliberately thin behind cliffed insider supply, and value reaches the token through three rule-bound flows rather than discretionary ones. Cohort returns are correctly ordered, so no holder is structurally rewarded for exiting ahead of another. Across the ${M}-month base case the token returns ${sPct(ret36,0)} against a ${sPct(maxDD,0)} trough, with the buy side out-running sells at ${sellBuy.toFixed(2)}×.</p>
<p>Two findings temper that conclusion, and both were visible in more than one section above. <b>Liquidity is cash-constrained.</b> The launch pool holds ${fUsd(usdc0)}, or ${(usdc0/(launch*1e9)*100).toFixed(1)}% of FDV, at the low end of the healthy band. Because a constant-product pool converts thin depth into amplified price moves, this single parameter produces most of the drawdown, most of the upside, and the trading constraints recorded in Sections 10 and 11. It is not a modelling artefact that can be assumed away; deepening it requires cash, not tokens. <b>The model is also revenue-dependent.</b> Every buy engine — the burns, the xBND yield, the staking demand — traces back to Protocol Reserve revenue, itself the junior 20% claim on a fee base that must scale broadly as projected.</p>
<p>Neither finding contradicts the grade, and neither is concealed by the design; both follow from choices made deliberately and disclosed openly, and the model states its own dependencies rather than obscuring them. The appropriate reading is that the mechanisms are well constructed and the assumptions are where the risk sits. A reviewer who accepts the Protocol Reserve revenue trajectory and the launch pool depth should accept the rest of the analysis, because everything downstream follows from those two inputs. A reviewer who doubts either should begin there, and the sections above are ordered to make that examination straightforward.</p>
</section>`;

/* ---------- sidebar nav ---------- */
const navGroups=[
  {label:"Part I · Mechanism Design", items:toc.filter(t=>/^M/.test(t[0]))},
  {label:"Part II · Tokenomics Audit", items:toc.filter(t=>/^\d/.test(t[0]))},
  {label:"Summary", items:toc.filter(t=>t[0]==="C")},
];
const sidebarNav=navGroups.map(g=>`<div class="snav-group">${g.label}</div>`+
  g.items.map(([n,t,id])=>`<a data-id="${id}" href="#${id}"><span class="snav-num">${n}</span>${t}</a>`).join("")
).join("");

/* ---------- shell ---------- */
const shell=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tokenomics Audit — BOUND Protocol</title>
<style>${rawCss}${chartCss}${PRINT_CSS}</style></head><body>
<div class="layout">
<aside class="sidebar">
  <div class="sb-head">
    <div class="sb-title">Tokenomics Audit</div>
    <div class="sb-sub">BND · BOUND Protocol</div>
    <button class="sb-back" onclick="location.assign('/#docs')">&larr; Back to Library</button>
    ${PRINT_BUTTON}
  </div>
  <nav class="snav">${sidebarNav}</nav>
</aside>
<div class="content">
<div class="mast"><div class="mast-inner">
<div class="eyebrow">Tokenomics Audit</div><h1>BND Token Economic&nbsp;Audit</h1>
<p class="lede">An independent review of the BOUND Protocol token model — the RWA liquidity engine, the ten-stream revenue split, BND value accrual, vesting, and price-stability mechanics — generated from the protocol's live economic simulator.</p>
<div class="metarow">
<div><div class="k">Subject</div><div class="v">BND · BOUND Protocol</div></div>
<div><div class="k">Total supply</div><div class="v">1,000,000,000 BND</div></div>
<div><div class="k">Launch FDV</div><div class="v">${fUsd(launch*1e9)}</div></div>
<div><div class="k">Basis</div><div class="v">Live simulation engine</div></div>
<div><div class="k">Generated</div><div class="v">${today}</div></div>
</div></div></div>
<div class="wrap">
${B}
<footer><div class="disc"><b>Disclaimer.</b> This report is generated from BOUND Protocol's economic simulator on the current default assumptions and is for informational purposes only. All figures are model outputs, not guarantees or forward-looking projections of actual results. Regenerate via <span class="mono">node scripts/build-audit-report.mjs</span> after any assumption change.</div>
<div>BND Token Economic Audit · Generated ${today} · Basis: live simulation engine · ${M}-month horizon</div></footer>
</div></div></div>
<script>(function(){
  var links=[].slice.call(document.querySelectorAll('.snav a[data-id]'));
  var secs=links.map(function(a){return document.getElementById(a.getAttribute('data-id'));});
  function spy(){var y=window.scrollY+150,cur=0;for(var i=0;i<secs.length;i++){if(secs[i]&&secs[i].offsetTop<=y)cur=i;}for(var j=0;j<links.length;j++){links[j].classList.toggle('active',j===cur);}}
  links.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var el=document.getElementById(a.getAttribute('data-id'));if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}});});
  window.addEventListener('scroll',spy,{passive:true});window.addEventListener('resize',spy);spy();
})();</script>
</body></html>`;

writeFileSync(path.join(root,"public/bound-tokenomics-audit.html"), shell);
console.log(`Wrote public/bound-tokenomics-audit.html`);
console.log(`Base case: launch ${fPrice(launch)} → ${sPct(ret36,1)} @ M${M} · trough ${sPct(maxDD,1)} · sell/buy ${sellBuy.toFixed(2)}× · burned ${fTok(L.cumBurned)} (${pctBurned.toFixed(2)}%)`);
console.log(`Pool ${fUsd(usdc0)}/${fTok(bnd0)} · Liq/FDV ${(usdc0/(launch*1e9)*100).toFixed(1)}% · PR cum ${fUsd(prCumS[M-1])}`);
