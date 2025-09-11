"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import {
  AirData,
  Location,
  TimeOfDay,
  LocationType,
} from "@/types/common.types";
import { AirDataFilterDto } from "@/dtos/air.dto";
import { FrontendAirService } from "@/frontend-services/air.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  LoaderIcon,
  MapPin,
  LineChart,
  BarChart,
  ScatterChart as ScatterChartIcon,
  TrendingUp,
  Activity,
  Filter,
  RefreshCcw,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MapComponent from "@/components/MapComponent";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const airService = new FrontendAirService();
const locationService = new FrontendLocationService();

// Helper functions for statistics
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

export default function AirAnalysisPage() {
  const { currentUser } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [locationIdFilter, setLocationIdFilter] = useState<string | undefined>(
    undefined,
  );
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<
    "day" | "evening" | "night" | "All" | undefined
  >(undefined);
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    "industrial" | "residential" | "commercial" | "rural" | "All" | undefined
  >(undefined);
  const [selectedParameter, setSelectedParameter] =
    useState<keyof AirData>("pm25");
  const [selectedParameter2, setSelectedParameter2] =
    useState<keyof AirData>("temperature");

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

  const {
    data: airData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "air-data-analysis",
      activeSearchQuery,
      locationIdFilter,
      startDateFilter,
      endDateFilter,
      timeOfDayFilter,
      locationTypeFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const filters: AirDataFilterDto = {
        page: 1,
        limit: 10000,
        search: activeSearchQuery,
        locationId: locationIdFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        timeOfDay:
          timeOfDayFilter === "All"
            ? undefined
            : (timeOfDayFilter as TimeOfDay),
        locationType:
          locationTypeFilter === "All"
            ? undefined
            : (locationTypeFilter as LocationType),
      };
      const response = await airService.findAllAirData(
        currentUser.token,
        filters,
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const handleApplyFilters = () => {
    setActiveSearchQuery(searchQuery || "");
    refetch();
  };

  const numericData = useMemo(() => {
    if (!airData) return [];
    return airData
      .map((item) => Number(item[selectedParameter]))
      .filter((v) => !isNaN(v));
  }, [airData, selectedParameter]);

  const statistics = useMemo(() => {
    if (numericData.length === 0) return null;
    return {
      mean: calculateMean(numericData).toFixed(2),
      median: calculateMedian(numericData).toFixed(2),
      stdDev: calculateStdDev(numericData).toFixed(2),
      min: Math.min(...numericData).toFixed(2),
      max: Math.max(...numericData).toFixed(2),
    };
  }, [numericData]);

  const histogramData = useMemo(() => {
    if (numericData.length === 0) return [];
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);
    const range = max - min;
    const binCount = 10;
    const binSize = range / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      return {
        name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count: 0,
      };
    });

    for (const value of numericData) {
      let binIndex = Math.floor((value - min) / binSize);
      if (binIndex === binCount) binIndex--; // Put max value in last bin
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    }
    return bins;
  }, [numericData]);

  const scatterData = useMemo(() => {
    if (!airData) return [];
    return airData
      .map((item) => ({
        x: Number(item[selectedParameter]),
        y: Number(item[selectedParameter2]),
      }))
      .filter((item) => !isNaN(item.x) && !isNaN(item.y));
  }, [airData, selectedParameter, selectedParameter2]);

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

  const selectedLocation = locations.find(
    (loc) => loc.locationId === locationIdFilter,
  );

  return (
    <div className="w-full max-w-[60rem]">
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Air Quality Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive environmental data insights and trends
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end max-w-[60rem]">
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
          <div className="flex-1">
            <label
              htmlFor="timeOfDay"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Filter by Time of Day
            </label>
            <Select
              value={timeOfDayFilter}
              onValueChange={(value) =>
                setTimeOfDayFilter(
                  value === "All"
                    ? undefined
                    : (value as "day" | "evening" | "night"),
                )
              }
            >
              <SelectTrigger
                id="timeOfDay"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Select Time of Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All</SelectItem>
                {Object.values(TimeOfDay).map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="locationType"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Filter by Location Type
            </label>
            <Select
              value={locationTypeFilter}
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
                className="bg-background border-border"
              >
                <SelectValue placeholder="Select Location Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LocationType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
          <div className="flex-1">
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
                placeholder="Search..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-primary focus:border-primary"
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
              value={locationIdFilter}
              onValueChange={(value) =>
                setLocationIdFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger
                id="location"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc: any) => (
                  <SelectItem key={loc.locationId} value={loc.locationId}>
                    <div className="flex flex-row gap-1 items-center justify-start">
                      <MapPin size={15} />
                      <div>{loc.name}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="self-end"
          >
            {isLoading ? (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Apply Filters
          </Button>
        </div>

        <Collapsible
          open={isMapOpen}
          onOpenChange={setIsMapOpen}
          className="mb-6"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full justify-between"
            >
              <span>{isMapOpen ? "Hide Map" : "Show Map"}</span>
              {isMapOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <MapComponent
              locations={locations}
              activeLocationId={locationIdFilter}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Content */}
        {isLoading ? (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <LoaderIcon className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-slate-600 dark:text-slate-400">
                  Loading air quality data...
                </p>
              </div>
            </CardContent>
          </Card>
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
        ) : (
          <div className="space-y-8">
            {/* Statistical Summary - Enhanced */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Statistical Summary -{" "}
                  {
                    parameterOptions.find((p) => p.value === selectedParameter)
                      ?.label
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="text-center p-4 bg-green-600/10  rounded-xl shadow-sm">
                      <p className="text-2xl font-bold  text-green-600">
                        {statistics.mean}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Mean
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-600/10  rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-green-600">
                        {statistics.median}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Median
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-600/10  rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-purple-600">
                        {statistics.stdDev}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Std Dev
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-600/10  rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-orange-600">
                        {statistics.min}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Minimum
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-600/10  rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-red-600">
                        {statistics.max}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                        Maximum
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      No data available for statistical analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parameter Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Primary Parameter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedParameter}
                    onValueChange={(value) =>
                      setSelectedParameter(value as keyof AirData)
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select Parameter 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {parameterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </div>

              <div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Secondary Parameter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedParameter2}
                    onValueChange={(value) =>
                      setSelectedParameter2(value as keyof AirData)
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select Parameter 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {parameterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </div>
            </div>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-6 w-6  text-green-600" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart
                    data={airData?.map((i) => ({
                      ...i,
                      measurementTime: format(
                        new Date(i.measurementTime),
                        "yyyy-MM-dd HH:mm",
                      ),
                    }))}
                  >
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <XAxis dataKey="measurementTime" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={selectedParameter}
                      name={selectedParameter.toString()}
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedParameter2}
                      name={selectedParameter2.toString()}
                      stroke="#8884d8"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-6 w-6 text-green-600" />
                  Distribution of {selectedParameter.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={histogramData}>
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" radius={2} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Correlation Analysis */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <ScatterChartIcon className="h-6 w-6 text-green-600" />
                  Correlation Analysis:{" "}
                  {
                    parameterOptions.find((p) => p.value === selectedParameter)
                      ?.label
                  }{" "}
                  vs{" "}
                  {
                    parameterOptions.find((p) => p.value === selectedParameter2)
                      ?.label
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <ScatterChart>
                    {/* <CartesianGrid strokeDasharray="3 3" opacity={0.3} /> */}
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={
                        parameterOptions.find(
                          (p) => p.value === selectedParameter,
                        )?.label
                      }
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={
                        parameterOptions.find(
                          (p) => p.value === selectedParameter2,
                        )?.label
                      }
                    />
                    <ZAxis range={[50, 200]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Data Points"
                      data={scatterData}
                      fill="#82ca9d"
                      opacity={0.7}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
