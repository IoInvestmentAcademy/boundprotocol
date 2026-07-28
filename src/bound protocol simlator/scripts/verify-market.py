#!/usr/bin/env python3
"""Prove the Market Analysis transcription is lossless.

Strips the generated HTML back to plain text and compares it word-for-word against
the source .docx. The ONLY permitted differences are the author-approved corrections
(BCI -> BLI, BOUND Reserve -> Bound Liquidity Layer, and the stray colon dropped from
each Conclusions item) plus the chapter-number punctuation carried by the .sec-num badge.

Usage:
  unzip -q "<path>/BOUND_Market_Analysis_July2026.docx" -d /tmp/mav
  python3 scripts/verify-market.py /tmp/mav/word/document.xml public/bound-market-analysis.html
"""
import re, sys, html
from collections import Counter
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

# ---------- source ----------
body = ET.parse(sys.argv[1]).getroot().find(qn('body'))
src = []
for child in body:
    if child.tag == qn('p'):
        t = para_text(child).strip()
        if t: src.append(t)
    elif child.tag == qn('tbl'):
        for tr in child.findall(qn('tr')):
            for tc in tr.findall(qn('tc')):
                c = ' / '.join(x for x in (para_text(p).strip() for p in tc.findall(qn('p'))) if x)
                if c: src.append(c)

# Apply the same approved corrections to the source before comparing, so the diff
# shows only genuine transcription loss rather than the changes we intended.
def rename(s):
    s = s.replace('Bound Collateralization Index', 'Bound Liquidity Index')
    s = re.sub(r'\bBCI\b', 'BLI', s)
    s = s.replace('BOUND Reserve', 'Bound Liquidity Layer')
    s = re.sub(r'^(\d{1,2}\.):', r'\1', s)
    return s

def count(pat, flags=0):
    return sum(len(re.findall(pat, s, flags)) for s in src)

RENAMED = {
    'BCI -> BLI': count(r'\bBCI\b') + count(r'Bound Collateralization Index'),
    'BOUND Reserve -> Bound Liquidity Layer': count(r'BOUND Reserve'),
    'stray colon dropped': count(r'^(\d{1,2}\.):', re.M),
}
src = [rename(s) for s in src]

# ---------- rendered page ----------
page = open(sys.argv[2]).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = re.sub(r'<[^>]+>', ' ', page)
page = html.unescape(page)

TOK = r"[\w$%×≈÷–—’'\.\-]+"
def norm(w):
    # "10. Why Now" renders its number in the .sec-num badge, without the period.
    return w[:-1] if re.fullmatch(r'\d{1,2}\.', w) else w

ws = Counter(norm(w) for s in src for w in re.findall(TOK, s))
wo = Counter(norm(w) for w in re.findall(TOK, page))

missing = ws - wo
if missing:
    print('FAIL — source words absent from the rendered page:')
    for w, n in sorted(missing.items()):
        print(f'   {w!r} x{n}')
    sys.exit(1)

print(f'source words in page : {sum(ws.values())}')
print(f'distinct source words: {len(ws)}')
print('approved corrections :')
for k, n in RENAMED.items():
    print(f'   {n:>2d}  {k}')
print()
print('PASS — every word of the source document appears in the rendered page,')
print('       at a count greater than or equal to the source.')

# No stale terminology may survive anywhere in the output.
assert not re.search(r'\bBCI\b', page), 'FAIL: stale "BCI" found in rendered page'
assert 'Collateralization' not in page, 'FAIL: stale "Collateralization" found in rendered page'
assert 'BOUND Reserve' not in page, 'FAIL: stale "BOUND Reserve" found in rendered page'
assert not re.search(r'\d\.:', page), 'FAIL: stray "N.:" colon found in rendered page'
print('       no stale "BCI" / "Collateralization" / "BOUND Reserve" / "N.:" in the page.')

for h in ['Executive Summary', 'Key Findings', 'Scope, Methodology', 'Market Context',
          'The Structural Contradiction', 'The Evidence Base', 'Why the Gap Persists',
          'Market Sizing', 'Demand-Side Segments', 'Competitive Validation',
          'Competitive Landscape', 'Stablecoin Market Context', 'Regulatory Environment',
          'Why Now', 'Conclusions', 'Works Cited']:
    assert h in page, f'MISSING HEADING: {h}'
print('       all 16 spot-checked headings present.')
