#!/usr/bin/env python3
"""Verify public/bound-business-plan.html against its two sources.

Re-derives every headline figure independently from scripts/sim-default.json and
scripts/cost-model.json, then asserts each appears in the rendered page. Also
checks that no residue of the retired architecture survives — the prior plan
described a different protocol, and none of its vocabulary belongs here.

Usage:  python3 scripts/verify-businessplan.py
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sim = json.load(open(os.path.join(ROOT, 'scripts/sim-default.json')))
cm = json.load(open(os.path.join(ROOT, 'scripts/cost-model.json')))
SM = sim['months']

assert len(SM) == 36, 'business plan horizon must be 36 months'
assert sim['preset'] == 'Default', 'business plan must be built on the default preset'

ys = lambda k, y: sum(m[k] for m in SM[y * 12:(y + 1) * 12])
ye = lambda k, y: SM[(y + 1) * 12 - 1][k]

M = lambda x: ('−${:,.0f}' if round(x) < 0 else '${:,.0f}').format(abs(round(x)))
P = lambda x: '{:.1f}%'.format(x)
X = lambda x: '{:.2f}×'.format(x)

rev_y = [ys('revenue', y) for y in range(3)]
vol_y = [ys('volume', y) for y in range(3)]
tvl_e = [ye('tvl', y) for y in range(3)]
cost_y = cm['total']
ebit_y = [rev_y[y] - cost_y[y] for y in range(3)]

# --- internal consistency of the simulator feed ---
for i, m in enumerate(SM):
    assert abs(m['revenue'] - (m['totalBci'] + m['totalPr'])) < 1e-6, \
        'revenue identity broken at month {}'.format(i + 1)
    assert abs(m['tvl'] - (m['layer'] + m['boundCoreBal'])) < 1e-6, \
        'tvl identity broken at month {}'.format(i + 1)
bci_sum = sum(sum(m[k] for k in sim['streams']['bci']) for m in SM)
tot_bci = sum(m['totalBci'] for m in SM)
assert abs(bci_sum - tot_bci) < 1.0, 'BCI streams do not sum to totalBci'
print('identity: revenue = totalBci + totalPr, all 36 months  ..... OK')
print('identity: tvl = layer + boundCore, all 36 months        ..... OK')
print('identity: bci_* streams sum to totalBci                 ..... OK')

# --- breakeven and capital requirement ---
cum, peak, peak_m, be_m = 0.0, 0.0, 0, None
for i, m in enumerate(SM):
    net = m['revenue'] - cost_y[i // 12] / 12
    cum += net
    if cum < peak:
        peak, peak_m = cum, i + 1
    if net > 0 and be_m is None:
        be_m = i + 1
assert be_m is not None, 'no breakeven month found — the document claims one'

# --- figures that must appear ---
page_raw = open(os.path.join(ROOT, 'public/bound-business-plan.html')).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page_raw)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = html.unescape(re.sub(r'<[^>]+>', ' ', page))

checks = [
    ('36-month revenue', M(sum(rev_y))),
    ('36-month cost base', M(sum(cost_y))),
    ('36-month operating result', M(sum(ebit_y))),
    ('peak capital requirement', M(abs(peak))),
    ('breakeven month', 'Month ' + str(be_m)),
    ('peak deficit month', 'Month ' + str(peak_m)),
    ('TVL month 36', M(tvl_e[2])),
    ('BLI price month 36', '{:.4f}'.format(ye('bciPrice', 2))),
    ('AIG month 36', P(ye('annG', 2))),
    ('LCR month 36', X(ye('lcr', 2))),
    ('36-month volume', M(sum(vol_y))),
    ('personnel employer cost', M(sum(cm['cogs']['personnel_employer']))),
]
for y in range(3):
    checks += [
        ('revenue Y{}'.format(y + 1), M(rev_y[y])),
        ('cost Y{}'.format(y + 1), M(cost_y[y])),
        ('operating result Y{}'.format(y + 1), M(ebit_y[y])),
        ('volume Y{}'.format(y + 1), M(vol_y[y])),
        ('tvl year-end Y{}'.format(y + 1), M(tvl_e[y])),
    ]

missing = [(l, v) for l, v in checks if v not in page]
if missing:
    print('\nFAIL — figures absent from the rendered page:')
    for l, v in missing:
        print('   {:<30} {}'.format(l, v))
    sys.exit(1)

for l, v in checks:
    print('  {:<30} {:>16}  OK'.format(l, v))

# --- retired-architecture residue ---
RETIRED = ['sBND', 'BNT', 'BOUND Dollar', 'premium membership', 'Premium Membership',
           'performance fee', 'Performance Fee', 'capped APY', 'Avantgarde', 'Ethena']
found = [t for t in RETIRED if t in page]
if found:
    print('\nFAIL — vocabulary from the retired architecture present:')
    for t in found:
        print('   ' + t)
    sys.exit(1)
print('\n  no residue of the retired architecture               ..... OK')

# --- charts present ---
charts = len(re.findall(r'class="cv"', page_raw))
assert charts >= 8, 'expected at least 8 charts, found {}'.format(charts)
print('  {} inline SVG charts rendered                        ..... OK'.format(charts))

print()
print('PASS — every derived figure appears in the rendered page,')
print('       all engine identities hold, and no legacy vocabulary remains.')
