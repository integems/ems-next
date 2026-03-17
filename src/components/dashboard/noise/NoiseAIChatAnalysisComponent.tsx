"use client";

import MapComponent from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Location,
  LocationType,
  NoiseData,
  PaginationResponse,
} from "@/types/common.types";
import { format } from "date-fns";
import {
  Activity,
  BarChart as BarChartIcon,
  ChevronDown,
  ChevronUp,
  LineChart as LineChartIcon,
  MapPin,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
  laeq: { residential: 55, industrial: 70, unit: "dB(A)", name: "LAeq" },
  lafMax: { residential: 65, industrial: 80, unit: "dB(A)", name: "LAFmax" },
  la10: { residential: 60, industrial: 75, unit: "dB(A)", name: "LA10" },
  la90: { residential: 50, industrial: 65, unit: "dB(A)", name: "LA90" },
  lafMin: { unit: "dB(A)", name: "LAFmin" },
  frequency: { unit: "Hz", name: "Frequency" },
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



interface NoiseAIChatAnalysisProps {
  noiseData: PaginationResponse<NoiseData>;
}

export default function NoiseAIChatAnalysis({
  noiseData,
}: NoiseAIChatAnalysisProps) {
  const [selectedParameter, setSelectedParameter] =
    useState<keyof NoiseData>("laeq");
  const [chartType, setChartType] = useState<"monthly" | "daily" | "quarterly" | "biannually" | "yearly">(
    "monthly",
  );
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [locationIdsFilter, setLocationIdsFilter] = useState<string[]>([]);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    new Date(),
  );
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    LocationType | "All" | undefined
  >(undefined);
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<
    "All" | "day" | "evening" | "night"
  >("All");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      if (payload[0].payload.locationName) {
        const unit =
          PARAMETER_GUIDELINES[selectedParameter as string]?.unit || "";
        return (
          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
            <p className="font-medium">{`Location: ${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.fill }}>
                {`${entry.name}: ${Number(entry.value).toFixed(2)} ${unit}`}
              </p>
            ))}
          </div>
        );
      }

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${Number(entry.value).toFixed(2)} ${PARAMETER_GUIDELINES[entry.payload?.parameter]?.unit || ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const filteredNoiseData = useMemo(() => {
    let data = noiseData.data;

    if (searchQuery) {
      data = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }

    if (locationIdsFilter.length > 0) {
      data = data.filter(
        (item) =>
          item.locationId && locationIdsFilter.includes(item.locationId),
      );
    }

    if (startDateFilter) {
      data = data.filter(
        (item) => new Date(item.measurementTime) >= startDateFilter,
      );
    }
    if (endDateFilter) {
      data = data.filter(
        (item) => new Date(item.measurementTime) <= endDateFilter,
      );
    }

    if (locationTypeFilter && locationTypeFilter !== "All") {
      data = data.filter(
        (item) => item.location?.locationType === locationTypeFilter,
      );
    }

    if (timeOfDayFilter && timeOfDayFilter !== "All") {
      data = data.filter((item) => {
        const hour = new Date(item.measurementTime).getHours();
        if (timeOfDayFilter === "day") return hour >= 6 && hour < 18;
        if (timeOfDayFilter === "evening") return hour >= 18 && hour < 22;
        if (timeOfDayFilter === "night") return hour >= 22 || hour < 6;
        return true;
      });
    }

    return data;
  }, [
    noiseData,
    searchQuery,
    locationIdsFilter,
    startDateFilter,
    endDateFilter,
    locationTypeFilter,
    timeOfDayFilter,
  ]);

  const allLocations = useMemo(() => {
    const uniqueLocations = new Map<string, Location>();
    noiseData.data.forEach((data) => {
      if (data.location && !uniqueLocations.has(data.location.locationId)) {
        uniqueLocations.set(data.location.locationId, data.location);
      }
    });
    return Array.from(uniqueLocations.values());
  }, [noiseData]);

  const displayedLocations = useMemo(() => {
    const uniqueLocations = new Map<string, Location>();
    filteredNoiseData.forEach((data) => {
      if (data.location && !uniqueLocations.has(data.location.locationId)) {
        uniqueLocations.set(data.location.locationId, data.location);
      }
    });
    return Array.from(uniqueLocations.values());
  }, [filteredNoiseData]);

  const groupedData = useMemo(() => {
    return filteredNoiseData.reduce(
      (acc, item) => {
        const locationId = item.locationId || "unknown";
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(item);
        return acc;
      },
      {} as { [key: string]: NoiseData[] },
    );
  }, [filteredNoiseData]);



  const timePeriods = useMemo(() => {
    if (filteredNoiseData.length === 0) return [];

    const periodMap = new Map<string, Date>();

    filteredNoiseData.forEach((item) => {
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
        case "biannually":
          const half = date.getMonth() < 6 ? 1 : 2;
          periodKey = `H${half}-${format(date, "yy")}`;
          break;
        case "yearly":
          periodKey = format(date, "yyyy");
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
  }, [filteredNoiseData, chartType]);

  const timeSeriesData = useMemo(() => {
    if (!timePeriods.length) return [];

    return timePeriods.map((period) => {
      const dataPoint: any = {
        period,
        parameter: selectedParameter,
      };

      Object.entries(groupedData).forEach(([locationId, locationData]) => {
        const location = displayedLocations.find(
          (loc) => loc.locationId === locationId,
        );
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
            case "biannually":
              const half = date.getMonth() < 6 ? 1 : 2;
              itemPeriod = `H${half}-${format(date, "yy")}`;
              break;
            case "yearly":
              itemPeriod = format(date, "yyyy");
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
    timePeriods,
    groupedData,
    displayedLocations,
    selectedParameter,
    chartType,
  ]);

  const barChartData = useMemo(() => {
    if (!timePeriods.length || !locationIdsFilter.length) return [];

    const selectedLocations = allLocations.filter((loc) =>
      locationIdsFilter.includes(loc.locationId),
    );

    return selectedLocations.map((location) => {
      const locationData: any = {
        locationName: location.name,
      };

      timePeriods.forEach((period) => {
        const periodData = groupedData[location.locationId]?.filter((item) => {
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
            case "biannually":
              const half = date.getMonth() < 6 ? 1 : 2;
              itemPeriod = `H${half}-${format(date, "yy")}`;
              break;
            case "yearly":
              itemPeriod = format(date, "yyyy");
              break;
            case "daily":
              itemPeriod = format(date, "dd-MMM-yy");
              break;
            default:
              itemPeriod = format(date, "MMM-yy");
          }
          return itemPeriod === period;
        });

        if (periodData && periodData.length > 0) {
          const values = periodData
            .map((item) => Number(item[selectedParameter]))
            .filter((v) => !isNaN(v));
          if (values.length > 0) {
            locationData[period] = calculateMean(values);
          }
        }
      });

      return locationData;
    });
  }, [
    timePeriods,
    groupedData,
    allLocations,
    selectedParameter,
    chartType,
    locationIdsFilter,
  ]);

  const parameterOptions: { value: keyof NoiseData; label: string }[] = [
    { value: "laeq", label: "LAeq (dB(A))" },
    { value: "lafMax", label: "LAFmax (dB(A))" },
    { value: "la10", label: "LA10 (dB(A))" },
    { value: "la90", label: "LA90 (dB(A))" },
    { value: "lafMin", label: "LAFmin (dB(A))" },
    { value: "frequency", label: "Frequency (Hz)" },
  ];

  const currentGuidelines = PARAMETER_GUIDELINES[selectedParameter as string];

  return (
    <div className="w-full max-w-[70rem] mx-auto">
      <div className="py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Noise Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive environmental data insights and trend analysis on
            Noise Levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
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
          <div className="w-full">
            <label
              htmlFor="locationType"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Location Type
            </label>
            <Select
              value={locationTypeFilter || "All"}
              onValueChange={(value) =>
                setLocationTypeFilter(
                  value === "All" ? undefined : (value as LocationType),
                )
              }
            >
              <SelectTrigger
                id="locationType"
                className="bg-background border-border w-full"
              >
                <SelectValue placeholder="Select Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {Object.values(LocationType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <label
              htmlFor="timePeriod"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Time Period
            </label>
            <Select
              value={chartType}
              onValueChange={(value: "monthly" | "daily" | "quarterly" | "biannually" | "yearly") =>
                setChartType(value)
              }
            >
              <SelectTrigger
                id="timePeriod"
                className="bg-background border-border w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="biannually">Biannually</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <label
              htmlFor="timeOfDay"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Time of Day
            </label>
            <Select
              value={timeOfDayFilter}
              onValueChange={(value) =>
                setTimeOfDayFilter(value as "All" | "day" | "evening" | "night")
              }
            >
              <SelectTrigger
                id="timeOfDay"
                className="bg-background border-border w-full"
              >
                <SelectValue placeholder="Select Time of Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Day</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
          <div className="max-w-sm">
            <label
              htmlFor="search"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Search noise data..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border w-full border-border rounded-md bg-background text-foreground focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Filter by Location
            </label>
            <Select
              onValueChange={(value) => {
                if (value && !locationIdsFilter.includes(value)) {
                  setLocationIdsFilter([...locationIdsFilter, value]);
                }
              }}
            >
              <SelectTrigger className="bg-background border-border w-full">
                <SelectValue placeholder="Add location" />
              </SelectTrigger>
              <SelectContent>
                {allLocations
                  .filter((loc) => !locationIdsFilter.includes(loc.locationId))
                  .map((loc) => (
                    <SelectItem key={loc.locationId} value={loc.locationId}>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span>{loc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({loc.locationType})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {locationIdsFilter.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {locationIdsFilter.map((locationId, index) => {
              const location = allLocations.find(
                (loc) => loc.locationId === locationId,
              );
              return (
                <div
                  key={locationId}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20`,
                    borderColor: CHART_COLORS[index % CHART_COLORS.length],
                    borderWidth: "1px",
                  }}
                >
                  <span>{location ? location.name : "Unknown"}</span>
                  <button
                    onClick={() =>
                      setLocationIdsFilter(
                        locationIdsFilter.filter((id) => id !== locationId),
                      )
                    }
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocationIdsFilter([])}
              className="h-6"
            >
              Clear All
            </Button>
          </div>
        )}

        <Collapsible open={isMapOpen} onOpenChange={setIsMapOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-between w-full"
            >
              <span>{isMapOpen ? "Hide Map" : "Show Map"}</span>
              {isMapOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <MapComponent
              locations={displayedLocations}
              activeLocationIds={locationIdsFilter}
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-8">
          <div className="w-full ">
            <label className="block text-sm font-medium mb-2">
              Parameter Selection
            </label>
            <Select
              value={selectedParameter}
              onValueChange={(value) =>
                setSelectedParameter(value as keyof NoiseData)
              }
            >
              <SelectTrigger className="bg-background border-border max-w-sm">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-6 w-6 text-blue-600" />
                Trend Analysis -{" "}
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{" "}
                Averages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      label={{
                        value: currentGuidelines?.unit || "",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {displayedLocations.map((location, index) => (
                      <Line
                        key={location.locationId}
                        type="monotone"
                        dataKey={location.name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    ))}

                    {currentGuidelines?.residential && (
                      <ReferenceLine
                        y={currentGuidelines.residential}
                        label={{
                          value: "Residential Limit",
                          position: "insideTopRight",
                        }}
                        stroke="#22c55e"
                        strokeDasharray="8 8"
                        strokeWidth={2}
                      />
                    )}
                    {currentGuidelines?.industrial && (
                      <ReferenceLine
                        y={currentGuidelines.industrial}
                        label={{
                          value: "Industrial Limit",
                          position: "insideTopRight",
                        }}
                        stroke="#ef4444"
                        strokeDasharray="8 8"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartIcon className="h-6 w-6 text-green-600" />
                Location Comparison -{" "}
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{" "}
                Averages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={barChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    <XAxis
                      dataKey="locationName"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      label={{
                        value: currentGuidelines?.unit || "",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {timePeriods.map((period, index) => (
                      <Bar
                        key={period}
                        dataKey={period}
                        name={period}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        opacity={0.8}
                      />
                    ))}

                    {currentGuidelines?.residential && (
                      <ReferenceLine
                        y={currentGuidelines.residential}
                        label={{
                          value: "Residential Limit",
                          position: "insideTopRight",
                        }}
                        stroke="#22c55e"
                        strokeDasharray="8 8"
                        strokeWidth={2}
                      />
                    )}
                    {currentGuidelines?.industrial && (
                      <ReferenceLine
                        y={currentGuidelines.industrial}
                        label={{
                          value: "Industrial Limit",
                          position: "insideTopRight",
                        }}
                        stroke="#ef4444"
                        strokeDasharray="8 8"
                        strokeWidth={2}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available for the selected filters
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
