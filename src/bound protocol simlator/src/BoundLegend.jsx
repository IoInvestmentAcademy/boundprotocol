import { useState, useEffect, useRef } from "react";

/* ---------------------------------------------------------------
   BOUND DESIGN TOKENS  (canonical brand system)
--------------------------------------------------------------- */
const T = {
  bg:        "#F6F4EE",   // warm off-white canvas
  bgEl:      "#FFFFFF",   // cards / modals
  bgSoft:    "#FBFAF6",   // subtle raised surface
  bgInset:   "#F1EEE6",   // chips / inactive zones
  border:    "#E5E1D6",
  borderS:   "#D6D1C2",
  borderH:   "#C4BEAC",
  ink:       "#0E0E0C",
  ink2:      "#3A3A36",
  ink3:      "#6B6A62",
  ink4:      "#9A9890",
  ink5:      "#BEBBB0",
  green:     "#1F4D3F",
  green2:    "#2C6A57",
  greenSoft: "#E5EFE9",
  greenInk:  "#143329",
  amber:     "#B07410",  amberSoft: "#F5E9D2",
  red:       "#A02929",  redSoft:   "#F2DCD8",
  blue:      "#2D4D8C",  blueSoft:  "#DEE5F2",
};
const SHADOW = "0 1px 0 rgba(20,20,15,.02), 0 1px 2px rgba(20,20,15,.04)";

/* ---------------------------------------------------------------
   BASE COMPONENTS
--------------------------------------------------------------- */
function P({ children }) {
  return <p style={{ fontSize:14, color:T.ink2, lineHeight:1.7, marginBottom:12 }}>{children}</p>;
}

function SH({ id, n, children }) {
  return (
    <h2 id={id} style={{ fontSize:22, fontWeight:600, color:T.ink, marginTop:44, marginBottom:16,
      paddingBottom:12, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12,
      letterSpacing:"-0.01em" }}>
      <span style={{ width:26, height:26, borderRadius:6, background:T.green, color:"#fff",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:600, flexShrink:0 }}>{n}</span>
      {children}
    </h2>
  );
}

function Sub({ children }) {
  return (
    <h3 style={{ fontSize:15, fontWeight:600, color:T.ink, marginTop:24, marginBottom:10,
      display:"flex", alignItems:"center", gap:8, letterSpacing:"-0.005em" }}>
      <span style={{ width:3, height:16, background:T.green, borderRadius:2, display:"inline-block", flexShrink:0 }} />
      {children}
    </h3>
  );
}

function Formula({ label, lines }) {
  return (
    <div style={{ margin:"14px 0" }}>
      {label && <div style={{ fontSize:10.5, color:T.ink4, textTransform:"uppercase",
        letterSpacing:"0.1em", fontWeight:600, marginBottom:6 }}>{label}</div>}
      <div style={{ background:T.bgSoft, border:`1px solid ${T.border}`,
        borderLeft:`3px solid ${T.green}`, borderRadius:"0 8px 8px 0", padding:"14px 18px" }}>
        {lines.map((line, i) => {
          if (line === "") return <div key={i} style={{ height:8 }} />;
          return (
            <div key={i} style={{
              fontFamily:"'Geist Mono', 'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
              fontSize:12, lineHeight:1.9,
              color: line.startsWith("//") ? T.ink4
                   : line.startsWith("→")  ? T.green2
                   : line.startsWith("Step") || line.endsWith(":") ? T.ink3
                   : T.ink,
            }}>{line}</div>
          );
        })}
      </div>
    </div>
  );
}

function Note({ children, col = "blue" }) {
  const map = { blue: [T.blueSoft, T.blue], amber: [T.amberSoft, T.amber], green: [T.greenSoft, T.green] };
  const [bg, txt] = map[col] || map.blue;
  return (
    <div style={{ background:bg, border:`1px solid ${txt}22`, borderRadius:8,
      padding:"11px 14px", margin:"12px 0", fontSize:13, lineHeight:1.65, color:T.ink2,
      display:"flex", gap:10 }}>
      <span style={{ color:txt, flexShrink:0, fontWeight:600 }}>&#9432;</span>
      <div>{children}</div>
    </div>
  );
}

function Tag({ children, col = "muted" }) {
  const styles = {
    muted:  { bg:T.bgInset,    txt:T.ink3 },
    green:  { bg:T.greenSoft,  txt:T.greenInk },
    amber:  { bg:T.amberSoft,  txt:T.amber },
    blue:   { bg:T.blueSoft,   txt:T.blue },
  };
  const s = styles[col] || styles.muted;
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4,
      background:s.bg, color:s.txt, fontSize:10.5,
      fontFamily:"'Geist Mono',ui-monospace,monospace", fontWeight:600 }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div style={{ height:1, background:T.border, margin:"24px 0" }} />;
}

function FeeCard({ n, title, rate, trigger, what, how, dist }) {
  return (
    <div style={{ marginBottom:12, background:T.bgEl, border:`1px solid ${T.border}`,
      borderRadius:10, overflow:"hidden", boxShadow:SHADOW }}>
      <div style={{ padding:"10px 16px", background:T.bgSoft, borderBottom:`1px solid ${T.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T.ink }}>
          <span style={{ fontSize:10, color:T.ink4, marginRight:6 }}>{n}</span>{title}
        </span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <Tag col="green">{rate}</Tag>
          <Tag col="muted">{trigger}</Tag>
        </div>
      </div>
      <div style={{ padding:"12px 16px" }}>
        <div style={{ marginBottom:7, fontSize:13, color:T.ink2, lineHeight:1.6 }}>
          <span style={{ fontSize:10.5, color:T.ink4, textTransform:"uppercase",
            letterSpacing:"0.08em", fontWeight:600, marginRight:6 }}>What:</span>{what}
        </div>
        <div style={{ marginBottom:7, fontSize:13, color:T.ink2, lineHeight:1.6 }}>
          <span style={{ fontSize:10.5, color:T.ink4, textTransform:"uppercase",
            letterSpacing:"0.08em", fontWeight:600, marginRight:6 }}>How:</span>{how}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10.5, color:T.ink4, textTransform:"uppercase",
            letterSpacing:"0.08em", fontWeight:600 }}>Split:</span>
          <span style={{ fontSize:12, color:T.green, fontFamily:"'Geist Mono',ui-monospace,monospace", fontWeight:500 }}>{dist}</span>
        </div>
      </div>
    </div>
  );
}

function ParticipantCard({ type, pays, earns }) {
  return (
    <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.green}`,
      borderRadius:"0 10px 10px 0", padding:"14px 18px", marginBottom:12, boxShadow:SHADOW }}>
      <div style={{ fontSize:14, fontWeight:600, color:T.ink, marginBottom:12,
        paddingBottom:10, borderBottom:`1px solid ${T.border}` }}>{type}</div>
      <div style={{ display:"flex", gap:24 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10.5, color:T.red, fontWeight:600, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:8 }}>Pays</div>
          {pays.map((t,i) => <div key={i} style={{ fontSize:13, color:T.ink2, marginBottom:5,
            lineHeight:1.55, display:"flex", gap:7 }}>
            <span style={{ color:T.red, flexShrink:0 }}>·</span><span>{t}</span>
          </div>)}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10.5, color:T.green, fontWeight:600, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:8 }}>Earns / Receives</div>
          {earns.map((t,i) => <div key={i} style={{ fontSize:13, color:T.ink2, marginBottom:5,
            lineHeight:1.55, display:"flex", gap:7 }}>
            <span style={{ color:T.green, flexShrink:0 }}>·</span><span>{t}</span>
          </div>)}
        </div>
      </div>
    </div>
  );
}

function GL({ term, def }) {
  return (
    <div style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
      <div style={{ fontSize:12.5, fontWeight:600, color:T.green, marginBottom:4,
        fontFamily:"'Geist Mono',ui-monospace,monospace" }}>{term}</div>
      <div style={{ fontSize:13, color:T.ink2, lineHeight:1.65 }}>{def}</div>
    </div>
  );
}

function TH({ children }) {
  return <th style={{ padding:"9px 12px", textAlign:"left", fontSize:10.5, fontWeight:600,
    color:T.ink3, textTransform:"uppercase", letterSpacing:"0.08em",
    borderBottom:`1px solid ${T.border}`, background:T.bgSoft }}>{children}</th>;
}
function TD({ children, mono, center, col }) {
  return <td style={{ padding:"10px 12px", fontSize:12.5, color:col||T.ink2,
    textAlign:center?"center":"left", borderBottom:`1px solid ${T.border}`,
    fontFamily:mono?"'Geist Mono',ui-monospace,monospace":"inherit",
    fontWeight:mono?500:400 }}>{children}</td>;
}

/* --- SECTIONS --- */
const SECTIONS = [
  { id:"s1",  n:"1",  label:"Protocol Overview" },
  { id:"s2",  n:"2",  label:"Token Architecture" },
  { id:"s3",  n:"3",  label:"Participant Flows" },
  { id:"s4",  n:"4",  label:"10 Revenue Streams" },
  { id:"s5",  n:"5",  label:"Distribution Table" },
  { id:"s6",  n:"6",  label:"BCI Price Mechanics" },
  { id:"s7",  n:"7",  label:"Bound Core & Float" },
  { id:"s8",  n:"8",  label:"Liquidity Layer" },
  { id:"s9",  n:"9",  label:"Emergency System" },
  { id:"s10", n:"10", label:"User Economics" },
  { id:"s11", n:"11", label:"Core Formulas" },
  { id:"s12", n:"12", label:"Scenarios" },
  { id:"s13", n:"13", label:"Glossary" },
];

/* --- MAIN --- */
export default function BoundLegend({ onClose }) {
  const [active, setActive] = useState("s1");
  const scrollRef = useRef(null);

  /* -- Scroll-spy -- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const threshold = containerRect.top + 130;

      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) current = s.id;
      }
      setActive(current);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const go = id => {
    setActive(id);
    const el = scrollRef.current?.querySelector(`#${id}`);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg,
      fontFamily:"'Geist','Inter',-apple-system,'Segoe UI',sans-serif",
      fontSize:14, color:T.ink, WebkitFontSmoothing:"antialiased" }}>

      {/* -- SIDEBAR -- */}
      <div style={{ width:216, flexShrink:0, background:T.bgEl,
        borderRight:`1px solid ${T.border}`, padding:"20px 0",
        height:"100vh", overflowY:"auto" }}>
        <div style={{ padding:"0 16px 16px", borderBottom:`1px solid ${T.border}`, marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green,
              boxShadow:`0 0 0 3px rgba(44,106,87,0.16)` }} />
            <span style={{ fontSize:13, fontWeight:600, color:T.ink, letterSpacing:"-0.005em" }}>BOUND Protocol</span>
          </div>
          <div style={{ fontSize:11, color:T.ink4 }}>Reference Document v4.0</div>
          <div style={{ fontSize:10.5, color:T.ink5, marginTop:1 }}>Architecture v4 · July 2026 · matches simulator v8</div>
          {onClose && (
            <button onClick={onClose} style={{ marginTop:10, width:"100%", padding:"6px 10px",
              borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:600,
              border:`1px solid ${T.border}`, background:T.bgSoft, color:T.ink3 }}>
              &larr; Back to Simulator
            </button>
          )}
        </div>
        <div style={{ padding:"4px 8px" }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => go(s.id)} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"7px 8px", borderRadius:6, cursor:"pointer", textAlign:"left",
              background: active === s.id ? T.bgSoft : "transparent",
              border: active === s.id ? `1px solid ${T.border}` : "1px solid transparent",
              marginBottom:1, boxShadow: active === s.id ? SHADOW : "none",
            }}>
              <span style={{
                width:20, height:20, borderRadius:4, flexShrink:0,
                background: active === s.id ? T.green : T.bgInset,
                color: active === s.id ? "#fff" : T.ink4,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:600, transition:"all .15s",
              }}>{s.n}</span>
              <span style={{
                fontSize:11.5, fontWeight: active === s.id ? 600 : 400,
                color: active === s.id ? T.green : T.ink3,
                transition:"color .15s",
              }}>{s.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding:"14px 16px", marginTop:8, borderTop:`1px solid ${T.border}` }}>
          <div style={{ fontSize:11, color:T.ink4, lineHeight:1.6 }}>
            Companion to the BOUND Financial Simulator. Formulas match simulator logic exactly.
          </div>
        </div>
      </div>

      {/* -- CONTENT -- */}
      <div ref={scrollRef} style={{ flex:1, minHeight:0, overflowY:"auto", padding:"32px 44px 64px" }}>

        {/* TITLE */}
        <div style={{ marginBottom:36, paddingBottom:24, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10.5, color:T.green, textTransform:"uppercase",
            letterSpacing:"0.14em", fontWeight:600, marginBottom:10 }}>
            Reference Document · Investor Edition
          </div>
          <h1 style={{ fontSize:36, fontWeight:600, color:T.ink, letterSpacing:"-0.025em",
            marginBottom:12, lineHeight:1.15 }}>BOUND Protocol<br/>Complete Reference</h1>
          <P>This document explains every concept, formula, token, revenue stream, and participant mechanic behind the BOUND Financial Simulator. Written for investors, analysts, and pitch judges who want to understand the model from first principles.</P>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
            {[["Spec","Architecture v4 · July 2026"],["Revenue Streams","10"],["Market","~$31B on-chain RWA"],["BCI Unit","rwaUSD"],["Horizon","36 months"]].map(([k,v]) => (
              <div key={k} style={{ padding:"4px 10px", background:T.bgEl, border:`1px solid ${T.border}`,
                borderRadius:6, fontSize:11.5, boxShadow:SHADOW }}>
                <span style={{ color:T.ink3 }}>{k}:</span>{" "}
                <span style={{ color:T.ink, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* S1 */}
        <SH id="s1" n="1">Protocol Overview</SH>
        <P>The tokenized real-world asset (RWA) market has grown to ~$31 billion on-chain by mid-2026, led by tokenized Treasuries, private credit, and money market funds. Tokenization solved issuance — it did not solve liquidity. RWA holders face T+30 to T+90 redemption windows from issuers. Between issuance and maturity, the asset is effectively locked.</P>
        <P><strong style={{ color:T.ink, fontWeight:600 }}>BOUND's answer:</strong> Build a protocol-native liquidity layer. rwaUSD is the first liquid dollar for RWAs — holders can exit instantly, at any time, without waiting on the issuer. BOUND also provides the shared infrastructure that connects all RWA markets, positioning rwaUSD as the native stablecoin of the entire sector.</P>
        <Note col="green"><strong>The flywheel:</strong> More RWA markets onboard &rarr; more liquidation volume &rarr; more protocol fees &rarr; stronger BCI collateral performance &rarr; more LPs attracted &rarr; more capacity for exits &rarr; BOUND becomes the industry standard.</Note>

        {/* S2 */}
        <SH id="s2" n="2">Token Architecture — Three Tokens</SH>
        {[
          { token:"rwaUSD", sub:"The RWA Liquid Dollar · Primary User Asset", points:[
            "Backed 100% by USDC held in the Bound Core smart contract. RWA never backs rwaUSD.",
            "A default in any held RWA cannot affect the rwaUSD peg.",
            "Peg defended atomically by the APSS on a Uniswap v4 rwaUSD/USDC pool.",
            "Retail users buy/sell rwaUSD on the pool. Private LPs mint directly (0.3% fee).",
            "Envisioned as the native stablecoin of the entire RWA sector.",
            "Compliance framing: stable value access token — not a yield product. MiCA review ongoing.",
          ]},
          { token:"BCI", sub:"Bound Collateralization Index · The LP Index Token", points:[
            "Index token tracking collateral performance (NAV) of the Bound Liquidity Layer.",
            "Price denominated in rwaUSD: BCI Price = (Layer NAV + BCI SC balance) / BCI Supply.",
            "LP capital sits in the Liquidity Layer as collateral; the BCI SC holds fee revenue only.",
            "Obtained ONLY by converting rwaUSD through the protocol converter — never on DEX.",
            "Junior, at-risk layer: RWA exposure, fee surpluses, and yield all accrue here.",
            "BCI price rises when fee revenue credits to the SC without minting new BCI tokens.",
            "Language rule: never 'yield', 'APY', 'earn', 'interest'. Use 'index growth' or 'collateral performance'.",
          ]},
          { token:"BND", sub:"BOUND Governance Token", points:[
            "Governance token: holders vote on fee structures, ER policy, market approvals.",
            "When used to pay conversion fees: ~50% discount (0.44% instead of 0.88%).",
            "BND tokens used for fee payment are 100% burned — ZERO credit flows to BCI SC.",
            "BND burning creates deflationary pressure benefiting BND holders independently.",
            "Protocol Reserve executes periodic BND buybacks from the market.",
          ]},
        ].map(({ token, sub, points }) => (
          <div key={token} style={{ background:T.bgEl, border:`1px solid ${T.border}`,
            borderLeft:`3px solid ${T.green}`, borderRadius:"0 10px 10px 0",
            padding:"14px 18px", marginBottom:12, boxShadow:SHADOW }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span style={{ fontSize:15, fontWeight:600, color:T.green,
                fontFamily:"'Geist Mono',ui-monospace,monospace" }}>{token}</span>
              <span style={{ fontSize:11, color:T.ink3 }}>{sub}</span>
            </div>
            {points.map((pt,i) => <div key={i} style={{ display:"flex", gap:8,
              fontSize:13, color:T.ink2, marginBottom:5, lineHeight:1.6 }}>
              <span style={{ color:T.green, flexShrink:0 }}>&#9656;</span><span>{pt}</span>
            </div>)}
          </div>
        ))}

        {/* S3 */}
        <SH id="s3" n="3">Participant Flows — Three User Journeys</SH>
        <P>The protocol serves three distinct participant types. Their flows are independent and must not be confused — particularly the T+0 promise, which applies only to RWA holders.</P>

        {[
          { title:"LP User Flow", flows:[
            ["Private LP","LP provides USDC → pays 0.3% mint fee → receives rwaUSD → converts to BCI (0.88% or 0.44% BND; default 98% of the deposit converts) → holds BCI through a 6-month capital lock → BCI collateral performance accrues → after the lock, exits monthly at the configured outflow rate (conversion fee + 0.3% redeem fee on the way out)."],
            ["Retail LP","LP buys rwaUSD on pool (0.3% pool fee + slippage) → converts to BCI (0.88%/0.44%; default 98%) → holds BCI → converts back and sells on pool. No lock, no minimum."],
            ["LP redemption priority","BCI redemptions are SENIOR: LP exits are served first each month from the Layer's USDC buffer plus cash returning from the RWA issuer pipeline — before any new RWA liquidation demand is accepted. RWA service is discretionary; LP exits are an obligation."],
          ]},
          { title:"RWA Holder Flow", flows:[
            ["Instant exit (T+0)","RWA holder sells tokenized asset to BOUND → BOUND pays rwaUSD instantly from USDC sleeve → holder swaps rwaUSD→USDC on pool → full exit in seconds."],
            ["What they pay","Haircut (dynamic, 0.5% baseline) + 0.3% RWA trade fee per direction."],
            ["What they get","Immediate liquidity vs T+30–T+90 issuer wait. Time value far exceeds the cost."],
          ]},
          { title:"Protocol Mechanics (Background — invisible to users)", flows:[
            ["APSS buy-side","User buys rwaUSD → pool price above $1.00 → APSS mints rwaUSD in same block → sells at elevated price → resyncs → captures spread. Not a fee to the user."],
            ["APSS sell-side","User sells rwaUSD → pool price below $1.00 → APSS buys cheaply → burns → resyncs → captures discount. User receives close to $1.00."],
          ]},
        ].map(({ title, flows }) => (
          <div key={title} style={{ background:T.bgEl, border:`1px solid ${T.border}`,
            borderRadius:10, padding:"14px 18px", marginBottom:12, boxShadow:SHADOW }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.ink, marginBottom:12,
              paddingBottom:8, borderBottom:`1px solid ${T.border}` }}>{title}</div>
            {flows.map(([step, desc]) => (
              <div key={step} style={{ display:"flex", gap:14, marginBottom:9 }}>
                <span style={{ fontSize:10.5, color:T.green, fontFamily:"'Geist Mono',ui-monospace,monospace",
                  fontWeight:600, flexShrink:0, minWidth:120, paddingTop:2 }}>{step}</span>
                <span style={{ fontSize:13, color:T.ink2, lineHeight:1.65 }}>{desc}</span>
              </div>
            ))}
          </div>
        ))}

        {/* S4 */}
        <SH id="s4" n="4">Ten Revenue Streams</SH>
        <P>BOUND Protocol generates revenue from ten distinct sources. Each has a defined trigger, rate, and split between the BCI SC (benefits LP holders) and the Protocol Reserve (funds operations).</P>

        <FeeCard n="01" title="Pool Trading Fee" rate="0.3% of pool vol" trigger="Every retail swap"
          what="Standard Uniswap v4 pool fee on every rwaUSD/USDC swap."
          how="Charged to every retail buyer or seller of rwaUSD. Collected automatically by the pool contract."
          dist="80% BCI SC · 20% Protocol Reserve" />
        <FeeCard n="02" title="APSS Arbitrage Capture" rate="~0.5% of pool vol" trigger="Every pool trade"
          what="Protocol revenue from peg stabilization. Not a fee charged to users."
          how="Buy-side: APSS mints rwaUSD at elevated price, captures spread. Sell-side: APSS buys at discount, burns, captures. Executes atomically in the same block. User only pays pool fee + slippage."
          dist="80% BCI SC · 20% Protocol Reserve" />
        <FeeCard n="03" title="rwaUSD Conversion Fee (full)" rate="0.88% per conversion" trigger="rwaUSD to BCI"
          what="Fee charged when any user converts between rwaUSD and BCI in either direction (entry and exit, private and retail)."
          how="The conversion fee is deducted from the rwaUSD amount. That rwaUSD is burned — its supply is reduced. The USDC that was backing that burned rwaUSD in Bound Core is released and credited to the BCI SC as collateral surplus. This is what drives BCI price up. The single biggest BCI SC revenue stream."
          dist="100% BCI SC (USDC from Bound Core backing the burned rwaUSD) · 0% to Protocol Reserve" />
        <FeeCard n="04" title="BND Conversion Fee (discounted)" rate="0.44% · BND burned" trigger="BND token payment"
          what="When user pays conversion fee in BND governance token, they get ~50% discount."
          how="BND tokens are 100% burned. No rwaUSD is burned, so no USDC is released to BCI SC. Zero benefit to BCI SC. BND supply reduction benefits BND holders only."
          dist="0% BCI SC · 0% Protocol Reserve · 100% BND burn" />
        <FeeCard n="05" title="Private Mint / Redeem Fee" rate="0.3% per side" trigger="Private LP entry/exit"
          what="Fee charged when institutional LPs mint or redeem rwaUSD directly, bypassing the pool."
          how="Service fee for the direct minting path. Charged 0.3% on entry and 0.3% on exit. Majority credited to BCI SC, supporting the index."
          dist="80% BCI SC · 20% Protocol Reserve" />
        <FeeCard n="06" title="RWA Trade Fee" rate="0.3% per direction" trigger="Every RWA transaction"
          what="Fee charged on every RWA transaction routed through BOUND markets."
          how="RWA to rwaUSD: 0.3% on the sell side. rwaUSD to RWA (reverse direction): 0.3% charged independently. Each direction charged separately on the transaction value."
          dist="80% BCI SC · 20% Protocol Reserve" />
        <FeeCard n="07" title="RWA Haircut Spread" rate="Dynamic (0.5% baseline, per market)" trigger="Every RWA purchase"
          what="Spread between what BOUND pays for an RWA (below NAV) and what it recovers at maturity."
          how="BOUND buys $1M Treasury at 0.5% haircut, pays $995K, recovers $1M at maturity — $5K spread is revenue. Each market has its own haircut, escalated by a gentle 3-step ladder when concentration rises: per-market held inventory is capped at 10% of the Layer and the whole RWA category at 20%; approaching either cap bumps the haircut and trade fee stepwise (no punitive cliff). The minting-side haircut is reduced by a stress-linked discount ladder (applied with a one-month lag)."
          dist="80% BCI SC · 20% Protocol Reserve" />
        <FeeCard n="08" title="Annual Market Maintenance Fee" rate="$75K/market/year" trigger="Monthly, per active market"
          what="Recurring annual fee per active RWA market."
          how="RWA issuers pay $75,000/year. Covers oracle maintenance, smart contract upkeep, governance support. Collected monthly ($6,250/month/market)."
          dist="20% BCI SC · 80% Protocol Reserve" />
        <FeeCard n="09" title="RWA Integration Fee" rate="$150K per market" trigger="One-time, new market"
          what="One-time fee paid by new RWA issuers at onboarding."
          how="Covers due diligence, smart contract deployment, oracle setup, concentration cap enforcement, legal review. Based on RWA infrastructure market research ($75K-$250K range). No ongoing commitment from this fee alone."
          dist="100% Protocol Reserve · 0% to BCI SC" />
        <FeeCard n="10" title="Bound Core Float Yield" rate="4.5%/yr on the USDC Yield Position" trigger="Continuous, rwaUSD circulation"
          what="Yield on Bound Core's USDC Yield Position — the USDC NAV above the instant-redemption coverage requirement."
          how="Bound Core sizes raw USDC to coverage% × idle rwaUSD (default 100%, 0% yield — instant redemption always covered). Any NAV surplus above that requirement is the USDC Yield Position (T+0), earning the configured rate (default 4.5%/yr). Yield is paid out once — never retained in NAV. At the default 100% coverage the yield position is $0; the stream activates when coverage is set below 100%. Grows with rwaUSD adoption — independent of LP/BCI activity."
          dist="Flat 80% BCI SC · 20% Protocol Reserve" />

        <Note col="green"><strong>Stream 10 insight:</strong> Every rwaUSD holder who uses it as a stablecoin without converting to BCI is generating protocol revenue that partly flows to BCI SC. rwaUSD adoption makes BCI collateral stronger — even from users who never interact with BCI.</Note>

        {/* S5 */}
        <SH id="s5" n="5">Complete Fee Distribution Table</SH>
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", margin:"14px 0", boxShadow:SHADOW }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Fee Source</TH><TH>Rate</TH><TH>BCI SC</TH><TH>Protocol Reserve</TH><TH>Note</TH></tr></thead>
            <tbody>
              {[
                ["Pool Trading Fee","0.3% of pool vol","80%","20%","Retail swaps only"],
                ["APSS Arbitrage","~0.5% of pool vol","80%","20%","Not a user fee — protocol capture"],
                ["Conversion (rwaUSD full)","0.88%","100%","0%","USDC backing burned rwaUSD to SC"],
                ["Conversion (BND discount)","0.44% · BND burned","0%","0%","BND holders only"],
                ["Private Mint","0.3% on entry","80%","20%","Direct institutional path"],
                ["Private Redeem","0.3% on exit","80%","20%","Direct institutional path"],
                ["RWA Trade Fee","0.3%/direction (per market)","80%","20%","Each direction independent"],
                ["RWA Haircut Spread","Dynamic (0.5% base, per market)","80%","20%","Concentration escalation ladder"],
                ["Maintenance Fee","$75K/mkt/yr","20%","80%","Monthly / 12"],
                ["Integration Fee","$150K/market","0%","100%","One-time, new market"],
                ["Layer Yield (gross)","Blended Aave/Morpho/Enhanced","80%","10%","10% credited to Emergency Reserve"],
                ["Bound Core Float Yield","4.5%/yr on Yield Position","80%","20%","Flat split — no phases"],
              ].map(([fee,rate,bci,pr,note]) => (
                <tr key={fee} style={{ background: T.bgEl }}>
                  <TD>{fee}</TD>
                  <TD mono>{rate}</TD>
                  <TD mono center col={T.green}>{bci}</TD>
                  <TD mono center col={T.blue}>{pr}</TD>
                  <TD><span style={{ fontSize:11.5, color:T.ink4 }}>{note}</span></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Sub>If you hold BCI — your revenue exposure</Sub>
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", marginBottom:16, boxShadow:SHADOW }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Revenue Stream</TH><TH>BCI SC Share</TH><TH>When It Accrues</TH><TH>Mechanism</TH></tr></thead>
            <tbody>
              {[
                ["Pool fee + APSS","80%","Every pool swap","Protocol arbitrage surplus to SC"],
                ["Conversion fee (rwaUSD path)","100%","Every rwaUSD to BCI conversion","USDC from Bound Core backing burned rwaUSD to SC"],
                ["Private mint/redeem fee","80%","Private LP entry and exit","Majority of service fee to SC"],
                ["RWA trade fee (0.3%/dir.)","80%","Every RWA transaction","SC credited from RWA revenue"],
                ["RWA haircut spread","80%","On served liquidation/minting volume","Per-market haircut on volume served"],
                ["Market maintenance fee","20%","Monthly per active market","Recurring issuer fee portion to SC"],
                ["Layer yield","80%","Monthly mark-to-accrual","80% of blended USDC/Morpho/Enhanced yield"],
                ["Bound Core float yield","80% (flat)","Monthly","Yield on the USDC Yield Position"],
              ].map(([stream,share,when,mech]) => (
                <tr key={stream} style={{ background: T.bgEl }}>
                  <TD>{stream}</TD>
                  <TD mono col={T.green}>{share}</TD>
                  <TD><span style={{ fontSize:12.5, color:T.ink3 }}>{when}</span></TD>
                  <TD><span style={{ fontSize:12, color:T.ink4 }}>{mech}</span></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Sub>If you hold BND — your benefits</Sub>
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden", marginBottom:12, boxShadow:SHADOW }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><TH>Benefit</TH><TH>Mechanism</TH><TH>Source</TH><TH>Note</TH></tr></thead>
            <tbody>
              {[
                ["~50% conversion fee discount","Pay 0.44% instead of 0.88%","Direct utility","Must pay in BND tokens"],
                ["Token supply reduction","BND burned on every discounted conversion","Conversion payments","Each use reduces circulating supply"],
                ["Periodic BND buyback & burn","PR purchases BND from market, burns","Protocol Reserve income","Regular PR allocation to market buy"],
                ["RWA minting/redemption backstop","PR covers Layer shortfalls at entry/exit","Protocol Reserve","Pool/APSS stream backstops early-stage"],
                ["Protocol operations funding","Salaries, legal, tech, marketing","Protocol Reserve","Governance directs PR allocation"],
                ["Governance rights","Vote on fees, ER policy, market approvals","Token holding","Token-weighted on-chain governance"],
              ].map(([ben,mech,src,note]) => (
                <tr key={ben} style={{ background: T.bgEl }}>
                  <TD>{ben}</TD>
                  <TD><span style={{ fontSize:12.5, color:T.green2 }}>{mech}</span></TD>
                  <TD><span style={{ fontSize:12.5, color:T.ink3 }}>{src}</span></TD>
                  <TD><span style={{ fontSize:11.5, color:T.ink4 }}>{note}</span></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note col="blue"><strong>Protocol Reserve outflows (BND governance):</strong> Three primary channels — (1) Periodic BND buyback and burn, (2) Fund all protocol operations, (3) Cover RWA minting/redemption fees when the Layer cannot. At launch, the always-flowing pool/APSS stream backstops any Layer shortfall before the PR builds sufficient balance.</Note>

        {/* S6 */}
        <SH id="s6" n="6">BCI Price Mechanics</SH>

        <Sub>Core Formula</Sub>
        <Formula label="BCI Index Price" lines={[
          "BCI_price  =  ( Layer_NAV  +  BCI_SC_Balance )  /  BCI_Supply",
          "",
          "// Unit: rwaUSD per BCI token · starts at 1.0000 rwaUSD at launch",
          "// Layer_NAV:        LP collateral held in the Liquidity Layer",
          "//                   (private balance + retail balance)",
          "// BCI_SC_Balance:   accumulated FEE REVENUE only — no LP capital",
          "// Price rises when fee revenue credits the SC without minting new supply",
          "",
          "Example (Default preset, Month 12):",
          "  Layer_NAV       =  $9.7M   (LP collateral)",
          "  BCI_SC_Balance  =  $560.7K (cumulative fee revenue)",
          "  BCI_Supply      =  9.43M tokens",
          "→ BCI_Price       =  (9.7M + 560.7K) / 9.43M  ≈  1.0840 rwaUSD",
        ]} />

        <Sub>How the Two Terms Behave</Sub>
        <P>LP capital and fee revenue are kept in separate ledgers so that deposits and exits cannot manufacture price movement. The Liquidity Layer holds the collateral; the BCI SC holds only the protocol's fee surplus.</P>
        <Formula label="Layer NAV (collateral term)" lines={[
          "+ Private LP net deposits         after mint + conversion fees",
          "+ Retail LP net pool inflows      after pool + conversion fees",
          "- LP exits                        monthly outflow (private: after 6-mo lock)",
          "",
          "// Layer yield is NOT compounded into balances — it is distributed",
          "// once as revenue (80% BCI SC / 10% PR / 10% Emergency Reserve)",
        ]} />
        <Formula label="BCI SC balance (revenue term)" lines={[
          "+ Conversion fees x 100%          rwaUSD path, entry + exit",
          "+ Mint/redeem fees x 20%          private path + pre-pool RWA redemptions",
          "+ Pool + APSS x 80%               from retail pool activity",
          "+ RWA trade fee + haircut x 20%   per-market rates on served volume",
          "+ Maintenance fee x 20%           from active RWA markets",
          "+ Layer yield x 80%               monthly, on actual tier balances",
          "+ Bound Core float yield x 80%    flat split",
          "",
          "// Mint/burn of BCI supply happens at the START-of-month price,",
          "// so entries and exits change NAV and supply proportionally —",
          "// only fee credits move the price",
        ]} />

        <div style={{ display:"flex", gap:12, marginBottom:14 }}>
          <div style={{ flex:1, background:T.greenSoft, border:`1px solid ${T.green}22`, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:T.green, marginBottom:8,
              textTransform:"uppercase", letterSpacing:"0.08em" }}>Moves Price UP</div>
            {["Fee revenues credited to SC without minting new BCI",
              "Layer yield distribution (80% of blended yield)",
              "Bound Core float yield (flat 80%)",
              "RWA haircut + trade fees (80% share)",
            ].map((t,i) => <div key={i} style={{ fontSize:12.5, color:T.greenInk, marginBottom:5,
              lineHeight:1.55, display:"flex", gap:7 }}>
              <span style={{ color:T.green }}>+</span><span>{t}</span>
            </div>)}
          </div>
          <div style={{ flex:1, background:T.redSoft, border:`1px solid ${T.red}22`, borderRadius:8, padding:"12px 14px" }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:T.red, marginBottom:8,
              textTransform:"uppercase", letterSpacing:"0.08em" }}>Does NOT Move Price</div>
            {["LP entries (SC and supply grow proportionally)",
              "LP exits (SC and supply shrink proportionally)",
              "BND conversion fees (100% burned, zero to SC)",
              "USDC moving between Bound Core and Layer",
            ].map((t,i) => <div key={i} style={{ fontSize:12.5, color:T.red, marginBottom:5,
              lineHeight:1.55, display:"flex", gap:7 }}>
              <span>-</span><span style={{ color:T.ink2 }}>{t}</span>
            </div>)}
          </div>
        </div>

        <Note col="amber"><strong>Removed in v4:</strong> earlier drafts described a "monthly appreciation threshold" that re-routed excess revenue to the Protocol Reserve above a 12% annual target. That mechanism is <strong>not part of the current architecture or the simulator</strong> — all fee revenue follows the fixed splits in the distribution table, every month. BCI growth is whatever the revenue engine produces; nothing is capped or managed.</Note>

        <Sub>Annualized Index Growth Formula</Sub>
        <Formula label="Compound annualized growth from launch" lines={[
          "Ann_Growth(t)  =  [ BCI_price(t) / 1.0000 ] ^ (12 / t)  -  1",
          "",
          "// t = months from launch",
          "// NOT a return guarantee — transparency/reporting metric",
          "// Used to determine Bound Core float phase",
        ]} />

        {/* S7 */}
        <SH id="s7" n="7">Bound Core Smart Contract & Float Yield</SH>
        <Sub>Bound Core Architecture — Two-Tier USDC Allocation</Sub>
        <P>Bound Core holds the USDC backing <strong style={{ color:T.ink }}>idle rwaUSD</strong> — the share of LP deposits that never converted to BCI (default: 2% private + 2% retail). That rwaUSD is a liability with instant exit rights, so its backing is sized for instant redemption first, yield second.</P>
        <Formula label="Bound Core composition (v4 two-tier model)" lines={[
          "Liability:   idle rwaUSD in circulation (instant exit, no lock)",
          "Assets:      USDC NAV — funded 1:1 at mint, drained 1:1 at redemption",
          "",
          "Tier 1  Raw USDC (Peg Defence):",
          "  Required  =  coverage%  x  idle rwaUSD TVL     // default 100%",
          "  Earns 0% — reserved for instant redemption",
          "",
          "Tier 2  USDC Yield Position:",
          "  =  MAX(0,  USDC NAV  -  Tier 1 required)",
          "  Earns the configured rate (default 4.5%/yr) · T+0 liquidity",
          "",
          "Monthly outflow:  bcOutflowRate% of idle rwaUSD redeemed  // default 2%/mo",
          "",
          "// Yield is DISTRIBUTED ONCE — flat 80% BCI SC / 20% Protocol Reserve.",
          "// It is never retained in Bound Core NAV (no compounding).",
          "// At the default 100% coverage the Yield Position is $0 —",
          "// the stream activates only when coverage is set below 100%.",
        ]} />
        <Note col="amber"><strong>Changed from v3:</strong> the fixed 70/30 "Float Yield Portfolio" split, the phase schedule (80/20 → 60/40 → 20/80 based on BCI growth), the insurance-premium netting, and the 20% FYP haircut buffer are all gone. The current model is coverage-first: instant-redemption backing is sized explicitly, only the surplus earns yield, and the split is a flat 80/20 with no phases.</Note>

        {/* S8 */}
        <SH id="s8" n="8">Bound Liquidity Layer — 4-Tier Waterfall & LCR</SH>
        <Sub>Four-Tier Structure (v4)</Sub>
        <Formula label="Layer tiers — allocated monthly, in order" lines={[
          "Tier 1  USDC Buffer (Aave)      ~3.5%/yr  ·  T+0",
          "  Buffer%  =  MAX( min buffer (5%),",
          "                   BCI redemption coverage:  daily LP outflow x 14d,",
          "                   RWA liq coverage:         daily served RWA liq x 14d )",
          "  Capped at 80% of the Layer",
          "",
          "Tier 2  Morpho Vaults           ~4.5%/yr  ·  T+0-T+1",
          "  Gets a minimum reserve share (default 20%) of what remains",
          "",
          "Tier 3  Enhanced Yield          ~7.5%/yr  ·  T+0-T+1",
          "  Capped at 20% of the Layer",
          "",
          "Tier 4  RWA Held Inventory      illiquid until matched or matured",
          "  Per-market cap: 10% of Layer · category cap: 20% of Layer",
          "  Overflow routes to a PER-MARKET issuer-redemption pipeline,",
          "  each market draining at its own issuerRedemptionDays (T+30-T+120)",
          "",
          "Blended_yield  =  Σ ( tier balance x tier rate )  /  Layer",
          "// Distributed once: 80% BCI SC · 10% Protocol Reserve · 10% Emergency Reserve",
        ]} />

        <Sub>LCR & Stress Modes</Sub>
        <Formula label="Liquidity Coverage Ratio — the Layer's health gauge" lines={[
          "LCR  =  liquid capital (Tiers 1-3)  /  near-term obligations",
          "",
          "Obligations  =  committed volume only:  LP exits due  +  RWA volume the",
          "                protocol actually ACCEPTED (declined demand is not a liability)",
          "",
          "Modes:   HEALTHY ≥ 1.5   ·   WARNING ≥ 1.0   ·   STRESS ≥ 0.7   ·   EMERGENCY < 0.7",
          "",
          "// Stress responses (one-month lag): minting-discount ladder rises,",
          "// RWA acceptance throttles (50% in EMERGENCY)",
          "",
          "RWA acceptance guard:  new RWA volume is capped so the projected",
          "month-end LCR never drops below the configured floor (default 1.5x)",
        ]} />

        <Sub>Monthly Capacity Order (who gets served first)</Sub>
        <Formula label="Strict allocation order, every month" lines={[
          "Step 1:  Size available USDC off THIS month's Layer (post LP flows)",
          "Step 2:  Serve BCI redemptions FIRST  — LP exits are an obligation",
          "Step 3:  Apply the LCR guard          — cap RWA acceptance at the floor",
          "Step 4:  Serve RWA demand pro-rata across markets with what remains",
          "",
          "// Private LP: 6-month lock, then monthly exits at the configured rate",
          "// Retail LP: no lock — pool exit any month",
          "// RWA held inventory returns cash through each market's own",
          "// issuer pipeline (T+30-T+120) — never advanced early",
        ]} />
        <Note col="amber"><strong>T+0 is guaranteed only for RWA holders.</strong> Private LP capital carries a 6-month lock, then scheduled monthly exits — served senior to RWA demand from the Layer's own liquidity. LPs earn the index performance because they accept this commitment.</Note>

        {/* S9 */}
        <SH id="s9" n="9">Emergency Reserve & Loss Waterfall</SH>
        <Sub>Emergency Reserve Structure</Sub>
        <Formula label="ER sizing and growth" lines={[
          "Initial seed:   $500,000  (protocol treasury at launch, insured)",
          "",
          "ER target rate by year:",
          "  Year 1:   10%  of at-risk assets",
          "  Year 2:   15%  of at-risk assets",
          "  Year 3:   20%  of at-risk assets    // simulator horizon ends here (36 months)",
          "  Year 4+:  25%  (cap — insurance covers catastrophic losses above 25%)",
          "",
          "At-risk assets  =  Morpho deployment  +  Bound Core USDC Yield Position",
          "",
          "ER funding — two streams, every month:",
          "  1)  10% of gross Layer yield credited directly to the ER",
          "  2)  Top-up from PR if still below target:",
          "        Top-up  =  MIN( MAX(0, target - current),  gross monthly PR x 10% )",
          "        // shown explicitly as '− Emergency Reserve top-up' in the",
          "        // Protocol Reserve revenue table — the column adds up",
          "",
          "Insurance:  single combined policy covering RWA defaults + venue exploits",
        ]} />
        <Sub>Loss Absorption Waterfall (Correct Order)</Sub>
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 18px", marginBottom:14, boxShadow:SHADOW }}>
          {[
            { step:"1st", label:"Emergency Reserve",
              desc:"$500K seeded and insured, then fed continuously by 10% of gross Layer yield plus PR top-ups toward its target (10% → 25% of at-risk assets). First absorber of any RWA default or venue loss." },
            { step:"2nd", label:"Insurance",
              desc:"Single combined policy covering RWA defaults and yield-venue exploit events, engaged alongside the ER for losses beyond its balance." },
            { step:"3rd — last resort", label:"BCI Index Ratio Reduction",
              desc:"BCI SC balance is debited directly. BCI collateral performance falls. The ER + insurance layers make this scenario remote. This is the disclosed risk BCI holders accept." },
          ].map(({ step, label, desc }) => (
            <div key={step} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
              <Tag col="muted">{step}</Tag>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:T.ink, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:13, color:T.ink2, lineHeight:1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Sub>Dynamic Concentration Escalation (3-Step Ladder)</Sub>
        <Formula label="Auto-triggered haircut & trade-fee escalation" lines={[
          "// Concentration measured on HELD inventory only (rwaHeldPct) —",
          "// pipeline cash returning from issuers is excluded from risk metrics",
          "",
          "Per-market ladder (cap: 10% of Layer per market):",
          "  held ≥ 75% of cap  →  step 1 bump to that market's haircut + trade fee",
          "  held ≥ 90% of cap  →  step 2 bump",
          "  held ≥ cap         →  step 3 bump · overflow routes to the market's",
          "                         own issuer-redemption pipeline",
          "",
          "Category ladder (cap: 20% of Layer for ALL RWA combined):",
          "  same 3-step escalation applied category-wide on top",
          "",
          "// Gentle by design — no punitive 15%/10% cliff (removed in v4).",
          "// Both ladders are automatic — no governance vote required.",
          "// Stress modes (WARNING/STRESS/EMERGENCY) also raise the",
          "// minting-discount ladder, with a one-month lag.",
        ]} />

        {/* S10 */}
        <SH id="s10" n="10">User Economics — Who Pays What</SH>
        <ParticipantCard type="Private LP" pays={[
          "Mint rwaUSD: 0.3% (80% BCI / 20% PR)",
          "Convert rwaUSD to BCI: 0.88% full or 0.44% with BND",
          "Exit: 0.88% conversion + 0.3% redeem (80% BCI / 20% PR)",
          "Commitment: 6-month capital lock, then scheduled monthly exits",
        ]} earns={[
          "BCI collateral performance (simulated ~8-9% annualized at M12, Default preset)",
          "Performance from: pool fees, APSS, RWA fees, haircut, yield, float",
          "Better than private credit: comparable return profile, on-chain and auditable",
          "Auditable: Layer NAV and BCI SC balance verifiable on-chain at all times",
        ]} />
        <ParticipantCard type="Retail LP (Pool)" pays={[
          "Buy rwaUSD on pool: 0.3% fee + natural slippage (APSS invisible to user)",
          "Convert to BCI: 0.88% or 0.44% with BND",
          "Exit: 0.88% conversion + 0.3% pool + slippage",
        ]} earns={[
          "Same BCI collateral performance as private LP",
          "No minimum — accessible to any wallet",
          "rwaUSD usable as DeFi collateral even before BCI conversion",
        ]} />
        <ParticipantCard type="RWA Holder (Instant Exit)" pays={[
          "Haircut: 0.5% baseline, dynamic (rises with issuer concentration or stress)",
          "RWA trade fee: 0.3% per direction",
          "Example: $1M exit — receive ~$994K rwaUSD in normal conditions",
        ]} earns={[
          "Instant T+0 exit vs T+30 to T+90 issuer redemption window",
          "Protocol always the buyer — no counterparty risk on exit",
          "rwaUSD received can be held or swapped to USDC immediately",
        ]} />
        <ParticipantCard type="rwaUSD Holder (Stable User)" pays={[
          "Nothing — free to hold at $1 peg",
          "Pool fee (0.3%) only when selling rwaUSD to USDC",
        ]} earns={[
          "$1 peg stability defended by APSS",
          "DeFi composability: collateral, LP positions, payments",
          "Passively contributes float yield to BCI SC and Protocol Reserve",
        ]} />
        <ParticipantCard type="BND Governance Holder" pays={[
          "BND tokens burned when used for conversion fee payment",
        ]} earns={[
          "~50% conversion fee discount (0.44% vs 0.88%)",
          "Supply scarcity from continuous burns",
          "Periodic Protocol Reserve buyback & burn",
          "Governance rights: fees, ER policy, market additions",
        ]} />

        {/* S11 */}
        <SH id="s11" n="11">Core Formulas — Complete Reference</SH>
        <P>All formulas match the simulator engine exactly. Presented one per line for clarity.</P>

        <Sub>1. BCI Price</Sub>
        <Formula label="Fundamental pricing equation" lines={[
          "BCI_price(t)  =  ( Layer_NAV(t)  +  BCI_SC_Balance(t) )  /  BCI_supply(t)",
          "",
          "// Unit: rwaUSD per BCI token · starts at 1.0000 rwaUSD",
          "// Layer_NAV = private + retail LP collateral in the Liquidity Layer",
          "// BCI_SC_Balance = accumulated fee revenue ONLY",
        ]} />

        <Sub>2. Ledger Updates</Sub>
        <Formula label="Monthly updates — capital and revenue kept separate" lines={[
          "Layer_NAV(t)  =  Layer_NAV(t-1)  +  LP_in_net(t)  -  LP_out(t)",
          "BCI_SC(t)     =  BCI_SC(t-1)  +  Total_to_BCI(t)",
          "",
          "Total_to_BCI  =  bci_pool  +  bci_entry  +  bci_conv",
          "               + bci_maint  +  bci_rwa  +  bci_morpho  +  bci_float",
          "",
          "// Layer yield is never compounded into Layer_NAV — distributed once",
        ]} />

        <Sub>3. BCI Supply Update</Sub>
        <Formula label="Token minting and burning — both at START-of-month price" lines={[
          "BCI_minted(t)  =  LP_in_net(t)  /  BCI_price(t-1)",
          "BCI_burned(t)  =  LP_out(t)     /  BCI_price(t-1)",
          "BCI_supply(t)  =  BCI_supply(t-1) + BCI_minted(t) - BCI_burned(t)",
          "",
          "// LP entries/exits: NAV and supply change proportionally — no price impact",
          "// Fee credits: SC grows, supply unchanged — price rises",
        ]} />

        <Sub>4. BCI Revenue Components</Sub>
        <Formula label="Each stream credited to BCI SC (default rates)" lines={[
          "bci_pool    =  Pool_volume  x  0.008  x  0.80        // 0.3% pool + 0.5% APSS",
          "bci_entry   =  (mint fee + redeem fee + pre-pool RWA redeem fee)  x  0.80",
          "bci_conv    =  all conversion fees, rwaUSD path       // 100% to SC",
          "               (entry + exit, private + retail, at 0.88% x (1 - BND_usage))",
          "bci_maint   =  Σ active markets' maint fee  /  12  x  0.20",
          "bci_rwa     =  (RWA trade revenue + haircut revenue)  x  0.80",
          "               // per-market rates on SERVED volume, incl. minting side",
          "bci_morpho  =  Layer_yield_gross  x  0.80",
          "               // Σ (tier balance x tier rate / 12) across USDC/Morpho/Enhanced",
          "bci_float   =  BC_yield_position  x  BC_rate / 12  x  0.80   // flat",
        ]} />

        <Sub>5. Protocol Reserve Revenue Components</Sub>
        <Formula label="Each stream credited to Protocol Reserve" lines={[
          "pr_pool    =  Pool_volume  x  0.008  x  0.20",
          "pr_entry   =  (mint + redeem + pre-pool RWA redeem fees)  x  0.20",
          "pr_integ   =  Σ integration fees of markets launching this month",
          "pr_maint   =  Σ active markets' maint fee  /  12  x  0.80",
          "pr_rwa     =  (RWA trade revenue + haircut revenue)  x  0.20",
          "pr_morpho  =  Layer_yield_gross  x  0.10",
          "pr_float   =  BC_yield_position  x  BC_rate / 12  x  0.20   // flat",
          "",
          "Total_PR_gross  =  sum of the seven streams above",
          "Total_PR_net    =  Total_PR_gross  -  ER_top_up(t)",
          "er_credit       =  Layer_yield_gross  x  0.10   // 10% of Layer yield to ER",
        ]} />

        <Sub>6. Effective Conversion Rate</Sub>
        <Formula label="BCI SC receives only the rwaUSD-path portion" lines={[
          "BCI_conv_revenue  =  Conv_volume  x  (1 - BND_usage)  x  0.0088",
          "",
          "// BND portion is burned — zero to BCI SC",
          "// Example at 10% BND usage (default):",
          "  BCI_conv  =  Conv_vol  x  0.90  x  0.0088  ≈  Conv_vol x 0.80%",
        ]} />

        <Sub>7. Layer Allocation (4-Tier Waterfall)</Sub>
        <Formula label="Monthly tier sizing — see Section 8 for the full waterfall" lines={[
          "Buffer%   =  MAX( 5%,  LP-exit coverage 14d,  served-RWA coverage 14d )",
          "USDC(t)   =  Layer x Buffer%                    // capped at 80%",
          "Morpho(t) =  remaining x morpho reserve share   // min 20%",
          "Enhanced  =  MIN( 20% of Layer,  remainder )",
          "RWA_held  =  per-market inventory, ≤10%/market, ≤20% category",
          "Blended   =  Σ ( tier x rate )  /  Layer        // 3.5 / 4.5 / 7.5 %/yr",
        ]} />

        <Sub>8. RWA Volume (Per Market)</Sub>
        <Formula label="Each named market has its own AUM and rates" lines={[
          "AUM_mk(t)      =  AUM_mk(0)  x  (1 + aumGrowth_mk)^months_live",
          "Liq_demand_mk  =  AUM_mk  x  liqRate_mk / 100        // e.g. 0.8%/mo",
          "Mint_demand_mk =  AUM_mk  x  mintRate_mk / 100       // from mintStartMonth",
          "",
          "Served volume  =  MIN( demand,  Layer capacity after BCI redemptions",
          "                       and the LCR guard )  — pro-rata across markets",
          "Minting serves =  MIN( that market's HELD inventory,  mint demand )",
        ]} />

        <Sub>9. Emergency Reserve</Sub>
        <Formula label="ER target and monthly funding" lines={[
          "At_risk(t)    =  Morpho_deployment  +  BC_USDC_Yield_Position",
          "ER_target(t)  =  At_risk(t)  x  ER_rate(year)",
          "ER_rate:  Y1=10%  Y2=15%  Y3=20%  (Y4+=25% cap — beyond sim horizon)",
          "",
          "ER(t)  =  ER(t-1)  +  Layer_yield x 0.10  +  ER_top_up",
          "ER_top_up  =  MIN( MAX(0, target - current),  Total_PR_gross x 10% )",
        ]} />

        <Sub>10. Annualized Index Growth</Sub>
        <Formula label="Compound annualized growth from launch" lines={[
          "Ann_Growth(t)  =  [ BCI_price(t) / 1.0000 ] ^ (12 / t)  -  1",
          "// t = months from launch · reporting metric, not a return guarantee",
        ]} />

        {/* S12 */}
        <SH id="s12" n="12">Scenario Definitions</SH>
        <P>The simulator ships one calibrated <strong style={{ color:T.ink }}>Default</strong> scenario over a hard 36-month horizon; any slider change becomes a <strong style={{ color:T.ink }}>Custom</strong> scenario. (The v3 Bear/Base/Bull presets were retired — every assumption is now individually adjustable instead.)</P>
        {[
          { name:"Default", desc:"Calibrated base case: moderate institutional inflows, retail pool from Month 4, ten named RWA markets launching staggered between Month 1 and Month 28 — each with its own AUM, growth, liquidation/minting rates, haircut, and issuer redemption period.", params:[["Private seed","$3.2M (M1)"],["LP growth","$500K/mo"],["BCI conversion","98% (private & retail)"],["Private outflow","2.5%/mo after 6-mo lock"],["Pool start","M4 · $200K"],["RWA markets","10, staggered M1-M28"],["Horizon","36 months"]], implication:"Demand-constrained throughout: RWA demand exceeds Layer capacity in all 36 months, so growth is set by LP inflows, not by market demand. BCI annualized growth ≈ 8-9% at M12 under default assumptions. LCR stays HEALTHY all 36 months with the 1.5x acceptance guard." },
          { name:"Custom", desc:"Any slider movement — LP flows, fees, conversion rates, market parameters, Layer/Bound Core configuration — recomputes the full 36-month simulation instantly. All tables and charts read from the same single engine run.", params:[["Sliders","~60 across 8 sections"],["Recompute","Instant, full-horizon"],["Verification","30 invariant families"]], implication:"Use the assumptions page to stress any input; the Simulation Results page always reflects the current inputs." },
        ].map(({ name, desc, params, implication }) => (
          <div key={name} style={{ background:T.bgEl, border:`1px solid ${T.border}`,
            borderLeft:`3px solid ${T.green}`, borderRadius:"0 10px 10px 0",
            padding:"14px 18px", marginBottom:12, boxShadow:SHADOW }}>
            <div style={{ fontSize:14, fontWeight:600, color:T.ink, marginBottom:6 }}>{name} Scenario</div>
            <div style={{ fontSize:13, color:T.ink2, lineHeight:1.65, marginBottom:12 }}>{desc}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
              {params.map(([k,v]) => (
                <div key={k} style={{ padding:"3px 8px", background:T.bgInset,
                  border:`1px solid ${T.border}`, borderRadius:4, fontSize:11.5 }}>
                  <span style={{ color:T.ink3 }}>{k}:</span>{" "}
                  <span style={{ color:T.ink, fontFamily:"'Geist Mono',ui-monospace,monospace", fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12.5, color:T.ink2, padding:"8px 12px",
              background:T.bgSoft, borderRadius:6, border:`1px solid ${T.border}` }}>
              <span style={{ color:T.green, fontWeight:600 }}>Outcome: </span>{implication}
            </div>
          </div>
        ))}

        {/* S13 */}
        <SH id="s13" n="13">Glossary</SH>
        <div style={{ marginTop:10 }}>
          {[
            ["rwaUSD", "BOUND's 100% USDC-backed stablecoin. Backed by Bound Core SC. RWA never backs rwaUSD. Peg defended atomically by APSS on Uniswap v4."],
            ["BCI (Bound Collateralization Index)", "Index token tracking Bound Liquidity Layer collateral performance. Price = (Layer NAV + BCI SC balance) / BCI Supply, in rwaUSD. Never on secondary market. Not a yield product — language is 'index growth' / 'collateral performance.'"],
            ["BND (BOUND Governance Token)", "Governance token with conversion fee discount utility. ~50% discount when used (0.44% vs 0.88%). 100% burned on use. Zero benefit to BCI SC from BND payments."],
            ["APSS (Atomic Peg Stabilization System)", "Core peg defense. Executes corrective trades in same block as every pool trade. Not a user fee — protocol captures arbitrage that would otherwise go to MEV bots."],
            ["BCI SC (BCI Smart Contract)", "Running rwaUSD ledger of accumulated FEE REVENUE only — LP capital lives in the Liquidity Layer, not here. Fee credits grow the SC without minting supply, which is what moves BCI price."],
            ["Bound Core SC", "Holds the USDC backing idle rwaUSD (the non-converting share of LP deposits). Two tiers: raw USDC sized to coverage% × idle rwaUSD (default 100%, 0% yield, instant redemption), plus a USDC Yield Position for any surplus NAV (default 4.5%/yr, flat 80/20 split)."],
            ["Bound Liquidity Layer", "Capital pool backing all BCI tokens. 4-tier monthly waterfall: USDC buffer (Aave) → Morpho vaults → Enhanced yield → RWA held inventory, with LCR-based stress modes."],
            ["USDC Buffer (Tier 1)", "Aave-held USDC sized each month to the LARGEST of: 5% floor, 14 days of LP exits, 14 days of served RWA liquidations. T+0, ~3.5%/yr. Capped at 80% of Layer."],
            ["Morpho / Enhanced (Tiers 2-3)", "Morpho vaults (~4.5%/yr, min 20% reserve share) and Enhanced yield (~7.5%/yr, capped at 20% of Layer). Both T+0-T+1 liquid."],
            ["RWA Held Inventory (Tier 4)", "RWA positions bought from liquidating holders, held until matched with minting demand or matured. Illiquid. Capped at 10% of Layer per market, 20% category-wide; overflow drains through each market's own issuer pipeline (T+30-T+120)."],
            ["LCR (Liquidity Coverage Ratio)", "Liquid capital (Tiers 1-3) ÷ near-term obligations (LP exits due + RWA volume actually accepted). Modes: HEALTHY ≥1.5, WARNING ≥1.0, STRESS ≥0.7, EMERGENCY below. An acceptance guard keeps projected month-end LCR above a configured floor (default 1.5x)."],
            ["USDC Yield Position", "Bound Core's Tier 2 — USDC NAV above the instant-redemption coverage requirement. Earns the configured rate (default 4.5%/yr), paid out once, flat 80% BCI SC / 20% PR. $0 at the default 100% coverage."],
            ["Emergency Reserve (ER)", "$500K seed, insured. Fed by 10% of gross Layer yield every month plus PR top-ups (capped at 10% of gross monthly PR) toward its target: 10% → 20% of at-risk assets over the 36-month horizon (25% cap beyond)."],
            ["Loss Waterfall", "Order: (1) Emergency Reserve, (2) insurance policy, (3) BCI index reduction. BCI holders are the absolute last resort."],
            ["Haircut", "Discount at which BOUND buys RWA below NAV. Per-market baseline (0.5% default), escalated by a 3-step ladder as held inventory approaches the 10% per-market / 20% category caps. Minting-side haircut is reduced by a stress-linked discount ladder (one-month lag). Revenue: 80% BCI / 20% PR."],
            ["Collateral Surplus", "Revenue credited to BCI SC. Includes USDC released from Bound Core when rwaUSD is burned (conversion fee), plus fee shares and yield distributions. This drives BCI price."],
            ["Issuer Redemption Pipeline", "Per-market ledger of RWA inventory sent back to its issuer for redemption. Each market's pipeline returns cash at that market's own issuerRedemptionDays (T+30-T+120) — no blended average. Pipeline cash counts as returning liquidity, not held risk."],
            ["T+0", "Instant settlement. Guaranteed for RWA holders. NOT for LP holders — LP redemption tied to RWA issuer period."],
            ["MiCA", "EU Markets in Crypto-Assets Regulation. rwaUSD positioned as stable value access token. DeFi deployments under ongoing legal review with VD Law Group."],
          ].map(([term, def]) => <GL key={term} term={term} def={def} />)}
        </div>

        <Divider />
        <div style={{ padding:"12px 16px", background:T.bgSoft, border:`1px solid ${T.border}`,
          borderRadius:8, fontSize:11.5, color:T.ink3, lineHeight:1.75 }}>
          <strong style={{ color:T.ink, fontSize:12.5 }}>BOUND Protocol Reference Document v4.0</strong><br />
          Architecture v4, July 2026 — synchronized with simulator v8 after the full 10-section audit. Key changes from v3: BCI price = (Layer NAV + BCI SC) ÷ supply — LP capital and fee revenue in separate ledgers, mint/burn at start-of-month price. Liquidity Layer = 4-tier waterfall (USDC/Morpho/Enhanced/RWA held) with LCR stress modes and a 1.5x RWA acceptance guard — replaces the ILB/AYL/EYL velocity model. BCI redemptions senior to RWA service; per-market issuer pipelines at each market's own T+30-T+120. Bound Core = two-tier coverage model (raw USDC + USDC Yield Position), float yield flat 80/20 — phase schedule removed. Conversion fee 0.88%. Private mint/redeem and RWA trade/haircut splits flipped to 80% BCI SC / 20% Protocol Reserve (July 2026). Monthly appreciation threshold removed. Concentration: gentle 3-step escalation at 10% per-market / 20% category caps — punitive cliff removed. ER fed by 10% of Layer yield + capped PR top-ups; 36-month horizon throughout. Ten named RWA markets with individual parameters.<br />
          <span style={{ color:T.red }}>Illustrative only. Not a financial projection or investment advice.</span>
        </div>
      </div>
    </div>
  );
}
