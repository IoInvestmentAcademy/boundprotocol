#!/usr/bin/env python3
"""Generate whitepaper-content.json from the source .docx.

Text is pulled VERBATIM from the document — never retyped. This script only
assigns STRUCTURE (which block is a heading / paragraph / bullet / table) and
applies the chapter renumbering the author approved (Governance = 10, forward),
plus one approved substantive correction: the entity structure in Chapter 12.

The source whitepaper predates the three-entity structure recorded in the
corporate documents and the SAFT. It attributes development of the protocol to
the token issuer. That is now wrong and contradicts the Operating Cost &
Company Analysis, so the passage is corrected here rather than left to
contradict the rest of the document set. Every source word is preserved; the
correction only adds.
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
# Approved corrections. Applied to source text before structure is assigned, so
# the rendered page and the verifier agree on what was intentionally changed.
# --------------------------------------------------------------------------
CORRECTIONS = [
    # The whitepaper stated "10,000+" stabilization transactions. The author has
    # corrected the figure to 2,000+, which is consistent with the APSS
    # transaction logs published in the library. Applied to every occurrence.
    ("10,000", "2,000"),
    (
    "BOUND is developed by BITSWIFT TECHNOLOGIES INC., a corporation "
    "incorporated under the laws of the Republic of Panama.",
    "BOUND is developed by an operating company incorporated in the European "
    "Union, which employs the engineering team and bears the operating cost, "
    "under a development and services agreement with Nexus Technologies "
    "Foundation, a private-interest foundation incorporated under the laws of "
    "the Republic of Panama. The Foundation owns the protocol and its "
    "intellectual property, and grants the token delegation. The tokens are "
    "issued and distributed by BITSWIFT TECHNOLOGIES INC., a corporation "
    "incorporated under the laws of the Republic of Panama, which holds the "
    "raise proceeds and is the counterparty on the SAFT."
)]
_fixed = []

def correct(text):
    out = text
    for old, new in CORRECTIONS:
        if old in out:
            out = out.replace(old, new)
            _fixed.append(old[:60] + '...')
    return out

# ---- Load every body block in document order, mirroring extract.py exactly ----
tree = ET.parse(sys.argv[1])
body = tree.getroot().find(qn('body'))
blocks = []   # ('p', text) | ('tbl', rows)
for child in body:
    if child.tag == qn('p'):
        t = correct(para_text(child).strip())
        if t: blocks.append(('p', t))
    elif child.tag == qn('tbl'):
        rows = []
        for tr in child.findall(qn('tr')):
            cells = []
            for tc in tr.findall(qn('tc')):
                texts = [correct(para_text(p).strip()) for p in tc.findall(qn('p'))]
                cells.append(' / '.join(x for x in texts if x))
            rows.append(cells)
        blocks.append(('tbl', rows))

# `blocks` is 0-indexed; whitepaper.txt line N (1-based) == blocks[N-1] for paragraphs.
# Tables occupy one block but several .txt lines, so we index by a running cursor built here:
line_of_block = []
ln = 1
for kind, val in blocks:
    line_of_block.append(ln)
    ln += 1 if kind == 'p' else len(val) + 2   # [TABLE..] + rows + [/TABLE]
B = {line_of_block[i]: blocks[i] for i in range(len(blocks))}

def P(n):
    kind, val = B[n]
    assert kind == 'p', f'line {n} is not a paragraph'
    return val

def T(n):
    kind, val = B[n]
    assert kind == 'tbl', f'line {n} is not a table'
    return val

def strip_num(s):
    """Remove a leading chapter number ('4. ') — it is rendered in its own badge."""
    return re.sub(r'^\d{1,2}\.\s+', '', s)

# ---------------------------------------------------------------------------
# STRUCTURE MAP. Chapter numbers reflect the author's renumbering:
# Governance becomes 10; Risk/Regulatory/Roadmap/Conclusion shift 10-13 -> 11-14.
# ---------------------------------------------------------------------------
def para(n, bold=False):      return {'t': 'p',  'text': P(n), 'boldLabel': bold}
def bullet(ns, bold=False):   return {'t': 'ul', 'items': [P(n) for n in ns], 'boldLabel': bold}
def table(n, cap=None):
    rows = T(n)
    return {'t': 'table', 'head': rows[0], 'rows': rows[1:], 'cap': cap}
def formula(n):               return {'t': 'formula', 'text': P(n)}
def sub(n, blocks_):          return {'t': 'sub', 'title': P(n), 'blocks': blocks_}

doc = {
    'front': {
        'brand': P(1), 'kind': P(2), 'tagline': P(3),
        'version': P(4), 'place': P(5),
    },
    'chapters': [
        # --- Abstract (unnumbered) ---
        {'num': '', 'id': 'abstract', 'title': P(6), 'nav': 'Abstract', 'blocks': [
            para(7), para(8), para(9)]},

        {'num': '1', 'id': 'litepaper', 'title': strip_num(P(10)), 'nav': 'The BOUND Litepaper', 'blocks': [
            para(11),
            sub(12, [para(13)]),
            sub(14, [para(15), para(16), para(17)]),
            sub(18, [para(19)]),
            sub(20, [bullet([21, 22, 23], bold=True)]),
            sub(24, [para(25), para(26)]),
        ]},

        {'num': '2', 'id': 'overview', 'title': strip_num(P(27)), 'nav': 'Protocol Overview', 'blocks': [
            para(28),
            bullet([29, 30, 31, 32, 33], bold=True),
            sub(34, [para(35), para(36)]),
            sub(37, [para(38)]),
        ]},

        {'num': '3', 'id': 'problem', 'title': strip_num(P(39)), 'nav': 'The RWA Liquidity Problem', 'blocks': [
            sub(40, [para(41), para(42)]),
            sub(43, [para(44), para(45)]),
            sub(46, [bullet([47, 48, 49, 50, 51], bold=True)]),
        ]},

        {'num': '4', 'id': 'rwausd', 'title': strip_num(P(52)), 'nav': 'rwaUSD', 'blocks': [
            sub(53, [para(54), table(55)]),
            sub(64, [para(65)]),
            sub(66, [para(67)]),
            sub(68, [para(69)]),
            sub(70, [para(71)]),
        ]},

        {'num': '5', 'id': 'bli', 'title': strip_num(P(72)), 'nav': 'BLI — Bound Liquidity Index', 'blocks': [
            sub(73, [para(74), para(75), formula(76), para(77)]),
            sub(78, [para(79)]),
            sub(80, [para(81)]),
            sub(82, [bullet([83, 84, 85], bold=True)]),
        ]},

        {'num': '6', 'id': 'layer', 'title': strip_num(P(86)), 'nav': 'The Bound Liquidity Layer', 'blocks': [
            sub(87, [para(88)]),
            sub(89, [table(90), para(97), para(98)]),
            sub(99, [para(100), para(101)]),
            sub(102, [para(103), table(104), para(111)]),
            sub(112, [para(113)]),
            sub(114, [para(115)]),
        ]},

        {'num': '7', 'id': 'apss', 'title': strip_num(P(116)), 'nav': 'APSS', 'blocks': [
            sub(117, [para(118), para(119)]),
            sub(120, [table(121, cap=P(129))]),
            sub(130, [para(131)]),
        ]},

        {'num': '8', 'id': 'economics', 'title': strip_num(P(132)), 'nav': 'Protocol Economics', 'blocks': [
            sub(133, [para(134), table(135)]),
            sub(148, [para(149)]),
            sub(150, [para(151)]),
        ]},

        # Ch.9 title is untagged in the source (styling bug) — it is body text at line 152.
        {'num': '9', 'id': 'bnd', 'title': strip_num(P(152)), 'nav': 'BND — The Governance Token', 'blocks': [
            sub(153, [para(154), bullet([155, 156, 157, 158], bold=True)]),
            sub(159, [para(160), bullet([161, 162, 163, 164], bold=True)]),
            sub(165, [para(166), bullet([167, 168, 169, 170], bold=True)]),
            sub(171, [para(172), bullet([173, 174, 175], bold=True), para(176)]),
            sub(177, [table(178, cap=P(190))]),
        ]},

        # Governance — unnumbered in the source; author assigned it chapter 10.
        {'num': '10', 'id': 'governance', 'title': P(191), 'nav': 'Governance', 'blocks': [
            para(192), para(193), para(194),
            sub(195, [para(196), para(197), para(198)]),
            sub(199, [para(200), para(201)]),
            sub(202, [para(203), para(204), para(205)]),
            sub(206, [para(207), bullet([208, 209, 210], bold=True), para(211)]),
            sub(212, [para(213), para(214)]),
            sub(215, [para(216)]),
        ]},

        {'num': '11', 'id': 'risk', 'title': strip_num(P(217)), 'nav': 'Risk Framework', 'blocks': [
            para(218), table(219)]},

        # Line 231 duplicates line 232's heading in the source — rendered once.
        {'num': '12', 'id': 'legal', 'title': strip_num(P(232)), 'nav': 'Regulatory & Legal Framework', 'blocks': [
            para(233), para(234, bold=True), para(235, bold=True),
            para(236), para(237, bold=True), para(238)]},

        {'num': '13', 'id': 'roadmap', 'title': strip_num(P(239)), 'nav': 'Roadmap', 'blocks': [
            table(240, cap=P(248))]},

        {'num': '14', 'id': 'conclusion', 'title': strip_num(P(249)), 'nav': 'Conclusion', 'blocks': [
            para(250), para(251), para(252)]},

        {'num': '', 'id': 'disclaimer', 'title': P(253), 'nav': 'Legal Disclaimer', 'blocks': [
            para(254)]},
    ],
}

json.dump(doc, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(f'Wrote {sys.argv[2]}')
print(f'{len(doc["chapters"])} chapters')
print(f"\nApproved corrections applied ({len(_fixed)}):")
for f in _fixed: print("   ", f)
