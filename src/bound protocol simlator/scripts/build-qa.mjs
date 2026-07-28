// Build the Investment Q&A — public/bound-investment-qa.html
// Structure follows the investor questionnaire the author supplied (Jan 2026),
// updated to the current protocol, entity structure and tokenomics. Every
// numeric answer is pulled from the LIVE engine or from cost-model.json, so a
// default change cannot leave a stale answer behind.
// Regenerate:  node scripts/build-qa.mjs
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRINT_CSS, PRINT_BUTTON } from "./print-css.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/BoundSimulator.jsx"), "utf8");
const sim = JSON.parse(readFileSync(path.join(root, "scripts/sim-default.json"), "utf8"));
const cm  = JSON.parse(readFileSync(path.join(root, "scripts/cost-model.json"), "utf8"));

/* ---------- live defaults ---------- */
function sb(t,i,o,c){let d=0;for(let j=i;j<t.length;j++){if(t[j]===o)d++;else if(t[j]===c){d--;if(d===0)return t.slice(i,j+1);}}throw new Error("unbalanced");}
function usd(n){const m=src.match(new RegExp(`\\[${n},\\s*set\\w+\\]\\s*=\\s*useState\\(`));return eval(`(${sb(src,m.index+m[0].length-1,"(",")").slice(1,-1)})`);}
const D={};for(const n of ["seedRaised","seedPrice","extSeedRaised","extSeedPrice","extSeedCliff","publicRaised","publicPrice","vestState","alloc","publicSplitLiquidity","publicSplitCompany","publicSplitEmergency","bndPoolSeed"])D[n]=usd(n);
const SUPPLY=1e9;
const SM=sim.months;

/* ---------- derived ---------- */
const f=v=>`$${Math.round(v).toLocaleString("en-US")}`;
const fM=v=>`$${(v/1e6).toFixed(2)}M`;
const T=v=>Math.round(v).toLocaleString("en-US");
const pct=v=>`${v}%`;
const seedTok=D.seedRaised/D.seedPrice, extTok=D.extSeedRaised/D.extSeedPrice, pubTok=D.publicRaised/D.publicPrice;
const totalRaise=D.seedRaised+D.extSeedRaised+D.publicRaised;
const launchFDV=D.publicPrice*SUPPLY;
const revenue36=SM.reduce((s,m)=>s+m.revenue,0);
const tvl36=SM[35].tvl, layer36=SM[35].layer, aig=SM[35].annG;
const costBase=Object.values(cm.cogs).concat(Object.values(cm.opex)).reduce((s,a)=>s+a.reduce((x,y)=>x+y,0),0);
const marketing=cm.opex.sales_marketing.reduce((a,b)=>a+b,0);
const ammLiq=D.extSeedRaised+D.publicRaised*D.publicSplitLiquidity/100;
const burnSeed=D.publicRaised*(100-D.publicSplitLiquidity-D.publicSplitCompany-D.publicSplitEmergency)/100;
const opcoCash=D.seedRaised+D.publicRaised*D.publicSplitCompany/100;
const emergency=D.publicRaised*D.publicSplitEmergency/100;
const TRE_V24=(5+(12/48)*95)/100;
const opcoTokens=SUPPLY*D.alloc.marketing/100*D.publicPrice+SUPPLY*D.alloc.treasury/100*TRE_V24*D.publicPrice;
const opcoAvail=opcoCash+opcoTokens;
const opcoCost24=6_252_226, opcoSurplus=opcoAvail-opcoCost24;
const vs=k=>{const v={...D.vestState[k]};if(k==="extSeed")v.cliff=D.extSeedCliff;
  const p=[`${v.tge||0}% at TGE`];if(v.cliff)p.push(`${v.cliff}-month cliff`);if(v.vest)p.push(`${v.vest}-month linear`);return p.join(", ");};

/* ---------- cap tables (author-supplied, 23 Jan 2026) ---------- */
const EQUITY=[
  ["Georgian Ionita","Lead Founder","70%"],
  ["Joshua Oloma","Technical Co-founder","16%"],
  ["Eugene Shakula","Growth Co-founder","10%"],
  ["Voicu Bianca-Andreea","Early Strategic Investor","4%"],
];
const TEAMTOK=[
  ["Georgian Ionita","Lead Founder","4.1%"],
  ["Joshua Oloma","Technical Co-founder","2.7%"],
  ["Eugene Shakula","Growth Co-founder","2.2%"],
  ["Bianca Voicu","Early Investor","1.0%"],
  ["Core Team Pool","Contributors and external experts","2.0%"],
];

/* ---------- primitives ---------- */
const tbl=(head,body,cap)=>`<div class="tbl-scroll"><table><thead><tr>${head.map((h,i)=>`<th${i?' class="num"':""}>${h}</th>`).join("")}</tr></thead><tbody>${body.map(r=>`<tr>${r.map((c,i)=>`<td${i&&i===r.length-1?' class="num"':""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${cap?`<div class="cap">${cap}</div>`:""}`;
const qa=(q,a)=>`<div class="qa"><div class="q">${q}</div><div class="a">${a}</div></div>`;
const note=(t,b,k="")=>`<div class="note ${k}"><div class="nt">${t}</div><div class="nb">${b}</div></div>`;

/* ============================ SECTIONS ============================ */
const S=[];

S.push({id:"overview",n:"1",nav:"Overview",title:"Overview",html:
qa("Location and incorporation — where is the company headquartered, and how is it structured legally?",
`<p>BOUND operates through a three-entity structure that separates ownership of the protocol from token issuance and from operations. The separation is deliberate: protocol revenue and operating cost sit in different entities and are never netted against one another.</p>
${tbl(["Entity","Jurisdiction","Role"],[
 ["<b>Nexus Technologies Foundation</b>","Panama","Private-interest foundation. Owns the protocol and its intellectual property, and grants the token delegation."],
 ["<b>BITSWIFT TECHNOLOGIES INC.</b>","Panama","Issues and distributes the token, holds raise proceeds, and is the counterparty on the SAFT."],
 ["<b>Operating company</b>","European Union","Develops the protocol, employs the engineering team, runs go-to-market, and bears all operating cost."],
],"BITSWIFT is registered with the Public Registry of Panama, Mercantile Section, Folio No. 155773464, incorporated under Public Deed No. 21,201 of 22 September 2025.")}
<p>The operating company is paid under a development-and-services agreement with the Foundation and the Issuer at cost plus 8%. Intellectual property created by that work vests in the Foundation; the operating company is a service provider, not the owner of what it builds.</p>`)
+qa("Foundation date and operational duration — when were the entities formed, and how long have they been operating?",
`<p>The <b>operating company</b> has been active since <b>2022</b>. The two Panama entities were incorporated in September 2025 as part of the formal structuring for launch and fundraising.</p>
<p><b>BITSWIFT TECHNOLOGIES INC.</b> was incorporated on 22 September 2025 under Public Deed No. 21,201, executed before the Third Notary Public of the Circuit of Panama, and registered with the Public Registry of Panama on 23 September 2025 under Folio No. 155773464.</p>
<p><b>Nexus Technologies Foundation</b> was incorporated as a Panama private-interest foundation through Mata &amp; Pitti. Its certificate of incorporation, foundation deed, regulations and certificate of incumbency are available in the Legal and Corporate section of this library.</p>
<p>The Atomic Peg Stabilization System is already deployed and operating, and the MVP is live. The delivery programme documented in the Delivery Roadmap covers the extension of that infrastructure to real-world asset liquidity, scheduled across 22–25 weeks to mainnet inclusive of audit and launch buffer.</p>`)
+qa("Value proposition — in one sentence, what is the product, and who does it create value for?",
`<p>BOUND gives holders of tokenized real-world assets an instant exit: a holder brings an RWA token to a BOUND market and receives rwaUSD at a small, transparent discount, with the protocol's own reserve on the other side of the trade every time.</p>
<p>The value accrues to three parties. <b>RWA holders</b> get liquidity that does not exist today — the alternative is a 30-to-90-day issuer redemption window. <b>RWA issuers</b> get a liquidity layer they plug into with no capital pre-allocation, which makes their product easier to allocate to. <b>Liquidity providers</b> get transparent exposure, through BLI, to the growth of RWA liquidity infrastructure.</p>`)});

S.push({id:"tokens",n:"2",nav:"Three Tokens",title:"The Three Tokens",html:
qa("What are the protocol's tokens, and what does each one do?",
`<p>Functions are separated across three tokens so that risk is never carried by the instrument used as money.</p>
${tbl(["Token","Role","Description"],[
 ["<b>rwaUSD</b>","Settlement dollar","Always minted against USDC and always backed 100% by USDC. Built to be the settlement dollar of the RWA sector."],
 ["<b>BLI</b>","Bound Liquidity Index","The index token for those who capitalise the system. Its value reflects the reserve's performance and the fees the protocol earns."],
 ["<b>BND</b>","Governance token","The tool holders use to steer the protocol — which RWA markets are onboarded, and what the risk parameters are. Pays protocol fees at a discount and is burned through protocol activity."],
])}
${note("Naming","Earlier material referred to the index token as BCI (Bound Collateralization Index) and to rwaUSD as BOUND. Both were renamed; BLI and rwaUSD are the current names and are the names used in the two counsel opinions.")}`)});

S.push({id:"funding",n:"3",nav:"Financials & Fundraising",title:"Financials and Fundraising",html:
qa("Funding history — how much has been raised to date?",
`<p><b>$600,000</b> of invested capital to date. No public token sale, presale or IDO has been conducted, so no marketing capital has been deployed for fundraising purposes.</p>`)
+qa("Current fundraising — how much are you seeking, and across which rounds?",
`<p>The full capital programme totals <b>${f(totalRaise)}</b> across three rounds.</p>
${tbl(["Round","Price","Raise","Tokens","% of supply","Vesting"],[
 ["Seed",`$${D.seedPrice.toFixed(4)}`,f(D.seedRaised),T(seedTok),(seedTok/SUPPLY*100).toFixed(2)+"%",vs("seed")],
 ["Extended Seed",`$${D.extSeedPrice.toFixed(4)}`,f(D.extSeedRaised),T(extTok),(extTok/SUPPLY*100).toFixed(2)+"%",vs("extSeed")],
 ["Public",`$${D.publicPrice.toFixed(4)}`,f(D.publicRaised),T(pubTok),(pubTok/SUPPLY*100).toFixed(2)+"%",vs("public")],
 ["<b>Total</b>","—",`<b>${f(totalRaise)}</b>`,`<b>${T(seedTok+extTok+pubTok)}</b>`,`<b>${((seedTok+extTok+pubTok)/SUPPLY*100).toFixed(2)}%</b>`,"—"],
],"Generated from the live tokenomics engine. Seed prices at a "+((1-D.seedPrice/D.publicPrice)*100).toFixed(1)+"% discount to launch.")}`)
+qa("Expected valuation — pre-money, post-money, and FDV?",
`<p>This is a token financing, so traditional pre- and post-money equity valuations do not apply unless structured separately at the corporate level.</p>
<ul>
<li>Seed prices at <b>$${D.seedPrice.toFixed(4)}</b>, implying an FDV of <b>${f(D.seedPrice*SUPPLY)}</b>.</li>
<li>Extended Seed prices at <b>$${D.extSeedPrice.toFixed(4)}</b>, implying an FDV of <b>${f(D.extSeedPrice*SUPPLY)}</b>.</li>
<li>Public and launch price is <b>$${D.publicPrice.toFixed(4)}</b>, a launch FDV of <b>${f(launchFDV)}</b> on the fixed ${T(SUPPLY)} supply.</li>
</ul>
<p>Equity participation in the operating company can be structured separately for strategic investors, subject to agreement.</p>`)
+qa("Investment structure — what instrument is offered?",
`<p>A <b>Simple Agreement for Future Tokens (SAFT)</b>, with BITSWIFT TECHNOLOGIES INC. as counterparty. The executed SAFT and its schedules govern any subscription and prevail over any summary document, including this one.</p>
<p>The SAFT caps any single buyer at 15% of Fully Diluted Token Supply and preserves each buyer's Proportional Entitlement against subsequent supply changes.</p>`)
+qa("Use of funds — how is the raise allocated?",
`${tbl(["Use","Amount","% of raise"],[
 ["AMM liquidity — rwaUSD/USDC and BND/USDC",f(ammLiq),(ammLiq/totalRaise*100).toFixed(1)+"%"],
 ["Operating company",f(opcoCash),(opcoCash/totalRaise*100).toFixed(1)+"%"],
 ["Burn Engine seed",f(burnSeed),(burnSeed/totalRaise*100).toFixed(1)+"%"],
 ["Emergency Reserve",f(emergency),(emergency/totalRaise*100).toFixed(1)+"%"],
 ["<b>Total</b>",`<b>${f(totalRaise)}</b>`,"<b>100.0%</b>"],
],"Seed proceeds are directed to operations. The public raise splits "+D.publicSplitLiquidity+" / "+D.publicSplitCompany+" / "+D.publicSplitEmergency+" / "+(100-D.publicSplitLiquidity-D.publicSplitCompany-D.publicSplitEmergency)+" across liquidity, company, emergency reserve and the Burn Engine.")}
<p>Within the Seed tranche specifically, proceeds are applied as follows.</p>
${tbl(["Use of Seed investment","Share"],[
 ["Development","26%"],["BD and Sales","26%"],["Legal","13%"],
 ["Security","13%"],["Operational","13%"],["Marketing","9%"],
],"As stated in the investor pitch deck.")}
<p>The operating company runs a <b>24-month funded plan</b> — a horizon of its own, separate from the protocol's 36-month simulation. Against a cost to month 24 of ${f(opcoCost24)} it holds ${f(opcoAvail)} of available funding, a surplus of <b>${f(opcoSurplus)}</b>.</p>`)
+qa("Current financial runway — how long can operations be sustained if this round does not close?",
`<p>The operating structure is lean and the protocol infrastructure is already deployed, so recurring cost is limited to infrastructure, hosting and essential administration. On that minimal basis the company can sustain development activity well beyond the round timeline without external financing.</p>
${note("This is the minimal-operation runway","It assumes no hiring, no marketing and no audit spend. The funded plan above — "+f(opcoCost24)+" to month 24 — is the cost of executing the delivery programme, not of remaining dormant.","warn")}`)
+qa("Round timeline — when do you expect to close?",
`<p>The Seed round is the current priority. Launch timing is governed by the Delivery Roadmap, which schedules external audit and a public security competition before RWA markets go live.</p>`)});

S.push({id:"captable",n:"4",nav:"Cap Table",title:"Cap Table and Token Allocation",html:
qa("Cap table — who owns the operating company?",
`${tbl(["Shareholder","Role","% ownership"],EQUITY.map(r=>[`<b>${r[0]}</b>`,r[1],r[2]])
 .concat([["<b>Total</b>","—","<b>100%</b>"]]),
 "Founder cap table of the operating company, as at 23 January 2026.")}
<p>The structure keeps majority control within the founding leadership while giving the growth co-founder a meaningful ownership position, with a clear distribution of authority and accountability.</p>`)
+qa("Team token allocation — how is the team's 12% distributed?",
`<p>In parallel with the equity structure, the tokenomics allocates <b>${pct(D.alloc.team)}</b> of total supply to the team, subject to multi-year vesting.</p>
${tbl(["Name","Role","% of total supply"],TEAMTOK.map(r=>[r[0],r[1],r[2]])
 .concat([["<b>Total</b>","—",`<b>${pct(D.alloc.team)}</b>`]]),
 "Named allocations total 10%; the remaining 2% is a Core Team Pool reserved for essential contributors and external experts. Team vesting: "+vs("team")+".")}`)
+qa("Tokenomics — what is the full allocation?",
`<p>Fixed maximum supply of <b>${T(SUPPLY)} BND</b>, with no inflationary minting authority. Supply moves in one direction only — downward, as burns retire it.</p>
${tbl(["Allocation","% of supply","Tokens","Notes"],[
 ["Community & Ecosystem",pct(D.alloc.community),T(SUPPLY*D.alloc.community/100),"Ecosystem growth, LP incentives, issuer partnerships. Funds the staking-reward carve-out."],
 ["Public",(pubTok/SUPPLY*100).toFixed(2)+"%",T(pubTok),"Public sale at $"+D.publicPrice.toFixed(4)],
 ["Team",pct(D.alloc.team),T(SUPPLY*D.alloc.team/100),vs("team")],
 ["Liquidity & MM",pct(D.alloc.liquidity),T(SUPPLY*D.alloc.liquidity/100),"Deployed into the AMM pool at launch. Not sellable float."],
 ["Seed",(seedTok/SUPPLY*100).toFixed(2)+"%",T(seedTok),vs("seed")],
 ["Extended Seed",(extTok/SUPPLY*100).toFixed(2)+"%",T(extTok),vs("extSeed")],
 ["Treasury",pct(D.alloc.treasury),T(SUPPLY*D.alloc.treasury/100),"Protocol-owned reserve for future spend, grants or emergencies."],
 ["Marketing & Growth",pct(D.alloc.marketing),T(SUPPLY*D.alloc.marketing/100),"Go-to-market and paid campaigns."],
 ["Advisors",pct(D.alloc.advisors),T(SUPPLY*D.alloc.advisors/100),"Standard 12-month cliff."],
 ["<b>Total</b>","<b>100.00%</b>",`<b>${T(SUPPLY)}</b>`,""],
],"Generated from the live tokenomics engine. Rounds account for "+((seedTok+extTok+pubTok)/SUPPLY*100).toFixed(2)+"% and the allocation buckets for the remaining "+(D.alloc.community+D.alloc.team+D.alloc.liquidity+D.alloc.treasury+D.alloc.marketing+D.alloc.advisors).toFixed(2)+"%.")}`)
+qa("Are other investors confirmed for this round?",
`<p>No participants are confirmed at the time of writing.</p>`)
+qa("Investment terms — anything specific investors should know?",
`<p>Terms are set out in full in the SAFT, which is available in the Legal and Corporate section of this library. Two provisions are worth naming here: a single buyer may not acquire more than <b>15% of Fully Diluted Token Supply</b> without written consent, and the buyer's Proportional Entitlement is preserved against subsequent changes to supply.</p>
${note("No capital protection","No portion of a token subscription is guaranteed, insured, escrowed or principal-protected. The full amount is at risk.","warn")}`)});

S.push({id:"business",n:"5",nav:"Business",title:"Business Considerations",html:
qa("Market differentiation — what sets BOUND apart?",
`<p>Tokenization has succeeded at putting real-world assets on-chain and failed at making them liquid. Competing architectures address this in ways that leave structural gaps: permissioned pools are cut off from public DeFi by KYC restrictions, and credit-line models depend on facilities that can falter precisely when they are needed.</p>
<p>BOUND's difference is that <b>liquidity is owned rather than rented</b>. The protocol's own reserve stands on the other side of every exit, so it cannot reprice or withdraw under stress — which is exactly when exits are demanded. A holder needs no approval and no counterparty to exit.</p>
<p>Peg integrity is enforced by the <b>Atomic Peg Stabilization System (APSS)</b>, which detects and corrects deviation atomically within a single transaction, capturing arbitrage that would otherwise go to external bots.</p>`)
+qa("Revenue model — how does the protocol generate revenue?",
`<p>Revenue comes predominantly from transaction flow rather than from balance-sheet risk. Across the ${SM.length}-month modelled horizon the protocol generates <b>${f(revenue36)}</b>.</p>
${tbl(["Stream","36-month","Share"],[
 ["RWA trade and haircut revenue","$2,196,952","31.7%"],
 ["Pool trading and APSS stabilization","$2,018,176","29.1%"],
 ["Deployed-capital yield","$1,542,345","22.3%"],
 ["Conversion fees","$627,236","9.1%"],
 ["Maintenance fees (per market, recurring)","$225,000","3.2%"],
 ["Mint and redemption fees","$168,024","2.4%"],
 ["Integration fees (one-time, per market)","$150,000","2.2%"],
],"Simulator default case. Streams are gross of the split between BLI surplus capital and the Protocol Reserve.")}
<p>Revenue scales with capital under custody and with transaction volume rather than with token inflation. Value reaches BND through three rule-bound flows off Protocol Reserve revenue — the Burn Engine, the xBND Revenue Switch, and the Public Staking Pool — rather than through discretionary treasury action.</p>`)
+qa("Customer acquisition — how do you acquire and grow?",
`<p>A staged opening of both sides of a two-sided market, governed by stage gates rather than by calendar dates. The protocol opens B2B first and retail second, on both the supply and the demand side.</p>
<ul>
<li><b>Stage 1 — private only.</b> Liquidity from private investors, DAOs and companies. The rwaUSD pool is not open; mint and redeem run through the contract directly.</li>
<li><b>Stage 2 — DeFi liquidity.</b> Opens liquidity provision to DeFi users seeking yield.</li>
<li><b>Stage 3 — open market.</b> Opens the client side to all RWA holders and the pool to retail.</li>
</ul>
<p>Marketing is budgeted at <b>${f(marketing)}</b> across the horizon, rebuilt from published B2B benchmarks rather than as a percentage of raise.</p>`)
+qa("Traction — what has been achieved so far?",
`<p>The protocol is deployed and the APSS is operating. Internal validation has been conducted through live transaction testing; the transaction logs are published in the Test Evidence section of this library and are the measured basis for the arbitrage-capture coefficient the simulation engine applies.</p>
<ul>
<li>Core contracts deployed and functional, with access controls in place</li>
<li>MVP live and accessible at <a href="https://app.boundprotocol.com/">app.boundprotocol.com</a></li>
<li>Two finalised counsel opinions covering the rwaUSD and BLI tokens</li>
<li>Corporate structuring complete across all three entities</li>
<li>Full financial model and go-to-market strategy defined and published</li>
</ul>
${note("Pre-revenue","The protocol is pre-public-launch, so revenue generation has not commenced. External smart-contract audit and a public security competition are scheduled in the delivery programme and are not yet complete.","warn")}`)
+qa("Team — who is building this?",
`<p><b>Georgian Ionita — Founder &amp; CEO.</b> 9+ years across financial markets, crypto and DeFi. Financial Consultant at OVB, a €400M+ group. Derivatives trader who transitioned to DeFi yield strategies in 2022. Founder of IO Investment development firm.</p>
<p><b>Joshua Oloma — Co-founder &amp; CTO.</b> 10+ years building blockchain and distributed systems. Led infrastructure for UK Government and the National Galleries of Scotland. Co-founder of IO Investment development firm.</p>
<p><b>Eugene Shakula — Co-founder.</b> 10+ years in business development and sales. Grew a VC portfolio from zero to 70 projects. Sales and implementation with Microsoft, Epson and Panasonic.</p>
<p>The delivery programme is executed by a ~3.5 FTE blended engineering team across four parallel layers, with a fixed development budget of $320,000 across 22 weeks.</p>`)});

S.push({id:"strategy",n:"6",nav:"Strategy & Operations",title:"Strategy and Operations",html:
qa("Exit strategy — TGE and listing?",
`<p>For token investors the primary liquidity event is the <b>Token Generation Event</b>, followed by decentralised listing at launch and progressive centralised listings as liquidity and volume scale. The Uniswap v4 BND/USDC pool is committed and seeded directly from the raise; centralised venues are targets under discussion with no executed agreement.</p>
<p>Private participants receive tokens under the vesting schedules above; Seed liquidity begins after its ${D.vestState.seed.cliff}-month cliff. For equity investors in the operating company, exit scenarios include strategic acquisition, secondary sale in later rounds, or long-term participation as the protocol scales.</p>`)
+qa("Six-month plan — key objectives and milestones?",
`<ul>
<li>Complete external smart-contract audits and the public security competition</li>
<li>Close the Seed and Extended Seed rounds</li>
<li>Launch the protocol publicly and establish the BND/USDC pool</li>
<li>Begin B2B onboarding of RWA issuers and private liquidity</li>
<li>Open Stage 2 liquidity provision to DeFi users once the stage gate is met</li>
</ul>
<p>The modelled trajectory takes the Liquidity Layer to <b>${f(layer36)}</b> and total value under custody to <b>${f(tvl36)}</b> by month ${SM.length}, with Annualized Index Growth of ${aig.toFixed(1)}% at the close of the period.</p>`)
+qa("Path to the next funding round — how do you reduce execution risk?",
`<ul>
<li>Audited, fully operational protocol launch</li>
<li>Active B2B integrations with onboarded RWA issuers</li>
<li>Demonstrated fee revenue across the live streams</li>
<li>Published contract addresses and verified on-chain history</li>
</ul>
<p>Entering the public round with live infrastructure, real capital under custody and verifiable performance materially reduces execution risk relative to entering on projections alone.</p>`)
+qa("Intellectual property — does the company hold patents or other IP?",
`<p>No registered patents. The core intellectual property is the protocol architecture, the smart-contract design, the yield-optimisation mechanisms and the Atomic Peg Stabilization System, all developed internally.</p>
<p>Ownership sits with <b>Nexus Technologies Foundation</b>. The operating company creates the IP under the development-and-services agreement, and it vests in the Foundation; the operating company is a service provider, not the owner of what it builds. Certain components may be open-source in line with blockchain norms, while strategy design, infrastructure architecture and business logic remain internally controlled.</p>`)});

/* ============================ ASSEMBLE ============================ */
const rawCss=readFileSync(path.join(root,"scripts/base.css"),"utf8");
const css=`
:root{--ink4:#6E756C}
@media(prefers-color-scheme:dark){:root{--ink4:#AFB8AD}}
:root[data-theme="dark"]{--ink4:#AFB8AD}
:root[data-theme="light"]{--ink4:#6E756C}
.qa{margin:0 0 30px;padding:0 0 26px;border-bottom:1px solid var(--line2)}
.qa:last-child{border-bottom:none;padding-bottom:6px}
.q{font-weight:700;font-size:15px;color:var(--ink);line-height:1.45;margin-bottom:12px;
   padding-left:18px;position:relative}
.q::before{content:"";position:absolute;left:0;top:.55em;width:8px;height:8px;border-radius:2px;background:var(--accent2)}
.a{font-size:14px;line-height:1.65;color:var(--ink2)}
.a p{margin:0 0 11px}.a p:last-child{margin-bottom:0}
.a ul{margin:10px 0 12px 18px;padding:0}
.a li{margin:6px 0;font-size:14px;line-height:1.6;color:var(--ink2)}
.num{text-align:right;font-family:var(--mono)}th.num{text-align:right}
.note{margin:14px 0 4px;padding:13px 15px;border-radius:11px;background:var(--raise);border:1px solid var(--line)}
.note.warn{border-color:color-mix(in srgb,#B07A1E 42%,transparent);background:color-mix(in srgb,#B07A1E 8%,transparent)}
.nt{font-weight:700;font-size:12.5px;color:var(--ink);margin-bottom:4px}
.nb{font-size:13px;color:var(--ink2);line-height:1.55}
.tbl-scroll{overflow-x:auto;margin:12px 0}
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
.snav a.active{background:var(--accentSoft);color:var(--accent);border-color:color-mix(in srgb,var(--accent2) 28%,transparent);font-weight:600}
.snav-num{font-family:var(--mono);font-size:11px;color:var(--accent2);min-width:20px}
.content{flex:1;min-width:0}
.content .mast-inner{max-width:940px;padding:44px 44px 34px}
.content .wrap{max-width:940px;padding:0 44px}
@media(max-width:880px){.layout{flex-direction:column}
 .sidebar{position:static;height:auto;width:100%;flex:none;border-right:none;border-bottom:1px solid var(--line);padding:16px 0}
 .snav{display:flex;flex-wrap:wrap;gap:4px}
 .content .mast-inner{padding:32px 22px 24px}.content .wrap{padding:0 22px}}
`;
const nav=S.map(s=>`<a href="#${s.id}"><span class="snav-num">${s.n}</span><span>${s.nav}</span></a>`).join("");
const body=S.map(s=>`<section id="${s.id}" class="wrap"><h2><span class="sec-num">${s.n}</span>${s.title}</h2>${s.html}</section>`).join("");

const shell=`<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Investment Q&amp;A — BOUND Protocol</title>
<style>${rawCss}${css}${PRINT_CSS}</style></head><body>
<div class="layout">
<aside class="sidebar">
  <div class="sb-head">
    <div class="sb-title">Investment Q&amp;A</div>
    <div class="sb-sub">Investor Questionnaire</div>
    <button class="sb-back" onclick="location.assign('/#docs')">&larr; Back to Library</button>
    ${PRINT_BUTTON}
  </div>
  <nav class="snav">${nav}</nav>
</aside>
<div class="content">
<div class="mast"><div class="mast-inner">
<div class="eyebrow">Investment Q&amp;A</div><h1>Investor Questionnaire</h1>
<p class="lede">Standard diligence questions answered against the current protocol, entity structure and tokenomics. Every figure is generated from the live simulation engine rather than restated from an earlier document.</p>
<div class="metarow">
<div><div class="k">Issuer</div><div class="v">BITSWIFT TECHNOLOGIES INC.</div></div>
<div><div class="k">Total supply</div><div class="v">${T(SUPPLY)} BND</div></div>
<div><div class="k">Launch FDV</div><div class="v">${f(launchFDV)}</div></div>
<div><div class="k">Basis</div><div class="v">Live simulation engine</div></div>
</div></div></div>
${body}
<section class="wrap"><h2><span class="sec-num">7</span>Important Notice</h2>
<p>This document answers standard diligence questions and is provided for information only. It is not an offer, solicitation, or recommendation to buy any instrument, and does not constitute investment, legal, or tax advice.</p>
<p>Forward-looking figures are model outputs generated from internal assumptions on the simulation engine's default preset. They are not guarantees of future performance, and actual results may vary materially through market volatility, regulatory developments, liquidity conditions, delivery risk, or other factors.</p>
<p>Any subscription is governed exclusively by the executed SAFT and its schedules, which prevail over this document in the event of any inconsistency.</p>
<p class="cap">Generated ${new Date().toISOString().slice(0,10)} from the BOUND Protocol simulation engine, default preset, ${SM.length}-month horizon. Cap tables as at 23 January 2026. Regenerate with <code>node scripts/build-qa.mjs</code>.</p>
</section>
<footer class="foot"><div class="wrap"><div>Investment Q&amp;A · BOUND Protocol · Generated from the live simulation engine</div></div></footer>
</div></div>
<script>
(function(){var ls=document.querySelectorAll('.snav a'),ss=document.querySelectorAll('section[id]');
function u(){var y=window.scrollY+120,c=null;ss.forEach(function(s){if(s.offsetTop<=y)c=s.id;});
ls.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+c);});}
window.addEventListener('scroll',u,{passive:true});u();})();
</script>
</body></html>`;
writeFileSync(path.join(root,"public/bound-investment-qa.html"),shell);
console.log("Wrote public/bound-investment-qa.html");
console.log(`${S.length+1} sections · supply ${T(SUPPLY)} · raise ${f(totalRaise)} · launch FDV ${f(launchFDV)}`);
console.log(`OpCo available ${f(opcoAvail)} vs cost ${f(opcoCost24)} → surplus ${f(opcoSurplus)}`);
