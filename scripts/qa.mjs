import { analyzeDataset, answerQuestion, cleanDataset, runScenario } from "../src/lib/analysis.js";
import { buildInsightsExportRows, buildSimulationExportRows } from "../src/lib/export.js";
import { parseDataFile } from "../src/lib/parser.js";
import { strToU8, zipSync } from "fflate";

const cases = [
  {
    name: "demo mode",
    dataset: dataset([
      ["Date", "Region", "Product", "Sales", "Cost", "Churn"],
      ["2026-01-01", "Gauteng", "Alpha", "1000", "450", "2"],
      ["2026-01-08", "Gauteng", "Alpha", "1300", "520", "1"],
      ["2026-01-15", "Cape", "Beta", "900", "480", "5"],
      ["2026-01-22", "Cape", "Beta", "1500", "620", "3"],
      ["2026-02-01", "KZN", "Gamma", "700", "510", "9"],
      ["2026-02-08", "KZN", "Gamma", "640", "520", "12"],
      ["2026-02-15", "Gauteng", "Alpha", "1800", "800", "1"],
      ["2026-02-22", "Cape", "Beta", "1600", "700", "4"],
      ["2026-03-01", "Gauteng", "Alpha", "2100", "900", "1"],
      ["2026-03-08", "KZN", "Gamma", "500", "490", "16"]
    ])
  },
  {
    name: "small dataset",
    dataset: dataset([
      ["Date", "Sales"],
      ["2026-01-01", "100"],
      ["2026-01-02", "120"]
    ])
  },
  {
    name: "missing values and duplicates",
    dataset: dataset([
      ["Date", "Region", "Sales"],
      ["2026-01-01", "North", "100"],
      ["2026-01-01", "North", "100"],
      ["2026-01-02", "", ""],
      ["2026-01-03", "South", "9000"],
      ["2026-01-04", "South", "110"]
    ])
  },
  {
    name: "no numeric columns",
    dataset: dataset([
      ["Customer", "Region"],
      ["A", "North"],
      ["B", "South"],
      ["C", "South"]
    ]),
    noNumeric: true
  },
  {
    name: "no date columns",
    dataset: dataset([
      ["Region", "Sales", "Cost"],
      ["North", "100", "40"],
      ["South", "150", "70"],
      ["East", "90", "60"],
      ["West", "200", "120"],
      ["North", "180", "75"]
    ])
  },
  {
    name: "only numeric columns",
    dataset: dataset([
      ["Sales", "Cost", "Customers"],
      ["100", "40", "10"],
      ["150", "70", "12"],
      ["90", "60", "8"],
      ["200", "120", "15"],
      ["180", "75", "14"]
    ])
  },
  {
    name: "empty file",
    dataset: { rows: [], columns: [], metadata: { rowCount: 0, columnCount: 0, importedAt: new Date().toISOString() } },
    empty: true
  },
  {
    name: "financial dataset",
    dataset: dataset([
      ["Month", "Revenue", "Cost", "Profit", "Region"],
      ["2026-01-01", "10000", "7000", "3000", "North"],
      ["2026-02-01", "12000", "8500", "3500", "North"],
      ["2026-03-01", "9000", "8200", "800", "South"],
      ["2026-04-01", "16000", "9000", "7000", "South"],
      ["2026-05-01", "18000", "11000", "7000", "East"],
      ["2026-06-01", "22000", "14000", "8000", "East"]
    ])
  },
  {
    name: "operations dataset",
    dataset: dataset([
      ["Date", "Branch", "Inventory", "Units", "Status"],
      ["2026-01-01", "A", "400", "90", "Complete"],
      ["2026-01-02", "A", "300", "120", "Complete"],
      ["2026-01-03", "B", "80", "50", "Delayed"],
      ["2026-01-04", "B", "40", "20", "Delayed"],
      ["2026-01-05", "C", "500", "150", "Complete"]
    ])
  },
  {
    name: "customer dataset",
    dataset: dataset([
      ["Date", "Customer", "Product", "Channel", "Sales", "Churn"],
      ["2026-01-01", "Acme", "Pro", "Partner", "900", "1"],
      ["2026-01-02", "Acme", "Pro", "Partner", "1200", "1"],
      ["2026-01-03", "Beta", "Lite", "Self Serve", "300", "8"],
      ["2026-01-04", "Delta", "Pro", "Enterprise", "2000", "2"],
      ["2026-01-05", "Beta", "Lite", "Self Serve", "250", "10"]
    ])
  },
  {
    name: "large dataset",
    dataset: dataset([
      ["Date", "Region", "Revenue", "Cost"],
      ...Array.from({ length: 80 }, (_, index) => [
        `2026-03-${String((index % 28) + 1).padStart(2, "0")}`,
        ["North", "South", "East", "West"][index % 4],
        String(1000 + index * 35),
        String(500 + index * 15)
      ])
    ])
  }
];

for (const testCase of cases) {
  const analysis = analyzeDataset(testCase.dataset);
  assert(Number.isFinite(analysis.qualityScore), `${testCase.name}: quality score must be finite`);
  assert(Array.isArray(analysis.discoveryFeed), `${testCase.name}: discovery feed must exist`);
  assert(analysis.scoreBreakdown, `${testCase.name}: score breakdown must exist`);
  assert(analysis.investigation, `${testCase.name}: investigation must exist`);
  assert(analysis.cleaningStudio?.readiness, `${testCase.name}: cleaning studio must produce readiness`);
  assert(Number.isFinite(analysis.cleaningStudio.scores.trustScore), `${testCase.name}: trust score must be finite`);
  assert(analysis.seniorAnalyst?.executiveSummary?.length >= 3, `${testCase.name}: senior analyst mode must include executive summary`);
  assert(analysis.dataTeam?.length === 10, `${testCase.name}: data team must include ten specialist roles`);
  assert(new Set(analysis.dataTeam.map((role) => role.recommendedAction)).size >= 6, `${testCase.name}: data roles must give differentiated recommendations`);
  assert(analysis.dataTeam.every((role) => role.businessImpact && role.confidence), `${testCase.name}: each role must include business impact and confidence`);
  assert(analysis.businessReasoning?.length >= 1, `${testCase.name}: business reasoning must exist`);
  assert(analysis.rootCauseInvestigations?.length >= 1, `${testCase.name}: root-cause investigations must exist`);
  assert(analysis.executiveConsulting?.decisions?.length === 3, `${testCase.name}: executive consulting must produce three leadership decisions`);
  assert(analysis.engineeringReview?.recommendation, `${testCase.name}: data engineering review must exist`);
  assert(analysis.analyticsEngineeringReview?.metricLayer, `${testCase.name}: analytics engineering review must exist`);
  assert(analysis.financialAnalysis?.financialRiskAssessment, `${testCase.name}: financial analysis must exist`);
  assert(analysis.operationsAnalysis?.operationalHealthAssessment, `${testCase.name}: operations analysis must exist`);
  assert(analysis.growthAnalysis?.growthOpportunityAssessment, `${testCase.name}: growth analysis must exist`);
  assert(analysis.boardroom.length === 5, `${testCase.name}: boardroom must include final recommendation`);
  assert(typeof answerQuestion("What anomalies exist?", testCase.dataset, analysis) === "string", `${testCase.name}: assistant fallback must answer`);
  assert(buildInsightsExportRows(analysis).some((row) => row.Section === "Data Team Intelligence"), `${testCase.name}: exports must include data team evidence`);

  if (testCase.noNumeric) {
    assert(analysis.numericColumns.length === 0, `${testCase.name}: should not detect numeric columns`);
  }

  if (!testCase.empty && analysis.numericColumns.length) {
    const scenario = runScenario({ analysis, dataset: testCase.dataset, changePercent: 10 });
    assert(scenario?.riskLevel, `${testCase.name}: simulation must include risk level`);
    assert(scenario?.recommendation, `${testCase.name}: simulation must include recommendation`);
    assert(buildSimulationExportRows(scenario).length === 1, `${testCase.name}: simulation export must use generated scenario`);
  }

  if (testCase.name.includes("missing values")) {
    const cleaned = cleanDataset(testCase.dataset);
    const cleanedAnalysis = analyzeDataset(cleaned);
    assert(cleaned.rows.length < testCase.dataset.rows.length, `${testCase.name}: cleaning should remove blank/duplicate rows`);
    assert(cleanedAnalysis.cleaningStudio.scores.uniquenessScore >= analysis.cleaningStudio.scores.uniquenessScore, `${testCase.name}: cleaning should not reduce uniqueness score`);
  }

  if (!testCase.empty && !analysis.dateColumns.length) {
    assert(analysis.forecasts.length === 0, `${testCase.name}: forecast must fall back when dates are missing`);
    assert(analysis.limitations.some((item) => item.toLowerCase().includes("date")), `${testCase.name}: limitations must explain missing date impact`);
  }
}

const parsedNormalCsv = await parseDataFile(csvFile("normal.csv", "Date,Region,Sales\n2026-01-01,North,100\n2026-01-02,South,120"));
assert(parsedNormalCsv.rows.length === 2, "CSV parser: normal CSV should produce two rows");
assert(parsedNormalCsv.columns.includes("Sales"), "CSV parser: normal CSV should preserve headers");

const parsedMessyCsv = await parseDataFile(csvFile("messy.csv", "\n Messy Sales , ,Region\n100,,North\n, ,\n240,,South\n"));
assert(parsedMessyCsv.rows.length === 2, "CSV parser: messy CSV should drop blank rows");
assert(parsedMessyCsv.columns.length === 3, "CSV parser: messy CSV should create safe missing headers");

const parsedInlineStringXlsx = await parseDataFile(emptyInlineStringXlsxFile());
assert(parsedInlineStringXlsx.rows.length === 2, "XLSX parser: empty inlineStr workbook should preserve usable rows");
assert(parsedInlineStringXlsx.rows[0].Customer === "", "XLSX parser: empty inlineStr cell should become an empty string");
assert(parsedInlineStringXlsx.columns.includes("Revenue"), "XLSX parser: inlineStr workbook should preserve headers");

await expectReject(() => parseDataFile(csvFile("empty.csv", "")), "CSV parser: empty file should reject");
await expectReject(() => parseDataFile(new File(["hello"], "bad.txt", { type: "text/plain" })), "Parser: invalid file type should reject");

const activeFlowA = simulateActiveUpload("uploaded-a.csv", parsedNormalCsv);
const activeFlowB = simulateActiveUpload(
  "uploaded-b.csv",
  dataset([
    ["Date", "Region", "Revenue", "Churn"],
    ["2026-01-01", "East", "500", "1"],
    ["2026-01-08", "East", "800", "2"],
    ["2026-01-15", "West", "1200", "6"],
    ["2026-01-22", "West", "1800", "8"],
    ["2026-02-01", "West", "2400", "10"]
  ])
);
assert(activeFlowA.activeSource === "uploaded" && activeFlowA.isDemoMode === false, "Active flow: upload must exit demo mode");
assert(activeFlowA.activeFileName === "uploaded-a.csv", "Active flow: file name must be stored");
assert(activeFlowA.rowCount !== activeFlowB.rowCount, "Active flow: row count must reflect uploaded file");
assert(activeFlowA.qualityScore !== activeFlowB.qualityScore || activeFlowA.report !== activeFlowB.report, "Active flow: different uploads must produce different analysis output");
assert(activeFlowA.scenario?.baseline !== activeFlowB.scenario?.baseline, "Active flow: simulation must recalculate from uploaded rows");
assert(activeFlowA.seniorAnalyst !== activeFlowB.seniorAnalyst, "Active flow: senior analyst mode must change per upload");
assert(activeFlowA.dataTeamEvidence !== activeFlowB.dataTeamEvidence, "Active flow: role evidence must change per upload");
assert(activeFlowA.consultingDecisions !== activeFlowB.consultingDecisions, "Active flow: executive decisions must change per upload");

console.log(`Reality Engine QA passed ${cases.length} dataset scenarios plus upload parser, active-dataset, export, forecast fallback, and data-team checks.`);

function dataset(table) {
  const columns = table[0];
  const rows = table.slice(1).map((values) =>
    columns.reduce((record, column, index) => {
      record[column] = values[index] ?? "";
      return record;
    }, {})
  );
  return {
    rows,
    columns,
    metadata: {
      rowCount: rows.length,
      columnCount: columns.length,
      importedAt: new Date().toISOString()
    }
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function csvFile(name, content) {
  return new File([content], name, { type: "text/csv" });
}

function emptyInlineStringXlsxFile() {
  const files = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
      </Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
      </Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
      </workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
      </Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <sheetData>
          <row r="1">
            <c r="A1" t="inlineStr"><is><t>Customer</t></is></c>
            <c r="B1" t="inlineStr"><is><t>Revenue</t></is></c>
          </row>
          <row r="2">
            <c r="A2" t="inlineStr"></c>
            <c r="B2"><v>100</v></c>
          </row>
          <row r="3">
            <c r="A3" t="inlineStr"><is><t>Ray</t></is></c>
            <c r="B3"><v>250</v></c>
          </row>
        </sheetData>
      </worksheet>`)
  };
  return new File([zipSync(files)], "empty-inline-string.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

async function expectReject(task, message) {
  try {
    await task();
  } catch {
    return;
  }
  throw new Error(message);
}

function simulateActiveUpload(activeFileName, activeDataset) {
  const analysis = analyzeDataset(activeDataset);
  return {
    activeDataset,
    activeFileName,
    activeSource: "uploaded",
    isDemoMode: false,
    rowCount: activeDataset.metadata.rowCount,
    columnCount: activeDataset.metadata.columnCount,
    qualityScore: analysis.qualityScore,
    report: analysis.intelligence.executiveSummary.join(" "),
    discoveryCount: analysis.discoveryFeed.length,
    investigation: analysis.investigation,
    boardroom: analysis.boardroom,
    seniorAnalyst: analysis.seniorAnalyst.executiveSummary.join(" "),
    dataTeamEvidence: analysis.dataTeam.map((role) => role.evidence).join(" "),
    consultingDecisions: analysis.executiveConsulting.decisions.map((item) => item.expectedImpact).join(" "),
    scenario: runScenario({ analysis, dataset: activeDataset, changePercent: 10 })
  };
}
