#!/usr/bin/env python3
"""Generate scripts/architecture-content.json — BOUND Smart Contract Architecture.

Source: BOUND Smart Contract Architecture - Overview.pdf (4 pages).

The source predates the token rename and the decision to deploy on Ethereum only.
Four corrections are applied here, each deliberate:

  1. BOUND -> rwaUSD and sBOUND -> BLI throughout the prose. Source contract
     filenames are retained alongside each component so the document still maps
     to the repository.
  2. Deployment reduced to Ethereum. The source listed Base as primary with
     Polygon secondary and Ethereum for cross-chain; that is superseded.
  3. LiFi cross-chain execution removed. It exists only to serve multi-chain
     deployment, which is no longer the architecture.
  4. Fee schedule taken from the whitepaper and simulator, which are the
     authoritative economic sources. The source PDF's single 0.3% exchange fee
     predates the current schedule and is recorded in the limits chapter.

The PDF is parsed rather than transcribed so verify-architecture.py can prove
every component, modifier and integration in the source is represented.

Usage:  python3 scripts/gen-architecture-content.py [path-to-pdf]
"""
import json
import os
import re
import sys

import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Downloads/BOUND Smart Contract Architecture - Overview (1).pdf')

raw = ' '.join((p.extract_text() or '') for p in pypdf.PdfReader(PDF).pages)
src = re.sub(r'\s+', ' ', raw)

# Every component named in the source must appear in the output; asserted here so
# a change to the source PDF fails the build rather than silently dropping a contract.
SRC_CONTRACTS = ['BOUND.sol', 'BOUNDHook.sol', 'BAMS.sol', 'BOUNDExchange.sol',
                 'BOUNDCalculator.sol', 'SBOUNDToken.sol']
for c in SRC_CONTRACTS:
    assert c in src, 'source no longer names {}'.format(c)

# ---------------------------------------------------------------- components
# Each carries its role in current terminology, plus the source artefact name.
COMPONENTS = [
    {
        'id': 'token', 'name': 'rwaUSD Token', 'file': 'BOUND.sol',
        'role': 'Settlement dollar',
        'desc': 'The protocol\'s ERC20 settlement dollar. It carries the supply accounting the '
                'rest of the system settles against, exposes mint and burn to the liquidity pool '
                'under access control, and holds the reserve linkage that backs circulating '
                'supply.',
        'points': [
            'Automatic price stabilization through Uniswap V4 hooks',
            'Reserve management through the Emergency Reserve mechanism',
            'Direct minter system for controlled, access-gated exchanges',
        ],
    },
    {
        'id': 'hook', 'name': 'Price Monitoring Hook', 'file': 'BOUNDHook.sol',
        'role': 'Peg surveillance and correction trigger',
        'desc': 'The Uniswap V4 hook that gives the protocol its atomic peg defence. It observes '
                'pool state on every interaction and triggers the correcting operation when a '
                'deviation crosses threshold — the mechanism the whitepaper describes as the '
                'Atomic Peg Stabilization System.',
        'points': [
            'Monitors real-time price deviations',
            'Triggers synchronization when thresholds are exceeded',
            'Handles Uniswap fee collection (withdrawFeesNoUnlock)',
        ],
    },
    {
        'id': 'bams', 'name': 'Asset Management System', 'file': 'BAMS.sol',
        'role': 'Reserve deployment',
        'desc': 'Deploys reserve capital into the yield-bearing tiers of the Liquidity Layer and '
                'routes trades across venues. This is the contract that turns idle collateral '
                'into the deployed-capital yield recorded in the protocol\'s economic model.',
        'points': [
            'Integrates with Morpho for lending and borrowing positions',
            'Connects with Enzyme for vault-based fund management',
            'Universal Router for V2, V3 and V4 swap routing',
            'Emergency control features for reserve recovery',
        ],
    },
    {
        'id': 'exchange', 'name': 'Conversion Contract', 'file': 'BOUNDExchange.sol',
        'role': 'rwaUSD ↔ BLI conversion',
        'desc': 'The only route between the settlement dollar and the index. Conversion is '
                'executed here rather than on a market, which is what allows the index price to '
                'be an on-chain identity rather than a quote.',
        'points': [
            'Facilitates rwaUSD ↔ BLI conversions',
            'Fee management on both entry and exit',
            'Queue-based pending exchange system',
        ],
    },
    {
        'id': 'calc', 'name': 'Financial Calculator', 'file': 'BOUNDCalculator.sol',
        'role': 'Valuation and risk arithmetic',
        'desc': 'The arithmetic core. Every figure that determines what a participant receives — '
                'index price, collateral surplus, position value across venues — is computed '
                'here, which is why it sits between the token, the asset manager and the index.',
        'points': [
            'Precise handling of multi-decimal assets',
            'Collateral surplus and risk calculations',
            'Morpho and Enzyme balance and profit computation',
        ],
    },
    {
        'id': 'bli', 'name': 'BLI Token', 'file': 'SBOUNDToken.sol',
        'role': 'Bound Liquidity Index',
        'desc': 'The index token representing a claim on reserve performance. Its value rises and '
                'falls with the reserve; it is an index, not a deposit, and the contract carries '
                'no redemption guarantee.',
        'points': [
            'Represents index positions in the Liquidity Layer',
            'Issued and retired in tandem with the conversion contract',
        ],
    },
]

NODES = [
    {'id': 'token', 'label': 'rwaUSD Token', 'sub': 'Settlement dollar', 'col': 1, 'row': 0},
    {'id': 'hook', 'label': 'Price Hook', 'sub': 'Peg monitoring', 'col': 2, 'row': 0},
    {'id': 'bams', 'label': 'Asset Manager', 'sub': 'Reserve deployment', 'col': 0, 'row': 1},
    {'id': 'calc', 'label': 'Calculator', 'sub': 'Valuation and risk', 'col': 1, 'row': 1},
    {'id': 'exchange', 'label': 'Converter', 'sub': 'rwaUSD ↔ BLI', 'col': 2, 'row': 1},
    {'id': 'bli', 'label': 'BLI Token', 'sub': 'Liquidity index', 'col': 1, 'row': 2},
]
EDGES = [
    {'a': 'token', 'b': 'hook', 'dir': 'both'},
    {'a': 'token', 'b': 'calc', 'dir': 'to'},
    {'a': 'bams', 'b': 'calc', 'dir': 'both'},
    {'a': 'calc', 'b': 'bli', 'dir': 'to'},
    {'a': 'hook', 'b': 'exchange', 'dir': 'to'},
]

ACCESS = [
    ['Owner only', 'onlyOwner', 'Administrative and critical operations'],
    ['Direct minters', 'onlyDirectMinter', 'Authorized entities executing direct exchanges'],
    ['Controllers', 'onlyOwnerOrControllers', 'Hook and asset-manager integrations'],
    ['Public', '—', 'Standard ERC20 interactions'],
]
MODIFIERS = ['onlyOwner', 'onlyDirectMinter', 'onlyOwnerOrControllers', 'nonReentrant']

INTEGRATIONS = [
    ['Uniswap V4', 'Pool management and the hook that carries peg stabilization',
     'The venue the APSS defends'],
    ['Aave', 'Liquid lending yield', 'Liquidity Layer tier — 3.5% assumed'],
    ['Morpho', 'Curated lending and borrowing positions', 'Liquidity Layer tier — 4.5% assumed'],
    ['Enzyme', 'Vault-based fund management', 'Liquidity Layer enhanced tier — 7.5% assumed'],
    ['Universal Router', 'Multi-venue swap routing across V2, V3 and V4', 'Execution'],
]

CHANGES = [
    'Direct minter system — access-controlled exchanges',
    'Exchange fee handling with safe arithmetic throughout',
    'Emergency Reserve — additional reserve functionality',
    'Access control strengthened with fine-grained modifiers',
    'Decimal precision — multi-decimal compatibility corrected',
]

STATUS = [
    ['Core contracts', 'Fully functional'],
    ['Security', 'Reinforced with access controls'],
    ['Integration', 'Operational across the integrated protocols'],
    ['Testing', 'Coverage across modules'],
    ['Deployment', 'Active'],
]

MILESTONE_MAP = [
    ['rwaUSD Token', 'BOUND.sol', 'M1, M2',
     'Baseline catalogued, then extended for RWA collateral and settlement flows'],
    ['Price Monitoring Hook', 'BOUNDHook.sol', 'M1',
     'APSS behaviour documented; unchanged by the migration'],
    ['Asset Management System', 'BAMS.sol', 'M2, M4',
     'Extended for RWA collateral tiers and oracle-driven settlement'],
    ['Conversion Contract', 'BOUNDExchange.sol', 'M2',
     'Conversion path retained; fee handling aligned to the current schedule'],
    ['Financial Calculator', 'BOUNDCalculator.sol', 'M2, M4',
     'Extended with haircut computation from oracle data'],
    ['BLI Token', 'SBOUNDToken.sol', 'M1',
     'Index structure already formed; not a build item in the migration'],
    ['— (net new)', 'RWA registry', 'M2',
     'Onboarding, eligibility enforcement and haircut assignment on-chain'],
    ['— (net new)', 'Oracle engine', 'M4',
     'NAV feeds, haircut automation, background settlement processor'],
]

# ---------------------------------------------------------------- blocks
p_ = lambda t, b=False: {'t': 'p', 'text': t, 'boldLabel': b}
sub = lambda title, blocks: {'t': 'sub', 'title': title, 'blocks': blocks}
ul = lambda items, b=False: {'t': 'ul', 'items': items, 'boldLabel': b}
kpis = lambda items: {'t': 'kpis', 'items': items}
note = lambda text, kind='', head='': {'t': 'note', 'text': text, 'kind': kind, 'head': head}


def table(head, rows, cap=None):
    b = {'t': 'table', 'head': head, 'rows': rows}
    if cap:
        b['cap'] = cap
    return b


front = {
    'brand': 'BOUND Protocol',
    'kind': 'Smart Contract Architecture',
    'tagline': 'The Deployed Contract System',
    'version': 'Confidential — July 2026',
    'place': 'Bucharest, Romania',
}
ch = []

# ============================================================ Abstract
ch.append({'num': '', 'id': 'abstract', 'title': 'Abstract', 'nav': 'Abstract', 'blocks': [
    p_('BOUND is a modular contract system built on Uniswap V4. Six contracts divide the work: a '
       'settlement dollar, a pool hook that defends its peg, an asset manager that deploys the '
       'reserve, a calculator that values every position, a converter between the dollar and the '
       'index, and the index token itself. This document specifies what each does and how they '
       'depend on one another.'),
    p_('The system described here is <b>deployed and operating</b>. It is the foundation the RWA '
       'migration extends rather than replaces, and Chapter 6 maps each component onto the '
       'delivery milestones that touch it. What the system does not yet contain — the RWA '
       'registry, the oracle engine, the haircut model — is named there rather than implied.'),
    p_('Two things follow from the architecture and are worth stating at the outset. Peg defence '
       'is a hook rather than a service, so it executes inside the user\'s own transaction and '
       'cannot be outbid or front-run. And conversion between the settlement dollar and the index '
       'runs through a contract rather than a market, which is what allows the index price to be '
       'an on-chain identity rather than a quote.'),
    kpis([
        {'n': '6', 'l': 'Core contracts'},
        {'n': '4', 'l': 'Access levels'},
        {'n': '5', 'l': 'Protocol integrations'},
        {'n': 'Ethereum', 'l': 'Deployment network'},
    ]),
]})

# ============================================================ 1 Architecture
ch.append({'num': '1', 'id': 'system', 'title': 'System Architecture', 'nav': 'System Architecture', 'blocks': [
    p_('The dependency graph is deliberately shallow. The token, the asset manager and the index '
       'never call one another directly; they meet at the calculator, which is the single place '
       'where value is computed. That shape keeps the arithmetic auditable in one contract rather '
       'than distributed across five.'),
    {'t': 'graph', 'title': 'Core contract architecture', 'nodes': NODES, 'edges': EDGES,
     'cap': 'Arrows show call direction; double-headed arrows are bidirectional dependencies. '
            'Source: BOUND Smart Contract Architecture overview.'},
    table(['Component', 'Source artefact', 'Responsibility'],
          [[c['name'], c['file'], c['role']] for c in COMPONENTS],
          'Contract filenames are retained as deployed. Component names are given in current '
          'protocol terminology: the source predates the rename of BOUND to rwaUSD and sBOUND '
          'to BLI.'),
]})

# ============================================================ 2 Components
comp_blocks = [p_('Each contract, its responsibility, and what it carries. Filenames are the '
                  'deployed artefacts; names are current protocol terminology.')]
for i, c in enumerate(COMPONENTS):
    comp_blocks.append(sub('2.{} {} — {}'.format(i + 1, c['name'], c['file']),
                           [p_(c['desc']), ul(c['points'])]))
ch.append({'num': '2', 'id': 'components', 'title': 'Component Reference', 'nav': 'Component Reference',
           'blocks': comp_blocks})

# ============================================================ 3 Access control
ch.append({'num': '3', 'id': 'access', 'title': 'Access Control', 'nav': 'Access Control', 'blocks': [
    p_('Four access levels, enforced by four modifiers. The design intent is that normal protocol '
       'operation requires no privileged key: administrative control exists for emergency and '
       'configuration paths, and everything a participant does routinely sits under the public '
       'tier.'),
    table(['Access level', 'Modifier', 'Scope'], ACCESS,
          'Source: BOUND Smart Contract Architecture overview, section 3.'),
    p_('A fourth modifier, <b>nonReentrant</b>, is not an access level but a safety property: it '
       'guards state-changing paths against reentrancy. It appears alongside the access modifiers '
       'because every externally callable value-moving function carries both.'),
]})

# ============================================================ 4 Fees
ch.append({'num': '4', 'id': 'fees', 'title': 'Fee Structure', 'nav': 'Fee Structure', 'blocks': [
    p_('Fees are charged at two points: conversion between the settlement dollar and the index, '
       'and direct mint or redemption of the settlement dollar. The rates below are those the '
       'protocol\'s economic model and whitepaper specify, and are the authoritative schedule.'),
    table(['Operation', 'Rate', 'Applies to', 'Destination'],
          [['Conversion — standard', '0.88%', 'rwaUSD ↔ BLI, paid in rwaUSD',
            'Surplus capital; the fee amount is burned'],
           ['Conversion — discounted', '0.44%', 'rwaUSD ↔ BLI, paid in BND',
            'Governance token burned; supply reduced'],
           ['Direct mint / redemption', '0.30%', 'Large direct transactions bypassing the pool',
            'Split between surplus capital and Protocol Reserve']],
          'Source: protocol whitepaper and simulation engine. Conversion fees apply symmetrically '
          'on entry and exit.'),
    sub('4.1 Fee handling in the contracts', [
        ul(['Internal fees denominated in the protocol\'s own tokens are burned, which raises the '
            'backing per remaining unit rather than accruing to any party',
            'External fees are collected into the reserve',
            'The Emergency Reserve mechanism holds capital held back from deployment, available '
            'for stress conditions'], False),
    ]),
    note('The source architecture overview records a single exchange fee of 0.30% on conversion. '
         'That figure predates the current fee schedule, which prices conversion at 0.88% and '
         '0.44% and reserves 0.30% for direct mint and redemption. The rates above are the '
         'authoritative ones; the deployed constant should be confirmed against them before this '
         'document is relied on for integration work.',
         'warn', 'Recorded discrepancy'),
]})

# ============================================================ 5 Integrations
ch.append({'num': '5', 'id': 'integrations', 'title': 'Integrations and Deployment',
           'nav': 'Integrations', 'blocks': [
    sub('5.1 Protocol integrations', [
        p_('Five external integrations. One is the venue the protocol defends; three are the '
           'yield-bearing tiers of the Liquidity Layer; one is execution routing.'),
        table(['Protocol', 'Function', 'Role in the architecture'], INTEGRATIONS,
              'Tier yield assumptions are those configured in the simulation engine. Integration '
              'set reconciled to the four-tier Liquidity Layer described in the whitepaper.'),
    ]),
    sub('5.2 Deployment', [
        p_('The protocol deploys on <b>Ethereum</b>. A single-network deployment keeps the peg '
           'defence, the reserve and the index price on one state machine, which is the '
           'precondition for the atomicity the stabilization system depends on — a correction '
           'that spans chains is not a correction that can complete or revert as one operation.'),
        p_('Earlier architecture drafts described a multi-chain deployment with cross-chain '
           'execution routing. That is not the current architecture, and the cross-chain '
           'execution dependency it required has been removed from scope.'),
    ]),
]})

# ============================================================ 6 RWA migration
ch.append({'num': '6', 'id': 'migration', 'title': 'Relationship to the RWA Migration',
           'nav': 'RWA Migration', 'blocks': [
    p_('This system is the starting point of the delivery programme, not its output. The migration '
       'extends the deployed contracts and adds the modules that make real-world assets '
       'tradeable; it does not rebuild the peg, the pool or the index.'),
    table(['Component', 'Artefact', 'Milestones', 'What the migration does to it'], MILESTONE_MAP,
          'Milestone references are to the Delivery Roadmap.'),
    p_('Two entries are net new. The RWA registry carries onboarding, eligibility enforcement and '
       'haircut assignment on-chain; the oracle engine carries NAV feeds, automated haircut '
       'recalculation and the background settlement processor. Everything else in the table '
       'already exists and is extended in place.'),
]})

# ============================================================ 7 Status
ch.append({'num': '7', 'id': 'status', 'title': 'Status and Recent Changes', 'nav': 'Status', 'blocks': [
    sub('7.1 Recent changes', [ul(CHANGES)]),
    sub('7.2 Current status', [
        table(['Area', 'Status'], STATUS,
              'As characterised in the source architecture overview. These are the engineering '
              'team\'s own descriptions rather than measured results; see Chapter 8.'),
    ]),
    sub('7.3 Who builds and who owns', [
        p_('The contracts described in this document are built and maintained by the operating '
           'company, incorporated in the European Union, which employs the engineering team. The '
           'intellectual property vests in Nexus Technologies Foundation, a Panama '
           'private-interest foundation that owns the protocol and grants the token delegation. '
           'BITSWIFT TECHNOLOGIES INC., also incorporated in Panama, issues and distributes the '
           'tokens. Deployment authority and the access-control roles described in Chapter 3 are '
           'held by the operating company and are separate from ownership.'),
    ]),
]})

# ============================================================ 8 Limits
ch.append({'num': '8', 'id': 'limits', 'title': 'Limits and Open Items', 'nav': 'Limits', 'blocks': [
    p_('What this document does not establish.'),
    ul([
        'Fee constant: the deployed conversion fee should be confirmed against the 0.88% and '
        '0.44% schedule recorded in Chapter 4.',
        'Test coverage: the source characterises coverage as comprehensive but records no figure. '
        'No coverage percentage is claimed here.',
        'Audit status: no external audit of these contracts is recorded in the source. The '
        'delivery programme schedules a first-party audit and a public competition before RWA '
        'markets go live.',
        'Contract addresses: no deployed addresses are recorded. Any integration work must take '
        'them from the protocol\'s technical documentation rather than from this overview.',
        'Function-level detail: this is an architecture overview, not an interface specification. '
        'Only the function names the source records appear here.',
        'Governance token: BND is outside the scope of these contracts and is not described.',
    ]),
]})

# ============================================================ Disclaimer
ch.append({'num': '', 'id': 'disclaimer', 'title': 'Legal Disclaimer', 'nav': 'Legal Disclaimer', 'blocks': [
    p_('This document is provided for informational purposes only. It does not constitute an '
       'offer to sell, a solicitation of an offer to buy, or a recommendation of any token, '
       'security or financial instrument, in any jurisdiction, and nothing in it constitutes '
       'investment, legal, tax or accounting advice. It is an architecture overview and not an '
       'interface specification, an audit, or a representation that the described system is free '
       'of defects. Statements of status and test coverage are the engineering team\'s '
       'characterisations and have not been independently verified. No external security audit of '
       'these contracts is recorded. rwaUSD makes no return promise of any kind; the Bound '
       'Liquidity Index is an index whose value can rise or fall. Descriptions of planned '
       'extension work are forward-looking and subject to material uncertainty and change. '
       '© 2026 BOUND Protocol.'),
]})

out = {'front': front, 'chapters': ch}
with open(os.path.join(ROOT, 'scripts/architecture-content.json'), 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('wrote scripts/architecture-content.json — {} chapters'.format(len(ch)))
print('  components   : {}'.format(len(COMPONENTS)))
print('  access levels: {}   modifiers: {}'.format(len(ACCESS), len(MODIFIERS)))
print('  integrations : {}   network: Ethereum'.format(len(INTEGRATIONS)))
print('  renamed      : BOUND -> rwaUSD, sBOUND -> BLI')
print('  removed      : multi-chain deployment, cross-chain execution, fair-launch mechanism')
