import { useState } from "react";

type PhaseId = 1 | 2 | 3;

type Milestone = {
  id: string;
  week: string;
  weekRange: string;
  phase: PhaseId;
  tag: string;
  title: string;
  summary: string;
  deliverables: string[];
  value: string;
};

const EXISTING_ASSETS = [
  {
    label: "APSS System",
    detail: "BLD stablecoin and liquidity pool — deployed and operational",
  },
  {
    label: "BLD Token",
    detail: "Existing stablecoin infrastructure retained as settlement asset",
  },
  {
    label: "Liquidity Pool",
    detail: "Core pool deployed; requires RWA instant-exit extensions",
  },
];

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    week: "Week 2",
    weekRange: "Wks 1–2",
    phase: 1,
    tag: "Foundation",
    title: "RWA Architecture Blueprint Locked",
    summary:
      "The RWA migration specification is finalised. Existing APSS contracts are mapped against target architecture; net-new modules are fully specified with no open design decisions.",
    deliverables: [
      "APSS baseline documented — current BLD stablecoin and liquidity pool behaviour catalogued and mapped",
      "RWA eligibility framework defined — qualifying asset classes, onboarding criteria, and collateral rules",
      "Haircut model specified — instant-exit pricing logic, parameter bounds, and oracle dependencies",
      "Migration path agreed — upgrade strategy for APSS contracts without disrupting live BLD markets",
      "Governance and delivery cadence live — decision log, weekly syncs, escalation path",
    ],
    value:
      "Engineering proceeds against a locked target state. The pivot is explicit; rework is minimised.",
  },
  {
    id: "m2",
    week: "Week 4",
    weekRange: "Wks 3–4",
    phase: 1,
    tag: "Foundation",
    title: "Core Contracts Aligned to RWA Architecture",
    summary:
      "APSS contracts are extended and new RWA modules are implemented. BLD and the liquidity pool are refactored for RWA instant exits; registry and governance modules are built and unit-tested.",
    deliverables: [
      "BLD token aligned — stablecoin accounting extended for RWA collateral and settlement flows",
      "Liquidity pool extended — instant-exit swap path, reserve tracking, background settlement queue",
      "RWA registry contract built — onboarding, eligibility enforcement, haircut assignment on-chain",
      "Governance module extended — proposals, timelock, emergency pause integrated with RWA permissions",
      "Admin controls scoped — multi-sig emergency levers only; routine operations permissionless",
    ],
    value:
      "The deployed APSS foundation is preserved while the full RWA stack is assembled around it.",
  },
  {
    id: "m3",
    week: "Week 6",
    weekRange: "Wks 5–6",
    phase: 1,
    tag: "Foundation",
    title: "Infrastructure & Platform Readiness",
    summary:
      "Cloud infrastructure, CI/CD, and application platform are extended for RWA workloads. Teams ship against the new architecture without provisioning debt.",
    deliverables: [
      "Environment parity — dev, staging, and testnet reproducible; APSS and RWA stacks deployable on demand",
      "CI/CD pipeline extended — contract migration tests, integration gates, and safe deployment automation",
      "Design system and app shell updated — RWA flows, issuer surfaces, and protocol branding consistent",
      "Observability baseline — logging, metrics, and alerting wired for BLD reserve and pool health",
      "SEO and metadata foundations — search and social previews reflect RWA positioning",
    ],
    value:
      "Phase 2 begins with operational infrastructure, not setup. The pivot ships on a proven platform.",
  },
  {
    id: "m4",
    week: "Week 9",
    weekRange: "Wks 7–9",
    phase: 2,
    tag: "Build",
    title: "Oracle Engine Operational",
    summary:
      "The automated pricing and settlement layer is live. BOUND receives real-time RWA valuations and executes haircut and settlement logic without manual intervention.",
    deliverables: [
      "Real-time NAV feeds connected — live pricing for all listed RWAs with freshness guards",
      "Haircut engine automated — discount rates update from oracle data without manual intervention",
      "Background settlement processor running — queued redemptions execute autonomously",
      "Failover and redundancy validated — oracle continuity through RPC outages and stale feeds",
      "Issuer obligation tracker active — missed reporting deadlines flagged and suspension workflows triggered",
    ],
    value:
      "RWA markets price and settle programmatically. The protocol no longer depends on manual operations.",
  },
  {
    id: "m5",
    week: "Week 11",
    weekRange: "Wks 10–11",
    phase: 2,
    tag: "Build",
    title: "Instant Exit Swap Live on Testnet",
    summary:
      "End-to-end RWA-to-BLD instant exit is demonstrable on testnet. Existing BLD liquidity supports the new swap path.",
    deliverables: [
      "Instant exit interface complete — asset selection, haircut preview, and execution against extended pool",
      "Wallet connectivity verified — MetaMask, WalletConnect, and hardware wallet flows production-ready",
      "Settlement status tracking live — holders follow background redemption progress in real time",
      "Error handling standardised — failure modes surface clear, actionable messages",
      "Integration tests passing — APSS pool extensions and RWA registry interact correctly under load",
    ],
    value:
      "The core product promise is demonstrable: illiquid RWA holders receive BLD stablecoin instantly.",
  },
  {
    id: "m6",
    week: "Week 13",
    weekRange: "Wks 12–13",
    phase: 2,
    tag: "Build",
    title: "Issuer Onboarding Platform Complete",
    summary:
      "RWA issuers apply, are vetted, pay fees, and launch markets through a self-serve platform integrated with on-chain registry logic.",
    deliverables: [
      "Issuer application workflow — guided entity and asset documentation with eligibility pre-checks",
      "On-chain fee collection — vetting and market-enabling fees without manual invoicing",
      "Issuer dashboard live — NAV submission, obligation calendar, market status, and compliance tracking",
      "Eligibility engine — real-time feedback on asset qualification against protocol rules",
      "Audit obligation tracker — quarterly reporting requirements visible and enforceable",
    ],
    value:
      "Partner onboarding scales without proportional operational headcount.",
  },
  {
    id: "m7",
    week: "Week 15",
    weekRange: "Wks 14–15",
    phase: 2,
    tag: "Build",
    title: "Data & Analytics Platform Live",
    summary:
      "Protocol data — markets, BLD reserves, settlements, governance — is exposed via APIs and operational dashboards.",
    deliverables: [
      "GraphQL API live — unified query surface for markets, registry, and settlement state",
      "REST API complete — issuer and asset-manager operations fully covered",
      "Protocol analytics dashboard — BLD reserve health, swap volume, active markets, settlement queue depth",
      "Public transparency endpoint — on-chain and indexed data for holders and researchers",
      "Partner documentation published — OpenAPI and GraphQL Playground for integrators",
    ],
    value:
      "Institutional stakeholders, issuers, and developers access consistent, auditable protocol data.",
  },
  {
    id: "m8",
    week: "Week 16",
    weekRange: "Wk 16",
    phase: 2,
    tag: "Build",
    title: "Full Integration & Pre-Audit Hardening",
    summary:
      "All layers — extended APSS contracts, RWA modules, backend, and frontend — are integrated, security-tested, and ready for external audit.",
    deliverables: [
      "End-to-end testnet validation — issuer onboarding through holder exit and settlement completion",
      "Penetration test completed — external red team on all public surfaces",
      "Static analysis clean — zero high or critical findings across smart contract scope",
      "Attack scenario suite complete — flash-loan, governance, and oracle manipulation vectors tested",
      "Infrastructure security baseline verified — WAF, DDoS protection, network segmentation",
    ],
    value:
      "The RWA migration enters audit with fewer unknowns, reducing remediation cost and timeline risk.",
  },
  {
    id: "m9",
    week: "Week 20",
    weekRange: "Wks 17–20",
    phase: 3,
    tag: "Launch",
    title: "First-Party Security Audit Complete",
    summary:
      "A tier-one firm audits the full RWA scope — APSS extensions and net-new modules. All material findings are resolved.",
    deliverables: [
      "Full-scope audit by Trail of Bits, Certora, or OpenZeppelin — migration path and new contracts in scope",
      "Critical and high findings remediated and re-verified",
      "Audit report published — transparent disclosure for issuers, investors, and partners",
      "Re-test sign-off obtained from auditing firm",
      "Protocol listed in recognised security registries where applicable",
    ],
    value:
      "Institutional partners receive the security assurance required before allocating RWA capital.",
  },
  {
    id: "m10",
    week: "Week 23",
    weekRange: "Wks 21–23",
    phase: 3,
    tag: "Launch",
    title: "Public Security Competition Closed",
    summary:
      "Independent researchers stress-test the RWA migration under competitive review. Valid findings are remediated before launch.",
    deliverables: [
      "Code4rena or Sherlock competition completed — broad coverage of BLD mechanics and RWA registry",
      "Competition findings triaged and remediated",
      "Targeted re-audit of modified modules completed",
      "Results published publicly",
      "Immunefi bug bounty configured for mainnet launch",
    ],
    value:
      "Community-scale review complements the firm audit. Confidence is earned, not asserted.",
  },
  {
    id: "m11",
    week: "Week 24",
    weekRange: "Wk 24",
    phase: 3,
    tag: "Launch",
    title: "Production Readiness Verified",
    summary:
      "Load, disaster recovery, and operational runbooks are validated. The RWA system meets launch-grade reliability targets.",
    deliverables: [
      "Load test passed — 10× projected peak swap volume without degradation",
      "Disaster recovery drill completed — oracle failure, database outage, and RPC loss recovered cleanly",
      "BLD peg monitoring and alerting live — anomalies surfaced within seconds",
      "On-call runbooks tested — incident response executable by any qualified engineer",
      "Zero-downtime upgrade pipeline validated — contract migrations deploy safely",
    ],
    value:
      "Real capital enters a system proven under operational stress, not best-case conditions.",
  },
  {
    id: "m12",
    week: "Week 25",
    weekRange: "Wk 25",
    phase: 3,
    tag: "Launch",
    title: "RWA Markets Live on Mainnet",
    summary:
      "The RWA architecture goes live. Existing BLD stablecoin and extended liquidity pool support instant exits for listed RWAs.",
    deliverables: [
      "RWA contract upgrades deployed from audited commit hash — APSS baseline preserved where unchanged",
      "Multi-sig ownership confirmed — no single key controls protocol functions",
      "First RWA markets enabled — issuer partners live at launch",
      "BLD liquidity maintained — stablecoin and pool extensions operational for instant exits",
      "Immunefi bug bounty live — continuous post-launch security coverage",
      "Launch communications distributed — partners, community, and public announcement",
    ],
    value:
      "BOUND delivers on its mission: institutional RWA liquidity on-chain, built on a deployed BLD and pool foundation.",
  },
];

const PHASES = [
  {
    id: 1 as PhaseId,
    label: "Phase 1",
    title: "Foundation",
    weeks: "Weeks 1–6",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    scope:
      "APSS baseline mapped · RWA architecture locked · core contracts aligned · platform ready",
  },
  {
    id: 2 as PhaseId,
    label: "Phase 2",
    title: "Build",
    weeks: "Weeks 7–16",
    color: "#0891B2",
    bg: "#E0F2FE",
    border: "#7DD3FC",
    scope: "Oracle automation · instant exit UX · issuer platform · APIs · pre-audit hardening",
  },
  {
    id: 3 as PhaseId,
    label: "Phase 3",
    title: "Audit & Launch",
    weeks: "Weeks 17–25",
    color: "#DC4C30",
    bg: "#FEF2F2",
    border: "#FECACA",
    scope: "External audit · public competition · production readiness · RWA mainnet launch",
  },
];

const PHASE_COLORS: Record<
  PhaseId,
  { dot: string; light: string; tag: string; tagBg: string }
> = {
  1: { dot: "#7C3AED", light: "#EDE9FE", tag: "#6D28D9", tagBg: "#EDE9FE" },
  2: { dot: "#0891B2", light: "#E0F2FE", tag: "#0E7490", tagBg: "#E0F2FE" },
  3: { dot: "#DC4C30", light: "#FEE2E2", tag: "#B91C1C", tagBg: "#FEE2E2" },
};

const MILESTONE_DOCX_PATH = "/BOUND_RWA_Milestone_Roadmap.docx";
const MILESTONE_DOCX_FILENAME = "BOUND_RWA_Milestone_Roadmap.docx";

type BudgetLine = {
  category: string;
  amount: number;
  detail: string;
  milestones: string;
};

type WorkforceLine = {
  role: string;
  duration: string;
  amount: number;
};

const DEVELOPMENT_BUDGET = {
  total: 320_000,
  title: "Development budget — mainnet launch",
  summary:
    "Fixed $320,000 development allocation through Milestone 12 (RWA markets live on mainnet), built on deployed APSS infrastructure. Covers engineering, infrastructure, and launch execution — audit and competition fees excluded.",
  timeline: "22 weeks",
  team: "~3.5 FTE blended team",
  deliverable:
    "RWA contract upgrades deployed, instant exit live, issuer onboarding operational, production pipelines verified, first markets enabled on mainnet.",
  workstreams: [
    {
      category: "Smart contracts",
      amount: 90_000,
      detail:
        "APSS contract extensions, RWA registry, liquidity pool upgrade path, governance alignment, migration scripts, unit and integration tests",
      milestones: "M1 – M2, M8",
    },
    {
      category: "Backend & oracle automation",
      amount: 62_000,
      detail:
        "NAV feed integration, haircut engine, background settlement processor, issuer obligation tracker, core REST endpoints",
      milestones: "M4, M7",
    },
    {
      category: "Frontend & product UI",
      amount: 52_000,
      detail:
        "Instant exit swap interface, wallet flows, settlement tracker, issuer onboarding surfaces, protocol analytics views",
      milestones: "M3, M5, M6",
    },
    {
      category: "DevOps & infrastructure",
      amount: 28_000,
      detail:
        "Cloud environments, CI/CD, RPC and indexing, observability, staging and production pipelines, deployment automation",
      milestones: "M3, M11",
    },
    {
      category: "Architecture & program management",
      amount: 32_000,
      detail:
        "APSS migration specification, technical leadership, sprint coordination, delivery governance across all phases",
      milestones: "M1 – M12",
    },
    {
      category: "QA & integration testing",
      amount: 18_000,
      detail:
        "End-to-end testnet validation, regression suite, pre-mainnet integration checks, launch readiness verification",
      milestones: "M5, M8, M11",
    },
    {
      category: "Mainnet launch engineering",
      amount: 26_000,
      detail:
        "Contract upgrade deployment, multi-sig handover support, first-market enablement, launch runbooks and cutover execution",
      milestones: "M11 – M12",
    },
    {
      category: "Contingency reserve",
      amount: 12_000,
      detail:
        "Buffer for APSS migration surprises, oracle integration rework, and scope adjustments within the fixed budget",
      milestones: "All phases",
    },
  ] satisfies BudgetLine[],
  workforce: [
    { role: "Senior smart contract engineer", duration: "18 weeks · full-time", amount: 81_000 },
    { role: "Backend / oracle engineer", duration: "16 weeks · full-time", amount: 56_000 },
    { role: "Frontend engineer", duration: "14 weeks · full-time", amount: 45_500 },
    { role: "DevOps engineer", duration: "8 weeks · fractional", amount: 24_000 },
    { role: "Protocol architect / PM", duration: "12 weeks · fractional", amount: 36_000 },
    { role: "QA engineer", duration: "8 weeks · fractional", amount: 16_000 },
    { role: "Infrastructure & tooling", duration: "22 weeks · ongoing", amount: 28_000 },
    { role: "Integration & launch overhead", duration: "Weeks 17–22", amount: 21_500 },
    { role: "Contingency reserve", duration: "All phases", amount: 12_000 },
  ] satisfies WorkforceLine[],
  byPhase: [
    { phase: "Phase 1 — Foundation", weeks: "Weeks 1–6", amount: 78_000, share: "24%" },
    { phase: "Phase 2 — Build", weeks: "Weeks 7–16", amount: 154_000, share: "48%" },
    { phase: "Phase 3 — Launch", weeks: "Weeks 17–22", amount: 88_000, share: "28%" },
  ],
  exclusions: [
    "External smart contract audit (Trail of Bits, Certora, OpenZeppelin, etc.)",
    "Public security competition (Code4rena, Sherlock)",
    "Targeted re-audit fees after competition findings",
    "Immunefi bug bounty capital and escrow",
    "Legal and securities compliance advisory",
  ],
};

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function DevelopmentBudgetCard({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ margin: "24px 40px 0" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{
          padding: "22px 28px",
          borderRadius: "10px",
          cursor: "pointer",
          border: expanded
            ? "1.5px solid #7C3AED"
            : "1px solid var(--color-border-tertiary, rgba(0,0,0,0.08))",
          background: expanded ? "#F5F3FF" : "var(--color-background-primary, #fff)",
          transition: "all 0.15s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7C3AED",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              {DEVELOPMENT_BUDGET.title}
            </div>
            <div
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 600,
                color: "var(--color-text-primary, #111)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {formatUsd(DEVELOPMENT_BUDGET.total)}
            </div>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13px",
                color: "var(--color-text-secondary, #6B7280)",
                lineHeight: 1.55,
                maxWidth: "560px",
              }}
            >
              {DEVELOPMENT_BUDGET.summary}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--color-text-secondary, #9CA3AF)",
                marginBottom: "8px",
              }}
            >
              {expanded ? "Collapse breakdown" : "View breakdown"}
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                fontSize: "12px",
                color: "var(--color-text-secondary, #6B7280)",
              }}
            >
              <span>
                <strong style={{ color: "#111" }}>{DEVELOPMENT_BUDGET.timeline}</strong> timeline
              </span>
              <span>
                <strong style={{ color: "#111" }}>{DEVELOPMENT_BUDGET.team}</strong>
              </span>
            </div>
          </div>
        </div>

        {expanded && (
          <div
            style={{
              marginTop: "22px",
              paddingTop: "22px",
              borderTop: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#fff",
                border: "1px solid rgba(124,58,237,0.12)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6D28D9",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Mainnet deliverable
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-text-primary, #111)",
                  lineHeight: 1.6,
                }}
              >
                {DEVELOPMENT_BUDGET.deliverable}
              </p>
            </div>

            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6D28D9",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Workstream allocation
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
              }}
            >
              {DEVELOPMENT_BUDGET.workstreams.map((line, i) => {
                const pct = Math.round((line.amount / DEVELOPMENT_BUDGET.total) * 100);
                return (
                  <div
                    key={line.category}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 1fr) 100px 1fr",
                      gap: "16px",
                      padding: "14px 16px",
                      background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--color-text-primary, #111)",
                        }}
                      >
                        {line.category}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#7C3AED",
                          fontWeight: 600,
                          marginTop: "3px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {line.milestones}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--color-text-primary, #111)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {formatUsd(line.amount)}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--color-text-secondary, #9CA3AF)",
                          marginTop: "2px",
                        }}
                      >
                        {pct}%
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary, #6B7280)",
                        lineHeight: 1.55,
                      }}
                    >
                      {line.detail}
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 1fr) 100px 1fr",
                  gap: "16px",
                  padding: "14px 16px",
                  background: "#EDE9FE",
                  alignItems: "center",
                  borderTop: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#6D28D9" }}>
                  Total development
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#6D28D9",
                    textAlign: "right",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatUsd(DEVELOPMENT_BUDGET.total)}
                </div>
                <div style={{ fontSize: "12px", color: "#6D28D9", fontWeight: 500 }}>
                  Through RWA mainnet launch (M12)
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6D28D9",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Workforce allocation
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
                marginBottom: "20px",
              }}
            >
              {DEVELOPMENT_BUDGET.workforce.map((w, i) => (
                <div
                  key={w.role}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(160px, 1fr) 140px 90px",
                    gap: "16px",
                    padding: "12px 16px",
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--color-text-primary, #111)",
                    }}
                  >
                    {w.role}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-secondary, #6B7280)",
                    }}
                  >
                    {w.duration}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--color-text-primary, #111)",
                      textAlign: "right",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatUsd(w.amount)}
                  </div>
                </div>
              ))}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px, 1fr) 140px 90px",
                  gap: "16px",
                  padding: "12px 16px",
                  background: "#EDE9FE",
                  alignItems: "center",
                  borderTop: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#6D28D9" }}>
                  Total
                </div>
                <div />
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#6D28D9",
                    textAlign: "right",
                  }}
                >
                  {formatUsd(DEVELOPMENT_BUDGET.total)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {DEVELOPMENT_BUDGET.byPhase.map((p) => (
                <div
                  key={p.phase}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: "#fff",
                    border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-text-secondary, #9CA3AF)",
                      fontWeight: 600,
                    }}
                  >
                    {p.weeks}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--color-text-primary, #111)",
                      marginTop: "4px",
                    }}
                  >
                    {p.phase}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#7C3AED",
                      marginTop: "6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatUsd(p.amount)}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-secondary, #9CA3AF)",
                      marginTop: "2px",
                    }}
                  >
                    {p.share} of budget
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.02)",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-secondary, #9CA3AF)",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Excluded from this budget
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 20px",
                }}
              >
                {DEVELOPMENT_BUDGET.exclusions.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary, #6B7280)",
                      lineHeight: 1.5,
                    }}
                  >
                    · {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default function MilestoneRoadmap() {
  const [active, setActive] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState(0);
  const [budgetExpanded, setBudgetExpanded] = useState(false);

  const filtered =
    filterPhase === 0
      ? MILESTONES
      : MILESTONES.filter((m) => m.phase === filterPhase);

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        color: "var(--color-text-primary, #111)",
        minHeight: "100vh",
        background: "var(--color-background-primary, #fff)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "40px 40px 28px",
          borderBottom: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.08))",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7C3AED",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          BOUND Protocol · Milestone Roadmap
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ maxWidth: "640px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px, 3.5vw, 32px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              APSS to RWA Architecture Migration
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "14px",
                color: "var(--color-text-secondary, #6B7280)",
                lineHeight: 1.6,
              }}
            >
              Twelve gated milestones across three phases · 22-week development ·{" "}
              {formatUsd(DEVELOPMENT_BUDGET.total)} to mainnet launch
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
            }}
          >
            <a
              href={MILESTONE_DOCX_PATH}
              download={MILESTONE_DOCX_FILENAME}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(124,58,237,0.35)",
                background: "#F5F3FF",
                color: "#6D28D9",
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
                <path
                  d="M8 2v8M8 10l3-3M8 10L5 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 12h10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Download Milestone Roadmap (.docx)
            </a>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[
              { id: 0, label: "All phases" },
              ...PHASES.map((p) => ({ id: p.id, label: p.title })),
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterPhase(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  border:
                    filterPhase === f.id
                      ? `1.5px solid ${f.id === 0 ? "#7C3AED" : PHASES[f.id - 1]?.color}`
                      : "1px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
                  background:
                    filterPhase === f.id
                      ? f.id === 0
                        ? "#F5F3FF"
                        : PHASES[f.id - 1]?.bg
                      : "transparent",
                  color:
                    filterPhase === f.id
                      ? f.id === 0
                        ? "#6D28D9"
                        : PHASES[f.id - 1]?.color
                      : "var(--color-text-secondary, #6B7280)",
                }}
              >
                {f.label}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Existing APSS context */}
      <div
        style={{
          margin: "24px 40px 0",
          padding: "20px 24px",
          borderRadius: "10px",
          background: "#FAFAFA",
          border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.08))",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#374151",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Existing infrastructure
        </div>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "13px",
            color: "var(--color-text-secondary, #6B7280)",
            lineHeight: 1.65,
            maxWidth: "820px",
          }}
        >
          BOUND Protocol operates an existing APSS system with the BLD stablecoin and
          liquidity pool already deployed. This roadmap covers the architectural pivot to
          RWA instant liquidity — extending proven infrastructure while building net-new
          registry, oracle, and issuer modules required by the new design.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {EXISTING_ASSETS.map((asset) => (
            <div
              key={asset.label}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#fff",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.06))",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-text-primary, #111)",
                  marginBottom: "4px",
                }}
              >
                {asset.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-secondary, #6B7280)",
                  lineHeight: 1.5,
                }}
              >
                {asset.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DevelopmentBudgetCard
        expanded={budgetExpanded}
        onToggle={() => setBudgetExpanded((v) => !v)}
      />

      {/* Phase banners */}
      {filterPhase === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--color-border-tertiary, rgba(0,0,0,0.07))",
            margin: "24px 40px 0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {PHASES.map((p) => (
            <div key={p.id} style={{ background: p.bg, padding: "18px 22px" }}>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: p.color,
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {p.label} · {p.weeks}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: p.color }}>
                {p.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary, #6B7280)",
                  marginTop: "6px",
                  lineHeight: 1.5,
                }}
              >
                {p.scope}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div style={{ margin: "28px 0 0" }}>
        <div style={{ padding: "0 40px 40px", overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "88px 1fr",
              gap: "0",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary, #9CA3AF)",
                fontWeight: 600,
                paddingLeft: "8px",
              }}
            >
              Timeline
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary, #9CA3AF)",
                fontWeight: 600,
                paddingLeft: "20px",
              }}
            >
              Milestone
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "127px",
                top: "8px",
                bottom: "8px",
                width: "1.5px",
                background: "var(--color-border-tertiary, rgba(0,0,0,0.08))",
                pointerEvents: "none",
              }}
            />

            {filtered.map((m) => {
              const col = PHASE_COLORS[m.phase];
              const isActive = active === m.id;

              return (
                <div
                  key={m.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "88px 1fr",
                    gap: "0",
                    marginBottom: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      paddingTop: "16px",
                      paddingRight: "14px",
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: isActive
                          ? col.dot
                          : "var(--color-text-secondary, #9CA3AF)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {m.weekRange}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--color-text-secondary, #9CA3AF)",
                        marginTop: "2px",
                      }}
                    >
                      {m.week}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: "40px",
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "18px",
                      }}
                    >
                      <div
                        style={{
                          width: isActive ? "12px" : "9px",
                          height: isActive ? "12px" : "9px",
                          borderRadius: "50%",
                          background: col.dot,
                          border: isActive
                            ? `3px solid ${col.light}`
                            : "2.5px solid white",
                          boxSizing: "border-box",
                          outline: isActive ? `2px solid ${col.dot}` : "none",
                          transition: "all 0.15s",
                        }}
                      />
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActive(isActive ? null : m.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActive(isActive ? null : m.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "14px 18px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border: isActive
                          ? `1.5px solid ${col.dot}`
                          : "1px solid var(--color-border-tertiary, rgba(0,0,0,0.08))",
                        background: isActive
                          ? col.light
                          : "var(--color-background-primary, white)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "var(--color-text-primary, #111)",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {m.title}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: col.tagBg,
                              color: col.tag,
                            }}
                          >
                            {m.tag}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "var(--color-text-secondary, #9CA3AF)",
                            flexShrink: 0,
                            paddingTop: "2px",
                          }}
                        >
                          {isActive ? "Collapse" : "Expand"}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "13px",
                          color: "var(--color-text-secondary, #6B7280)",
                          lineHeight: 1.6,
                          maxWidth: "640px",
                        }}
                      >
                        {m.summary}
                      </p>

                      {isActive && (
                        <div
                          style={{
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: `1px solid ${col.dot}30`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: col.tag,
                              fontWeight: 700,
                              marginBottom: "10px",
                            }}
                          >
                            Deliverables
                          </div>
                          {m.deliverables.map((d, di) => (
                            <div
                              key={di}
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "7px",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  flexShrink: 0,
                                  marginTop: "6px",
                                  width: "5px",
                                  height: "5px",
                                  borderRadius: "50%",
                                  background: col.dot,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-text-primary, #111)",
                                  lineHeight: 1.6,
                                }}
                              >
                                {d}
                              </span>
                            </div>
                          ))}
                          <div
                            style={{
                              marginTop: "14px",
                              padding: "12px 14px",
                              borderRadius: "6px",
                              background: `${col.dot}12`,
                              borderLeft: `3px solid ${col.dot}`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: col.tag,
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Strategic outcome
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--color-text-primary, #111)",
                                lineHeight: 1.55,
                              }}
                            >
                              {m.value}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div
        style={{
          margin: "0 40px 48px",
          padding: "22px 28px",
          borderRadius: "10px",
          background: "var(--color-background-secondary, #F9FAFB)",
          border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.07))",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "24px",
        }}
      >
        {[
          { label: "Total milestones", value: "12", sub: "across 3 phases" },
          { label: "Development budget", value: formatUsd(DEVELOPMENT_BUDGET.total), sub: "through mainnet launch" },
          { label: "Existing foundation", value: "APSS", sub: "BLD + liquidity pool deployed" },
          { label: "Delivery timeline", value: "22 wks", sub: "development execution" },
          { label: "Audit rounds", value: "2", sub: "separate budget" },
          { label: "Launch gate", value: "M12", sub: "RWA markets on mainnet" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "var(--color-text-primary, #111)",
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--color-text-secondary, #6B7280)",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary, #9CA3AF)",
                marginTop: "3px",
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
