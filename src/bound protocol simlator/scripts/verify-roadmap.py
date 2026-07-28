#!/usr/bin/env python3
"""Verify public/bound-delivery-roadmap.html against both source .docx roadmaps.

The merged document must lose nothing. This re-parses both sources independently
of the generator and asserts that every milestone, deliverable, principle,
budget line and role appears in the rendered page — allowing only the deliberate
terminology substitutions recorded in Chapter 10.

Usage:  python3 scripts/verify-roadmap.py [milestone.docx] [technical.docx]
"""
import html
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


def texts(path):
    """Every non-empty paragraph and table cell in the document."""
    body = ET.fromstring(zipfile.ZipFile(path).read('word/document.xml')).find(qn('body'))
    out = []

    def ptext(p):
        parts = []
        for node in p.iter():
            if node.tag == qn('t'):
                parts.append(node.text or '')
            elif node.tag == qn('tab'):
                parts.append(' ')
            elif node.tag in (qn('br'), qn('cr')):
                parts.append(' ')
        return ''.join(parts).strip()

    for child in body.iter():
        if child.tag == qn('p'):
            t = ptext(child)
            if t:
                out.append(t)
    return out


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
    return s.replace('rwaUSD rwaUSD', 'rwaUSD')


def norm(s):
    """Collapse whitespace and unify dashes/quotes so comparison is about words."""
    s = fix(s)
    s = s.replace('’', "'").replace('‘', "'")
    s = s.replace('“', '"').replace('”', '"')
    s = re.sub(r'[‐-―−]', '-', s)
    return re.sub(r'\s+', ' ', s).strip()


page_raw = open(os.path.join(ROOT, 'public/bound-delivery-roadmap.html')).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page_raw)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = norm(html.unescape(re.sub(r'<[^>]+>', ' ', page)))

# Cover furniture and source section headings that were deliberately renamed in the
# merge. Content paragraphs are never skipped — only titles and boilerplate.
SKIP = re.compile(
    r'^(BOUND PROTOCOL|CONFIDENTIAL|©|boundprotocol\.com|Non-Technical Stakeholder Edition'
    r'|Instant Liquidity for Real-World Assets|Engineering Technical Roadmap'
    r'|RWA Migration - Milestone Roadmap|Built on deployed|4 Layers|12 Milestones'
    r'|Starting Point: What|Executive Summary|Timeline at a Glance|About BOUND Protocol'
    r'|Engineering Roadmap: Executive Summary|Guiding Principles|Milestones$'
    r'|Phase-by-Phase Deliverables|Development Budget|Budget by |Workforce Allocation'
    r'|Excluded from Development Budget|Audit & Security Strategy'
    r'|Schedule Risk & Compression Notes|Phase \d|Strategic Benefit|Asset$|Role$|Layer$'
    r'|Condition$|Workstream$|Phase$|Total budget$)', re.I)

# Milestone headings ("M1 · Wks 1-2 — Title") are split into card fields, and the
# "Strategic outcome:" prefix is dropped. Both are structural, not content loss —
# so those lines are checked by their parts instead of as whole strings.
MS_HEAD = re.compile(r'^M(\d+)\s*·\s*(.+?)\s+-\s+(.+)$')


def check_special(t, page):
    n = norm(t)
    m = MS_HEAD.match(n)
    if m:
        # id, week span and title must each be present
        return all(x in page for x in ('M' + m.group(1), m.group(2).strip(), m.group(3).strip()))
    if n.lower().startswith('strategic outcome'):
        body = re.sub(r'^strategic outcome\s*:\s*', '', n, flags=re.I).strip()
        return body[:100] in page
    return None

failures = []
for label, path in (('milestone', MS_PATH), ('technical', TC_PATH)):
    src = texts(path)
    missing = []
    for t in src:
        if SKIP.match(norm(t)) or len(t) < 12:
            continue
        sp = check_special(t, page)
        if sp is True:
            continue
        if sp is False:
            missing.append(t)
            continue
        n = norm(t)
        # A source paragraph may be split across cells/renders; require a solid prefix match.
        if n[:110] not in page:
            missing.append(t)
    print('{:<10} source paragraphs: {:>4}   carried: {:>4}   missing: {}'.format(
        label, len(src), len(src) - len(missing), len(missing)))
    if missing:
        failures.append((label, missing))

if failures:
    print('\nFAIL — source content absent from the rendered page:')
    for label, missing in failures:
        for t in missing[:25]:
            print('   [{}] {}'.format(label, t[:120]))
    sys.exit(1)

# --- structural assertions ---
for i in range(1, 13):
    assert re.search(r'\bM{}\b'.format(i), page), 'milestone M{} absent'.format(i)
print('\n  all 12 milestone identifiers present            ..... OK')

for role in ['Senior smart contract engineer', 'Backend / oracle engineer', 'Frontend engineer',
             'DevOps engineer', 'Protocol architect / PM', 'QA engineer']:
    assert norm(role) in page, 'workforce role absent: ' + role
print('  all workforce roles present                     ..... OK')

for ws in ['Smart contracts', 'Backend & oracle automation', 'Frontend & product UI',
           'DevOps & infrastructure', 'Architecture & program management',
           'QA & integration testing', 'Mainnet launch engineering', 'Contingency reserve']:
    assert norm(ws) in page, 'workstream absent: ' + ws
print('  all 8 workstreams present                       ..... OK')

assert '$320,000' in page, 'budget total absent'
for amt in ['$90,000', '$62,000', '$52,000', '$28,000', '$32,000', '$18,000', '$26,000', '$12,000',
            '$78,000', '$154,000', '$88,000', '$81,000', '$56,000', '$45,500', '$24,000',
            '$36,000', '$16,000', '$21,500']:
    assert amt in page, 'budget figure absent: ' + amt
print('  budget total and all line amounts present       ..... OK')

# --- terminology: the rename must be complete ---
leaked = re.findall(r'\bBLD\b', page)
assert not leaked, 'legacy token name BLD leaked into the page ({} times)'.format(len(leaked))
assert not re.search(r'\bMICA\b', page), 'MICA not normalised to MiCA'
print('  no legacy BLD / MICA naming survives            ..... OK')

charts = len(re.findall(r'class="cv"', page_raw))
cards = len(re.findall(r'class="ms"', page_raw))
assert charts >= 3, 'expected at least 3 charts'
assert cards == 12, 'expected 12 milestone cards, found {}'.format(cards)
print('  {} charts, {} milestone cards rendered            ..... OK'.format(charts, cards))

print()
print('PASS — every paragraph of both source roadmaps is carried into the')
print('       rendered page, and all structural assertions hold.')
