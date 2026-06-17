import { formatNumber, formatPercent, titleCase } from "./format.js";

const MISSING = new Set(["", "na", "n/a", "null", "undefined", "-", "--"]);

export function cleanDataset(dataset) {
  const columns = normalizeHeaders(dataset.columns || []);
  const sourceRows = (dataset.rows || []).map((row) => {
    const cleaned = {};
    (dataset.columns || []).forEach((oldColumn, index) => {
      cleaned[columns[index]] = cleanValue(row[oldColumn]);
    });
    return cleaned;
  });
  const nonBlankColumns = columns.filter((column) => sourceRows.some((row) => !isMissing(row[column])));
  const seen = new Set();
  const rows = sourceRows
    .map((row) =>
      nonBlankColumns.reduce((record, column) => {
        record[column] = row[column] ?? "";
        return record;
      }, {})
    )
    .filter((row) => Object.values(row).some((value) => !isMissing(value)))
    .filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return {
    rows,
    columns: nonBlankColumns,
    metadata: {
      rowCount: rows.length,
      columnCount: nonBlankColumns.length,
      importedAt: dataset.metadata?.importedAt || new Date().toISOString(),
      cleanedAt: new Date().toISOString(),
      sourceRowCount: dataset.metadata?.rowCount || dataset.rows?.length || 0,
      sourceColumnCount: dataset.metadata?.columnCount || dataset.columns?.length || 0
    }
  };
}

export function analyzeDataset(dataset) {
  const { rows, columns, metadata } = dataset;
  const columnProfiles = columns.map((column) => profileColumn(rows, column));
  const duplicateCount = countDuplicates(rows);
  const numericColumns = columnProfiles.filter((profile) => profile.type === "number");
  const categoricalColumns = columnProfiles.filter((profile) => profile.type === "category");
  const dateColumns = columnProfiles.filter((profile) => profile.type === "date");
  const dateRange = detectDateRange(rows, dateColumns);
  const categorySummaries = summarizeCategories(rows, categoricalColumns);
  const outliers = numericColumns.flatMap((profile) => detectOutliers(rows, profile.name));
  const correlations = detectCorrelations(rows, numericColumns);
  const trends = detectTrends(rows, numericColumns, dateColumns);
  const categoryPerformance = detectCategoryPerformance(rows, categoricalColumns, numericColumns);
  const anomalies = detectAnomalies(rows, numericColumns, outliers);
  const qualityScore = calculateQualityScore(rows.length, columns.length, columnProfiles, duplicateCount, outliers.length);
  const scoreBreakdown = calculateScoreBreakdown(rows.length, columns.length, columnProfiles, duplicateCount, outliers.length);
  const cleaningStudio = buildCleaningStudio({ rows, columns, columnProfiles, duplicateCount, outliers });
  const relationshipGraph = discoverRelationships(rows, categoricalColumns, numericColumns);
  const forecasts = generateForecasts(rows, numericColumns, dateColumns);
  const earlyWarnings = generateEarlyWarnings({ qualityScore, duplicateCount, rows, trends, anomalies, numericColumns, categoryPerformance });
  const opportunities = scanOpportunities({ trends, correlations, categoryPerformance, numericColumns, rows });
  const semanticColumns = inferSemanticColumns(columnProfiles);
  const kpis = detectBusinessKpis({ rows, numericColumns, categoricalColumns, semanticColumns });
  const periodComparison = comparePeriods({ rows, numericColumns, dateColumns, semanticColumns });
  const concentration = detectConcentration({ rows, categoricalColumns, numericColumns, semanticColumns });
  const varianceAnalysis = buildVarianceAnalysis({ trends, periodComparison, kpis });
  const limitations = buildAnalysisLimitations({ rows, numericColumns, categoricalColumns, dateColumns, semanticColumns, forecasts });
  const businessReasoning = generateBusinessReasoning({ correlations, trends, categoryPerformance, semanticColumns, kpis, limitations });
  const rootCauseInvestigations = generateRootCauseInvestigations({ trends, categoryPerformance, correlations, anomalies, earlyWarnings, limitations });
  const engineeringReview = generateEngineeringReview({ columns, rows, columnProfiles, semanticColumns, cleaningStudio });
  const analyticsEngineeringReview = generateAnalyticsEngineeringReview({ numericColumns, categoricalColumns, semanticColumns, kpis });
  const financialAnalysis = generateFinancialAnalysis({ kpis, semanticColumns, numericColumns, concentration, periodComparison, trends });
  const operationsAnalysis = generateOperationsAnalysis({ semanticColumns, categoryPerformance, concentration, earlyWarnings });
  const growthAnalysis = generateGrowthAnalysis({ semanticColumns, concentration, opportunities, categoryPerformance });
  const executiveConsulting = generateExecutiveConsulting({ earlyWarnings, opportunities, rootCauseInvestigations, financialAnalysis, operationsAnalysis, growthAnalysis, qualityScore });
  const discoveryFeed = buildDiscoveryFeed({
    trends,
    correlations,
    categoryPerformance,
    anomalies,
    qualityScore,
    duplicateCount,
    columnProfiles,
    rows
  });

  return {
    metadata,
    columnProfiles,
    numericColumns,
    categoricalColumns,
    dateColumns,
    duplicateCount,
    outliers,
    correlations,
    trends,
    categoryPerformance,
    anomalies,
    relationshipGraph,
    forecasts,
    earlyWarnings,
    opportunities,
    semanticColumns,
    kpis,
    periodComparison,
    concentration,
    varianceAnalysis,
    limitations,
    businessReasoning,
    rootCauseInvestigations,
    engineeringReview,
    analyticsEngineeringReview,
    financialAnalysis,
    operationsAnalysis,
    growthAnalysis,
    executiveConsulting,
    seniorAnalyst: generateSeniorAnalystMode({
      metadata,
      qualityScore,
      scoreBreakdown,
      duplicateCount,
      outliers,
      trends,
      correlations,
      categoryPerformance,
      anomalies,
      earlyWarnings,
      opportunities,
      forecasts,
      semanticColumns,
      kpis,
      periodComparison,
      concentration,
      varianceAnalysis,
      limitations
    }),
    dataTeam: generateDataTeamIntelligence({
      qualityScore,
      scoreBreakdown,
      duplicateCount,
      trends,
      correlations,
      categoryPerformance,
      anomalies,
      earlyWarnings,
      opportunities,
      forecasts,
      semanticColumns,
      kpis,
      periodComparison,
      concentration,
      limitations
    }),
    dateRange,
    categorySummaries,
    scoreBreakdown,
    cleaningStudio,
    investigation: generateInvestigation({ qualityScore, trends, correlations, categoryPerformance, anomalies, opportunities, earlyWarnings, semanticColumns, kpis, periodComparison, concentration }),
    boardroom: generateBoardroom({ qualityScore, trends, correlations, categoryPerformance, anomalies, opportunities, earlyWarnings }),
    qualityScore,
    discoveryFeed,
    intelligence: generateIntelligence({
      metadata,
      qualityScore,
      scoreBreakdown,
      dateRange,
      columnProfiles,
      correlations,
      trends,
      categoryPerformance,
      anomalies,
      duplicateCount,
      outliers,
      semanticColumns,
      kpis,
      periodComparison,
      concentration,
      varianceAnalysis,
      limitations
    })
  };
}

function profileColumn(rows, column) {
  const values = rows.map((row) => row[column]);
  const missing = values.filter(isMissing).length;
  const filled = values.filter((value) => !isMissing(value));
  const numberValues = filled.map(toNumber).filter(Number.isFinite);
  const dateValues = filled.map(toDate).filter(Boolean);
  const uniqueValues = new Set(filled.map((value) => String(value).toLowerCase())).size;
  const type = inferType(filled.length, numberValues.length, dateValues.length, uniqueValues);
  const stats = type === "number" ? numericStats(numberValues) : {};

  return {
    name: column,
    type,
    missing,
    missingRate: rows.length ? (missing / rows.length) * 100 : 0,
    uniqueValues,
    cardinalityRate: rows.length ? (uniqueValues / rows.length) * 100 : 0,
    ...stats
  };
}

function inferType(filledCount, numberCount, dateCount, uniqueValues) {
  if (!filledCount) return "empty";
  if (numberCount / filledCount >= 0.82) return "number";
  if (dateCount / filledCount >= 0.82) return "date";
  if (uniqueValues <= Math.max(20, filledCount * 0.35)) return "category";
  return "text";
}

function numericStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / values.length;
  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean,
    median: percentile(sorted, 50),
    q1: percentile(sorted, 25),
    q3: percentile(sorted, 75),
    sum
  };
}

function detectOutliers(rows, column) {
  const values = rows
    .map((row, index) => ({ index, value: toNumber(row[column]) }))
    .filter((item) => Number.isFinite(item.value));
  if (values.length < 8) return [];

  const sorted = values.map((item) => item.value).sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const low = q1 - 1.5 * iqr;
  const high = q3 + 1.5 * iqr;
  return values
    .filter((item) => item.value < low || item.value > high)
    .slice(0, 30)
    .map((item) => ({ ...item, column, severity: item.value > high ? "high" : "low" }));
}

function detectCorrelations(rows, numericColumns) {
  const pairs = [];
  for (let i = 0; i < numericColumns.length; i += 1) {
    for (let j = i + 1; j < numericColumns.length; j += 1) {
      const a = numericColumns[i].name;
      const b = numericColumns[j].name;
      const values = rows
        .map((row) => [toNumber(row[a]), toNumber(row[b])])
        .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
      if (values.length < 5) continue;
      const score = pearson(values);
      if (Math.abs(score) >= 0.45) {
        pairs.push({ a, b, score, strength: Math.abs(score) >= 0.7 ? "strong" : "moderate" });
      }
    }
  }
  return pairs.sort((x, y) => Math.abs(y.score) - Math.abs(x.score)).slice(0, 8);
}

function detectTrends(rows, numericColumns, dateColumns) {
  if (!dateColumns.length || !numericColumns.length) return [];
  const dateColumn = dateColumns[0].name;
  return numericColumns
    .map((profile) => {
      const points = rows
        .map((row) => ({ date: toDate(row[dateColumn]), value: toNumber(row[profile.name]) }))
        .filter((point) => point.date && Number.isFinite(point.value))
        .sort((a, b) => a.date - b.date);
      if (points.length < 5) return null;
      const midpoint = Math.floor(points.length / 2);
      const early = average(points.slice(0, midpoint).map((point) => point.value));
      const late = average(points.slice(midpoint).map((point) => point.value));
      const change = early ? ((late - early) / Math.abs(early)) * 100 : 0;
      return {
        column: profile.name,
        dateColumn,
        change,
        direction: change >= 0 ? "up" : "down",
        points: points.map((point) => ({ label: point.date.toISOString().slice(0, 10), value: point.value }))
      };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);
}

function detectCategoryPerformance(rows, categoricalColumns, numericColumns) {
  if (!categoricalColumns.length || !numericColumns.length) return [];
  const valueColumn = chooseMeasure(numericColumns).name;
  return categoricalColumns
    .slice(0, 4)
    .map((category) => {
      const groups = new Map();
      rows.forEach((row) => {
        const key = String(row[category.name] || "Unknown").trim() || "Unknown";
        const value = toNumber(row[valueColumn]);
        if (!Number.isFinite(value)) return;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(value);
      });
      const ranked = [...groups.entries()]
        .map(([name, values]) => ({ name, count: values.length, total: sum(values), average: average(values) }))
        .filter((item) => item.count >= 1)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);
      if (ranked.length < 2) return null;
      return {
        categoryColumn: category.name,
        valueColumn,
        best: ranked[0],
        weakest: ranked[ranked.length - 1],
        ranked
      };
    })
    .filter(Boolean);
}

function detectAnomalies(rows, numericColumns, outliers) {
  const outlierAnomalies = outliers.slice(0, 8).map((item) => ({
    type: "Outlier",
    title: `${titleCase(item.column)} has an unusual ${item.severity} value`,
    detail: `Row ${item.index + 1} contains ${formatNumber(item.value)} in ${titleCase(item.column)}.`,
    severity: item.severity === "high" ? "High" : "Medium"
  }));

  const volatility = numericColumns
    .map((profile) => ({
      type: "Volatility",
      title: `${titleCase(profile.name)} varies widely`,
      detail: `Values range from ${formatNumber(profile.min)} to ${formatNumber(profile.max)}.`,
      severity: profile.mean && (profile.max - profile.min) / Math.abs(profile.mean) > 2.5 ? "High" : "Medium"
    }))
    .filter((item) => item.severity === "High")
    .slice(0, 4);

  return [...outlierAnomalies, ...volatility].slice(0, 10);
}

function buildCleaningStudio({ rows, columns, columnProfiles, duplicateCount, outliers }) {
  const missingCells = columnProfiles.reduce((total, profile) => total + profile.missing, 0);
  const totalCells = Math.max(1, rows.length * Math.max(1, columns.length));
  const duplicateColumns = findDuplicateColumns(columns);
  const blankHeaders = columns.filter((column) => /^column\s+\d+$/i.test(column)).length;
  const whitespaceIssues = rows.reduce(
    (total, row) => total + columns.filter((column) => String(row[column] ?? "") !== String(row[column] ?? "").trim()).length,
    0
  );
  const invalidDates = columnProfiles
    .filter((profile) => /date|month|period|time/i.test(profile.name) && profile.type !== "date")
    .reduce((total, profile) => total + rows.filter((row) => !isMissing(row[profile.name]) && !toDate(row[profile.name])).length, 0);
  const invalidNumerics = columnProfiles
    .filter((profile) => /revenue|sales|cost|profit|margin|amount|quantity|units|inventory|churn|expense/i.test(profile.name) && profile.type !== "number")
    .reduce((total, profile) => total + rows.filter((row) => !isMissing(row[profile.name]) && !Number.isFinite(toNumber(row[profile.name]))).length, 0);
  const negativeRisks = columnProfiles
    .filter((profile) => profile.type === "number" && /revenue|sales|quantity|units|inventory|customer|count/i.test(profile.name))
    .flatMap((profile) => rows.map((row, index) => ({ column: profile.name, index, value: toNumber(row[profile.name]) })).filter((item) => item.value < 0));
  const categoryIssues = detectCategoryInconsistency(rows, columnProfiles);
  const potentialDataLeakage = detectPotentialDataLeakage(columnProfiles);
  const potentialDerivedColumns = detectPotentialDerivedColumns(columnProfiles);
  const primaryKeyIssues = detectPrimaryKeyIssues(rows, columnProfiles);
  const foreignKeyIssues = detectForeignKeyIssues(columnProfiles);

  const completenessScore = Math.max(0, 100 - (missingCells / totalCells) * 100);
  const consistencyScore = Math.max(0, 100 - (duplicateCount / Math.max(1, rows.length)) * 45 - Math.min(30, categoryIssues.length * 6) - Math.min(20, whitespaceIssues / Math.max(1, rows.length)));
  const validityScore = Math.max(0, 100 - Math.min(45, ((invalidDates + invalidNumerics) / totalCells) * 120) - Math.min(25, negativeRisks.length * 3));
  const uniquenessScore = Math.max(0, 100 - (duplicateCount / Math.max(1, rows.length)) * 100 - duplicateColumns.length * 8);
  const trustScore = Math.max(0, Math.min(100, completenessScore * 0.28 + consistencyScore * 0.22 + validityScore * 0.25 + uniquenessScore * 0.25));
  const readiness = trustScore >= 86 && duplicateCount === 0 ? "Ready For Analysis" : trustScore >= 65 ? "Ready With Warnings" : "Not Ready For Analysis";

  const issues = [
    issue("Missing values", missingCells, `${formatNumber(missingCells)} missing cells across ${formatNumber(columns.length)} columns.`),
    issue("Duplicate rows", duplicateCount, `${formatNumber(duplicateCount)} rows repeat exactly and may inflate totals.`),
    issue("Duplicate columns", duplicateColumns.length, duplicateColumns.length ? `${duplicateColumns.join(", ")} appear more than once.` : "No duplicate column names detected."),
    issue("Invalid dates", invalidDates, `${formatNumber(invalidDates)} date-like values could not be parsed.`),
    issue("Invalid numeric values", invalidNumerics, `${formatNumber(invalidNumerics)} metric-like values are not numeric.`),
    issue("Negative value risks", negativeRisks.length, `${formatNumber(negativeRisks.length)} non-negative business fields contain negative values.`),
    issue("Blank headers", blankHeaders, `${formatNumber(blankHeaders)} generated headers indicate blank source headers.`),
    issue("Whitespace issues", whitespaceIssues, `${formatNumber(whitespaceIssues)} cells include leading or trailing whitespace.`),
    issue("Inconsistent categories", categoryIssues.length, categoryIssues[0]?.detail || "No obvious category casing/spacing inconsistencies detected."),
    issue("Outliers", outliers.length, `${formatNumber(outliers.length)} numeric outlier values may distort averages and forecasts.`),
    issue("Potential data leakage", potentialDataLeakage.length, potentialDataLeakage[0]?.detail || "No obvious future/target leakage column names detected."),
    issue("Potential derived columns", potentialDerivedColumns.length, potentialDerivedColumns[0]?.detail || "No obvious derived metric columns detected."),
    issue("Primary key issues", primaryKeyIssues.length, primaryKeyIssues[0]?.detail || "No obvious primary key issue detected."),
    issue("Foreign key issues", foreignKeyIssues.length, foreignKeyIssues[0]?.detail || "No obvious foreign key naming issue detected.")
  ];

  return {
    scores: { dataQualityScore: trustScore, completenessScore, consistencyScore, validityScore, uniquenessScore, trustScore },
    readiness,
    readinessReason: explainReadiness({ readiness, duplicateCount, missingCells, invalidDates, invalidNumerics, outliers, trustScore }),
    analystCommentary: buildQualityCommentary({ readiness, duplicateCount, missingCells, invalidDates, invalidNumerics, outliers, trustScore }),
    issues,
    cleaningActions: [
      "Remove duplicates",
      "Trim whitespace",
      "Standardize casing",
      "Normalize dates",
      "Remove blank rows",
      "Remove blank columns",
      "Normalize headers"
    ]
  };
}

function issue(name, count, detail) {
  return { name, count, severity: count > 50 ? "High" : count > 0 ? "Medium" : "Low", detail };
}

function inferSemanticColumns(columnProfiles) {
  const semantics = {};
  const patterns = {
    date: /date|day|week|month|period|created|closed|order.?time/i,
    revenue: /revenue|sales|income|turnover|amount|booking|value|total/i,
    cost: /cost|expense|spend|cogs|loss|fee/i,
    profit: /profit|margin|ebit|net/i,
    margin: /margin|profit.?rate|gross.?margin/i,
    quantity: /quantity|qty|units|volume|count/i,
    customer: /customer|client|account|buyer|member|user/i,
    product: /product|sku|item|service|plan|package/i,
    region: /region|province|state|country|city|territory|market/i,
    branch: /branch|store|location|site|office/i,
    channel: /channel|source|medium|partner|segment/i,
    category: /category|type|class|group|department/i,
    supplier: /supplier|vendor|manufacturer|provider/i,
    inventory: /inventory|stock|on.?hand|available|shortage/i,
    churn: /churn|cancel|attrition|retention|lost/i,
    status: /status|stage|state|outcome/i,
    payment: /payment|paid|invoice|balance|collection/i,
    expense: /expense|spend|opex|cost/i
  };

  Object.entries(patterns).forEach(([meaning, pattern]) => {
    semantics[meaning] = columnProfiles.filter((profile) => pattern.test(profile.name));
  });

  return semantics;
}

function detectBusinessKpis({ rows, numericColumns, semanticColumns }) {
  const primaryRevenue = semanticColumns.revenue?.find((profile) => profile.type === "number") || chooseMeasure(numericColumns);
  const cost = semanticColumns.cost?.find((profile) => profile.type === "number") || semanticColumns.expense?.find((profile) => profile.type === "number");
  const profit = semanticColumns.profit?.find((profile) => profile.type === "number");
  const churn = semanticColumns.churn?.find((profile) => profile.type === "number");
  const quantity = semanticColumns.quantity?.find((profile) => profile.type === "number");
  const customerColumn = semanticColumns.customer?.find((profile) => profile.type !== "number");
  const customerCount = customerColumn ? new Set(rows.map((row) => String(row[customerColumn.name] || "").trim()).filter(Boolean)).size : 0;

  const kpis = [];
  if (primaryRevenue) {
    kpis.push({
      key: "revenue",
      label: titleCase(primaryRevenue.name),
      value: primaryRevenue.sum,
      evidence: `${titleCase(primaryRevenue.name)} totals ${formatNumber(primaryRevenue.sum, { compact: true })} across ${formatNumber(rows.length)} rows.`,
      column: primaryRevenue.name
    });
  }
  if (cost) {
    kpis.push({
      key: "cost",
      label: titleCase(cost.name),
      value: cost.sum,
      evidence: `${titleCase(cost.name)} totals ${formatNumber(cost.sum, { compact: true })}; cost intensity is ${primaryRevenue ? formatPercent((cost.sum / Math.max(primaryRevenue.sum, 1)) * 100) : "not comparable without revenue"}.`,
      column: cost.name
    });
  }
  if (profit || (primaryRevenue && cost)) {
    const profitValue = profit ? profit.sum : primaryRevenue.sum - cost.sum;
    const margin = primaryRevenue ? (profitValue / Math.max(primaryRevenue.sum, 1)) * 100 : 0;
    kpis.push({
      key: "profitability",
      label: profit ? titleCase(profit.name) : "Estimated Profit",
      value: profitValue,
      evidence: `Profitability signal is ${formatNumber(profitValue, { compact: true })} with estimated margin of ${formatPercent(margin)}.`,
      column: profit?.name || primaryRevenue?.name
    });
  }
  if (churn) {
    kpis.push({
      key: "churn",
      label: titleCase(churn.name),
      value: churn.mean,
      evidence: `${titleCase(churn.name)} averages ${formatNumber(churn.mean)} with a high point of ${formatNumber(churn.max)}.`,
      column: churn.name
    });
  }
  if (quantity) {
    kpis.push({
      key: "volume",
      label: titleCase(quantity.name),
      value: quantity.sum,
      evidence: `${titleCase(quantity.name)} totals ${formatNumber(quantity.sum, { compact: true })}, giving the analysis a volume signal.`,
      column: quantity.name
    });
  }
  if (customerCount) {
    kpis.push({
      key: "customers",
      label: titleCase(customerColumn.name),
      value: customerCount,
      evidence: `${formatNumber(customerCount)} unique ${titleCase(customerColumn.name)} values were detected.`,
      column: customerColumn.name
    });
  }
  return kpis;
}

function comparePeriods({ rows, numericColumns, dateColumns, semanticColumns }) {
  const measure = semanticColumns.revenue?.find((profile) => profile.type === "number") || chooseMeasure(numericColumns);
  const dateColumn = dateColumns[0]?.name;
  if (!measure || !dateColumn) return null;
  const points = rows
    .map((row) => ({ date: toDate(row[dateColumn]), value: toNumber(row[measure.name]) }))
    .filter((point) => point.date && Number.isFinite(point.value))
    .sort((a, b) => a.date - b.date);
  if (points.length < 4) return null;

  const midpoint = Math.floor(points.length / 2);
  const first = points.slice(0, midpoint);
  const second = points.slice(midpoint);
  const firstTotal = sum(first.map((point) => point.value));
  const secondTotal = sum(second.map((point) => point.value));
  const delta = secondTotal - firstTotal;
  const change = firstTotal ? (delta / Math.abs(firstTotal)) * 100 : 0;
  return {
    measure: measure.name,
    dateColumn,
    firstTotal,
    secondTotal,
    delta,
    change,
    direction: change >= 0 ? "increase" : "decline",
    evidence: `${titleCase(measure.name)} ${change >= 0 ? "increased" : "declined"} by ${formatPercent(Math.abs(change))} from the first half (${formatNumber(firstTotal, { compact: true })}) to the second half (${formatNumber(secondTotal, { compact: true })}).`
  };
}

function detectConcentration({ rows, categoricalColumns, numericColumns, semanticColumns }) {
  const measure = semanticColumns.revenue?.find((profile) => profile.type === "number") || chooseMeasure(numericColumns);
  if (!measure) return [];
  const preferred = [
    ...(semanticColumns.customer || []),
    ...(semanticColumns.product || []),
    ...(semanticColumns.region || []),
    ...(semanticColumns.channel || []),
    ...(semanticColumns.category || [])
  ];
  const candidates = uniqueProfiles([...preferred, ...categoricalColumns]).slice(0, 6);
  return candidates
    .map((category) => {
      const groups = new Map();
      rows.forEach((row) => {
        const key = String(row[category.name] || "Unknown").trim() || "Unknown";
        const value = toNumber(row[measure.name]);
        if (!Number.isFinite(value)) return;
        groups.set(key, (groups.get(key) || 0) + value);
      });
      const ranked = [...groups.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
      const total = sum(ranked.map((item) => item.total));
      const top = ranked[0];
      if (!top || !total) return null;
      return {
        category: category.name,
        measure: measure.name,
        top,
        share: (top.total / Math.abs(total)) * 100,
        ranked: ranked.slice(0, 5),
        evidence: `${top.name} contributes ${formatPercent((top.total / Math.abs(total)) * 100)} of ${titleCase(measure.name)} within ${titleCase(category.name)}.`
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.share - a.share);
}

function buildVarianceAnalysis({ trends, periodComparison, kpis }) {
  const items = [];
  if (periodComparison) {
    items.push({
      title: `${titleCase(periodComparison.measure)} period variance`,
      evidence: periodComparison.evidence,
      severity: Math.abs(periodComparison.change) > 20 ? "High" : "Medium"
    });
  }
  trends.slice(0, 3).forEach((trend) => {
    items.push({
      title: `${titleCase(trend.column)} ${trend.direction} trend`,
      evidence: `${titleCase(trend.column)} moved ${trend.direction} by ${formatPercent(Math.abs(trend.change))} between early and late records.`,
      severity: Math.abs(trend.change) > 20 ? "High" : "Medium"
    });
  });
  const profit = kpis.find((kpi) => kpi.key === "profitability");
  if (profit) {
    items.push({ title: "Profitability variance lens", evidence: profit.evidence, severity: profit.value < 0 ? "High" : "Low" });
  }
  return items.slice(0, 6);
}

function buildAnalysisLimitations({ rows, numericColumns, categoricalColumns, dateColumns, semanticColumns, forecasts }) {
  const limitations = [];
  if (!rows.length) limitations.push("No usable rows were found, so no business analysis can be generated.");
  if (!numericColumns.length) limitations.push("No numeric columns found, so KPI, driver, forecast, and simulation analysis is limited.");
  if (!categoricalColumns.length) limitations.push("No categorical columns found, so segment, concentration, and top/bottom performer analysis is limited.");
  if (!dateColumns.length) limitations.push("No date column detected, so month-over-month and forecasting analysis cannot be trusted.");
  if (!forecasts.length) limitations.push("Forecast unavailable because the dataset needs at least five dated numeric observations.");
  if (!semanticColumns.revenue?.length) limitations.push("No clear revenue or sales column detected; naming a numeric field Revenue or Sales would improve business interpretation.");
  if (!semanticColumns.cost?.length && !semanticColumns.expense?.length) limitations.push("No clear cost or expense column detected; margin and profitability analysis may be incomplete.");
  return limitations;
}

function generateBusinessReasoning({ correlations, trends, categoryPerformance, kpis, limitations }) {
  const reasoning = [];
  correlations.slice(0, 4).forEach((correlation) => {
    reasoning.push({
      finding: `${titleCase(correlation.a)} and ${titleCase(correlation.b)} move together.`,
      reasoningType: Math.abs(correlation.score) >= 0.75 ? "Strong association" : "Moderate association",
      whyItMatters: "This relationship can guide investigation, but it should not be treated as proof of causation.",
      potentialCauses: ["Pricing rules", "Shared demand patterns", "Operational dependency", "Derived-field relationship"],
      alternativeExplanations: ["Coincidence in a small sample", "Both fields reacting to another hidden variable", "One field calculated from the other"],
      evidenceMissing: "Controlled tests, source-system lineage, business process rules, and time-lagged analysis.",
      investigateNext: `Validate whether ${titleCase(correlation.a)} is an input, output, or sibling metric for ${titleCase(correlation.b)}.`,
      confidence: confidenceLabel(Math.abs(correlation.score) * 100)
    });
  });
  trends.slice(0, 2).forEach((trend) => {
    reasoning.push({
      finding: `${titleCase(trend.column)} is trending ${trend.direction}.`,
      reasoningType: "Time-based pattern",
      whyItMatters: "A sustained trend may require action, but period mix and seasonality must be ruled out.",
      potentialCauses: ["Seasonality", "Demand shift", "Operational capacity", "Pricing or channel mix"],
      alternativeExplanations: ["Late-period outliers", "Incomplete historical coverage", "Different segment composition"],
      evidenceMissing: "Longer history, campaign calendar, operational events, and external market context.",
      investigateNext: `Compare ${titleCase(trend.column)} by segment and month before treating it as systemic.`,
      confidence: confidenceLabel(Math.abs(trend.change) + 50)
    });
  });
  if (!reasoning.length) {
    reasoning.push({
      finding: "No strong causal claim should be made from this dataset yet.",
      reasoningType: "Evidence gap",
      whyItMatters: "The product avoids hallucinating causality when field coverage is limited.",
      potentialCauses: ["Insufficient measures", "Missing dates", "Missing business dimensions"],
      alternativeExplanations: limitations.slice(0, 3),
      evidenceMissing: "More complete metrics, reliable dates, and business process context.",
      investigateNext: "Add driver columns and rerun the analysis.",
      confidence: "High Confidence"
    });
  }
  if (categoryPerformance[0] && kpis[0]) {
    reasoning.unshift({
      finding: `${categoryPerformance[0].best.name} leads ${titleCase(categoryPerformance[0].categoryColumn)} performance.`,
      reasoningType: "Segment contribution",
      whyItMatters: `Leadership can compare the best and weakest segments against ${kpis[0].label}.`,
      potentialCauses: ["Segment mix", "Different customer demand", "Operational execution", "Channel economics"],
      alternativeExplanations: ["Duplicate records", "Uneven sample sizes", "Uncaptured cost differences"],
      evidenceMissing: "Segment-level costs, customer counts, and source-system validation.",
      investigateNext: `Audit what makes ${categoryPerformance[0].best.name} different from ${categoryPerformance[0].weakest.name}.`,
      confidence: "Medium Confidence"
    });
  }
  return reasoning.slice(0, 8);
}

function generateRootCauseInvestigations({ trends, categoryPerformance, correlations, anomalies, earlyWarnings, limitations }) {
  const findings = [
    trends[0]
      ? {
          finding: `${titleCase(trends[0].column)} ${trends[0].direction} trend`,
          possibleCause: "Seasonality, demand changes, campaign timing, or operational capacity may be influencing the late-period movement.",
          alternativeCause: "A few outlier records or a changed segment mix may be overstating the trend.",
          evidenceSupporting: `${titleCase(trends[0].column)} changed by ${formatPercent(Math.abs(trends[0].change))}.`,
          evidenceMissing: "Longer history, month labels, operational events, and external context.",
          confidence: confidenceLabel(Math.abs(trends[0].change) + 45),
          recommendedInvestigation: "Break the trend by segment, check outliers, and compare equivalent calendar periods."
        }
      : null,
    categoryPerformance[0]
      ? {
          finding: `${categoryPerformance[0].best.name} outperforms ${categoryPerformance[0].weakest.name}`,
          possibleCause: "The best segment may have stronger demand, better pricing, or better operational execution.",
          alternativeCause: "The difference may come from missing cost data, duplicate rows, or sample-size imbalance.",
          evidenceSupporting: `${categoryPerformance[0].best.name} totals ${formatNumber(categoryPerformance[0].best.total, { compact: true })} versus ${categoryPerformance[0].weakest.name} at ${formatNumber(categoryPerformance[0].weakest.total, { compact: true })}.`,
          evidenceMissing: "Segment cost, customer count, conversion rate, and operating context.",
          confidence: "Medium Confidence",
          recommendedInvestigation: "Interview process owners and compare unit economics for the two segments."
        }
      : null,
    correlations[0]
      ? {
          finding: `${titleCase(correlations[0].a)} is associated with ${titleCase(correlations[0].b)}`,
          possibleCause: "The fields may share a business rule, common driver, or derived calculation.",
          alternativeCause: "The relationship may be coincidental or caused by a third variable.",
          evidenceSupporting: `Correlation is ${correlations[0].score.toFixed(2)}.`,
          evidenceMissing: "Lineage, controlled comparisons, and time-lag analysis.",
          confidence: correlations[0].strength === "strong" ? "Medium Confidence" : "Low Confidence",
          recommendedInvestigation: "Trace metric definitions before using the relationship in a decision model."
        }
      : null,
    earlyWarnings[0]
      ? {
          finding: earlyWarnings[0].title,
          possibleCause: "The warning may be driven by data quality, segment concentration, volatility, or true business deterioration.",
          alternativeCause: "A sparse sample or anomalous rows may overstate severity.",
          evidenceSupporting: earlyWarnings[0].detail,
          evidenceMissing: "Validated source refreshes and owner confirmation.",
          confidence: earlyWarnings[0].severity === "Critical" || earlyWarnings[0].severity === "High" ? "High Confidence" : "Medium Confidence",
          recommendedInvestigation: "Assign an owner to verify the alert and confirm whether action is needed."
        }
      : null
  ].filter(Boolean);
  return findings.length ? findings : [{ finding: "No major root-cause candidate", possibleCause: "Current fields are not rich enough for root-cause analysis.", alternativeCause: "The dataset may be stable.", evidenceSupporting: limitations[0] || "No severe signal detected.", evidenceMissing: "More dates, categories, and driver metrics.", confidence: "Low Confidence", recommendedInvestigation: "Collect richer driver data before asserting cause." }];
}

function generateEngineeringReview({ columns, rows, columnProfiles, semanticColumns, cleaningStudio }) {
  const factCandidates = columnProfiles.filter((profile) => profile.type === "number").map((profile) => profile.name).slice(0, 6);
  const dimensionCandidates = columnProfiles.filter((profile) => profile.type === "category" || profile.type === "date").map((profile) => profile.name).slice(0, 8);
  return {
    schemaQuality: cleaningStudio.readiness,
    namingConventions: columns.some((column) => /\s/.test(column)) ? "Readable business names detected; warehouse models may prefer snake_case aliases." : "Column names are compact and model-friendly.",
    dataTypes: `${factCandidates.length} fact-like numeric fields and ${dimensionCandidates.length} dimension/date fields detected.`,
    lineageAssumptions: "Uploaded browser data has no source lineage yet; production should store source, import time, and transformation history.",
    transformationRequirements: cleaningStudio.cleaningActions,
    pipelineRisk: cleaningStudio.scores.trustScore < 75 ? "Medium to High" : "Low to Medium",
    scalabilityConcerns: rows.length > 50000 ? "Large browser-side datasets should move profiling to backend workers." : "Current row count is suitable for browser MVP profiling.",
    dataModelQuality: factCandidates.length && dimensionCandidates.length ? "Good candidate for a star schema." : "Needs clearer facts and dimensions before warehouse modeling.",
    factTableCandidates: factCandidates,
    dimensionTableCandidates: dimensionCandidates,
    recommendation: factCandidates.length && dimensionCandidates.length ? "Use a star schema with uploaded rows as the fact table and product/customer/region/channel/date as dimensions where present." : "Start with a staging table, clean headers, and define facts/dimensions after field enrichment."
  };
}

function generateAnalyticsEngineeringReview({ numericColumns, categoricalColumns, semanticColumns, kpis }) {
  return {
    semanticLayer: kpis.length ? `Define ${kpis.map((kpi) => kpi.label).slice(0, 4).join(", ")} in a reusable semantic layer.` : "Metric layer needs clearer KPI fields.",
    metricLayer: "Centralize metric definitions so dashboard, assistant, forecasts, exports, and AI prompts use identical logic.",
    factModel: numericColumns.length ? `Fact measures: ${numericColumns.slice(0, 6).map((profile) => titleCase(profile.name)).join(", ")}.` : "No fact measures detected.",
    dimensionModel: categoricalColumns.length ? `Dimensions: ${categoricalColumns.slice(0, 6).map((profile) => titleCase(profile.name)).join(", ")}.` : "No reusable dimensions detected.",
    recommendedWarehouseDesign: semanticColumns.customer?.length || semanticColumns.product?.length ? "Star schema with conformed customer/product/date/channel dimensions." : "Wide analytical table first, then snowflake dimensions when relationships are validated."
  };
}

function generateFinancialAnalysis({ kpis, semanticColumns, concentration, periodComparison }) {
  const revenue = kpis.find((kpi) => kpi.key === "revenue");
  const cost = kpis.find((kpi) => kpi.key === "cost");
  const profit = kpis.find((kpi) => kpi.key === "profitability");
  return {
    available: Boolean(revenue || cost || profit || semanticColumns.expense?.length),
    marginAnalysis: profit ? profit.evidence : "Margin analysis needs revenue and cost/profit fields.",
    costAnalysis: cost ? cost.evidence : "No clear cost or expense measure was detected.",
    profitabilityAnalysis: profit ? `Profitability is measurable. ${profit.evidence}` : "Profitability is not fully measurable from current columns.",
    contributionAnalysis: concentration[0]?.evidence || "Contribution analysis needs a category and financial measure.",
    varianceAnalysis: periodComparison?.evidence || "Financial variance analysis needs dated financial measures.",
    financialRiskAssessment: cost && revenue && cost.value / Math.max(revenue.value, 1) > 0.75 ? "High cost intensity may pressure margin." : "No severe financial risk detected from available fields."
  };
}

function generateOperationsAnalysis({ semanticColumns, categoryPerformance, concentration, earlyWarnings }) {
  const inventory = semanticColumns.inventory?.[0];
  const branch = semanticColumns.branch?.[0];
  return {
    available: Boolean(inventory || branch || semanticColumns.status?.length || categoryPerformance.length),
    bottlenecks: categoryPerformance[0] ? `${categoryPerformance[0].weakest.name} is the lowest-performing visible segment.` : "Bottlenecks need branch, status, supplier, inventory, or process fields.",
    capacityConstraints: inventory ? `${titleCase(inventory.name)} can be monitored for capacity or shortage risk.` : "No inventory/capacity field detected.",
    inventoryRisks: earlyWarnings.find((warning) => /inventory|stock/i.test(warning.title))?.detail || "No explicit inventory shortage alert detected.",
    operationalConcentration: concentration.find((item) => /branch|supplier|status|region/i.test(item.category))?.evidence || "No operational concentration signal detected.",
    processVariation: categoryPerformance[0] ? `${categoryPerformance[0].best.name} and ${categoryPerformance[0].weakest.name} show process variation worth investigating.` : "Process variation needs categorical operations fields.",
    operationalHealthAssessment: earlyWarnings[0]?.severity === "Critical" || earlyWarnings[0]?.severity === "High" ? "Operational health needs review before action." : "Operational health appears acceptable for first-pass analysis."
  };
}

function generateGrowthAnalysis({ semanticColumns, concentration, opportunities, categoryPerformance }) {
  return {
    available: Boolean(semanticColumns.customer?.length || semanticColumns.product?.length || semanticColumns.region?.length || semanticColumns.channel?.length),
    customerConcentration: concentration.find((item) => /customer|client|account/i.test(item.category))?.evidence || "Customer concentration needs a customer field and revenue measure.",
    productConcentration: concentration.find((item) => /product|sku|service/i.test(item.category))?.evidence || "Product concentration needs a product field and revenue measure.",
    regionConcentration: concentration.find((item) => /region|country|market|city/i.test(item.category))?.evidence || "Region concentration needs geography fields.",
    channelConcentration: concentration.find((item) => /channel|source|partner/i.test(item.category))?.evidence || "Channel concentration needs a channel field.",
    expansionOpportunities: opportunities.slice(0, 3).map((item) => item.title),
    retentionOpportunities: semanticColumns.churn?.length ? "Churn field detected; segment churn by customer, product, channel, or region." : "Retention opportunity detection improves with churn or repeat-purchase fields.",
    growthOpportunityAssessment: categoryPerformance[0] ? `Scale the playbook behind ${categoryPerformance[0].best.name} while fixing ${categoryPerformance[0].weakest.name}.` : "Growth assessment needs customer, product, region, or channel performance fields."
  };
}

function generateExecutiveConsulting({ earlyWarnings, opportunities, rootCauseInvestigations, financialAnalysis, operationsAnalysis, growthAnalysis, qualityScore }) {
  const risks = earlyWarnings.slice(0, 3).map((warning) => ({
    title: warning.title,
    expectedImpact: warning.detail,
    risk: warning.severity,
    confidence: warning.severity === "Critical" || warning.severity === "High" ? "High Confidence" : "Medium Confidence",
    tradeoffs: "Acting quickly reduces downside but may divert attention from growth experiments.",
    recommendedAction: "Assign an owner, validate the source rows, and decide whether mitigation is needed."
  }));
  const opportunityItems = opportunities.slice(0, 3).map((opportunity) => ({
    title: opportunity.title,
    expectedImpact: opportunity.impact ? formatNumber(opportunity.impact, { compact: true }) : "Qualitative",
    risk: "Execution risk",
    confidence: `${opportunity.confidence} Confidence`,
    tradeoffs: "Pursuing upside may require budget, operational capacity, or data enrichment.",
    recommendedAction: opportunity.detail
  }));
  const decisions = [
    {
      title: "Clean or analyze now?",
      expectedImpact: `Quality score is ${formatPercent(qualityScore)}.`,
      risk: qualityScore < 75 ? "High" : "Medium",
      confidence: confidenceLabel(qualityScore),
      tradeoffs: "Cleaning improves trust but can change totals if duplicates are removed.",
      recommendedAction: qualityScore < 75 ? "Clean first, then analyze the cleaned dataset." : "Proceed with analysis while tracking warnings."
    },
    {
      title: "Scale winner or fix weakest segment?",
      expectedImpact: growthAnalysis.growthOpportunityAssessment,
      risk: "Strategic focus risk",
      confidence: "Medium Confidence",
      tradeoffs: "Scaling winners accelerates upside; fixing weak segments protects downside.",
      recommendedAction: "Run a small experiment before reallocating major budget."
    },
    {
      title: "Invest in data foundation?",
      expectedImpact: financialAnalysis.available || operationsAnalysis.available ? "Better models will improve forecast and recommendation reliability." : "Current field gaps limit decision quality.",
      risk: "Technical debt risk",
      confidence: "High Confidence",
      tradeoffs: "Data engineering work slows feature output but compounds future analysis quality.",
      recommendedAction: "Create staging, semantic metrics, and lineage before using AI recommendations in production."
    }
  ];
  return { risks, opportunities: opportunityItems, decisions, rootCauseFocus: rootCauseInvestigations[0] };
}

function uniqueProfiles(profiles) {
  const seen = new Set();
  return profiles.filter((profile) => {
    if (!profile || seen.has(profile.name)) return false;
    seen.add(profile.name);
    return true;
  });
}

function buildDiscoveryFeed(context) {
  const feed = [];
  if (context.qualityScore < 75) {
    feed.push({
      label: "Data quality",
      title: `Quality score is ${formatPercent(context.qualityScore)}`,
      body: `Missing values, duplicates, and outliers may affect executive confidence.`,
      priority: "High"
    });
  }
  context.trends.slice(0, 2).forEach((trend) => {
    feed.push({
      label: "Trend",
      title: `${titleCase(trend.column)} is trending ${trend.direction}`,
      body: `The later period changed by ${formatPercent(trend.change)} compared with the earlier period.`,
      priority: Math.abs(trend.change) > 20 ? "High" : "Medium"
    });
  });
  context.correlations.slice(0, 2).forEach((correlation) => {
    feed.push({
      label: "Driver",
      title: `${titleCase(correlation.a)} and ${titleCase(correlation.b)} move together`,
      body: `Correlation is ${correlation.score.toFixed(2)}, suggesting a ${correlation.strength} relationship to investigate.`,
      priority: correlation.strength === "strong" ? "High" : "Medium"
    });
  });
  context.categoryPerformance.slice(0, 2).forEach((performance) => {
    feed.push({
      label: "Segment",
      title: `${performance.best.name} leads ${titleCase(performance.categoryColumn)}`,
      body: `${performance.best.name} contributes ${formatNumber(performance.best.total, { compact: true })} in ${titleCase(performance.valueColumn)}.`,
      priority: "Medium"
    });
  });
  context.anomalies.slice(0, 3).forEach((anomaly) => {
    feed.push({
      label: anomaly.type,
      title: anomaly.title,
      body: anomaly.detail,
      priority: anomaly.severity
    });
  });

  if (!feed.length) {
    feed.push({
      label: "Discovery",
      title: "Dataset is stable and ready for deeper modeling",
      body: "No severe automatic exceptions were found. Forecasting and segmentation are the next best steps.",
      priority: "Low"
    });
  }
  return feed.slice(0, 9);
}

function generateSeniorAnalystMode(context) {
  const topKpi = context.kpis[0];
  const topTrend = context.trends[0];
  const topSegment = context.categoryPerformance[0];
  const topCorrelation = context.correlations[0];
  const topConcentration = context.concentration[0];
  const topOpportunity = context.opportunities[0];
  const topWarning = context.earlyWarnings[0];
  const topAnomaly = context.anomalies[0];

  return {
    executiveSummary: [
      `Reviewed ${formatNumber(context.metadata.rowCount)} rows and ${formatNumber(context.metadata.columnCount)} columns with a ${formatPercent(context.qualityScore)} quality score.`,
      context.periodComparison ? context.periodComparison.evidence : "No reliable dated period comparison could be produced from the current columns.",
      topKpi ? topKpi.evidence : "No strong business KPI column was detected from the current headers."
    ],
    businessContext: topSegment
      ? `This dataset behaves like a performance dataset: ${titleCase(topSegment.categoryColumn)} segments can be ranked by ${titleCase(topSegment.valueColumn)}.`
      : "The dataset can be profiled structurally, but it needs clearer business dimensions and measures for deeper operating context.",
    kpiDetection: context.kpis.length
      ? context.kpis.map((kpi) => `${kpi.label}: ${kpi.evidence}`)
      : ["No KPI-like numeric fields were detected. Add Revenue, Cost, Profit, Quantity, Customer, Product, Region, or Channel fields to improve interpretation."],
    trendAnalysis: topTrend
      ? `${titleCase(topTrend.column)} is the strongest trend, moving ${topTrend.direction} by ${formatPercent(Math.abs(topTrend.change))}.`
      : "Trend analysis is unavailable because a reliable date and numeric measure combination was not detected.",
    varianceAnalysis: context.varianceAnalysis.length ? context.varianceAnalysis.map((item) => item.evidence) : ["No material variance signal could be calculated."],
    segmentAnalysis: topSegment
      ? `${topSegment.best.name} is the top ${titleCase(topSegment.categoryColumn)} by ${titleCase(topSegment.valueColumn)} at ${formatNumber(topSegment.best.total, { compact: true })}; ${topSegment.weakest.name} is weakest at ${formatNumber(topSegment.weakest.total, { compact: true })}.`
      : "Segment analysis needs at least one category column and one numeric measure.",
    driverAnalysis: topCorrelation
      ? `${titleCase(topCorrelation.a)} and ${titleCase(topCorrelation.b)} have a ${topCorrelation.strength} correlation of ${topCorrelation.score.toFixed(2)}. Treat this as a driver hypothesis, not causality.`
      : "No strong numeric driver relationship was detected.",
    outlierInvestigation: topAnomaly ? `${topAnomaly.title}. ${topAnomaly.detail}` : "No severe outlier cluster was detected.",
    rootCauseHypotheses: buildRootCauseHypotheses({ topTrend, topSegment, topCorrelation, topConcentration, topWarning }),
    dataQualityConcerns: [
      `Completeness is ${formatPercent(context.scoreBreakdown.completenessScore)}, consistency is ${formatPercent(context.scoreBreakdown.consistencyScore)}, and duplicate count is ${formatNumber(context.duplicateCount)}.`,
      context.outliers.length ? `${formatNumber(context.outliers.length)} numeric outlier values may distort averages and forecasts.` : "Outlier pressure is limited by the current profiling rules."
    ],
    riskAssessment: topWarning ? `${topWarning.title}: ${topWarning.detail}` : "No critical risk alert was detected, but forecast and data-quality limitations still need review.",
    opportunityAssessment: topOpportunity ? `${topOpportunity.title}: ${topOpportunity.detail}` : "No high-confidence opportunity cluster was detected from the current fields.",
    recommendedNextActions: [
      topWarning ? `Address ${topWarning.title.toLowerCase()} because it is the highest severity warning.` : "Keep monitoring quality, trend, and anomaly signals before decisions are automated.",
      topSegment ? `Investigate why ${topSegment.best.name} outperforms ${topSegment.weakest.name}; this is the clearest segment playbook.` : "Add business dimensions such as Product, Region, Channel, Customer, or Category.",
      context.limitations[0] || "Convert the strongest signal into a tracked KPI and rerun the analysis after the next data refresh."
    ],
    leadershipQuestions: [
      topSegment ? `What operating conditions make ${topSegment.best.name} outperform ${topSegment.weakest.name}?` : "Which business dimension should leadership use to compare performance?",
      topCorrelation ? `Is there an operational reason ${titleCase(topCorrelation.a)} and ${titleCase(topCorrelation.b)} move together?` : "Which controllable inputs should be added to explain performance?",
      context.periodComparison ? `What changed between the first and second half of the dataset?` : "Can the source system provide reliable dates for period analysis?"
    ]
  };
}

function buildRootCauseHypotheses({ topTrend, topSegment, topCorrelation, topConcentration, topWarning }) {
  const hypotheses = [];
  if (topTrend) hypotheses.push(`${titleCase(topTrend.column)} movement may be linked to period mix, demand changes, or operational execution because the late period changed by ${formatPercent(Math.abs(topTrend.change))}.`);
  if (topSegment) hypotheses.push(`${topSegment.best.name} may have a repeatable advantage because it contributes ${formatNumber(topSegment.best.total, { compact: true })} in ${titleCase(topSegment.valueColumn)}.`);
  if (topCorrelation) hypotheses.push(`${titleCase(topCorrelation.a)} may be a driver or proxy for ${titleCase(topCorrelation.b)} because the correlation is ${topCorrelation.score.toFixed(2)}.`);
  if (topConcentration && topConcentration.share > 45) hypotheses.push(`Concentration risk may be present because ${topConcentration.top.name} contributes ${formatPercent(topConcentration.share)} of ${titleCase(topConcentration.measure)}.`);
  if (topWarning) hypotheses.push(`${topWarning.title} could escalate if the underlying signal is not monitored.`);
  return hypotheses.length ? hypotheses : ["Root cause analysis needs clearer dates, measures, and business dimensions before stronger hypotheses can be defended."];
}

function generateDataTeamIntelligence(context) {
  const topTrend = context.trends[0];
  const topSegment = context.categoryPerformance[0];
  const topCorrelation = context.correlations[0];
  const topWarning = context.earlyWarnings[0];
  const topOpportunity = context.opportunities[0];
  const topForecast = context.forecasts[0];
  const topConcentration = context.concentration[0];
  const revenue = context.kpis.find((kpi) => kpi.key === "revenue");
  const cost = context.kpis.find((kpi) => kpi.key === "cost");
  const profit = context.kpis.find((kpi) => kpi.key === "profitability");

  return [
    roleInsight("Senior Data Analyst", "Finds trends, anomalies, patterns, drivers, and decision points.", topTrend ? `${titleCase(topTrend.column)} is moving ${topTrend.direction}.` : "No reliable trend was detected.", topTrend ? `${titleCase(topTrend.column)} changed by ${formatPercent(Math.abs(topTrend.change))}.` : context.limitations[0], topWarning?.title || "Opportunity to deepen exploratory analysis.", topTrend ? "Validate the period movement against segment and anomaly rows." : "Add reliable date and numeric fields.", confidence(context)),
    roleInsight("BI Analyst", "Focuses on dashboards, KPIs, reporting logic, metric definitions, and executive visibility.", revenue ? `${revenue.label} should be treated as the primary executive KPI.` : "No obvious executive KPI was detected.", revenue?.evidence || "The current headers do not clearly identify revenue or sales.", revenue ? "Opportunity to formalize metric definitions." : "Reporting visibility risk.", revenue ? "Create KPI definitions for revenue, cost, margin, quality, and risk." : "Rename or map the primary business measure.", confidence(context) - 4),
    roleInsight("Business Analyst", "Focuses on processes, requirements, stakeholder impact, business rules, and operational decisions.", topSegment ? `${titleCase(topSegment.categoryColumn)} drives stakeholder comparison.` : "Business process dimensions are limited.", topSegment ? `${topSegment.best.name} leads while ${topSegment.weakest.name} lags.` : "No category and measure pair was strong enough for process comparison.", "Decision rules may be unclear without stronger dimensions.", "Ask stakeholders which categories represent teams, products, customers, or workflows.", confidence(context) - 6),
    roleInsight("Data Engineer", "Focuses on data pipelines, schema issues, source reliability, transformation logic, lineage, and scalability.", `The dataset has ${formatNumber(context.duplicateCount)} duplicate rows and completeness of ${formatPercent(context.scoreBreakdown.completenessScore)}.`, `Quality score is ${formatPercent(context.qualityScore)} across the uploaded schema.`, context.duplicateCount ? "Pipeline deduplication risk." : "Source reliability looks acceptable for MVP analysis.", "Persist schema metadata, row counts, duplicate checks, and source lineage on ingestion.", Math.max(45, confidence(context) - 8)),
    roleInsight("Analytics Engineer", "Focuses on data models, fact tables, dimension tables, metric layers, semantic models, and reusable business logic.", `${context.kpis.length} KPI-like fields and ${context.concentration.length} concentration dimensions were inferred.`, context.kpis[0]?.evidence || "Semantic mapping found limited metric candidates.", "Metric reuse risk if definitions stay embedded in UI logic.", "Model numeric measures as facts and customer/product/region/channel fields as dimensions.", confidence(context) - 5),
    roleInsight("Financial Analyst", "Focuses on revenue, cost, margin, profitability, variance, forecasting, and financial risk.", profit ? profit.evidence : cost ? cost.evidence : "Financial depth is limited without revenue, cost, or profit fields.", context.periodComparison?.evidence || (topForecast ? `${titleCase(topForecast.measure)} forecast risk is ${topForecast.risk}.` : "No dated financial forecast available."), topWarning?.title || "Margin and forecast uncertainty should be reviewed.", "Track revenue, cost, profit, and margin as separate measures before budget decisions.", confidence(context) - 3),
    roleInsight("Operations Analyst", "Focuses on bottlenecks, efficiency, capacity, service levels, inventory, and process performance.", topSegment ? `${topSegment.weakest.name} is the weakest visible operating segment.` : "No operating bottleneck segment was detected.", topSegment ? `${topSegment.weakest.name} contributes ${formatNumber(topSegment.weakest.total, { compact: true })} versus ${topSegment.best.name} at ${formatNumber(topSegment.best.total, { compact: true })}.` : "Missing branch, supplier, inventory, status, or process fields.", "Operational performance may be uneven across segments.", "Investigate low-performing segments and add process status/capacity fields.", confidence(context) - 7),
    roleInsight("Growth Analyst", "Focuses on customers, retention, expansion, channels, product performance, and market opportunity.", topOpportunity ? topOpportunity.title : topConcentration ? `${topConcentration.top.name} dominates ${titleCase(topConcentration.category)}.` : "Growth signals are limited.", topOpportunity?.detail || topConcentration?.evidence || "No customer, product, channel, or market pattern is strong enough yet.", topOpportunity ? "Growth opportunity." : "Expansion analysis risk.", "Prioritize experiments around the strongest segment and add retention/channel fields.", confidence(context) - 5),
    roleInsight("Risk Analyst", "Focuses on anomalies, data quality risk, concentration risk, forecasting risk, and operational exposure.", topWarning ? topWarning.title : "No critical alert detected.", topWarning?.detail || (topConcentration ? topConcentration.evidence : `Risk score is ${formatPercent(context.scoreBreakdown.riskScore)}.`), topConcentration?.share > 45 ? "Concentration risk." : "Monitoring risk.", "Set thresholds for data quality, concentration, anomaly counts, and forecast volatility.", Math.max(50, confidence(context) - 2)),
    roleInsight("Executive Consultant", "Converts findings into leadership recommendations and decision options.", topSegment ? `Leadership should decide whether to scale ${topSegment.best.name} or fix ${topSegment.weakest.name}.` : "Leadership needs better decision dimensions before choosing a playbook.", topSegment ? `${topSegment.best.name} outperforms ${topSegment.weakest.name} on ${titleCase(topSegment.valueColumn)}.` : context.limitations[0], "Strategic decision quality depends on evidence depth.", "Choose one action: protect the highest risk, scale the strongest segment, or enrich the dataset for stronger forecasts.", confidence(context))
  ];
}

function roleInsight(persona, focus, observation, evidence, riskOrOpportunity, recommendedAction, confidenceLevel) {
  return {
    persona,
    focus,
    observation,
    evidence: evidence || "Evidence is limited by the current uploaded dataset.",
    risk: riskOrOpportunity,
    opportunity: riskOrOpportunity,
    riskOrOpportunity,
    recommendedAction,
    businessImpact: `This matters because ${recommendedAction.charAt(0).toLowerCase()}${recommendedAction.slice(1)}`,
    confidence: confidenceLabel(confidenceLevel),
    confidenceLevel: Math.max(35, Math.min(96, Math.round(confidenceLevel)))
  };
}

function confidence(context) {
  return context.qualityScore * 0.62 + Math.min(14, context.trends.length * 3) + Math.min(10, context.correlations.length * 2) + Math.min(8, context.categoryPerformance.length * 2) + (context.forecasts.length ? 4 : 0);
}

function confidenceLabel(score) {
  const normalized = Number.isFinite(score) ? score : 50;
  if (normalized >= 80) return "High Confidence";
  if (normalized >= 58) return "Medium Confidence";
  return "Low Confidence";
}

function generateIntelligence(context) {
  const strongest = context.correlations[0];
  const topTrend = context.trends[0];
  const topSegment = context.categoryPerformance[0];
  const qualityRisk = context.qualityScore < 80;

  return {
    executiveSummary: [
      `Reality Engine reviewed ${formatNumber(context.metadata.rowCount)} records across ${formatNumber(context.metadata.columnCount)} columns and generated a ${formatPercent(context.qualityScore)} data quality score.`,
      context.periodComparison
        ? context.periodComparison.evidence
        : "No reliable period comparison was generated because date coverage is missing or too sparse.",
      topTrend
        ? `${titleCase(topTrend.column)} is moving ${topTrend.direction} by ${formatPercent(topTrend.change)}, making it the clearest directional signal.`
        : "No dated trend column was detected, so the engine prioritized structural patterns, category performance, and anomalies.",
      strongest
        ? `${titleCase(strongest.a)} is ${strongest.score > 0 ? "positively" : "negatively"} associated with ${titleCase(strongest.b)}.`
        : "No strong numeric driver relationship was detected from the current columns."
    ],
    keyFindings: [
      context.kpis[0] ? context.kpis[0].evidence : "No clear KPI column was detected from the current headers.",
      topSegment
        ? `${topSegment.best.name} is the strongest ${titleCase(topSegment.categoryColumn)} segment by ${titleCase(topSegment.valueColumn)}.`
        : "The dataset needs at least one category and one numeric measure for performance ranking.",
      context.concentration[0] ? context.concentration[0].evidence : "No material concentration signal was detected.",
      context.duplicateCount
        ? `${formatNumber(context.duplicateCount)} duplicate records were detected.`
        : "Duplicate risk is low in the uploaded data.",
      context.outliers.length
        ? `${formatNumber(context.outliers.length)} outlier values were found across numeric measures.`
        : "Outlier pressure is limited in the current numeric fields."
    ],
    risks: [
      qualityRisk ? "Decision confidence may be reduced until data gaps and duplicates are resolved." : "Data quality is acceptable for executive exploration.",
      context.anomalies.length ? "Anomalies should be reviewed before forecasting or automated action." : "No severe anomaly cluster was detected.",
      context.limitations[0] || "The current field coverage is sufficient for first-pass decision intelligence.",
      "OpenRouter responses should be grounded against the profiling payload before being shown to users."
    ],
    opportunities: [
      topSegment ? `Replicate the conditions behind ${topSegment.best.name}'s performance in weaker segments.` : "Add business category columns to unlock performance benchmarking.",
      strongest ? `Use ${titleCase(strongest.a)} and ${titleCase(strongest.b)} as candidate features for predictive modeling.` : "Enrich the dataset with operational drivers to improve prediction strength.",
      context.kpis.length ? `Formalize ${context.kpis.map((kpi) => kpi.label).slice(0, 3).join(", ")} as tracked decision metrics.` : "Rename key measures so the system can infer revenue, cost, profit, and customer signals.",
      "Persist metadata and profile snapshots in PostgreSQL to support historical intelligence."
    ],
    recommendedActions: [
      "Resolve missing and duplicate records before board-level reporting.",
      "Investigate the top anomaly rows and confirm whether they are valid business exceptions.",
      context.periodComparison ? "Ask what changed between the first and second half of the dataset because period variance is measurable." : "Add reliable dates so leadership can compare periods and forecast future outcomes.",
      "Run scenario simulations on the primary value measure before committing operational changes.",
      "Connect Apps Script to PostgreSQL and OpenRouter for authenticated production workflows."
    ],
    businessImpact: topTrend
      ? `${titleCase(topTrend.column)} changed by ${formatPercent(topTrend.change)} across the observed period. If this direction continues, leadership should adjust targets, resourcing, and risk thresholds.`
      : "The strongest immediate impact is faster analyst-grade triage: leaders receive risks, opportunities, and next actions without manually building dashboards."
  };
}

function generateInvestigation({ qualityScore, trends, correlations, categoryPerformance, anomalies, opportunities, earlyWarnings, semanticColumns, kpis, periodComparison, concentration }) {
  const topTrend = trends[0];
  const topCorrelation = correlations[0];
  const topSegment = categoryPerformance[0];
  const topAnomaly = anomalies[0];
  const topOpportunity = opportunities[0];
  const topWarning = earlyWarnings[0];
  const confidenceScore = Math.max(
    52,
    Math.min(
      96,
      qualityScore * 0.72 +
        Math.min(12, trends.length * 3) +
        Math.min(8, correlations.length * 2) +
        Math.min(4, categoryPerformance.length)
    )
  );

  return {
    mostImportantInsight: topTrend
      ? `${titleCase(topTrend.column)} is the dominant signal, moving ${topTrend.direction} by ${formatPercent(topTrend.change)} across the observed period.`
      : periodComparison
        ? periodComparison.evidence
        : kpis[0]
          ? kpis[0].evidence
          : topCorrelation
            ? `${titleCase(topCorrelation.a)} and ${titleCase(topCorrelation.b)} show the strongest relationship with correlation ${topCorrelation.score.toFixed(2)}.`
            : "The dataset is structurally clean enough for executive triage, but needs stronger time or driver fields for deeper causality.",
    biggestRisk: topWarning
      ? `${topWarning.title}: ${topWarning.detail}`
      : qualityScore < 80
        ? `Data confidence is constrained by a ${formatPercent(qualityScore)} quality score.`
        : "No critical business risk was detected from the current profile.",
    biggestOpportunity: topOpportunity
      ? `${topOpportunity.title}: ${topOpportunity.detail}`
      : concentration[0]
        ? `${concentration[0].top.name} is a concentration signal: ${concentration[0].evidence}`
        : topSegment
          ? `${topSegment.best.name} is outperforming other ${titleCase(topSegment.categoryColumn)} segments and should be used as the operating benchmark.`
          : "Add revenue, cost, customer, and channel fields to unlock stronger opportunity detection.",
    mostUnusualAnomaly: topAnomaly
      ? `${topAnomaly.title}. ${topAnomaly.detail}`
      : "No severe anomaly was detected. Current exceptions are within normal profiling limits.",
    executiveRecommendation: topSegment
      ? `Prioritize ${topSegment.best.name}, audit the weakest segment (${topSegment.weakest.name}), and use scenario planning before reallocating budget.`
      : semanticColumns.revenue?.length && !semanticColumns.cost?.length
        ? "Revenue is visible but cost is missing. Add cost data before making margin, pricing, or budget decisions."
        : "Improve data completeness, connect operational drivers, and rerun the investigation before making high-value decisions.",
    confidenceScore
  };
}

function discoverRelationships(rows, categoricalColumns, numericColumns) {
  const nodes = [];
  const edges = [];
  const categoryProfiles = categoricalColumns
    .filter((profile) => profile.uniqueValues > 1)
    .slice(0, 5);
  const measureProfiles = numericColumns.slice(0, 5);

  categoryProfiles.forEach((profile, index) => {
    nodes.push({
      id: profile.name,
      label: titleCase(profile.name),
      type: "entity",
      size: Math.max(34, Math.min(64, 28 + profile.uniqueValues * 2)),
      x: 18 + (index % 2) * 18,
      y: 18 + index * 14
    });
  });

  measureProfiles.forEach((profile, index) => {
    nodes.push({
      id: profile.name,
      label: titleCase(profile.name),
      type: "metric",
      size: Math.max(36, Math.min(70, 34 + Math.log10(Math.abs(profile.sum) + 1) * 8)),
      x: 66 + (index % 2) * 16,
      y: 22 + index * 13
    });
  });

  categoryProfiles.forEach((category) => {
    measureProfiles.forEach((measure) => {
      const groups = new Map();
      rows.forEach((row) => {
        const key = String(row[category.name] || "Unknown").trim() || "Unknown";
        const value = toNumber(row[measure.name]);
        if (!Number.isFinite(value)) return;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(value);
      });
      const totals = [...groups.values()].map(sum);
      if (totals.length < 2) return;
      const max = Math.max(...totals);
      const min = Math.min(...totals);
      const influence = max ? (max - min) / Math.abs(max) : 0;
      if (influence >= 0.18) {
        edges.push({
          from: category.name,
          to: measure.name,
          label: `${formatPercent(influence * 100)} spread`,
          strength: influence,
          insight: `${titleCase(category.name)} materially changes ${titleCase(measure.name)} outcomes.`
        });
      }
    });
  });

  return {
    nodes,
    edges: edges.sort((a, b) => b.strength - a.strength).slice(0, 16)
  };
}

function generateForecasts(rows, numericColumns, dateColumns) {
  const measure = chooseMeasure(numericColumns);
  const dateColumn = dateColumns[0]?.name;
  if (!measure || !dateColumn) return [];

  const points = rows
    .map((row) => ({ date: toDate(row[dateColumn]), value: toNumber(row[measure.name]) }))
    .filter((point) => point.date && Number.isFinite(point.value))
    .sort((a, b) => a.date - b.date);

  if (points.length < 5) return [];

  const firstDate = points[0].date;
  const xs = points.map((point) => Math.max(0, (point.date - firstDate) / 86400000));
  const ys = points.map((point) => point.value);
  const meanX = average(xs);
  const meanY = average(ys);
  const numerator = xs.reduce((total, x, index) => total + (x - meanX) * (ys[index] - meanY), 0);
  const denominator = xs.reduce((total, x) => total + (x - meanX) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  const residuals = xs.map((x, index) => ys[index] - (intercept + slope * x));
  const residualStd = Math.sqrt(average(residuals.map((value) => value ** 2)));
  const lastDate = points[points.length - 1].date;
  const lastValue = points[points.length - 1].value;
  const volatilityScore = Math.min(100, meanY ? (residualStd / Math.abs(meanY)) * 100 : 100);
  const seasonalitySignal = detectSeasonalitySignal(points);

  return [
    buildForecastWindow("30 Day Forecast", 30),
    buildForecastWindow("90 Day Forecast", 90),
    buildForecastWindow("12 Month Forecast", 365)
  ];

  function buildForecastWindow(label, horizonDays) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + horizonDays);
    const x = (forecastDate - firstDate) / 86400000;
    const projected = Math.max(0, intercept + slope * x);
    const confidenceWidth = residualStd * (horizonDays > 120 ? 2.2 : horizonDays > 45 ? 1.7 : 1.25);
    const growth = lastValue ? ((projected - lastValue) / Math.abs(lastValue)) * 100 : 0;
    return {
      label,
      horizonDays,
      measure: measure.name,
      projected,
      low: Math.max(0, projected - confidenceWidth),
      high: projected + confidenceWidth,
      growth,
      scenarios: {
        growth: projected * 1.12,
        stable: projected,
        decline: projected * 0.88
      },
      risk: growth < -10 ? "High" : growth < 0 ? "Medium" : residualStd > Math.abs(meanY) * 0.35 ? "Medium" : "Low",
      volatilityScore,
      seasonality: seasonalitySignal,
      confidence: confidenceLabel(100 - volatilityScore - (points.length < 12 ? 18 : 0) - (seasonalitySignal.detected ? 8 : 0)),
      explanation: `Forecast uses ${points.length >= 12 ? "linear trend with volatility bands" : "lightweight trend projection"}. Confidence is lower when volatility is high, history is short, or seasonality may be present.`,
      trendDecomposition: {
        direction: slope >= 0 ? "upward" : "downward",
        slope,
        residualStd,
        seasonality: seasonalitySignal.label
      },
      method: points.length >= 12 ? "linear trend with volatility bands" : "lightweight trend projection"
    };
  }
}

function detectSeasonalitySignal(points) {
  const byMonth = new Map();
  points.forEach((point) => {
    const month = point.date.getMonth();
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(point.value);
  });
  if (byMonth.size < 3) return { detected: false, label: "Not enough monthly coverage for seasonality detection" };
  const monthlyAverages = [...byMonth.values()].map(average);
  const spread = Math.max(...monthlyAverages) - Math.min(...monthlyAverages);
  const mean = average(monthlyAverages);
  const detected = mean ? spread / Math.abs(mean) > 0.28 : false;
  return {
    detected,
    label: detected ? "Possible seasonality or monthly mix effect detected" : "No strong seasonality signal detected"
  };
}

function generateBoardroom({ qualityScore, trends, correlations, categoryPerformance, anomalies, opportunities, earlyWarnings }) {
  const topTrend = trends[0];
  const topCorrelation = correlations[0];
  const topSegment = categoryPerformance[0];
  const topOpportunity = opportunities[0];
  const topWarning = earlyWarnings[0];

  return [
    {
      persona: "Data Analyst",
      focus: "Insights, trends, and anomalies",
      recommendation: topTrend
        ? `The strongest analytical signal is ${titleCase(topTrend.column)} moving ${topTrend.direction} by ${formatPercent(topTrend.change)}. Validate anomalies before forecasting decisions.`
        : "The dataset needs a reliable date field to unlock stronger trend analysis.",
      stance: anomalies.length ? "Investigate exceptions first" : "Proceed to deeper segmentation"
    },
    {
      persona: "Chief Financial Officer",
      focus: "Profitability, efficiency, and financial risks",
      recommendation: topCorrelation
        ? `Treat ${titleCase(topCorrelation.a)} and ${titleCase(topCorrelation.b)} as financial control variables because their relationship is ${topCorrelation.score.toFixed(2)}.`
        : `The current quality score is ${formatPercent(qualityScore)}; strengthen controls before using this for budget commitments.`,
      stance: topWarning ? "Protect downside" : "Optimize allocation"
    },
    {
      persona: "Operations Manager",
      focus: "Bottlenecks, resources, and process performance",
      recommendation: topSegment
        ? `Benchmark operations against ${topSegment.best.name} and inspect why ${topSegment.weakest.name} is lagging.`
        : "Add operational categories such as supplier, branch, team, or workflow stage to expose bottlenecks.",
      stance: "Standardize what works"
    },
    {
      persona: "Growth Strategist",
      focus: "Expansion, customer growth, and market potential",
      recommendation: topOpportunity
        ? `${topOpportunity.title}. Prioritize experiments where impact is easiest to validate.`
        : "The next growth move is data enrichment: add customer, market, and channel dimensions.",
      stance: "Scale winning segments"
    },
    {
      persona: "Final Recommendation",
      focus: "Boardroom synthesis",
      recommendation: topWarning
        ? `Act on ${topWarning.title.toLowerCase()} first, then pursue the top opportunity with tight measurement.`
        : "Use the strongest segment as a growth model, monitor trend risk, and convert relationship signals into testable operating actions.",
      stance: "Decide with evidence"
    }
  ];
}

function scanOpportunities({ trends, correlations, categoryPerformance, numericColumns, rows }) {
  const measure = chooseMeasure(numericColumns);
  const opportunities = [];
  const performance = categoryPerformance[0];
  const trend = trends[0];
  const correlation = correlations[0];

  if (performance) {
    const gap = performance.best.total - performance.weakest.total;
    opportunities.push({
      type: "Revenue",
      title: `Lift ${performance.weakest.name} toward ${performance.best.name}`,
      detail: `${titleCase(performance.categoryColumn)} performance spread suggests a revenue playbook can be transferred.`,
      impact: gap * 0.25,
      confidence: "High"
    });
  }

  const costColumn = numericColumns.find((profile) => /cost|expense|spend|loss/i.test(profile.name));
  if (measure && costColumn) {
    const costRatio = costColumn.sum / Math.max(measure.sum, 1);
    opportunities.push({
      type: "Cost reduction",
      title: `Reduce ${titleCase(costColumn.name)} intensity`,
      detail: `${titleCase(costColumn.name)} equals ${formatPercent(costRatio * 100)} of ${titleCase(measure.name)}, leaving room for margin improvement.`,
      impact: costColumn.sum * 0.08,
      confidence: costRatio > 0.45 ? "High" : "Medium"
    });
  }

  const churnColumn = numericColumns.find((profile) => /churn|cancel|attrition/i.test(profile.name));
  if (churnColumn) {
    opportunities.push({
      type: "Customer retention",
      title: `Attack ${titleCase(churnColumn.name)} hotspots`,
      detail: `Retention risk is measurable and can be segmented against the relationship map.`,
      impact: measure ? measure.mean * rows.length * 0.06 : churnColumn.sum * 0.1,
      confidence: "Medium"
    });
  }

  if (trend && trend.direction === "up") {
    opportunities.push({
      type: "Untapped market",
      title: `Accelerate the ${titleCase(trend.column)} growth curve`,
      detail: `Recent period growth of ${formatPercent(trend.change)} indicates momentum worth funding.`,
      impact: measure ? measure.sum * Math.min(0.18, Math.abs(trend.change) / 200) : 0,
      confidence: Math.abs(trend.change) > 20 ? "High" : "Medium"
    });
  }

  if (correlation) {
    opportunities.push({
      type: "Process improvement",
      title: `Operationalize the ${titleCase(correlation.a)} to ${titleCase(correlation.b)} relationship`,
      detail: `The ${correlation.strength} relationship can become a monitored driver in future workflows.`,
      impact: measure ? measure.sum * Math.min(0.12, Math.abs(correlation.score) / 10) : 0,
      confidence: correlation.strength === "strong" ? "High" : "Medium"
    });
  }

  return opportunities.sort((a, b) => b.impact - a.impact).slice(0, 8);
}

function generateEarlyWarnings({ qualityScore, duplicateCount, rows, trends, anomalies, numericColumns, categoryPerformance }) {
  const warnings = [];
  const revenueTrend = trends.find((trend) => /revenue|sales|income|amount|value|total/i.test(trend.column)) || trends[0];
  const churnColumn = numericColumns.find((profile) => /churn|cancel|attrition/i.test(profile.name));
  const inventoryColumn = numericColumns.find((profile) => /inventory|stock|quantity|units/i.test(profile.name));
  const profitColumn = numericColumns.find((profile) => /profit|margin/i.test(profile.name));

  if (revenueTrend && revenueTrend.change < -5) {
    warnings.push({
      title: "Revenue decline risk",
      detail: `${titleCase(revenueTrend.column)} is down ${formatPercent(Math.abs(revenueTrend.change))} across the observed period.`,
      severity: revenueTrend.change < -25 ? "Critical" : revenueTrend.change < -12 ? "High" : "Medium"
    });
  }

  if (churnColumn && churnColumn.mean > 8) {
    warnings.push({
      title: "Customer churn risk",
      detail: `${titleCase(churnColumn.name)} averages ${formatNumber(churnColumn.mean)}, which may pressure growth and revenue retention.`,
      severity: churnColumn.mean > 14 ? "Critical" : "High"
    });
  }

  if (inventoryColumn && inventoryColumn.min < inventoryColumn.mean * 0.25) {
    warnings.push({
      title: "Inventory shortage risk",
      detail: `${titleCase(inventoryColumn.name)} has low points far below the average.`,
      severity: "High"
    });
  }

  if (profitColumn && profitColumn.mean < 0) {
    warnings.push({
      title: "Profitability risk",
      detail: `${titleCase(profitColumn.name)} is negative on average.`,
      severity: "Critical"
    });
  } else if (categoryPerformance[0]?.weakest?.total < categoryPerformance[0]?.best?.total * 0.35) {
    warnings.push({
      title: "Profitability concentration risk",
      detail: `${categoryPerformance[0].weakest.name} materially underperforms ${categoryPerformance[0].best.name}.`,
      severity: "Medium"
    });
  }

  if (qualityScore < 85 || duplicateCount > 0 || anomalies.length > 4) {
    warnings.push({
      title: "Data quality risk",
      detail: `Quality is ${formatPercent(qualityScore)} with ${formatNumber(duplicateCount)} duplicates and ${formatNumber(anomalies.length)} anomaly signals.`,
      severity: qualityScore < 65 ? "Critical" : qualityScore < 78 ? "High" : "Medium"
    });
  }

  if (!warnings.length && rows.length) {
    warnings.push({
      title: "Monitoring active",
      detail: "No urgent predictive alert was detected, but the system will keep watching trend, quality, and anomaly signals.",
      severity: "Low"
    });
  }

  const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  return warnings.sort((a, b) => order[b.severity] - order[a.severity]).slice(0, 8);
}

export function answerQuestion(question, dataset, analysis) {
  const lower = question.toLowerCase();
  const measure = chooseMeasure(analysis.numericColumns);
  const topSegment = analysis.categoryPerformance[0];
  const topCorrelation = analysis.correlations[0];
  const topTrend = analysis.trends[0];

  if (!dataset.rows.length) {
    return "Upload a dataset first so the assistant can ground every answer in actual rows.";
  }

  if (lower.includes("drop") || lower.includes("declin") || lower.includes("why")) {
    if (topTrend) {
      return `${titleCase(topTrend.column)} is ${topTrend.direction === "down" ? "dropping" : "not dropping in the detected period"}: the later records changed by ${formatPercent(topTrend.change)} versus earlier records. Check anomalies and weaker segments before assuming the cause.`;
    }
    return "I do not see a date column strong enough to explain a drop over time. Add a date field, then I can compare earlier and later periods directly.";
  }

  if (lower.includes("best") || lower.includes("perform")) {
    if (topSegment) {
      return `${topSegment.best.name} performs best in ${titleCase(topSegment.categoryColumn)} with total ${titleCase(topSegment.valueColumn)} of ${formatNumber(topSegment.best.total, { compact: true })}. The weakest visible segment is ${topSegment.weakest.name}.`;
    }
    return "I need at least one category column and one numeric measure to rank best performers.";
  }

  if (lower.includes("factor") || lower.includes("influence") || lower.includes("driver") || lower.includes("revenue")) {
    if (topCorrelation) {
      return `${titleCase(topCorrelation.a)} is the strongest detected factor linked to ${titleCase(topCorrelation.b)} with correlation ${topCorrelation.score.toFixed(2)}. This is a statistical signal, not proof of causality.`;
    }
    if (analysis.seniorAnalyst?.driverAnalysis) {
      return analysis.seniorAnalyst.driverAnalysis;
    }
    return "No strong numeric driver was detected. Add operational inputs such as price, volume, channel, cost, churn, or marketing spend to improve driver analysis.";
  }

  if (lower.includes("anomal")) {
    if (analysis.anomalies.length) {
      return analysis.anomalies
        .slice(0, 3)
        .map((item) => `${item.title}: ${item.detail}`)
        .join(" ");
    }
    return "No severe anomalies were detected by the current profiling rules.";
  }

  if (lower.includes("recommend") || lower.includes("next") || lower.includes("action")) {
    return analysis.seniorAnalyst?.recommendedNextActions?.join(" ") || "No recommended action is available until the dataset has usable rows.";
  }

  if (lower.includes("kpi") || lower.includes("metric")) {
    return analysis.kpis?.length
      ? analysis.kpis.map((kpi) => kpi.evidence).join(" ")
      : "No KPI-like columns were detected. Add fields such as Revenue, Sales, Cost, Profit, Quantity, Customer, Product, Region, or Channel.";
  }

  return `The primary measure appears to be ${titleCase(measure?.name || "the main numeric column")}. Quality is ${formatPercent(analysis.qualityScore)}, with ${formatNumber(analysis.duplicateCount)} duplicate rows and ${formatNumber(analysis.outliers.length)} outlier values detected. ${analysis.seniorAnalyst?.executiveSummary?.[1] || ""}`;
}

export function runScenario({ analysis, dataset, targetColumn, changePercent }) {
  const column = targetColumn || chooseMeasure(analysis.numericColumns)?.name;
  if (!column) return null;
  const values = dataset.rows.map((row) => toNumber(row[column])).filter(Number.isFinite);
  const baseline = sum(values);
  const projected = baseline * (1 + changePercent / 100);
  const delta = projected - baseline;
  const riskLevel = changePercent <= -25 ? "Critical" : changePercent < 0 ? "High" : changePercent > 35 ? "Medium" : "Low";
  return {
    column,
    changePercent,
    baseline,
    projected,
    delta,
    riskLevel,
    recommendation:
      changePercent < 0
        ? `Protect ${titleCase(column)} by reviewing the weakest segments, anomaly rows, and early warning signals before the decline compounds.`
        : `Validate whether the business can support a ${formatPercent(changePercent)} change in ${titleCase(column)} without creating cost, quality, or operational pressure.`,
    averageBefore: average(values),
    averageAfter: average(values) * (1 + changePercent / 100)
  };
}

export function chooseMeasure(numericColumns) {
  return (
    numericColumns.find((profile) => /revenue|sales|amount|profit|income|value|total/i.test(profile.name)) ||
    numericColumns.find((profile) => profile.sum > 0) ||
    numericColumns[0]
  );
}

function countDuplicates(rows) {
  const seen = new Set();
  let duplicates = 0;
  rows.forEach((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicates += 1;
    seen.add(key);
  });
  return duplicates;
}

function findDuplicateColumns(columns) {
  const counts = new Map();
  columns.forEach((column) => counts.set(column.toLowerCase(), (counts.get(column.toLowerCase()) || 0) + 1));
  return [...counts.entries()].filter(([, count]) => count > 1).map(([column]) => titleCase(column));
}

function detectCategoryInconsistency(rows, columnProfiles) {
  return columnProfiles
    .filter((profile) => profile.type === "category" || profile.type === "text")
    .map((profile) => {
      const normalized = new Map();
      rows.forEach((row) => {
        const raw = String(row[profile.name] ?? "");
        const key = raw.trim().toLowerCase();
        if (!key) return;
        if (!normalized.has(key)) normalized.set(key, new Set());
        normalized.get(key).add(raw);
      });
      const variants = [...normalized.entries()].filter(([, values]) => values.size > 1);
      return variants.length
        ? { column: profile.name, detail: `${titleCase(profile.name)} has inconsistent variants such as ${[...variants[0][1]].join(", ")}.` }
        : null;
    })
    .filter(Boolean);
}

function detectPotentialDataLeakage(columnProfiles) {
  return columnProfiles
    .filter((profile) => /future|target|label|prediction|forecast|outcome|score/i.test(profile.name))
    .map((profile) => ({ column: profile.name, detail: `${titleCase(profile.name)} may represent target, future, or model-output leakage.` }));
}

function detectPotentialDerivedColumns(columnProfiles) {
  return columnProfiles
    .filter((profile) => /rate|ratio|percent|percentage|margin|average|avg|total|score|index/i.test(profile.name))
    .map((profile) => ({ column: profile.name, detail: `${titleCase(profile.name)} may be derived and should be traced to source fields.` }));
}

function detectPrimaryKeyIssues(rows, columnProfiles) {
  return columnProfiles
    .filter((profile) => /(^id$|_id$| id$|uuid|key)/i.test(profile.name))
    .filter((profile) => profile.uniqueValues < rows.length)
    .map((profile) => ({ column: profile.name, detail: `${titleCase(profile.name)} looks key-like but is not unique across rows.` }));
}

function detectForeignKeyIssues(columnProfiles) {
  return columnProfiles
    .filter((profile) => /_id$| id$/i.test(profile.name) && profile.cardinalityRate < 10)
    .map((profile) => ({ column: profile.name, detail: `${titleCase(profile.name)} looks like a foreign key or dimension reference with repeated values.` }));
}

function explainReadiness({ readiness, duplicateCount, missingCells, invalidDates, invalidNumerics, outliers, trustScore }) {
  const reasons = [];
  if (duplicateCount) reasons.push(`${formatNumber(duplicateCount)} duplicate rows may inflate totals`);
  if (missingCells) reasons.push(`${formatNumber(missingCells)} missing cells reduce completeness`);
  if (invalidDates) reasons.push(`${formatNumber(invalidDates)} invalid date values limit forecasting`);
  if (invalidNumerics) reasons.push(`${formatNumber(invalidNumerics)} invalid numeric values weaken KPI analysis`);
  if (outliers.length) reasons.push(`${formatNumber(outliers.length)} outliers may distort averages`);
  return reasons.length ? `${readiness}: ${reasons.join("; ")}. Trust score is ${formatPercent(trustScore)}.` : `${readiness}: quality controls found no major blockers. Trust score is ${formatPercent(trustScore)}.`;
}

function buildQualityCommentary({ readiness, duplicateCount, missingCells, invalidDates, invalidNumerics, outliers, trustScore }) {
  if (readiness === "Ready For Analysis") {
    return `This dataset is suitable for executive analysis. Trust score is ${formatPercent(trustScore)}, with no major duplication or validity blockers detected.`;
  }
  if (readiness === "Ready With Warnings") {
    return `This dataset is usable for analysis but needs caution. ${formatNumber(duplicateCount)} duplicate rows, ${formatNumber(missingCells)} missing cells, ${formatNumber(invalidDates + invalidNumerics)} invalid values, and ${formatNumber(outliers.length)} outliers may affect confidence.`;
  }
  return `This dataset is not ready for high-stakes executive analysis. Cleaning should address duplicates, missing values, invalid fields, and outliers before forecasts or recommendations are trusted.`;
}

function normalizeHeaders(columns) {
  const seen = new Map();
  return (columns || []).map((column, index) => {
    const base = titleCase(String(column || `Column ${index + 1}`).trim().replace(/[_-]+/g, " ")) || `Column ${index + 1}`;
    const count = seen.get(base.toLowerCase()) || 0;
    seen.set(base.toLowerCase(), count + 1);
    return count ? `${base} ${count + 1}` : base;
  });
}

function cleanValue(value) {
  if (value === null || value === undefined) return "";
  const trimmed = String(value).trim().replace(/\s+/g, " ");
  const date = toDate(trimmed);
  if (date && /[-/]/.test(trimmed)) return date.toISOString().slice(0, 10);
  return trimmed;
}

function calculateQualityScore(rowCount, columnCount, profiles, duplicateCount, outlierCount) {
  if (!rowCount || !columnCount) return 0;
  const missingCells = profiles.reduce((total, profile) => total + profile.missing, 0);
  const totalCells = rowCount * columnCount;
  const missingPenalty = (missingCells / totalCells) * 45;
  const duplicatePenalty = (duplicateCount / rowCount) * 25;
  const outlierPenalty = Math.min(18, (outlierCount / Math.max(rowCount, 1)) * 30);
  const emptyPenalty = profiles.filter((profile) => profile.type === "empty").length * 4;
  return Math.max(0, Math.min(100, 100 - missingPenalty - duplicatePenalty - outlierPenalty - emptyPenalty));
}

function calculateScoreBreakdown(rowCount, columnCount, profiles, duplicateCount, outlierCount) {
  if (!rowCount || !columnCount) {
    return { completenessScore: 0, consistencyScore: 0, riskScore: 100 };
  }
  const missingCells = profiles.reduce((total, profile) => total + profile.missing, 0);
  const totalCells = rowCount * columnCount;
  const completenessScore = Math.max(0, 100 - (missingCells / totalCells) * 100);
  const duplicateRate = duplicateCount / rowCount;
  const emptyColumnRate = profiles.filter((profile) => profile.type === "empty").length / columnCount;
  const consistencyScore = Math.max(0, 100 - duplicateRate * 55 - emptyColumnRate * 35);
  const anomalyRate = outlierCount / Math.max(rowCount, 1);
  const riskScore = Math.min(100, duplicateRate * 35 + (1 - completenessScore / 100) * 35 + anomalyRate * 30);
  return { completenessScore, consistencyScore, riskScore };
}

function detectDateRange(rows, dateColumns) {
  const dateColumn = dateColumns[0]?.name;
  if (!dateColumn) return null;
  const dates = rows.map((row) => toDate(row[dateColumn])).filter(Boolean).sort((a, b) => a - b);
  if (!dates.length) return null;
  return {
    column: dateColumn,
    start: dates[0].toISOString().slice(0, 10),
    end: dates[dates.length - 1].toISOString().slice(0, 10)
  };
}

function summarizeCategories(rows, categoricalColumns) {
  return categoricalColumns.slice(0, 6).map((profile) => {
    const counts = new Map();
    rows.forEach((row) => {
      const key = String(row[profile.name] || "Unknown").trim() || "Unknown";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return {
      column: profile.name,
      topValues: [...counts.entries()]
        .map(([name, count]) => ({ name, count, share: rows.length ? (count / rows.length) * 100 : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  });
}

function isMissing(value) {
  return MISSING.has(String(value ?? "").trim().toLowerCase());
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[$,%\s,]/g, "");
  return cleaned === "" ? NaN : Number(cleaned);
}

function toDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value ?? "").trim();
  if (!text || /^\d+(\.\d+)?$/.test(text)) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
}

function percentile(sortedValues, percentileValue) {
  if (!sortedValues.length) return 0;
  const index = (percentileValue / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

function pearson(values) {
  const xs = values.map(([x]) => x);
  const ys = values.map(([, y]) => y);
  const meanX = average(xs);
  const meanY = average(ys);
  const numerator = values.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0);
  const denominatorX = Math.sqrt(xs.reduce((total, x) => total + (x - meanX) ** 2, 0));
  const denominatorY = Math.sqrt(ys.reduce((total, y) => total + (y - meanY) ** 2, 0));
  return denominatorX && denominatorY ? numerator / (denominatorX * denominatorY) : 0;
}
