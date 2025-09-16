"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoiseData, Location, LocationType } from "@/types/common.types";
import { NoiseDataFilterDto } from "@/dtos/noise.dto";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  LoaderIcon,
  MapPin,
  LineChart,
  BarChart,
  TrendingUp,
  Activity,
  RefreshCcw,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MapComponent from "@/components/MapComponent";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";

// Services
const noiseService = new FrontendNoiseService();
const locationService = new FrontendLocationService();

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
  "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", 
  "#db2777", "#0891b2", "#65a30d", "#dc2626", "#9333ea",
  "#0369a1", "#b91c1c", "#047857", "#92400e", "#6b21a8"
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



export default function NoiseAnalysisPage() {
  const { currentUser } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [locationIdsFilter, setLocationIdsFilter] = useState<string[]>([]);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    new Date()
  );
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    "industrial" | "residential" | "commercial" | "rural" | "All" | undefined
  >(undefined);
  const [selectedParameter, setSelectedParameter] =
    useState<keyof NoiseData>("laeq");
  const [chartType, setChartType] = useState<"monthly" | "daily" | "quarterly">("monthly");

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Bar chart tooltip
      if (payload[0].payload.locationName) {
          const unit = PARAMETER_GUIDELINES[selectedParameter as string]?.unit || '';
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
              {`${entry.dataKey}: ${Number(entry.value).toFixed(2)} ${PARAMETER_GUIDELINES[entry.payload?.parameter]?.unit || ''}`}
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
        { page: 1, limit: 1000000000 }
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  // Fetch noise data with filters
  const {
    data: noiseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "noise-data-analysis",
      activeSearchQuery,
      locationIdsFilter,
      startDateFilter,
      endDateFilter,
      locationTypeFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const filters: NoiseDataFilterDto = {
        search: activeSearchQuery,
        locationIds: locationIdsFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        locationType:
          locationTypeFilter === "All"
            ? undefined
            : (locationTypeFilter as LocationType),
      };

      console.log({filters})
      const response = await noiseService.findAllNoiseData(
        currentUser.token,
        filters
      );
      return response.data;
    },
    enabled: !!currentUser?.token && locationIdsFilter.length > 0,
  });

  const handleApplyFilters = () => {
    setActiveSearchQuery(searchQuery || "");
    refetch();
  };

  console.log({noiseData})

  // const noiseData = useMemo(() => {
  //   if (!noiseData) return [];
  //   if (locationIdsFilter.length > 0) {
  //     return noiseData.filter(item => item.locationId && locationIdsFilter.includes(item.locationId));
  //   }
  //   return noiseData;
  // }, [noiseData, locationIdsFilter]);

  // Group data by location
  const groupedData = useMemo(() => {
    if (!noiseData) return {};
    return noiseData.reduce(
      (acc, item) => {
        const locationId = item.locationId || "unknown";
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(item);
        return acc;
      },
      {} as { [key: string]: NoiseData[] }
    );
  }, [noiseData]);

  // Get numeric data for selected parameter
  const numericData = useMemo(() => {
    if (!noiseData) return [];
    return noiseData
      .map((item) => Number(item[selectedParameter]))
      .filter((v) => !isNaN(v) && v !== null && v !== undefined);
  }, [noiseData, selectedParameter]);

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
    if (!noiseData || noiseData.length === 0) return [];
  
    const periodMap = new Map<string, Date>();
  
    noiseData.forEach((item) => {
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
  
    const sortedPeriods = Array.from(periodMap.entries())
      .sort(([, dateA], [, dateB]) => dateA.getTime() - dateB.getTime())
      .map(([periodKey]) => periodKey);
  
    return sortedPeriods;
  }, [noiseData, chartType]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (!noiseData || !timePeriods.length) return [];
    
    return timePeriods.map((period) => {
      const dataPoint: any = { 
        period,
        parameter: selectedParameter 
      };
      
      Object.entries(groupedData).forEach(([locationId, locationData]) => {
        const location = locations.find(loc => loc.locationId === locationId);
        const locationName = location?.name || `Location ${locationId}`;
        
        const periodData = locationData.filter(item => {
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
            .map(item => Number(item[selectedParameter]))
            .filter(v => !isNaN(v));
          
          if (values.length > 0) {
            dataPoint[locationName] = calculateMean(values);
          }
        }
      });
      
      return dataPoint;
    });
  }, [noiseData, timePeriods, groupedData, locations, selectedParameter, chartType]);

  // Prepare data for bar chart
  const barChartData = useMemo(() => {
    if (!noiseData || !timePeriods.length || !locationIdsFilter.length) return [];

    const selectedLocations = locations.filter(loc => locationIdsFilter.includes(loc.locationId));

    return selectedLocations.map(location => {
      const locationData: any = {
        locationName: location.name,
      };

      timePeriods.forEach(period => {
        const periodData = groupedData[location.locationId]?.filter(item => {
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

        if (periodData && periodData.length > 0) {
          const values = periodData
            .map(item => Number(item[selectedParameter]))
            .filter(v => !isNaN(v));
          if (values.length > 0) {
            locationData[period] = calculateMean(values);
          }
        }
      });

      return locationData;
    });
  }, [noiseData, timePeriods, groupedData, locations, selectedParameter, chartType, locationIdsFilter]);

  // Parameter options
  const parameterOptions: { value: keyof NoiseData; label: string }[] = [
    { value: "laeq", label: "LAeq (dB(A))" },
    { value: "lafMax", label: "LAFmax (dB(A))" },
    { value: "la10", label: "LA10 (dB(A))" },
    { value: "la90", label: "LA90 (dB(A))" },
    { value: "lafMin", label: "LAFmin (dB(A))" },
    { value: "frequency", label: "Frequency (Hz)" },
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
            Noise Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive environmental data insights and trend analysis on Noise Levels
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <DatePicker value={startDateFilter} onChange={setStartDateFilter} label="Start Date" />
          <DatePicker value={endDateFilter} onChange={setEndDateFilter} label="End Date" />

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Location Type</label>
            <Select
              value={locationTypeFilter || "All"}
              onValueChange={(value) =>
                setLocationTypeFilter(
                  value === "All"
                    ? undefined
                    : (value as "industrial" | "residential" | "commercial" | "rural")
                )
              }
            >
              <SelectTrigger className="bg-background border-border">
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

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Time Period</label>
            <Select
              value={chartType}
              onValueChange={(value: "monthly" | "daily" | "quarterly") => setChartType(value)}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Apply */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3"
              />
            </div>
          </div>
          
          <Button onClick={handleApplyFilters} disabled={isLoading} className="self-end">
            {isLoading ? (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Apply Filters
          </Button>
        </div>

        {/* Location Filter */}
        <div className="space-y-4">
          <div className="max-w-sm">
            <label className="block text-sm font-medium mb-2">Filter by Location</label>
            <Select
              onValueChange={(value) => {
                if (value && !locationIdsFilter.includes(value)) {
                  setLocationIdsFilter([...locationIdsFilter, value]);
                }
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Add location" />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter(loc => !locationIdsFilter.includes(loc.locationId))
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
          
          {/* Selected locations */}
          {locationIdsFilter.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {locationIdsFilter.map((locationId, index) => {
                const location = locations.find((loc) => loc.locationId === locationId);
                return (
                  <div
                    key={locationId}
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20`,
                      borderColor: CHART_COLORS[index % CHART_COLORS.length],
                      borderWidth: '1px'
                    }}
                  >
                    <span>{location ? location.name : "Unknown"}</span>
                    <button
                      onClick={() =>
                        setLocationIdsFilter(locationIdsFilter.filter((id) => id !== locationId))
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
        </div>

        {/* Map Toggle */}
        <Collapsible open={isMapOpen} onOpenChange={setIsMapOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center justify-between w-full">
              <span>{isMapOpen ? "Hide Map" : "Show Map"}</span>
              {isMapOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <MapComponent
              locations={locations}
              activeLocationId={locationIdsFilter.length > 0 ? locationIdsFilter[0] : undefined}
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
            <p className="text-red-600">Failed to load data. Please try again.</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Parameter Selection */}
            <div className="w-full ">
               <label className="block text-sm font-medium mb-2">Paramter Selection</label>
                <Select
                  value={selectedParameter}
                  onValueChange={(value) => setSelectedParameter(value as keyof NoiseData)}
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

            {/* Statistics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Statistical Summary - {parameterOptions.find((p) => p.value === selectedParameter)?.label}
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
                      <p className="text-2xl font-bold text-green-600">{statistics.mean}</p>
                      <p className="text-sm">Mean</p>
                    </div>
                    <div className="text-center p-4 bg-blue-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{statistics.median}</p>
                      <p className="text-sm">Median</p>
                    </div>
                    <div className="text-center p-4 bg-purple-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">{statistics.stdDev}</p>
                      <p className="text-sm">Std Dev</p>
                    </div>
                    <div className="text-center p-4 bg-orange-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-orange-600">{statistics.min}</p>
                      <p className="text-sm">Minimum</p>
                    </div>
                    <div className="text-center p-4 bg-red-600/10 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">{statistics.max}</p>
                      <p className="text-sm">Maximum</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">No data available for analysis</p>
                )}
              </CardContent>
            </Card>

            {/* Trend Analysis Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-6 w-6 text-blue-600" />
                  Trend Analysis - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Averages
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
                          value: currentGuidelines?.unit || '', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {Object.entries(groupedData).map(([locationId, data], index) => {
                        const location = locations.find(loc => loc.locationId === locationId);
                        const locationName = location?.name || `Location ${index + 1}`;
                        const color = CHART_COLORS[index % CHART_COLORS.length];
                        
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
                      })}
                      
                      {/* Reference Lines for Guidelines */}
                      {currentGuidelines?.residential && (
                        <ReferenceLine
                          y={currentGuidelines.residential}
                          label={{ value: "Residential Limit", position:"insideTopRight" }}
                          stroke="#22c55e"
                          strokeDasharray="8 8"
                          strokeWidth={2}
                        />
                      )}
                      {currentGuidelines?.industrial && (
                        <ReferenceLine
                          y={currentGuidelines.industrial}
                          label={{ value: "Industrial Limit", position:"insideTopRight" }}
                          stroke="#ef4444"
                          strokeDasharray="8 8"
                          strokeWidth={2}
                        />
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
                  Location Comparison - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Averages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsBarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
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
                          value: currentGuidelines?.unit || '',
                          angle: -90,
                          position: 'insideLeft'
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

                      {/* Reference Lines */}
                      {currentGuidelines?.residential && (
                        <ReferenceLine
                          y={currentGuidelines.residential}
                          label={{ value: "Residential Limit", position:"insideTopRight" }}
                          stroke="#22c55e"
                          strokeDasharray="8 8"
                          strokeWidth={2}
                        />
                      )}
                      {currentGuidelines?.industrial && (
                        <ReferenceLine
                          y={currentGuidelines.industrial}
                          label={{ value: "Industrial Limit", position:"insideTopRight" }}
                          stroke="#ef4444"
                          strokeDasharray="8 8"
                          strokeWidth={2}
                        />
                      )}
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