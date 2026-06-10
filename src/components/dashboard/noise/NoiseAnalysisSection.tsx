import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { NoiseDataFilterDto } from "@/dtos/noise.dto";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { useAuth } from "@/hooks/use-auth";
import { NoiseData } from "@/types/common.types";
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

const noiseService = new FrontendNoiseService();

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00C49F",
];

interface NoiseAnalysisSectionProps {
  locationId: string | undefined;
}

export default function NoiseAnalysisSection({
  locationId,
}: NoiseAnalysisSectionProps) {
  const { currentUser } = useAuth();
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );

  const parameterOptions: { value: keyof NoiseData; label: string }[] = [
    { value: "laeq", label: "LAeq (dB)" },
    { value: "lafMax", label: "LAFMax (dB)" },
    { value: "frequency", label: "Frequency (Hz)" },
    { value: "la10", label: "LA10 (dB)" },
    { value: "la90", label: "LA90 (dB)" },
    { value: "lafMin", label: "LAFMin (dB)" },
  ];

  const [selectedParameters, setSelectedParameters] = useState<
    (keyof NoiseData)[]
  >(["laeq", "lafMax", "frequency"]);

  const toggleParameter = (param: keyof NoiseData) => {
    setSelectedParameters((prev) =>
      prev.includes(param)
        ? prev.filter((p) => p !== param)
        : [...prev, param],
    );
  };

  const {
    data: noiseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "noise-data-section",
      locationId,
      startDateFilter,
      endDateFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      const filters: NoiseDataFilterDto = {
        page: 1,
        limit: 1000,
        locationIds: locationId ? [locationId] : undefined,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };
      const response = await noiseService.findAllNoiseData(
        currentUser.token || "",
        filters,
      );
      return response.data;
    },
    enabled: !!locationId,
  });

  const latestValues = useMemo(() => {
    if (!noiseData || noiseData.length === 0) return null;
    const latest = noiseData[noiseData.length - 1];
    return parameterOptions.map((opt) => ({
      label: opt.label,
      value: latest[opt.value],
    }));
  }, [noiseData]);

  const chartData = useMemo(() => {
    if (!noiseData) return [];
    return [...noiseData]
      .sort((a, b) => new Date(a.measurementTime).getTime() - new Date(b.measurementTime).getTime())
      .map((i) => ({
        ...i,
        measurementTime: format(new Date(i.measurementTime), "MMM yyyy"),
      }));
  }, [noiseData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="h-6 w-6 text-primary" />
          Noise Analysis
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
        ) : !noiseData || noiseData.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No data available for the selected criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {latestValues && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                {selectedParameters.map((param) => (
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
