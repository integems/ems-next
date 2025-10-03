import React from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { FileText, Sheet } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps<T, F> {
  service: any; // This will be the frontend service (e.g., FrontendAirService)
  filters: F; // The current filters applied to the data
  fileName: string; // The base name for the exported file
  token: string; // User authentication token
  columns: { header: string; accessor: keyof T }[]; // Columns for the spreadsheet
}

export function ExportButton<T, F>({
  service,
  filters,
  fileName,
  token,
  columns,
}: ExportButtonProps<T, F>) {
  const handleExport = async () => {
    try {
      toast.info(`Exporting ${fileName} data... This may take a moment.`);

      // Fetch all data with a large limit
      const response = await service.findAll(token, {
        ...filters,
        limit: 1000000,
        page: 1,
      });
      const dataToExport: T[] = response.data;

      // console.table(dataToExport[0]);

      if (!dataToExport || dataToExport.length === 0) {
        toast.warning(
          `No ${fileName} data found to export with the current filters.`,
        );
        return;
      }

      // Prepare data for export
      const ws_data = [
        columns.map((col) => col.header), // Headers
        ...dataToExport.map((row: any) =>
          columns.map((col) =>
            col.accessor === "location"
              ? row?.["location"]?.name
              : col.accessor === "role"
                ? row?.["userRole"]?.role?.roleName
                : (row[col.accessor] ?? "N/A"),
          ),
        ), // Data rows
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, fileName);

      XLSX.writeFile(
        wb,
        `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success(`${fileName} data exported successfully!`);
    } catch (error: any) {
      // console.error("Export failed:", error);
      toast.error(`Couldn't export`);
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="text-green-400">
      <Sheet className="h-4 w-4 text-green-400" />
      Export to Excel
    </Button>
  );
}
