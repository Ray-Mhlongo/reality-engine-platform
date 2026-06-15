import { AlertTriangle, ArrowDownRight, ArrowUpRight, Brain, CheckCircle2, Database, GitBranch, LineChart, Search } from "lucide-react";
import { QualityChart, ScenarioChart, SegmentChart, TrendChart } from "./Charts";
import { formatNumber, formatPercent, titleCase } from "../lib/format";

export function Dashboard({ dataset, analysis, scenario }) {
  const topTrend = analysis.trends[0];
  const topPerformance = analysis.categoryPerformance[0];

  return (
    <section className="grid gap-4" id="discoveries">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Rows investigated" value={formatNumber(dataset.metadata.rowCount)} detail={`${formatNumber(dataset.metadata.columnCount)} columns`} icon={Database} />
        <Metric title="Quality score" value={formatPercent(analysis.qualityScore)} detail={`${formatNumber(analysis.duplicateCount)} duplicates`} icon={CheckCircle2} />
        <Metric title="Discoveries" value={formatNumber(analysis.discoveryFeed.length)} detail={`${formatNumber(analysis.anomalies.length)} anomalies`} icon={Search} />
        <Metric title="Risk score" value={formatPercent(analysis.scoreBreakdown.riskScore)} detail={`${formatPercent(analysis.scoreBreakdown.completenessScore)} complete`} icon={GitBranch} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Autonomous discovery</p>
              <h2 className="mt-1 text-2xl font-black text-white">Signals found without a question</h2>
            </div>
            <Brain className="text-signal" />
          </div>
          <div className="grid gap-3">
            {analysis.discoveryFeed.map((item) => (
              <article key={`${item.label}-${item.title}`} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-amber">{item.label}</span>
                  <Priority value={item.priority} />
                </div>
                <h3 className="mt-2 font-extrabold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/60">{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <ChartPanel title="Data Quality" subtitle="Profile confidence">
              <div className="relative h-[260px]">
                <QualityChart analysis={analysis} />
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <span>
                    <span className="block text-4xl font-black text-white">{Math.round(analysis.qualityScore)}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/48">score</span>
                  </span>
                </div>
              </div>
            </ChartPanel>
            <ChartPanel title="Primary Trend" subtitle={topTrend ? titleCase(topTrend.column) : "Waiting for dated data"}>
              <div className="h-[260px]">
                <TrendChart trend={topTrend} />
              </div>
            </ChartPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartPanel title="Segment Performance" subtitle={topPerformance ? titleCase(topPerformance.categoryColumn) : "Category ranking"}>
              <div className="h-[280px]">
                <SegmentChart performance={topPerformance} />
              </div>
            </ChartPanel>
            <ChartPanel title="Scenario Projection" subtitle={scenario ? `${formatPercent(scenario.changePercent)} what-if` : "Simulation engine"}>
              <div className="h-[280px]">
                <ScenarioChart scenario={scenario} />
              </div>
            </ChartPanel>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TablePanel title="Column intelligence" rows={analysis.columnProfiles.slice(0, 8)} />
        <CorrelationPanel correlations={analysis.correlations} />
        <AnomalyPanel anomalies={analysis.anomalies} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ScorePanel analysis={analysis} />
        <CategoryPanel summaries={analysis.categorySummaries} />
        <DatePanel dateRange={analysis.dateRange} />
      </div>
    </section>
  );
}

function Metric({ title, value, detail, icon: Icon }) {
  return (
    <div className="metric">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/55">{title}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm text-white/48">{detail}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md bg-signal/12 text-signal">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Priority({ value }) {
  const high = value === "High";
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${high ? "bg-red-400/15 text-red-200" : "bg-signal/12 text-signal"}`}>
      {high ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {value}
    </span>
  );
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <div className="panel rounded-lg p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">{subtitle}</p>
      <h3 className="mt-1 font-extrabold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function TablePanel({ title, rows }) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-md border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase tracking-[0.14em] text-white/46">
            <tr>
              <th className="p-3">Column</th>
              <th className="p-3">Type</th>
              <th className="p-3">Missing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-white/10">
                <td className="p-3 font-semibold text-white">{titleCase(row.name)}</td>
                <td className="p-3 text-white/62">{row.type}</td>
                <td className="p-3 text-white/62">{formatPercent(row.missingRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CorrelationPanel({ correlations }) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">Detected drivers</h3>
      <div className="mt-4 grid gap-3">
        {correlations.length ? (
          correlations.slice(0, 5).map((item) => (
            <div key={`${item.a}-${item.b}`} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-signal">
                <LineChart size={16} />
                <span className="text-sm font-bold">{item.score.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-sm text-white/66">
                {titleCase(item.a)} vs {titleCase(item.b)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/55">No strong numeric correlations found yet.</p>
        )}
      </div>
    </div>
  );
}

function AnomalyPanel({ anomalies }) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">Risk register</h3>
      <div className="mt-4 grid gap-3">
        {anomalies.length ? (
          anomalies.slice(0, 5).map((item) => (
            <div key={`${item.title}-${item.detail}`} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-amber">
                <AlertTriangle size={16} />
                <span className="text-sm font-bold">{item.severity}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{item.detail}</p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/55">No material anomalies detected.</p>
        )}
      </div>
    </div>
  );
}

function ScorePanel({ analysis }) {
  const scores = [
    ["Completeness", analysis.scoreBreakdown.completenessScore],
    ["Consistency", analysis.scoreBreakdown.consistencyScore],
    ["Risk", analysis.scoreBreakdown.riskScore]
  ];
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">Score breakdown</h3>
      <div className="mt-4 grid gap-3">
        {scores.map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-white/62">{label}</span>
              <span className="font-black text-white">{formatPercent(value)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded bg-white/10">
              <div className="h-full rounded bg-signal" style={{ width: `${Math.min(100, value)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryPanel({ summaries }) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">Category summaries</h3>
      <div className="mt-4 grid gap-3">
        {summaries.length ? (
          summaries.slice(0, 2).map((summary) => (
            <div key={summary.column} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <p className="text-sm font-bold text-white">{titleCase(summary.column)}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">
                {summary.topValues.map((item) => `${item.name} (${formatPercent(item.share)})`).join(", ")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-white/55">No categorical fields detected.</p>
        )}
      </div>
    </div>
  );
}

function DatePanel({ dateRange }) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="font-extrabold text-white">Date range</h3>
      {dateRange ? (
        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-3">
          <p className="text-sm font-bold text-white">{titleCase(dateRange.column)}</p>
          <p className="mt-1 text-sm text-white/62">{dateRange.start} to {dateRange.end}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-white/55">No reliable date column detected. Forecasting will explain what is missing.</p>
      )}
    </div>
  );
}
