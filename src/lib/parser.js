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
    if (message.includes("inline string") || message.includes("inlineStr") || message.includes("cell value structure") || message.includes("DOMParser")) {
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
  const workbook = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const sharedStrings = parseSharedStrings(workbook);
  const sheetPath = findFirstWorksheetPath(workbook);
  const sheetXml = workbook[sheetPath];
  if (!sheetXml) {
    throw new Error("The XLSX workbook does not contain a readable worksheet.");
  }

  const rowNodes = getTagBlocks(strFromU8(sheetXml), "row");
  return rowNodes.map((rowXml) => {
    const row = [];
    getTagBlocks(rowXml, "c").forEach((cellXml) => {
      const ref = getAttribute(cellXml, "r") || "";
      const index = columnIndexFromCellRef(ref);
      row[index] = readCellValue(cellXml, sharedStrings);
    });
    return row.map((value) => value ?? "");
  });
}

function parseSharedStrings(workbook) {
  const xml = workbook["xl/sharedStrings.xml"];
  if (!xml) return [];
  return getTagBlocks(strFromU8(xml), "si").map((node) =>
    getTagBlocks(node, "t")
      .map((textNode) => decodeXml(stripTags(textNode)))
      .join("")
  );
}

function findFirstWorksheetPath(workbook) {
  const workbookXml = workbook["xl/workbook.xml"];
  const relsXml = workbook["xl/_rels/workbook.xml.rels"];
  if (!workbookXml || !relsXml) {
    return "xl/worksheets/sheet1.xml";
  }

  const firstSheet = getTagBlocks(strFromU8(workbookXml), "sheet")[0];
  const relationshipId = firstSheet ? getAttribute(firstSheet, "r:id") : "";
  if (!relationshipId) return "xl/worksheets/sheet1.xml";

  const rel = getTagBlocks(strFromU8(relsXml), "Relationship").find(
    (node) => getAttribute(node, "Id") === relationshipId
  );
  const target = rel ? getAttribute(rel, "Target") : "worksheets/sheet1.xml";
  return target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^xl\//, "")}`;
}

function readCellValue(cellXml, sharedStrings) {
  const type = getAttribute(cellXml, "t");
  if (type === "inlineStr") {
    const inlineString = getTagBlocks(cellXml, "is")[0];
    if (!inlineString) return "";
    return getTagBlocks(inlineString, "t")
      .map((node) => decodeXml(stripTags(node)))
      .join("");
  }

  const value = decodeXml(stripTags(getTagBlocks(cellXml, "v")[0] || ""));
  if (type === "s") {
    return sharedStrings[Number(value)] ?? "";
  }
  if (type === "b") {
    return value === "1" ? "TRUE" : "FALSE";
  }
  return value;
}

function getTagBlocks(xml, tag) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<${escapedTag}\\b[^>]*(?:/>|>[\\s\\S]*?<\\/${escapedTag}>)`, "gi");
  return xml.match(pattern) || [];
}

function getAttribute(xml, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`\\s${escapedName}=["']([^"']*)["']`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function stripTags(xml = "") {
  return String(xml).replace(/<[^>]*>/g, "");
}

function decodeXml(value = "") {
  return String(value)
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
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
