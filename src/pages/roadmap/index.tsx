import { useState } from "react";

const PHASES = [
  {
    id: "phase1",
    label: "Phase 1",
    title: "Foundation & Architecture",
    duration: "Weeks 1–6",
    exitGate: "BLD architecture finalised; all teams unblocked; devnet live",
    status: "current",
  },
  {
    id: "phase2",
    label: "Phase 2",
    title: "Build — Full Parallel Execution",
    duration: "Weeks 7–16",
    exitGate: "All BOUND systems integrated end-to-end on testnet; pre-audit hardening complete",
    status: "upcoming",
  },
  {
    id: "phase3",
    label: "Phase 3",
    title: "Audit, Hardening & Mainnet Launch",
    duration: "Weeks 17–25",
    exitGate: "Audit signed off; QA/performance/load targets met; BLD markets live on mainnet",
    status: "upcoming",
  },
];

const LAYERS = {
  smartContract: {
    label: "Smart Contracts",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.35)",
    icon: "◈",
    phases: {
      phase1: {
        title: "BOUND Protocol Core & BLD Token Architecture",
        items: [
          "Architecture decisions finalised: upgrade pattern (proxy/diamond), storage layout, BLD token mechanics, haircut model",
          "BLD token contract: mint/burn gated to liquidity pool, peg mechanics, USDC collateral accounting",
          "RWA registry: asset onboarding primitives, eligibility enforcement, haircut assignment storage",
          "Liquidity pool core: instant exit swap logic, reserve tracking, background settlement queue",
          "Governance module: on-chain proposals, quorum, timelock, emergency pause — decentralised by default",
          "Admin role matrix: multi-sig gated emergency levers only (market suspension, haircut override); all normal ops permissionless",
          "Security primitives: access control library, reentrancy guards, overflow checks, rate-limit patterns",
          "Unit test scaffold: 100% branch coverage target established; fuzz test harness set up (echidna/foundry)",
        ],
      },
      phase2: {
        title: "Oracle Integration, Issuer Flows & Full Test Coverage",
        items: [
          "Oracle interface contracts: NAV/price feed hooks per RWA, data-freshness guards, stale-price circuit breakers",
          "Haircut assignment contract: dynamic haircut computation from oracle data, issuer-specific risk parameters",
          "Automation trigger interfaces: Chainlink Automation / custom keeper ABI for background settlement processing",
          "Issuer onboarding contracts: eligibility checks, vetting-fee collection, market-enabling fee logic",
          "Ongoing obligations enforcement: reporting deadline tracking, suspension trigger on missed obligations",
          "Strategy execution: asset manager callable vaults, rebalance logic, yield routing to reserves",
          "Integration tests: oracle manipulation, keeper failure modes, flash-loan vectors, gas profiling",
          "Full scenario test suite: bank-run simulation, haircut drift, governance attacks, MICA compliance edge cases",
          "Static analysis: Slither, Aderyn, Mythril passes — all high/critical findings resolved",
          "NatSpec documentation complete; architecture diagrams and threat model drafted",
        ],
      },
      phase3: {
        title: "Formal Verification, External Audit & Mainnet Deploy",
        items: [
          "Formal invariant checks on BLD peg accounting and reserve solvency logic (Certora Prover or Halmos)",
          "First-party audit: top-tier firm (Trail of Bits / Certora / OpenZeppelin) — full scope across all BOUND contracts",
          "Remediation sprint: all findings triaged, fixed, and re-tested before competition round",
          "Public competition: Code4rena or Sherlock — broad researcher coverage on BLD mechanics and RWA registry",
          "Second remediation: competition findings fixed; targeted re-audit of affected modules completed",
          "Final audit sign-off obtained; mainnet deployed from audited commit hash",
          "Post-launch: Immunefi bug bounty live; any contract-modifying finding triggers immediate re-audit",
        ],
      },
    },
  },
  backend: {
    label: "Backend & Oracle Automation",
    color: "#0891B2",
    glow: "rgba(8,145,178,0.35)",
    icon: "⬡",
    phases: {
      phase1: {
        title: "Mono-repo Scaffold & Dev Environment",
        items: [
          "Backend mono-repo: service boundaries, shared TypeScript types, CI skeleton",
          "Database schema: RWA registry mirror, BLD market state, NAV history, settlement queue, issuer obligation tracker",
          "Oracle service scaffold: NAV/price event listener, block-confirmation queue, retry and backoff logic",
          "Local devnet with mock BOUND contracts wired to backend for end-to-end integration testing from day one",
        ],
      },
      phase2: {
        title: "Oracle Automation Engine & BOUND Data API",
        items: [
          "Keeper/Oracle service: monitors RWA NAV feeds, triggers haircut recalculation and settlement autonomously",
          "Background settlement processor: queues and executes underlying RWA redemptions as they clear",
          "Issuer obligation tracker: monitors reporting deadlines, flags missed obligations, triggers suspension workflow",
          "Asset manager automation: scheduled rebalances, reserve threshold alerts, auto-compound routines",
          "Redundancy & failover: multi-RPC failover, dead-letter queues, PagerDuty/OpsGenie alerting",
          "Signed transaction pipeline: HSM or KMS-backed hot wallet, nonce manager, gas oracle",
          "REST API: authenticated endpoints for issuer ops, market CRUD, NAV submission, health checks",
          "GraphQL API: BLD market depth, RWA registry listings, historical yields, governance data, issuer status",
          "Subgraph (The Graph): all BOUND protocol events indexed for on-chain transparency",
          "Rate limiting, API key management, CORS policy, OpenAPI + GraphQL Playground docs",
          "Caching layer: Redis for hot BLD price/market paths; CDN for static analytics snapshots",
        ],
      },
      phase3: {
        title: "Load Testing, SLA Hardening & DR Drills",
        items: [
          "Load tests: 10x projected peak swap volume; all bottlenecks identified and resolved",
          "Disaster recovery drill: RPC outage, DB failover, oracle downtime — all BOUND-critical recovery paths validated",
          "Monitoring dashboards live: Grafana + Prometheus for BLD reserve health, swap latency, keeper uptime",
          "On-call runbooks for oracle failure, BLD depeg alert, issuer suspension workflow",
          "API documentation published: Swagger UI and GraphQL Playground accessible to RWA issuer partners",
        ],
      },
    },
  },
  frontend: {
    label: "Frontend",
    color: "#059669",
    glow: "rgba(5,150,105,0.35)",
    icon: "◉",
    phases: {
      phase1: {
        title: "Design System & App Scaffold",
        items: [
          "Design system: BOUND brand tokens (colour, type, spacing), component library, accessibility baseline (WCAG AA)",
          "App scaffold: Next.js + TypeScript, wallet adapters (wagmi/viem), route architecture",
          "SEO foundation: metadata schema, Open Graph, structured data targeting 'RWA liquidity', 'instant RWA exit', 'BLD'",
          "Content strategy: keyword map positioning BOUND as the primary RWA instant liquidity protocol",
        ],
      },
      phase2: {
        title: "BLD Swap UX, Issuer Onboarding & Full Data Layer",
        items: [
          "Wallet connect flows: multi-chain support, session management, transaction UX",
          "BLD instant exit swap interface: RWA selection, haircut preview, swap confirmation, settlement status tracker",
          "BLD/USDC swap integration: Uniswap deep-link and on-protocol swap routing",
          "Issuer onboarding wizard: eligibility self-check, entity/asset documentation upload, fee payment flow",
          "Issuer dashboard: NAV submission portal, obligation calendar, market status, quarterly audit tracker",
          "Asset manager portfolio view: positions, live BLD market depth, background settlement queue status",
          "REST API integration: issuer management and market ops",
          "GraphQL integration: live BLD market data, RWA registry, governance proposals",
          "SEO execution: SSR for all key pages, XML sitemap, Core Web Vitals target >= 90",
          "Responsive design: mobile-first, progressive enhancement across all breakpoints",
        ],
      },
      phase3: {
        title: "QA, Accessibility Audit & Launch",
        items: [
          "End-to-end tests: Playwright suite covering BLD swap, issuer onboarding, governance, and dashboard flows",
          "Accessibility audit: screen reader testing, keyboard navigation, colour contrast validation",
          "Performance audit: Lighthouse >= 90 across all core metrics on all key pages",
          "Analytics integration: on-chain swap events + off-chain funnel tracking (issuer conversion, swap volume)",
          "Final UAT with issuer and asset manager personas; all blocking issues resolved before launch",
        ],
      },
    },
  },
  devops: {
    label: "DevOps & Security",
    color: "#DC2626",
    glow: "rgba(220,38,38,0.35)",
    icon: "⬟",
    phases: {
      phase1: {
        title: "Infrastructure as Code & CI/CD",
        items: [
          "IaC: Terraform for all cloud resources (AWS/GCP); fully reproducible environment definitions",
          "Container orchestration: Kubernetes or ECS; service mesh for internal inter-service communication",
          "CI/CD pipeline: GitHub Actions — lint, test, build, deploy gates enforced on every PR",
          "Secrets management: HashiCorp Vault or AWS Secrets Manager; zero plaintext secrets in any repo",
        ],
      },
      phase2: {
        title: "Security Baseline, Observability & Protocol Hardening",
        items: [
          "Network segmentation: private VPC, WAF rules, DDoS protection (Cloudflare or AWS Shield Advanced)",
          "SAST/DAST: automated scans on every build pipeline run; Snyk dependency vulnerability scanning",
          "Oracle/keeper node hardening: host-based IDS, anomaly alerting, automatic isolation on breach detection",
          "Hot wallet security: HSM-backed signing, spend limits, multi-party approval for large transactions",
          "Backup policy: encrypted daily snapshots, cross-region replication, monthly restore tests",
          "Centralised logging: ELK stack or Datadog; structured logs from all services",
          "Distributed tracing: OpenTelemetry across backend, oracle, and keeper services",
          "Incident response playbook: severity tiers, escalation paths, BLD depeg runbook, post-mortem template",
          "Penetration test: external red-team engagement on all public-facing BOUND surfaces",
        ],
      },
      phase3: {
        title: "Production Readiness & Mainnet Infrastructure",
        items: [
          "Blue-green deployment pipeline: zero-downtime contract upgrades and backend releases validated",
          "SOC 2 readiness review: access controls, audit logging, and change management controls assessed",
          "Mainnet deployment checklist: key rotation, multi-sig ownership transfer, all monitoring and alerts live",
          "MICA Title II compliance infrastructure: reporting pipelines and data retention policies active",
          "Ongoing post-launch: monthly dependency updates, quarterly pen tests, live Immunefi bug bounty",
        ],
      },
    },
  },
};

const LAYER_KEYS = Object.keys(LAYERS) as (keyof typeof LAYERS)[];
type PhaseId = keyof typeof LAYERS.smartContract.phases;

const ROADMAP_DOCX_PATH = "/BOUND_Protocol_Technical_Roadmap.docx";
const ROADMAP_DOCX_FILENAME = "BOUND_Protocol_Technical_Roadmap.docx";

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState<PhaseId>("phase1");
  const [activeLayer, setActiveLayer] = useState<keyof typeof LAYERS | null>(null);

  const activePhaseMeta = PHASES.find((p) => p.id === activePhase);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090F",
      color: "#E8E4FF",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      padding: "0",
      margin: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 40px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <img
              src="/favicon.png"
              alt="BOUND Protocol"
              width={36}
              height={36}
              style={{ display: "block", flexShrink: 0 }}
              draggable={false}
            />
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.15em", color: "#E8E4FF" }}>
              BOUND
            </span>
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#7C3AED", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
            BOUND Protocol · Engineering Technical Roadmap
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Instant Liquidity for Real-World Assets
          </h1>
          <div style={{ marginTop: "6px", color: "#6B7280", fontSize: "13px" }}>
            4 Layers · 3 Phases · 18–25 Weeks to Mainnet
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          <a
            href={ROADMAP_DOCX_PATH}
            download={ROADMAP_DOCX_FILENAME}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(124,58,237,0.45)",
              background: "rgba(124,58,237,0.14)",
              color: "#E8E4FF",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8M8 10l3-3M8 10L5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Download Roadmap (.docx)
          </a>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {LAYER_KEYS.map(k => (
            <button
              key={k}
              onClick={() => setActiveLayer(activeLayer === k ? null : k)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: `1px solid ${activeLayer === k ? LAYERS[k].color : "rgba(255,255,255,0.1)"}`,
                background: activeLayer === k ? `${LAYERS[k].color}22` : "transparent",
                color: activeLayer === k ? LAYERS[k].color : "#9CA3AF",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {LAYERS[k].icon} {LAYERS[k].label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Phase Selector */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id as PhaseId)}
            style={{
              padding: "20px 24px",
              background: activePhase === p.id ? "rgba(124,58,237,0.1)" : "transparent",
              border: "none",
              borderBottom: activePhase === p.id ? "2px solid #7C3AED" : "2px solid transparent",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
              color: activePhase === p.id ? "#E8E4FF" : "#6B7280",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: activePhase === p.id ? "#7C3AED" : "#4B5563", marginBottom: "4px", fontWeight: 700 }}>
              {p.label} · {p.duration}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3 }}>{p.title}</div>
          </button>
        ))}
      </div>

      {/* Phase exit gate */}
      {activePhaseMeta?.exitGate && (
        <div style={{
          margin: "24px 32px 0",
          padding: "14px 18px",
          background: "rgba(124,58,237,0.05)",
          border: "1px solid rgba(124,58,237,0.14)",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#9CA3AF",
          lineHeight: 1.6,
        }}>
          <span style={{ color: "#7C3AED", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: "8px" }}>
            Exit Gate
          </span>
          {activePhaseMeta.exitGate}
        </div>
      )}

      {/* Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1px",
        background: "rgba(255,255,255,0.05)",
        margin: "24px 32px 32px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        {LAYER_KEYS.filter(k => !activeLayer || k === activeLayer).map(k => {
          const L = LAYERS[k];
          const content = L.phases[activePhase];
          return (
            <div
              key={k}
              style={{
                background: "#0D0D16",
                padding: "28px",
              }}
            >
              {/* Layer header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{
                  fontSize: "20px",
                  color: L.color,
                  filter: `drop-shadow(0 0 8px ${L.glow})`,
                }}>
                  {L.icon}
                </span>
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: L.color, fontWeight: 700 }}>
                    {L.label}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#E8E4FF", lineHeight: 1.2, marginTop: "2px" }}>
                    {content.title}
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {content.items.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{
                      flexShrink: 0,
                      marginTop: "4px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: L.color,
                      boxShadow: `0 0 6px ${L.glow}`,
                    }} />
                    <span style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: "1.6" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Phase tag */}
              <div style={{
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: `1px solid ${L.color}22`,
                fontSize: "11px",
                color: L.color,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}>
                {activePhaseMeta?.duration}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guiding principles */}
      <div style={{
        margin: "0 32px 40px",
        padding: "20px 24px",
        background: "rgba(124,58,237,0.06)",
        border: "1px solid rgba(124,58,237,0.18)",
        borderRadius: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
      }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7C3AED", fontWeight: 700, marginBottom: "6px" }}>Decentralisation by Default</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            All normal BOUND operations are permissionless. Admin keys are multi-sig gated and scope-limited to emergency market suspension and haircut parameter bounds only. Emergency controls must self-expire or require community ratification via timelock.
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0891B2", fontWeight: 700, marginBottom: "6px" }}>Audit Gate is Non-Negotiable</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            No mainnet deployment until Phase 3 audit sign-off. Any contract modification from competition findings triggers a targeted re-audit of affected modules. The audit window cannot be compressed below 6 weeks without dropping the public competition round.
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#059669", fontWeight: 700, marginBottom: "6px" }}>SEO from Day One</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            Frontend SEO is an engineering deliverable from Phase 1. The target is for BOUND to rank as the primary result for &apos;RWA instant liquidity&apos;, &apos;instant RWA exit&apos;, and &apos;BLD token&apos; before mainnet launch.
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#DC2626", fontWeight: 700, marginBottom: "6px" }}>MICA Compliance from Architecture</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            The BOUND smart contract and backend architecture is designed around MICA Title II utility-type classification from day one — not retrofitted. Compliance reporting pipelines, data retention, and issuer obligation tracking are first-class engineering concerns.
          </div>
        </div>
      </div>
    </div>
  );
}
