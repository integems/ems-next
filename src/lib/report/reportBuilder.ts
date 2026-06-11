/**
 * Builds downloadable reports (Word, Excel, PDF) from a `ReportData` payload.
 *
 * Each generator dynamically imports its (heavy) document library so the
 * libraries are only pulled into the bundle when the user actually exports a
 * report.
 */

import { dataUrlToBase64 } from "./svgToPng";
import { parseMarkdownBlocks, type ReportData } from "./types";

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

/* -------------------------------------------------------------------------- */
/*                                   Word                                      */
/* -------------------------------------------------------------------------- */

/**
 * The Word document is built on the server (see /api/report/word). docx ships
 * modern ESM whose class methods use native `super`, which crashes the browser
 * bundle with "'super' keyword unexpected here" — so we POST the payload and
 * download the streamed .docx instead of importing docx on the client.
 */
export async function generateWordReport(report: ReportData): Promise<void> {
  const response = await fetch("/api/report/word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    let message = "Failed to generate Word report.";
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      /* response wasn't JSON — keep the default message */
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  triggerDownload(blob, `${report.fileName}.docx`);
}

/* -------------------------------------------------------------------------- */
/*                                  Excel                                      */
/* -------------------------------------------------------------------------- */

export async function generateExcelReport(report: ReportData): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Environmental Monitoring System";
  workbook.created = report.generatedAt;

  /* ---- Summary sheet (title, meta, AI analysis) ---- */
  const summary = workbook.addWorksheet("Summary");
  summary.columns = [{ width: 28 }, { width: 80 }];

  const titleCell = summary.addRow([report.title]).getCell(1);
  titleCell.font = { size: 16, bold: true };
  if (report.subtitle) {
    summary.addRow([report.subtitle]).getCell(1).font = {
      italic: true,
      color: { argb: "FF666666" },
    };
  }
  summary.addRow([`Generated ${formatDate(report.generatedAt)}`]).getCell(1).font =
    { color: { argb: "FF888888" } };
  summary.addRow([]);

  if (report.meta?.length) {
    for (const m of report.meta) {
      const row = summary.addRow([m.label, m.value]);
      row.getCell(1).font = { bold: true };
    }
    summary.addRow([]);
  }

  if (report.aiText?.trim()) {
    summary.addRow(["AI Analysis"]).getCell(1).font = { size: 13, bold: true };
    for (const block of parseMarkdownBlocks(report.aiText)) {
      const text = block.type === "heading"
        ? block.text
        : (block.type === "listItem" ? "• " : "") +
          block.runs.map((r) => r.text).join("");
      const row = summary.addRow([text]);
      const cell = row.getCell(1);
      cell.alignment = { wrapText: true, vertical: "top" };
      if (block.type === "heading") cell.font = { bold: true };
    }
  }

  /* ---- Data sheets ---- */
  for (const table of report.tables) {
    const sheet = workbook.addWorksheet(sanitizeSheetName(table.title));
    const header = sheet.addRow(table.headers);
    header.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };
      cell.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
    });
    for (const row of table.rows) {
      sheet.addRow(row);
    }
    sheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        max = Math.max(max, String(cell.value ?? "").length + 2);
      });
      col.width = Math.min(max, 40);
    });
  }

  /* ---- Charts sheet (embedded images) ---- */
  if (report.charts.length) {
    const chartSheet = workbook.addWorksheet("Charts");
    let topRow = 0;
    for (const chart of report.charts) {
      chartSheet.getCell(`A${topRow + 1}`).value = chart.title;
      chartSheet.getCell(`A${topRow + 1}`).font = { bold: true, size: 12 };

      const imageId = workbook.addImage({
        base64: dataUrlToBase64(chart.imageDataUrl),
        extension: "png",
      });
      const maxWidth = 720;
      const scale = Math.min(1, maxWidth / chart.width);
      const w = Math.round(chart.width * scale);
      const h = Math.round(chart.height * scale);
      chartSheet.addImage(imageId, {
        tl: { col: 0, row: topRow + 1 },
        ext: { width: w, height: h },
      });
      // Advance below the image (≈20px per row) plus a gap.
      topRow += Math.ceil(h / 20) + 3;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${report.fileName}.xlsx`,
  );
}

function sanitizeSheetName(name: string): string {
  // Excel sheet names: max 31 chars, no : \ / ? * [ ]
  return name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Sheet";
}

/* -------------------------------------------------------------------------- */

export type ReportFormat = "word" | "excel";

export async function generateReport(
  format: ReportFormat,
  report: ReportData,
): Promise<void> {
  switch (format) {
    case "word":
      return generateWordReport(report);
    case "excel":
      return generateExcelReport(report);
  }
}
