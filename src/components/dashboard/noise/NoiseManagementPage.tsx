"use client";

import { ExportButton } from "@/components/ExportButton";
import MapComponent from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoiseDataFilterDto } from "@/dtos/noise.dto";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/EmptyState";
import { ScrollableTable } from "@/components/ScrollableTable";
import { cn } from "@/lib/utils";
import { Location, LocationType, RoleName, TimeOfDay } from "@/types/common.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LoaderIcon,
  MapPin,
  Search,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import NoiseDataTableRow from "./NoiseDataTableRow";

const noiseService = new FrontendNoiseService();
const locationService = new FrontendLocationService();

const noiseDataColumns = [
  { header: "Location", accessor: "location" },
  { header: "Time of Day", accessor: "timeOfDay" },
  { header: "Location Type", accessor: "locationType" },
  { header: "Duration", accessor: "duration" },
  { header: "LAeq", accessor: "laeq" },
  { header: "LAFMax", accessor: "lafMax" },
  { header: "Frequency", accessor: "frequency" },
  { header: "LA10", accessor: "la10" },
  { header: "LA90", accessor: "la90" },
  { header: "LAFMin", accessor: "lafMin" },
  { header: "Measurement Time", accessor: "measurementTime" },
  { header: "Notes", accessor: "notes" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
  { header: "Created By", accessor: "createdBy" },
  { header: "Updated By", accessor: "updatedBy" },
];

export default function NoiseManagementPage({
  setActiveView,
  locationId,
  setLocationId,
}: {
  setActiveView: (view: string) => void;
  locationId?: string;
  setLocationId?: (id: string | undefined) => void;
}) {
  const { currentUser } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [locationIdFilter, setLocationIdFilter] = useState<string | undefined>(
    locationId,
  );
  const [activeLocationIdFilter, setActiveLocationIdFilter] = useState<
    string | undefined
  >(locationId);
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

  const limit = 10;

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
    data: noiseDataResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "noise-data",
      page,
      activeSearchQuery,
      activeLocationIdFilter,
      activeStartDateFilter,
      activeEndDateFilter,
      activeTimeOfDayFilter,
      activeLocationTypeFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      const filters: NoiseDataFilterDto = {
        page,
        limit,
        search: activeSearchQuery,
        locationIds: [activeLocationIdFilter as string],
        startDate: activeStartDateFilter
          ? new Date(activeStartDateFilter)
          : undefined,
        endDate: activeEndDateFilter
          ? new Date(activeEndDateFilter)
          : undefined,
        timeOfDay: activeTimeOfDayFilter,
        locationType: activeLocationTypeFilter,
      };

      const noiseData = await noiseService.findAllNoiseData(
        currentUser.token,
        filters,
      );
      return noiseData;
    },
    enabled: !!currentUser?.token,
  });

  const noiseData = noiseDataResponse?.data ?? [];
  const metadata = noiseDataResponse?.metadata || {
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  };

  const handleApplyFilters = useCallback(() => {
    setPage(1);
    setActiveSearchQuery(searchQuery || "");
    setActiveLocationIdFilter(locationIdFilter);
    setActiveStartDateFilter(startDateFilter);
    setActiveEndDateFilter(endDateFilter);
    setActiveTimeOfDayFilter(timeOfDayFilter);
    setActiveLocationTypeFilter(locationTypeFilter);
    if (setLocationId) {
      setLocationId(locationIdFilter);
    }
    refetch();
  }, [
    searchQuery,
    locationIdFilter,
    startDateFilter,
    endDateFilter,
    timeOfDayFilter,
    locationTypeFilter,
    refetch,
    setLocationId,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= metadata.totalPages) {
      setPage(newPage);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const { currentPage, totalPages } = metadata;
    const ellipsis = (
      <PaginationItem key="ellipsis">
        <PaginationEllipsis />
      </PaginationItem>
    );

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={() => handlePageChange(1)}
            isActive={1 === currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (currentPage > 3) {
        pages.push(React.cloneElement(ellipsis, { key: "start-ellipsis" }));
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        startPage = 2;
        endPage = 4;
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(React.cloneElement(ellipsis, { key: "end-ellipsis" }));
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={() => handlePageChange(totalPages)}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl bg-card p-4 shadow-md shadow-black/5 sm:p-6 dark:shadow-black/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Noise Data Overview
        </h2>
        <div className="flex gap-2">
          <ExportButton
            service={{ findAll: noiseService.findAllNoiseData }}
            filters={{
              search: activeSearchQuery,
              locationId: activeLocationIdFilter,
              startDate: activeStartDateFilter,
              endDate: activeEndDateFilter,
              timeOfDay: activeTimeOfDayFilter,
              locationType: activeLocationTypeFilter,
            }}
            fileName="NoiseData"
            token={currentUser?.token || ""}
            columns={noiseDataColumns}
          />
          {(currentUser?.role === RoleName.Admin || currentUser?.role === RoleName.SuperAdmin) && (
            <Button
              size="sm"
              onClick={() => setActiveView("create")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              New <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
        <div className="flex-1">
          <label
            htmlFor="timeOfDay"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Time of Day
          </label>
          <Select
            value={timeOfDayFilter || ""}
            onValueChange={(value: any) =>
              setTimeOfDayFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger
              id="timeOfDay"
              className="bg-background border-border w-full"
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
            onValueChange={(value: any) =>
              setLocationTypeFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger
              id="locationType"
              className="bg-background border-border w-full"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Search
          </label>
          <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", searchQuery ? "text-green-600 dark:text-green-500" : "text-muted-foreground")} />
            <Input
              id="search"
              type="text"
              placeholder="Search noise data..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-9 pr-3 py-2 border w-full border-border rounded-md bg-background focus:ring-primary focus:border-primary", searchQuery ? "text-green-600 dark:text-green-500" : "text-foreground")}
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
              className={cn(
                "bg-background border-border w-full",
                locationIdFilter && "text-green-600 dark:text-green-500",
              )}
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
          className="bg-primary text-primary-foreground hover:bg-primary/90 self-end w-full"
        >
          Apply Filters
        </Button>
        </div>
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
            activeLocationIds={locationIdFilter ? [locationIdFilter] : []}
          />
        </CollapsibleContent>
      </Collapsible>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-md shadow-black/5 sm:p-6 dark:shadow-black/20">
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
          <ScrollableTable>
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                    Duration
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    LAeq
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    LAFMax
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Frequency
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    LA10
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    LA90
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    LAFMin
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
                  {(currentUser?.role === RoleName.Admin || currentUser?.role === RoleName.SuperAdmin) && (
                    <TableHead className="w-[50px] text-foreground font-semibold">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {noiseData.length > 0 ? (
                  noiseData.map((dataItem) => (
                    <NoiseDataTableRow
                      key={dataItem.noiseDataId}
                      data={dataItem}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <EmptyState variant="no-data" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollableTable>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing page {metadata.currentPage} of {metadata.totalPages} (
              {metadata.totalItems} noise data records)
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(1)}
                    disabled={metadata.currentPage === 1}
                  >
                    First
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(metadata.currentPage - 1)}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      metadata.currentPage === 1 &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(metadata.currentPage + 1)}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      metadata.currentPage === metadata.totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(metadata.totalPages)}
                    disabled={metadata.currentPage === metadata.totalPages}
                  >
                    Last
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
