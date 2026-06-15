import { AlertCircle, CheckCircle2, Database, FileSpreadsheet, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { useState } from "react";

export function UploadZone({
  onFile,
  isLoading,
  error,
  fileName,
  onLoadSample,
  onClearUploadedFile,
  isDemoMode,
  validationMessages = [],
  datasetStatus,
  processingSteps = []
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const activeLabel = datasetStatus?.source === "uploaded" ? "Uploaded file active" : isDemoMode ? "Demo mode active" : "No active dataset";

  return (
    <section className="panel rounded-lg p-4 sm:p-6" id="upload">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Demo and upload mode</p>
          <h2 className="mt-1 text-2xl font-black text-white">Test the engine instantly or bring your own data</h2>
        </div>
        <span className={`w-fit rounded-md px-3 py-2 text-sm font-bold ${datasetStatus?.source === "none" ? "bg-red-300/10 text-red-300" : isDemoMode ? "bg-signal/12 text-signal" : "bg-amber/12 text-amber"}`}>
          {activeLabel}
        </span>
      </div>
      <DatasetStatusBanner status={datasetStatus} />
      <ProcessingTimeline currentStep={datasetStatus?.processingStep} steps={processingSteps} isLoading={isLoading} />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <label className="group grid min-h-[260px] cursor-pointer place-items-center rounded-lg border border-dashed border-white/20 bg-white/[0.035] p-6 text-center transition hover:border-signal/60 hover:bg-signal/5">
          <input
            className="sr-only"
            type="file"
            accept=".csv,.xlsx"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
            }}
          />
          <span className="grid justify-items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-lg bg-signal/15 text-signal">
              <UploadCloud size={34} />
            </span>
            <span>
              <span className="block text-xl font-extrabold text-white">Upload raw data</span>
              <span className="mt-2 block max-w-xl text-sm leading-6 text-white/62">
                CSV and XLSX files are profiled locally, cleaned, scored, and transformed into executive discoveries.
              </span>
            </span>
            <span className="primary-button">{isLoading ? "Analyzing..." : "Choose file"}</span>
            {fileName ? <span className="text-xs font-semibold text-signal">{fileName}</span> : null}
            {error ? <span className="text-xs font-semibold text-red-300">{error}</span> : null}
          </span>
        </label>

        <div className="grid gap-3">
          <button type="button" className="secondary-button justify-start" onClick={onLoadSample}>
            <FileSpreadsheet size={18} /> Reset to Demo Data
          </button>
          <button type="button" className="secondary-button justify-start" onClick={onClearUploadedFile}>
            <XCircle size={18} /> Clear Uploaded File
          </button>
          <div className="grid gap-2">
            {validationMessages.map((message) => (
              <ValidationMessage key={`${message.title}-${message.body}`} message={message} />
            ))}
          </div>
          <button type="button" className="text-left text-xs font-bold uppercase tracking-[0.16em] text-signal underline decoration-signal/40 underline-offset-4" onClick={() => setShowDiagnostics((value) => !value)}>
            {showDiagnostics ? "Hide diagnostics" : "Diagnostics"}
          </button>
          {showDiagnostics ? <Diagnostics status={datasetStatus} /> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Capability icon={FileSpreadsheet} title="CSV + Excel ingest" body="Header normalization, type inference, and empty row removal." />
            <Capability icon={ShieldCheck} title="Quality controls" body="Missing values, duplicates, outliers, and confidence score." />
            <Capability icon={Database} title="Production persistence" body="Metadata API prepared for Google Apps Script and PostgreSQL." />
          </div>
        </div>
      </div>
    </section>
  );
}

function DatasetStatusBanner({ status }) {
  if (!status) return null;
  const headers = status.headers?.length ? status.headers.slice(0, 8).join(", ") : "No headers detected";
  const lastAnalyzed = status.lastAnalyzedAt ? new Date(status.lastAnalyzedAt).toLocaleString() : "Pending";
  const title = status.source === "uploaded" ? "Analyzing uploaded file" : status.source === "demo" ? "Analyzing demo data" : "No active dataset";

  return (
    <div className="mb-5 grid gap-3 border border-signal/25 bg-signal/10 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/62">
          {status.fileName} · {status.rowCount} rows loaded · {status.columnCount} columns loaded
        </p>
        <p className="mt-1 text-xs leading-5 text-white/58">Headers detected: {headers}</p>
      </div>
      <div className="grid gap-1 text-sm font-bold text-white/68 md:text-right">
        <span>Active source: {status.source === "uploaded" ? "Uploaded file" : status.source === "demo" ? "Demo data" : "None"}</span>
        <span>Last analyzed: {lastAnalyzed}</span>
      </div>
    </div>
  );
}

function ProcessingTimeline({ currentStep, steps, isLoading }) {
  if (!steps.length) return null;
  const activeIndex = Math.max(0, steps.indexOf(currentStep));
  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isComplete = !isLoading || index < activeIndex;
        return (
          <div key={step} className={`border p-3 text-xs font-bold ${isActive ? "border-signal bg-signal/15 text-signal" : isComplete ? "border-signal/25 bg-signal/10 text-white/68" : "border-white/10 bg-white/[0.035] text-white/46"}`}>
            {step}
          </div>
        );
      })}
    </div>
  );
}

function Diagnostics({ status }) {
  const rows = [
    ["activeDataset rows", status?.rowCount ?? 0],
    ["activeDataset columns", status?.columnCount ?? 0],
    ["activeSource", status?.source ?? "none"],
    ["isDemoMode", status?.isDemoMode ? "true" : "false"],
    ["analysis generated", status?.analysisGenerated ? "true" : "false"],
    ["components receiving uploaded data", status?.componentsReceivingUploadedData ? "true" : "false"]
  ];
  return (
    <div className="grid gap-2 border border-white/10 bg-white/[0.04] p-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-white/58">{label}</span>
          <span className="font-black text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}

function ValidationMessage({ message }) {
  const isError = message.type === "error";
  const isWarning = message.type === "warning";
  const classes = isError
    ? "border-red-300/30 bg-red-400/10 text-red-200"
    : isWarning
      ? "border-amber/30 bg-amber/10 text-amber"
      : "border-signal/25 bg-signal/10 text-signal";
  const Icon = isError || isWarning ? AlertCircle : CheckCircle2;
  return (
    <div className={`rounded-lg border p-3 ${classes}`}>
      <div className="flex gap-2">
        <Icon className="mt-0.5 shrink-0" size={16} />
        <div>
          <p className="text-sm font-extrabold text-white">{message.title}</p>
          <p className="mt-1 text-xs leading-5 text-white/62">{message.body}</p>
        </div>
      </div>
    </div>
  );
}

function Capability({ icon: Icon, title, body }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-md bg-white/[0.07] text-amber">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-white/58">{body}</p>
    </div>
  );
}
