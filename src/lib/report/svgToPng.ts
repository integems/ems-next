/**
 * Capture a rendered chart (Recharts container) as a PNG data URL for embedding
 * into Word / Excel reports.
 *
 * We use `html-to-image`, which clones the live DOM node, inlines its computed
 * styles and embeds the SVG faithfully. This reproduces theme/CSS-driven colours
 * that a plain XMLSerializer round-trip drops (which previously made charts show
 * up as empty "shapes" in the document).
 */

import { toPng } from "html-to-image";

export interface CapturedChart {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render the first chart inside `container` to a PNG data URL.
 * Returns `null` when there's nothing to capture (e.g. an empty-state chart),
 * so callers can simply skip it.
 */
export async function captureChartToPng(
  container: HTMLElement | null,
  options: { background?: string; pixelRatio?: number } = {},
): Promise<CapturedChart | null> {
  if (!container) return null;
  // No SVG means the chart rendered an empty state — nothing to embed.
  if (!container.querySelector("svg")) return null;

  const rect = container.getBoundingClientRect();
  const width = Math.round(rect.width) || 900;
  const height = Math.round(rect.height) || 400;

  const dataUrl = await toPng(container, {
    backgroundColor: options.background ?? "#ffffff",
    pixelRatio: options.pixelRatio ?? 2, // 2x for crisp images in documents
    cacheBust: true,
    width,
    height,
  });

  return { dataUrl, width, height };
}

/** Strip the `data:image/png;base64,` prefix, returning raw base64. */
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}
