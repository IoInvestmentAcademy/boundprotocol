#!/usr/bin/env python3
"""Generate market-content.json from BOUND_Market_Analysis_July2026.docx.

Text is pulled VERBATIM from the document — never retyped. This script assigns
STRUCTURE only, plus the corrections the author approved:

    Bound Collateralization Index -> Bound Liquidity Index
    BCI                           -> BLI
    BOUND Reserve                 -> Bound Liquidity Layer   (align with the Whitepaper)
    "1.:" at the start of a        -> "1."                   (drop the stray colon after
    Conclusions item                                          each manually typed number)

Every substitution is logged to stdout so the change set is auditable.

Usage: python3 scripts/gen-market-content.py <document.xml> <out.json>
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
# Approved corrections. Longest pattern first so the expanded name is rewritten
# before the bare acronym is considered. The final pattern is anchored to the
# start of a paragraph, so it can only ever touch the Conclusions items — the
# Works Cited entries begin "1. " with no colon and are left alone.
# --------------------------------------------------------------------------
RENAMES = [("Bound Collateralization Index", "Bound Liquidity Index"),
           (r"\bBCI\b", "BLI"),
           ("BOUND Reserve", "Bound Liquidity Layer"),
           (r"^(\d{1,2}\.):", r"\1")]
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

doc = {
    'front': {'brand': P(1), 'kind': P(2), 'tagline': P(3),
              'date': P(4), 'confidential': P(5)},
    'chapters': [
        {'num': '', 'id': 'exec', 'title': P(6), 'nav': 'Executive Summary', 'blocks': [
            para(7), para(8), para(9), para(10),
            sub(11, [bullet([12, 13, 14, 15, 16], bold=True)]),
        ]},

        {'num': '1', 'id': 'scope', 'title': strip_num(P(17)), 'nav': 'Scope & Methodology', 'blocks': [
            para(18), para(19), para(20), para(21)]},

        {'num': '2', 'id': 'context', 'title': strip_num(P(22)), 'nav': 'Market Context', 'blocks': [
            para(23), table(24, cap=P(34)), para(35), para(36)]},

        {'num': '3', 'id': 'gap', 'title': strip_num(P(37)), 'nav': 'The RWA Liquidity Gap', 'blocks': [
            sub(38, [para(39), para(40)]),
            sub(41, [table(42), para(51)]),
            sub(52, [bullet([53, 54, 55, 56], bold=True), para(57)]),
        ]},

        {'num': '4', 'id': 'sizing', 'title': strip_num(P(58)), 'nav': 'Market Sizing', 'blocks': [
            para(59),
            sub(60, [para(61), table(62), para(69), para(70)]),
            sub(71, [para(72), para(73)]),
            sub(74, [para(75), para(76)]),
        ]},

        {'num': '5', 'id': 'demand', 'title': strip_num(P(77)), 'nav': 'Demand-Side Segments', 'blocks': [
            para(78),
            sub(79, [para(80)]), sub(81, [para(82)]),
            sub(83, [para(84)]), sub(85, [para(86)]),
        ]},

        {'num': '6', 'id': 'midas', 'title': strip_num(P(87)), 'nav': 'Competitive Validation — Midas', 'blocks': [
            para(88), para(89),
            sub(90, [bullet([91, 92, 93, 94], bold=True), para(95)]),
        ]},

        {'num': '7', 'id': 'landscape', 'title': strip_num(P(96)), 'nav': 'Competitive Landscape', 'blocks': [
            para(97), table(98, cap=P(108)),
            sub(109, [para(110)]),
            sub(111, [table(112), para(121)]),
        ]},

        {'num': '8', 'id': 'stablecoin', 'title': strip_num(P(122)), 'nav': 'Stablecoin Market Context', 'blocks': [
            para(123), para(124), para(125)]},

        {'num': '9', 'id': 'regulatory', 'title': strip_num(P(126)), 'nav': 'Regulatory Environment', 'blocks': [
            sub(127, [para(128)]), sub(129, [para(130)]), sub(131, [para(132)])]},

        {'num': '10', 'id': 'whynow', 'title': strip_num(P(133)), 'nav': 'Why Now', 'blocks': [
            para(134), bullet([135, 136, 137, 138], bold=True), para(139)]},

        {'num': '11', 'id': 'conclusions', 'title': strip_num(P(140)), 'nav': 'Conclusions', 'blocks': [
            bullet([141, 142, 143, 144, 145])]},

        {'num': '', 'id': 'sources', 'title': P(146), 'nav': 'Works Cited', 'blocks': [
            *[cite(n) for n in range(147, 175)],
            note(175)]},
    ],
}

json.dump(doc, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(f'Wrote {sys.argv[2]}')
print(f'{len(doc["chapters"])} chapters')
print(f'\nTerminology corrections applied ({len(_log)}):')
for where, found, rep in _log:
    print(f'  {where:22s} {found!r} -> {rep!r}')
