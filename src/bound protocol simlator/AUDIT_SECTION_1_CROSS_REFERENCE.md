# Section 1 — Cross-Reference Audit: Where Private LP Data Is Used Elsewhere

**Method:** grepped every engine field these four tables read (`lpIn`, `privateLayerOut`,
`privateLayerBal`, `privMintBCI/PR`, `privConvIn/OutBCI/BND`, `privRedeemBCI/PR`) across
the entire codebase, found every other consumer, and checked each one against the
engine's authoritative computation. **2 bugs found and fixed. 1 pre-existing scope issue
noted for its proper section. Everything else verified correct.**

---

## 1. Private Capital Allocation → consumers

| Field | Also read by | Verdict |
|---|---|---|
| `lpIn` | Protocol Capital Flows table (`privateContractVol`, `privDeposit`) | ✅ correct |
| `lpIn` | BCI Price Mechanics — "All years" summary & per-year table (`privGross` → "Private USDC deposited") | ✅ correct |
| `privateLayerOut` | Protocol Capital Flows (`privLayerOut`, `bciOutPriv`, `layerOutPriv`) | ✅ correct |
| `privateLayerOut` | BCI Price Mechanics (`layerOut` → "− Layer redemptions", combined with retail) | ✅ correct |
| `privateLayerOut` | Liquidity Layer's `expectedRdmpMo` (redemption coverage ratio) | ✅ correct — and now automatically reflects the 6-month lock (zero during months 1–6) since it reads the same engine field |
| `privateLayerBal` | Protocol Capital Flows (`privLayerBal`) | ✅ correct |
| `privateLayerBal` | Participant Economics — Private LP "Net Yield" fee-drag denominator | ✅ correct |

## 2. Fee tables (Minting & Redemption / Conversion / Totals) → consumers

| Field | Also read by | Verdict |
|---|---|---|
| `privMintBCI/PR`, `privRedeemBCI/PR` | Participant Economics fee-drag numerator | ✅ correct |
| `privConvIn/OutBCI/BND` | Participant Economics fee-drag numerator | ✅ correct |
| all of the above | **`bci_entry`/`bci_conv` in the BCI SC Revenue chart, and `pr_entry` in Protocol Reserve Revenue** | ⚠️ **not a bug, but a real trap** — those chart aggregates blend Private LP's mint/redeem/conversion fees together with unrelated sources (a small pre-pool RWA redemption fee, and Retail LP's own conversion fees). If you compare "Private LP — Totals" against the "Mint/Redeem" or "Conv. Fees" bar in the BCI SC Revenue chart expecting them to match, they won't — the chart bar is bigger. This was already flagged in the Section 1 write-up; repeating it here because this is exactly the kind of cross-reference confusion the audit is meant to catch. |

## 3. Bugs found and fixed

### Bug 1 — hardcoded conversion percentages in Protocol Capital Flows
`" → Converted to BCI (95%)"` and `" → Converted to BCI (98%)"` were **string literals**,
not reads of `p.privateBCIConversion` / `p.retailBCIConversion`. Change either slider (they
range 50–100%) and the *dollar amounts* in that table updated correctly, but the *label*
kept claiming 95%/98% regardless. Fixed — both now interpolate the live slider value.

### Bug 2 — "50% discount" claimed as fact when it's two independent sliders
The Private LP fee reference card stated flatly "50% discount when paying in BND," and a
worked example ("$1M costs $8,800") was hardcoded to the default 0.88% rate. Both the
conversion fee and the BND-discounted fee are **independent sliders** — at defaults they
happen to be a 2:1 ratio, but nothing enforces that. If you set them to, say, 1.2% and
0.6%, the card would still say "50% discount" and "$8,800" — both wrong. Fixed: the card
now computes its worked example from the live sliders and describes the BND rate as
independently configurable rather than asserting a fixed ratio.

## 4. Noted, not fixed yet (belongs to a different section)

**Protocol Capital Flows has the same "Year 4/5 always blank" issue** as the original
Private Capital Allocation table (5-year selector, 36-month engine). This table belongs to
a later audit section (Protocol Capital Flows — Monthly Overview, consumer section #5 in
the plan), so per the trim-as-we-go policy, it'll be fixed when we reach that section
rather than opportunistically now.

## 5. Verification

Build clean, all 19 invariant families pass, M12 hand-recomputation still matches on all
27 values (these were label/display-text fixes only — no engine formula touched).
