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
import { BiodiversityDataFilterDto } from "@/dtos/biodiversity.dto";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  BiodiversityData,
  Location,
  LocationType,
  TimeOfDay,
} from "@/types/common.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  BarChart,
  ChevronDown,
  ChevronUp,
  LineChart,
  LoaderIcon,
  MapPin,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  Legend,
  Line,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Services
const biodiversityService = new FrontendBiodiversityService();
const locationService = new FrontendLocationService();

// WHO/EPA/Local guideline thresholds
const PARAMETER_GUIDELINES: Record<
  string,
  {
    unit?: string;
    name?: string;
  }
> = {
  speciesCount: {
    unit: "count",
    name: "Species Count",
  },
  shannonIndex: {
    unit: "index",
    name: "Shannon Index",
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

export default function BiodiversityAnalysisPage() {
  const { currentUser } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [locationIdsFilter, setLocationIdsFilter] = useState<string[]>([]);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    new Date(),
  );
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    "industrial" | "residential" | "commercial" | "rural" | "All" | undefined
  >(undefined);
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<
    "All" | "day" | "evening" | "night"
  >("All");
  const [selectedParameter, setSelectedParameter] =
    useState<keyof BiodiversityData>("speciesCount");
  const [chartType, setChartType] = useState<"monthly" | "daily" | "quarterly" | "biannually" | "yearly">(
    "monthly",
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Bar chart tooltip
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

      // Line chart tooltip
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

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ["locations", currentUser?.token],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const response = await locationService.findAllLocations(
        currentUser.token,
        { page: 1, limit: 1000000000 },
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  // Fetch biodiversity data with filters
  const {
    data: biodiversityData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "biodiversity-data-analysis",
      activeSearchQuery,
      locationIdsFilter,
      startDateFilter,
      endDateFilter,
      locationTypeFilter,
      timeOfDayFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const filters: BiodiversityDataFilterDto = {
        search: activeSearchQuery,
        locationIds: locationIdsFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        locationType:
          locationTypeFilter === "All"
            ? undefined
            : (locationTypeFilter as LocationType),
        timeOfDay:
          timeOfDayFilter === "All"
            ? undefined
            : (timeOfDayFilter as TimeOfDay),
      };
      const response = await biodiversityService.findAllBiodiversityData(
        currentUser.token,
        filters,
      );
      return response.data;
    },
    enabled: !!currentUser?.token && locationIdsFilter.length > 0,
  });

  const handleApplyFilters = () => {
    setActiveSearchQuery(searchQuery || "");
    refetch();
  };

  // const biodiversityData = useMemo(() => {
  //   if (!biodiversityData) return [];
  //   if (locationIdsFilter.length > 0) {
  //     return biodiversityData.filter(item => item.locationId && locationIdsFilter.includes(item.locationId));
  //   }
  //   return biodiversityData;
  // }, [biodiversityData, locationIdsFilter]);

  // Group data by location
  const groupedData = useMemo(() => {
    if (!biodiversityData) return {};
    return biodiversityData.reduce(
      (acc, item) => {
        const locationId = item.locationId || "unknown";
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(item);
        return acc;
      },
      {} as { [key: string]: BiodiversityData[] },
    );
  }, [biodiversityData]);


  // Generate time periods based on chart type
  const timePeriods = useMemo(() => {
    if (!biodiversityData || biodiversityData.length === 0) return [];

    const periodMap = new Map<string, Date>();

    biodiversityData.forEach((item) => {
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

    const sortedPeriods = Array.from(periodMap.entries())
      .sort(([, dateA], [, dateB]) => dateA.getTime() - dateB.getTime())
      .map(([periodKey]) => periodKey);

    return sortedPeriods;
  }, [biodiversityData, chartType]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (!biodiversityData || !timePeriods.length) return [];

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
    biodiversityData,
    timePeriods,
    groupedData,
    locations,
    selectedParameter,
    chartType,
  ]);

  // Prepare data for bar chart
  const barChartData = useMemo(() => {
    if (!biodiversityData || !timePeriods.length || !locationIdsFilter.length)
      return [];

    const selectedLocations = locations.filter((loc) =>
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
    biodiversityData,
    timePeriods,
    groupedData,
    locations,
    selectedParameter,
    chartType,
    locationIdsFilter,
  ]);

  // Parameter options
  const parameterOptions: { value: keyof BiodiversityData; label: string }[] = [
    { value: "speciesCount", label: "Species Count" },
    { value: "shannonIndex", label: "Shannon Index" },
  ];

  // Get current parameter guidelines
  const currentGuidelines = PARAMETER_GUIDELINES[selectedParameter as string];

  return (
    <div className="w-full">
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Biodiversity Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive environmental data insights and trend analysis on
            Biodiversity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 items-end">
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
                  value === "All"
                    ? undefined
                    : (value as
                        | "industrial"
                        | "residential"
                        | "commercial"
                        | "rural"),
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
          <div className="w-full">
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
                placeholder="Search biodiversity data..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border w-full border-border rounded-md bg-background text-foreground focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="w-full">
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
                {locations
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
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
          >
            {isLoading ? (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>
        {locationIdsFilter.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {locationIdsFilter.map((locationId, index) => {
              const location = locations.find(
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

        {/* Map Toggle */}
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
              locations={locations}
              activeLocationIds={locationIdsFilter}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Loading / Error / Charts */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-4">
            <p className="text-red-600">
              Failed to load data. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Parameter Selection */}
            <div className="w-full ">
              <label className="block text-sm font-medium mb-2">
                Paramter Selection
              </label>
              <Select
                value={selectedParameter}
                onValueChange={(value) =>
                  setSelectedParameter(value as keyof BiodiversityData)
                }
              >
                <SelectTrigger className="bg-background border-border w-full">
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



            {/* Trend Analysis Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-blue-600" />
                  Trend Analysis -{" "}
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{" "}
                  Averages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeSeriesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart data={timeSeriesData}>
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

                      {Object.entries(groupedData).map(
                        ([locationId, data], index) => {
                          const location = locations.find(
                            (loc) => loc.locationId === locationId,
                          );
                          const locationName =
                            location?.name || `Location ${index + 1}`;
                          const color =
                            CHART_COLORS[index % CHART_COLORS.length];

                          return (
                            <Line
                              key={locationId}
                              type="monotone"
                              dataKey={locationName}
                              stroke={color}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              connectNulls={false}
                            />
                          );
                        },
                      )}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-6 w-6 text-green-600" />
                  Location Comparison -{" "}
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{" "}
                  Averages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart
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
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
