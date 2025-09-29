"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterData, Location } from "@/types/common.types";
import { Activity } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MapComponent from "@/components/MapComponent";

// WHO/EPA/Local guideline thresholds
const PARAMETER_GUIDELINES: Record<
  string,
  {
    residential?: number;
    industrial?: number;
    unit?: string;
    name?: string;
  }
> = {
  ph: {
    residential: 6.5,
    industrial: 8.5,
    unit: "",
    name: "pH",
  },
  temperature: {
    unit: "°C",
    name: "Temperature",
  },
  tds: {
    residential: 500,
    industrial: 2000,
    unit: "mg/L",
    name: "TDS",
  },
  turbidity: {
    residential: 5,
    industrial: 50,
    unit: "NTU",
    name: "Turbidity",
  },
  dissolvedOxygen: {
    residential: 5,
    unit: "mg/L",
    name: "Dissolved Oxygen",
  },
};

// Color palette for locations
const CHART_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#dc2626",
  "#9333ea",
  "#0369a1",
  "#b91c1c",
  "#047857",
  "#92400e",
  "#6b21a8",
];

// Helper functions
const calculateMean = (data: number[]) =>
  data.reduce((a, b) => a + b, 0) / data.length;

const calculateMedian = (data: number[]) => {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateStdDev = (data: number[]) => {
  const mean = calculateMean(data);
  const variance =
    data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
};

interface WaterAIChatAnalysisProps {
  waterData: WaterData[];
}

export default function WaterAIChatAnalysis({
  waterData,
}: WaterAIChatAnalysisProps) {
  const [selectedParameter, setSelectedParameter] =
    useState<keyof WaterData>("ph");
  const [chartType, setChartType] = useState<"monthly" | "daily" | "quarterly">(
    "monthly",
  );
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Extract unique locations from waterData
  const locations = useMemo(() => {
    const uniqueLocations = new Map<string, Location>();
    waterData.forEach((data) => {
      if (data.location && !uniqueLocations.has(data.location.locationId)) {
        uniqueLocations.set(data.location.locationId, data.location);
      }
    });
    return Array.from(uniqueLocations.values());
  }, [waterData]);

  // Group data by location
  const groupedData = useMemo(() => {
    return waterData.reduce(
      (acc, item) => {
        const locationId = item.locationId || "unknown";
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(item);
        return acc;
      },
      {} as { [key: string]: WaterData[] },
    );
  }, [waterData]);

  // Get numeric data for selected parameter
  const numericData = useMemo(() => {
    return waterData
      .map((item) => Number(item[selectedParameter]))
      .filter((v) => !isNaN(v) && v !== null && v !== undefined);
  }, [waterData, selectedParameter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (numericData.length === 0) return null;
    return {
      mean: calculateMean(numericData).toFixed(2),
      median: calculateMedian(numericData).toFixed(2),
      stdDev: calculateStdDev(numericData).toFixed(2),
      min: Math.min(...numericData).toFixed(2),
      max: Math.max(...numericData).toFixed(2),
      count: numericData.length,
    };
  }, [numericData]);

  // Generate time periods based on chart type
  const timePeriods = useMemo(() => {
    if (waterData.length === 0) return [];

    const periodMap = new Map<string, Date>();

    waterData.forEach((item) => {
      const date = new Date(item.measurementTime);
      let periodKey = "";

      switch (chartType) {
        case "monthly":
          periodKey = format(date, "MMM-yy");
          break;
        case "quarterly":
          const quarter = Math.ceil((date.getMonth() + 1) / 3);
          periodKey = `Q${quarter}-${format(date, "yy")}`;
          break;
        case "daily":
          periodKey = format(date, "dd-MMM-yy");
          break;
        default:
          periodKey = format(date, "MMM-yy");
      }
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, date);
      }
    });

    return Array.from(periodMap.entries())
      .sort(([, dateA], [, dateB]) => dateA.getTime() - dateB.getTime())
      .map(([periodKey]) => periodKey);
  }, [waterData, chartType]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (!timePeriods.length) return [];

    return timePeriods.map((period) => {
      const dataPoint: any = {
        period,
        parameter: selectedParameter,
      };

      Object.entries(groupedData).forEach(([locationId, locationData]) => {
        const location = locations.find((loc) => loc.locationId === locationId);
        const locationName = location?.name || `Location ${locationId}`;

        const periodData = locationData.filter((item) => {
          const date = new Date(item.measurementTime);
          let itemPeriod = "";

          switch (chartType) {
            case "monthly":
              itemPeriod = format(date, "MMM-yy");
              break;
            case "quarterly":
              const quarter = Math.ceil((date.getMonth() + 1) / 3);
              itemPeriod = `Q${quarter}-${format(date, "yy")}`;
              break;
            case "daily":
              itemPeriod = format(date, "dd-MMM-yy");
              break;
            default:
              itemPeriod = format(date, "MMM-yy");
          }

          return itemPeriod === period;
        });

        if (periodData.length > 0) {
          const values = periodData
            .map((item) => Number(item[selectedParameter]))
            .filter((v) => !isNaN(v));

          if (values.length > 0) {
            dataPoint[locationName] = calculateMean(values);
          }
        }
      });

      return dataPoint;
    });
  }, [
    waterData,
    timePeriods,
    groupedData,
    locations,
    selectedParameter,
    chartType,
  ]);

  // Parameter options
  const parameterOptions: { value: keyof WaterData; label: string }[] = [
    { value: "ph", label: "pH" },
    { value: "temperature", label: "Temperature (°C)" },
    { value: "tds", label: "TDS (mg/L)" },
    { value: "turbidity", label: "Turbidity (NTU)" },
    { value: "dissolvedOxygen", label: "Dissolved Oxygen (mg/L)" },
  ];

  // Get current parameter guidelines
  const currentGuidelines = PARAMETER_GUIDELINES[selectedParameter as string];

  return (
    <div className="w-full max-w-[70rem] mx-auto">
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Water Quality Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Data analysis and visualization of selected water quality
            measurements
          </p>
        </div>

        {/* Parameter Selection */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm font-medium mb-2">Parameter</label>
            <Select
              value={selectedParameter}
              onValueChange={(value: keyof WaterData) =>
                setSelectedParameter(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parameter" />
              </SelectTrigger>
              <SelectContent>
                {parameterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 max-w-sm">
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select
              value={chartType}
              onValueChange={(value: "monthly" | "daily" | "quarterly") =>
                setChartType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsMapOpen(!isMapOpen)}
        >
          {isMapOpen ? "Hide Map" : "Show Map"}
        </Button>

        {isMapOpen && (
          <div className="mt-4">
            <MapComponent
              locations={locations}
              activeLocationId={locations[0]?.locationId}
            />
          </div>
        )}

        {/* Charts and Statistics */}
        <div className="space-y-8">
          {/* Statistics */}
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Statistics -{" "}
                  {PARAMETER_GUIDELINES[selectedParameter as string]?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mean</p>
                    <p className="text-2xl font-bold">{statistics.mean}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Median</p>
                    <p className="text-2xl font-bold">{statistics.median}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Std Dev</p>
                    <p className="text-2xl font-bold">{statistics.stdDev}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Min</p>
                    <p className="text-2xl font-bold">{statistics.min}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Max</p>
                    <p className="text-2xl font-bold">{statistics.max}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Count</p>
                    <p className="text-2xl font-bold">{statistics.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Time Series Analysis -{" "}
                {PARAMETER_GUIDELINES[selectedParameter as string]?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis
                      label={{
                        value:
                          PARAMETER_GUIDELINES[selectedParameter as string]
                            ?.unit,
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    {locations.map((location, index) => (
                      <Line
                        key={location.locationId}
                        type="monotone"
                        dataKey={location.name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        dot={false}
                      />
                    ))}
                    {currentGuidelines?.residential && (
                      <Line
                        type="monotone"
                        stroke="#888"
                        strokeDasharray="5 5"
                        dot={false}
                        dataKey={() => currentGuidelines.residential}
                        name="Residential Guideline"
                      />
                    )}
                    {currentGuidelines?.industrial && (
                      <Line
                        type="monotone"
                        stroke="#888"
                        strokeDasharray="5 5"
                        dot={false}
                        dataKey={() => currentGuidelines.industrial}
                        name="Industrial Guideline"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
