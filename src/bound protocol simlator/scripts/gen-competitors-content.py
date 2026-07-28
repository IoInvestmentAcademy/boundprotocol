#!/usr/bin/env python3
"""Generate competitors-content.json from BOUND_Competitors_Analysis_July2026.docx.

Text is pulled VERBATIM from the document — never retyped. This script assigns
STRUCTURE only, plus the corrections approved for the document set:

    BCI              -> BLI
    BOUND Reserve    -> Bound Liquidity Layer   (align with the Whitepaper)
    BOUND's Reserve  -> BOUND's Liquidity Layer (same rename, possessive form)

Every substitution is logged to stdout so the change set is auditable.

Usage: python3 scripts/gen-competitors-content.py <document.xml> <out.json>
"""
import json, re, sys
from xml.etree import ElementTree as ET

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
def qn(t): return f'{{{W}}}{t}'

def para_text(p):
    parts = []
    for node in p.iter():
        if node.tag == qn('t'): parts.append(node.text or '')
        elif node.tag == qn('tab'): parts.append('\t')
        elif node.tag == qn('br'): parts.append(' ')
    return ''.join(parts)

# --------------------------------------------------------------------------
# Approved corrections. The possessive form is listed first so "BOUND's Reserve"
# is rewritten before the plain "BOUND Reserve" pattern could touch it.
# --------------------------------------------------------------------------
RENAMES = [(r"10,000\+ tx", "2,000+ tx"),
           ("Bound Collateralization Index", "Bound Liquidity Index"),
           (r"\bBCI\b", "BLI"),
           ("BOUND's Reserve", "BOUND's Liquidity Layer"),
           ("BOUND Reserve", "Bound Liquidity Layer")]
_log = []

def fix(text, where):
    out = text
    for pat, rep in RENAMES:
        for m in re.finditer(pat, out):
            before = m.group(0)
            after = re.sub(pat, rep, before) if '\\1' in rep else rep
            _log.append((where, before, after))
        out = re.sub(pat, rep, out)
    return out

# ---- load body blocks in document order ----
body = ET.parse(sys.argv[1]).getroot().find(qn('body'))
blocks, line_of, ln = [], [], 1
for child in body:
    if child.tag == qn('p'):
        t = para_text(child).strip()
        if t:
            blocks.append(('p', t)); line_of.append(ln); ln += 1
    elif child.tag == qn('tbl'):
        rows = []
        for tr in child.findall(qn('tr')):
            rows.append([' / '.join(x for x in
                        (para_text(p).strip() for p in tc.findall(qn('p'))) if x)
                        for tc in tr.findall(qn('tc'))])
        blocks.append(('tbl', rows)); line_of.append(ln); ln += len(rows) + 2
B = {line_of[i]: blocks[i] for i in range(len(blocks))}

def P(n):
    k, v = B[n]; assert k == 'p', f'line {n} is not a paragraph'
    return fix(v, f'line {n}')

def T(n):
    k, v = B[n]; assert k == 'tbl', f'line {n} is not a table'
    return [[fix(c, f'line {n} table') for c in row] for row in v]

def strip_num(s): return re.sub(r'^\d{1,2}\.\s+', '', s)

def para(n, bold=False):    return {'t': 'p', 'text': P(n), 'boldLabel': bold}
def cite(n):                return {'t': 'cite', 'text': P(n)}
def note(n):                return {'t': 'note', 'text': P(n)}
def bullet(ns, bold=False): return {'t': 'ul', 'items': [P(n) for n in ns], 'boldLabel': bold}
def table(n, cap=None):
    rows = T(n)
    return {'t': 'table', 'head': rows[0], 'rows': rows[1:], 'cap': cap}
def sub(n, bs):             return {'t': 'sub', 'title': P(n), 'blocks': bs}

# Each competitor is written as: intro paragraph, then Strengths / Weaknesses /
# Comparison to BOUND — the latter three carrying a bold lead-in label.
def competitor(head, intro):
    return sub(head, [para(intro),
                      para(intro + 1, bold=True),
                      para(intro + 2, bold=True),
                      para(intro + 3, bold=True)])

doc = {
    'front': {'brand': P(1), 'kind': P(2), 'tagline': P(3),
              'date': P(4), 'confidential': P(5)},
    'chapters': [
        {'num': '1', 'id': 'framing', 'title': strip_num(P(6)), 'nav': 'Competitive Framing', 'blocks': [
            para(7), para(8), para(9)]},

        {'num': '2', 'id': 'direct', 'title': strip_num(P(10)), 'nav': 'Direct Competitors', 'blocks': [
            competitor(11, 12),   # 2.1 Midas
            competitor(16, 17),   # 2.2 Symbiotic Liquid Lane
            competitor(21, 22),   # 2.3 Ondo Nexus
            competitor(26, 27),   # 2.4 Aave Horizon
        ]},

        {'num': '3', 'id': 'indirect', 'title': strip_num(P(31)), 'nav': 'Indirect Competitors', 'blocks': [
            sub(32, [para(33)]), sub(34, [para(35)]),
            sub(36, [para(37)]), sub(38, [para(39)]),
        ]},

        {'num': '4', 'id': 'matrix', 'title': strip_num(P(40)), 'nav': 'Competitive Matrix', 'blocks': [
            para(41), table(42, cap=P(54))]},

        {'num': '5', 'id': 'synthesis', 'title': strip_num(P(55)), 'nav': 'Strategic Synthesis', 'blocks': [
            bullet([56, 57, 58, 59, 60], bold=True), para(61, bold=True)]},

        {'num': '', 'id': 'sources', 'title': P(62), 'nav': 'Works Cited', 'blocks': [
            *[cite(n) for n in range(63, 77)],
            note(77)]},
    ],
}

json.dump(doc, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(f'Wrote {sys.argv[2]}')
print(f'{len(doc["chapters"])} chapters')
print(f'\nCorrections applied ({len(_log)}):')
for where, found, rep in _log:
    print(f'  {where:22s} {found!r} -> {rep!r}')
