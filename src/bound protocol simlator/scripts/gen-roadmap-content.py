#!/usr/bin/env python3
"""Generate scripts/roadmap-content.json — BOUND Protocol Delivery Roadmap.

Merges two source documents:
  BOUND_RWA_Milestone_Roadmap.docx    — outcome view: 12 milestones, budget
  BOUND_Protocol_Technical_Roadmap.docx — execution view: 4 layers x 3 phases

Both are parsed directly from the .docx rather than transcribed, so the verify
script can prove mechanically that nothing was dropped.

Four inconsistencies between the sources are resolved here, each deliberately:
  1. Settlement dollar renamed BLD -> rwaUSD, matching every other platform
     document. The sources predate the rename; the instrument is unchanged.
  2. Headline timeline is 22-25 weeks (the delivery commitment). The 18-week
     floor is retained as a compressed case with its stated preconditions.
  3. The budget covers 22 weeks of engineering execution; the delivery window
     runs to week 25 because it absorbs audit remediation and launch. Stated
     explicitly rather than left as an apparent contradiction.
  4. "MICA" normalised to "MiCA" (Regulation (EU) 2023/1114).

Usage:  python3 scripts/gen-roadmap-content.py [milestone.docx] [technical.docx]
"""
import json
import os
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.expanduser('~/Downloads')
MS_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DL, 'BOUND_RWA_Milestone_Roadmap.docx')
TC_PATH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(DL, 'BOUND_Protocol_Technical_Roadmap.docx')

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
qn = lambda t: '{%s}%s' % (W, t)


# ---------------------------------------------------------------- docx parsing
def ptext(p):
    out = []
    for node in p.iter():
        if node.tag == qn('t'):
            out.append(node.text or '')
        elif node.tag == qn('tab'):
            out.append('\t')
        elif node.tag in (qn('br'), qn('cr')):
            out.append(' ')
    return ''.join(out).strip()


def pstyle(p):
    pr = p.find(qn('pPr'))
    if pr is None:
        return '', None
    st = pr.find(qn('pStyle'))
    name = st.get(qn('val')) if st is not None else ''
    num = pr.find(qn('numPr'))
    lvl = None
    if num is not None:
        il = num.find(qn('ilvl'))
        lvl = int(il.get(qn('val'))) if il is not None else 0
    return name or '', lvl


def parse(path):
    """Flatten a .docx into a list of ('h1'|'h2'|'h3'|'p'|'li'|'table', payload)."""
    body = ET.fromstring(zipfile.ZipFile(path).read('word/document.xml')).find(qn('body'))
    items = []
    for child in body:
        if child.tag == qn('p'):
            t = ptext(child)
            if not t:
                continue
            st, lvl = pstyle(child)
            m = re.match(r'Heading(\d)', st or '')
            if m:
                items.append(('h' + m.group(1), t))
            elif st == 'Title':
                items.append(('h1', t))
            elif lvl is not None:
                items.append(('li', t))
            else:
                items.append(('p', t))
        elif child.tag == qn('tbl'):
            rows = []
            for tr in child.findall(qn('tr')):
                rows.append([' / '.join(x for x in (ptext(p) for p in tc.findall(qn('p'))) if x)
                             for tc in tr.findall(qn('tc'))])
            items.append(('table', rows))
    return items


MS = parse(MS_PATH)
TC = parse(TC_PATH)


# ---------------------------------------------------------------- terminology
RENAME = [
    (r'\bBound Liquid Dollar \(BLD\)', 'rwaUSD'),
    (r'\bBLD stablecoin\b', 'rwaUSD'),
    (r'\bBLD token\b', 'rwaUSD'),
    (r'\bBLD/USDC\b', 'rwaUSD/USDC'),
    (r'\bBLD\b', 'rwaUSD'),
    (r'\bMICA\b', 'MiCA'),
]


def fix(s):
    for pat, rep in RENAME:
        s = re.sub(pat, rep, s)
    # "rwaUSD markets" reads better than "rwaUSD market" fragments left by the rename
    s = s.replace('rwaUSD rwaUSD', 'rwaUSD')
    return s


def fixrows(rows):
    return [[fix(c) for c in r] for r in rows]


# ---------------------------------------------------------------- extraction
def sections(items, level='h3'):
    """Group items under each heading of `level`, up to the next same-or-higher heading."""
    out, cur = [], None
    order = {'h1': 1, 'h2': 2, 'h3': 3, 'h4': 4}
    lv = order[level]
    for kind, payload in items:
        if kind in order and order[kind] <= lv:
            if kind == level:
                cur = {'title': payload, 'body': []}
                out.append(cur)
            else:
                cur = None
            continue
        if cur is not None:
            cur['body'].append((kind, payload))
    return out


# --- milestones (M1..M12) ---
milestones = []
for sec in sections(MS, 'h3'):
    m = re.match(r'M(\d+)\s*·\s*(.+?)\s*—\s*(.+)$', sec['title'])
    if not m:
        continue
    intro, bullets, outcome = '', [], ''
    for kind, payload in sec['body']:
        if kind == 'li':
            bullets.append(fix(payload))
        elif kind == 'p':
            if payload.lower().startswith('strategic outcome'):
                outcome = fix(re.sub(r'^strategic outcome\s*:\s*', '', payload, flags=re.I))
            elif not intro:
                intro = fix(payload)
    milestones.append({'id': 'M' + m.group(1), 'when': m.group(2).strip(),
                       'title': fix(m.group(3).strip()),
                       'intro': intro, 'bullets': bullets, 'outcome': outcome})
assert len(milestones) == 12, 'expected 12 milestones, found {}'.format(len(milestones))

# --- technical layer blocks, grouped by phase ---
layer_blocks = {}          # phase title -> [{layer, focus, bullets}]
phase_intro = {}
cur_phase = None
for kind, payload in TC:
    if kind == 'h2' and payload.startswith('Phase'):
        cur_phase = payload
        layer_blocks[cur_phase] = []
    elif kind == 'h3' and cur_phase:
        parts = re.split(r'\s+—\s+', payload, maxsplit=1)
        layer_blocks[cur_phase].append({
            'layer': fix(parts[0].strip()),
            'focus': fix(parts[1].strip()) if len(parts) > 1 else '',
            'bullets': []})
    elif kind == 'li' and cur_phase and layer_blocks[cur_phase]:
        layer_blocks[cur_phase][-1]['bullets'].append(fix(payload))
    elif kind == 'p' and cur_phase and not layer_blocks[cur_phase]:
        phase_intro.setdefault(cur_phase, fix(payload))

PHASES = list(layer_blocks.keys())
assert len(PHASES) == 3, 'expected 3 phases, found {}'.format(len(PHASES))
assert sum(len(v) for v in layer_blocks.values()) == 12, 'expected 12 layer blocks'

# --- guiding principles (h1 "Guiding Principles" -> alternating title/body paragraphs) ---
principles = []
grab, buf = False, []
for kind, payload in TC:
    if kind == 'h1':
        grab = payload.strip() == 'Guiding Principles'
        continue
    if grab and kind == 'p':
        buf.append(fix(payload))
for i in range(0, len(buf) - 1, 2):
    principles.append({'title': buf[i], 'text': buf[i + 1]})
assert len(principles) == 6, 'expected 6 guiding principles, found {}'.format(len(principles))

# --- audit strategy (h1 "Audit & Security Strategy") ---
audit_lead, audit_rounds = '', []
grab, buf = False, []
for kind, payload in TC:
    if kind == 'h1':
        grab = payload.strip().startswith('Audit')
        continue
    if grab and kind == 'p':
        buf.append(fix(payload))
if buf:
    audit_lead = buf[0]
    for i in range(1, len(buf) - 1, 2):
        audit_rounds.append({'title': buf[i], 'text': buf[i + 1]})

# --- tables, by source ---
ms_tables = [fixrows(p) for k, p in MS if k == 'table']
tc_tables = [fixrows(p) for k, p in TC if k == 'table']
# milestone doc: [0] starting point, [1] timeline, [2] budget headline,
#                [3] by workstream, [4] workforce, [5] by phase
# technical doc: [0] issuer benefits, [1] timeline, [2..4] phase layer maps, [5] schedule risk
START_TBL, MS_TIMELINE, BUDGET_HEAD, BY_WORKSTREAM, WORKFORCE, BY_PHASE = ms_tables[:6]
ISSUER_TBL = tc_tables[0]
SCHED_RISK = tc_tables[-1]

# --- exclusions list (after "Excluded from Development Budget") ---
exclusions = []
grab = False
for kind, payload in MS:
    if kind in ('h1', 'h2'):
        grab = 'Excluded' in payload
        continue
    if grab and kind == 'li':
        exclusions.append(fix(payload))

# --- narrative sections carried verbatim from the sources ---
def under(items, heading, kinds=('p',)):
    """Paragraphs under an h1/h2 whose text starts with `heading`."""
    out, grab = [], False
    for kind, payload in items:
        if kind in ('h1', 'h2'):
            grab = isinstance(payload, str) and payload.strip().lower().startswith(heading.lower())
            continue
        if grab and kind in kinds and isinstance(payload, str):
            out.append(fix(payload))
    return out


MS_EXEC = under(MS, 'Executive Summary')
MS_START = under(MS, 'Starting Point')
TC_ABOUT = under(TC, 'About BOUND Protocol')
TC_EXEC = under(TC, 'Engineering Roadmap: Executive Summary')
TC_TIMELINE_NOTE = [t for t in under(TC, 'Timeline at a Glance') if t.strip().startswith('*')]
TC_TIMELINE = fixrows(tc_tables[1])

# ---------------------------------------------------------------- budget maths
def money(s):
    m = re.search(r'\$([\d,]+)', s or '')
    return int(m.group(1).replace(',', '')) if m else 0


ws_rows = BY_WORKSTREAM[1:]
wf_rows = WORKFORCE[1:]
ph_rows = BY_PHASE[1:]
ws_total = sum(money(r[1]) for r in ws_rows)
wf_total = sum(money(r[2]) for r in wf_rows)
ph_total = sum(money(r[2]) for r in ph_rows)
assert ws_total == wf_total == ph_total == 320000, \
    'budget cuts must each total $320,000 (got {}, {}, {})'.format(ws_total, wf_total, ph_total)
BUDGET = ws_total
BUDGET_INTRO = next((fix(t) for k, t in MS if k == 'p'
                     and isinstance(t, str) and t.startswith('Fixed $')), '')
EXCL_INTRO = next((fix(t) for k, t in MS if k == 'p'
                   and isinstance(t, str) and t.startswith('The following are tracked')), '')
RISK_INTRO = next((fix(t) for k, t in TC if k == 'p'
                   and isinstance(t, str) and t.startswith('The following conditions')), '')
M = lambda x: '${:,.0f}'.format(x)

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


def tbl_from(rows, cap=None):
    return table(rows[0], rows[1:], cap)


def donut(title, slices, cap=None):
    b = {'t': 'donut', 'title': title, 'slices': slices}
    if cap:
        b['cap'] = cap
    return b


def bar(title, cats, vals, labels, cap=None):
    b = {'t': 'bar', 'title': title, 'cats': cats, 'vals': vals, 'labels': labels}
    if cap:
        b['cap'] = cap
    return b


def timeline(title, phases, marks, cap=None):
    b = {'t': 'timeline', 'title': title, 'phases': phases, 'marks': marks}
    if cap:
        b['cap'] = cap
    return b


def cards(items):
    return {'t': 'cards', 'items': items}


# week bounds per milestone, parsed from "Wks 1–2" / "Wk 16"
def weeks_of(when):
    n = [int(x) for x in re.findall(r'\d+', when)]
    return (n[0], n[-1]) if n else (0, 0)


PHASE_BOUNDS = [('Phase 1 · Foundation', 1, 6), ('Phase 2 · Build', 7, 16),
                ('Phase 3 · Audit & Launch', 17, 25)]

front = {
    'brand': 'BOUND Protocol',
    'kind': 'Delivery Roadmap',
    'tagline': 'RWA Migration — Engineering Delivery Plan',
    'version': '12 Milestones · 3 Phases · 22–25 Weeks — July 2026',
    'place': 'Bucharest, Romania',
}

ch = []

# ============================================================ Abstract
ch.append({'num': '', 'id': 'abstract', 'title': 'Abstract', 'nav': 'Abstract', 'blocks': [
    p_('BOUND is not starting from zero. The Atomic Peg Stabilization System — the rwaUSD '
       'settlement dollar and its core liquidity pool — is already deployed and operational. '
       'This roadmap extends that foundation to support instant liquidity for real-world assets. '
       'It is a migration plan, not a rebuild.'),
    p_('Delivery is structured as twelve milestones across three phases, executed by four '
       'engineering layers running in parallel from the first week. Development is budgeted at a '
       'fixed ' + M(BUDGET) + ' across twenty-two weeks of engineering execution, against a '
       'delivery window of twenty-two to twenty-five weeks to mainnet inclusive of audit '
       'remediation and launch. External audit and security-competition fees are budgeted and '
       'tracked separately.'),
    *[p_(t) for t in MS_EXEC],
    *[p_(t) for t in TC_EXEC],
    p_('This document opens with a plain-language roadmap that any reader can follow end to end. '
       'The chapters that follow descend into the full engineering specification — every '
       'deliverable, every layer, every gate. A reader who needs only the shape of the programme '
       'can stop after Chapter 1.'),
    kpis([
        {'n': '12', 'l': 'Milestones'},
        {'n': '3', 'l': 'Phases'},
        {'n': '22–25', 'l': 'Weeks to mainnet'},
        {'n': M(BUDGET), 'l': 'Development budget'},
        {'n': '~3.5', 'l': 'FTE blended team'},
    ]),
]})

# ============================================================ 1 Roadmap in brief
ch.append({'num': '1', 'id': 'brief', 'title': 'The Roadmap in Brief', 'nav': 'Roadmap in Brief', 'blocks': [
    p_('This chapter is written for readers without an engineering background. It describes what '
       'is being built, in what order, and what becomes possible at each stage. Nothing here '
       'requires technical knowledge to follow.'),
    timeline('Delivery timeline — 25 weeks, 12 milestones',
             [{'name': n, 'from': a, 'to': b} for n, a, b in PHASE_BOUNDS],
             [{'id': ms['id'], 'from': weeks_of(ms['when'])[0], 'to': weeks_of(ms['when'])[1],
               'label': ms['title'], 'outcome': ms['outcome']}
              for ms in milestones],
             'Phase boundaries and milestone weeks as specified in the source roadmaps.'),
    sub('1.1 The three phases', [
        tbl_from(MS_TIMELINE, 'Source: RWA Milestone Roadmap, timeline table.'),
        p_('Each phase closes on a gate that every engineering layer must clear together. A '
           'phase is not complete when one layer finishes; it is complete when the gate below '
           'is met across all four.'),
        tbl_from(TC_TIMELINE, 'Source: Protocol Technical Roadmap, timeline table. '
                 + (TC_TIMELINE_NOTE[0] if TC_TIMELINE_NOTE else '')),
        p_('<b>Foundation</b> settles the design so that nothing is redesigned later. '
           '<b>Build</b> is where the product is actually written — the pricing engine, the '
           'instant-exit interface, the issuer platform and the data layer. '
           '<b>Audit and Launch</b> adds no features at all; it is six to nine weeks of proving '
           'the system is safe enough to hold institutional capital.'),
    ]),
    sub('1.2 The twelve milestones in one line each', [
        table(['Milestone', 'Weeks', 'What it delivers', 'Why it matters'],
              [[ms['id'], ms['when'].replace('Wks ', '').replace('Wk ', ''),
                ms['title'], ms['outcome']] for ms in milestones],
              'Each milestone is expanded in full, with its deliverables, in Chapters 4 to 6.'),
    ]),
    sub('1.3 What it costs', [
        p_('Development is fixed at ' + M(BUDGET) + '. That figure covers engineering, '
           'infrastructure and launch execution across twenty-two weeks. It does not cover the '
           'external security audit, the public security competition, the bug-bounty capital or '
           'legal advisory — those are budgeted separately and are set out in Chapter 8.'),
        bar('Development budget by phase',
            [r[0].replace('Phase 1 — ', '').replace('Phase 2 — ', '').replace('Phase 3 — ', '')
             for r in ph_rows],
            [money(r[2]) for r in ph_rows],
            [M(money(r[2])) for r in ph_rows],
            'Source: RWA Milestone Roadmap, budget by phase.'),
    ]),
    note('The rest of this document is the engineering specification. It is written for the '
         'delivery team and for technical reviewers, and it assumes familiarity with smart '
         'contract development, infrastructure and security practice.',
         '', 'Where the plain-language section ends'),
]})

# ============================================================ 2 Starting point
ch.append({'num': '2', 'id': 'starting', 'title': 'Starting Point and Scope', 'nav': 'Starting Point', 'blocks': [
    sub('2.1 What BOUND is', [
        *[p_(t) for t in TC_ABOUT if not t.startswith('Strategic Benefit')],
    ]),
    sub('2.2 What is already deployed', [
        p_('The APSS system — the rwaUSD settlement dollar and the core liquidity pool — is '
           'deployed and operational. This programme extends it rather than replacing it, which '
           'is the single most consequential fact about the schedule and the budget: the '
           'foundation does not have to be rebuilt, and live markets must not be disrupted while '
           'it is extended.'),
        *[p_(t) for t in MS_START if not t.startswith('Asset')],
        tbl_from(START_TBL, 'Source: RWA Milestone Roadmap, starting-point table.'),
    ]),
    sub('2.3 What this programme does not cover', [
        p_('The engineering scope is the settlement dollar, the liquidity pool, the RWA registry, '
           'the oracle and settlement layer, the issuer platform and the data layer. The Bound '
           'Liquidity Index structure is already formed and is not a build item here, and the BND '
           'governance token is outside this programme except for the governance plumbing listed '
           'in Milestone M2. A reader should not infer full protocol coverage from this document.'),
    ]),
    sub('2.4 What issuers gain', [
        tbl_from(ISSUER_TBL, 'Source: Protocol Technical Roadmap, strategic benefits table.'),
    ]),
]})

# ============================================================ 3 Principles
ch.append({'num': '3', 'id': 'principles', 'title': 'Delivery Principles', 'nav': 'Delivery Principles',
           'blocks': [p_('Six principles govern how the programme is executed. They are '
                         'constraints on the delivery team, not aspirations.')]
                     + [sub('3.' + str(i + 1) + ' ' + pr['title'], [p_(pr['text'])])
                        for i, pr in enumerate(principles)]})

# ============================================================ 4-6 Phases
PHASE_IDS = ['phase1', 'phase2', 'phase3']
PHASE_MS = [milestones[0:3], milestones[3:8], milestones[8:12]]
PHASE_NAV = ['Phase 1: Foundation', 'Phase 2: Build', 'Phase 3: Audit & Launch']
for i, ph in enumerate(PHASES):
    blocks = []
    intro = phase_intro.get(ph, '')
    if intro:
        blocks.append(p_(intro))
    blocks.append(sub('{}.1 Milestones'.format(4 + i), []))
    blocks.append(cards([{
        'id': ms['id'], 'when': ms['when'], 'title': ms['title'],
        'intro': ms['intro'], 'bullets': ms['bullets'], 'outcome': ms['outcome'],
    } for ms in PHASE_MS[i]]))
    blocks.append(sub('{}.2 Deliverables by engineering layer'.format(4 + i), []))
    for lb in layer_blocks[ph]:
        blocks.append(sub(lb['layer'] + (' — ' + lb['focus'] if lb['focus'] else ''),
                          [ul(lb['bullets'], False)]))
    ch.append({'num': str(4 + i), 'id': PHASE_IDS[i], 'title': ph, 'nav': PHASE_NAV[i], 'blocks': blocks})

# ============================================================ 7 Audit strategy
audit_blocks = [p_(audit_lead)] if audit_lead else []
for i, r in enumerate(audit_rounds):
    audit_blocks.append(sub('7.' + str(i + 1) + ' ' + r['title'], [p_(r['text'])]))
audit_blocks.append(note(
    'Top-tier firms — the ones this plan names — quote booking queues of roughly four to twelve '
    'weeks from first enquiry to kickoff, and elite-only engagements can run to several months. '
    'The audit slot must therefore be secured during Phase 1, not at the end of Phase 2 as the '
    'schedule-risk table assumes. Booking late is the cheapest way to lose six weeks on this '
    'programme. <i>Market conditions as at July 2026.</i>',
    'warn', 'Audit booking is a Phase 1 action'))
ch.append({'num': '7', 'id': 'audit', 'title': 'Audit and Security Strategy', 'nav': 'Audit Strategy',
           'blocks': audit_blocks})

# ============================================================ 8 Budget
ws_slices = sorted([{'lab': r[0], 'val': M(money(r[1])), 'pct': 100 * money(r[1]) / BUDGET}
                    for r in ws_rows], key=lambda s: -s['pct'])
ch.append({'num': '8', 'id': 'budget', 'title': 'Development Budget', 'nav': 'Development Budget', 'blocks': [
    p_(BUDGET_INTRO),
    p_('The allocation is presented three ways — by workstream, by role and by phase. Each cut '
       'totals ' + M(BUDGET) + '; they are three views of one budget, not three budgets.'),
    tbl_from(BUDGET_HEAD, 'Source: RWA Milestone Roadmap, budget headline.'),
    sub('8.1 By workstream', [
        tbl_from(BY_WORKSTREAM, 'Source: RWA Milestone Roadmap. Total ' + M(ws_total) + '.'),
        donut('Development budget by workstream', ws_slices),
    ]),
    sub('8.2 By role', [
        tbl_from(WORKFORCE, 'Source: RWA Milestone Roadmap. Total ' + M(wf_total) + '.'),
    ]),
    sub('8.3 By phase', [
        tbl_from(BY_PHASE, 'Source: RWA Milestone Roadmap. Total ' + M(ph_total) +
                 '. Stated shares are rounded from 24.4%, 48.1% and 27.5%.'),
        p_('The budget spans weeks one to twenty-two of engineering execution. The delivery '
           'window extends to week twenty-five because it absorbs audit remediation and launch, '
           'during which engineering spend is minimal and is carried by the contingency reserve. '
           'The two figures measure different things and are not in conflict.'),
    ]),
    sub('8.4 Excluded from the development budget', [
        p_(EXCL_INTRO),
        ul(exclusions, False),
        p_('The external audit and the bug-bounty allocation appear in the protocol\'s Operating '
           'Cost Analysis under legal expenses, at $200,000 and $300,000 respectively in the '
           'launch year. The public security competition and its targeted re-audit carry no line '
           'in that model — a gap that document already records.'),
    ]),
    sub('8.5 Relationship to the operating cost model', [
        p_('This ' + M(BUDGET) + ' engineering programme is not the same figure as the $250,000 '
           'Development line in the Operating Cost Analysis, and the two should not be compared '
           'directly. That line covers application development and protocol integrations only; '
           'the engineering effort described here spans smart contracts, backend, frontend, '
           'infrastructure, architecture and quality assurance, most of which sits inside the '
           'cost model\'s personnel line rather than its development line. Neither figure is '
           'revised by this document.'),
    ]),
    sub('8.6 Which entity bears it, and where the IP vests', [
        p_('The programme is executed and paid for by the operating company, incorporated in the '
           'European Union, which employs the engineering team and bears all operating cost. It '
           'is not borne by the token issuer. The operating company works under a '
           'development-and-services agreement with Nexus Technologies Foundation and BITSWIFT '
           'TECHNOLOGIES INC., and is reimbursed at cost plus a margin.'),
        p_('The intellectual property this programme creates &mdash; the contracts, the '
           'infrastructure and the protocol design &mdash; vests in Nexus Technologies '
           'Foundation, which owns the protocol and grants the token delegation. The operating '
           'company is a service provider, not the owner of what it builds. Entity roles and the '
           'full attribution of every cost line are set out in the Operating Cost &amp; Company '
           'Analysis.'),
    ]),
]})

# ============================================================ 9 Schedule risk
ch.append({'num': '9', 'id': 'risk', 'title': 'Schedule Risk', 'nav': 'Schedule Risk', 'blocks': [
    p_(RISK_INTRO),
    p_('The delivery window is twenty-two to twenty-five weeks. An eighteen-week floor is '
       'achievable, but only if every condition below holds simultaneously — fully dedicated '
       'teams from week one, an audit slot already secured, and a clean single-round audit '
       'remediation. This plan treats twenty-two to twenty-five weeks as the commitment and '
       'eighteen as the compressed case, because the conditions are demanding and their failure '
       'modes are additive.'),
    tbl_from(SCHED_RISK, 'Source: Protocol Technical Roadmap, schedule risk table.'),
    p_('Two of these conditions deserve particular weight. A late architecture change resets '
       'Phase 2 scope for all four layers simultaneously, which is why the design is locked at '
       'week two. And misalignment between the oracle layer and the contracts is named in the '
       'source as the most common slip point in programmes of this shape — it is the reason the '
       'weekly cross-team sync exists.'),
]})

# ============================================================ 10 Open items
ch.append({'num': '10', 'id': 'openitems', 'title': 'Scope Boundaries and Editorial Notes',
           'nav': 'Boundaries and Notes', 'blocks': [
    p_('This document merges two source roadmaps written for different audiences. Where they '
       'differed, the divergence is recorded here rather than silently resolved.'),
    ul([
        'Terminology: both sources call the settlement dollar BLD, the Bound Liquid Dollar. It is '
        'rendered here as rwaUSD, matching the whitepaper, the simulator and every other platform '
        'document. The instrument is unchanged; only the name is current.',
        'Timeline: the technical roadmap states 18–25 weeks and the milestone roadmap 22–25. This '
        'document leads with 22–25 as the delivery commitment and presents 18 as the compressed '
        'floor, with the conditions it requires set out in Chapter 9.',
        'Budget horizon: the budget covers 22 weeks of engineering execution while delivery runs '
        'to week 25. The gap is audit remediation and launch, carried by contingency. Both '
        'sources are correct; the relationship was simply unstated.',
        'Regulation: "MICA" in the sources is rendered MiCA throughout, matching Regulation '
        '(EU) 2023/1114 as cited in the whitepaper.',
        'Scope: neither source covers the Bound Liquidity Index structure, which is already '
        'formed, nor the BND governance token beyond the governance plumbing in M2.',
        'Cost model: the ' + M(BUDGET) + ' engineering programme does not revise the Operating '
        'Cost Analysis or the Business Plan, both of which retain their published figures.',
    ]),
]})

# ============================================================ Disclaimer
ch.append({'num': '', 'id': 'disclaimer', 'title': 'Legal Disclaimer', 'nav': 'Legal Disclaimer', 'blocks': [
    p_('This document is provided for informational purposes only. It does not constitute an '
       'offer to sell, a solicitation of an offer to buy, or a recommendation of any token, '
       'security or financial instrument, in any jurisdiction, and nothing in it constitutes '
       'investment, legal, tax or accounting advice. It describes an engineering plan: timelines, '
       'budgets, milestones and deliverables are forward-looking statements subject to material '
       'uncertainty and change, and are not commitments or guarantees of delivery. Audit and '
       'security-competition outcomes cannot be known in advance, and no assurance is given that '
       'any audit will be completed within the window described or that any finding will be '
       'remediable within it. Vendor and firm names are indicative of the standard sought and do '
       'not represent engagements that have been secured. Market conditions cited for audit '
       'booking reflect published third-party sources as at July 2026. © 2026 BOUND Protocol.'),
]})

out = {'front': front, 'chapters': ch}
with open(os.path.join(ROOT, 'scripts/roadmap-content.json'), 'w') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('wrote scripts/roadmap-content.json — {} chapters'.format(len(ch)))
print('  milestones parsed   : {}'.format(len(milestones)))
print('  layer blocks parsed : {}'.format(sum(len(v) for v in layer_blocks.values())))
print('  deliverable items   : {}'.format(sum(len(b['bullets']) for v in layer_blocks.values() for b in v)))
print('  milestone bullets   : {}'.format(sum(len(m['bullets']) for m in milestones)))
print('  principles          : {}'.format(len(principles)))
print('  audit rounds        : {}'.format(len(audit_rounds)))
print('  exclusions          : {}'.format(len(exclusions)))
print('  budget cuts tie at  : {}'.format(M(BUDGET)))
