"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WasteData } from "@/types/common.types";
import { WasteDataFilterDto } from "@/dtos/waste.dto";
import { FrontendWasteService } from "@/frontend-services/waste.service";
import { useAuth } from "@/hooks/use-auth";
import { LoaderIcon, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";

const wasteService = new FrontendWasteService();

interface WasteAnalysisSectionProps {
  locationId: string | undefined;
}

export default function WasteAnalysisSection({
  locationId,
}: WasteAnalysisSectionProps) {
  const { currentUser } = useAuth();
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [selectedParameter, setSelectedParameter] =
    useState<keyof WasteData>("solidWasteKg");

  const {
    data: wasteData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "waste-data-section",
      locationId,
      startDateFilter,
      endDateFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const filters: WasteDataFilterDto = {
        page: 1,
        limit: 1000,
        locationId: locationId,
        startDate: startDateFilter,
        endDate: endDateFilter,
      };
      const response = await wasteService.findAllWasteData(
        currentUser.token,
        filters,
      );
      return response.data;
    },
    enabled: !!currentUser?.token && !!locationId,
  });

  const parameterOptions: { value: keyof WasteData; label: string }[] = [
    { value: "solidWasteKg", label: "Solid Waste (kg)" },
    { value: "hazardousWasteKg", label: "Hazardous Waste (kg)" },
    { value: "recycledWasteKg", label: "Recycled Waste (kg)" },
    { value: "organicWasteKg", label: "Organic Waste (kg)" },
    { value: "plasticWasteKg", label: "Plastic Waste (kg)" },
    { value: "paperWasteKg", label: "Paper Waste (kg)" },
    { value: "cansWasteKg", label: "Cans Waste (kg)" },
    { value: "bottlesWasteKg", label: "Bottles Waste (kg)" },
    { value: "eWasteKg", label: "E-Waste (kg)" },
    { value: "scrapMetalKg", label: "Scrap Metal (kg)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Activity className="h-6 w-6 text-primary" />
          Waste Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              setSelectedParameter(value as keyof WasteData)
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
        ) : !wasteData || wasteData.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No data available for the selected criteria.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart
              data={wasteData.map((i) => ({
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
        )}
      </CardContent>
    </Card>
  );
}
