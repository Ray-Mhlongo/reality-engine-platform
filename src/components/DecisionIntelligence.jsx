import {
  AlertTriangle,
  BadgeDollarSign,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  LineChart,
  Network,
  Orbit,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { chartOptions } from "./Charts";
import { formatNumber, formatPercent, titleCase } from "../lib/format";

export function DecisionIntelligence({ analysis }) {
  return (
    <section className="grid gap-5" id="investigation">
      <InvestigationMode investigation={analysis.investigation} />
      <div className="grid gap-5 xl:grid-cols-[0.58fr_0.42fr]">
        <RelationshipMap graph={analysis.relationshipGraph} />
        <ForecastingEngine forecasts={analysis.forecasts} />
      </div>
      <Boardroom boardroom={analysis.boardroom} />
      <div className="grid gap-5 xl:grid-cols-[0.54fr_0.46fr]">
        <OpportunityScanner opportunities={analysis.opportunities} />
        <EarlyWarningSystem warnings={analysis.earlyWarnings} />
      </div>
    </section>
  );
}

function InvestigationMode({ investigation }) {
  const cards = [
    { title: "Most important insight", body: investigation.mostImportantInsight, icon: Eye, tone: "signal" },
    { title: "Biggest business risk", body: investigation.biggestRisk, icon: ShieldAlert, tone: "red" },
    { title: "Biggest opportunity", body: investigation.biggestOpportunity, icon: Target, tone: "amber" },
    { title: "Most unusual anomaly", body: investigation.mostUnusualAnomaly, icon: AlertTriangle, tone: "iris" },
    { title: "Executive recommendation", body: investigation.executiveRecommendation, icon: BriefcaseBusiness, tone: "signal" }
  ];

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.35fr_0.65fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-signal/20 bg-signal/10 px-3 py-2 text-sm font-bold text-signal">
            <Brain size={17} /> AI Investigation Mode
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white">Senior analyst investigation, no questions required.</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Reality Engine reads the dataset like an analyst, prioritizes what matters, weighs risk against opportunity,
            and produces a defensible recommendation automatically.
          </p>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white/54">Confidence score</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-5xl font-black text-signal">{Math.round(investigation.confidenceScore)}</span>
              <span className="pb-2 text-sm font-bold text-white/46">/ 100</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded bg-white/10">
              <div className="h-full rounded bg-signal transition-all duration-700" style={{ width: `${investigation.confidenceScore}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((card) => (
            <InsightCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightCard({ title, body, icon: Icon, tone }) {
  const color = tone === "red" ? "text-red-300 bg-red-400/10" : tone === "amber" ? "text-amber bg-amber/10" : tone === "iris" ? "text-iris bg-iris/10" : "text-signal bg-signal/10";
  return (
    <article className="decision-card rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className={`mb-4 inline-grid h-11 w-11 place-items-center rounded-md ${color}`}>
        <Icon size={21} />
      </div>
      <h3 className="font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
    </article>
  );
}

function RelationshipMap({ graph }) {
  const [activeNode, setActiveNode] = useState(graph.nodes[0]?.id || "");
  const active = graph.nodes.find((node) => node.id === activeNode);
  const linkedEdges = graph.edges.filter((edge) => edge.from === activeNode || edge.to === activeNode);

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="relationships">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Relationship discovery engine</p>
          <h2 className="mt-1 text-2xl font-black text-white">Interactive knowledge graph</h2>
        </div>
        <Network className="text-signal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
        <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-ink/45">
          <svg className="h-[360px] w-full" viewBox="0 0 100 100" role="img" aria-label="Relationship map">
            {graph.edges.map((edge) => {
              const from = graph.nodes.find((node) => node.id === edge.from);
              const to = graph.nodes.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              const activeEdge = edge.from === activeNode || edge.to === activeNode;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={activeEdge ? "#f2c94c" : "rgba(10,10,10,0.18)"}
                  strokeWidth={Math.max(0.4, edge.strength * 2.2)}
                  strokeLinecap="round"
                />
              );
            })}
            {graph.nodes.map((node) => {
              const activeNodeState = node.id === activeNode;
              return (
                <g key={node.id} className="cursor-pointer" onClick={() => setActiveNode(node.id)}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size / 12}
                    fill={node.type === "metric" ? "#f2c94c" : "#ffffff"}
                    opacity={activeNodeState ? 1 : 0.74}
                    stroke={activeNodeState ? "#0a0a0a" : "rgba(10,10,10,0.35)"}
                    strokeWidth="0.6"
                  />
                  <text x={node.x} y={node.y + node.size / 12 + 4} textAnchor="middle" fill="#0a0a0a" fontSize="3" fontWeight="700">
                    {node.label.length > 14 ? `${node.label.slice(0, 13)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-signal">
            <Orbit size={18} />
            <h3 className="font-extrabold text-white">{active ? active.label : "Select a node"}</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/55">
            {active ? `${titleCase(active.type)} node with ${linkedEdges.length} detected connection${linkedEdges.length === 1 ? "" : "s"}.` : "Click a graph node to inspect its relationships."}
          </p>
          <div className="mt-4 grid gap-3">
            {linkedEdges.length ? (
              linkedEdges.map((edge) => (
                <div key={`${edge.from}-${edge.to}`} className="rounded-md border border-white/10 bg-ink/35 p-3">
                  <p className="text-sm font-bold text-white">
                    {titleCase(edge.from)} → {titleCase(edge.to)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/52">{edge.insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-white/50">No strong graph connections detected for this node yet.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ForecastingEngine({ forecasts }) {
  const [activeLabel, setActiveLabel] = useState(forecasts[0]?.label || "");
  const active = forecasts.find((forecast) => forecast.label === activeLabel) || forecasts[0];

  const data = useMemo(() => {
    if (!active) return null;
    return {
      labels: ["Current", active.label],
      datasets: [
        {
          label: "Projected",
          data: [active.projected / (1 + active.growth / 100 || 1), active.projected],
          borderColor: "#f2c94c",
          backgroundColor: "rgba(242,201,76,0.18)",
          fill: true,
          tension: 0.35
        },
        {
          label: "Upper confidence",
          data: [active.projected / (1 + active.growth / 100 || 1), active.high],
          borderColor: "rgba(245,196,81,0.8)",
          borderDash: [6, 5],
          pointRadius: 0
        },
        {
          label: "Lower confidence",
          data: [active.projected / (1 + active.growth / 100 || 1), active.low],
          borderColor: "rgba(255,122,144,0.8)",
          borderDash: [6, 5],
          pointRadius: 0
        }
      ]
    };
  }, [active]);

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="forecast">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Forecasting engine</p>
          <h2 className="mt-1 text-2xl font-black text-white">Predictive outlook</h2>
        </div>
        <LineChart className="text-amber" />
      </div>

      {forecasts.length ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {forecasts.map((forecast) => (
              <button
                key={forecast.label}
                type="button"
                className={`rounded-md border px-3 py-2 text-sm font-bold transition ${forecast.label === active?.label ? "border-signal bg-signal text-ink" : "border-white/10 bg-white/[0.05] text-white/64 hover:border-signal/50"}`}
                onClick={() => setActiveLabel(forecast.label)}
              >
                {forecast.label.replace(" Forecast", "")}
              </button>
            ))}
          </div>
          <div className="mt-5 h-[250px]">
            {data ? <Line options={chartOptions} data={data} /> : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ForecastMetric title="Projected" value={formatNumber(active.projected, { compact: true })} />
            <ForecastMetric title="Growth scenario" value={formatPercent(active.growth)} />
            <ForecastMetric title="Risk indicator" value={active.risk} tone={active.risk === "High" ? "red" : "signal"} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <ForecastMetric title="Growth case" value={formatNumber(active.scenarios.growth, { compact: true })} />
            <ForecastMetric title="Stable case" value={formatNumber(active.scenarios.stable, { compact: true })} />
            <ForecastMetric title="Decline case" value={formatNumber(active.scenarios.decline, { compact: true })} tone="red" />
          </div>
          <p className="mt-4 text-xs leading-5 text-white/44">Method: {active.method}. Confidence interval: {formatNumber(active.low, { compact: true })} to {formatNumber(active.high, { compact: true })}.</p>
        </>
      ) : (
        <EmptyState title="Forecasting needs dates" body="Upload data with a date column and a numeric outcome to generate 30 day, 90 day, and 12 month projections." />
      )}
    </section>
  );
}

function ForecastMetric({ title, value, tone = "signal" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/42">{title}</p>
      <p className={`mt-2 text-xl font-black ${tone === "red" ? "text-red-300" : "text-signal"}`}>{value}</p>
    </div>
  );
}

function Boardroom({ boardroom }) {
  const icons = [Brain, CircleDollarSign, Zap, TrendingUp, CheckCircle2];
  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="boardroom">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">AI executive boardroom</p>
        <h2 className="mt-1 text-2xl font-black text-white">Four expert perspectives, one final decision</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {boardroom.map((voice, index) => {
          const Icon = icons[index] || UsersRound;
          return (
            <article key={voice.persona} className={`rounded-lg border p-4 ${index === boardroom.length - 1 ? "border-signal/35 bg-signal/10" : "border-white/10 bg-white/[0.04]"}`}>
              <Icon className={index === boardroom.length - 1 ? "text-signal" : "text-amber"} size={22} />
              <h3 className="mt-3 font-extrabold text-white">{voice.persona}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/38">{voice.focus}</p>
              <p className="mt-3 text-sm leading-6 text-white/64">{voice.recommendation}</p>
              <p className="mt-3 rounded-md bg-white/[0.06] px-3 py-2 text-xs font-bold text-signal">{voice.stance}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OpportunityScanner({ opportunities }) {
  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="opportunities">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Opportunity scanner</p>
          <h2 className="mt-1 text-2xl font-black text-white">Proactive value creation</h2>
        </div>
        <BadgeDollarSign className="text-signal" />
      </div>
      <div className="grid gap-3">
        {opportunities.length ? (
          opportunities.map((item) => (
            <article key={`${item.type}-${item.title}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-amber/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber">{item.type}</span>
                <span className="text-sm font-black text-signal">{item.impact ? formatNumber(item.impact, { compact: true }) : "Qualitative"} impact</span>
              </div>
              <h3 className="mt-3 font-extrabold text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/58">{item.detail}</p>
              <p className="mt-2 text-xs font-bold text-white/42">Confidence: {item.confidence}</p>
            </article>
          ))
        ) : (
          <EmptyState title="No opportunity cluster yet" body="Add revenue, cost, customer, channel, and market fields to improve opportunity scanning." />
        )}
      </div>
    </section>
  );
}

function EarlyWarningSystem({ warnings }) {
  const color = {
    Critical: "border-red-400/40 bg-red-400/10 text-red-200",
    High: "border-red-300/30 bg-red-300/10 text-red-200",
    Medium: "border-amber/30 bg-amber/10 text-amber",
    Low: "border-signal/25 bg-signal/10 text-signal"
  };

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="warnings">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Early warning system</p>
          <h2 className="mt-1 text-2xl font-black text-white">Predictive alerts</h2>
        </div>
        <AlertTriangle className="text-amber" />
      </div>
      <div className="grid gap-3">
        {warnings.map((warning) => (
          <article key={`${warning.title}-${warning.severity}`} className={`rounded-lg border p-4 ${color[warning.severity] || color.Low}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-white">{warning.title}</h3>
              <span className="rounded bg-white/[0.75] px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-ink">{warning.severity}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/66">{warning.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
      <Sparkles className="mx-auto text-white/35" />
      <h3 className="mt-3 font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/52">{body}</p>
    </div>
  );
}
