import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import { safeColumnName } from "./format.js";

export async function parseDataFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    return parseCsv(file);
  }
  if (extension === "xlsx") {
    return parseWorkbook(file);
  }
  throw new Error("Upload a CSV or XLSX file.");
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (result) => {
        if (result.errors?.length) {
          reject(new Error(result.errors[0].message));
          return;
        }
        resolve(normalizeRows(result.data, result.meta.fields || []));
      },
      error: (error) => reject(error)
    });
  });
}

async function parseWorkbook(file) {
  const sheetRows = await readXlsxFile(file);
  if (!sheetRows.length) {
    return normalizeRows([], []);
  }
  const rawColumns = sheetRows[0].map((value, index) => safeColumnName(value, index));
  const rows = sheetRows.slice(1).map((values) =>
    rawColumns.reduce((record, column, index) => {
      record[column] = values[index] ?? "";
      return record;
    }, {})
  );
  return normalizeRows(rows, rawColumns);
}

function normalizeRows(rows, rawColumns) {
  const columns = rawColumns.map(safeColumnName);
  const cleanRows = rows
    .filter((row) => Object.values(row).some((value) => String(value ?? "").trim() !== ""))
    .map((row) =>
      columns.reduce((record, column, index) => {
        const originalName = rawColumns[index];
        record[column] = normalizeValue(row[originalName]);
        return record;
      }, {})
    );

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

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null || value === undefined) return "";
  return String(value).trim();
}
