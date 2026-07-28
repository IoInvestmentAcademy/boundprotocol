import { useState } from "react";
import BoundSimulator from "./BoundSimulator";
import BoundLegend from "./BoundLegend";
import DocHub from "./DocHub";

export default function App() {
  // Landing is the Documentation Library (DocHub). Deep-link with #simulator
  // to open the protocol simulator directly; #docs (used by standalone HTML
  // docs' Back buttons) also lands on the library.
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "docHub";
    return window.location.hash === "#simulator" ? "simulator" : "docHub";
  }); // "simulator" | "docHub" | "docs"
  // Lets the Documentation hub route back into the app on a specific tab
  // (Simulator inputs vs. Tokenomics). The nonce forces the effect in
  // BoundSimulator to re-run even when the same tab is requested twice.
  const [simReq, setSimReq] = useState({ tab: "inputs", n: 0 });
  // The engine reference is reached from the Simulator now, not the hub, so the
  // Back control has to return wherever the reader came from.
  const [docsFrom, setDocsFrom] = useState("simulator");
  const goSim = (tab) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}#simulator`);
    }
    setSimReq((s) => ({ tab, n: s.n + 1 }));
    setView("simulator");
  };

  const goHub = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}#docs`);
    }
    setView("docHub");
  };

  if (view === "docHub")
    return (
      <DocHub
        onNavSimulator={() => goSim("inputs")}
        onNavTokenomics={() => goSim("tokenomics")}
      />
    );
  if (view === "docs")
    return <BoundLegend onClose={() => setView(docsFrom)}
      backLabel={docsFrom === "simulator" ? "Back to Simulator" : "Back to Library"} />;
  return <BoundSimulator onOpenDocs={goHub} simReq={simReq}
    onOpenEngineDocs={() => { setDocsFrom("simulator"); setView("docs"); }} />;
}
