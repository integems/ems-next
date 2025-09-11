"use client";
import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { FrontendWasteService } from "@/frontend-services/waste.service";
import { useAuth } from "@/hooks/use-auth";
import {
  Category,
  Location,
  LocationType,
  TimeOfDay,
} from "@/types/common.types";
import {
  createWasteDataDto,
  CreateWasteDataDto,
  singleWasteData as wasteDto,
} from "@/dtos/waste.dto";
import { createLocationDto, CreateLocationDto } from "@/dtos/location.dto";
import { LoaderIcon, Upload, MapPin, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LocationPickerMap from "@/components/LocationPickerMap";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";
import * as XLSX from "xlsx";
import { Spreadsheet } from "react-spreadsheet";
import { format } from "date-fns";

const locationService = new FrontendLocationService();
const wasteService = new FrontendWasteService();

// Updated wasteDto schema with validation for at least one measurement
const updatedWasteDto = wasteDto
  .extend({
    solidWasteKg: z.number().optional(),
    hazardousWasteKg: z.number().optional(),
    recycledWasteKg: z.number().optional(),
    organicWasteKg: z.number().optional(),
    plasticWasteKg: z.number().optional(),
    paperWasteKg: z.number().optional(),
    cansWasteKg: z.number().optional(),
    bottlesWasteKg: z.number().optional(),
    eWasteKg: z.number().optional(),
    scrapMetalKg: z.number().optional(),
  })
  .refine(
    (data) =>
      data.solidWasteKg != null ||
      data.hazardousWasteKg != null ||
      data.recycledWasteKg != null ||
      data.organicWasteKg != null ||
      data.plasticWasteKg != null ||
      data.paperWasteKg != null ||
      data.cansWasteKg != null ||
      data.bottlesWasteKg != null ||
      data.eWasteKg != null ||
      data.scrapMetalKg != null,
    {
      message:
        "At least one measurement (Solid Waste, Hazardous Waste, Recycled Waste, Organic Waste, Plastic Waste, Paper Waste, Cans Waste, Bottles Waste, E-Waste, or Scrap Metal) is required",
      path: ["measurements"],
    },
  );

interface CreateWasteDataFormProps {
  onClose: () => void;
}

type WasteDataFormData = z.infer<typeof updatedWasteDto>;

const parameterMappings: { [key: string]: keyof WasteDataFormData } = {
  solidwastekg: "solidWasteKg",
  hazardouswastekg: "hazardousWasteKg",
  recycledwastekg: "recycledWasteKg",
  organicwastekg: "organicWasteKg",
  plasticwastekg: "plasticWasteKg",
  paperwastekg: "paperWasteKg",
  canswastekg: "cansWasteKg",
  bottleswastekg: "bottlesWasteKg",
  ewastekg: "eWasteKg",
  scrapmetalkg: "scrapMetalKg",
  timeofday: "timeOfDay",
  locationtype: "locationType",
  notes: "notes",
  measurementtime: "measurementTime",
};

export default function CreateWasteDataForm({
  onClose,
}: CreateWasteDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationFormData, setLocationFormData] = useState<CreateLocationDto>({
    name: "",
    description: "",
    category: Category.Waste,
    pointGeom: [0.0, 0.0],
  });
  const [wasteDataFormData, setWasteDataFormData] = useState<
    WasteDataFormData[]
  >([]);
  const [singleWasteData, setSingleWasteData] = useState<
    Partial<WasteDataFormData>
  >({
    measurementTime: new Date(),
  });
  const [errors, setErrors] = useState<any>({});
  const [isDragging, setIsDragging] = useState(false);

  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["locations", currentUser?.token],
    queryFn: async () => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      const response = await locationService.findAllLocations(
        currentUser.token || "",
        {
          page: 1,
          limit: 1000,
        },
      );
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  const createWasteDataMutation = useMutation({
    mutationFn: (newWasteData: CreateWasteDataDto) =>
      wasteService.createWasteData(currentUser!.token || "", newWasteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waste-data"] });
      toast.success("Waste data updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Couldn't add waste data.`);
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: (newLocation: CreateLocationDto) =>
      locationService.createLocation(currentUser!.token || "", newLocation),
    onSuccess: (data) => {
      console.log({ "Created Location": data });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully!");
      const newLocationId = data.data.locationId;
      const wasteDataWithLocation = wasteDataFormData.map((data) => ({
        ...data,
        locationId: newLocationId,
        pointGeom: locationFormData.pointGeom,
      }));
      const result = createWasteDataDto.safeParse(wasteDataWithLocation);
      if (result.success) {
        createWasteDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the waste quality data.");
      }
    },
    onError: (error: any) => {
      toast.error(`Couldn't add location.`);
    },
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleWasteDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setSingleWasteData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleAddSingleWasteData = () => {
    const result = updatedWasteDto.safeParse(singleWasteData);
    if (result.success) {
      setWasteDataFormData((prev) => [...prev, result.data]);
      setSingleWasteData({ measurementTime: new Date() });
      setErrors({}); // Clear previous errors
      toast.success("Waste data entry added to list!");
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const handleSpreadsheetChange = (data: { value: string }[][]) => {
    const headers = [
      "measurementTime",
      "solidWasteKg",
      "hazardousWasteKg",
      "recycledWasteKg",
      "organicWasteKg",
      "plasticWasteKg",
      "paperWasteKg",
      "cansWasteKg",
      "bottlesWasteKg",
      "eWasteKg",
      "scrapMetalKg",
      "timeOfDay",
      "locationType",
      "notes",
    ];

    const newData = data.map((row, index) => {
      const rowData: Partial<WasteDataFormData> =
        index < wasteDataFormData.length ? { ...wasteDataFormData[index] } : {};
      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.value;
        if (value) {
          if (header === "measurementTime") {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              rowData.measurementTime = date;
            } else {
              toast.error(`Invalid date format for measurementTime: ${value}`);
            }
          } else if (
            [
              "solidWasteKg",
              "hazardousWasteKg",
              "recycledWasteKg",
              "organicWasteKg",
              "plasticWasteKg",
              "paperWasteKg",
              "cansWasteKg",
              "bottlesWasteKg",
              "eWasteKg",
              "scrapMetalKg",
            ].includes(header)
          ) {
            rowData[header as keyof WasteDataFormData] = Number(value) as any;
          } else if (header === "timeOfDay") {
            rowData.timeOfDay = value as TimeOfDay;
          } else if (header === "locationType") {
            rowData.locationType = value as LocationType;
            rowData[header as keyof WasteDataFormData] = Number(value) as any;
          } else {
            rowData[header as keyof WasteDataFormData] = value as any;
          }
        }
      });
      return rowData as WasteDataFormData;
    });

    // Validate each row
    const validatedData: WasteDataFormData[] = [];
    const newErrors: any = {};
    newData.forEach((row, index) => {
      const result = updatedWasteDto.safeParse(row);
      if (result.success) {
        validatedData.push(result.data);
      } else {
        newErrors[index] = result.error.flatten().fieldErrors;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct errors in the spreadsheet data.");
    } else {
      setErrors({}); // Clear previous errors
      setWasteDataFormData(validatedData);
    }
  };

  const spreadsheetData = wasteDataFormData.map((data) => [
    {
      value:
        data.measurementTime instanceof Date
          ? format(data.measurementTime, "MM/dd/yyyy hh:mm a")
          : "",
    },
    { value: data.solidWasteKg?.toString() || "" },
    { value: data.hazardousWasteKg?.toString() || "" },
    { value: data.recycledWasteKg?.toString() || "" },
    { value: data.organicWasteKg?.toString() || "" },
    { value: data.plasticWasteKg?.toString() || "" },
    { value: data.paperWasteKg?.toString() || "" },
    { value: data.cansWasteKg?.toString() || "" },
    { value: data.bottlesWasteKg?.toString() || "" },
    { value: data.eWasteKg?.toString() || "" },
    { value: data.scrapMetalKg?.toString() || "" },
    { value: data.timeOfDay || "" },
    { value: data.locationType || "" },
    { value: data.notes || "" },
  ]);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".csv")
      ) {
        toast.error("Please upload an Excel file (.xlsx, .xls, or .csv)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array", cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            toast.error("Excel file is empty or has no data rows");
            return;
          }

          const headers = (jsonData[0] as string[]).map((header) =>
            header.toLowerCase().replace(/\s/g, ""),
          );
          // Add timeOfDay and locationType to headers if not present
          if (!headers.includes("timeofday")) headers.push("timeofday");
          if (!headers.includes("locationtype")) headers.push("locationtype");
          const rows = jsonData.slice(1) as any[][];

          const mappedData: WasteDataFormData[] = rows.map((row, index) => {
            const rowData: Partial<WasteDataFormData> =
              index < wasteDataFormData.length
                ? { ...wasteDataFormData[index] }
                : {};
            headers.forEach((header, colIndex) => {
              const mappedKey = parameterMappings[header];
              const value = row[colIndex];
              if (value) {
                if (mappedKey) {
                  if (mappedKey === "measurementTime") {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      rowData[mappedKey] = date;
                    } else {
                      toast.error(
                        `Invalid date format in uploaded file: ${value}`,
                      );
                    }
                  } else if (
                    [
                      "solidWasteKg",
                      "hazardousWasteKg",
                      "recycledWasteKg",
                      "organicWasteKg",
                      "plasticWasteKg",
                      "paperWasteKg",
                      "cansWasteKg",
                      "bottlesWasteKg",
                      "eWasteKg",
                      "scrapMetalKg",
                    ].includes(mappedKey)
                  ) {
                    rowData[mappedKey] = Number(value) as any;
                  } else if (mappedKey === "timeOfDay") {
                    rowData[mappedKey] = value as TimeOfDay;
                  } else if (mappedKey === "locationType") {
                    rowData[mappedKey] = value as LocationType;
                    rowData[mappedKey] = Number(value) as any;
                  } else {
                    rowData[mappedKey] = value as any;
                  }
                }
              }
            });
            return rowData as WasteDataFormData;
          });

          // Validate uploaded data
          const validatedData: WasteDataFormData[] = [];
          const newErrors: any = {};
          mappedData.forEach((row, index) => {
            const result = updatedWasteDto.safeParse(row);
            if (result.success) {
              validatedData.push(result.data);
            } else {
              newErrors[index] = result.error.flatten().fieldErrors;
            }
          });

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct errors in the uploaded data.");
          } else {
            setErrors({}); // Clear previous errors
            setWasteDataFormData(validatedData);
            toast.success("Excel data imported successfully!");
          }
        } catch (error) {
          toast.error("Error reading Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [wasteDataFormData],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (isCreatingLocation) {
      const locationResult = createLocationDto.safeParse(locationFormData);
      if (!locationResult.success) {
        setErrors(locationResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the location data.");
        return;
      }
      createLocationMutation.mutate(locationResult.data);
    } else {
      if (!selectedLocationId) {
        setErrors({ locationId: "Please select a location." });
        toast.error("Please select a location.");
        return;
      }
      const selectedLocation = locations.find(
        (loc) => loc.locationId === selectedLocationId,
      );
      if (!selectedLocation?.pointGeom) {
        setErrors({ locationId: "Selected location has no coordinates." });
        toast.error("Selected location has no coordinates.");
        return;
      }
      const wasteDataWithLocation = wasteDataFormData.map((data) => ({
        ...data,
        locationId: selectedLocationId,
        pointGeom: selectedLocation.pointGeom,
      }));
      const wasteDataResult = createWasteDataDto.safeParse(
        wasteDataWithLocation,
      );
      if (wasteDataResult.success) {
        createWasteDataMutation.mutate(wasteDataResult.data);
      } else {
        setErrors(wasteDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the waste quality data.");
      }
    }
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Location Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Selection
            </h2>

            <Tabs
              value={isCreatingLocation ? "create" : "existing"}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="existing"
                  onClick={() => setIsCreatingLocation(false)}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Select Existing
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  onClick={() => setIsCreatingLocation(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="mt-0">
                <div className="space-y-2 max-w-sm">
                  <Label>Choose Location</Label>
                  <Select
                    onValueChange={(value) => setSelectedLocationId(value)}
                    defaultValue={selectedLocationId || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLocations ? (
                        <SelectItem value="loading" disabled>
                          Loading locations...
                        </SelectItem>
                      ) : (
                        locations?.map((location) => (
                          <SelectItem
                            key={location.locationId}
                            value={location.locationId}
                          >
                            {location.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.locationId && (
                    <p className="text-xs text-red-500">{errors.locationId}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="create" className="mt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newLocationName">Location Name</Label>
                      <Input
                        id="newLocationName"
                        name="name"
                        value={locationFormData.name}
                        onChange={handleLocationChange}
                        placeholder="Enter location name"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newLocationDescription">
                        Description
                      </Label>
                      <Input
                        id="newLocationDescription"
                        name="description"
                        value={locationFormData.description}
                        onChange={handleLocationChange}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newLocationType">Location Type</Label>
                      <Select
                        name="locationType"
                        onValueChange={(value) =>
                          setLocationFormData((prev) => ({
                            ...prev,
                            locationType: value as any,
                          }))
                        }
                        value={locationFormData.locationType || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.locationType && (
                        <p className="text-xs text-red-500">
                          {errors.locationType[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Location on Map</Label>
                    <div className="h-64 border rounded-lg overflow-hidden">
                      <LocationPickerMap
                        onLocationSelect={(lat, lng) =>
                          setLocationFormData((prev) => ({
                            ...prev,
                            pointGeom: [lat, lng],
                          }))
                        }
                      />
                    </div>
                    {errors.pointGeom && (
                      <p className="text-xs text-red-500">
                        {errors.pointGeom[0]}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Waste Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Waste Quality Data</h2>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Import from Excel (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop Excel file here or click to upload
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileInputChange}
              />
              <Label
                htmlFor="file-upload"
                className="inline-block cursor-pointer rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Browse Files
              </Label>
            </div>
          </div>

          {/* Spreadsheet Section */}
          {!!spreadsheetData.length && (
            <div className="space-y-2">
              <Label>Waste Quality Data Entries</Label>
              <div className="max-w-[60rem] overflow-auto rounded">
                <Spreadsheet
                  data={spreadsheetData}
                  columnLabels={[
                    "Measurement Time",
                    "Solid Waste (kg)",
                    "Hazardous Waste (kg)",
                    "Recycled Waste (kg)",
                    "Organic Waste (kg)",
                    "Plastic Waste (kg)",
                    "Paper Waste (kg)",
                    "Cans Waste (kg)",
                    "Bottles Waste (kg)",
                    "E-Waste (kg)",
                    "Scrap Metal (kg)",
                    "Time of Day",
                    "Location Type",
                    "Notes",
                  ]}
                  onChange={(data) => handleSpreadsheetChange(data as any)}
                />
              </div>
            </div>
          )}

          {/* Manual Entry Section */}
          <div className="space-y-6">
            {/* Measurement Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Measurement Time</Label>
                <DateTimePicker
                  value={singleWasteData.measurementTime}
                  onChange={(date) =>
                    setSingleWasteData((prev) => ({
                      ...prev,
                      measurementTime: date || new Date(),
                    }))
                  }
                />
                {errors.measurementTime && (
                  <p className="text-xs text-red-500">
                    {errors.measurementTime[0]}
                  </p>
                )}
              </div>
              <div></div>
            </div>

            {/* Primary Measurements */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Primary Measurements
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Solid Waste (kg)</Label>
                  <Input
                    type="number"
                    name="solidWasteKg"
                    value={singleWasteData.solidWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.solidWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.solidWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Hazardous Waste (kg)</Label>
                  <Input
                    type="number"
                    name="hazardousWasteKg"
                    value={singleWasteData.hazardousWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.hazardousWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.hazardousWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Recycled Waste (kg)</Label>
                  <Input
                    type="number"
                    name="recycledWasteKg"
                    value={singleWasteData.recycledWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.recycledWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.recycledWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Organic Waste (kg)</Label>
                  <Input
                    type="number"
                    name="organicWasteKg"
                    value={singleWasteData.organicWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.organicWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.organicWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Plastic Waste (kg)</Label>
                  <Input
                    type="number"
                    name="plasticWasteKg"
                    value={singleWasteData.plasticWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.plasticWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.plasticWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Paper Waste (kg)</Label>
                  <Input
                    type="number"
                    name="paperWasteKg"
                    value={singleWasteData.paperWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.paperWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.paperWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Cans Waste (kg)</Label>
                  <Input
                    type="number"
                    name="cansWasteKg"
                    value={singleWasteData.cansWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.cansWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.cansWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Bottles Waste (kg)</Label>
                  <Input
                    type="number"
                    name="bottlesWasteKg"
                    value={singleWasteData.bottlesWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.bottlesWasteKg && (
                    <p className="text-xs text-red-500">
                      {errors.bottlesWasteKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">E-Waste (kg)</Label>
                  <Input
                    type="number"
                    name="eWasteKg"
                    value={singleWasteData.eWasteKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.eWasteKg && (
                    <p className="text-xs text-red-500">{errors.eWasteKg[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Scrap Metal (kg)</Label>
                  <Input
                    type="number"
                    name="scrapMetalKg"
                    value={singleWasteData.scrapMetalKg || ""}
                    onChange={handleSingleWasteDataChange}
                    placeholder="0"
                  />
                  {errors.scrapMetalKg && (
                    <p className="text-xs text-red-500">
                      {errors.scrapMetalKg[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time of Day</Label>
                  <Select
                    value={singleWasteData.timeOfDay || ""}
                    onValueChange={(value: TimeOfDay) =>
                      setSingleWasteData((prev) => ({
                        ...prev,
                        timeOfDay: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time of Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TimeOfDay).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timeOfDay && (
                    <p className="text-xs text-red-500">
                      {errors.timeOfDay[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Location Type</Label>
                  <Select
                    value={singleWasteData.locationType || ""}
                    onValueChange={(value: LocationType) =>
                      setSingleWasteData((prev) => ({
                        ...prev,
                        locationType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
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
                  {errors.locationType && (
                    <p className="text-xs text-red-500">
                      {errors.locationType[0]}
                    </p>
                  )}
                </div>
              </div>
              {errors.measurements && (
                <p className="text-xs text-red-500">{errors.measurements}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                name="notes"
                value={singleWasteData.notes || ""}
                onChange={handleSingleWasteDataChange}
                placeholder="Additional observations or comments..."
                className="h-24"
              />
            </div>

            {errors.locationId && (
              <p className="text-xs text-red-500">{errors.locationId}</p>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleAddSingleWasteData}
              >
                Add to list
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            <ArrowLeft /> Back
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              createLocationMutation.isPending ||
              createWasteDataMutation.isPending
            }
          >
            {(createLocationMutation.isPending ||
              createWasteDataMutation.isPending) && (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
      <div className="h-20"></div>
    </div>
  );
}
