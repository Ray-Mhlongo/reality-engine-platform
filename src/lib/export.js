import { formatNumber, titleCase } from "./format";

export function downloadCsv(filename, rows) {
  const safeRows = rows.length ? rows : [{ Message: "No records available" }];
  const headers = Object.keys(safeRows[0]);
  const csv = [
    headers.join(","),
    ...safeRows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportReportPdf() {
  window.print();
}

export function buildInsightsExportRows(analysis) {
  return [
    ...analysis.discoveryFeed.map((item) => ({
      Section: "Discovery",
      Type: item.label,
      Title: item.title,
      Detail: item.body,
      Priority: item.priority
    })),
    ...analysis.opportunities.map((item) => ({
      Section: "Opportunity",
      Type: item.type,
      Title: item.title,
      Detail: item.detail,
      Priority: item.confidence,
      EstimatedImpact: formatNumber(item.impact || 0)
    })),
    ...analysis.earlyWarnings.map((item) => ({
      Section: "Early Warning",
      Type: item.severity,
      Title: item.title,
      Detail: item.detail,
      Priority: item.severity
    }))
  ];
}

export function buildSimulationExportRows(scenario) {
  if (!scenario) return [];
  return [
    {
      Measure: titleCase(scenario.column),
      ChangePercent: scenario.changePercent,
      Baseline: scenario.baseline,
      Projected: scenario.projected,
      Delta: scenario.delta,
      AverageBefore: scenario.averageBefore,
      AverageAfter: scenario.averageAfter
    }
  ];
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
