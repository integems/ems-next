"use client";

import React, { useState, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SoilData,
  Location,
  TimeOfDay,
  LocationType,
} from "@/types/common.types";
import { ExportButton } from "@/components/ExportButton";
import { SoilDataFilterDto } from "@/dtos/soil.dto";
import { FrontendSoilService } from "@/frontend-services/soil.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  LoaderIcon,
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import MapComponent from "@/components/MapComponent";
import SoilDataTableRow from "./SoilDataTableRow";

const soilService = new FrontendSoilService();
const locationService = new FrontendLocationService();

const soilDataColumns = [
  { header: "Location", accessor: "location" },
  { header: "Time of Day", accessor: "timeOfDay" },
  { header: "Location Type", accessor: "locationType" },
  { header: "pH", accessor: "ph" },
  { header: "Moisture", accessor: "moisture" },
  { header: "Nitrogen", accessor: "nitrogen" },
  { header: "Phosphorus", accessor: "phosphorus" },
  { header: "Potassium", accessor: "potassium" },
  { header: "Organic Matter", accessor: "organicMatter" },
  { header: "Measurement Time", accessor: "measurementTime" },
  { header: "Notes", accessor: "notes" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
  { header: "Created By", accessor: "createdBy" },
  { header: "Updated By", accessor: "updatedBy" },
];

export default function SoilManagementPage({
  setActiveView,
}: {
  setActiveView: (view: string) => void;
}) {
  const { currentUser } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [locationIdFilter, setLocationIdFilter] = useState<string | undefined>(
    undefined,
  );
  const [activeLocationIdFilter, setActiveLocationIdFilter] = useState<
    string | undefined
  >(undefined);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [activeStartDateFilter, setActiveStartDateFilter] = useState<
    Date | undefined
  >(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined,
  );
  const [activeEndDateFilter, setActiveEndDateFilter] = useState<
    Date | undefined
  >(undefined);
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<TimeOfDay | undefined>(
    undefined,
  );
  const [activeTimeOfDayFilter, setActiveTimeOfDayFilter] = useState<
    TimeOfDay | undefined
  >(undefined);
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    LocationType | undefined
  >(undefined);
  const [activeLocationTypeFilter, setActiveLocationTypeFilter] = useState<
    LocationType | undefined
  >(undefined);

  const limit = 5;

  const { data: locationsData } = useQuery({
    queryKey: ["locations", currentUser?.token],
    queryFn: async () => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      const response = await locationService.findAllLocations(
        currentUser.token,
        { page: 1, limit: 1000 },
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "soil-data",
      activeSearchQuery,
      activeLocationIdFilter,
      activeStartDateFilter,
      activeEndDateFilter,
      activeTimeOfDayFilter,
      activeLocationTypeFilter,
      currentUser?.token,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      const filters: SoilDataFilterDto = {
        page: pageParam,
        limit,
        search: activeSearchQuery,
        locationId: activeLocationIdFilter,
        startDate: activeStartDateFilter
          ? new Date(activeStartDateFilter)
          : undefined,
        endDate: activeEndDateFilter
          ? new Date(activeEndDateFilter)
          : undefined,
        timeOfDay: activeTimeOfDayFilter,
        locationType: activeLocationTypeFilter,
      };

      const soilData = await soilService.findAllSoilData(
        currentUser.token,
        filters,
      );
      return soilData;
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.metadata.currentPage > 1
        ? firstPage.metadata.currentPage - 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!currentUser?.token,
  });

  const soilData = data?.pages.flatMap((page) => page.data) ?? [];
  const metadata = data?.pages[data.pages.length - 1]?.metadata || {
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  };

  const handleApplyFilters = useCallback(() => {
    setActiveSearchQuery(searchQuery || "");
    setActiveLocationIdFilter(locationIdFilter);
    setActiveStartDateFilter(startDateFilter);
    setActiveEndDateFilter(endDateFilter);
    setActiveTimeOfDayFilter(timeOfDayFilter);
    setActiveLocationTypeFilter(locationTypeFilter);
    refetch();
  }, [
    searchQuery,
    locationIdFilter,
    startDateFilter,
    endDateFilter,
    timeOfDayFilter,
    locationTypeFilter,
    refetch,
  ]);

  const handleNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Soil Data Overview
        </h2>
        <div className="flex gap-2">
          <ExportButton
            service={{ findAll: soilService.findAllSoilData }}
            filters={{
              search: activeSearchQuery,
              locationId: activeLocationIdFilter,
              startDate: activeStartDateFilter,
              endDate: activeEndDateFilter,
              timeOfDay: activeTimeOfDayFilter,
              locationType: activeLocationTypeFilter,
            }}
            fileName="SoilData"
            token={currentUser?.token || ""}
            columns={soilDataColumns}
          />
          <Button
            size="sm"
            onClick={() => setActiveView("create")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            New <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
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
            Time of Day
          </label>
          <Select
            value={timeOfDayFilter || ""}
            onValueChange={(value: string) =>
              setTimeOfDayFilter(
                value === "all" ? undefined : (value as TimeOfDay),
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
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label
            htmlFor="locationType"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Location Type
          </label>
          <Select
            value={locationTypeFilter || ""}
            onValueChange={(value: string) =>
              setLocationTypeFilter(
                value === "all" ? undefined : (value as LocationType),
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
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="rural">Rural</SelectItem>
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
              placeholder="Search soil data..."
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
            value={locationIdFilter || ""}
            onValueChange={(value) =>
              setLocationIdFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger
              id="location"
              className={cn(
                "bg-background border-border",
                locationIdFilter && "text-primary",
              )}
            >
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc: Location) => (
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
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
        >
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

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
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
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground font-semibold">
                    Location
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Time of Day
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Location Type
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    pH
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Nitrogen
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Phosphorus
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Potassium
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Organic Matter
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Moisture
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Measurement Time
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Notes
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Created At
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Updated At
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Created By
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Updated By
                  </TableHead>
                  <TableHead className="w-[50px] text-foreground font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soilData.length > 0 ? (
                  soilData.map((dataItem) => (
                    <SoilDataTableRow
                      key={dataItem.soilDataId}
                      data={dataItem}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No soil data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing page {metadata.currentPage} of {metadata.totalPages} (
              {metadata.totalItems} soil data records)
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePreviousPage}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      !hasPreviousPage && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      !hasNextPage && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}
