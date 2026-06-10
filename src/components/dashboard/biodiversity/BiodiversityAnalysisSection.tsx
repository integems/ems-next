import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { BiodiversityDataFilterDto } from "@/dtos/biodiversity.dto";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { useAuth } from "@/hooks/use-auth";
import { BiodiversityData } from "@/types/common.types";
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

const biodiversityService = new FrontendBiodiversityService();

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
];

interface BiodiversityAnalysisSectionProps {
  locationId: string | undefined;
}

export default function BiodiversityAnalysisSection({
  locationId,
}: BiodiversityAnalysisSectionProps) {
  const { currentUser } = useAuth();
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );

  const parameterOptions: {
    value: keyof BiodiversityData;
    label: string;
  }[] = [
    { value: "speciesCount", label: "Species Count" },
    { value: "shannonIndex", label: "Shannon Index" },
  ];

  const [selectedParameters, setSelectedParameters] = useState<
    (keyof BiodiversityData)[]
  >(["speciesCount", "shannonIndex"]);

  const toggleParameter = (param: keyof BiodiversityData) => {
    setSelectedParameters((prev) =>
      prev.includes(param)
        ? prev.filter((p) => p !== param)
        : [...prev, param],
    );
  };

  const {
    data: biodiversityData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "biodiversity-data-section",
      locationId,
      startDateFilter,
      endDateFilter,
    ],
    queryFn: async () => {
      const filters: BiodiversityDataFilterDto = {
        page: 1,
        limit: 1000,
        locationIds: locationId ? [locationId] : undefined,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };
      const response = await biodiversityService.findAllBiodiversityData(
        currentUser.token || "",
        filters,
      );
      return response.data;
    },
    enabled: !!locationId,
  });

  const latestValues = useMemo(() => {
    if (!biodiversityData || biodiversityData.length === 0) return null;
    const latest = biodiversityData[biodiversityData.length - 1];
    return parameterOptions.map((opt) => ({
      label: opt.label,
      value: latest[opt.value],
    }));
  }, [biodiversityData]);

  const chartData = useMemo(() => {
    if (!biodiversityData) return [];
    return [...biodiversityData]
      .sort((a, b) => new Date(a.measurementTime).getTime() - new Date(b.measurementTime).getTime())
      .map((i) => ({
        ...i,
        measurementTime: format(new Date(i.measurementTime), "MMM yyyy"),
      }));
  }, [biodiversityData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="h-6 w-6 text-primary" />
          Biodiversity Analysis
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
        ) : !biodiversityData || biodiversityData.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No data available for the selected criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {latestValues && (
              <div className="grid grid-cols-2 gap-3">
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
