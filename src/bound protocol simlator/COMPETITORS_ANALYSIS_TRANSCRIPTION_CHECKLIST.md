# Competitors Analysis Transcription Checklist

**Source:** `BOUND_Competitors_Analysis_July2026.docx`
**Target:** `public/bound-competitors-analysis.html` — BND Token Economic Audit design
**Extracted:** 3,340 words · 77 content blocks · 1 table (10 rows × 6 cols) · 5 bullets · 14 citations
**Footnotes/endnotes:** none (verified empty)

## STATUS: ✅ COMPLETE AND VERIFIED

All 3,340 comparable words confirmed present in the rendered page at counts equal to or
greater than the source. Text was never retyped — `scripts/gen-competitors-content.py`
pulls it straight out of the .docx XML into `scripts/competitors-content.json`, and
`scripts/build-competitors.mjs` applies presentation only.

### Approved corrections — 4 substitutions

Each is logged by the generator at build time.

| # | Location | Found | Replaced with |
|---|---|---|---|
| 1 | Works Cited #14 | BCI | BLI |
| 2 | §2.4 Aave Horizon — *Comparison to BOUND* | BOUND's Reserve | BOUND's Liquidity Layer |
| 3 | §4 Competitive Matrix — *Liquidity source* row | BOUND Reserve | Bound Liquidity Layer |
| 4 | Works Cited #14 | BOUND Reserve | Bound Liquidity Layer |

Rendered results, checked in place:

- "…and **BOUND's Liquidity Layer** deploys idle capital into exactly this class of blue-chip lending venue."
- "Liquidity source · Protocol-owned **Bound Liquidity Layer** + APSS"
- "protocol architecture (rwaUSD, **BLI**, **Bound Liquidity Layer**, APSS)"

> **Note:** §3.3 already said "all RWA exposure lives in the **BLI**" in the source — that
> occurrence needed no change. The page therefore contains 2 × `BLI` in total.

The verifier asserts **zero** occurrences of `BCI`, `Collateralization`, `BOUND Reserve`,
or `BOUND's Reserve` survive anywhere in the rendered page.

### Rebuild / re-verify

```bash
node scripts/build-competitors.mjs          # regenerate the page

# prove the page still matches the source document
unzip -q "<path>/BOUND_Competitors_Analysis_July2026.docx" -d /tmp/cav
python3 scripts/verify-competitors.py /tmp/cav/word/document.xml public/bound-competitors-analysis.html
```

The verifier exits non-zero and lists any word that went missing.

---

Every row below was transcribed **verbatim** — no rewriting, summarizing, or truncation.

## Front Matter
- [x] Title: **BOUND Protocol / Competitors Analysis**
- [x] Subtitle: *The Competitive Landscape for RWA Liquidity Infrastructure*
- [x] 2026 *(the document's own title block says "2026", not "July 2026" — rendered verbatim)*
- [x] Confidentiality marker: "Confidential — Prepared for investor and partner distribution"

## 1. Competitive Framing — 3 ¶
- [x] ¶1 — category definition; competes for exit flow, issuer integrations, settlement standard
- [x] ¶2 — two tiers: 4 direct architectures + indirect competitors; the four assessment questions
- [x] ¶3 — Midas + Symbiotic consolidation; rented vs. owned liquidity thesis

## 2. Direct Competitors
Each competitor follows the same 4-block pattern: intro ¶, **Strengths**, **Weaknesses**,
**Comparison to BOUND**.

- [x] **2.1 Midas — Open Liquidity Architecture & MSL (Primary Competitor)** — 4 ¶
      ($1.7B issued, 20,000+ holders, TVL >$500M, $50M Series A, $58.75M total, $40M MSL capacity)
- [x] **2.2 Symbiotic Liquid Lane — the Market-Maker RFQ Network** — 4 ¶
      (2 June 2026 launch; Fasanara, Avantgarde, Barter, KPK curators; mGLOBAL first live asset)
- [x] **2.3 Ondo Nexus — Shared Redemption Rails for Tokenized Treasuries** — 4 ¶
      (PYUSD facility up to 25M/day; Circle BUIDL 23-hour disruption)
- [x] **2.4 Aave Horizon — Borrowing Against RWAs (the Leverage Alternative)** — 4 ¶
      (~$540M net deposits; $200M+ borrows; April 2026 $123M bad-debt event) — **correction #2**

## 3. Indirect Competitors and Structural Alternatives
- [x] **3.1 Issuer-Native Instant Redemption (BUIDL–Circle, OUSG rails)** — 1 ¶
- [x] **3.2 Secondary Venues and Per-Asset Pools (UniswapX BUIDL, DEX pairs)** — 1 ¶
- [x] **3.3 Discounted-Claim and RWA-Backed Dollar Designs (Usual USD0++/USD0)** — 1 ¶ (**BLI**, already correct in source)
- [x] **3.4 RWA-Native Platforms and Chains (Plume, Securitize ecosystem)** — 1 ¶

## 4. Competitive Matrix
- [x] Intro ¶
- [x] **TABLE 1** — **9 data rows × 6 columns** (BOUND · Midas MSL · Symbiotic Liquid Lane · Ondo Nexus · Aave Horizon)
  - [x] What the holder gets · Liquidity source (**correction #3**) · Asset scope · Issuer burden
  - [x] Stress behavior · Exit price certainty · Retail accessibility · Settlement asset created · Scale / traction
- [x] Sources caption

## 5. Strategic Synthesis
- [x] 5 bullets (The category's shared flaw · Consolidation, and the gap it leaves ·
      The uncontested segment · Regulatory asymmetry · Monitoring agenda)
- [x] **Net assessment** closing ¶

## Works Cited (unnumbered)
- [x] All **14 citations**, verbatim (#14 carries **corrections #1 and #4**)
- [x] Closing disclaimer ¶ — including "© 2026 BOUND Protocol / IO Investment."
