import { NextResponse } from "next/server";

import { buildWordDocument } from "@/lib/report/wordDocServer";
import type { ReportData } from "@/lib/report/types";

// docx is a heavy native-ish module; keep it on the Node runtime and out of the
// client bundle (which is where the "'super' keyword unexpected here" crash came
// from).
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as ReportData;

    // `generatedAt` arrives as an ISO string over the wire — revive it.
    const report: ReportData = {
      ...raw,
      generatedAt: new Date(raw.generatedAt),
    };

    const buffer = await buildWordDocument(report);
    const fileName = `${report.fileName || "report"}.docx`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Word report generation failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to generate report.",
      },
      { status: 500 },
    );
  }
}
