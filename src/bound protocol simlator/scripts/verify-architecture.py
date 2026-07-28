#!/usr/bin/env python3
"""Verify public/bound-architecture.html against the source overview PDF.

Two obligations are checked. Everything the source names must survive into the
rendered page — six contracts, four access levels, four modifiers. And everything
the source describes that is no longer current must be gone: the multi-chain
deployment, the cross-chain execution dependency, and the legacy token names.

Usage:  python3 scripts/verify-architecture.py [path-to-pdf]
"""
import html
import os
import re
import sys

import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Downloads/BOUND Smart Contract Architecture - Overview (1).pdf')

src = re.sub(r'\s+', ' ', ' '.join((p.extract_text() or '') for p in pypdf.PdfReader(PDF).pages))

page_raw = open(os.path.join(ROOT, 'public/bound-architecture.html')).read()
page = re.sub(r'<style>[\s\S]*?</style>', ' ', page_raw)
page = re.sub(r'<script>[\s\S]*?</script>', ' ', page)
page = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', page)))

fails = []

# --- 1. every contract in the source survives, under its deployed filename ---
CONTRACTS = ['BOUND.sol', 'BOUNDHook.sol', 'BAMS.sol', 'BOUNDExchange.sol',
             'BOUNDCalculator.sol', 'SBOUNDToken.sol']
for c in CONTRACTS:
    assert c in src, 'source no longer names {} — regenerate'.format(c)
    if c not in page:
        fails.append('contract absent from page: ' + c)
print('  {} source contracts carried                       ..... {}'.format(
    len(CONTRACTS), 'OK' if not fails else 'FAIL'))

# --- 2. access control fully represented ---
MODIFIERS = ['onlyOwner', 'onlyDirectMinter', 'onlyOwnerOrControllers', 'nonReentrant']
missing_mod = [m for m in MODIFIERS if m not in page]
if missing_mod:
    fails.append('modifiers absent: ' + ', '.join(missing_mod))
for lvl in ['Owner only', 'Direct minters', 'Controllers', 'Public']:
    if lvl not in page:
        fails.append('access level absent: ' + lvl)
print('  4 modifiers, 4 access levels present              ..... {}'.format(
    'OK' if not missing_mod else 'FAIL'))

# --- 3. current naming applied ---
for term in ['rwaUSD', 'BLI']:
    if term not in page:
        fails.append('current token name absent: ' + term)
# sBOUND may appear only where the rename itself is being recorded.
for m in re.finditer(r'sBOUND', page):
    ctx = page[max(0, m.start() - 90):m.end() + 90]
    if not re.search(r'rename|predates|source', ctx, re.I):
        fails.append('legacy token name sBOUND used outside the rename note')
        break
print('  current token naming applied                      ..... {}'.format(
    'OK' if not any('token name' in f for f in fails) else 'FAIL'))

# --- 4. retired concepts removed ---
# The source names these; the current architecture does not carry them.
for gone, why in [('Polygon', 'secondary network'), ('LiFi', 'cross-chain execution'),
                  ('fair launch', 'contribution-based launch mechanism')]:
    assert gone.lower() in src.lower(), 'source no longer names {} — check the removal list'.format(gone)
    if re.search(re.escape(gone), page, re.I):
        fails.append('retired concept still present: {} ({})'.format(gone, why))
if 'Ethereum' not in page:
    fails.append('deployment network Ethereum not stated')
print('  retired multi-chain concepts removed              ..... {}'.format(
    'OK' if not any('retired' in f for f in fails) else 'FAIL'))

# --- 5. fee schedule matches the platform, not the source constant ---
for rate in ['0.88%', '0.44%', '0.30%']:
    if rate not in page:
        fails.append('fee rate absent: ' + rate)
if 'Recorded discrepancy' not in page:
    fails.append('the source fee discrepancy is not disclosed')
print('  platform fee schedule stated, conflict disclosed  ..... {}'.format(
    'OK' if not any('fee' in f or 'discrepancy' in f for f in fails) else 'FAIL'))

# --- 6. no invented certainty ---
if re.search(r'\b100%\s*(?:test\s*)?coverage|fully audited|audit(?:ed)? by\b', page, re.I):
    fails.append('claims audit or coverage the source does not establish')
print('  no coverage or audit claim beyond the source      ..... {}'.format(
    'OK' if not any('audit' in f for f in fails) else 'FAIL'))

graphs = len(re.findall(r'class="cv"', page_raw))
if graphs < 1:
    fails.append('architecture diagram missing')
print('  {} inline SVG diagram rendered                     ..... OK'.format(graphs))

if fails:
    print('\nFAIL')
    for f in fails:
        print('   ' + f)
    sys.exit(1)

print()
print('PASS — every component, modifier and access level in the source is')
print('       carried; retired multi-chain concepts are gone; the fee')
print('       schedule matches the platform and its conflict is disclosed.')
