# Whitepaper Transcription Checklist

**Source:** `BOUND_Whitepaper_v2_July_24_2026.docx`
**Target:** `public/bound-whitepaper.html` — BND Token Economic Audit design
**Extracted:** 8,458 words · 254 content blocks · 8 tables (60 table rows) · 19 bullets
**Footnotes/endnotes:** none (verified empty)

## STATUS: ✅ COMPLETE AND VERIFIED

All 8,303 comparable words confirmed present in the rendered page at counts equal to
or greater than the source. Text was never retyped — `scripts/gen-whitepaper-content.py`
pulls it straight out of the .docx XML into `scripts/whitepaper-content.json`, and
`scripts/build-whitepaper.mjs` applies presentation only.

### Rebuild / re-verify

```bash
node scripts/build-whitepaper.mjs          # regenerate the page

# prove the page still matches the source document
unzip -q "<path>/BOUND_Whitepaper_v2_July_24_2026.docx" -d /tmp/wpv
python3 scripts/verify-whitepaper.py /tmp/wpv/word/document.xml public/bound-whitepaper.html
```

The verifier exits non-zero and lists any word that went missing.

### Chapter numbering (as directed)

Governance was assigned **10**; everything after it shifted forward:

| Source | Rendered |
|---|---|
| *Governance* (unnumbered) | **10.** Governance |
| 10. Risk Framework | **11.** Risk Framework |
| 11. Regulatory and Legal Framework | **12.** Regulatory and Legal Framework |
| 12. Roadmap | **13.** Roadmap |
| 13. Conclusion | **14.** Conclusion |

Abstract and Legal Disclaimer remain unnumbered (shown as `§`).

---

Every row below was transcribed **verbatim** — no rewriting, summarizing, or truncation.

---

## Front Matter
- [x] Title: **BOUND Protocol / Whitepaper**
- [x] Subtitle: *The Liquidity Layer for Tokenized Real-World Assets*
- [x] Version 2.0 — July 2026
- [x] Bucharest, Romania

## Abstract — 3 paragraphs (370 w)
- [x] ¶1 — $33.5B RWA market, 56% zero weekly activity
- [x] ¶2 — BOUND definition, three tokens, Liquidity Layer, APSS mainnet stats
- [x] ¶3 — Revenue from transaction flow; no promise of returns; AIG metric caveat

## 1. The BOUND Litepaper (705 w)
- [x] Chapter intro — byline "By Georgian Ionita, Founder of BOUND Protocol"
- [x] **1.1 Why I Wrote This** — 1 ¶
- [x] **1.2 What Happened to Tokenization** — 3 ¶
- [x] **1.3 What BOUND Does, In One Paragraph** — 1 ¶
- [x] **1.4 The Three Tokens, Simply** — 3 bullets (rwaUSD · BLI · BND)
- [x] **1.5 Who This Is For** — 2 ¶

## 2. Protocol Overview (618 w)
- [x] Chapter intro — 1 ¶
- [x] 5 numbered component bullets (rwaUSD · BLI · Liquidity Layer · RWA Markets · APSS)
- [x] **2.1 How the Pieces Fit** — 2 ¶
- [x] **2.2 What Is Live** — 1 ¶

## 3. Introduction: The RWA Liquidity Problem (559 w)
- [x] **3.1 The Market That Grew Without an Exit** — 2 ¶
- [x] **3.2 Why Existing Approaches Fail** — 2 ¶
- [x] **3.3 Design Requirements** — 5 bullets

## 4. rwaUSD — The Liquid Dollar of the RWA Sector (632 w)
- [x] **4.1 Definition and Characteristics** — 1 ¶
- [x] **TABLE 1** — Property/Specification — **6 data rows** (Minting, Backing, Redemption, Peg defense, Returns to holders, Regulatory design target)
- [x] **4.2 Backing Architecture: The Bound Core** — 1 ¶
- [x] **4.3 External Utility** — 1 ¶
- [x] **4.4 Direct Minting for Institutions** — 1 ¶
- [x] **4.5 Launch Mechanism** — 1 ¶

## 5. BLI — The Bound Liquidity Index (597 w)
- [x] **5.1 Definition and Characteristics** — 2 ¶
- [x] **Formula block** — `BLI Price = (Bound Liquidity Layer NAV + BLI Surplus Account) ÷ BLI Supply`
- [x] 5.1 closing ¶ (NAV components, bookkeeping identity)
- [x] **5.2 Conversion Mechanism** — 1 ¶
- [x] **5.3 Redemption Mechanism and Seniority** — 1 ¶
- [x] **5.4 What BLI Holders Actually Hold** — 3 bullets (Asset side · Fee side · Risk side)

## 6. The Bound Liquidity Layer (1,010 w — largest chapter)
- [x] **6.1 Purpose and Principles** — 1 ¶
- [x] **6.2 The Four-Tier Structure**
  - [x] **TABLE 2** — Tier/Contents/Function/Key Constraint — **4 data rows** (Tier 1 Immediate Buffer · Tier 2 Reserve · Tier 3 Enhanced · Tier 4 RWA Inventory)
  - [x] 2 ¶ after table (parameters; waterfall + return distribution)
- [x] **6.3 RWA Markets and the Recycling Model** — 2 ¶
- [x] **6.4 The Liquidity Coverage Engine** — 1 ¶ intro
  - [x] **TABLE 3** — Regime/Trigger/Protocol Behavior — **4 data rows** (HEALTHY · WARNING · STRESS · EMERGENCY)
  - [x] 1 ¶ after table (coverage multiple; 36-month simulation)
- [x] **6.5 Market Onboarding** — 1 ¶
- [x] **6.6 The Emergency Reserve and Loss Waterfall** — 1 ¶

## 7. The Atomic Peg Stabilization System (APSS) (425 w)
- [x] **7.1 The Mechanism** — 2 ¶
- [x] **7.2 Mainnet Validation**
  - [x] **TABLE 4** — Metric/Measured Result — **5 data rows** (Deployment status · Transactions 10,000+ · Gas ≈$0.10 · Surplus ≈0.8% · Peg defense model)
  - [x] 1 ¶ telemetry note
- [x] **7.3 Properties and Limits** — 1 ¶

## 8. Protocol Economics (438 w)
- [x] **8.1 Revenue Architecture** — 1 ¶ intro
  - [x] **TABLE 5** — #/Stream/Source — **all 10 revenue streams** (haircut spread · market trading fees · conversion fees · direct mint/redeem · APSS stabilization · pool fees · Layer deployment returns · Bound Core backing returns · issuer integration · issuer maintenance)
- [x] **8.2 Fee Distribution** — 1 ¶
- [x] **8.3 Why the Economics Are Counter-Cyclical** — 1 ¶

## 9. BND — The Governance Token (820 w)
- [x] Chapter title *(⚠️ untagged in source — see anomalies)*
- [x] **9.1 Role and Utility** — intro ¶ + 4 labeled items
  - [x] Governance · Fee Utility · Revenue Participation · Governance Security
- [x] **9.2 Sustainable Economics and a Fixed, Deflationary Supply** — intro ¶ (1B fixed supply) + 4 labeled items
  - [x] Fixed Supply · Deflationary Mechanics · Governance-Controlled Distribution · Adaptive Supply Cap
- [x] **9.3 Capital Formation and the Burn Engine** — intro ¶ (3 rounds) + 4 labeled items
  - [x] Capital Allocation · Burn Engine · Long-Term Operation · Vesting
- [x] **9.4 Value Accrual and Governance** — intro ¶ + 3 labeled items + closing disclaimer ¶
  - [x] Supply Reduction · Revenue Participation · Governance Rights
- [x] **9.5 Tokenomics**
  - [x] **TABLE 6** — Allocation/Tokens/Share/Vesting — **9 data rows**
        (Public Sale $0.05 · Extended Seed $0.046 · Seed $0.0248 · Community & Ecosystem · Team · Liquidity & MM · Treasury · Marketing & Growth · Advisors)
  - [x] Reconciliation note ¶

## 10. Governance *(unnumbered in source; assigned 10)* (944 w)
- [x] Chapter intro — 3 ¶
- [x] **Public Representatives (P-Reps)** — 3 ¶ (100,000 BND bond · delegation · 10% penalty, 35% cap)
- [x] **Proposal Lifecycle** — 2 ¶ (7-day min · 2-day review · 3-day vote · 2-day timelock)
- [x] **Security Council** — 3 ¶ (10 members · 2-year terms · limited reactive powers)
- [x] **Governance Powers** — intro ¶ + 3 bullets + closing ¶
  - [x] Treasury and Economic Parameters · Asset Management · Risk Management
- [x] **Progressive Decentralization** — 2 ¶ (Genesis · Hybrid · Full Governance)
- [x] **Decentralized Future** — 1 ¶

## 11. Risk Framework (330 w)
- [x] Intro ¶ ("engineering disclosure, not a legal disclaimer")
- [x] **TABLE 7** — Risk/Description/Mitigation — **all 9 risks**
      (Smart contract · RWA credit · Liquidity · Peg · Valuation · Counterparty/venue · Regulatory · Governance · Oracle/MEV)

## 12. Regulatory and Legal Framework (428 w)
- [x] Intro ¶ — BITSWIFT TECHNOLOGIES INC., Panama; MiCA primary framework
- [x] **MiCA – rwaUSD** ¶ — utility token, VD Law Group opinion, ART secondary outcome
- [x] **MiCA – BLI** ¶ — collateral-performance token + European Regulatory Framework / MiFID II
- [x] ART/EMT reclassification-compliance ¶
- [x] **Access Controls** ¶
- [x] Closing ¶ — not an offer document under MiCA

## 13. Roadmap (131 w)
- [x] **TABLE 8** — Phase/Milestone/Status — **5 data rows**
      (Phase 1 Completed · Phase 2 Completed · Phase 3 Completed · Phase 4 Planned · Phase 5 Planned)
- [x] Note ¶ — calendar dates deliberately not attached

## 14. Conclusion (273 w)
- [x] 3 ¶

## Legal Disclaimer (161 w)
- [x] Full disclaimer ¶ — verbatim, including "© 2026 BOUND Protocol."

---

## Source document anomalies — resolved

These are formatting errors **in the .docx itself**. Content was unaffected; only the
visual style each block received was decided here.

1. **`11. Regulatory and Legal Framework` heading appears twice** (two consecutive identical
   heading lines). → *Proposed: render once.*
2. **`9. BND — The Governance Token` is not styled as a heading** — it's plain body text, while
   its own body paragraphs *are* styled Heading 2. → *Proposed: render as a chapter heading, body
   as body.*
3. **The `Governance` chapter has no number**, sitting between Ch. 9 and Ch. 10.
   → *Proposed: keep unnumbered, exactly as written.*
4. **Chapter 9's body paragraphs are all styled Heading 2** in the source (a styling error).
   → *Proposed: render the labeled items (Governance:, Fee Utility:, …) as bold lead-ins, matching
   the audit page's existing treatment.*

**Nothing above changes a single word of text — only which visual style each block gets.**
