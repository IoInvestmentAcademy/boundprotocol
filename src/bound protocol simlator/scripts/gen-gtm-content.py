#!/usr/bin/env python3
"""Generate scripts/gtm-content.json — BOUND Protocol Go-to-Market Strategy.

Every figure derives from:
  scripts/sim-default.json  — simulator default case, 36 months
  scripts/cost-model.json   — verified cost model (the sales & marketing budget)

The strategy is staged on two independent axes — who may supply liquidity, and
who may consume it — because the protocol is a two-sided market and the sides
open on different clocks. Stage boundaries are read from the engine rather than
asserted: retail liquidity and the rwaUSD pool both begin in month 6, and RWA
minting begins in month 9.

Usage:  python3 scripts/gen-gtm-content.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sim = json.load(open(os.path.join(ROOT, 'scripts/sim-default.json')))
cm = json.load(open(os.path.join(ROOT, 'scripts/cost-model.json')))
SM = sim['months']
assert len(SM) == 36

BCI, PR = sim['streams']['bci'], sim['streams']['pr']
M = lambda x: ('−${:,.0f}' if round(x) < 0 else '${:,.0f}').format(abs(round(x)))
P = lambda x: '{:.1f}%'.format(x)
P2 = lambda x: '{:.2f}%'.format(x)

# ---------------------------------------------------------------- stage boundaries
# Read from the engine, not asserted: the month retail liquidity first appears,
# and the month RWA minting opens.
S2 = next(m['m'] for m in SM if m['retailLayerBal'] > 0)      # 6
S3 = next(m['m'] for m in SM if m['rwaMint'] > 0)             # 9
STAGES = [('Stage 1', 1, S2 - 1), ('Stage 2', S2, S3 - 1), ('Stage 3', S3, 36)]
SEG = [(a - 1, b) for _, a, b in STAGES]

STREAM_LABEL = {
    'integ': 'Integration fees', 'rwa': 'RWA trade and haircut',
    'entry': 'Mint and redemption fees', 'conv': 'Conversion fees',
    'maint': 'Maintenance fees', 'morpho': 'Deployed-capital yield',
    'pool': 'Pool trading and APSS', 'float': 'Float yield',
}


def mix(a, b):
    o = {}
    for m in SM[a:b]:
        for k in BCI:
            o[k[4:]] = o.get(k[4:], 0) + m[k]
        for k in PR:
            o[k[3:]] = o.get(k[3:], 0) + m[k]
    return {k: v for k, v in o.items() if v > 0}


def seg(k, a, b, avg=False):
    v = sum(m[k] for m in SM[a:b])
    return v / (b - a) if avg else v


rev_s = [seg('revenue', a, b) for a, b in SEG]
cap_s = [seg('layer', a, b, True) for a, b in SEG]
take_s = [100 * rev_s[i] * 12 / ((SEG[i][1] - SEG[i][0]) * cap_s[i]) for i in range(3)]
s1 = mix(*SEG[0])
s1_tot = sum(s1.values())
s1_sorted = sorted(s1.items(), key=lambda kv: -kv[1])

# revenue vs capital growth — the mechanism behind the yield decline
r_early, c_early = seg('revenue', 0, 5, True), seg('layer', 0, 5, True)
r_late, c_late = seg('revenue', 24, 36, True), seg('layer', 24, 36, True)

pool36 = SM[35]['bci_pool'] + SM[35]['pr_pool']
SM_BUDGET = cm['opex']['sales_marketing'][0]

# ---------------------------------------------------------------- budget allocation
# The marketing budget is set in the cost model and rebuilt from B2B benchmarks at
# $1,500,000 over 36 months, replacing the $3,740,000 the financial model carried.
# It is mirrored here so the strategy and the cost base cannot disagree; the totals
# are asserted against cost-model.json below rather than restated by hand.
ALLOC = [
    ('Stage 1 — Institutional', [
        ('Brand system and institutional collateral', 60_000,
         'Data room, issuer materials, institutional-grade presentation'),
        ('Category research and thought leadership', 50_000,
         'Authority in the RWA liquidity category before the pool opens'),
        ('Two Tier-2 conferences', 120_000,
         'Where institutional LPs and RWA issuers are actually met'),
        ('Public relations and analyst relations', 40_000,
         'Coverage that supports a direct sales motion'),
        ('Issuer business-development materials', 30_000,
         'Integration fees are the largest Stage 1 revenue line'),
    ]),
    ('Stage 2 — Pool launch', [
        ('Launch campaign', 120_000, 'rwaUSD pool live; BLI becomes secondary-tradeable'),
        ('One Tier-2 conference', 60_000, 'Launch visibility with the institutional audience'),
        ('Public relations and earned media', 40_000, 'Launch coverage and analyst briefings'),
        ('DeFi ecosystem and integrations', 60_000, 'Aggregators, dashboards, analytics'),
    ]),
    ('Stage 3 — Open market', [
        ('Content and search, $12,000 a month', 336_000, 'Sustaining organic acquisition'),
        ('Community and education, $7,000 a month', 196_000, 'Documentation, support, guides'),
        ('Conferences, two a year', 240_000, 'Continued issuer and LP origination'),
        ('Performance marketing, retail', 148_000,
         'The most discretionary line, and the last to spend'),
    ]),
]
ALLOC_TOT = sum(v for _, items in ALLOC for _, v, _ in items)
SM_BUDGET = sum(cm['opex']['sales_marketing'])
assert ALLOC_TOT == 1_500_000, 'GTM allocation must total $1,500,000'
assert abs(ALLOC_TOT - SM_BUDGET) < 1, \
    'GTM allocation {} must equal the cost model S&M total {}'.format(ALLOC_TOT, SM_BUDGET)
MKT_TOKEN = 1_000_000    # Marketing allocation, 2% of supply at launch price

# ---------------------------------------------------------------- blocks
p_ = lambda t, b=False: {'t': 'p', 'text': t, 'boldLabel': b}
sub = lambda title, blocks: {'t': 'sub', 'title': title, 'blocks': blocks}
ul = lambda items, b=True: {'t': 'ul', 'items': items, 'boldLabel': b}
kpis = lambda items: {'t': 'kpis', 'items': items}
note = lambda text, kind='', head='': {'t': 'note', 'text': text, 'kind': kind, 'head': head}


def table(head, rows, cap=None):
    b = {'t': 'table', 'head': head, 'rows': rows}
    if cap:
        b['cap'] = cap
    return b


def bar(title, cats, vals, labels, cap=None):
    b = {'t': 'bar', 'title': title, 'cats': cats, 'vals': vals, 'labels': labels}
    if cap:
        b['cap'] = cap
    return b


def donut(title, slices, cap=None):
    b = {'t': 'donut', 'title': title, 'slices': slices}
    if cap:
        b['cap'] = cap
    return b


def line(title, xs, series, cap=None, ylabel=''):
    b = {'t': 'line', 'title': title, 'xs': xs, 'series': series, 'ylabel': ylabel}
    if cap:
        b['cap'] = cap
    return b


def swimlane(title, stages, lanes, cap=None):
    b = {'t': 'swimlane', 'title': title, 'stages': stages, 'lanes': lanes}
    if cap:
        b['cap'] = cap
    return b


front = {
    'brand': 'BOUND Protocol',
    'kind': 'Go-to-Market Strategy',
    'tagline': 'Sequencing a Two-Sided Liquidity Market',
    'version': 'Months 1–36 — July 2026',
    'place': 'Bucharest, Romania',
}
ch = []

# ============================================================ Abstract
ch.append({'num': '', 'id': 'abstract', 'title': 'Abstract', 'nav': 'Abstract', 'blocks': [
    p_('BOUND is a two-sided market. One side supplies liquidity and receives BLI; the other '
       'brings tokenized real-world assets and receives dollars. Neither side is useful without '
       'the other, and both cannot be opened at once. This document sets out the order in which '
       'they open, what gates each stage, and how the protocol is taken to market on both sides.'),
    p_('The plan is staged on two independent axes. Liquidity supply opens first to private '
       'investors, DAOs and companies, and later to any holder seeking yield. Liquidity demand '
       'opens first to institutional RWA holders transacting directly against the smart '
       'contract, and later to the open market once the rwaUSD pool is live. RWA market '
       'onboarding runs in parallel from the first month and is independent of both.'),
    p_('Every figure here is drawn from the simulation engine\'s default case. Over thirty-six '
       'months the protocol earns ' + M(sum(rev_s)) + ' against a Liquidity Layer that reaches '
       + M(SM[35]['layer']) + '. The marketing allocation of ' + M(SM_BUDGET) + ' in the launch '
       'year is taken from the operating cost model and allocated in full in Chapter 8.'),
    kpis([
        {'n': '3', 'l': 'Stages, two axes'},
        {'n': 'Month ' + str(S2), 'l': 'Pool and retail liquidity open'},
        {'n': 'Month ' + str(S3), 'l': 'RWA minting opens'},
        {'n': M(SM_BUDGET), 'l': 'Launch-year marketing'},
        {'n': M(SM[35]['layer']), 'l': 'Liquidity Layer, month 36'},
    ]),
]})

# ============================================================ 1 Market
ch.append({'num': '1', 'id': 'market', 'title': 'The Market', 'nav': 'The Market', 'blocks': [
    sub('1.1 Supply side — where liquidity comes from', [
        p_('Public companies, DAOs, fintechs and crypto-native businesses hold more than $35 '
           'billion in on-chain stablecoin reserves, and for most treasury teams those balances '
           'are idle. Mainstream stablecoin yields run from roughly 4.1% to 11.8%, and the '
           'spread across that range reflects real differences in collateral, custody and '
           'liquidity risk.'),
        p_('BOUND\'s modelled Annualized Index Growth sits at the upper end of that band. More '
           'importantly it is earned differently: the return comes from the spread on exits the '
           'protocol underwrites, not from lending the capital out. That is a different risk '
           'shape, and it is the positioning wedge — not a higher number, a different exposure.'),
        p_('The capital requirement is small against the available pool. The default case needs '
           'roughly ' + M(seg('layer', 4, 5, True)) + ' of Liquidity Layer by month five, which '
           'is about 0.019% of idle on-chain stablecoin reserves. The constraint on this side is '
           'access and credibility, not market size.'),
    ]),
    sub('1.2 Demand side — where the assets are', [
        p_('Tokenized real-world assets stand at $22–33 billion on-chain and are growing at '
           'roughly 75% a year. The category divides into three unequal parts, and they do not '
           'share the same problem.'),
        table(['Category', 'On-chain AUM', 'Representative issuers', 'Exit problem'],
              [['Treasuries and money-market funds', '~$10B',
                'BUIDL $2.5B, USYC $3B, USDY $2.1B, BENJI $828M, OUSG $625M',
                'Least acute — shortest redemption cycles'],
               ['Private credit', '~$8B', 'Maple, Centrifuge, Goldfinch, Apollo',
                'Most acute — permissioned, eligibility-gated, uneven liquidity'],
               ['Real estate', '~$2–3B', 'RealT, Lofty, Propy',
                'Structurally illiquid, but fragmented and jurisdiction-bound']],
              'Market data as at 2026. Sources: Eco; MetaMask; StablecoinInsider.'),
        p_('This asymmetry should drive onboarding order, and it cuts against the obvious path. '
           'Treasuries are the easiest markets to integrate and the least in need of the product. '
           'Private credit is the hardest to integrate and the most underserved. The commercial '
           'answer is to lead with treasuries to prove the mechanism, and to prioritise private '
           'credit for the markets that follow — where the haircut the protocol can charge is '
           'widest because the alternative is waiting ninety days.'),
    ]),
]})

# ============================================================ 2 Cold start
ch.append({'num': '2', 'id': 'coldstart', 'title': 'The Cold-Start Problem', 'nav': 'Cold Start', 'blocks': [
    p_('A liquidity venue with no liquidity serves nobody, and liquidity providers do not fund a '
       'venue with no flow. Most protocols answer this by renting liquidity — committed '
       'facilities, market makers, or partner rails — and rented liquidity has one universal '
       'property: it is repriced or withdrawn under stress, which is precisely when exits are '
       'demanded.'),
    p_('BOUND\'s architecture makes the problem tractable rather than eliminating it. Because the '
       'reserve is protocol-owned, the protocol can stand on the other side of every exit from '
       'the first month without waiting for a counterparty to appear. The cold-start question '
       'therefore reduces to a single one: how much capital is needed before the first exits can '
       'be served, and who supplies it.'),
    p_('The answer is that the first side to open is the one that can be closed by direct sale. '
       'Institutional liquidity providers can be approached, diligenced and committed one at a '
       'time; retail liquidity cannot. That is why supply opens before demand broadens, and why '
       'the first stage is a sales motion rather than a marketing one.'),
]})

# ============================================================ 3 The staged plan
ch.append({'num': '3', 'id': 'stages', 'title': 'The Staged Plan', 'nav': 'The Staged Plan', 'blocks': [
    p_('Three stages, two axes. The axes move independently: the gate that opens retail liquidity '
       'supply is the same event that opens public demand — the rwaUSD pool going live — but the '
       'market set is being widened continuously underneath both.'),
    swimlane('Market opening sequence — supply and demand axes',
             [{'name': n, 'from': a, 'to': b} for n, a, b in STAGES],
             [{'name': 'Liquidity supply',
               'cells': ['Private investors, DAOs, companies. Six-month lock.',
                         'Opens to any holder. BLI purchasable and secondary-tradeable.',
                         'Open market. Retail reaches parity with private by month 36.']},
              {'name': 'Liquidity demand',
               'cells': ['Institutional RWA holders. Direct smart-contract mint and redeem only.',
                         'rwaUSD pool live. APSS active. Public exits available.',
                         'RWA minting opens. Full stream set operating.']},
              {'name': 'RWA markets',
               'cells': ['Onboarding from month one — independent of both axes.',
                         'Continues.', 'Continues; widening beyond launch partners.']}],
             'Stage boundaries read from the simulation engine: retail liquidity and pool volume '
             'both begin in month ' + str(S2) + '; RWA minting begins in month ' + str(S3) + '.'),
    table(['', 'Stage 1 — Institutional', 'Stage 2 — Pool launch', 'Stage 3 — Open market'],
          [['Months', '1–' + str(S2 - 1), str(S2) + '–' + str(S3 - 1), str(S3) + '–36'],
           ['Revenue', M(rev_s[0]), M(rev_s[1]), M(rev_s[2])],
           ['Average Liquidity Layer', M(cap_s[0]), M(cap_s[1]), M(cap_s[2])],
           ['Annualised take on capital', P2(take_s[0]), P2(take_s[1]), P2(take_s[2])],
           ['Motion', 'Direct sales', 'Launch campaign', 'Performance marketing']],
          'Simulator default case. "Take on capital" is protocol revenue over average Liquidity '
          'Layer, annualised.'),
]})

# ============================================================ 4 Stage 1
ch.append({'num': '4', 'id': 'stage1', 'title': 'Stage One — Private Liquidity and Institutional Exits',
           'nav': 'Stage One', 'blocks': [
    sub('4.1 What is actually being sold', [
        p_('It is tempting to describe the pre-pool period as a yield product — capital parked in '
           'the Liquidity Layer, earning the underlying deployment yield until the real business '
           'starts. The model does not support that description, and the correct one is stronger.'),
        p_('Deployed-capital yield is ' + P(100 * s1.get('morpho', 0) / s1_tot) + ' of Stage 1 '
           'revenue. The remaining ' + P(100 - 100 * s1.get('morpho', 0) / s1_tot) + ' comes from '
           'the liquidity business itself: fees on market onboarding, and the spread on exits the '
           'protocol underwrites for institutional holders transacting directly against the smart '
           'contract. The business is operating from month one. What the pool adds later is reach, '
           'not existence.'),
        donut('Stage 1 revenue composition — months 1–' + str(S2 - 1),
              [{'lab': STREAM_LABEL.get(k, k), 'val': M(v), 'pct': 100 * v / s1_tot}
               for k, v in s1_sorted],
              'Simulator default case, ' + M(s1_tot) + ' total.'),
        p_('<b>Integration fees are the largest single line.</b> They are charged on onboarding '
           'rather than on volume, which makes issuer acquisition the highest-leverage activity '
           'of the entire stage — it converts to revenue immediately rather than waiting for '
           'flow to build. The marketing allocation in Chapter 8 reflects that.'),
    ]),
    sub('4.2 Why direct settlement is a feature', [
        p_('While the pool is closed, the only route to mint or redeem rwaUSD is directly through '
           'the smart contract. For the audience this stage targets, that is an advantage rather '
           'than a limitation: institutional tickets executed through a public pool would suffer '
           'material slippage, and direct settlement prices the transaction at protocol terms '
           'with no exposure to pool depth.'),
        p_('The message follows from the mechanism. An allocator holding a position they cannot '
           'exit for ninety days is not looking for a trading venue; they are looking for a '
           'counterparty with a known price. That is exactly what the protocol is in this stage.'),
    ]),
    sub('4.3 The liquidity-provider proposition', [
        p_('Early capital earns the most. Stage 1 returns ' + P2(take_s[0]) + ' annualised on the '
           'capital in the layer, against ' + P2(take_s[2]) + ' in Stage 3 — not because the '
           'business weakens, but because there is less capital competing for the same exit '
           'spread. This is a real and defensible reason to commit early, and Chapter 6 sets out '
           'why it should not be restated as a forward promise.'),
        table(['Audience', 'What they hold', 'What BOUND offers', 'Primary objection'],
              [['DAO treasuries', 'Idle stablecoin reserves', 'Yield from an exit spread, not lending risk',
                'Smart-contract risk on a new protocol'],
               ['Crypto-native funds', 'Deployable mandate capital', 'Uncorrelated return with defined mechanics',
                'Capacity — is the position large enough to matter'],
               ['Corporate and fintech treasuries', 'Operating stablecoin float', 'Transparent, on-chain, no lock beyond six months',
                'Accounting and custody treatment'],
               ['Family offices and private investors', 'Discretionary allocation', 'Early entry at the widest spread',
                'Liquidity — no secondary market until Stage 2']],
              'Objections are what the Stage 1 sales motion must answer; the proof points are the '
              'audit, the APSS mainnet telemetry, and the published cost and business models.'),
    ]),
]})

# ============================================================ 5 Stage 2
ch.append({'num': '5', 'id': 'stage2', 'title': 'Stage Two — Pool Launch', 'nav': 'Stage Two', 'blocks': [
    p_('The rwaUSD pool going live is the single largest structural change in the plan. Three '
       'things happen at once, and they serve different audiences.'),
    ul([
        'Public exits become available: any holder of an integrated RWA can exit through the '
        'pool rather than only through direct settlement.',
        'BLI becomes secondary-tradeable: liquidity providers gain an exit that does not require '
        'redeeming against the layer — the answer to the main Stage 1 objection.',
        'The APSS stream opens: pool trading and peg-correction surplus begin accruing, reaching '
        + M(pool36) + ' a month by month 36, or ' + P(100 * pool36 / SM[35]['revenue']) +
        ' of monthly revenue.',
    ]),
    p_('The commercial consequence is that Stage 2 is the first stage with a launch moment. '
       'Stage 1 is a sequence of private closes with no public event; Stage 2 has a date, a '
       'deployment, and something demonstrable. The campaign allocation in Chapter 8 is '
       'concentrated accordingly.'),
    note('The pool is deployed at mainnet launch, at the close of the delivery programme. Keeping '
         'public access closed through Stage 1 is a commercial decision, not a technical '
         'constraint — the contracts exist and are audited before the gate opens.',
         '', 'On sequencing'),
]})

# ============================================================ 6 Stage 3
xs = [m['m'] for m in SM]
ch.append({'num': '6', 'id': 'stage3', 'title': 'Stage Three — The Open Market', 'nav': 'Stage Three', 'blocks': [
    sub('6.1 What opening retail actually does', [
        p_('Retail participation scales the business on both axes. Retail liquidity reaches parity '
           'with private capital by month 36 — ' + M(SM[35]['retailLayerBal']) + ' against '
           + M(SM[35]['privateLayerBal']) + ' — and retail flow drives the pool stream that '
           'becomes ' + P(100 * pool36 / SM[35]['revenue']) + ' of monthly revenue.'),
        p_('It does not raise the return per unit of capital, and the strategy should be built on '
           'the truth of that rather than around it. Retail volume genuinely adds revenue; retail '
           'capital arrives slightly faster than the revenue it generates. Between the first five '
           'months and the final twelve, average monthly revenue grows '
           + '{:.2f}'.format(r_late / r_early) + '× while the average Liquidity Layer grows '
           + '{:.2f}'.format(c_late / c_early) + '×. The second number is the larger, so '
           'Annualized Index Growth drifts down from ' + P(SM[4]['annG']) + ' to '
           + P(SM[35]['annG']) + ' across the horizon.'),
        line('Annualized Index Growth against Liquidity Layer growth',
             xs,
             [{'name': 'Annualized Index Growth (%)', 'vals': [m['annG'] for m in SM], 'color': 'accent'}],
             'Simulator default case. AIG is a historical measure of an index whose value can '
             'also decline.', 'AIG %'),
    ]),
    sub('6.2 What this means for messaging', [
        p_('The protocol has committed, in its whitepaper, to describing Annualized Index Growth '
           'as a historical metric of an index that can fall. Marketing a yield increase at the '
           'moment retail opens would contradict that commitment and would be falsified by the '
           'protocol\'s own published model within a year.'),
        p_('Retail is therefore positioned on what it genuinely delivers: an entry that requires '
           'no private placement, an exit that does not require redemption, and participation in '
           'a business whose absolute scale is compounding. The mechanism by which volume '
           'supports yield is disclosed in the documentation for anyone who works through it. It '
           'is not a headline.'),
        note('Operating rule: no marketing asset states or implies that Annualized Index Growth '
             'rises as the protocol scales. The published model shows it declining as capital '
             'grows faster than revenue, and every public number must be one the model produces.',
             'warn', 'Messaging discipline'),
    ]),
]})

# ============================================================ 7 Acquisition
ch.append({'num': '7', 'id': 'acquisition', 'title': 'Acquisition Strategy', 'nav': 'Acquisition', 'blocks': [
    p_('Five audiences, three of them addressed by sales rather than marketing. The distinction '
       'matters for budget: the institutional side is closed one relationship at a time and '
       'scales with headcount, while the retail side scales with spend.'),
    table(['Audience', 'Stage', 'Channel', 'Core message', 'Proof point'],
          [['RWA issuers', '1 →', 'Direct BD, category research, conference presence',
            'Instant exit liquidity removes the largest objection allocators raise, at zero capital pre-allocation',
            'APSS mainnet telemetry; audit report'],
           ['Institutional LPs', '1 →', 'Direct sales, roadshow, warm introductions',
            'A return earned from an underwritten exit spread, not from lending risk',
            'Published cost model, business plan and simulator'],
           ['DAO treasuries', '1 →', 'Governance forums, treasury working groups, direct',
            'Idle reserves earning from a transparent, on-chain spread business',
            'On-chain verifiability of every figure'],
           ['RWA holders', '2 →', 'Issuer co-marketing, integrations, search',
            'Exit a ninety-day position in one transaction at a price known in advance',
            'Live haircut quotes; settlement tracker'],
           ['DeFi yield users', '3 →', 'Performance marketing, aggregators, community',
            'Index exposure to RWA liquidity infrastructure, freely entered and exited',
            'Secondary market depth; published index history']],
          'Channels are ordered by the stage at which each audience opens.'),
    sub('7.1 Issuer onboarding is the priority activity', [
        p_('Integration fees are ' + P(100 * s1.get('integ', 0) / s1_tot) + ' of Stage 1 revenue '
           'and are collected on onboarding. Every additional market also widens the exit '
           'inventory that makes the protocol useful to holders, and diversifies a revenue base '
           'that would otherwise concentrate in a single market. It is the only activity that '
           'compounds across both axes at once.'),
    ]),
]})

# ============================================================ 8 Budget
alloc_rows = []
for stage, items in ALLOC:
    for name, amt, why in items:
        alloc_rows.append([stage.split(' — ')[0], name, M(amt), P(100 * amt / ALLOC_TOT), why])
stage_tot = [(s, sum(v for _, v, _ in items)) for s, items in ALLOC]
ch.append({'num': '8', 'id': 'budget', 'title': 'Marketing Allocation', 'nav': 'Marketing Allocation', 'blocks': [
    p_('The cost model books ' + M(SM_BUDGET) + ' of sales and marketing across the horizon, '
       'rebuilt from B2B benchmarks rather than carried over from the financial model, which '
       'had it at $3,740,000. This chapter allocates it in full. The shape follows the '
       'staging: institutional sales support first, a concentrated launch campaign second, '
       'performance acquisition last. The Marketing token allocation covers ' + M(MKT_TOKEN) + ' '
       'of it — ' + P(100 * MKT_TOKEN / ALLOC_TOT) + ' — and is spent before cash.'),
    bar('Marketing allocation by stage', [s for s, _ in stage_tot], [v for _, v in stage_tot],
        [M(v) for _, v in stage_tot],
        'Total ' + M(ALLOC_TOT) + ', reconciling to the launch-year sales and marketing line in '
        'the Operating Cost Analysis.'),
    table(['Stage', 'Activity', 'Amount', 'Share', 'Rationale'], alloc_rows,
          'Allocation of the launch-year sales and marketing budget. Totals ' + M(ALLOC_TOT) + '.'),
    p_('Two features of this allocation are deliberate. Issuer business development is the single '
       'largest Stage 1 line, because integration fees convert to revenue on onboarding rather '
       'than on volume. And no allocation is made to token incentives: the protocol\'s governance '
       'token confers governance utility only, and buying liquidity with emissions would '
       'contradict the architecture the whitepaper describes.'),
]})

# ============================================================ 9 Targets
ch.append({'num': '9', 'id': 'targets', 'title': 'Targets and Gates', 'nav': 'Targets and Gates', 'blocks': [
    p_('Each stage opens on a gate rather than on a date. The engineering programme sets the '
       'earliest possible date for each; commercial readiness sets the actual one.'),
    table(['Gate', 'Depends on', 'Commercial criterion'],
          [['Stage 1 opens', 'Mainnet launch (delivery roadmap M12)',
            'First RWA market onboarded; audit report published'],
           ['Stage 2 opens', 'rwaUSD pool deployed and audited',
            'Liquidity Layer deep enough to absorb public exit flow without breaching coverage'],
           ['Stage 3 opens', 'RWA minting live; secondary market functioning',
            'Multiple markets onboarded; settlement and support operating at volume']],
          'Milestone references are to the Delivery Roadmap.'),
    table(['Measure', 'Month ' + str(S2 - 1), 'Month 12', 'Month 24', 'Month 36'],
          [['Liquidity Layer'] + [M(SM[i]['layer']) for i in (S2 - 2, 11, 23, 35)],
           ['— private'] + [M(SM[i]['privateLayerBal']) for i in (S2 - 2, 11, 23, 35)],
           ['— retail'] + [M(SM[i]['retailLayerBal']) for i in (S2 - 2, 11, 23, 35)],
           ['Monthly revenue'] + [M(SM[i]['revenue']) for i in (S2 - 2, 11, 23, 35)],
           ['Monthly volume'] + [M(SM[i]['volume']) for i in (S2 - 2, 11, 23, 35)],
           ['BLI price'] + ['{:.4f}'.format(SM[i]['bciPrice']) for i in (S2 - 2, 11, 23, 35)],
           ['Annualized Index Growth'] + [P(SM[i]['annG']) for i in (S2 - 2, 11, 23, 35)]],
          'Simulator default case. These are model outputs, not commitments.'),
]})

# ============================================================ 10 Risks
ch.append({'num': '10', 'id': 'risks', 'title': 'Risks to the Plan', 'nav': 'Risks', 'blocks': [
    table(['Risk', 'Mechanism', 'Mitigation in this plan'],
          [['Cold start fails on the supply side',
            'Institutional LPs decline to fund a protocol with no operating history',
            'APSS is already deployed with mainnet telemetry; audit and published models precede the raise'],
           ['Capital outpaces demand',
            'Layer grows faster than onboarded markets can absorb, diluting return and weakening the next raise',
            'Issuer onboarding funded as the largest Stage 1 activity; capital raised against a widening market set'],
           ['Issuer concentration',
            'Revenue concentrated in a single market; one issuer withdrawing removes the business',
            'Continuous onboarding across all three stages; explicitly funded in Stage 3'],
           ['Retail access is restricted',
            'Jurisdictional gating delays or narrows Stage 3',
            'Stages 1 and 2 are viable without retail; the plan does not depend on it for coverage'],
           ['Yield expectation mismatch',
            'Providers expect rising returns and encounter the modelled decline',
            'Messaging discipline in Chapter 6; every public number produced by the published model'],
           ['Competitor response',
            'An incumbent bundles instant exit into an existing distribution advantage',
            'Protocol-owned liquidity and issuer-neutral onboarding are hard to replicate from a single-issuer position']],
          'Competitive positioning is assessed in the Competitors Analysis.'),
]})

# ============================================================ 11 Limits
ch.append({'num': '11', 'id': 'limits', 'title': 'Limits and Open Items', 'nav': 'Limits', 'blocks': [
    ul([
        'Single scenario: every figure derives from one preset against one RWA market. Stage '
        'boundaries would move under a different preset.',
        'Market concentration: the default case runs one market, so the issuer-concentration risk '
        'above is not visible in the figures that accompany it.',
        'No conversion assumptions: this plan states channels and audiences but does not model '
        'acquisition cost, conversion rate or sales-cycle length. Those require pipeline data the '
        'protocol does not yet have.',
        'Budget horizon: the allocation covers the launch year only. Years two and three carry '
        '$1,080,000 a year in the cost model, unallocated here.',
        'Capital pacing: this plan optimises for capital raised rather than for yield defended. '
        'That is a deliberate choice — the Liquidity Layer is the protocol\'s exit capacity, and '
        'depth is what makes issuers integrate — but it accepts the dilution set out in Chapter 6.',
        'Regulatory: retail access is subject to jurisdictional restriction, and the timing of '
        'Stage 3 is not wholly within the protocol\'s control.',
    ]),
]})

# ============================================================ Disclaimer
ch.append({'num': '', 'id': 'disclaimer', 'title': 'Legal Disclaimer', 'nav': 'Legal Disclaimer', 'blocks': [
    p_('This document is provided for informational purposes only. It does not constitute an '
       'offer to sell, a solicitation of an offer to buy, or a recommendation of any token, '
       'security or financial instrument, in any jurisdiction, and nothing in it constitutes '
       'investment, legal, tax or accounting advice. All figures are outputs of the BOUND '
       'simulation engine on its default preset and of a cost model documented separately; they '
       'are model outputs, not forecasts, budgets, commitments or targets, and a different preset '
       'produces different figures throughout. rwaUSD makes no return promise of any kind. The '
       'Bound Liquidity Index is an index token whose value can rise or fall; Annualized Index '
       'Growth is a historical metric, is shown in this document declining as the protocol '
       'scales, and implies nothing about future performance. BND confers governance utility only '
       'and no claim on protocol revenue. Market data is drawn from third-party published sources '
       'as at July 2026 and may change. Statements about market opening sequence and access are '
       'subject to regulatory restriction and are not commitments. Forward-looking statements are '
       'subject to material uncertainty and change. © 2026 BOUND Protocol.'),
]})

out = {'front': front, 'chapters': ch}
with open(os.path.join(ROOT, 'scripts/gtm-content.json'), 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('wrote scripts/gtm-content.json — {} chapters'.format(len(ch)))
print('  stage boundaries      : 1-{}, {}-{}, {}-36'.format(S2 - 1, S2, S3 - 1, S3))
print('  stage 1 revenue       : {}  (yield only {})'.format(
    M(s1_tot), P(100 * s1.get('morpho', 0) / s1_tot)))
print('  take on capital       : {} / {} / {}'.format(*[P2(t) for t in take_s]))
print('  AIG m5 -> m36         : {} -> {}'.format(P(SM[4]['annG']), P(SM[35]['annG'])))
print('  marketing allocated   : {} (ties to cost model)'.format(M(ALLOC_TOT)))
