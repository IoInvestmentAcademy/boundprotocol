import { useState } from "react";
import BoundSimulator from "./BoundSimulator";
import BoundLegend from "./BoundLegend";

export default function App() {
  const [view, setView] = useState("simulator");
  return view === "docs"
    ? <BoundLegend onClose={() => setView("simulator")} />
    : <BoundSimulator onOpenDocs={() => setView("docs")} />;
}
