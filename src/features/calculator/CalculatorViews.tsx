"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/Fields";
import { ProjectSimulator } from "@/features/simulator/ProjectSimulator";
import { LcohCalculator, type CalculatorPrefill } from "./LcohCalculator";

export type CalculatorView = "lcoh" | "simulator";

/** `/app/calculator`: LCOH calculator and project simulator behind one switch; the view lives in `?view=`. */
export function CalculatorViews({ prefill, initialView }: { prefill?: CalculatorPrefill; initialView: CalculatorView }) {
  const [view, setView] = useState<CalculatorView>(initialView);
  const change = (v: CalculatorView) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === "simulator") url.searchParams.set("view", v);
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
  };

  const viewSwitch = (
    <Segmented<CalculatorView>
      label="Calculator view"
      value={view}
      onChange={change}
      options={[
        { value: "lcoh", label: "LCOH calculator" },
        { value: "simulator", label: "Project simulator" },
      ]}
    />
  );

  return view === "simulator" ? <ProjectSimulator viewSwitch={viewSwitch} /> : <LcohCalculator prefill={prefill} viewSwitch={viewSwitch} />;
}
