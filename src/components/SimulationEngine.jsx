import { Activity, Calculator } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { runScenario } from "../lib/analysis";
import { formatNumber, formatPercent, titleCase } from "../lib/format";

export function SimulationEngine({ dataset, analysis, scenario, onScenario }) {
  const [targetColumn, setTargetColumn] = useState(analysis.numericColumns[0]?.name || "");
  const [changePercent, setChangePercent] = useState(10);
  const measures = useMemo(() => analysis.numericColumns, [analysis]);
  const canSimulate = measures.length > 0;

  useEffect(() => {
    if (!measures.some((measure) => measure.name === targetColumn)) {
      setTargetColumn(measures[0]?.name || "");
    }
  }, [measures, targetColumn]);

  function execute(nextChange = changePercent) {
    const nextTarget = measures.some((measure) => measure.name === targetColumn) ? targetColumn : measures[0]?.name;
    if (!nextTarget) {
      onScenario(null);
      return;
    }
    const result = runScenario({ analysis, dataset, targetColumn: nextTarget, changePercent: Number(nextChange) });
    onScenario(result);
  }

  return (
    <section className="panel rounded-lg p-4 sm:p-6" id="simulate">
      <div className="grid gap-5 xl:grid-cols-[0.42fr_0.58fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Simulation engine</p>
          <h2 className="mt-1 text-2xl font-black text-white">What-if scenarios</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Model a directional change against an actual numeric field and compare projected outcomes with the current baseline.
          </p>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-white/68">Target measure</span>
              <select className="control" value={targetColumn} onChange={(event) => setTargetColumn(event.target.value)} disabled={!canSimulate}>
                {canSimulate ? (
                  measures.map((measure) => (
                    <option key={measure.name} value={measure.name}>
                      {titleCase(measure.name)}
                    </option>
                  ))
                ) : (
                  <option value="">No numeric columns found</option>
                )}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="flex items-center justify-between text-sm font-bold text-white/68">
                Scenario change <strong className="text-signal">{formatPercent(changePercent)}</strong>
              </span>
              <input
                type="range"
                min="-50"
                max="100"
                step="1"
                value={changePercent}
                onChange={(event) => setChangePercent(Number(event.target.value))}
                className="accent-signal"
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "+10%", value: 10 },
                { label: "-15%", value: -15 },
                { label: "Costs +20%", value: 20 },
                { label: "Churn x2", value: -50 },
                { label: "AOV +12%", value: 12 },
                { label: "Stock risk", value: -25 },
                { label: "Marketing +18%", value: 18 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="secondary-button px-2"
                  disabled={!canSimulate}
                  onClick={() => {
                    setChangePercent(preset.value);
                    execute(preset.value);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button className="primary-button" type="button" onClick={() => execute()} disabled={!canSimulate}>
              <Calculator size={18} /> Run simulation
            </button>
            {!canSimulate ? <p className="text-sm font-semibold text-white/62">No numeric columns found, so what-if simulation is unavailable for this dataset.</p> : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Outcome title="Baseline" value={scenario ? formatNumber(scenario.baseline, { compact: true }) : "Ready"} />
          <Outcome title="Projected" value={scenario ? formatNumber(scenario.projected, { compact: true }) : "Run"} />
          <Outcome title="Impact" value={scenario ? formatNumber(scenario.delta, { compact: true }) : "Scenario"} tone="amber" />
          <Outcome title="Risk Level" value={scenario ? scenario.riskLevel : "Pending"} tone={scenario?.riskLevel === "Low" ? "signal" : "amber"} />
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 md:col-span-4">
            <div className="flex items-center gap-2 text-signal">
              <Activity size={18} />
              <h3 className="font-extrabold text-white">Projection narrative</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {scenario
                ? `${titleCase(scenario.column)} changes by ${formatPercent(scenario.changePercent)}, moving total impact from ${formatNumber(scenario.baseline)} to ${formatNumber(scenario.projected)}. Average row value changes from ${formatNumber(scenario.averageBefore)} to ${formatNumber(scenario.averageAfter)}.`
                : "Choose a measure and run a scenario to generate a projected outcome."}
            </p>
            {scenario ? <p className="mt-3 rounded-md bg-white/[0.06] p-3 text-sm leading-6 text-white/66">{scenario.recommendation}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Outcome({ title, value, tone = "signal" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-semibold text-white/52">{title}</p>
      <p className={`mt-2 break-words text-2xl font-black ${tone === "amber" ? "text-amber" : "text-signal"}`}>{value}</p>
    </div>
  );
}
