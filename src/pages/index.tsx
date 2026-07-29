import React, { useEffect, useRef } from "react";

const colors = {
  50:  "#F1EDE2",
  100: "#EFECE2",
  200: "#B9D4C4",
  300: "#8A9A8C",
  400: "#5F6258",
  500: "#1B4A38",
  600: "#163D2E",
  700: "#122E23",
  800: "#1E211C",
  900: "#141710",
};

export default function Home() {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = document.querySelectorAll<HTMLElement>(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.8s ease-out forwards";
      }, delay);
    });

    const gradient = gradientRef.current;
    function onMouseMove(e: MouseEvent) {
      if (gradient) {
        gradient.style.left = e.clientX - 192 + "px";
        gradient.style.top = e.clientY - 192 + "px";
        gradient.style.opacity = "1";
      }
    }
    function onMouseLeave() {
      if (gradient) gradient.style.opacity = "0";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.style.textShadow = "0 0 20px rgba(185,212,196,0.5)";
      });
      word.addEventListener("mouseleave", () => {
        word.style.textShadow = "none";
      });
    });

    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      ripple.style.width = "4px";
      ripple.style.height = "4px";
      ripple.style.background = "rgba(185,212,196,0.6)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      ripple.style.animation = "pulse-glow 1s ease-out forwards";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }
    document.addEventListener("click", onClick);

    let scrolled = false;
    function onScroll() {
      if (!scrolled) {
        scrolled = true;
        document.querySelectorAll<HTMLElement>(".floating-element").forEach((el, index) => {
          setTimeout(() => {
            el.style.animationPlayState = "running";
          }, index * 200);
        });
      }
    }
    window.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#141710] via-[#0e1110] to-[#1a2018] text-[#EFECE2] font-primary relative w-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(185,212,196,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.5s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "1s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "1.5s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "2s" }} />
        <line x1="50%" y1="0" x2="50%" y2="100%" className="grid-line" style={{ animationDelay: "2.5s", opacity: 0.05 }} />
        <line x1="0" y1="50%" x2="100%" y2="50%" className="grid-line" style={{ animationDelay: "3s", opacity: 0.05 }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "3s" }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "3.2s" }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "3.4s" }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "3.6s" }} />
        <circle cx="50%" cy="50%" r="1.5" className="detail-dot" style={{ animationDelay: "4s" }} />
      </svg>


      {/* Logo */}
      <div
        className="absolute top-5 left-5 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20 opacity-0 pointer-events-none flex items-center gap-2 sm:gap-2.5 md:gap-3"
        style={{ animation: "word-appear 1s ease-out forwards", animationDelay: "0.2s" }}
      >
        <img
          src="/favicon.png"
          alt="BOUND"
          width={40}
          height={40}
          className="block h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0"
          draggable={false}
        />
        <span
          className="text-sm sm:text-base lg:text-lg font-bold tracking-[0.15em] whitespace-nowrap"
          style={{ color: colors[50] }}
        >
          BOUND
        </span>
      </div>

      {/* Top-right nav — Whitepaper + Docs */}
      <nav
        aria-label="Site"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-20 flex items-center gap-1.5 sm:gap-2.5 opacity-0 max-w-[calc(100%-5.5rem)] sm:max-w-none"
        style={{ animation: "word-appear 1s ease-out forwards", animationDelay: "0.35s" }}
      >
        <a
          href="/bound-whitepaper-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold tracking-[0.06em] no-underline transition-colors duration-200"
          style={{
            color: colors[100],
            borderColor: "rgba(185,212,196,0.14)",
            background: "rgba(255,255,255,0.03)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(185,212,196,0.32)";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = colors[50];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(185,212,196,0.14)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.color = colors[100];
          }}
        >
          Whitepaper
        </a>
        <a
          href="/dataroom"
          className="inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold tracking-[0.06em] no-underline transition-colors duration-200"
          style={{
            color: colors[900],
            borderColor: "rgba(185,212,196,0.28)",
            background: colors[50],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors[50];
          }}
        >
          Data Room
        </a>
      </nav>

      <div className="floating-element" style={{ pointerEvents: "none", top: "25%", left: "15%", animationDelay: "5s" }}></div>
      <div className="floating-element" style={{ pointerEvents: "none", top: "60%", left: "85%", animationDelay: "5.5s" }}></div>
      <div className="floating-element" style={{ pointerEvents: "none", top: "40%", left: "10%", animationDelay: "6s" }}></div>
      <div className="floating-element" style={{ pointerEvents: "none", top: "75%", left: "90%", animationDelay: "6.5s" }}></div>

      <div className="relative z-10 flex flex-col gap-8 sm:gap-10 items-center px-4 sm:px-8 pt-[4.75rem] sm:pt-24 pb-20 sm:pb-28 md:min-h-screen md:justify-between md:gap-0 md:px-16 md:py-20">

        {/* Top tagline */}
        <div className="text-center">
          <h2 className="text-xs md:text-sm font-mono font-light tracking-[0.2em] opacity-80" style={{ color: colors[200] }}>
            <span className="word" data-delay="0">BOUND</span>{" "}
            <span className="word" data-delay="200">powers</span>{" "}
            <span className="word" data-delay="400">instant</span>{" "}
            <span className="word" data-delay="600">liquidity</span>{" "}
            <span className="word" data-delay="800">for</span>{" "}
            <span className="word" data-delay="1000">Real-World</span>{" "}
            <span className="word" data-delay="1200">Assets</span>
          </h2>
          <div className="mt-4 w-16 h-px opacity-30 mx-auto" style={{ background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)` }}></div>
        </div>

        {/* Main headline + Instant Exit */}
        <div className="flex flex-col items-center gap-10 w-full max-w-5xl">
          <div className="text-center w-full relative">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extralight leading-tight tracking-tight" style={{ color: colors[50] }}>
              <div className="mb-4 md:mb-6">
                <span className="word" data-delay="1600">Turn</span>{" "}
                <span className="word" data-delay="1750">illiquid</span>{" "}
                <span className="word" data-delay="1900">RWAs</span>{" "}
                <span className="word" data-delay="2050">into</span>{" "}
                <span className="word" data-delay="2200">instant</span>{" "}
                <span className="word" data-delay="2350">liquidity</span>{" "}
                <span className="word" data-delay="2500">with</span>{" "}
                <span className="word" data-delay="2650">Bound</span>{" "}
                <span className="word" data-delay="2800">Liquid</span>{" "}
                <span className="word" data-delay="2950">Dollar</span>
              </div>
            </h1>
            <div className="absolute -left-8 top-1/2 w-4 h-px opacity-20 hidden sm:block" style={{ background: colors[200], animation: "word-appear 1s ease-out forwards", animationDelay: "3.5s" }}></div>
            <div className="absolute -right-8 top-1/2 w-4 h-px opacity-20 hidden sm:block" style={{ background: colors[200], animation: "word-appear 1s ease-out forwards", animationDelay: "3.7s" }}></div>
          </div>

          {/* Instant Exit panel */}
          <div className="w-full opacity-0" style={{ animation: "word-appear 1s ease-out forwards", animationDelay: "4.2s" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(185,212,196,0.1)`, borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 0 rgba(185,212,196,0.04), 0 32px 60px -28px rgba(0,0,0,0.5)" }}>
              {/* Top accent hairline */}
              <div style={{ height: 2, background: `linear-gradient(90deg, ${colors[700]} 0%, ${colors[200]} 50%, #2775CA 100%)` }}></div>

              <div className="p-4 md:p-[22px_26px_24px]">
                {/* Header row */}
                <div>
                  <span style={{ fontSize: 17, fontWeight: 600, color: colors[50], letterSpacing: "-0.01em" }}>Instant Exit</span>
                </div>

                {/* Pipeline row */}
                <div style={{ marginTop: 20, display: "flex", alignItems: "stretch", flexWrap: "wrap", gap: 12 }}>

                  {/* Left: YOU HOLD */}
                  <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", color: colors[400] }}>YOU HOLD</div>
                    <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 13, padding: "16px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(185,212,196,0.1)`, borderRadius: 12 }}>
                      <span style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", border: `1px solid rgba(185,212,196,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff", position: "relative" }}>
                        <img src="/RWA_1.png" alt="mTBILL" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(18,46,35,0.55) 0%, rgba(27,74,56,0.3) 100%)" }}></span>
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: colors[50] }}>mTBILL</span>
                        <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, color: colors[300], background: "rgba(185,212,196,0.1)", padding: "2px 6px", borderRadius: 4, marginTop: 2 }}>Tokenized treasuries</span>
                      </span>
                      <span style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ display: "block", fontFamily: "monospace", fontSize: 14, fontWeight: 500, color: colors[50] }}>50,000</span>
                        <span style={{ fontSize: 10, color: colors[400], fontWeight: 500 }}>bTBILL</span>
                      </span>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: 2 }}><path d="M4 6.5L8 10l4-3.5" stroke={colors[300]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {/* Illiquid text on its own full-width row */}
                      <span style={{ flex: "1 0 100%", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: colors[300], paddingLeft: 55, marginTop: -6 }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="6.2" stroke={colors[300]} strokeWidth="1.3" /><path d="M8 4.6V8l2.2 1.4" stroke={colors[300]} strokeWidth="1.3" strokeLinecap="round" /></svg>
                        Illiquid · redeems in 67 days
                      </span>
                    </div>
                    {/* Multi-RWA pill */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", background: "rgba(255,255,255,0.02)", border: `1px solid rgba(185,212,196,0.07)`, borderRadius: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", overflow: "hidden", border: `1.5px solid rgba(20,23,16,0.7)`, display: "inline-flex", background: "#fff", position: "relative" }}>
                          <img src="/RWA_2.png" alt="RWA 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(18,46,35,0.55) 0%, rgba(27,74,56,0.3) 100%)" }}></span>
                        </span>
                        <span style={{ width: 18, height: 18, marginLeft: -6, borderRadius: "50%", overflow: "hidden", border: `1.5px solid rgba(20,23,16,0.7)`, display: "inline-flex", background: "#fff", position: "relative" }}>
                          <img src="/RWA_3.webp" alt="RWA 3" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(18,46,35,0.55) 0%, rgba(27,74,56,0.3) 100%)" }}></span>
                        </span>
                        <span style={{ width: 18, height: 18, marginLeft: -6, borderRadius: "50%", overflow: "hidden", border: `1.5px solid rgba(20,23,16,0.7)`, display: "inline-flex", background: "#fff", position: "relative" }}>
                          <img src="/RWA_4.png" alt="RWA 4" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(18,46,35,0.55) 0%, rgba(27,74,56,0.3) 100%)" }}></span>
                        </span>
                        <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 600, color: colors[400] }}>+</span>
                      </span>
                      <span style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: colors[300] }}>
                        <span style={{ fontWeight: 600, color: colors[100] }}>RWA</span> eligible for instant exit
                      </span>
                    </div>
                  </div>

                  {/* Connector — hidden on portrait/mobile where columns stack */}
                  <div className="hidden sm:flex" style={{ flex: "0 0 80px", alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: colors[50], display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px -8px rgba(0,0,0,0.6)" }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={colors[900]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>

                  {/* Right: YOU RECEIVE NOW */}
                  <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", color: "#5a8a6a" }}>YOU RECEIVE NOW</div>
                    <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px 16px 14px", background: "rgba(27,74,56,0.35)", border: `1px solid rgba(60,100,70,0.2)`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                        <span className="text-xl sm:text-2xl md:text-[26px]" style={{ fontFamily: "monospace", fontWeight: 500, color: colors[50], letterSpacing: "-0.02em", lineHeight: 1 }}>49,812.50</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: colors[200] }}>rwaUSD</span>
                      </div>
                      <div style={{ marginTop: 5, fontSize: 11.5, color: colors[300] }}>≈ $49,812.50 · settles in seconds</div>
                      <button style={{ marginTop: 12, width: "100%", border: "none", cursor: "pointer", background: colors[100], color: colors[900], fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, padding: "11px", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                        Exit now
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={colors[900]} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3" style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid rgba(185,212,196,0.08)`, fontSize: 11, color: colors[300] }}>
                  <span className="text-center sm:text-left" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    Redeem illiquid RWA positions instantly with rwaUSD.
                  </span>

                  {/* rwaUSD/USDC chip */}
                  <div className="w-full sm:w-auto flex justify-center sm:justify-end" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(185,212,196,0.1)`, padding: "7px 7px 7px 13px", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: `1.5px solid rgba(20,23,16,0.8)`, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                          <img src="/bnd-token.svg" alt="rwaUSD" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </span>
                        <span style={{ width: 22, height: 22, marginLeft: -7, borderRadius: "50%", overflow: "hidden", border: `1.5px solid rgba(20,23,16,0.8)`, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                          <img src="/usdc_logo.png" alt="USDC" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: "0.08em", color: colors[400], fontWeight: 600 }}>rwaUSD / USDC</div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, color: colors[50] }}>$1.00</div>
                      </div>
                    </div>
                    <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: `1px solid rgba(185,212,196,0.1)`, color: colors[100], fontSize: 11.5, fontWeight: 600, textDecoration: "none", padding: "7px 11px", borderRadius: 9, whiteSpace: "nowrap" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 9l4-4M5 9l4 4M5 9h11a3 3 0 013 3M19 15l-4 4M19 15l-4-4M19 15H8a3 3 0 01-3-3" stroke={colors[100]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Swap on Uniswap
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="text-center">
          <div className="mb-4 w-16 h-px opacity-30 mx-auto" style={{ background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)` }}></div>
          <h2 className="text-xs md:text-sm font-mono font-light tracking-[0.15em] opacity-80 max-w-2xl" style={{ color: colors[200] }}>
            <span className="word" data-delay="4400">Get</span>{" "}
            <span className="word" data-delay="4520">instant</span>{" "}
            <span className="word" data-delay="4640">liquidity</span>{" "}
            <span className="word" data-delay="4760">in</span>{" "}
            <span className="word" data-delay="4880">rwaUSD</span>{" "}
            <span className="word" data-delay="5000">while</span>{" "}
            <span className="word" data-delay="5120">the</span>{" "}
            <span className="word" data-delay="5240">underlying</span>{" "}
            <span className="word" data-delay="5360">redemption</span>{" "}
            <span className="word" data-delay="5480">settles</span>{" "}
            <span className="word" data-delay="5600">in</span>{" "}
            <span className="word" data-delay="5720">the</span>{" "}
            <span className="word" data-delay="5840">background.</span>
          </h2>
          <div className="mt-6 flex justify-center space-x-4 opacity-0" style={{ animation: "word-appear 1s ease-out forwards", animationDelay: "4.5s" }}>
            <div className="w-1 h-1 rounded-full opacity-40" style={{ background: colors[200] }}></div>
            <div className="w-1 h-1 rounded-full opacity-60" style={{ background: colors[200] }}></div>
            <div className="w-1 h-1 rounded-full opacity-40" style={{ background: colors[200] }}></div>
          </div>
        </div>
      </div>

      {/* X / Twitter link */}
      <a
        href="https://x.com/Bound_Protocol"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 opacity-0"
        style={{ animation: "word-appear 1s ease-out forwards", animationDelay: "0.4s" }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(185,212,196,0.12)` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={colors[200]}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </span>
      </a>

      <div
        id="mouse-gradient"
        ref={gradientRef}
        className="fixed pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-500 ease-out opacity-0"
        style={{ background: `radial-gradient(circle, rgba(27,74,56,0.18) 0%, transparent 100%)` }}
      ></div>
    </div>
  );
}
