import { analyzeDataset, answerQuestion, runScenario } from "../src/lib/analysis.js";
import { parseDataFile } from "../src/lib/parser.js";

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
  }
];

for (const testCase of cases) {
  const analysis = analyzeDataset(testCase.dataset);
  assert(Number.isFinite(analysis.qualityScore), `${testCase.name}: quality score must be finite`);
  assert(Array.isArray(analysis.discoveryFeed), `${testCase.name}: discovery feed must exist`);
  assert(analysis.scoreBreakdown, `${testCase.name}: score breakdown must exist`);
  assert(analysis.investigation, `${testCase.name}: investigation must exist`);
  assert(analysis.boardroom.length === 5, `${testCase.name}: boardroom must include final recommendation`);
  assert(typeof answerQuestion("What anomalies exist?", testCase.dataset, analysis) === "string", `${testCase.name}: assistant fallback must answer`);

  if (testCase.noNumeric) {
    assert(analysis.numericColumns.length === 0, `${testCase.name}: should not detect numeric columns`);
  }

  if (!testCase.empty && analysis.numericColumns.length) {
    const scenario = runScenario({ analysis, dataset: testCase.dataset, changePercent: 10 });
    assert(scenario?.riskLevel, `${testCase.name}: simulation must include risk level`);
    assert(scenario?.recommendation, `${testCase.name}: simulation must include recommendation`);
  }
}

const parsedNormalCsv = await parseDataFile(csvFile("normal.csv", "Date,Region,Sales\n2026-01-01,North,100\n2026-01-02,South,120"));
assert(parsedNormalCsv.rows.length === 2, "CSV parser: normal CSV should produce two rows");
assert(parsedNormalCsv.columns.includes("Sales"), "CSV parser: normal CSV should preserve headers");

const parsedMessyCsv = await parseDataFile(csvFile("messy.csv", "\n Messy Sales , ,Region\n100,,North\n, ,\n240,,South\n"));
assert(parsedMessyCsv.rows.length === 2, "CSV parser: messy CSV should drop blank rows");
assert(parsedMessyCsv.columns.length === 3, "CSV parser: messy CSV should create safe missing headers");

await expectReject(() => parseDataFile(csvFile("empty.csv", "")), "CSV parser: empty file should reject");
await expectReject(() => parseDataFile(new File(["hello"], "bad.txt", { type: "text/plain" })), "Parser: invalid file type should reject");

console.log(`Reality Engine QA passed ${cases.length} dataset scenarios plus upload parser checks.`);

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

async function expectReject(task, message) {
  try {
    await task();
  } catch {
    return;
  }
  throw new Error(message);
}
