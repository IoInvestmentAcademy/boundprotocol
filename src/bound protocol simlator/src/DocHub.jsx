import { useState, useRef, useEffect } from "react";

/* Dark palette — matches the BND Token Economic Audit page */
const T = {
  bg:"#0E130F", bgEl:"#151B16", bgSoft:"#1A211B", bgInset:"#1F271F",
  border:"#28322A", borderS:"#3A4A3E",
  ink:"#ECEFE8", ink2:"#BAC2B9", ink3:"#889086", ink4:"#6E766D", ink5:"#565E56",
  green:"#79C6A9", green2:"#5FAE90", greenDeep:"#2C6A57", greenSoft:"#17251E",
  amber:"#E2AC48", blue:"#6FA0E0",
};
const SHADOW = "0 1px 2px rgba(0,0,0,.30)";
const SHADOW_H = "0 2px 5px rgba(0,0,0,.35), 0 16px 38px rgba(0,0,0,.45)";
const SANS = "'Geist','Inter',-apple-system,'Segoe UI',sans-serif";
/* Ambient abstract-green background, fixed to the viewport (same recipe as the audit page) */
const BG = [
  "radial-gradient(58% 46% at 86% -6%, color-mix(in srgb,#5FAE90 24%,transparent), transparent 60%)",
  "radial-gradient(52% 42% at 2% 6%, color-mix(in srgb,#5FAE90 14%,transparent), transparent 58%)",
  "radial-gradient(60% 50% at 110% 40%, color-mix(in srgb,#79C6A9 15%,transparent), transparent 56%)",
  "radial-gradient(50% 44% at -10% 82%, color-mix(in srgb,#5FAE90 11%,transparent), transparent 55%)",
  "radial-gradient(46% 40% at 78% 108%, color-mix(in srgb,#79C6A9 11%,transparent), transparent 55%)",
  T.bg,
].join(", ");

/* ---------------------------------------------------------------------------
   EXTERNAL LINKS — the only place to edit when a URL becomes available.
   Leave a value as "" and its card renders disabled ("Coming soon") rather than
   linking nowhere.

   Every link here opens in a new tab and is served by Google, NOT by this app.
   That is deliberate for the confidential material: access is granted per person
   in Drive, is revocable, and shows you who opened what. Never move those files
   into public/ — anything in public/ is served to anyone who has the URL, with
   no access control of any kind.

     Presentations   → Google Slides. "Anyone with the link can view" is fine;
                       these are pitch material.
     Legal & Corporate → Google Drive, restricted to specific email addresses.
                       Do NOT set these to "anyone with the link".

   The two legal opinions are the exception: they are served from this app under
   /legal/ and gated by Cloudflare Access on that path. Anything else confidential
   should stay in Drive unless it has been added to that Access policy first.
   --------------------------------------------------------------------------- */
const LINKS = {
  mvp:           "https://app.boundprotocol.com/",   // live MVP / product app
  pitchDeck:     "/decks/bound-pitch-deck-july-2026.pdf",   // served from this app
  lpDeck:        "",   // Google Slides — Liquidity Provider Presentation
  issuerDeck:    "",   // Google Slides — RWA Issuer Presentation
  presale:       "https://presale.boundprotocol.com/",   // Presale platform — self-serve BND subscription
};

/* Legal and corporate files served from this app under /legal/, gated by the
   Cloudflare Access policies on those paths. Three tiers, three policies —
   see DEPLOYMENT.md. The policies must exist before the first publish.

     /legal/opinions/   counsel opinions   — investor diligence
     /legal/corporate/  formation records  — investor diligence
     /legal/internal/   counsel engagement — internal only, never shared
     /legal/investment/ form of agreement  — per counterparty

   The internal tier carries the law firm's fee schedule and tax-structuring
   commentary. It is deliberately not reachable from this page. */
const L = (tier, file, ext = 'pdf') => `/legal/${tier}/${file}.${ext}`;
const linked = url => (url ? "available" : "soon");

/* Minimalist line icons (stroke, no fill) — feather/lucide style */
const ICONS = {
  book: (<><path d="M2 3.5h5.5A3.5 3.5 0 0 1 11 7v13.5a3 3 0 0 0-3-3H2z"/><path d="M22 3.5h-5.5A3.5 3.5 0 0 0 13 7v13.5a3 3 0 0 1 3-3h6z"/></>),
  shield: (<><path d="M12 21.5s7-3.5 7-9V5.2L12 2.5 5 5.2v7.3c0 5.5 7 9 7 9z"/><path d="m8.7 11.7 2.4 2.4 4.2-4.4"/></>),
  file: (<><path d="M13.5 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 2.5v6h6"/><path d="M8.5 13.5h7"/><path d="M8.5 17h7"/><path d="M8.5 10h2"/></>),
  chart: (<><path d="M3.5 3.5v16a1 1 0 0 0 1 1h16"/><rect x="7.5" y="12" width="2.6" height="5.5" rx="0.6"/><rect x="12.5" y="8.5" width="2.6" height="9" rx="0.6"/><rect x="17.5" y="5.5" width="2.6" height="12" rx="0.6"/></>),
  target: (<><circle cx="12" cy="12" r="9.3"/><circle cx="12" cy="12" r="5.3"/><circle cx="12" cy="12" r="1.4"/></>),
  briefcase: (<><rect x="2.5" y="7.5" width="19" height="13" rx="2"/><path d="M8.5 7.5V5.2a1.7 1.7 0 0 1 1.7-1.7h3.6a1.7 1.7 0 0 1 1.7 1.7v2.3"/><path d="M2.5 13h19"/></>),
  route: (<><circle cx="5.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="18.5" r="2.6"/><path d="M8.1 5.5h5.4a3.5 3.5 0 0 1 0 7h-3a3.5 3.5 0 0 0 0 7h5.4"/></>),
  slides: (<><rect x="2.5" y="3.5" width="19" height="13" rx="1.8"/><path d="M12 16.5v4"/><path d="M8.5 20.5h7"/></>),
  users: (<><path d="M16 20.5v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.1a3.6 3.6 0 0 0-3.6 3.6v1.8"/><circle cx="9.25" cy="7.6" r="3.6"/><path d="M21.5 20.5v-1.8a3.6 3.6 0 0 0-2.7-3.48"/><path d="M15.6 4.12a3.6 3.6 0 0 1 0 6.97"/></>),
  building: (<><path d="M4.5 21.5V4.2a1.7 1.7 0 0 1 1.7-1.7h7.6a1.7 1.7 0 0 1 1.7 1.7v17.3"/><path d="M15.5 10.5h2.8a1.7 1.7 0 0 1 1.7 1.7v9.3"/><path d="M2.5 21.5h19"/><path d="M8 7h4"/><path d="M8 11h4"/><path d="M8 15h4"/></>),
  scale: (<><path d="M12 3.5v17"/><path d="M6 20.5h12"/><path d="M5 8 2.5 13.5a3 3 0 0 0 5 0z"/><path d="m19 8 2.5 5.5a3 3 0 0 1-5 0z"/><path d="M5 8l7-2 7 2"/></>),
  award: (<><circle cx="12" cy="9" r="6"/><path d="m8.6 14.2-1.1 7.3 4.5-2.6 4.5 2.6-1.1-7.3"/></>),
  pen: (<><path d="M14.5 3.5 20.5 9.5"/><path d="M17.5 2.5a2.83 2.83 0 0 1 4 4L7.5 20.5l-5 1 1-5z"/></>),
  activity: (<><path d="M2.5 12.5h4l2.5-7 4 14 2.6-8.5 2 3.5h4"/></>),
  external: (<><path d="M14.5 3.5h6v6"/><path d="M20.5 3.5 11 13"/><path d="M19 14v5.5a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 19.5V6.8A1.8 1.8 0 0 1 4.8 5H10"/></>),
};
function Icon({ name, color = T.green, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/* Protocol overview — shown once, here, rather than restated in the opening
   paragraph of every document. A first-time reader gets the shape of the
   protocol before opening anything; each document then opens on its own
   subject. The Whitepaper is the exception and keeps its own abstract, because
   it has to stand alone for anyone who receives only that file. */
const OVERVIEW = {
  lede: [
    "Tokenization has succeeded at putting real-world assets on-chain and failed at making them liquid. The assets move in seconds. The money does not. A holder wanting out sends a redemption request to the issuer and waits thirty days, sixty, sometimes ninety or more. The asset class markets itself as instant and around-the-clock. Its exits are neither.",
    "As of July 2026, the distributed on-chain value of tokenized real-world assets stands at approximately $33.5 billion, having roughly tripled year-over-year, with a further ~$389 billion of representative asset value committed to tokenization pipelines. The market has priced this problem. In March 2026, Midas, a Berlin-based RWA issuance platform, raised a $50 million Series A led by RRE Ventures and Creandum, with participation from Franklin Templeton, Coinbase Ventures and Framework Ventures, explicitly to build an instant-liquidity layer for tokenized assets.",
    "BOUND gives holders of tokenized real-world assets an instant exit. A holder brings an RWA token to a BOUND market and receives rwaUSD at a small, transparent discount. No waiting, no negotiating with market makers, no hoping someone is on the other side of the trade. The protocol's own reserve takes that side, every time. The RWA the protocol acquires does not sit idle. BOUND can resell it through its own markets to buyers who want that exposure, or redeem it with the issuer over time. The discount the protocol earns along the way is what funds the system.",
  ],
  tokens: [
    { sym:"rwaUSD", name:"Settlement dollar",
      desc:"Always minted against USDC and always backed 100% by USDC. It is built to be the settlement dollar of the RWA sector." },
    { sym:"BLI", name:"Bound Liquidity Index",
      desc:"The index token for those who capitalize the system. Its value reflects the reserve's performance and the fees the protocol earns." },
    { sym:"BND", name:"Governance token",
      desc:"The tool holders use to steer the protocol, deciding which RWA markets are onboarded and what the risk parameters are. It pays protocol fees at a discount and is burned through protocol activity." },
  ],
  entities: [
    { name:"Nexus Technologies Foundation", where:"Panama", role:"Owns the protocol and its intellectual property, grants the token delegation" },
    { name:"BITSWIFT TECHNOLOGIES INC.", where:"Panama", role:"Distributes the token and holds the raise proceeds" },
    { name:"Operating company", where:"European Union", role:"Develops the protocol, employs the team, bears operating cost" },
  ],
};

/* Documentation entries — full cards, each with a description */
const DOCS = [
  { key:"audit", icon:"shield", tag:"Report", tagColor:T.blue, status:"available",
    title:"BND Token Economic Audit",
    desc:"An independent, data-driven audit of the BND token model — vesting, discounts, investor ROI, the Burn Engine, xBND Revenue Switch, staking pool, and liquidity depth.",
    meta:"Generated from the live simulation engine" },
  { key:"whitepaper", icon:"file", tag:"Whitepaper", tagColor:T.amber, status:"available",
    title:"Whitepaper",
    desc:"The full protocol specification — the RWA liquidity problem, rwaUSD, the BLI index, the four-tier Liquidity Layer, APSS, protocol economics, governance, and the risk and regulatory framework.",
    meta:"Version 2.0 — July 2026" },
  { key:"market", icon:"chart", tag:"Analysis", tagColor:T.green2, status:"available",
    title:"Market Analysis",
    desc:"The RWA liquidity gap sized from the tokenized-asset flow economy — market context, the Midas $50M validation signal, the competitive landscape, stablecoin positioning, and the regulatory environment.",
    meta:"July 2026 · Confidential" },
  { key:"competitors", icon:"target", tag:"Analysis", tagColor:T.green2, status:"available",
    title:"Competitors Analysis",
    desc:"Every live architecture competing to turn locked RWA positions into usable dollars — Midas MSL, Symbiotic Liquid Lane, Ondo Nexus, and Aave Horizon — assessed side by side against BOUND.",
    meta:"July 2026 · Confidential" },
  { key:"costs", icon:"briefcase", tag:"Report", tagColor:T.blue, status:"available",
    title:"Operating Cost & Company Analysis",
    desc:"The cost base attributed by entity, the operating company's profit and loss under its development-and-services agreement, its 24-month funded plan, the personnel roster at full employer cost with gross-to-net under Romanian payroll law, and the marketing budget rebuilt from B2B benchmarks.",
    meta:"36-month cost base · 24-month company plan · Confidential" },
  { key:"architecture", icon:"shield", tag:"Reference", tagColor:T.green, status:"available",
    title:"Smart Contract Architecture",
    desc:"The deployed contract system \u2014 six contracts covering the rwaUSD settlement dollar, the Uniswap V4 hook that defends its peg, reserve deployment, valuation, the rwaUSD\u2194BLI converter and the index token \u2014 with access control, fee schedule, integrations, and how the RWA migration extends each component.",
    meta:"Confidential \u00b7 Ethereum" },
  { key:"roadmap", icon:"route", tag:"Roadmap", tagColor:T.green2, status:"available",
    title:"Delivery Roadmap",
    desc:"The engineering plan for the RWA migration, built on deployed APSS infrastructure \u2014 twelve milestones across three phases, four parallel engineering layers, the two-round audit strategy, the $320,000 development budget in three cuts, and the schedule risks that govern the window.",
    meta:"22\u201325 weeks \u00b7 Confidential" },
  { key:"businessplan", icon:"briefcase", tag:"Report", tagColor:T.amber, status:"available",
    title:"Business Plan",
    desc:"The 36-month operating model — protocol architecture, the eight active revenue streams, capital formation, transaction volume, index formation, the cost base, income statement, and the capital requirement and breakeven point. Every figure derived from the simulation engine's default case.",
    meta:"Year 1\u2013Year 3 \u00b7 Confidential" },
  { key:"gtm", icon:"target", tag:"Strategy", tagColor:T.amber, status:"available",
    title:"Go-to-Market Strategy",
    desc:"Sequencing both sides of a two-sided liquidity market \u2014 staged opening of liquidity supply and demand, the cold-start problem, acquisition strategy per audience, the launch-year marketing allocation in full, and the stage gates that govern each opening.",
    meta:"Months 1\u201336 \u00b7 Confidential" },
];

/* Presentations — compact cards, opening Google Slides decks */
const DECKS = [
  { key:"pitchDeck", icon:"slides", title:"Pitch Deck",
    meta:"July 2026 \u00b7 11 pages \u00b7 PDF", url:LINKS.pitchDeck },
  { key:"lpDeck", icon:"users", title:"Liquidity Provider Presentation",
    meta:"", url:LINKS.lpDeck },
  { key:"issuerDeck", icon:"building", title:"RWA Issuer Presentation",
    meta:"", url:LINKS.issuerDeck },
];

/* Test evidence — transaction test logs for the APSS. */
const EVIDENCE = [
  { key:"apssLog", icon:"activity",
    title:"APSS Execution Log",
    meta:"PDF",
    url:"/evidence/apss-execution-log.pdf" },
  { key:"apssPeg", icon:"chart",
    title:"Peg Defense Under Stress Scenarios",
    meta:"PDF",
    url:"/evidence/apss-peg-restoration.pdf" },
];

/* Legal & Corporate — grouped compact cards.
   Grouped by entity and document class rather than listed flat: fifteen
   undifferentiated cards tell a reader nothing about which entity issued what. */
const LEGAL_GROUPS = [
  {
    heading: "Counsel opinions",
    note: "VD Law Group, Bucharest. Privileged and confidential.",
    items: [
      { key:"opRwausd", icon:"scale", title:"Legal Opinion — rwaUSD Token",
        meta:"27 July 2026 · 20 pages", url:L("opinions","legal-opinion-rwausd") },
      { key:"opBli", icon:"scale", title:"Legal Opinion — BLI Token",
        meta:"27 July 2026 · 20 pages", url:L("opinions","legal-opinion-bli") },
    ],
  },
  {
    heading: "BITSWIFT TECHNOLOGIES INC.",
    note: "Panama International Business Company — the issuing entity named in both opinions.",
    items: [
      { key:"bwCert", icon:"award", title:"Certificate of Incorporation",
        meta:"With certified translation", url:L("corporate","bitswift-certificate-of-incorporation") },
      { key:"bwArt", icon:"file", title:"Articles of Incorporation",
        meta:"Constitutive document", url:L("corporate","bitswift-articles-of-incorporation") },
      { key:"bwReg", icon:"building", title:"Public Registry Inscription",
        meta:"Registro Público de Panamá · 2025-398278", url:L("corporate","bitswift-registry-inscription") },
      { key:"bwMin", icon:"file", title:"Initial Minutes",
        meta:"First resolutions of the board", url:L("corporate","bitswift-initial-minutes") },
      { key:"bwSh", icon:"award", title:"Share Certificate",
        meta:"Shareholding record", url:L("corporate","bitswift-share-certificate") },
      { key:"bwPoa", icon:"pen", title:"Power of Attorney",
        meta:"Delegated authority", url:L("corporate","bitswift-power-of-attorney") },
      { key:"bwInd", icon:"shield", title:"Declaration of Indemnity",
        meta:"Director indemnity", url:L("corporate","bitswift-declaration-of-indemnity") },
    ],
  },
  {
    heading: "Nexus Technologies Foundation",
    note: "Panama private-interest foundation, incorporated through Mata & Pitti.",
    items: [
      { key:"nxCert", icon:"award", title:"Certificate of Incorporation",
        meta:"Foundation registration", url:L("corporate","nexus-certificate-of-incorporation") },
      { key:"nxDeed", icon:"file", title:"Foundation Deed",
        meta:"Constitutive deed · 12 pages", url:L("corporate","nexus-foundation-deed") },
      { key:"nxReg", icon:"scale", title:"Regulations of the Foundation",
        meta:"Governing regulations", url:L("corporate","nexus-foundation-regulations") },
      { key:"nxInc", icon:"users", title:"Certificate of Incumbency",
        meta:"2024 · Mata & Pitti", url:L("corporate","nexus-certificate-of-incumbency") },
    ],
  },
  {
    heading: "Investment",
    note: "Form of agreement, shared per counterparty under confidentiality. Draft — commercial terms are completed per deal.",
    items: [
      { key:"qa", icon:"file", title:"Investment Q&A",
        meta:"Investor questionnaire \u00b7 current structure and tokenomics",
        url:"/bound-investment-qa.html" },
      { key:"proposal", icon:"chart", title:"Seed Token Investment Proposal",
        meta:"100,000,000 BND \u00b7 $0.0248 \u00b7 generated from the engine",
        url:"/bound-seed-proposal.html" },
      { key:"saft", icon:"pen", title:"SAFT — Simple Agreement for Future Tokens",
        meta:"Draft 2026 · BND · editable form", url:L("investment","saft-draft-2026","docx") },
      { key:"presale", icon:"external", title:"Presale Platform",
        meta:"Self-serve BND subscription · presale.boundprotocol.com", url:LINKS.presale },
    ],
  },
];

/* Media — brand assets served from /media/. The individual logo PNGs remain
   served under /media/logo/ and are bundled in the pack; they are simply not
   listed here. */
const M = f => `/media/${f}`;

const MEDIA_FILES = [
  { key:"guidelines", icon:"book", title:"Brand Guidelines",
    meta:"23 pages · logo, colour, icons, imagery, type", url:M("bound-brand-guidelines.pdf") },
  { key:"pack", icon:"briefcase", title:"Brand Pack",
    meta:"ZIP · web and print PNG, guidelines", url:M("bound-brand-pack.zip") },
  { key:"psd", icon:"pen", title:"Logo Source File",
    meta:"PSD · layered variations", url:M("logo/source/bound-logo-variations.psd") },
];

const openExternal = url => window.open(url, "_blank", "noopener,noreferrer");

function NavBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"6px 15px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:600,
      border:"none", whiteSpace:"nowrap",
      background: active ? T.greenDeep : "transparent",
      color: active ? "#EAF6EF" : T.ink2,
      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.4)" : "none",
    }}>{label}</button>
  );
}

/* "Simulator" nav dropdown — mirrors the control in the main app so the two
   simulators are reached the same way from every page. */
function SimulatorNavBtn({ onProtocol, onTokenomics }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const items = [
    { key: "protocol", label: "Protocol Simulator", onClick: onProtocol },
    { key: "tokenomics", label: "Tokenomics Simulator", onClick: onTokenomics },
  ];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        style={{ padding: "6px 12px 6px 15px", borderRadius: 7, cursor: "pointer", fontSize: 12,
          fontWeight: 600, border: "none", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent", color: T.ink2 }}>
        Simulator
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <path d="M2 3.5 L5 6.5 L8 3.5" />
        </svg>
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", top: "calc(100% + 7px)", left: 0, minWidth: 196,
          background: T.bgEl, border: `1px solid ${T.border}`, borderRadius: 9, padding: 4,
          boxShadow: "0 6px 20px rgba(0,0,0,.42)", zIndex: 50 }}>
          {items.map(it => (
            <button key={it.key} role="menuitem"
              onClick={() => { setOpen(false); it.onClick?.(); }}
              style={{ display: "block", width: "100%", textAlign: "left",
                padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                border: "none", whiteSpace: "nowrap", fontFamily: "inherit",
                background: "transparent", color: T.ink2 }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Filled accent button that leaves the app for the live MVP */
function MvpBtn({ url }) {
  const [hover, setHover] = useState(false);
  const on = Boolean(url);
  return (
    <button
      onClick={on ? () => openExternal(url) : undefined}
      disabled={!on}
      title={on ? "Open the live MVP" : "MVP link not configured yet"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:"flex", alignItems:"center", gap:7, flexShrink:0,
        padding:"8px 14px", borderRadius:9, fontSize:12, fontWeight:600,
        fontFamily:"inherit", whiteSpace:"nowrap",
        cursor: on ? "pointer" : "not-allowed", opacity: on ? 1 : 0.5,
        background: on && hover ? T.green2 : T.greenDeep,
        color:"#EAF6EF",
        border:`1px solid ${on && hover ? T.green : "color-mix(in srgb,#5FAE90 34%,transparent)"}`,
        boxShadow:SHADOW, transition:"background .14s ease, border-color .14s ease",
      }}>
      Open MVP
      <Icon name="external" color="#EAF6EF" size={13} />
    </button>
  );
}

/* Section heading shared by all three groups */
function SectionHead({ label, title, note }) {
  return (
    <div style={{ margin:"0 0 18px" }}>
      <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase",
        color:T.green2, marginBottom:7 }}>{label}</div>
      <h2 style={{ fontSize:21, fontWeight:600, color:T.ink, letterSpacing:"-0.015em", margin:"0 0 6px" }}>{title}</h2>
      {note && <p style={{ fontSize:13, color:T.ink3, lineHeight:1.6, margin:0, maxWidth:"64ch" }}>{note}</p>}
    </div>
  );
}

function DocCard({ doc, onOpen }) {
  const [hover, setHover] = useState(false);
  const available = doc.status === "available";
  const lit = hover && available;
  return (
    <div
      onClick={available ? onOpen : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:T.bgEl, border:`1px solid ${lit ? T.borderS : T.border}`,
        borderRadius:14, padding:"22px 22px 18px", boxShadow: lit ? SHADOW_H : SHADOW,
        cursor: available ? "pointer" : "default", opacity: available ? 1 : 0.62,
        transform: lit ? "translateY(-2px)" : "none",
        transition:"transform .16s ease, box-shadow .16s ease, border-color .16s ease",
        display:"flex", flexDirection:"column", gap:12, minHeight:196,
      }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:11, flexShrink:0,
          background: available ? T.greenSoft : T.bgInset,
          border:`1px solid ${available ? "color-mix(in srgb,#5FAE90 22%,transparent)" : T.border}`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={doc.icon} color={available ? T.green : T.ink4} />
        </div>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
          color:doc.tagColor, background:T.bgInset, border:`1px solid ${T.border}`,
          padding:"4px 9px", borderRadius:999, whiteSpace:"nowrap" }}>{doc.tag}</span>
      </div>
      <div style={{ fontSize:16.5, fontWeight:600, color:T.ink, letterSpacing:"-0.01em", lineHeight:1.25 }}>{doc.title}</div>
      <div style={{ fontSize:13, color:T.ink3, lineHeight:1.6, flex:1 }}>{doc.desc}</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        paddingTop:12, borderTop:`1px solid ${T.border}`, marginTop:2 }}>
        <span style={{ fontSize:10.5, color:T.ink4 }}>{doc.meta}</span>
        <span style={{ fontSize:12, fontWeight:600, color: available ? T.green : T.ink5, whiteSpace:"nowrap" }}>
          {available ? "Open →" : "Coming soon"}
        </span>
      </div>
    </div>
  );
}

/* Reduced-height card for presentations and legal documents — no description body */
function CompactCard({ item }) {
  const [hover, setHover] = useState(false);
  const available = linked(item.url) === "available";
  const lit = hover && available;
  return (
    <div
      onClick={available ? () => openExternal(item.url) : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:T.bgEl, border:`1px solid ${lit ? T.borderS : T.border}`,
        borderRadius:12, padding:"15px 17px", boxShadow: lit ? SHADOW_H : SHADOW,
        cursor: available ? "pointer" : "default", opacity: available ? 1 : 0.62,
        transform: lit ? "translateY(-2px)" : "none",
        transition:"transform .16s ease, box-shadow .16s ease, border-color .16s ease",
        display:"flex", alignItems:"center", gap:13, minHeight:70,
      }}>
      <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
        background: available ? T.greenSoft : T.bgInset,
        border:`1px solid ${available ? "color-mix(in srgb,#5FAE90 22%,transparent)" : T.border}`,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon name={item.icon} color={available ? T.green : T.ink4} size={18} />
      </div>
      <div style={{ minWidth:0, flex:1 }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:T.ink, lineHeight:1.3,
          letterSpacing:"-0.005em" }}>{item.title}</div>
        <div style={{ fontSize:10.5, color:T.ink4, marginTop:3 }}>
          {available ? item.meta : "Coming soon"}
        </div>
      </div>
      <span style={{ fontSize:12, fontWeight:600, flexShrink:0,
        color: available ? T.green : T.ink5 }}>{available ? "→" : ""}</span>
    </div>
  );
}

export default function DocHub({ onNavSimulator, onNavTokenomics }) {
  const openDoc = (key) => {
    if (key === "audit") window.location.assign("/bound-tokenomics-audit.html");
    if (key === "proposal") window.location.assign("/bound-seed-proposal.html");
    else if (key === "whitepaper") window.location.assign("/bound-whitepaper.html");
    else if (key === "market") window.location.assign("/bound-market-analysis.html");
    else if (key === "competitors") window.location.assign("/bound-competitors-analysis.html");
    else if (key === "costs") window.location.assign("/bound-cost-analysis.html");
    else if (key === "businessplan") window.location.assign("/bound-business-plan.html");
    else if (key === "roadmap") window.location.assign("/bound-delivery-roadmap.html");
    else if (key === "gtm") window.location.assign("/bound-gtm-strategy.html");
    else if (key === "architecture") window.location.assign("/bound-architecture.html");
  };
  const wrap = { maxWidth:1080, margin:"0 auto", padding:"0 24px" };
  const fullGrid = { display:"grid", gap:18, gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))" };
  const compactGrid = { display:"grid", gap:14, gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))" };

  return (
    <div style={{ minHeight:"100vh", background:BG, backgroundAttachment:"fixed",
      fontFamily:SANS, color:T.ink, WebkitFontSmoothing:"antialiased" }}>
      {/* header — matches the app's primary nav */}
      <div style={{ background:"color-mix(in srgb,#151B16 82%,transparent)",
        borderBottom:`1px solid ${T.border}`, backdropFilter:"blur(6px)",
        padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        gap:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green,
              boxShadow:"0 0 0 3px rgba(121,198,169,0.18)" }} />
            <span style={{ fontSize:15, fontWeight:600, color:T.ink, letterSpacing:"-0.01em" }}>BOUND Protocol</span>
          </div>
          <div style={{ fontSize:11, color:T.ink4, paddingLeft:17 }}>Documentation Library</div>
        </div>
        {/* nav + MVP wrap onto their own lines rather than overflowing on narrow screens */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:3, flexWrap:"wrap",
            background:T.bgSoft, border:`1px solid ${T.border}`, borderRadius:9, padding:3, boxShadow:SHADOW }}>
            <SimulatorNavBtn onProtocol={onNavSimulator} onTokenomics={onNavTokenomics} />
            <NavBtn label="Library" active />
          </div>
          <MvpBtn url={LINKS.mvp} />
        </div>
      </div>

      {/* hero */}
      <div style={{ ...wrap, padding:"48px 24px 8px" }}>
        <div style={{ fontSize:11.5, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase",
          color:T.green2, marginBottom:10 }}>Documentation</div>
        <h1 style={{ fontSize:34, fontWeight:600, color:T.ink, letterSpacing:"-0.02em", margin:"0 0 10px" }}>
          Everything about BOUND Protocol
        </h1>
        <p style={{ fontSize:15.5, color:T.ink3, lineHeight:1.6, maxWidth:"60ch", margin:0 }}>
          The full library — protocol documents, investor and partner presentations, and the
          legal and corporate record. Select an item to open it.
        </p>
      </div>

      {/* protocol overview — the shared context, stated once */}
      <div style={{ ...wrap, padding:"6px 24px 0" }}>
        <div style={{ background:T.bgEl, border:`1px solid ${T.border}`, borderRadius:14,
          padding:"26px 28px", boxShadow:SHADOW }}>
          {OVERVIEW.lede.map((para, i) => (
            <p key={i} style={{ fontSize:15, color:T.ink2, lineHeight:1.68,
              margin: i === OVERVIEW.lede.length - 1 ? "0 0 22px" : "0 0 13px" }}>
              {para}
            </p>
          ))}

          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.11em", textTransform:"uppercase",
            color:T.green2, marginBottom:10 }}>Three tokens</div>
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))",
            marginBottom:22 }}>
            {OVERVIEW.tokens.map(t => (
              <div key={t.sym} style={{ background:T.bgSoft, border:`1px solid ${T.border}`,
                borderRadius:10, padding:"13px 15px" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontFamily:"ui-monospace, monospace", fontSize:13.5,
                    fontWeight:700, color:T.green }}>{t.sym}</span>
                  <span style={{ fontSize:12, color:T.ink3 }}>{t.name}</span>
                </div>
                <div style={{ fontSize:12.5, color:T.ink2, lineHeight:1.5, marginTop:6 }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.11em", textTransform:"uppercase",
            color:T.green2, marginBottom:10 }}>Structure</div>
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))",
            marginBottom:0 }}>
            {OVERVIEW.entities.map(e => (
              <div key={e.name} style={{ background:T.bgSoft, border:`1px solid ${T.border}`,
                borderRadius:10, padding:"13px 15px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.ink }}>{e.name}</div>
                <div style={{ fontSize:11, color:T.green2, marginTop:2 }}>{e.where}</div>
                <div style={{ fontSize:12.5, color:T.ink2, lineHeight:1.5, marginTop:6 }}>{e.role}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* documents */}
      <div style={{ ...wrap, padding:"36px 24px 0" }}>
        <SectionHead label="Documents" title="Protocol documentation"
          note="The specification, the economic audit, and the market and competitive research behind the protocol." />
        <div style={fullGrid}>
          {DOCS.map(doc => <DocCard key={doc.key} doc={doc} onOpen={() => openDoc(doc.key)} />)}
        </div>
      </div>

      {/* presentations */}
      <div style={{ ...wrap, padding:"44px 24px 0" }}>
        <SectionHead label="Presentations" title="Decks"
          note="Audience-specific presentations. Each opens in a new tab." />
        <div style={compactGrid}>
          {DECKS.map(d => <CompactCard key={d.key} item={d} />)}
        </div>
      </div>

      {/* test evidence — placed under the decks, before the legal record */}
      <div style={{ ...wrap, padding:"44px 24px 0" }}>
        <SectionHead label="Test Evidence" title="APSS transaction record"
          note="Transaction test logs for the APSS." />
        <div style={compactGrid}>
          {EVIDENCE.map(d => <CompactCard key={d.key} item={d} />)}
        </div>
      </div>

      {/* legal & corporate */}
      <div style={{ ...wrap, padding:"44px 24px 0" }}>
        <SectionHead label="Legal &amp; Corporate" title="Legal and corporate record"
          note="Counsel opinions, corporate formation documents, and the investment contract. Shared under confidentiality." />
        {LEGAL_GROUPS.map(g => (
          <div key={g.heading} style={{ marginTop:26 }}>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.10em",
              textTransform:"uppercase", color:T.green2, marginBottom:3 }}>{g.heading}</div>
            <div style={{ fontSize:13, color:T.ink3, marginBottom:12 }}>{g.note}</div>
            <div style={compactGrid}>
              {g.items.map(d => <CompactCard key={d.key} item={d} />)}
            </div>
          </div>
        ))}
      </div>

      {/* media */}
      <div style={{ ...wrap, padding:"44px 24px 90px" }}>
        <SectionHead label="Media" title="Brand and media assets"
          note="The logo system, colour palette and type. Use the guidelines before placing the mark anywhere." />
        <div style={compactGrid}>
          {MEDIA_FILES.map(d => <CompactCard key={d.key} item={d} />)}
        </div>
      </div>

    </div>
  );
}
