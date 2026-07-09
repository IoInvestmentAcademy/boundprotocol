import Head from "next/head";
import dynamic from "next/dynamic";

const SimulatorApp = dynamic(
  () => import("@/bound protocol simlator/src/App"),
  {
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
  }
);

export default function SimulatorPage() {
  return (
    <>
      <Head>
        <title>Bound Simulator</title>
        <meta
          name="description"
          content="Interactive financial model for the Bound protocol — explore capital flows, revenue projections, and stress scenarios."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <SimulatorApp />
    </>
  );
}
