import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Custom404 = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page after a brief delay
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Page Not Found - BOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
          padding: "2rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <img
            src="/favicon.png"
            alt="BOUND"
            style={{
              width: "80px",
              height: "80px",
              marginBottom: "2rem",
            }}
          />

          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#6366f1",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            404
          </h1>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "1rem",
            }}
          >
            Page Not Found
          </h2>

          <p
            style={{
              fontSize: "1.1rem",
              color: "#64748b",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            The page you're looking for doesn't exist. You'll be redirected to
            our homepage in a few seconds.
          </p>

          <button
            onClick={() => router.replace("/")}
            style={{
              background: "#6366f1",
              color: "white",
              padding: "1rem 2rem",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#5855eb";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#6366f1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Go to Homepage
          </button>

          <div
            style={{
              marginTop: "2rem",
              fontSize: "0.9rem",
              color: "#94a3b8",
            }}
          >
            Redirecting automatically...
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom404;
