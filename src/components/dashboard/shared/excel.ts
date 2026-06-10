import * as XLSX from "xlsx";

/** Maximum accepted spreadsheet size for the import dropzones. */
export const MAX_EXCEL_SIZE = 5 * 1024 * 1024; // 5 MB

export interface ReadExcelResult {
  /** Raw sheet rows (header row first), as produced by `sheet_to_json({ header: 1 })`. */
  rows: any[][];
  /** True when the workbook contained more than one sheet (only the first is read). */
  multipleSheets: boolean;
}

/**
 * Reads the first sheet of an Excel/CSV file into raw rows, applying the shared
 * validation (extension, size, non-empty). Throws an `Error` whose message is
 * safe to surface directly to the user.
 */
export async function readExcelRows(file: File): Promise<ReadExcelResult> {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    throw new Error("Please upload an Excel file (.xlsx, .xls, or .csv)");
  }
  if (file.size > MAX_EXCEL_SIZE) {
    throw new Error("File is too large. Please upload a file under 5 MB.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: "array",
    cellDates: true,
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (rows.length < 2) {
    throw new Error("Excel file is empty or has no data rows");
  }

  return { rows, multipleSheets: workbook.SheetNames.length > 1 };
}
