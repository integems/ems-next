"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateReport,
  type ReportFormat,
} from "@/lib/report/reportBuilder";
import type { ReportData } from "@/lib/report/types";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Type,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReportExportButtonProps {
  /**
   * Builds the report payload at click time. Async so callers can capture
   * live chart SVGs to PNG only when an export is actually requested.
   */
  buildReport: () => Promise<ReportData> | ReportData;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "default" | "ghost";
  className?: string;
  disabled?: boolean;
}

const FORMATS: {
  format: ReportFormat;
  label: string;
  icon: typeof FileText;
}[] = [
  { format: "word", label: "Word document (.docx)", icon: FileText },
  { format: "excel", label: "Excel workbook (.xlsx)", icon: FileSpreadsheet },
];

/** Fonts offered for the Word document. The first entry is the default. */
const FONTS = ["Arial", "Calibri", "Times New Roman", "Georgia", "Verdana"];

export function ReportExportButton({
  buildReport,
  label = "Generate Report",
  size = "sm",
  variant = "outline",
  className,
  disabled,
}: ReportExportButtonProps) {
  const [busy, setBusy] = useState<ReportFormat | null>(null);
  const [font, setFont] = useState<string>(FONTS[0]);

  const handleExport = async (format: ReportFormat) => {
    if (busy) return;
    setBusy(format);
    const toastId = toast.loading("Preparing report…");
    try {
      const report = await buildReport();
      // The font only applies to the Word document.
      const payload = format === "word" ? { ...report, font } : report;
      await generateReport(format, payload);
      toast.success("Report downloaded", { id: toastId });
    } catch (error) {
      console.error("Report generation failed:", error);
      toast.error(
        error instanceof Error
          ? `Couldn't generate report: ${error.message}`
          : "Couldn't generate report.",
        { id: toastId },
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Font picker — sits next to the generate button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            disabled={disabled || busy !== null}
            title="Font for the Word document"
          >
            <Type className="h-4 w-4" />
            <span style={{ fontFamily: font }}>{font}</span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Word font</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={font} onValueChange={setFont}>
            {FONTS.map((name) => (
              <DropdownMenuRadioItem
                key={name}
                value={name}
                style={{ fontFamily: name }}
              >
                {name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Generate report */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={disabled || busy !== null}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export as</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FORMATS.map(({ format, label, icon: Icon }) => (
            <DropdownMenuItem
              key={format}
              disabled={busy !== null}
              onSelect={(e) => {
                e.preventDefault();
                handleExport(format);
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
