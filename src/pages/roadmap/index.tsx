import { useState } from "react";

const PHASES = [
  {
    id: "phase1",
    label: "Phase 1",
    title: "Foundation",
    duration: "Weeks 1–8",
    status: "current",
  },
  {
    id: "phase2",
    label: "Phase 2",
    title: "Automation & Data Layer",
    duration: "Weeks 9–18",
    status: "upcoming",
  },
  {
    id: "phase3",
    label: "Phase 3",
    title: "Interface & Distribution",
    duration: "Weeks 19–28",
    status: "upcoming",
  },
  {
    id: "phase4",
    label: "Phase 4",
    title: "Audit, Hardening & Launch",
    duration: "Weeks 29–36",
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
        title: "Protocol Core & Architecture",
        items: [
          "Design protocol architecture: data models, upgrade patterns (proxy/diamond), storage layout",
          "Core contract suite: asset registry, liquidity pools, RWA onboarding primitives",
          "Governance module: on-chain proposals, quorum, timelock, emergency pause — decentralised by default",
          "Admin role matrix: multi-sig gated emergency levers only; all normal ops permissionless",
          "Security constraints: access control, reentrancy guards, overflow checks, rate limits",
          "Unit tests: 100% branch coverage on core paths; fuzz tests for edge states",
        ],
      },
      phase2: {
        title: "Oracle Integration & Automation Hooks",
        items: [
          "Oracle interface contracts: price feeds, RWA valuation hooks, data freshness guards",
          "Automation trigger interfaces: Chainlink Automation / custom keeper ABI stubs",
          "Strategy execution contracts: asset manager callable vaults, rebalance logic, yield routing",
          "Integration tests: oracle manipulation scenarios, keeper failure modes, gas profiling",
        ],
      },
      phase3: {
        title: "Pre-Audit Hardening",
        items: [
          "Full scenario test suite: liquidation cascades, governance attacks, flash-loan vectors",
          "Static analysis: Slither, Aderyn, Mythril full passes — zero high/critical findings",
          "Formal invariant checks on core accounting logic",
          "Documentation: NatSpec complete, architecture diagrams, threat model",
        ],
      },
      phase4: {
        title: "External Audit & Competition",
        items: [
          "First-party audit: top-tier firm (Trail of Bits / Certora / OpenZeppelin)",
          "Public bug bounty / Code4rena / Sherlock competition post-fix",
          "Remediation sprint: triage, fix, re-test all findings",
          "Final audit sign-off; deploy to mainnet from audited commit hash",
        ],
      },
    },
  },
  backend: {
    label: "Backend & Oracle",
    color: "#0891B2",
    glow: "rgba(8,145,178,0.35)",
    icon: "⬡",
    phases: {
      phase1: {
        title: "System Design & Dev Environment",
        items: [
          "Backend mono-repo scaffold: service boundaries, shared types, CI skeleton",
          "Database schema: on-chain mirror tables, event log store, strategy state",
          "Oracle service scaffold: event listener, block-confirmation queue, retry logic",
          "Local devnet with mock contracts for integration testing",
        ],
      },
      phase2: {
        title: "Oracle Automation Engine",
        items: [
          "Keeper/Oracle service: monitors strategy conditions, triggers contract calls autonomously",
          "Asset manager automation layer: scheduled rebalances, threshold alerts, auto-compound",
          "Case-tracking engine: indexes on-chain events, derives protocol state, persists off-chain",
          "Redundancy & failover: multi-RPC failover, dead-letter queues, alerting (PagerDuty/OpsGenie)",
          "Signed transaction pipeline: HSM or KMS-backed hot wallet, nonce manager, gas oracle",
        ],
      },
      phase3: {
        title: "Data API & GraphQL Layer",
        items: [
          "REST API: authenticated endpoints for asset manager ops, strategy CRUD, health checks",
          "GraphQL API: schema for frontend — portfolio positions, historical yields, liquidity depth, governance",
          "Subgraph (The Graph): protocol events indexed for on-chain transparency and deep queries",
          "Rate limiting, API key management, CORS policy, OpenAPI spec",
          "Caching layer: Redis for hot query paths; CDN for static analytics snapshots",
        ],
      },
      phase4: {
        title: "Load Testing & SLA Hardening",
        items: [
          "Load tests: 10× projected peak traffic; identify bottlenecks",
          "Disaster recovery drill: RPC outage, DB failover, oracle downtime simulation",
          "Monitoring dashboards: Grafana + Prometheus; on-call runbooks",
          "API docs published: Swagger/GraphQL Playground for partner integrations",
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
        title: "Design System & Architecture",
        items: [
          "Design system: tokens (color, type, spacing), component library, accessibility baseline (WCAG AA)",
          "App scaffold: Next.js + TypeScript, wallet adapters (wagmi/viem), route architecture",
          "SEO foundation: metadata schema, Open Graph, structured data for RWA liquidity provider positioning",
          "Content strategy: keyword map targeting RWA, tokenised assets, on-chain liquidity",
        ],
      },
      phase2: {
        title: "Smart Contract Integration",
        items: [
          "Wallet connect flows: multi-chain support, session management, transaction UX",
          "Contract interaction layer: typed hooks for all protocol actions (deposit, withdraw, govern, delegate)",
          "Real-time state: WebSocket + event subscriptions for live position updates",
          "Error handling UX: human-readable revert messages, gas estimation warnings",
        ],
      },
      phase3: {
        title: "Data Integration & Full UX",
        items: [
          "REST API integration: strategy management UI for asset managers",
          "GraphQL integration: portfolio dashboards, analytics, governance views",
          "SEO execution: server-side rendering for key pages, sitemap, Core Web Vitals ≥ 90",
          "RWA onboarding flow: step-by-step wizard, document upload, liquidity preview",
          "Responsive design: mobile-first, progressive enhancement",
        ],
      },
      phase4: {
        title: "QA, Accessibility & Launch",
        items: [
          "End-to-end tests: Playwright suite covering all critical user journeys",
          "Accessibility audit: screen reader testing, keyboard navigation, colour contrast",
          "Performance audit: Lighthouse ≥ 90 across all metrics",
          "Analytics integration: on-chain + off-chain funnel tracking",
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
        title: "Infrastructure as Code",
        items: [
          "IaC: Terraform for cloud resources (AWS/GCP); reproducible environments",
          "Container orchestration: Kubernetes or ECS; service mesh for internal comms",
          "CI/CD pipeline: GitHub Actions — lint, test, build, deploy gating on all PRs",
          "Secrets management: Vault or AWS Secrets Manager; zero plaintext secrets in repos",
        ],
      },
      phase2: {
        title: "Security Baseline",
        items: [
          "Network segmentation: private VPC, WAF, DDoS protection (Cloudflare or AWS Shield)",
          "SAST/DAST: automated scans on every build; dependency vulnerability scanning (Snyk)",
          "Intrusion detection: host-based IDS on oracle/keeper nodes; anomaly alerting",
          "Backup policy: encrypted daily snapshots, cross-region replication, tested restores",
        ],
      },
      phase3: {
        title: "Observability & Hardening",
        items: [
          "Centralised logging: ELK or Datadog; structured logs from all services",
          "Distributed tracing: OpenTelemetry across backend + oracle services",
          "Incident response playbook: severity tiers, escalation paths, post-mortem template",
          "Penetration test: external firm red-team on all public-facing surfaces",
        ],
      },
      phase4: {
        title: "Production Readiness",
        items: [
          "Blue-green deploy pipeline for zero-downtime contract upgrades and backend releases",
          "SOC 2 readiness review (if applicable): access controls, audit logging, change management",
          "Mainnet deployment checklist: key rotation, multi-sig transfer, monitoring live",
          "Ongoing: monthly dependency updates, quarterly penetration tests, bug bounty programme",
        ],
      },
    },
  },
};

const LAYER_KEYS = Object.keys(LAYERS);

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState("phase1");
  const [activeLayer, setActiveLayer] = useState(null);

  const layer = activeLayer ? LAYERS[activeLayer] : null;

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
          <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#7C3AED", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
            Web3 Protocol · Technical Roadmap
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            RWA Liquidity Protocol
          </h1>
          <div style={{ marginTop: "6px", color: "#6B7280", fontSize: "13px" }}>
            4 Layers · 4 Phases · ~36 Weeks to Mainnet
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

      {/* Phase Selector */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            style={{
              padding: "20px 24px",
              background: activePhase === p.id ? "rgba(124,58,237,0.1)" : "transparent",
              border: "none",
              borderBottom: activePhase === p.id ? "2px solid #7C3AED" : "2px solid transparent",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
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

      {/* Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1px",
        background: "rgba(255,255,255,0.05)",
        margin: "32px",
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
                {PHASES.find(p => p.id === activePhase)?.duration}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Protocol note */}
      <div style={{
        margin: "0 32px 40px",
        padding: "20px 24px",
        background: "rgba(124,58,237,0.06)",
        border: "1px solid rgba(124,58,237,0.18)",
        borderRadius: "10px",
        display: "flex",
        gap: "32px",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#7C3AED", fontWeight: 700, marginBottom: "6px" }}>Decentralisation Principle</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            All normal protocol operations are permissionless. Admin/governance keys are multi-sig gated and scope-limited to emergency pause and parameter bounds only. Emergency controls self-expire or require community ratification within a timelock window.
          </div>
        </div>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0891B2", fontWeight: 700, marginBottom: "6px" }}>Audit Gate</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            No mainnet deploy until Phase 4 audit sign-off. All contract modifications after competition findings trigger a re-audit of affected modules before going live.
          </div>
        </div>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#059669", fontWeight: 700, marginBottom: "6px" }}>RWA SEO Priority</div>
          <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
            Frontend SEO is built from Phase 1, not bolted on at launch. Goal: rank as the first result for RWA liquidity provider before mainnet goes live.
          </div>
        </div>
      </div>
    </div>
  );
}