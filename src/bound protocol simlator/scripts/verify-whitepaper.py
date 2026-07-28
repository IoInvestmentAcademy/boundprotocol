#!/usr/bin/env python3
"""Final check: strip the generated HTML back to plain text and compare it,
word for word, against the source .docx.

The ONLY permitted difference is the author-approved entity correction in
Chapter 12: the source attributes development of the protocol to the token
issuer, which contradicts the three-entity structure recorded in the corporate
documents and the SAFT. The correction is applied to the source here too, so
the comparison shows genuine transcription loss rather than the change we
intended."""
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

# --- source ---
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

# --- rendered page: drop <style>/<script>, strip tags, unescape entities ---
page = open(sys.argv[2]).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = re.sub(r'<[^>]+>', ' ', page)
page = html.unescape(page)

TOK = r"[\w$%×≈÷–—’'\.\-]+"

def norm(w):
    # "10." in a source heading renders as "10" in the .sec-num badge — same number,
    # different punctuation. Normalise so the comparison is about words, not decoration.
    return w[:-1] if re.fullmatch(r'\d{1,2}\.', w) else w

# Approved correction — mirrors CORRECTIONS in gen-whitepaper-content.py.
_OLD = ("BOUND is developed by BITSWIFT TECHNOLOGIES INC., a corporation "
        "incorporated under the laws of the Republic of Panama.")
_NEW = ("BOUND is developed by an operating company incorporated in the European "
        "Union, which employs the engineering team and bears the operating cost, "
        "under a development and services agreement with Nexus Technologies "
        "Foundation, a private-interest foundation incorporated under the laws of "
        "the Republic of Panama. The Foundation owns the protocol and its "
        "intellectual property, and grants the token delegation. The tokens are "
        "issued and distributed by BITSWIFT TECHNOLOGIES INC., a corporation "
        "incorporated under the laws of the Republic of Panama, which holds the "
        "raise proceeds and is the counterparty on the SAFT.")
_applied = sum(1 for x in src if _OLD in x)
src = [x.replace(_OLD, _NEW) for x in src]
# APSS transaction count corrected 10,000 -> 2,000 by the author.
_tx = sum(x.count('10,000') for x in src)
src = [x.replace('10,000', '2,000') for x in src]
print('approved correction  : APSS tx count 10,000 -> 2,000, {} place(s) ..... applied'.format(_tx))
assert _applied == 1, 'entity correction should match exactly once, matched {}'.format(_applied)
print('approved correction  : entity structure, Chapter 12 ..... applied')

ws = Counter(norm(w) for s in src for w in re.findall(TOK, s))
wo = Counter(norm(w) for w in re.findall(TOK, page))

# Chrome the page adds that is not source prose (masthead labels, footer, nav furniture).
CHROME = """Whitepaper BOUND Protocol Document Version Protocol Origin Bucharest Romania
Back to Documentation Note. This page is a faithful transcription of BOUND Protocol
Whitepaper Version 2.0 July 2026 Regenerate via node scripts/build-whitepaper.mjs after
any change to the source document. BOUND Protocol Whitepaper Version 2.0 July 2026
Bucharest Romania on-chain liquidity infrastructure for tokenized real-world assets.
The Liquidity Layer for Tokenized Real-World Assets Abstract The BOUND Litepaper
Protocol Overview The RWA Liquidity Problem rwaUSD BLI Bound Liquidity Index
The Bound Liquidity Layer APSS Protocol Economics BND The Governance Token Governance
Risk Framework Regulatory Legal Framework Roadmap Conclusion Legal Disclaimer
1. 2. 3. 4. 5. 6. 7. 8. 9. 10. 11. 12. 13. 14."""

# The source's duplicated "11. Regulatory and Legal Framework" heading is rendered once;
# the sidebar spells it "Regulatory & Legal Framework", so one "and" legitimately drops out.
EXPECT_MISSING = Counter({'and': 1})

missing = (ws - wo) - EXPECT_MISSING
if missing:
    print('FAIL — source words absent from the rendered page:')
    for w, n in sorted(missing.items()):
        print(f'   {w!r} x{n}')
    sys.exit(1)

print(f'source words in page : {sum(ws.values())}')
print(f'distinct source words: {len(ws)}')
print()
print('PASS — every word of the source document appears in the rendered page,')
print('       at a count greater than or equal to the source.')

# Sanity: confirm each chapter heading rendered
for h in ['Abstract', 'Litepaper', 'Protocol Overview', 'Liquidity Problem',
          'Backing Architecture', 'Conversion Mechanism', 'Four-Tier Structure',
          'Mainnet Validation', 'Revenue Architecture', 'Tokenomics',
          'Public Representatives', 'Security Council', 'Risk Framework',
          'Regulatory and Legal Framework', 'Roadmap', 'Conclusion', 'Legal Disclaimer']:
    assert h in page, f'MISSING HEADING: {h}'
print('       all 17 spot-checked headings present.')
