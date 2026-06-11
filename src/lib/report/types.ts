/**
 * Shared shape for a generated report. Each export format (Word, Excel, PDF)
 * consumes the same `ReportData` so the analysis components only have to build
 * the content once.
 */

export interface ReportChart {
  /** Heading shown above the chart. */
  title: string;
  /** PNG data URL produced by `captureChartToPng`. */
  imageDataUrl: string;
  /** Natural pixel width/height of the captured chart (for aspect ratio). */
  width: number;
  height: number;
}

export interface ReportTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ReportMeta {
  label: string;
  value: string;
}

export interface ReportData {
  /** Main document title, e.g. "Air Quality Analysis Report". */
  title: string;
  /** Optional sub-heading / description. */
  subtitle?: string;
  generatedAt: Date;
  /** Filter summary / context lines rendered near the top. */
  meta?: ReportMeta[];
  /** The assistant's written analysis (markdown). */
  aiText?: string;
  charts: ReportChart[];
  tables: ReportTable[];
  /** Base filename (without extension) used when saving. */
  fileName: string;
  /**
   * Font family for the Word document (e.g. "Arial", "Calibri", "Times New
   * Roman", "Georgia"). Defaults to "Arial" when omitted.
   */
  font?: string;
}

export type ReportBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; runs: ReportInline[] }
  | { type: "listItem"; runs: ReportInline[] };

export interface ReportInline {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Very small markdown -> block parser. The assistant replies in GitHub
 * flavoured markdown, but the document formats only need headings, paragraphs,
 * bullet lists and bold/italic emphasis to read well. Tables/code are flattened
 * to plain paragraphs.
 */
export function parseMarkdownBlocks(markdown: string): ReportBlock[] {
  const blocks: ReportBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    // Skip markdown table separator / horizontal rules.
    if (/^[-|:\s]+$/.test(line) && line.includes("|")) continue;
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) continue;

    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: stripInlineMarkers(headingMatch[2]),
      });
      continue;
    }

    const bulletMatch = /^\s*([-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (bulletMatch) {
      blocks.push({ type: "listItem", runs: parseInline(bulletMatch[2]) });
      continue;
    }

    // Flatten table rows ("| a | b |") into a tab-separated paragraph.
    if (line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      blocks.push({
        type: "paragraph",
        runs: parseInline(cells.join("   ")),
      });
      continue;
    }

    blocks.push({ type: "paragraph", runs: parseInline(line) });
  }

  return blocks;
}

/** Parse a single line of markdown into bold/italic inline runs. */
export function parseInline(text: string): ReportInline[] {
  const runs: ReportInline[] = [];
  // Match **bold**, __bold__, *italic*, _italic_, `code`.
  const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|`(.+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[2] !== undefined) {
      runs.push({ text: match[2], bold: true });
    } else if (match[4] !== undefined) {
      runs.push({ text: match[4], italic: true });
    } else if (match[5] !== undefined) {
      runs.push({ text: match[5] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  return runs.length ? runs : [{ text }];
}

function stripInlineMarkers(text: string): string {
  return text
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}
