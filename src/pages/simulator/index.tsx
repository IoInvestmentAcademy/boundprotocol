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
        background: "#0E130F",
        color: "#889086",
        fontFamily: "'Geist','Inter',-apple-system,'Segoe UI',sans-serif",
        fontSize: 14,
      }}
    >
      Loading documentation library…
    </div>
  ),
});

export default function SimulatorPage() {
  return (
    <>
      <Head>
        <title>BOUND Protocol — Documentation Library</title>
        <meta
          name="description"
          content="BOUND Protocol documentation library — whitepaper, tokenomics audit, market analysis, simulators, legal, and investor materials."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SimulatorApp />
    </>
  );
}
