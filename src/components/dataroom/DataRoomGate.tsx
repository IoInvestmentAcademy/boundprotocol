import { FormEvent, KeyboardEvent, ClipboardEvent, useEffect, useRef, useState } from "react";

const T = {
  bg: "#0E130F",
  bgEl: "#151B16",
  bgSoft: "#1A211B",
  border: "#28322A",
  borderS: "#3A4A3E",
  ink: "#ECEFE8",
  ink2: "#BAC2B9",
  ink3: "#889086",
  ink4: "#6E766D",
  green: "#79C6A9",
  green2: "#5FAE90",
  greenDeep: "#2C6A57",
  greenSoft: "#17251E",
  red: "#C45A5A",
};

const BG = [
  "radial-gradient(58% 46% at 86% -6%, color-mix(in srgb,#5FAE90 24%,transparent), transparent 60%)",
  "radial-gradient(52% 42% at 2% 6%, color-mix(in srgb,#5FAE90 14%,transparent), transparent 58%)",
  "radial-gradient(60% 50% at 110% 40%, color-mix(in srgb,#79C6A9 15%,transparent), transparent 56%)",
  T.bg,
].join(", ");

const SANS = "'Geist','Inter',-apple-system,'Segoe UI',sans-serif";
const PIN_LEN = 3;

type Props = {
  children: React.ReactNode;
};

export default function DataRoomGate({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "locked" | "unlocked">("loading");
  const [digits, setDigits] = useState<string[]>(Array(PIN_LEN).fill(""));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dataroom-auth", { method: "GET" });
        const data = (await res.json()) as { unlocked?: boolean };
        if (!cancelled) setStatus(data.unlocked ? "unlocked" : "locked");
      } catch {
        if (!cancelled) setStatus("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "locked") {
      const t = window.setTimeout(() => refs.current[0]?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [status]);

  async function verify(code: string) {
    setError("");
    if (code.length !== PIN_LEN) {
      setError("Enter the full 3-digit access code.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dataroom-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError("Invalid access code. Please try again.");
        setDigits(Array(PIN_LEN).fill(""));
        setFocused(0);
        window.setTimeout(() => refs.current[0]?.focus(), 40);
        return;
      }
      setStatus("unlocked");
    } catch {
      setError("Unable to verify access. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void verify(digits.join(""));
  }

  function updateDigit(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (error) setError("");

    if (char && index < PIN_LEN - 1) {
      refs.current[index + 1]?.focus();
      setFocused(index + 1);
    }

    if (char && index === PIN_LEN - 1 && next.every((d) => d !== "")) {
      void verify(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        refs.current[index - 1]?.focus();
        setFocused(index - 1);
      }
      if (error) setError("");
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
    if (e.key === "ArrowRight" && index < PIN_LEN - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LEN);
    if (!pasted) return;
    const next = Array(PIN_LEN).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (error) setError("");
    const focusAt = Math.min(pasted.length, PIN_LEN - 1);
    refs.current[focusAt]?.focus();
    setFocused(focusAt);
    if (pasted.length === PIN_LEN) void verify(pasted);
  }

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          backgroundAttachment: "fixed",
          color: T.ink3,
          fontFamily: SANS,
          fontSize: 14,
        }}
      >
        Verifying access…
      </div>
    );
  }

  if (status === "unlocked") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: BG,
        backgroundAttachment: "fixed",
        fontFamily: SANS,
        color: T.ink,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: T.bgEl,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          boxShadow: "0 2px 5px rgba(0,0,0,.35), 0 24px 48px rgba(0,0,0,.45)",
          padding: "36px 32px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: T.greenSoft,
              border: "1px solid color-mix(in srgb,#5FAE90 28%,transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="11" rx="2" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.green2 }}>
              Restricted access
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", color: T.ink, marginTop: 2 }}>
              BOUND Data Room
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.ink3, margin: "0 0 22px" }}>
          This library contains confidential materials. Enter the 3-digit access
          code provided to you to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.ink4,
              marginBottom: 12,
            }}
          >
            Access code
          </div>

          <div
            role="group"
            aria-label="3-digit access code"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginBottom: error ? 10 : 20,
            }}
          >
            {digits.map((digit, i) => {
              const active = focused === i;
              return (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  id={i === 0 ? "dataroom-code" : undefined}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={submitting}
                  aria-label={`Digit ${i + 1} of ${PIN_LEN}`}
                  onChange={(e) => updateDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => {
                    setFocused(i);
                    e.target.select();
                  }}
                  style={{
                    width: 56,
                    height: 64,
                    boxSizing: "border-box",
                    textAlign: "center",
                    borderRadius: 12,
                    border: `1.5px solid ${error ? T.red : active ? T.green2 : T.borderS}`,
                    background: T.bgSoft,
                    color: T.ink,
                    fontSize: 24,
                    fontWeight: 600,
                    fontFamily: "ui-monospace,'Geist Mono','SF Mono',Menlo,monospace",
                    outline: "none",
                    boxShadow: active ? "0 0 0 3px rgba(95,174,144,0.2)" : "none",
                    caretColor: T.green,
                    transition: "border-color .15s ease, box-shadow .15s ease",
                  }}
                />
              );
            })}
          </div>

          {error && (
            <p style={{ fontSize: 12.5, color: T.red, margin: "0 0 14px", lineHeight: 1.4, textAlign: "center" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || digits.some((d) => !d)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              cursor: submitting || digits.some((d) => !d) ? "not-allowed" : "pointer",
              background: T.greenDeep,
              color: "#EAF6EF",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "inherit",
              opacity: submitting || digits.some((d) => !d) ? 0.55 : 1,
              boxShadow: "0 1px 2px rgba(0,0,0,.35)",
            }}
          >
            {submitting ? "Verifying…" : "Unlock Data Room"}
          </button>
        </form>

        <p style={{ fontSize: 11.5, color: T.ink4, lineHeight: 1.5, margin: "18px 0 0", textAlign: "center" }}>
          Need access? Contact your BOUND representative.
        </p>
      </div>
    </div>
  );
}
