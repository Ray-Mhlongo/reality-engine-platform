import { strFromU8, unzipSync } from "fflate";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import { safeColumnName } from "./format.js";

export async function parseDataFile(file) {
  if (!file) {
    throw new Error("No file uploaded. Choose a CSV or XLSX file to analyze.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    return parseCsv(file);
  }
  if (extension === "xlsx") {
    return parseWorkbook(file);
  }
  throw new Error("Invalid file type. Upload a CSV or modern Excel XLSX file.");
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const parseTarget = typeof FileReader === "undefined" && typeof file.text === "function" ? file.text() : file;
    Promise.resolve(parseTarget)
      .then((target) => {
        Papa.parse(target, {
      header: false,
      skipEmptyLines: false,
      dynamicTyping: false,
      complete: (result) => {
        if (result.errors?.some((error) => error.type === "Delimiter" || error.type === "Quotes")) {
          reject(new Error(result.errors[0].message));
          return;
        }
        try {
          resolve(normalizeParsedData(result.data));
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
        });
      })
      .catch((error) => reject(error));
  });
}

async function parseWorkbook(file) {
  try {
    const sheetRows = await readXlsxFile(file);
    return normalizeParsedData(sheetRows);
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("inline string") || message.includes("inlineStr") || message.includes("cell value structure")) {
      const fallbackRows = await parseWorkbookXmlFallback(file);
      return normalizeParsedData(fallbackRows);
    }
    throw new Error(`Could not read this XLSX file. ${message}`);
  }
}

function normalizeParsedData(parsedData) {
  if (!Array.isArray(parsedData)) {
    throw new Error("The uploaded file could not be parsed into rows.");
  }

  if (!parsedData.length) {
    throw new Error("The uploaded file is empty.");
  }

  const firstUsable = parsedData.find((row) => rowHasValues(row));
  if (!firstUsable) {
    throw new Error("The uploaded file contains no usable rows.");
  }

  if (Array.isArray(firstUsable)) {
    return normalizeTable(parsedData);
  }

  if (isPlainObject(firstUsable)) {
    const columns = uniqueColumns(parsedData.flatMap((row) => (isPlainObject(row) ? Object.keys(row) : [])));
    return normalizeRows(parsedData.filter(isPlainObject), columns);
  }

  throw new Error("The uploaded file has an unsupported row structure.");
}

function normalizeTable(table) {
  const rows = table.map((row) => (Array.isArray(row) ? row : []));
  const headerIndex = rows.findIndex((row) => rowHasValues(row));
  if (headerIndex < 0) {
    throw new Error("The uploaded file contains no header row.");
  }

  const headerRow = rows[headerIndex];
  const maxWidth = Math.max(...rows.map((row) => row.length), headerRow.length);
  const rawColumns = uniqueColumns(
    Array.from({ length: maxWidth }, (_, index) => safeColumnName(headerRow[index], index))
  );

  const objectRows = rows.slice(headerIndex + 1).map((row) =>
    rawColumns.reduce((record, column, index) => {
      record[column] = row[index] ?? "";
      return record;
    }, {})
  );

  return normalizeRows(objectRows, rawColumns);
}

function normalizeRows(rows, rawColumns) {
  const columns = uniqueColumns((Array.isArray(rawColumns) ? rawColumns : []).map(safeColumnName));
  if (!columns.length) {
    throw new Error("No columns were detected in the uploaded file.");
  }

  const cleanRows = (Array.isArray(rows) ? rows : [])
    .filter((row) => isPlainObject(row) && Object.values(row).some((value) => String(value ?? "").trim() !== ""))
    .map((row) =>
      columns.reduce((record, column) => {
        record[column] = normalizeValue(row[column]);
        return record;
      }, {})
    );

  if (!cleanRows.length) {
    throw new Error("No usable data rows were found after cleaning blank rows.");
  }

  return {
    rows: cleanRows,
    columns,
    metadata: {
      rowCount: cleanRows.length,
      columnCount: columns.length,
      importedAt: new Date().toISOString()
    }
  };
}

async function parseWorkbookXmlFallback(file) {
  if (typeof DOMParser === "undefined") {
    throw new Error("This browser cannot use the fallback XLSX parser.");
  }

  const workbook = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const sharedStrings = parseSharedStrings(workbook);
  const sheetPath = findFirstWorksheetPath(workbook);
  const sheetXml = workbook[sheetPath];
  if (!sheetXml) {
    throw new Error("The XLSX workbook does not contain a readable worksheet.");
  }

  const document = parseXml(strFromU8(sheetXml));
  const rowNodes = Array.from(document.getElementsByTagName("row"));
  return rowNodes.map((rowNode) => {
    const row = [];
    Array.from(rowNode.getElementsByTagName("c")).forEach((cellNode) => {
      const ref = cellNode.getAttribute("r") || "";
      const index = columnIndexFromCellRef(ref);
      row[index] = readCellValue(cellNode, sharedStrings);
    });
    return row.map((value) => value ?? "");
  });
}

function parseSharedStrings(workbook) {
  const xml = workbook["xl/sharedStrings.xml"];
  if (!xml) return [];
  const document = parseXml(strFromU8(xml));
  return Array.from(document.getElementsByTagName("si")).map((node) =>
    Array.from(node.getElementsByTagName("t"))
      .map((textNode) => textNode.textContent || "")
      .join("")
  );
}

function findFirstWorksheetPath(workbook) {
  const workbookXml = workbook["xl/workbook.xml"];
  const relsXml = workbook["xl/_rels/workbook.xml.rels"];
  if (!workbookXml || !relsXml) {
    return "xl/worksheets/sheet1.xml";
  }

  const workbookDoc = parseXml(strFromU8(workbookXml));
  const relsDoc = parseXml(strFromU8(relsXml));
  const firstSheet = workbookDoc.getElementsByTagName("sheet")[0];
  const relationshipId = firstSheet?.getAttribute("r:id");
  if (!relationshipId) return "xl/worksheets/sheet1.xml";

  const rel = Array.from(relsDoc.getElementsByTagName("Relationship")).find(
    (node) => node.getAttribute("Id") === relationshipId
  );
  const target = rel?.getAttribute("Target") || "worksheets/sheet1.xml";
  return target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^xl\//, "")}`;
}

function readCellValue(cellNode, sharedStrings) {
  const type = cellNode.getAttribute("t");
  if (type === "inlineStr") {
    const inlineString = cellNode.getElementsByTagName("is")[0];
    if (!inlineString) return "";
    return Array.from(inlineString.getElementsByTagName("t"))
      .map((node) => node.textContent || "")
      .join("");
  }

  const value = cellNode.getElementsByTagName("v")[0]?.textContent ?? "";
  if (type === "s") {
    return sharedStrings[Number(value)] ?? "";
  }
  if (type === "b") {
    return value === "1" ? "TRUE" : "FALSE";
  }
  return value;
}

function parseXml(xml) {
  return new DOMParser().parseFromString(xml, "application/xml");
}

function columnIndexFromCellRef(ref) {
  const letters = (ref.match(/[A-Z]+/i)?.[0] || "A").toUpperCase();
  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function rowHasValues(row) {
  if (Array.isArray(row)) {
    return row.some((value) => String(value ?? "").trim() !== "");
  }
  if (isPlainObject(row)) {
    return Object.values(row).some((value) => String(value ?? "").trim() !== "");
  }
  return false;
}

function uniqueColumns(columns) {
  const seen = new Map();
  return (Array.isArray(columns) ? columns : []).map((column, index) => {
    const base = safeColumnName(column, index);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base} ${count + 1}` : base;
  });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
