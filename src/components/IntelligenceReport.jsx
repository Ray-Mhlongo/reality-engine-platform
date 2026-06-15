import { BriefcaseBusiness, Check, CircleAlert, Lightbulb, Rocket, Sparkles } from "lucide-react";

import { formatNumber, formatPercent, titleCase } from "../lib/format";

export function IntelligenceReport({ intelligence, analysis, scenario }) {
  const sections = [
    { title: "Executive Summary", icon: Sparkles, items: intelligence.executiveSummary },
    { title: "Key Findings", icon: Check, items: intelligence.keyFindings },
    { title: "Risks", icon: CircleAlert, items: intelligence.risks },
    { title: "Opportunities", icon: Lightbulb, items: intelligence.opportunities },
    { title: "Recommended Actions", icon: Rocket, items: intelligence.recommendedActions },
    { title: "Forecast Summary", icon: Sparkles, items: buildForecastSummary(analysis) },
    { title: "Simulation Summary", icon: BriefcaseBusiness, items: buildSimulationSummary(scenario) },
    { title: "Data Quality Notes", icon: CircleAlert, items: buildQualityNotes(analysis) }
  ];

  return (
    <section className="panel rounded-lg p-4 sm:p-6" id="report">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">AI intelligence layer</p>
          <h2 className="mt-1 text-2xl font-black text-white">Executive decision report</h2>
        </div>
        <BriefcaseBusiness className="text-amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <section.icon className="mb-3 text-signal" size={22} />
            <h3 className="font-extrabold text-white">{section.title}</h3>
            <div className="mt-3 grid gap-3">
              {section.items.map((item) => (
                <p key={item} className="text-sm leading-6 text-white/62">
                  {item}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-amber/20 bg-amber/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber">Business impact assessment</p>
        <p className="mt-2 text-sm leading-6 text-white/75">{intelligence.businessImpact}</p>
      </div>
    </section>
  );
}

function buildForecastSummary(analysis) {
  if (!analysis.forecasts.length) {
    return ["Forecasting needs a date column and a numeric outcome. The system handled this gracefully and did not invent projections."];
  }
  return analysis.forecasts.map(
    (forecast) =>
      `${forecast.label}: ${titleCase(forecast.measure)} projects to ${formatNumber(forecast.projected, { compact: true })} with ${forecast.risk} risk.`
  );
}

function buildSimulationSummary(scenario) {
  if (!scenario) return ["No simulation has been run yet."];
  return [
    `${titleCase(scenario.column)} scenario changes by ${formatPercent(scenario.changePercent)} from ${formatNumber(scenario.baseline, { compact: true })} to ${formatNumber(scenario.projected, { compact: true })}.`,
    `Risk level: ${scenario.riskLevel}. ${scenario.recommendation}`
  ];
}

function buildQualityNotes(analysis) {
  return [
    `Completeness score is ${formatPercent(analysis.scoreBreakdown.completenessScore)}.`,
    `Consistency score is ${formatPercent(analysis.scoreBreakdown.consistencyScore)}.`,
    `Risk score is ${formatPercent(analysis.scoreBreakdown.riskScore)}.`
  ];
}
