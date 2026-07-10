import Head from "next/head";
import dynamic from "next/dynamic";

const SimulatorApp = dynamic(() => import("@/components/simulator/SimulatorRoot"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F4EE",
        color: "#6B6A62",
        fontFamily: "'Geist','Inter',-apple-system,'Segoe UI',sans-serif",
        fontSize: 14,
      }}
    >
      Loading simulator…
    </div>
  ),
});

export default function SimulatorPage() {
  return (
    <>
      <Head>
        <title>Bound Simulator v8</title>
        <meta
          name="description"
          content="BOUND Protocol financial model — Architecture v4, 10 revenue streams, dynamic liquidity waterfall. Explore capital flows, revenue projections, and stress scenarios."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SimulatorApp />
    </>
  );
}
