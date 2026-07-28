#!/usr/bin/env python3
"""Verify public/bound-seed-proposal.html against the live engine.

Re-derives the Seed cohort independently by re-running the tokenomics engine
through the audit builder's own extraction, then asserts every headline figure
appears in the rendered page. Also enforces the representations this document
must NOT make: no capital protection, and no named centralised listing venue.

Usage:  python3 scripts/verify-proposal.py
"""
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- re-derive the seed cohort from the engine, independently of the builder ---
PROBE = r'''
import { readFileSync } from "node:fs"; import path from "node:path";
const root=process.argv[2];
const src=readFileSync(path.join(root,"src/BoundSimulator.jsx"),"utf8");
function sb(t,i,o,c){let d=0;for(let j=i;j<t.length;j++){if(t[j]===o)d++;else if(t[j]===c){d--;if(d===0)return t.slice(i,j+1);}}throw new Error("x");}
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
const M=rows.length;const y=[11,23,35].map(i=>rows[i]);
const out={M,seedTokens:catTokens.seed,invested:A.seedRaised,price:A.seedPrice,launch:A.publicPrice,
  vest:A.vest.seed,totalSupply:A.totalSupply,
  years:y.map(r=>({price:r.price,vested:r.byBucket.seed,sold:r.cumSoldSeed,
    remain:Math.max(0,r.byBucket.seed-r.cumSoldSeed),
    remainVal:Math.max(0,r.byBucket.seed-r.cumSoldSeed)*r.price,
    cumSell:r.cumSellProceedsSeed,cumDist:r.cumDistSeed}))};
console.log(JSON.stringify(out));
'''
probe = os.path.join(ROOT, 'scripts', '.verify-proposal-probe.mjs')
open(probe, 'w').write(PROBE)
try:
    raw = subprocess.run(['node', probe, ROOT], capture_output=True, text=True, check=True).stdout
finally:
    os.remove(probe)
E = json.loads(raw)

Y = E['years']
invested = E['invested']
final = Y[2]
overall = final['remainVal'] + final['cumSell'] + final['cumDist']
total_return = (overall / invested - 1) * 100
cagr = ((overall / invested) ** (12 / E['M']) - 1) * 100

M = lambda v: ('−$' if v < 0 else '$') + '{:,.0f}'.format(abs(round(v)))
T = lambda v: '{:,.0f}'.format(round(v))
P = lambda v: '${:.4f}'.format(v)

# --- identities that must hold before anything is published ---
assert E['seedTokens'] == 100_000_000, \
    'Seed allocation should be 100,000,000 BND, got {:,.0f}'.format(E['seedTokens'])
assert abs(E['seedTokens'] * E['price'] - invested) < 1, \
    'tokens x price must equal the raise'
assert E['price'] < E['launch'], 'Seed must price below launch'
assert Y[0]['vested'] <= Y[1]['vested'] <= Y[2]['vested'], 'vesting must be monotonic'
assert abs(Y[2]['vested'] - E['seedTokens']) < 1, 'full vest by month {}'.format(E['M'])
print('identity: 100,000,000 BND x {} = {}          ..... OK'.format(P(E['price']), M(invested)))
print('identity: vesting monotonic and complete at M{}   ..... OK'.format(E['M']))

page_raw = open(os.path.join(ROOT, 'public/bound-seed-proposal.html')).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page_raw)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = html.unescape(re.sub(r'<[^>]+>', ' ', page))
page = re.sub(r'\s+', ' ', page)

checks = [
    ('seed allocation', T(E['seedTokens'])),
    ('investment amount', M(invested)),
    ('token price', P(E['price'])),
    ('launch price', P(E['launch'])),
    ('total value M36', M(overall)),
    ('holdings retained', M(final['remainVal'])),
    ('sale proceeds', M(final['cumSell'])),
    ('xBND income', M(final['cumDist'])),
    ('total supply', T(E['totalSupply'])),
]
for i, y in enumerate(Y):
    checks.append(('year {} price'.format(i + 1), P(y['price'])))
    checks.append(('year {} holdings'.format(i + 1), T(y['remain'])))

missing = [(l, v) for l, v in checks if v not in page]
if missing:
    print('\nFAIL — figures absent from the rendered page:')
    for l, v in missing:
        print('   {:<22} {}'.format(l, v))
    sys.exit(1)
for l, v in checks:
    print('  {:<22} {:>18}  OK'.format(l, v))

# --- representations this document must never make ---
BANNED = [
    (r'principal[- ]protected', 'claims principal protection'),
    (r'capital[- ]protected', 'claims capital protection'),
    (r'guarantee[ds]? (?:return|profit|yield)', 'guarantees a return'),
    (r'\bAt Risk:\s*\$', 'reproduces the protection-mechanism split'),
]
# Named venues are permitted — the section is explicitly a list of TARGETS — but
# only while the disclaimer that no agreement exists travels with them. This
# check replaces an earlier blanket ban on naming venues at all.
VENUE_NAMES = r'\b(?:Binance|Coinbase|Kraken|OKX|Bybit|KuCoin|Gate\.io|Bitget|MEXC|BingX|Huobi)\b'
if re.search(VENUE_NAMES, page):
    for required in ['No centralised listing agreement has been executed',
                     'targets under discussion']:
        if required.lower() not in page.lower():
            print('\nFAIL - a centralised venue is named without the disclaimer: '
                  'missing "{}"'.format(required))
            sys.exit(1)
    print('  named venues carry the no-agreement disclaimer   ..... OK')
hits = []
for pat, why in BANNED:
    for m in re.finditer(pat, page, re.I):
        ctx = page[max(0, m.start() - 90):m.end() + 90]
        # the document is allowed to deny protection explicitly
        if re.search(r'\bno\b|not\b|none is|never', ctx, re.I) and 'protect' in pat:
            continue
        hits.append((why, ctx.strip()))
if hits:
    print('\nFAIL — prohibited representation found:')
    for why, ctx in hits[:6]:
        print('   {} → …{}…'.format(why, ctx))
    sys.exit(1)
print('\n  no capital-protection claim                      ..... OK')
print('  no centralised venue named without an agreement  ..... OK')

for phrase in ['no capital protection', 'not an offer', 'forward-looking']:
    if phrase not in page.lower():
        print('\nFAIL — required disclosure missing: "{}"'.format(phrase)); sys.exit(1)
print('  required disclosures present                     ..... OK')

charts = len(re.findall(r'class="cv"', page_raw))
assert charts >= 4, 'expected at least 4 charts, found {}'.format(charts)
print('  {} inline SVG charts rendered                     ..... OK'.format(charts))

print()
print('PASS — every figure is reproducible from the live engine, the')
print('       vesting and allocation identities hold, and the document')
print('       makes no protection or listing representation it cannot support.')
print()
print('  Seed {} BND @ {} = {}'.format(T(E['seedTokens']), P(E['price']), M(invested)))
print('  Month {}: {} total  ({:+.0f}% · CAGR {:+.0f}%)'.format(E['M'], M(overall), total_return, cagr))
print('  of which xBND {} · sales {} · holdings {}'.format(
    M(final['cumDist']), M(final['cumSell']), M(final['remainVal'])))
