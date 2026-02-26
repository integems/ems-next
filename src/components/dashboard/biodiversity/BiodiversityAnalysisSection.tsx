import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BiodiversityDataFilterDto } from "@/dtos/biodiversity.dto";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { useAuth } from "@/hooks/use-auth";
import { BiodiversityData } from "@/types/common.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, LoaderIcon, TrendingUp } from "lucide-react";
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
  const [selectedParameter, setSelectedParameter] =
    useState<keyof BiodiversityData>("speciesCount");

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

  const numericData = useMemo(() => {
    if (!biodiversityData) return [];
    return biodiversityData
      .map((item) => Number(item[selectedParameter]))
      .filter((v) => !isNaN(v) && v !== null && v !== undefined);
  }, [biodiversityData, selectedParameter]);

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

  const parameterOptions: { value: keyof BiodiversityData; label: string }[] = [
    { value: "speciesCount", label: "Species Count" },
    { value: "shannonIndex", label: "Shannon Index" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="h-6 w-6 text-primary" />
          Biodiversity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 align-middle">
          <DateTimePicker
            value={startDateFilter}
            onChange={setStartDateFilter}
            label="Start Date"
          />
          <DateTimePicker
            value={endDateFilter}
            onChange={setEndDateFilter}
            label="End Date"
          />
          <Select
            value={selectedParameter}
            onValueChange={(value) =>
              setSelectedParameter(value as keyof BiodiversityData)
            }
          >
            <SelectTrigger className="bg-background  text-primary border-primary">
              <SelectValue placeholder="Select Parameter" />
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
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Statistical Summary -{" "}
                  {
                    parameterOptions.find((p) => p.value === selectedParameter)
                      ?.label
                  }
                  {statistics && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({statistics.count} data points)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="text-center p-4 bg-green-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">
                        {statistics.mean}
                      </p>
                      <p className="text-sm">Mean</p>
                    </div>
                    <div className="text-center p-4 bg-blue-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">
                        {statistics.median}
                      </p>
                      <p className="text-sm">Median</p>
                    </div>
                    <div className="text-center p-4 bg-purple-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">
                        {statistics.stdDev}
                      </p>
                      <p className="text-sm">Std Dev</p>
                    </div>
                    <div className="text-center p-4 bg-orange-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-orange-600">
                        {statistics.min}
                      </p>
                      <p className="text-sm">Minimum</p>
                    </div>
                    <div className="text-center p-4 bg-red-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">
                        {statistics.max}
                      </p>
                      <p className="text-sm">Maximum</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">
                    No data available for analysis
                  </p>
                )}
              </CardContent>
            </Card>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart
                data={biodiversityData.map((i) => ({
                  ...i,
                  measurementTime: format(
                    new Date(i.measurementTime),
                    "yyyy-MM-dd HH:mm",
                  ),
                }))}
              >
                <XAxis dataKey="measurementTime" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedParameter}
                  name={
                    parameterOptions.find((p) => p.value === selectedParameter)
                      ?.label
                  }
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
