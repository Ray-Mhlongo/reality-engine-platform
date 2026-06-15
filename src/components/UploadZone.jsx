import { AlertCircle, CheckCircle2, Database, FileSpreadsheet, ShieldCheck, UploadCloud } from "lucide-react";

export function UploadZone({ onFile, isLoading, error, fileName, onLoadSample, isDemoMode, validationMessages = [] }) {
  return (
    <section className="panel rounded-lg p-4 sm:p-6" id="upload">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Demo and upload mode</p>
          <h2 className="mt-1 text-2xl font-black text-white">Test the engine instantly or bring your own data</h2>
        </div>
        <span className={`w-fit rounded-md px-3 py-2 text-sm font-bold ${isDemoMode ? "bg-signal/12 text-signal" : "bg-amber/12 text-amber"}`}>
          {isDemoMode ? "Demo mode active" : "Uploaded dataset active"}
        </span>
      </div>
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
            <FileSpreadsheet size={18} /> Load venture sample dataset
          </button>
          <div className="grid gap-2">
            {validationMessages.map((message) => (
              <ValidationMessage key={`${message.title}-${message.body}`} message={message} />
            ))}
          </div>
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
