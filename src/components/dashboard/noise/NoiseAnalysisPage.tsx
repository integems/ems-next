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
import { NoiseData, Location } from "@/types/common.types";
import { NoiseDataFilterDto } from "@/dtos/noise.dto";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  MapPin,
  LineChart,
  BarChart,
  ScatterChart as ScatterChartIcon,
  TrendingUp,
  Activity,
  Filter,
  RefreshCcw,
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

const noiseService = new FrontendNoiseService();
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

export default function NoiseAnalysisPage() {
  const { currentUser } = useAuth();
  const [locationIdFilter, setLocationIdFilter] = useState<string | undefined>(
    undefined,
  );
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [selectedParameter, setSelectedParameter] =
    useState<keyof NoiseData>("dbA");
  const [selectedParameter2, setSelectedParameter2] =
    useState<keyof NoiseData>("frequency");

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
    data: noiseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "noise-data-analysis",
      locationIdFilter,
      startDateFilter,
      endDateFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const filters: NoiseDataFilterDto = {
        page: 1,
        limit: 10000,
        locationId: locationIdFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };
      const response = await noiseService.findAllNoiseData(
        currentUser.token,
        filters,
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const handleApplyFilters = () => {
    refetch();
  };

  const numericData = useMemo(() => {
    if (!noiseData) return [];
    return noiseData
      .map((item) => Number(item[selectedParameter]))
      .filter((v) => !isNaN(v));
  }, [noiseData, selectedParameter]);

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
    if (!noiseData) return [];
    return noiseData
      .map((item) => ({
        x: Number(item[selectedParameter]),
        y: Number(item[selectedParameter2]),
      }))
      .filter((item) => !isNaN(item.x) && !isNaN(item.y));
  }, [noiseData, selectedParameter, selectedParameter2]);

  const parameterOptions: { value: keyof NoiseData; label: string }[] = [
    { value: "dbA", label: "dbA" },
    { value: "dbC", label: "dbC" },
    { value: "peak", label: "Peak" },
    { value: "frequency", label: "Frequency (Hz)" },
  ];

  const selectedLocation = locations.find(
    (loc) => loc.locationId === locationIdFilter,
  );

  return (
    <div className="w-full px-6">
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Noise Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Comprehensive environmental data insights and trends
          </p>
        </div>

    <div className="flex-1 max-w-xs mb-4">
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
           <SelectTrigger id="location" className="bg-background border-border">
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
 
       <div className="mb-6">
         <MapComponent
           locations={locations}
           activeLocationId={locationIdFilter}
         />
       </div>

        {/* Date Filters */}
        <div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Filter className="h-5 w-5 text-green-600" />
              Time Range Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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

              <Button onClick={handleApplyFilters} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                
              </Button>
            </div>
          </CardContent>
        </div>


        {/* Content */}
        {isLoading ? (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="text-slate-600 dark:text-slate-400">
                  Loading noise data...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isError ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p>Couldn't connect {error.message}</p>
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
                  setSelectedParameter(value as keyof NoiseData)
                }
              >
                <SelectTrigger  className="bg-background border-border">
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
                  setSelectedParameter2(value as keyof NoiseData)
                }
              >
                <SelectTrigger  className="bg-background border-border">
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
                   
                    data={noiseData?.map((i) => ({
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
