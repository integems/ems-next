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
import { Location } from "@/types/common.types";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import { Activity, LoaderIcon, MapPin } from "lucide-react";
import MapComponent from "@/components/MapComponent";
import AirAnalysisSection from "@/components/dashboard/air/AirAnalysisSection";
import WaterAnalysisSection from "@/components/dashboard/water/WaterAnalysisSection";
import NoiseAnalysisSection from "@/components/dashboard/noise/NoiseAnalysisSection";
import SoilAnalysisSection from "@/components/dashboard/soil/SoilAnalysisSection";
import WasteAnalysisSection from "@/components/dashboard/waste/WasteAnalysisSection";
import BiodiversityAnalysisSection from "@/components/dashboard/biodiversity/BiodiversityAnalysisSection";
import { cn } from "@/lib/utils";

const locationService = new FrontendLocationService();

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations", currentUser?.token],
    queryFn: async () => {
      if (!currentUser?.token) throw new Error("User not authenticated");
      const response = await locationService.findAllLocations(
        currentUser.token,
        {
          page: 1,
          limit: 1000,
        },
      );

      const locationsData = response.data;
      if (locationsData.length > 0) {
        setLocationId(locationsData[0]?.locationId);
      }
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Activity className="h-10 w-10 text-primary" />
          Analysis Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Comprehensive environmental data insights and trends
        </p>
      </div>
      <div className="max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <MapPin className="h-6 w-6 text-primary" />
            Location Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Select onValueChange={setLocationId} value={locationId}>
              <SelectTrigger className="bg-background border-border text-primary">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem
                    key={loc.locationId}
                    className={cn(
                      loc.locationId === locationId ? "text-primary" : "",
                    )}
                    value={loc.locationId}
                  >
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </div>
      {locationId && (
        <>
          <MapComponent locations={locations} activeLocationId={locationId} />
          <div className="grid grid-cols-1 gap-8">
            <AirAnalysisSection locationId={locationId} />
            <WaterAnalysisSection locationId={locationId} />
            <NoiseAnalysisSection locationId={locationId} />
            <SoilAnalysisSection locationId={locationId} />
            <WasteAnalysisSection locationId={locationId} />
            <BiodiversityAnalysisSection locationId={locationId} />
          </div>
        </>
      )}
    </div>
  );
}
