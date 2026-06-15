import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Download,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  Github,
  Linkedin,
  LockKeyhole,
  SearchCheck,
  Sparkles,
  UploadCloud
} from "lucide-react";
import { useState } from "react";
import { buildInsightsExportRows, buildSimulationExportRows, downloadCsv, exportReportPdf } from "../lib/export";

export function HowItWorks() {
  const steps = [
    { title: "Upload CSV or Excel data", icon: UploadCloud },
    { title: "Reality Engine profiles and investigates the dataset", icon: SearchCheck },
    { title: "AI discovers risks, opportunities, trends, and anomalies", icon: BrainCircuit },
    { title: "Users run simulations and forecasts", icon: BarChart3 },
    { title: "The system generates executive recommendations", icon: CheckCircle2 }
  ];

  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="how-it-works">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">How it works</p>
        <h2 className="mt-1 text-2xl font-black text-white">From raw data to boardroom recommendation</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-signal/12 text-signal">
                <step.icon size={20} />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Step {index + 1}</span>
            </div>
            <h3 className="text-sm font-extrabold leading-6 text-white">{step.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ExportCenter({ analysis, scenario }) {
  return (
    <section className="panel reveal-card rounded-lg p-4 sm:p-6" id="exports">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Portfolio-ready outputs</p>
          <h2 className="mt-1 text-2xl font-black text-white">Export boardroom evidence</h2>
        </div>
        <Download className="text-amber" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <button type="button" className="secondary-button justify-start" onClick={exportReportPdf}>
          <FileDown size={18} /> Export Executive Report as PDF
        </button>
        <button
          type="button"
          className="secondary-button justify-start"
          onClick={() => downloadCsv("reality-engine-insights.csv", buildInsightsExportRows(analysis))}
        >
          <FileSpreadsheet size={18} /> Export Insights as CSV
        </button>
        <button
          type="button"
          className="secondary-button justify-start"
          onClick={() => downloadCsv("reality-engine-simulation.csv", buildSimulationExportRows(scenario))}
        >
          <FileSpreadsheet size={18} /> Export Simulation Results as CSV
        </button>
      </div>
    </section>
  );
}

export function PrivacyNotice() {
  return (
    <section className="rounded-lg border border-signal/20 bg-signal/10 p-4">
      <div className="flex gap-3">
        <LockKeyhole className="mt-1 shrink-0 text-signal" size={20} />
        <p className="text-sm leading-6 text-white/72">
          <strong className="text-white">Privacy notice:</strong> Reality Engine processes uploaded files locally in the
          browser for the MVP demo unless backend integration is enabled.
        </p>
      </div>
    </section>
  );
}

export function CaseStudyModal() {
  const [open, setOpen] = useState(false);
  const sections = [
    {
      title: "Problem",
      body: "Most analytics tools wait for users to ask the right question. Busy teams need a system that investigates raw data, detects what matters, and moves faster than dashboard building."
    },
    {
      title: "Solution",
      body: "Reality Engine turns CSV and Excel uploads into data profiles, autonomous discoveries, forecasts, simulations, boardroom personas, risk alerts, opportunities, and executive recommendations."
    },
    {
      title: "Features",
      body: "AI Investigation Mode, relationship discovery map, forecasting engine, executive boardroom, opportunity scanner, early warning system, natural language assistant, and exportable reports."
    },
    {
      title: "Tech Stack",
      body: "React, Tailwind CSS, Chart.js, Vite, Papa Parse, read-excel-file, Google Apps Script API scaffold, PostgreSQL-ready metadata architecture, and OpenRouter-ready AI integration."
    },
    {
      title: "Business Impact",
      body: "The product compresses hours of manual analyst triage into an immediate executive decision experience that shows risks, opportunities, forecasts, and recommended next actions."
    },
    {
      title: "What I learned",
      body: "I learned how to design an analyst-grade product around decision workflows, not just visualizations, and how to structure a frontend so future AI agents and backend services can plug in cleanly."
    }
  ];

  return (
    <>
      <button id="case-study" type="button" className="secondary-button" onClick={() => setOpen(true)}>
        <BookOpen size={18} /> View case study
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-steel p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Flagship portfolio case study</p>
                <h2 className="mt-1 text-3xl font-black text-white">Reality Engine</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close case study">
                X
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {sections.map((section) => (
                <article key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <h3 className="font-extrabold text-white">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{section.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PortfolioFooter() {
  const links = [
    ["Portfolio", "https://ray-mhlongo.github.io/ray-mhlongo-portfolio/index.html", Sparkles],
    ["GitHub", "https://github.com/Ray-Mhlongo/reality-engine-platform", Github],
    ["LinkedIn", "https://www.linkedin.com/in/raymhlongo/", Linkedin]
  ];

  return (
    <footer className="border-t border-white/10 bg-ink/70 py-8">
      <div className="shell flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-black text-white">Built By Ray Mhlongo</p>
          <p className="mt-1 text-sm text-white/50">Flagship AI decision intelligence portfolio project.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map(([label, href, Icon]) => (
            <a key={label} className="secondary-button" href={href} target="_blank" rel="noreferrer">
              <Icon size={17} /> {label} <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
