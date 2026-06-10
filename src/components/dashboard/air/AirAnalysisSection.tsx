import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { AirDataFilterDto } from "@/dtos/air.dto";
import { FrontendAirService } from "@/frontend-services/air.service";
import { useAuth } from "@/hooks/use-auth";
import { AirData } from "@/types/common.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, LoaderIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const airService = new FrontendAirService();

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
];

interface AirAnalysisSectionProps {
  locationId: string | undefined;
}

export default function AirAnalysisSection({
  locationId,
}: AirAnalysisSectionProps) {
  const { currentUser } = useAuth();
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );

  const parameterOptions: { value: keyof AirData; label: string }[] = [
    { value: "pm25", label: "PM2.5 (µg/m³)" },
    { value: "pm10", label: "PM10 (µg/m³)" },
    { value: "no2", label: "NO₂ (µg/m³)" },
    { value: "o3", label: "O₃ (µg/m³)" },
    { value: "co", label: "CO (µg/m³)" },
    { value: "so2", label: "SO₂ (µg/m³)" },
    { value: "temperature", label: "Temperature (°C)" },
    { value: "humidity", label: "Humidity (%)" },
  ];

  const [selectedParameters, setSelectedParameters] = useState<
    (keyof AirData)[]
  >(["pm25", "pm10", "no2"]);

  const toggleParameter = (param: keyof AirData) => {
    setSelectedParameters((prev) =>
      prev.includes(param)
        ? prev.filter((p) => p !== param)
        : [...prev, param],
    );
  };

  const {
    data: airData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["air-data-section", locationId, startDateFilter, endDateFilter],
    queryFn: async () => {
      const filters: AirDataFilterDto = {
        page: 1,
        limit: 1000,
        locationIds: locationId ? [locationId] : undefined,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };
      const response = await airService.findAllAirData(
        currentUser.token || "",
        filters,
      );
      return response.data;
    },
    enabled: !!locationId,
  });

  const latestValues = useMemo(() => {
    if (!airData || airData.length === 0) return null;
    const latest = airData[airData.length - 1];
    return parameterOptions.map((opt) => ({
      label: opt.label,
      value: latest[opt.value],
    }));
  }, [airData]);

  const chartData = useMemo(() => {
    if (!airData) return [];
    return [...airData]
      .sort((a, b) => new Date(a.measurementTime).getTime() - new Date(b.measurementTime).getTime())
      .map((i) => ({
        ...i,
        measurementTime: format(new Date(i.measurementTime), "MMM yyyy"),
      }));
  }, [airData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="h-6 w-6 text-primary" />
          Air Quality Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            value={startDateFilter}
            onChange={setStartDateFilter}
            label="Start Date"
          />
          <DatePicker
            value={endDateFilter}
            onChange={setEndDateFilter}
            label="End Date"
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          {parameterOptions.map((option, idx) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <Checkbox
                checked={selectedParameters.includes(option.value)}
                onCheckedChange={() => toggleParameter(option.value)}
              />
              <span
                className="flex items-center gap-1"
                style={{
                  color: selectedParameters.includes(option.value)
                    ? CHART_COLORS[idx % CHART_COLORS.length]
                    : undefined,
                }}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>Couldn't connect. Try again</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-2 border-border text-foreground hover:bg-accent"
            >
              Retry
            </Button>
          </div>
        ) : !airData || airData.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No data available for the selected criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {latestValues && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {latestValues.map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-3 bg-muted/50 rounded-xl"
                  >
                    <p className="text-lg font-bold text-primary">
                      {item.value != null ? String(item.value) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <ResponsiveContainer width="100%" height={350}>
              <RechartsLineChart data={chartData} margin={{ bottom: 60 }}>
                <XAxis dataKey="measurementTime" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedParameters.map((param, idx) => (
                  <Line
                    key={param}
                    type="monotone"
                    dataKey={param}
                    name={
                      parameterOptions.find((p) => p.value === param)?.label
                    }
                    stroke={CHART_COLORS[parameterOptions.findIndex((p) => p.value === param) % CHART_COLORS.length]}
                    activeDot={{ r: 6 }}
                    dot={false}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
