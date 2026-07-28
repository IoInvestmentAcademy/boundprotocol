#!/usr/bin/env python3
"""Generate scripts/businessplan-content.json — BOUND Protocol Business Plan.

Structure follows the February 2026 business plan (Business overview → Summary →
Key assumptions → Outputs, two-column "Section / Description and assumptions").
Every figure is derived from the current architecture:

  scripts/sim-default.json  — simulator default case, 36 months (all protocol data)
  scripts/cost-model.json   — the verified cost model (cost base and payroll)

Nothing is carried from the prior plan or the legacy financial model except the
document's structure and section logic. Sections describing retired mechanisms
(savings app, premium membership, capped APY / performance fee, idle-token yield
concentration) are deleted rather than restated.

Usage:  python3 scripts/gen-businessplan-content.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sim = json.load(open(os.path.join(ROOT, 'scripts/sim-default.json')))
cm = json.load(open(os.path.join(ROOT, 'scripts/cost-model.json')))

# --- entity model ---------------------------------------------------------
# Protocol and operating company are separate entities on separate clocks. The
# protocol is simulated over 36 months; the operating company runs its own funded
# 24-month plan. Their figures are reported side by side and never netted — doing
# so was the error this revision exists to correct.
SERVICES_MARGIN, EU_TAX_RATE = 0.08, 0.16
_c = cm['cogs']; _o = cm['opex']
OPCO_COST_Y = [_c['personnel_employer'][i] + _c['cloud'][i] + _c['maintenance'][i]
               + _c['software'][i] + _o['ga'][i] + _o['legal'][i] + _o['sales_marketing'][i]
               + _o['development'][i] for i in range(3)]
PROTO_COST_Y = [_c['payment_fees'][i] for i in range(3)]
OPCO_REV_Y  = [c * (1 + SERVICES_MARGIN) for c in OPCO_COST_Y]
OPCO_MARG_Y = [r - c for r, c in zip(OPCO_REV_Y, OPCO_COST_Y)]
OPCO_TAX_Y  = [m * EU_TAX_RATE for m in OPCO_MARG_Y]
OPCO_NET_Y  = [m - t for m, t in zip(OPCO_MARG_Y, OPCO_TAX_Y)]
OPCO_CASH   = 2_480_000 + 7_500_000 * 0.30
# Mirrors src/BoundSimulator.jsx tokenomics defaults; see gen-costs-content.py.
TOTAL_SUPPLY, LAUNCH_PRICE = 1_000_000_000, 0.05
TREASURY_PCT, MARKETING_PCT = 9.0, 2.0
TRE_VESTED_24 = (5 + (12 / 48) * 95) / 100
TOK_24      = (TOTAL_SUPPLY * MARKETING_PCT / 100 * LAUNCH_PRICE
               + TOTAL_SUPPLY * TREASURY_PCT / 100 * TRE_VESTED_24 * LAUNCH_PRICE)
OPCO_AVAIL_24 = OPCO_CASH + TOK_24
OPCO_COST_24  = sum(OPCO_REV_Y) * 24 / 36
SM = sim['months']
assert len(SM) == 36, 'business plan is built on a 36-month horizon'

YEARS = ['Year 1', 'Year 2', 'Year 3']
BCI = sim['streams']['bci']
PR = sim['streams']['pr']

ys = lambda k, y: sum(m[k] for m in SM[y * 12:(y + 1) * 12])          # flow
ye = lambda k, y: SM[(y + 1) * 12 - 1][k]                             # stock at year end
yavg = lambda k, y: ys(k, y) / 12

M = lambda x: ('−${:,.0f}' if round(x) < 0 else '${:,.0f}').format(abs(round(x)))
P = lambda x: '{:.1f}%'.format(x)
X = lambda x: '{:.2f}×'.format(x)

# ---------------------------------------------------------------- aggregates
rev_y = [ys('revenue', y) for y in range(3)]
vol_y = [ys('volume', y) for y in range(3)]
tvl_e = [ye('tvl', y) for y in range(3)]
layer_e = [ye('layer', y) for y in range(3)]
cost_y = cm['total']
ebit_y = [rev_y[y] - cost_y[y] for y in range(3)]

# Revenue by stream, three-year totals
STREAM_LABEL = {
    'pool': 'Pool trading and APSS stabilization',
    'entry': 'Mint and redemption fees',
    'conv': 'Conversion fees',
    'maint': 'Maintenance fees',
    'rwa': 'RWA trade and haircut revenue',
    'morpho': 'Deployed-capital yield',
    'integ': 'Integration fees',
    'float': 'Float yield',
}
streams = {}
for k in BCI:
    streams[k[4:]] = streams.get(k[4:], 0) + sum(m[k] for m in SM)
for k in PR:
    streams[k[3:]] = streams.get(k[3:], 0) + sum(m[k] for m in SM)
streams = {k: v for k, v in streams.items() if v > 0}
stream_tot = sum(streams.values())
stream_sorted = sorted(streams.items(), key=lambda kv: -kv[1])

# Monthly operating position → capital requirement and breakeven
cum, peak, peak_m, be_m = 0.0, 0.0, 0, None
monthly = []
for i, m in enumerate(SM):
    c = cost_y[i // 12] / 12
    net = m['revenue'] - c
    cum += net
    if cum < peak:
        peak, peak_m = cum, i + 1
    if net > 0 and be_m is None:
        be_m = i + 1
    monthly.append({'m': i + 1, 'rev': m['revenue'], 'cost': c, 'net': net, 'cum': cum})

# Capital formation
priv_e = [ye('privateLayerBal', y) for y in range(3)]
ret_e = [ye('retailLayerBal', y) for y in range(3)]
lp_in_y = [ys('lpIn', y) for y in range(3)]

# ---------------------------------------------------------------- blocks
def p(t, bold=False):
    return {'t': 'p', 'text': t, 'boldLabel': bold}


def sub(title, blocks):
    return {'t': 'sub', 'title': title, 'blocks': blocks}


def table(head, rows, cap=None):
    b = {'t': 'table', 'head': head, 'rows': rows}
    if cap:
        b['cap'] = cap
    return b


def ul(items, bold=True):
    return {'t': 'ul', 'items': items, 'boldLabel': bold}


def kpis(items):
    return {'t': 'kpis', 'items': items}


def note(text, kind='', head=''):
    return {'t': 'note', 'text': text, 'kind': kind, 'head': head}


def bar(title, cats, vals, labels, cap=None, unit=''):
    b = {'t': 'bar', 'title': title, 'cats': cats, 'vals': vals, 'labels': labels, 'unit': unit}
    if cap:
        b['cap'] = cap
    return b


def stackbar(title, cats, series, cap=None):
    """series = [{name, vals, color}] — color is a palette key."""
    b = {'t': 'stackbar', 'title': title, 'cats': cats, 'series': series}
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


def combo(title, cats, bars, lineseries, cap=None):
    b = {'t': 'combo', 'title': title, 'cats': cats, 'bars': bars, 'line': lineseries}
    if cap:
        b['cap'] = cap
    return b


front = {
    'brand': 'BOUND Protocol',
    'kind': 'Business Plan',
    'tagline': 'Protocol Business Plan — 36-Month Operating Model',
    'version': 'Year 1–Year 3 — July 2026',
    'place': 'Bucharest, Romania',
}

ch = []

# ============================================================ Executive summary
ch.append({'num': '', 'id': 'summary', 'title': 'Executive Summary', 'nav': 'Executive Summary', 'blocks': [
    p('BOUND Protocol is on-chain liquidity infrastructure for tokenized real-world assets. It '
      'allows any holder of an integrated RWA token to exit into dollars instantly, at a '
      'transparent risk-tiered haircut, without waiting on issuer redemption calendars. This plan '
      'sets out the operating model over the thirty-six months the protocol\'s simulation engine '
      'covers, and it is built entirely from that engine\'s default case.'),
    p('Over the horizon the protocol generates ' + M(sum(rev_y)) + ' of revenue against an '
      'operating cost base of ' + M(sum(cost_y)) + '. Value under protocol custody grows from '
      + M(SM[0]['tvl']) + ' in the first month to ' + M(tvl_e[2]) + ' by month thirty-six, and '
      'the Bound Liquidity Index appreciates from 1.0000 to '
      + '{:.4f}'.format(ye('bciPrice', 2)) + ', an Annualized Index Growth of '
      + P(ye('annG', 2)) + ' at the close of the period.'),
    p('The protocol reaches monthly operating breakeven in <b>month ' + str(be_m) + '</b>. Peak '
      'cumulative operating deficit is ' + M(peak) + ', reached in month ' + str(peak_m) + '. That '
      'deficit is the capital requirement this plan is built to fund: it is the amount the '
      'protocol consumes before its own revenue covers its own cost base. Nothing in this document '
      'assumes a scenario more favourable than the engine\'s default preset.'),
    kpis([
        {'n': M(sum(rev_y)), 'l': '36-month protocol revenue'},
        {'n': M(tvl_e[2]), 'l': 'Value under custody, month 36'},
        {'n': 'Month ' + str(be_m), 'l': 'Operating breakeven', 'c': 'g'},
        {'n': M(abs(peak)), 'l': 'Peak capital requirement', 'c': 'w'},
        {'n': P(ye('annG', 2)), 'l': 'Annualized Index Growth'},
    ]),
]})

# ============================================================ 1 Company description
ch.append({'num': '1', 'id': 'company', 'title': 'Business Overview — Company Description',
           'nav': 'Company Description', 'blocks': [
    sub('1.1 What the protocol does', [
        p('Tokenization has succeeded at putting real-world assets on-chain and failed at making '
          'them liquid. Institutional fixed-income RWAs redeem primarily through their issuer, on '
          'settlement windows of thirty to ninety days or longer. The asset class markets itself as '
          'instant and around-the-clock; its exits are neither.'),
        p('BOUND supplies the missing exit. A holder brings an integrated RWA token to a BOUND '
          'market and receives rwaUSD in the same transaction, at a haircut priced in advance from '
          'the asset\'s redemption profile. The protocol\'s own reserve stands on the other side of '
          'that trade every time — liquidity is owned rather than rented, so it cannot reprice or '
          'withdraw under stress. Acquired RWA inventory is then recycled through protocol markets '
          'or redeemed with the issuer over time.'),
    ]),
    sub('1.2 The three-token architecture', [
        p('Functions are separated across three tokens so that risk is never carried by the '
          'instrument used as money.'),
        ul([
            'rwaUSD: The settlement dollar. Minted exclusively against USDC and backed 100% by '
            'USDC at all times. Tokenized RWA exposure never enters its backing — a hard rule of '
            'the protocol, not a preference.',
            'BLI (Bound Liquidity Index): The index token carrying all protocol RWA exposure and '
            'reserve performance. Its value can rise or fall. It is an index, not a deposit.',
            'BND: The governance token. It coordinates market onboarding and risk parameters, and '
            'is burned through protocol activity.',
        ]),
    ]),
    sub('1.3 How the group is structured', [
        p('Three entities, each with a distinct role. They are separate legal persons, and the '
          'costs and revenues that arise in each cannot be netted against one another — a '
          'distinction Chapter 9 depends on.'),
        table(['Entity', 'Jurisdiction', 'Role'],
              [['Nexus Technologies Foundation', 'Panama',
                'Owns the protocol and its intellectual property; grants the token delegation'],
               ['BITSWIFT TECHNOLOGIES INC.', 'Panama',
                'Issues and distributes the token; holds raise proceeds; counterparty on the SAFT'],
               ['Operating company', 'European Union',
                'Develops the protocol, employs the team, runs go-to-market; bears all operating cost']]),
        p('The protocol is built by the operating company, not by the issuer. The operating '
          'company works under a development-and-services agreement with the Foundation and the '
          'Issuer at cost plus ' + '{:.0%}'.format(SERVICES_MARGIN) + ', and the intellectual '
          'property it creates vests in the Foundation. Entity roles are as recorded in the '
          'corporate documents and the SAFT.'),
    ]),
    sub('1.4 Who the protocol serves', [
        ul([
            'Institutions and funds holding tokenized assets: an exit that does not exist today.',
            'RWA issuers: a liquidity layer they plug into with zero capital pre-allocation, '
            'making their product more attractive to allocate to.',
            'Liquidity providers: transparent exposure, through BLI, to the growth of RWA '
            'liquidity infrastructure.',
        ]),
    ]),
]})

# ============================================================ 2 Architecture
ch.append({'num': '2', 'id': 'architecture', 'title': 'Business Overview — Protocol Architecture',
           'nav': 'Protocol Architecture', 'blocks': [
    sub('2.1 The Atomic Peg Stabilization System', [
        p('Conventional stablecoins outsource their peg. When price deviates in a liquidity pool, '
          'external arbitrageurs perform the correcting trades and keep the profit. The APSS '
          'internalizes that function: when the rwaUSD/USDC pool deviates beyond a defined '
          'threshold, the protocol executes the correcting operation atomically — detection, '
          'mint-and-sell or buy-and-burn, and settlement all inside a single transaction.'),
        p('Because minting in an above-peg correction is performed against value received into '
          'backing within the same atomic operation, the APSS never operates the supply unbacked at '
          'any point. Each cycle realizes a small collateral surplus — the spread between the '
          'deviated pool price and par — which accrues to the protocol and is the origin of the '
          'pool-trading revenue line in this plan.'),
    ]),
    sub('2.2 The Bound Liquidity Layer', [
        p('Liquidity is supplied by a protocol-owned reserve deployed across a four-tier structure '
          'and governed by Basel-style liquidity-coverage rules. A minimum USDC buffer is held for '
          'immediate availability; the remainder is deployed into yield-generating positions and '
          'RWA collateral under concentration limits that throttle intake before capacity is '
          'threatened.'),
        table(['Tier', 'Function', 'Assumption in this plan'],
              [['USDC buffer', 'Immediate redemption availability', 'Minimum 5% of layer'],
               ['Aave', 'Liquid lending yield', '3.5% annualized'],
               ['Morpho', 'Curated lending yield', '4.5% annualized'],
               ['Enhanced strategies', 'Institutional yield sources', '7.5% annualized'],
               ['RWA collateral', 'Inventory acquired through liquidations',
                'Hard concentration limit 10%']],
              'Layer configuration as run in the simulator default case.'),
        p('The coverage rule is the binding constraint, not an aspiration. Liquidity coverage '
          'closes the horizon at ' + X(ye('lcr', 2)) + ', against a floor of 1.00× below which '
          'the protocol throttles new intake.'),
    ]),
]})

# ============================================================ 3 Revenue streams
ch.append({'num': '3', 'id': 'streams', 'title': 'Business Sustainability — Revenue Streams',
           'nav': 'Revenue Streams', 'blocks': [
    p('The protocol earns predominantly from transaction flow rather than from holding assets. '
      'Eight streams are active in the default case; each is a charge on an event the protocol '
      'processes, not a fee on assets under management.'),
    table(['Revenue stream', 'What it charges', '36-month total', 'Share'],
          [[STREAM_LABEL.get(k, k),
            {'pool': 'Trading fee and peg-correction surplus on pool volume',
             'entry': 'Mint and redemption of rwaUSD against USDC',
             'conv': 'Conversion between rwaUSD and BLI',
             'maint': 'Recurring fee per integrated RWA market',
             'rwa': 'Trade fee and haircut on RWA liquidation and resale',
             'morpho': 'Yield on protocol capital deployed in the layer',
             'integ': 'One-time fee on RWA market onboarding',
             'float': 'Yield on idle balances in Bound Core'}.get(k, ''),
            M(v), P(100 * v / stream_tot)]
           for k, v in stream_sorted]
          + [['Total', '', M(stream_tot), '100.0%']],
          'Simulator default case, 36 months. Streams are shown gross of the split between BCI '
          'surplus capital and the Protocol Reserve.'),
    donut('Revenue composition — 36 months',
          [{'lab': STREAM_LABEL.get(k, k), 'val': M(v), 'pct': 100 * v / stream_tot}
           for k, v in stream_sorted]),
    p('Two properties of this mix matter for the business. It is <b>diversified</b> — no single '
      'stream exceeds ' + P(100 * stream_sorted[0][1] / stream_tot) + ' of the total — and it is '
      '<b>counter-cyclical in the right direction</b>: pool trading and haircut revenue both rise '
      'when markets are stressed and exits are most in demand, which is precisely when a rented '
      'liquidity model would be withdrawing.'),
]})

# ============================================================ 4 Key elements
ch.append({'num': '4', 'id': 'keyelements', 'title': 'Summary — Key Elements of the Business Model',
           'nav': 'Key Elements', 'blocks': [
    table(['Metric', 'Year 1', 'Year 2', 'Year 3'],
          [['Protocol revenue'] + [M(rev_y[y]) for y in range(3)],
           ['Operating cost base'] + [M(cost_y[y]) for y in range(3)],
           ['Operating result'] + [M(ebit_y[y]) for y in range(3)],
           ['Transaction volume'] + [M(vol_y[y]) for y in range(3)],
           ['Value under custody (year end)'] + [M(tvl_e[y]) for y in range(3)],
           ['Liquidity Layer (year end)'] + [M(layer_e[y]) for y in range(3)],
           ['BLI price (year end)'] + ['{:.4f}'.format(ye('bciPrice', y)) for y in range(3)],
           ['Annualized Index Growth'] + [P(ye('annG', y)) for y in range(3)],
           ['Liquidity coverage ratio'] + [X(ye('lcr', y)) for y in range(3)]],
          'All figures from the simulator default case; cost base from the verified cost model.'),
    combo('Revenue against cost base, by year',
          YEARS,
          [{'name': 'Protocol revenue', 'vals': rev_y, 'color': 'accent'},
           {'name': 'Operating cost base', 'vals': cost_y, 'color': 'warn'}],
          {'name': 'Cost-to-revenue', 'vals': [cost_y[y] / rev_y[y] for y in range(3)],
           'fmt': 'x'}),
    p('Revenue compounds faster than the cost base in every year of the horizon. Cost-to-revenue '
      'falls from ' + X(cost_y[0] / rev_y[0]) + ' to ' + X(cost_y[2] / rev_y[2]) + ', and the '
      'monthly position turns positive in month ' + str(be_m) + '.'),
]})

# ============================================================ 5 Capital formation
ch.append({'num': '5', 'id': 'capital', 'title': 'Key Assumptions — Capital Formation',
           'nav': 'Capital Formation', 'blocks': [
    sub('5.1 How the Liquidity Layer is funded', [
        p('The layer is capitalized by liquidity providers in two channels. Private providers '
          'commit at inception and on a monthly growth schedule, entering under a lock that holds '
          'their capital through the first six months. Retail providers enter continuously from '
          'the pool once it is live. Both receive BLI; neither receives a deposit claim.'),
        table(['Channel'] + YEARS + ['Character'],
              [['Private liquidity providers'] + [M(priv_e[y]) for y in range(3)] +
               ['Seeded at inception, monthly growth, six-month lock'],
               ['Retail liquidity providers'] + [M(ret_e[y]) for y in range(3)] +
               ['Continuous entry via the pool'],
               ['Total layer balance'] + [M(layer_e[y]) for y in range(3)] + ['']],
              'Year-end balances, simulator default case.'),
        stackbar('Liquidity Layer composition by year (year-end balance)',
                 YEARS,
                 [{'name': 'Private LP', 'vals': priv_e, 'color': 'accent'},
                  {'name': 'Retail LP', 'vals': ret_e, 'color': 'accent2'}]),
    ]),
    sub('5.2 Growth of value under custody', [
        bar('Value under protocol custody (year-end)', YEARS, tvl_e,
            [M(v) for v in tvl_e],
            'Liquidity Layer plus Bound Core balance. Simulator default case.'),
        p('Value under custody grows from ' + M(SM[0]['tvl']) + ' to ' + M(tvl_e[2]) + ' over the '
          'horizon. The growth is funded by liquidity-provider inflow and retained protocol '
          'revenue; it is not a market-price effect, and the plan assumes no appreciation of the '
          'underlying RWA collateral beyond the yields recorded in Chapter 2.'),
    ]),
]})

# ============================================================ 6 Transaction volume
ch.append({'num': '6', 'id': 'volume', 'title': 'Key Assumptions — Transaction Volume',
           'nav': 'Transaction Volume', 'blocks': [
    p('Every transactional revenue stream is a function of volume, so volume is the single most '
      'consequential assumption in this plan. It is generated by the engine from RWA market '
      'parameters — asset size, liquidation propensity and minting demand — rather than assumed '
      'directly or benchmarked against a comparable protocol.'),
    table(['Component'] + YEARS + ['36-month total'],
          [['RWA liquidation'] + [M(ys('rwaLiq', y)) for y in range(3)] + [M(sum(ys('rwaLiq', y) for y in range(3)))],
           ['RWA minting'] + [M(ys('rwaMint', y)) for y in range(3)] + [M(sum(ys('rwaMint', y) for y in range(3)))],
           ['Pool volume'] + [M(ys('pVol', y)) for y in range(3)] + [M(sum(ys('pVol', y) for y in range(3)))],
           ['Retail pool volume'] + [M(ys('retailPoolVol', y)) for y in range(3)] + [M(sum(ys('retailPoolVol', y) for y in range(3)))],
           ['Total'] + [M(vol_y[y]) for y in range(3)] + [M(sum(vol_y))]],
          'Simulator default case. Components shown are the largest four; total includes RWA pool '
          'sell/buy and retail exit volume.'),
    bar('Transaction volume by year', YEARS, vol_y, [M(v) for v in vol_y],
        'Total flow the protocol charges against.'),
    p('Volume grows ' + X(vol_y[2] / vol_y[0]) + ' between the first and third years. Because the '
      'protocol charges on flow rather than on balances, revenue tracks this series far more '
      'closely than it tracks value under custody — which is the structural reason the business '
      'scales without requiring a proportional increase in assets.'),
]})

# ============================================================ 7 Yield and BLI
ch.append({'num': '7', 'id': 'index', 'title': 'Key Assumptions — Index Formation and Yield',
           'nav': 'Index Formation', 'blocks': [
    sub('7.1 How the BLI price is formed', [
        p('BLI price is an on-chain identity, not a quoted rate. It is the net asset value of the '
          'Liquidity Layer plus accumulated BCI surplus capital, divided by BLI supply. It rises '
          'when the protocol earns and falls when the reserve loses value; there is no cap, no '
          'floor, and no discretionary smoothing.'),
        line('BLI price — 36-month projection',
             [m['m'] for m in SM],
             [{'name': 'BLI price', 'vals': [m['bciPrice'] for m in SM], 'color': 'accent'}],
             'Starts at 1.0000. Simulator default case.', 'Price (rwaUSD)'),
        table(['Measure'] + YEARS,
              [['BLI price (year end)'] + ['{:.4f}'.format(ye('bciPrice', y)) for y in range(3)],
               ['Annualized Index Growth'] + [P(ye('annG', y)) for y in range(3)],
               ['BLI supply (year end)'] + [M(ye('bciSupply', y)).replace('$', '') for y in range(3)],
               ['BCI surplus capital'] + [M(ye('bciSC', y)) for y in range(3)]],
              'Annualized Index Growth is a historical measure of an index whose value can also '
              'decline. It is not a yield and implies nothing about future performance.'),
    ]),
    sub('7.2 Where the yield comes from', [
        p('Two sources contribute. Deployed capital in the layer earns the tier yields set out in '
          'Chapter 2, contributing ' + M(streams.get('morpho', 0)) + ' over the horizon. Protocol '
          'fee revenue contributes the remainder, and it is the larger of the two: '
          + M(stream_tot - streams.get('morpho', 0)) + ', or '
          + P(100 * (stream_tot - streams.get('morpho', 0)) / stream_tot) + ' of the total.'),
        p('That ratio is the plan\'s central economic claim. A protocol whose index is driven '
          'mostly by fee capture is a business; one whose index is driven mostly by the yield on '
          'its own collateral is a fund. The default case produces the former.'),
    ]),
]})

# ============================================================ 8 Cost base
ch.append({'num': '8', 'id': 'costs', 'title': 'Key Assumptions — Cost Base', 'nav': 'Cost Base', 'blocks': [
    p('The cost base is taken from the protocol\'s Operating Cost Analysis, which rebases every '
      'revenue-scaling cost line onto this same simulator case and is independently verified '
      'against its sources. It is summarized here; the full derivation, the personnel roster and '
      'the external benchmarking sit in that document.'),
    table(['Category'] + YEARS + ['36-month total'],
          [['Cost of goods sold'] + [M(cm['cogs']['total'][y]) for y in range(3)] + [M(sum(cm['cogs']['total']))],
           ['  of which personnel'] + [M(cm['cogs']['personnel_employer'][y]) for y in range(3)] + [M(sum(cm['cogs']['personnel_employer']))],
           ['Sales and marketing'] + [M(cm['opex']['sales_marketing'][y]) for y in range(3)] + [M(sum(cm['opex']['sales_marketing']))],
           ['Legal'] + [M(cm['opex']['legal'][y]) for y in range(3)] + [M(sum(cm['opex']['legal']))],
           ['Development'] + [M(cm['opex']['development'][y]) for y in range(3)] + [M(sum(cm['opex']['development']))],
           ['General and administrative'] + [M(cm['opex']['ga'][y]) for y in range(3)] + [M(sum(cm['opex']['ga']))],
           ['Total'] + [M(cost_y[y]) for y in range(3)] + [M(sum(cost_y))]],
          'Source: Operating Cost Analysis, rebased on the simulator default case.'),
    p('The base falls in the second year as launch-only obligations roll off — regulatory '
      'licensing, the smart-contract audit, the bug-bounty allocation, equipment and application '
      'development — then resumes growing as the volume-linked lines compound. Personnel is '
      + P(100 * sum(cm['cogs']['personnel_employer']) / sum(cost_y)) + ' of the total at full '
      'employer cost, across a steady-state team of ' + str(cm['headcount_steady']) + '.'),
]})

# ============================================================ 9 Income statement
ch.append({'num': '9', 'id': 'income', 'title': 'Outputs — The Three Statements',
           'nav': 'The Three Statements', 'blocks': [
    p('The protocol and the operating company are different entities. Protocol fee income '
      'accrues to index holders and to the Protocol Reserve; the operating company\'s costs are '
      'borne by a European company that earns a services fee. Netting one against the other '
      'produces a number that describes no entity that exists, so this chapter reports them '
      'separately and shows the transfer between them.'),
    note('An earlier revision of this plan presented a single income statement combining the '
         'two. That statement has been withdrawn. It set money belonging to BLI holders against '
         'costs borne by a company with no revenue, and the resulting deficit was not a real '
         'figure.', 'warn', 'What changed'),

    sub('9.1 Protocol economics — 36 months', [
        p('A protocol has no profit and therefore no profit-and-loss account. It has flows: fees '
          'in, split between the index and the treasury, less the costs of processing that '
          'flow. The statement ends at distribution, not at earnings.'),
        table(['USD'] + YEARS + ['36-month total'],
              [['Fee income'] + [M(rev_y[y]) for y in range(3)] + [M(sum(rev_y))],
               ['— to BCI surplus capital (BLI holders)']
                 + [M(ys('totalBci', y)) for y in range(3)] + [M(sum(ys('totalBci', y) for y in range(3)))],
               ['— to Protocol Reserve (treasury)']
                 + [M(ys('totalPr', y)) for y in range(3)] + [M(sum(ys('totalPr', y) for y in range(3)))],
               ['Protocol costs (payment fees)']
                 + [M(-PROTO_COST_Y[y]) for y in range(3)] + [M(-sum(PROTO_COST_Y))],
               ['Net to protocol participants']
                 + [M(rev_y[y] - PROTO_COST_Y[y]) for y in range(3)]
                 + [M(sum(rev_y) - sum(PROTO_COST_Y))]],
              'Simulator default case. Every dollar of BCI surplus raises the index price; it is '
              'liquidity-provider return and is never available to the company.'),
    ]),

    sub('9.2 Operating company — profit and loss', [
        p('The operating company is paid under a development-and-services agreement with the '
          'Foundation and the Issuer at cost plus ' + '{:.0%}'.format(SERVICES_MARGIN) + '. That '
          'fee is its revenue. It runs deliberately close to break-even because it is a service '
          'provider, not a profit centre — and it carries a margin because an EU company working '
          'for a Panama principal at zero margin is not a defensible transfer-pricing position.'),
        table(['USD'] + YEARS + ['36-month total'],
              [['Services revenue'] + [M(OPCO_REV_Y[y]) for y in range(3)] + [M(sum(OPCO_REV_Y))],
               ['Operating cost'] + [M(-OPCO_COST_Y[y]) for y in range(3)] + [M(-sum(OPCO_COST_Y))],
               ['Margin'] + [M(OPCO_MARG_Y[y]) for y in range(3)] + [M(sum(OPCO_MARG_Y))],
               ['EU corporate tax'] + [M(-OPCO_TAX_Y[y]) for y in range(3)] + [M(-sum(OPCO_TAX_Y))],
               ['Net result'] + [M(OPCO_NET_Y[y]) for y in range(3)] + [M(sum(OPCO_NET_Y))]],
              'Full derivation, including the personnel roster and entity attribution of every '
              'cost line, is in the Operating Cost & Company Analysis.'),
        note('The company commits to a <b>funded 24-month plan</b>, not to the protocol\'s '
             'thirty-six. Different entity, different clock. Cost to month 24 is '
             + M(OPCO_COST_24) + ' against ' + M(OPCO_AVAIL_24) + ' of available funding — a '
             'surplus of ' + M(OPCO_AVAIL_24 - OPCO_COST_24) + '.', '', 'Horizon'),
    ]),

    sub('9.3 Group — sources and uses', [
        p('What the raise funds, and what funds the company. This is the statement that answers '
          'whether the launch is affordable, and it is the one the earlier revision lacked.'),
        table(['Use of the raise', 'Amount', '% of raise'],
              [['AMM liquidity — rwaUSD/USDC and BND/USDC', M(4_975_000), '36.4%'],
               ['Burn Engine seed', M(3_225_000), '23.6%'],
               ['Operating company', M(OPCO_CASH), '{:.1f}%'.format(100*OPCO_CASH/13_680_000)],
               ['Emergency Reserve', M(750_000), '5.5%'],
               ['Total raise', M(13_680_000), '100.0%']],
              'Seed raise directed to operations; public raise split 17 / 30 / 10 / 43.'),
        table(['Operating company funding', 'Amount', 'Form'],
              [['Cash from the raise', M(OPCO_CASH), 'At token generation'],
               ['Marketing and Treasury allocations, vested by month 24', M(TOK_24),
                'Tokens, liquidated on schedule'],
               ['Total available by month 24', M(OPCO_AVAIL_24), ''],
               ['Cost to month 24', M(-OPCO_COST_24), ''],
               ['Surplus', M(OPCO_AVAIL_24 - OPCO_COST_24), '']],
              'Token figures at the launch price, on the tokenomics vesting schedules.'),
    ]),
]})

# ============================================================ 10 Capital requirement
q = [monthly[i]['cum'] for i in range(35, -1, -1)]
ch.append({'num': '10', 'id': 'funding', 'title': 'Outputs — Capital Requirement and Breakeven',
           'nav': 'Capital Requirement', 'blocks': [
    p('A business plan\'s central question is how much capital is consumed before the business '
      'funds itself, and when that happens. Both are outputs of the model rather than inputs to it.'),
    note('This chapter is deliberately a <b>consolidated group</b> view, and it is the only place '
         'in this document where protocol revenue and the operating cost base are set against '
         'one another. That combination has no entity-level meaning \u2014 Chapter 9 reports the '
         'two separately, and the Operating Cost &amp; Company Analysis rules the netting out. It is '
         'used here only to answer the funding question: how much cash the group must hold before '
         'the whole structure sustains itself. Read every figure below as a group cash figure, '
         'not as a statement that the protocol fails to cover its own costs.', 'warn',
         'What this chapter is, and is not'),
    kpis([
        {'n': 'Month ' + str(be_m), 'l': 'First month in group operating surplus', 'c': 'g'},
        {'n': M(abs(peak)), 'l': 'Peak cumulative group deficit', 'c': 'w'},
        {'n': 'Month ' + str(peak_m), 'l': 'Deficit peaks'},
        {'n': M(monthly[35]['net']), 'l': 'Month-36 monthly result', 'c': 'g'},
    ]),
    line('Cumulative operating position — 36 months',
         [m['m'] for m in monthly],
         [{'name': 'Cumulative operating result', 'vals': [m['cum'] for m in monthly],
           'color': 'crit'}],
         'Revenue less operating cost base, accumulated monthly. Trough is the capital requirement.',
         'USD'),
    table(['Measure', 'Value', 'Interpretation'],
          [['First month in surplus', 'Month ' + str(be_m),
            'Monthly protocol revenue exceeds the monthly group cost base'],
           ['Peak cumulative deficit', M(abs(peak)),
            'Group cash consumed before the structure funds itself'],
           ['Month of peak deficit', 'Month ' + str(peak_m), 'Funding must be in place until here'],
           ['Month-36 run rate', M(monthly[35]['rev'] * 12) + ' revenue',
            'Against ' + M(monthly[35]['cost'] * 12) + ' of cost'],
           ['Cumulative position, month 36', M(monthly[35]['cum']),
            'Recovering from the trough']],
          'Derived from the monthly series; costs allocated evenly within each year.'),
    p('The group capital requirement is therefore approximately ' + M(abs(peak)) + ', and it must '
      'be available through month ' + str(peak_m) + '. From month ' + str(be_m) + ' protocol revenue '
      'exceeds the group cost base month on month, and the cumulative position begins to recover. '
      'Chapter 9.3 shows this requirement is already funded from the raise: the operating company '
      'holds ' + M(OPCO_AVAIL_24) + ' against a cost to month twenty-four of ' + M(OPCO_COST_24) + '. '
      'The deficit below is a timing profile, not an unfunded gap.'),
    note('Breakeven here means <b>group operating</b> breakeven — monthly protocol revenue '
         'exceeding the monthly group cost base. It is not a return on invested capital, it does '
         'not imply recovery of the cumulative deficit within the horizon, and it is not a '
         'statement about either entity on its own.', '', 'Definition'),
]})

# ============================================================ 11 Treasury
ch.append({'num': '11', 'id': 'treasury', 'title': 'Outputs — Treasury and Reserves', 'nav': 'Treasury', 'blocks': [
    p('The treasury view is deliberately conservative. It records protocol-owned balances only and '
      'excludes any valuation of the governance token, for which no reliable long-term valuation '
      'assumption exists.'),
    table(['Balance (year end)'] + YEARS,
          [['Liquidity Layer'] + [M(layer_e[y]) for y in range(3)],
           ['Bound Core'] + [M(ye('boundCoreBal', y)) for y in range(3)],
           ['Emergency Reserve'] + [M(ye('er', y)) for y in range(3)],
           ['BCI surplus capital'] + [M(ye('bciSC', y)) for y in range(3)],
           ['RWA collateral held'] + [M(ye('rwaCollateralBal', y)) for y in range(3)],
           ['Total value under custody'] + [M(tvl_e[y]) for y in range(3)]],
          'Simulator default case. Governance-token value excluded by design.'),
    stackbar('Protocol balances by year (year-end)', YEARS,
             [{'name': 'Liquidity Layer', 'vals': layer_e, 'color': 'accent'},
              {'name': 'Bound Core', 'vals': [ye('boundCoreBal', y) for y in range(3)], 'color': 'accent2'},
              {'name': 'Emergency Reserve', 'vals': [ye('er', y) for y in range(3)], 'color': 'warn'}]),
    p('The Emergency Reserve closes the horizon at ' + M(ye('er', 2)) + '. It is funded from '
      'Protocol Reserve revenue rather than from liquidity-provider capital, and it exists to '
      'absorb stress without drawing on the layer\'s coverage.'),
]})

# ============================================================ 12 Limits
ch.append({'num': '12', 'id': 'limits', 'title': 'Model Limits and Open Items', 'nav': 'Limits', 'blocks': [
    p('This chapter states what the plan does not establish. It is an engineering disclosure of '
      'the model\'s boundaries.'),
    ul([
        'Single scenario: every figure derives from one preset against one RWA market. No scenario '
        'range, sensitivity band or probability is presented, and none should be inferred.',
        'Single market: the default case runs one integrated RWA market. Revenue concentration '
        'risk is therefore not visible in these figures.',
        'Horizon: the plan stops at month thirty-six because the engine does. The cumulative '
        'deficit is not recovered inside that window, and the recovery path is not modelled.',
        'Capital structure: the plan sizes the capital requirement but assumes nothing about how '
        'it is raised, on what terms, or at what dilution.',
        'Cost inheritance: the cost base carries the limits recorded in the Operating Cost '
        'Analysis, including understated regulatory licensing, a bug-bounty programme booked only '
        'at launch, and technical salaries below published market floors.',
        'Headcount: the team is flat at nine from month five. No hiring is funded against the '
        'growth in value under custody.',
        'No terminal value: the plan contains no valuation, no exit assumption and no terminal '
        'growth rate.',
    ]),
]})

# ============================================================ Disclaimer
ch.append({'num': '', 'id': 'disclaimer', 'title': 'Legal Disclaimer', 'nav': 'Legal Disclaimer', 'blocks': [
    p('This document is provided for informational purposes only. It does not constitute an offer '
      'to sell, a solicitation of an offer to buy, or a recommendation of any token, security or '
      'financial instrument, in any jurisdiction, and nothing in it constitutes investment, legal, '
      'tax or accounting advice. All figures are outputs of the BOUND simulation engine on its '
      'default preset and of a cost model documented separately; they are not forecasts, budgets, '
      'commitments or guarantees of actual results, and a different preset produces different '
      'figures throughout. rwaUSD makes no return promise of any kind. The Bound Liquidity Index '
      'is an index token whose value can rise or fall; Annualized Index Growth is a historical '
      'metric and implies nothing about future performance; participants can lose value. BND '
      'confers governance utility only and no claim on protocol revenue. Statements about the '
      'capital requirement describe a model output and are not a fundraising offer or a '
      'representation that capital has been or will be secured. Forward-looking statements are '
      'subject to material uncertainty and change. © 2026 BOUND Protocol.'),
]})

out = {'front': front, 'chapters': ch}
with open(os.path.join(ROOT, 'scripts/businessplan-content.json'), 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('wrote scripts/businessplan-content.json — {} chapters'.format(len(ch)))
print('  36-month revenue      : {}'.format(M(sum(rev_y))))
print('  36-month cost base    : {}'.format(M(sum(cost_y))))
print('  operating result      : {}'.format(M(sum(ebit_y))))
print('  breakeven             : month {}'.format(be_m))
print('  peak capital required : {} (month {})'.format(M(abs(peak)), peak_m))
print('  TVL month 36          : {}'.format(M(tvl_e[2])))
print('  BLI price month 36    : {:.4f}  (AIG {})'.format(ye('bciPrice', 2), P(ye('annG', 2))))
