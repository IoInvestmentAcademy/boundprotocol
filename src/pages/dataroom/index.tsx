import Head from "next/head";
import dynamic from "next/dynamic";
import DataRoomGate from "@/components/dataroom/DataRoomGate";

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

export default function DataroomPage() {
  return (
    <>
      <Head>
        <title>BOUND Protocol — Data Room</title>
        <meta
          name="description"
          content="Restricted BOUND Protocol data room — whitepaper, tokenomics, market analysis, simulators, legal, and investor materials."
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <DataRoomGate>
        <SimulatorApp />
      </DataRoomGate>
    </>
  );
}
