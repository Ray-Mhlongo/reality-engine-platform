import {
  Blocks,
  BrainCircuit,
  ChevronRight,
  Cloud,
  DatabaseZap,
  GitMerge,
  PlayCircle,
  LockKeyhole,
  Moon,
  Network,
  PlugZap,
  Radar,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import { Assistant } from "./components/Assistant";
import { Dashboard } from "./components/Dashboard";
import { DecisionIntelligence } from "./components/DecisionIntelligence";
import { IntelligenceReport } from "./components/IntelligenceReport";
import { CaseStudyModal, ExportCenter, HowItWorks, PortfolioFooter, PrivacyNotice } from "./components/PortfolioPolish";
import { SimulationEngine } from "./components/SimulationEngine";
import { UploadZone } from "./components/UploadZone";
import { analyzeDataset, runScenario } from "./lib/analysis";
import { parseDataFile } from "./lib/parser";
import { persistDatasetMetadata } from "./services/realityApi";

const sampleRows = [
  { Date: "2026-01-01", Region: "Gauteng", Product: "Insight Pro", Channel: "Enterprise", Sales: "182000", Cost: "91000", Customers: "42", Churn: "3" },
  { Date: "2026-01-08", Region: "Western Cape", Product: "Insight Pro", Channel: "Partner", Sales: "156000", Cost: "87000", Customers: "38", Churn: "4" },
  { Date: "2026-01-15", Region: "KwaZulu-Natal", Product: "Signal AI", Channel: "Enterprise", Sales: "121000", Cost: "69000", Customers: "31", Churn: "6" },
  { Date: "2026-01-22", Region: "Gauteng", Product: "Reality API", Channel: "Self Serve", Sales: "98000", Cost: "47000", Customers: "55", Churn: "5" },
  { Date: "2026-02-01", Region: "Gauteng", Product: "Insight Pro", Channel: "Enterprise", Sales: "205000", Cost: "97000", Customers: "48", Churn: "2" },
  { Date: "2026-02-08", Region: "Western Cape", Product: "Signal AI", Channel: "Partner", Sales: "132000", Cost: "76000", Customers: "35", Churn: "4" },
  { Date: "2026-02-15", Region: "KwaZulu-Natal", Product: "Reality API", Channel: "Self Serve", Sales: "91000", Cost: "52000", Customers: "46", Churn: "8" },
  { Date: "2026-02-22", Region: "Gauteng", Product: "Signal AI", Channel: "Enterprise", Sales: "231000", Cost: "111000", Customers: "53", Churn: "2" },
  { Date: "2026-03-01", Region: "Western Cape", Product: "Reality API", Channel: "Self Serve", Sales: "105000", Cost: "54000", Customers: "61", Churn: "7" },
  { Date: "2026-03-08", Region: "KwaZulu-Natal", Product: "Insight Pro", Channel: "Partner", Sales: "99000", Cost: "61000", Customers: "29", Churn: "9" },
  { Date: "2026-03-15", Region: "Gauteng", Product: "Signal AI", Channel: "Enterprise", Sales: "268000", Cost: "126000", Customers: "59", Churn: "2" },
  { Date: "2026-03-22", Region: "Western Cape", Product: "Insight Pro", Channel: "Partner", Sales: "148000", Cost: "82000", Customers: "36", Churn: "5" },
  { Date: "2026-04-01", Region: "KwaZulu-Natal", Product: "Reality API", Channel: "Self Serve", Sales: "73000", Cost: "59000", Customers: "44", Churn: "12" },
  { Date: "2026-04-08", Region: "Gauteng", Product: "Insight Pro", Channel: "Enterprise", Sales: "295000", Cost: "133000", Customers: "64", Churn: "1" },
  { Date: "2026-04-15", Region: "Western Cape", Product: "Signal AI", Channel: "Partner", Sales: "166000", Cost: "88000", Customers: "41", Churn: "4" },
  { Date: "2026-04-22", Region: "KwaZulu-Natal", Product: "Insight Pro", Channel: "Partner", Sales: "65000", Cost: "62000", Customers: "27", Churn: "14" },
  { Date: "2026-05-01", Region: "Gauteng", Product: "Signal AI", Channel: "Enterprise", Sales: "338000", Cost: "151000", Customers: "72", Churn: "1" },
  { Date: "2026-05-08", Region: "Western Cape", Product: "Reality API", Channel: "Self Serve", Sales: "118000", Cost: "57000", Customers: "66", Churn: "6" },
  { Date: "2026-05-15", Region: "KwaZulu-Natal", Product: "Signal AI", Channel: "Partner", Sales: "81000", Cost: "70000", Customers: "30", Churn: "16" },
  { Date: "2026-05-22", Region: "Gauteng", Product: "Insight Pro", Channel: "Enterprise", Sales: "362000", Cost: "168000", Customers: "78", Churn: "1" }
];

const sampleDataset = {
  rows: sampleRows,
  columns: Object.keys(sampleRows[0]),
  metadata: {
    rowCount: sampleRows.length,
    columnCount: Object.keys(sampleRows[0]).length,
    importedAt: new Date().toISOString()
  }
};

const emptyDataset = {
  rows: [],
  columns: [],
  metadata: {
    rowCount: 0,
    columnCount: 0,
    importedAt: new Date().toISOString()
  }
};

const processingSteps = [
  "Reading file",
  "Parsing rows",
  "Profiling dataset",
  "Generating discoveries",
  "Running decision intelligence",
  "Analysis complete"
];

export default function App() {
  const [activeDataset, setActiveDataset] = useState(sampleDataset);
  const [activeFileName, setActiveFileName] = useState("venture-sample.csv");
  const [activeSource, setActiveSource] = useState("demo");
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(new Date().toISOString());
  const [processingStep, setProcessingStep] = useState("Analysis complete");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isDemoMode = activeSource === "demo";
  const analysis = useMemo(() => analyzeDataset(activeDataset), [activeDataset, activeSource, lastAnalyzedAt]);
  const [scenario, setScenario] = useState(() => runScenario({ analysis: analyzeDataset(sampleDataset), dataset: sampleDataset, changePercent: 10 }));
  const validationMessages = useMemo(() => getValidationMessages(activeDataset, analysis, isDemoMode, activeSource), [activeDataset, analysis, isDemoMode, activeSource]);
  const datasetStatus = useMemo(
    () => ({
      fileName: activeFileName,
      source: activeSource,
      isDemoMode,
      rowCount: activeDataset.metadata?.rowCount || activeDataset.rows.length,
      columnCount: activeDataset.metadata?.columnCount || activeDataset.columns.length,
      headers: activeDataset.columns,
      lastAnalyzedAt,
      processingStep,
      analysisGenerated: Boolean(analysis),
      componentsReceivingUploadedData: activeSource === "uploaded" && !isDemoMode
    }),
    [activeDataset, activeFileName, activeSource, analysis, isDemoMode, lastAnalyzedAt, processingStep]
  );

  async function handleFile(file) {
    setIsLoading(true);
    setError("");
    try {
      setProcessingStep("Reading file");
      await waitForUi();
      setProcessingStep("Parsing rows");
      const parsed = await parseDataFile(file);
      setProcessingStep("Profiling dataset");
      const nextAnalysis = analyzeDataset(parsed);
      if (!parsed.rows.length) {
        throw new Error("No file uploaded or the file does not contain usable rows.");
      }
      setProcessingStep("Generating discoveries");
      await waitForUi();
      setProcessingStep("Running decision intelligence");
      await waitForUi();
      setActiveDataset(parsed);
      setActiveFileName(file.name);
      setActiveSource("uploaded");
      setLastAnalyzedAt(new Date().toISOString());
      setScenario(runScenario({ analysis: nextAnalysis, dataset: parsed, changePercent: 10 }));
      setProcessingStep("Analysis complete");
      await persistDatasetMetadata(parsed.metadata, {
        qualityScore: nextAnalysis.qualityScore,
        columns: nextAnalysis.columnProfiles
      });
    } catch (uploadError) {
      setError(uploadError.message || "Could not analyze this file.");
    } finally {
      setIsLoading(false);
    }
  }

  function loadSample() {
    const nextAnalysis = analyzeDataset(sampleDataset);
    setActiveDataset(sampleDataset);
    setActiveFileName("venture-sample.csv");
    setActiveSource("demo");
    setLastAnalyzedAt(new Date().toISOString());
    setProcessingStep("Analysis complete");
    setScenario(runScenario({ analysis: nextAnalysis, dataset: sampleDataset, changePercent: 10 }));
    setError("");
  }

  function clearUploadedFile() {
    setActiveDataset(emptyDataset);
    setActiveFileName("No active file");
    setActiveSource("none");
    setLastAnalyzedAt(new Date().toISOString());
    setProcessingStep("Analysis complete");
    setScenario(null);
    setError("");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="shell grid gap-5 pb-12 pt-4 sm:gap-6">
        <Hero onLoadSample={loadSample} />
        <HowItWorks />
        <UploadZone
          onFile={handleFile}
          isLoading={isLoading}
          error={error}
          fileName={activeFileName}
          onLoadSample={loadSample}
          onClearUploadedFile={clearUploadedFile}
          isDemoMode={isDemoMode}
          validationMessages={validationMessages}
          datasetStatus={datasetStatus}
          processingSteps={processingSteps}
        />
        <PrivacyNotice />
        <DecisionIntelligence analysis={analysis} />
        <Dashboard dataset={activeDataset} analysis={analysis} scenario={scenario} />
        <IntelligenceReport intelligence={analysis.intelligence} analysis={analysis} scenario={scenario} />
        <ExportCenter analysis={analysis} scenario={scenario} />
        <div className="grid gap-5 xl:grid-cols-[0.58fr_0.42fr]">
          <Assistant dataset={activeDataset} analysis={analysis} />
          <SimulationEngine dataset={activeDataset} analysis={analysis} scenario={scenario} onScenario={setScenario} />
        </div>
        <Architecture />
      </main>
      <PortfolioFooter />
    </div>
  );
}

function Header() {
  const links = [
    ["Upload", "#upload"],
    ["How", "#how-it-works"],
    ["Investigation", "#investigation"],
    ["Analyst", "#senior-analyst"],
    ["Data Team", "#data-team"],
    ["Forecast", "#forecast"],
    ["Boardroom", "#boardroom"],
    ["Exports", "#exports"]
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
      <nav className="shell flex min-h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-signal text-ink">
            <Sparkles size={22} />
          </span>
          <span>
            <span className="block text-base font-black text-white">Reality Engine</span>
            <span className="block text-xs font-semibold text-white/46">AI Decision Intelligence</span>
          </span>
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="rounded-md px-3 py-2 text-sm font-semibold text-white/58 transition hover:bg-white/[0.06] hover:text-white">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-button" aria-label="Dark mode">
            <Moon size={18} />
          </button>
          <a className="primary-button hidden sm:inline-flex" href="#investigation">
            Open V2 <ChevronRight size={17} />
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero({ onLoadSample }) {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-signal/20 bg-signal/10 px-3 py-2 text-sm font-bold text-signal">
          <Radar size={16} /> AI powered decision intelligence system
        </div>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-8xl">
          Reality Engine
        </h1>
        <p className="mt-4 text-2xl font-extrabold text-signal sm:text-3xl">AI Powered Decision Intelligence System</p>
        <p className="mt-3 text-xl font-bold text-white">Upload your data. The AI figures out what matters.</p>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
          Traditional analytics tells teams what happened. Reality Engine discovers what matters, predicts what is likely
          to happen next, and recommends what leaders should do before anyone asks a question.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a className="primary-button" href="#upload">
            Launch investigation <ChevronRight size={18} />
          </a>
          <a className="secondary-button" href="reality-engine.html">
            Explore Reality Engine
          </a>
          <button type="button" className="secondary-button" onClick={onLoadSample}>
            <PlayCircle size={18} /> Try demo mode
          </button>
          <a className="secondary-button" href="#boardroom">
            Enter boardroom
          </a>
          <CaseStudyModal />
        </div>
      </div>

      <div className="panel rounded-lg p-4">
        <div className="grid gap-3">
          <VisualStep icon={PlugZap} title="Connect" body="CSV, Excel, Google Login, secure email, or database connector." />
          <VisualStep icon={BrainCircuit} title="Investigate" body="AI detective mode extracts the most important insight, risk, opportunity, anomaly, and recommendation." />
          <VisualStep icon={GitMerge} title="Predict" body="Forecasts, relationship maps, what-if scenarios, and early warnings move the product beyond dashboards." />
          <VisualStep icon={Cloud} title="Decide" body="A boardroom of AI personas reviews the same evidence and produces executive-ready recommendations." />
        </div>
      </div>
    </section>
  );
}

function getValidationMessages(dataset, analysis, isDemoMode, activeSource) {
  const messages = [];
  if (!dataset?.rows?.length) {
    messages.push({ type: "error", title: "No file uploaded", body: "Upload a CSV/XLSX file or load demo mode to start the investigation." });
    return messages;
  }
  if (dataset.rows.length < 10) {
    messages.push({ type: "warning", title: "Small dataset warning", body: "Forecasts and correlations are less reliable with fewer than 10 rows." });
  }
  if (!analysis.numericColumns.length) {
    messages.push({ type: "error", title: "No numeric columns detected", body: "Add numeric fields such as sales, revenue, cost, quantity, profit, or customers." });
  }
  if (!analysis.dateColumns.length) {
    messages.push({ type: "warning", title: "Missing required columns", body: "A date column improves trend detection, forecasting, and decline analysis." });
  }
  if (isDemoMode) {
    messages.push({ type: "info", title: "Demo mode active", body: "Recruiters can test the full system using sample business data without uploading a file." });
  }
  if (activeSource === "uploaded") {
    messages.push({ type: "info", title: "Uploaded file active", body: "Every section is now using the uploaded dataset as the active source of truth." });
  }
  return messages;
}

function waitForUi() {
  return new Promise((resolve) => setTimeout(resolve, 40));
}

function VisualStep({ icon: Icon, title, body }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-white/[0.07] text-signal">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-extrabold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/58">{body}</p>
      </div>
    </div>
  );
}

function Architecture() {
  const items = [
    { icon: LockKeyhole, title: "Authentication", body: "Google OAuth or secure magic-link email login with tenant-scoped datasets." },
    { icon: DatabaseZap, title: "PostgreSQL metadata", body: "Store dataset lineage, profiles, quality snapshots, report history, and simulation runs." },
    { icon: Blocks, title: "Multi-agent ready", body: "Detective, forecasting, finance, operations, growth, and research agents can share typed artifacts." },
    { icon: Network, title: "Knowledge graph path", body: "Customers, products, regions, suppliers, metrics, risks, and decisions become graph nodes for compounding intelligence." }
  ];

  return (
    <section className="panel rounded-lg p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Future ready architecture</p>
        <h2 className="mt-1 text-2xl font-black text-white">Built as a startup foundation</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <item.icon className="text-amber" size={22} />
            <h3 className="mt-3 font-extrabold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
