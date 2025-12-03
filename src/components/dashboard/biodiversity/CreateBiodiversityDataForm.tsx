"use client";
import LocationPickerMap from "@/components/LocationPickerMap";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  singleBiodiversityData as biodiversityDto,
  createBiodiversityDataDto,
  CreateBiodiversityDataDto,
} from "@/dtos/biodiversity.dto";
import { createLocationDto, CreateLocationDto } from "@/dtos/location.dto";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { useAuth } from "@/hooks/use-auth";
import {
  Category,
  Location,
  LocationType,
  TimeOfDay,
} from "@/types/common.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, LoaderIcon, MapPin, Plus, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Spreadsheet } from "react-spreadsheet";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { z } from "zod";

const locationService = new FrontendLocationService();
const biodiversityService = new FrontendBiodiversityService();

// Updated biodiversityDto schema with validation for at least one measurement
const updatedBiodiversityDto = biodiversityDto
  .extend({
    speciesCount: z.number().optional(),
    shannonIndex: z.number().optional(),
    timeOfDay: z.enum(["day", "evening", "night"]).optional(),
    locationType: z
      .enum(["industrial", "residential", "commercial", "rural"])
      .optional(),
  })
  .refine((data) => data.speciesCount != null || data.shannonIndex != null, {
    message:
      "At least one measurement (Species Count or Shannon Index) is required",
    path: ["measurements"],
  });

interface CreateBiodiversityDataFormProps {
  onClose: () => void;
}

type BiodiversityDataFormData = z.infer<typeof updatedBiodiversityDto>;

const parameterMappings: { [key: string]: keyof BiodiversityDataFormData } = {
  speciescount: "speciesCount",
  shannonindex: "shannonIndex",
  measurementtime: "measurementTime",
  notes: "notes",
  timeofday: "timeOfDay",
  locationtype: "locationType",
};

export default function CreateBiodiversityDataForm({
  onClose,
}: CreateBiodiversityDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationFormData, setLocationFormData] = useState<
    CreateLocationDto & { locationType?: LocationType }
  >({
    name: "",
    description: "",
    category: Category.Biodiversity,
    pointGeom: [0.0, 0.0],
  });
  const [biodiversityDataFormData, setBiodiversityDataFormData] = useState<
    BiodiversityDataFormData[]
  >([]);
  const [singleBiodiversityData, setSingleBiodiversityData] = useState<
    Partial<BiodiversityDataFormData>
  >({
    measurementTime: new Date(),
    timeOfDay: undefined,
    locationType: undefined,
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

  const createBiodiversityDataMutation = useMutation({
    mutationFn: (newBiodiversityData: CreateBiodiversityDataDto) =>
      biodiversityService.createBiodiversityData(
        currentUser!.token || "",
        newBiodiversityData,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biodiversity-data"] });
      toast.success("Biodiversity data updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Couldn't update biodiversity data.`);
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: (newLocation: CreateLocationDto) =>
      locationService.createLocation(currentUser!.token || "", newLocation),
    onSuccess: (data) => {
      // console.log({ "Created Location": data });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully!");
      const newLocationId = data.data.locationId;
      const biodiversityDataWithLocation = biodiversityDataFormData.map(
        (data) => ({
          ...data,
          locationId: newLocationId,
          pointGeom: locationFormData.pointGeom,
        }),
      );
      const result = createBiodiversityDataDto.safeParse(
        biodiversityDataWithLocation,
      );
      if (result.success) {
        createBiodiversityDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the biodiversity quality data.");
      }
    },
    onError: (error: any) => {
      toast.error(`couldn't add location.`);
    },
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleBiodiversityDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setSingleBiodiversityData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleTimeOfDayChange = (value: TimeOfDay) => {
    setSingleBiodiversityData((prev) => ({ ...prev, timeOfDay: value }));
  };

  const handleLocationTypeChange = (value: LocationType) => {
    setSingleBiodiversityData((prev) => ({ ...prev, locationType: value }));
  };

  const handleAddSingleBiodiversityData = () => {
    const result = updatedBiodiversityDto.safeParse(singleBiodiversityData);
    if (result.success) {
      setBiodiversityDataFormData((prev) => [...prev, result.data]);
      setSingleBiodiversityData({ measurementTime: new Date() });
      setErrors({}); // Clear previous errors
      toast.success("Biodiversity data entry added to list!");
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const handleSpreadsheetChange = (data: { value: string }[][]) => {
    const headers = [
      "measurementTime",
      "speciesCount",
      "shannonIndex",
      "notes",
      "timeOfDay",
      "locationType",
    ];

    const newData = data.map((row, index) => {
      const rowData: Partial<BiodiversityDataFormData> =
        index < biodiversityDataFormData.length
          ? { ...biodiversityDataFormData[index] }
          : {};
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
          } else if (["speciesCount", "shannonIndex"].includes(header)) {
            rowData[header as keyof BiodiversityDataFormData] = Number(
              value,
            ) as any;
          } else if (header === "timeOfDay") {
            rowData.timeOfDay = value as TimeOfDay;
          } else if (header === "locationType") {
            rowData.locationType = value as LocationType;
          } else {
            rowData[header as keyof BiodiversityDataFormData] = value as any;
          }
        }
      });
      return rowData as BiodiversityDataFormData;
    });

    // Validate each row
    const validatedData: BiodiversityDataFormData[] = [];
    const newErrors: any = {};
    newData.forEach((row, index) => {
      const result = updatedBiodiversityDto.safeParse(row);
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
      setBiodiversityDataFormData(validatedData);
    }
  };

  const spreadsheetData = biodiversityDataFormData.map((data) => [
    {
      value:
        data.measurementTime instanceof Date
          ? format(data.measurementTime, "MM/dd/yyyy hh:mm a")
          : "",
    },
    { value: data.speciesCount?.toString() || "" },
    { value: data.shannonIndex?.toString() || "" },
    { value: data.notes || "" },
    { value: data.timeOfDay || "" },
    { value: data.locationType || "" },
  ]);

  // Fixed handleFileUpload for Biodiversity Form
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
          const rows = jsonData.slice(1) as any[][];

          // Check which optional fields are present
          const hasTimeOfDay = headers.includes("timeofday");
          const hasLocationType = headers.includes("locationtype");

          const mappedData: Partial<BiodiversityDataFormData>[] = rows
            .map((row) => {
              // Skip completely empty rows
              if (
                !row ||
                row.every(
                  (cell) => cell === null || cell === undefined || cell === "",
                )
              ) {
                return null;
              }

              const rowData: Partial<BiodiversityDataFormData> = {};
              let hasValidData = false;

              headers.forEach((header, colIndex) => {
                const mappedKey = parameterMappings[header];
                const value = row[colIndex];

                if (value === null || value === undefined || value === "") {
                  return;
                }

                if (mappedKey) {
                  if (mappedKey === "measurementTime") {
                    let date: Date;
                    if (value instanceof Date) {
                      date = value;
                    } else if (typeof value === "number") {
                      date = new Date((value - 25569) * 86400 * 1000);
                    } else {
                      date = new Date(value);
                    }

                    if (!isNaN(date.getTime())) {
                      rowData[mappedKey] = date;
                      hasValidData = true;
                    }
                  } else if (mappedKey === "timeOfDay" && hasTimeOfDay) {
                    const timeValue = String(value).toLowerCase();
                    if (["day", "morning", "afternoon"].includes(timeValue)) {
                      rowData[mappedKey] = "day" as TimeOfDay;
                    } else if (["evening"].includes(timeValue)) {
                      rowData[mappedKey] = "evening" as TimeOfDay;
                    } else if (["night"].includes(timeValue)) {
                      rowData[mappedKey] = "night" as TimeOfDay;
                    }
                    hasValidData = true;
                  } else if (mappedKey === "locationType" && hasLocationType) {
                    const locValue = String(value).toLowerCase();
                    if (["industrial"].includes(locValue)) {
                      rowData[mappedKey] = "industrial" as LocationType;
                    } else if (
                      ["residential", "residence"].includes(locValue)
                    ) {
                      rowData[mappedKey] = "residential" as LocationType;
                    } else if (["commercial"].includes(locValue)) {
                      rowData[mappedKey] = "commercial" as LocationType;
                    } else if (["rural"].includes(locValue)) {
                      rowData[mappedKey] = "rural" as LocationType;
                    }
                    hasValidData = true;
                  } else if (
                    ["speciesCount", "shannonIndex"].includes(mappedKey)
                  ) {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      rowData[mappedKey] = numValue as any;
                      hasValidData = true;
                    }
                  } else if (mappedKey === "notes") {
                    rowData[mappedKey] = String(value);
                    hasValidData = true;
                  }
                }
              });

              return hasValidData ? rowData : null;
            })
            .filter(
              (row): row is Partial<BiodiversityDataFormData> => row !== null,
            );

          if (mappedData.length === 0) {
            toast.error("No valid data found in the Excel file");
            return;
          }

          const validatedData: BiodiversityDataFormData[] = [];
          const newErrors: any = {};

          mappedData.forEach((row, index) => {
            const result = updatedBiodiversityDto.safeParse(row);
            if (result.success) {
              validatedData.push(result.data);
            } else {
              newErrors[index] = result.error.flatten().fieldErrors;
            }
          });

          if (Object.keys(newErrors).length > 0) {
            const errorCount = Object.keys(newErrors).length;
            const successCount = validatedData.length;

            if (successCount > 0) {
              setBiodiversityDataFormData(validatedData);
              toast.warning(
                `Imported ${successCount} valid rows. ${errorCount} rows had errors and were skipped.`,
              );
            } else {
              setErrors(newErrors);
              toast.error(
                "All rows contain errors. Please check your data format.",
              );
            }
          } else {
            setErrors({});
            setBiodiversityDataFormData(validatedData);
            toast.success(
              `Successfully imported ${validatedData.length} rows!`,
            );
          }
        } catch (error) {
          toast.error(
            "Error reading Excel file. Please check the file format.",
          );
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [biodiversityDataFormData],
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
      const biodiversityDataWithLocation = biodiversityDataFormData.map(
        (data) => ({
          ...data,
          locationId: selectedLocationId,
          pointGeom: selectedLocation.pointGeom,
        }),
      );
      const biodiversityDataResult = createBiodiversityDataDto.safeParse(
        biodiversityDataWithLocation,
      );
      if (biodiversityDataResult.success) {
        createBiodiversityDataMutation.mutate(biodiversityDataResult.data);
      } else {
        setErrors(biodiversityDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the biodiversity quality data.");
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
                            locationType: value as LocationType,
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

        {/* Biodiversity Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">
            Biodiversity Quality Data
          </h2>

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
              <Label>Biodiversity Quality Data Entries</Label>
              <div className="max-w-[60rem] overflow-auto rounded">
                <Spreadsheet
                  data={spreadsheetData}
                  columnLabels={[
                    "Measurement Time",
                    "Species Count",
                    "Shannon Index",
                    "Notes",
                    "Time of Day",
                    "Location Type",
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
                  value={singleBiodiversityData.measurementTime}
                  onChange={(date) =>
                    setSingleBiodiversityData((prev) => ({
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
              <Label className="text-base font-medium">Measurements</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Species Count</Label>
                  <Input
                    type="number"
                    name="speciesCount"
                    value={singleBiodiversityData.speciesCount || ""}
                    onChange={handleSingleBiodiversityDataChange}
                    placeholder="0"
                  />
                  {errors.speciesCount && (
                    <p className="text-xs text-red-500">
                      {errors.speciesCount[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Shannon Index</Label>
                  <Input
                    type="number"
                    name="shannonIndex"
                    value={singleBiodiversityData.shannonIndex || ""}
                    onChange={handleSingleBiodiversityDataChange}
                    placeholder="0"
                  />
                  {errors.shannonIndex && (
                    <p className="text-xs text-red-500">
                      {errors.shannonIndex[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time of Day</Label>
                  <Select
                    value={singleBiodiversityData.timeOfDay || ""}
                    onValueChange={(value: TimeOfDay) =>
                      handleTimeOfDayChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time of Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TimeOfDay).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time.charAt(0).toUpperCase() + time.slice(1)}
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
                  <Label className="text-sm">
                    Location Type (Data Specific)
                  </Label>
                  <Select
                    value={singleBiodiversityData.locationType || ""}
                    onValueChange={(value: LocationType) =>
                      handleLocationTypeChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LocationType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
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
                value={singleBiodiversityData.notes || ""}
                onChange={handleSingleBiodiversityDataChange}
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
                onClick={handleAddSingleBiodiversityData}
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
              createBiodiversityDataMutation.isPending
            }
          >
            {(createLocationMutation.isPending ||
              createBiodiversityDataMutation.isPending) && (
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
