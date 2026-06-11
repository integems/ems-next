/**
 * Server-side Word (.docx) builder.
 *
 * docx ships modern ESM whose class methods use native `super`. When bundled
 * for the browser it can throw "'super' keyword unexpected here", so the Word
 * document is built here in Node (where `super` parses natively) and streamed
 * to the client via the /api/report/word route.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";

import { parseMarkdownBlocks, type ReportData, type ReportTable } from "./types";

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

/**
 * Decode a PNG data URL to a Uint8Array.
 *
 * We return an exact-length `Uint8Array` copy rather than a Node `Buffer`: a
 * Buffer is a view into a shared memory pool, and docx may embed the whole
 * pool's bytes instead of just the image — which makes Word render an empty
 * placeholder shape instead of the chart.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(base64, "base64");
  return new Uint8Array(buf); // fresh ArrayBuffer sized exactly to the image
}

export async function buildWordDocument(report: ReportData): Promise<Buffer> {
  // Font family for the whole document. Defaults to Arial; callers can override
  // via `report.font` (e.g. "Calibri", "Times New Roman", "Georgia").
  const font = report.font?.trim() || "Arial";

  const children: (Paragraph | Table)[] = [];

  // Title block.
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: report.title, bold: true })],
    }),
  );
  if (report.subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: report.subtitle, italics: true, color: "555555" }),
        ],
      }),
    );
  }
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated ${formatDate(report.generatedAt)}`,
          color: "888888",
          size: 18,
        }),
      ],
    }),
  );

  // Meta / filters.
  if (report.meta?.length) {
    for (const m of report.meta) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${m.label}: `, bold: true, size: 20 }),
            new TextRun({ text: m.value, size: 20 }),
          ],
        }),
      );
    }
  }

  // AI written analysis.
  if (report.aiText?.trim()) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240 },
        children: [new TextRun({ text: "AI Analysis", bold: true })],
      }),
    );
    for (const block of parseMarkdownBlocks(report.aiText)) {
      if (block.type === "heading") {
        children.push(
          new Paragraph({
            heading:
              block.level === 1
                ? HeadingLevel.HEADING_2
                : block.level === 2
                  ? HeadingLevel.HEADING_3
                  : HeadingLevel.HEADING_4,
            spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: block.text, bold: true })],
          }),
        );
      } else {
        children.push(
          new Paragraph({
            bullet: block.type === "listItem" ? { level: 0 } : undefined,
            spacing:
              block.type === "listItem"
                ? { after: 80 }
                : { after: 160, line: 276 },
            children: block.runs.map(
              (r) =>
                new TextRun({ text: r.text, bold: r.bold, italics: r.italic }),
            ),
          }),
        );
      }
    }
  }

  // Charts.
  if (report.charts.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240 },
        children: [new TextRun({ text: "Charts", bold: true })],
      }),
    );
    const maxWidth = 600; // docx uses pixels here.
    for (const chart of report.charts) {
      const scale = Math.min(1, maxWidth / chart.width);
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: chart.title })],
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: "png",
              data: dataUrlToUint8Array(chart.imageDataUrl),
              transformation: {
                width: Math.round(chart.width * scale),
                height: Math.round(chart.height * scale),
              },
            }),
          ],
        }),
      );
    }
  }

  // Tables.
  for (const table of report.tables) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240 },
        children: [new TextRun({ text: table.title, bold: true })],
      }),
    );
    children.push(buildWordTable(table));
  }

  function buildWordTable(table: ReportTable) {
    const border = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: "DDDDDD",
    };
    const headerRow = new TableRow({
      tableHeader: true,
      children: table.headers.map(
        (h) =>
          new TableCell({
            shading: { fill: "F1F5F9" },
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(h), bold: true, size: 18 })],
              }),
            ],
          }),
      ),
    });
    const bodyRows = table.rows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(cell), size: 18 })],
                  }),
                ],
              }),
          ),
        }),
    );
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: border,
        bottom: border,
        left: border,
        right: border,
        insideHorizontal: border,
        insideVertical: border,
      },
      rows: [headerRow, ...bodyRows],
    });
  }

  const doc = new Document({
    // Document-wide defaults: 11pt body text, 1.15 line spacing and 8pt after
    // every paragraph so the generated text/paragraphs aren't cramped.
    styles: {
      default: {
        document: {
          run: { font, size: 22 },
          paragraph: { spacing: { line: 276, after: 160 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            // 1 inch (1440 twips) margins on every side.
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
