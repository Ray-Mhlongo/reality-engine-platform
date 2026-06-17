import { CheckCircle2, Database, Eraser, ShieldCheck, TriangleAlert } from "lucide-react";
import { formatNumber, formatPercent } from "../lib/format";

export function DataQualityStudio({ analysis, datasetMode, hasCleanedDataset, onDatasetMode, onCleanDataset }) {
  const studio = analysis.cleaningStudio;
  const scoreCards = [
    ["Data Quality", studio.scores.dataQualityScore],
    ["Completeness", studio.scores.completenessScore],
    ["Consistency", studio.scores.consistencyScore],
    ["Validity", studio.scores.validityScore],
    ["Uniqueness", studio.scores.uniquenessScore],
    ["Trust", studio.scores.trustScore]
  ];

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="quality-studio">
      <div className="mb-5 grid gap-4 lg:grid-cols-[0.7fr_0.3fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Data Quality & Cleaning Studio</p>
          <h2 className="mt-1 text-2xl font-black text-white">Decide whether the dataset is ready before trusting the analysis</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">{studio.analystCommentary}</p>
        </div>
        <div className="grid gap-2">
          <span className={`inline-flex items-center justify-center gap-2 border px-3 py-2 text-sm font-black ${studio.readiness === "Ready For Analysis" ? "border-signal/30 bg-signal/10 text-signal" : studio.readiness === "Ready With Warnings" ? "border-amber/30 bg-amber/10 text-amber" : "border-red-300/30 bg-red-300/10 text-red-300"}`}>
            {studio.readiness === "Ready For Analysis" ? <CheckCircle2 size={17} /> : <TriangleAlert size={17} />}
            {studio.readiness}
          </span>
          <p className="text-xs leading-5 text-white/58">{studio.readinessReason}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {scoreCards.map(([label, value]) => (
          <article key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/42">{label}</p>
            <p className="mt-2 text-2xl font-black text-signal">{formatPercent(value)}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.68fr_0.32fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-signal">
            <ShieldCheck size={18} />
            <h3 className="font-extrabold text-white">Quality issue register</h3>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {studio.issues.map((item) => (
              <article key={item.name} className="border border-white/10 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-white">{item.name}</p>
                  <span className="text-xs font-black text-signal">{item.severity}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/58">{item.detail}</p>
                <p className="mt-2 text-xs font-bold text-white/42">Count: {formatNumber(item.count)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-signal">
            <Database size={18} />
            <h3 className="font-extrabold text-white">Dataset version</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={datasetMode === "original" ? "primary-button" : "secondary-button"} onClick={() => onDatasetMode("original")}>
              Original Dataset
            </button>
            <button type="button" className={datasetMode === "cleaned" ? "primary-button" : "secondary-button"} onClick={() => onDatasetMode("cleaned")} disabled={!hasCleanedDataset}>
              Cleaned Dataset
            </button>
          </div>
          <button type="button" className="primary-button justify-start" onClick={onCleanDataset}>
            <Eraser size={18} /> One Click Cleaning
          </button>
          <div className="grid gap-2 border border-signal/20 bg-signal/10 p-3">
            {studio.cleaningActions.map((action) => (
              <p key={action} className="text-xs font-semibold text-white/66">{action}</p>
            ))}
          </div>
          <p className="text-xs leading-5 text-white/54">
            Original and cleaned datasets are preserved in browser state. Switching versions recalculates every dashboard, forecast, simulation, report, export, and assistant answer.
          </p>
        </aside>
      </div>
    </section>
  );
}
