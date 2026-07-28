#!/usr/bin/env python3
"""Verify public/bound-gtm-strategy.html against its sources.

Re-derives every figure independently from scripts/sim-default.json and
scripts/cost-model.json, then asserts each appears in the rendered page. Also
enforces the strategy's own messaging discipline: the document commits, in
Chapter 6, to never claiming that Annualized Index Growth rises as the protocol
scales. That commitment is checked here rather than trusted.

Usage:  python3 scripts/verify-gtm.py
"""
import html
import os
import re
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sim = json.load(open(os.path.join(ROOT, 'scripts/sim-default.json')))
cm = json.load(open(os.path.join(ROOT, 'scripts/cost-model.json')))
SM = sim['months']
BCI, PR = sim['streams']['bci'], sim['streams']['pr']

M = lambda x: ('−${:,.0f}' if round(x) < 0 else '${:,.0f}').format(abs(round(x)))
P = lambda x: '{:.1f}%'.format(x)
P2 = lambda x: '{:.2f}%'.format(x)

S2 = next(m['m'] for m in SM if m['retailLayerBal'] > 0)
S3 = next(m['m'] for m in SM if m['rwaMint'] > 0)
SEG = [(0, S2 - 1), (S2 - 1, S3 - 1), (S3 - 1, 36)]

seg = lambda k, a, b: sum(m[k] for m in SM[a:b])
avg = lambda k, a, b: seg(k, a, b) / (b - a)

rev_s = [seg('revenue', a, b) for a, b in SEG]
cap_s = [avg('layer', a, b) for a, b in SEG]
take_s = [100 * rev_s[i] * 12 / ((SEG[i][1] - SEG[i][0]) * cap_s[i]) for i in range(3)]

mix1 = {}
for m in SM[SEG[0][0]:SEG[0][1]]:
    for k in BCI:
        mix1[k[4:]] = mix1.get(k[4:], 0) + m[k]
    for k in PR:
        mix1[k[3:]] = mix1.get(k[3:], 0) + m[k]
s1_tot = sum(mix1.values())

# --- engine identities ---
for i, m in enumerate(SM):
    assert abs(m['revenue'] - (m['totalBci'] + m['totalPr'])) < 1e-6, \
        'revenue identity broken at month {}'.format(i + 1)
print('identity: revenue = totalBci + totalPr, all 36 months  ..... OK')

# --- the strategy's central claims must hold in the data ---
assert mix1.get('morpho', 0) / s1_tot < 0.10, \
    'Stage 1 deployed-capital yield should be a small minority of revenue'
assert take_s[0] > take_s[1] > take_s[2], \
    'take on capital must decline across stages — the document asserts it does'
assert SM[4]['annG'] > SM[35]['annG'], \
    'AIG must decline across the horizon — the document asserts it does'
print('claim: Stage 1 is fee-driven, not yield-driven           ..... OK')
print('claim: take on capital declines across stages            ..... OK')
print('claim: AIG declines across the horizon                   ..... OK')

# --- budget allocation must tie to the cost model ---
sm_budget = sum(cm['opex']['sales_marketing'])   # whole horizon, not launch year
assert abs(sm_budget - 1_500_000) < 1, 'S&M must total $1,500,000, got {:,.0f}'.format(sm_budget)
print('budget: 36-month S&M line is {}  and totals $1.5M     ..... OK'.format(M(sm_budget)))

page_raw = open(os.path.join(ROOT, 'public/bound-gtm-strategy.html')).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page_raw)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = html.unescape(re.sub(r'<[^>]+>', ' ', page))

checks = [
    ('36-month revenue', M(sum(rev_s))),
    ('stage 1 revenue', M(rev_s[0])),
    ('stage 2 revenue', M(rev_s[1])),
    ('stage 3 revenue', M(rev_s[2])),
    ('stage 1 avg layer', M(cap_s[0])),
    ('stage 2 avg layer', M(cap_s[1])),
    ('stage 3 avg layer', M(cap_s[2])),
    ('stage 1 take', P2(take_s[0])),
    ('stage 2 take', P2(take_s[1])),
    ('stage 3 take', P2(take_s[2])),
    ('marketing budget', M(sm_budget)),
    ('layer month 36', M(SM[35]['layer'])),
    ('retail layer m36', M(SM[35]['retailLayerBal'])),
    ('private layer m36', M(SM[35]['privateLayerBal'])),
    ('AIG month 36', P(SM[35]['annG'])),
    ('stage 2 opens', 'Month ' + str(S2)),
    ('stage 3 opens', 'Month ' + str(S3)),
]
missing = [(l, v) for l, v in checks if v not in page]
if missing:
    print('\nFAIL — figures absent from the rendered page:')
    for l, v in missing:
        print('   {:<24} {}'.format(l, v))
    sys.exit(1)
for l, v in checks:
    print('  {:<24} {:>16}  OK'.format(l, v))

# --- messaging discipline: no claim that yield rises with scale ---
BANNED = [
    r'yield (?:will )?(?:rise|rises|increase|increases|grow)',
    r'(?:rising|higher|increasing) (?:yield|returns?|APY)',
    r'boost(?:s|ed)? (?:the )?yield',
    r'guaranteed? (?:return|yield)',
]
hits = []
for pat in BANNED:
    for m in re.finditer(pat, page, re.I):
        ctx = page[max(0, m.start() - 60):m.end() + 60].replace('\n', ' ')
        # The document is allowed to name the claim in order to rule it out.
        if re.search(r'\bnot\b|never|would contradict|discipline|no marketing asset', ctx, re.I):
            continue
        hits.append(ctx.strip())
if hits:
    print('\nFAIL — text implies yield rises with scale:')
    for h in hits[:8]:
        print('   …' + h + '…')
    sys.exit(1)
print('\n  no claim that yield rises with scale                 ..... OK')

charts = len(re.findall(r'class="cv"', page_raw))
assert charts >= 4, 'expected at least 4 charts, found {}'.format(charts)
print('  {} inline SVG charts rendered                         ..... OK'.format(charts))

print()
print('PASS — every derived figure appears in the rendered page, the')
print('       strategy\'s claims hold in the data, and the messaging')
print('       discipline in Chapter 6 is enforced.')
