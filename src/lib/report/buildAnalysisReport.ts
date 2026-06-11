/**
 * Shared report builder for the environmental "AI Chat Analysis" components
 * (Air, Water, Soil, Noise, Biodiversity, Waste). They all share the same
 * trend/comparison chart structure, so the report payload is assembled here
 * once and each component just supplies its domain-specific values.
 */

import { format } from "date-fns";
import { captureChartToPng } from "./svgToPng";
import type { ReportChart, ReportData, ReportMeta } from "./types";

const calculateMean = (data: number[]) =>
  data.reduce((a, b) => a + b, 0) / data.length;

interface MinimalLocation {
  locationId: string;
  name: string;
}

export interface AnalysisReportInput {
  /** Document title, e.g. "Air Quality Analysis Report". */
  title: string;
  subtitle: string;
  /** Base filename (a date suffix is appended automatically). */
  fileBaseName: string;
  /** Data key of the selected parameter (e.g. "pm25"). */
  parameterKey: string;
  /** Human label, usually already including the unit (e.g. "PM2.5 (µg/m³)"). */
  parameterLabel: string;
  chartType: string;
  startDate?: Date;
  endDate?: Date;
  locationTypeLabel: string;
  timeOfDayLabel: string;
  /** Extra domain-specific filter rows (e.g. Water Source). */
  extraMeta?: ReportMeta[];
  displayedLocations: MinimalLocation[];
  timeSeriesData: Record<string, any>[];
  groupedData: Record<string, Record<string, any>[]>;
  filteredCount: number;
  aiText?: string;
  lineChartEl: HTMLElement | null;
  barChartEl: HTMLElement | null;
}

export async function buildAnalysisReport(
  input: AnalysisReportInput,
): Promise<ReportData> {
  const periodLabel =
    input.chartType.charAt(0).toUpperCase() + input.chartType.slice(1);

  // Capture the rendered charts as PNGs (skip any that have no data).
  const charts: ReportChart[] = [];
  const lineImg = await captureChartToPng(input.lineChartEl);
  if (lineImg) {
    charts.push({
      title: `Trend Analysis – ${periodLabel} Averages`,
      imageDataUrl: lineImg.dataUrl,
      width: lineImg.width,
      height: lineImg.height,
    });
  }
  const barImg = await captureChartToPng(input.barChartEl);
  if (barImg) {
    charts.push({
      title: `Location Comparison – ${periodLabel} Averages`,
      imageDataUrl: barImg.dataUrl,
      width: barImg.width,
      height: barImg.height,
    });
  }

  // Trend table: one row per period, one column per location.
  const trendTable = {
    title: `Trend Data (${input.parameterLabel})`,
    headers: ["Period", ...input.displayedLocations.map((l) => l.name)],
    rows: input.timeSeriesData.map((point) => [
      String(point.period),
      ...input.displayedLocations.map((l) => {
        const v = point[l.name];
        return typeof v === "number" ? v.toFixed(2) : "—";
      }),
    ]),
  };

  // Summary statistics per location for the selected parameter.
  const summaryTable = {
    title: `Summary Statistics (${input.parameterLabel})`,
    headers: ["Location", "Mean", "Min", "Max", "Readings"],
    rows: input.displayedLocations.map((location) => {
      const values = (input.groupedData[location.locationId] || [])
        .map((item) => Number(item[input.parameterKey]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) {
        return [location.name, "—", "—", "—", "0"];
      }
      const mean = calculateMean(values);
      return [
        location.name,
        mean.toFixed(2),
        Math.min(...values).toFixed(2),
        Math.max(...values).toFixed(2),
        String(values.length),
      ];
    }),
  };

  const meta: ReportMeta[] = [
    { label: "Parameter", value: input.parameterLabel },
    { label: "Time Period", value: periodLabel },
    {
      label: "Date Range",
      value: `${input.startDate ? format(input.startDate, "dd MMM yyyy") : "Earliest"} – ${
        input.endDate ? format(input.endDate, "dd MMM yyyy") : "Latest"
      }`,
    },
    { label: "Location Type", value: input.locationTypeLabel },
    ...(input.extraMeta || []),
    { label: "Time of Day", value: input.timeOfDayLabel },
    { label: "Locations", value: String(input.displayedLocations.length) },
    { label: "Readings", value: String(input.filteredCount) },
  ];

  return {
    title: input.title,
    subtitle: input.subtitle,
    generatedAt: new Date(),
    meta,
    aiText: input.aiText,
    charts,
    tables: [trendTable, summaryTable],
    fileName: `${input.fileBaseName}-${format(new Date(), "yyyy-MM-dd")}`,
  };
}
