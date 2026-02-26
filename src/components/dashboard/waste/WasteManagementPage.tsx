"use client";

import { ExportButton } from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
import { WasteDataFilterDto } from "@/dtos/waste.dto";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { FrontendWasteService } from "@/frontend-services/waste.service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Location, LocationType, TimeOfDay } from "@/types/common.types";
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

import MapComponent from "@/components/MapComponent";
import WasteDataTableRow from "./WasteDataTableRow";

const wasteService = new FrontendWasteService();
const locationService = new FrontendLocationService();

const wasteDataColumns = [
  { header: "Location", accessor: "location" },
  { header: "Time of Day", accessor: "timeOfDay" },
  { header: "Location Type", accessor: "locationType" },
  { header: "Solid Waste (kg)", accessor: "solidWasteKg" },
  { header: "Hazardous Waste (kg)", accessor: "hazardousWasteKg" },
  { header: "Recycled Waste (kg)", accessor: "recycledWasteKg" },
  { header: "Organic Waste (kg)", accessor: "organicWasteKg" },
  { header: "Plastic Waste (kg)", accessor: "plasticWasteKg" },
  { header: "Paper Waste (kg)", accessor: "paperWasteKg" },
  { header: "Cans Waste (kg)", accessor: "cansWasteKg" },
  { header: "Bottles Waste (kg)", accessor: "bottlesWasteKg" },
  { header: "E-Waste (kg)", accessor: "eWasteKg" },
  { header: "Scrap Metal (kg)", accessor: "scrapMetalKg" },
  { header: "Measurement Time", accessor: "measurementTime" },
  { header: "Notes", accessor: "notes" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
  { header: "Created By", accessor: "createdBy" },
  { header: "Updated By", accessor: "updatedBy" },
];

export default function WasteManagementPage({
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
    data: wasteDataResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "waste-data",
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
      const filters: WasteDataFilterDto = {
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

      const wasteData = await wasteService.findAllWasteData(
        currentUser.token,
        filters,
      );
      return wasteData;
    },
    enabled: !!currentUser?.token,
  });

  const wasteData = wasteDataResponse?.data ?? [];
  const metadata = wasteDataResponse?.metadata || {
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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Waste Data Overview
        </h2>
        <div className="flex gap-2">
          <ExportButton
            service={{ findAll: wasteService.findAllWasteData }}
            filters={{
              search: activeSearchQuery,
              locationId: activeLocationIdFilter,
              startDate: activeStartDateFilter,
              endDate: activeEndDateFilter,
              timeOfDay: activeTimeOfDayFilter,
              locationType: activeLocationTypeFilter,
            }}
            fileName="WasteData"
            token={currentUser?.token || ""}
            columns={wasteDataColumns}
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
            onValueChange={(value: any) =>
              setTimeOfDayFilter(value === "all" ? undefined : value)
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
            onValueChange={(value: any) =>
              setLocationTypeFilter(value === "all" ? undefined : value)
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
              placeholder="Search waste data..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 border w-full  border-border rounded-md bg-background text-foreground focus:ring-primary focus:border-primary"
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
                "bg-background border-border",
                locationIdFilter && "text-primary",
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
            activeLocationIds={locationIdFilter ? [locationIdFilter] : []}
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
                    Solid Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Hazardous Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Recycled Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Organic Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Plastic Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Paper Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Cans Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Bottles Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    E-Waste (kg)
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Scrap Metal (kg)
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
                {wasteData.length > 0 ? (
                  wasteData.map((dataItem) => (
                    <WasteDataTableRow
                      key={dataItem.wasteDataId}
                      data={dataItem}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No waste data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing page {metadata.currentPage} of {metadata.totalPages} (
              {metadata.totalItems} waste data records)
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
  );
}
