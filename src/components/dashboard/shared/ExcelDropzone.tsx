"use client";

import { Upload } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ExcelDropzoneProps {
  /** Called with the chosen file (from drop or browse). */
  onFile: (file: File) => void;
  label?: string;
}

/**
 * Drag-and-drop + browse control for importing a spreadsheet. Manages its own
 * drag state and resets the input so the same file can be re-selected.
 */
export function ExcelDropzone({
  onFile,
  label = "Import from Excel (Optional)",
}: ExcelDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
        )}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          Drop Excel file here or click to upload
        </p>
        <Input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          id={inputId}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            // Reset so re-selecting the same file fires onChange again.
            e.target.value = "";
          }}
        />
        <Label
          htmlFor={inputId}
          className="inline-block cursor-pointer rounded-md bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
        >
          Browse Files
        </Label>
      </div>
    </div>
  );
}
