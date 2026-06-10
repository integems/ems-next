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
import { createLocationDto, CreateLocationDto } from "@/dtos/location.dto";
import {
    createSoilDataDto,
    CreateSoilDataDto,
    singleSoilData as soilDto,
} from "@/dtos/soil.dto";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { FrontendSoilService } from "@/frontend-services/soil.service";
import { useAuth } from "@/hooks/use-auth";
import {
    Category,
    Location,
    LocationType,
    TimeOfDay,
} from "@/types/common.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, LoaderIcon, MapPin, Plus } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { Spreadsheet } from "react-spreadsheet";
import { toast } from "sonner";
import { readExcelRows } from "@/components/dashboard/shared/excel";
import { ExcelDropzone } from "@/components/dashboard/shared/ExcelDropzone";
import { ImportErrorList } from "@/components/dashboard/shared/ImportErrorList";
import { z } from "zod";

const locationService = new FrontendLocationService();
const soilService = new FrontendSoilService();

// Updated soilDto schema with validation for at least one measurement
const updatedSoilDto = soilDto
  .extend({
    ph: z.number().optional(),
    moisture: z.number().optional(),
    nitrogen: z.number().optional(),
    phosphorus: z.number().optional(),
    potassium: z.number().optional(),
    organicMatter: z.number().optional(),
    timeOfDay: z.enum(["day", "evening", "night"]).optional(),
    locationType: z
      .enum(["industrial", "residential", "commercial", "rural"])
      .optional(),
  })
  .refine(
    (data) =>
      data.ph != null ||
      data.moisture != null ||
      data.nitrogen != null ||
      data.phosphorus != null ||
      data.potassium != null ||
      data.organicMatter != null,
    {
      message:
        "At least one measurement (pH Level, Moisture, Nitrogen, Phosphorus, Potassium, or Organic Matter) is required",
      path: ["measurements"],
    },
  );

interface CreateSoilDataFormProps {
  onClose: () => void;
  locationId?: string;
}

type SoilDataFormData = z.infer<typeof updatedSoilDto>;

const parameterMappings: { [key: string]: keyof SoilDataFormData } = {
  ph: "ph",
  moisture: "moisture",
  nitrogen: "nitrogen",
  phosphorus: "phosphorus",
  potassium: "potassium",
  organicmatter: "organicMatter",
  measurementtime: "measurementTime",
  notes: "notes",
  timeofday: "timeOfDay",
  locationtype: "locationType",
};

export default function CreateSoilDataForm({
  onClose,
  locationId,
}: CreateSoilDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    locationId || null,
  );
  const [locationFormData, setLocationFormData] = useState<
    CreateLocationDto & { locationType?: LocationType }
  >({
    name: "",
    description: "",
    category: Category.Soil,
    pointGeom: [0.0, 0.0],
  });
  const [soilDataFormData, setSoilDataFormData] = useState<SoilDataFormData[]>(
    [],
  );
  const [singleSoilData, setSingleSoilData] = useState<
    Partial<SoilDataFormData>
  >({
    measurementTime: new Date(),
    timeOfDay: undefined,
    locationType: undefined,
  });
  const [errors, setErrors] = useState<any>({});
  // Carries the entries into the create-location flow so it submits the same list.
  const pendingEntriesRef = useRef<SoilDataFormData[]>([]);

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

  const createSoilDataMutation = useMutation({
    mutationFn: (newSoilData: CreateSoilDataDto) =>
      soilService.createSoilData(currentUser!.token || "", newSoilData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soil-data"] });
      toast.success("Soil data added successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Couldn't add soil data.`);
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: (newLocation: CreateLocationDto) =>
      locationService.createLocation(currentUser!.token || "", newLocation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully!");
      const newLocationId = data.data.locationId;
      const soilDataWithLocation = pendingEntriesRef.current.map((data) => ({
        ...data,
        locationId: newLocationId,
        pointGeom: locationFormData.pointGeom,
      }));
      const result = createSoilDataDto.safeParse(soilDataWithLocation);
      if (result.success) {
        createSoilDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the soil data.");
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

  const handleSingleSoilDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setSingleSoilData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleTimeOfDayChange = (value: TimeOfDay) => {
    setSingleSoilData((prev) => ({ ...prev, timeOfDay: value }));
  };

  const handleLocationTypeChange = (value: LocationType) => {
    setSingleSoilData((prev) => ({ ...prev, locationType: value }));
  };

  const handleAddSingleSoilData = () => {
    const result = updatedSoilDto.safeParse(singleSoilData);
    if (result.success) {
      setSoilDataFormData((prev) => [...prev, result.data]);
      setSingleSoilData({ measurementTime: new Date() });
      setErrors({}); // Clear previous errors
      toast.success("Soil data entry added to list!");
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const handleSpreadsheetChange = (data: { value: string }[][]) => {
    const headers = [
      "measurementTime",
      "ph",
      "moisture",
      "nitrogen",
      "phosphorus",
      "potassium",
      "organicMatter",
      "timeOfDay",
      "locationType",
      "notes",
    ];

    const newData = data.map((row, index) => {
      const rowData: Partial<SoilDataFormData> =
        index < soilDataFormData.length ? { ...soilDataFormData[index] } : {};
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
          } else if (header === "timeOfDay") {
            rowData.timeOfDay = value as TimeOfDay;
          } else if (header === "locationType") {
            rowData.locationType = value as LocationType;
          } else if (
            [
              "ph",
              "moisture",
              "nitrogen",
              "phosphorus",
              "potassium",
              "organicMatter",
            ].includes(header)
          ) {
            rowData[header as keyof SoilDataFormData] = Number(value) as any;
          } else {
            rowData[header as keyof SoilDataFormData] = value as any;
          }
        }
      });
      return rowData as SoilDataFormData;
    });

    // Validate each row
    const validatedData: SoilDataFormData[] = [];
    const newErrors: any = {};
    newData.forEach((row, index) => {
      const result = updatedSoilDto.safeParse(row);
      if (result.success) {
        validatedData.push(result.data);
      } else {
        newErrors[index] = result.error.flatten().fieldErrors;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSoilDataFormData(validatedData);
      toast.warning(
        `${validatedData.length} valid row(s) kept. ${
          Object.keys(newErrors).length
        } row(s) had errors and were skipped.`,
      );
    } else {
      setErrors({}); // Clear previous errors
      setSoilDataFormData(validatedData);
    }
  };

  const spreadsheetData = soilDataFormData.map((data) => [
    {
      value:
        data.measurementTime instanceof Date
          ? format(data.measurementTime, "MM/dd/yyyy hh:mm a")
          : "",
    },
    { value: data.ph?.toString() || "" },
    { value: data.moisture?.toString() || "" },
    { value: data.nitrogen?.toString() || "" },
    { value: data.phosphorus?.toString() || "" },
    { value: data.potassium?.toString() || "" },
    { value: data.organicMatter?.toString() || "" },
    { value: data.timeOfDay || "" },
    { value: data.locationType || "" },
    { value: data.notes || "" },
  ]);

  // Fixed handleFileUpload for Soil Form
  const handleFileUpload = useCallback(
    async (file: File) => {
      let parsed;
      try {
        parsed = await readExcelRows(file);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't read the file.",
        );
        return;
      }
      if (parsed.multipleSheets) {
        toast.info("Multiple sheets found — only the first sheet was imported.");
      }

      try {
        const jsonData = parsed.rows;

          const headers = (jsonData[0] as string[]).map((header) =>
            header.toLowerCase().replace(/\s/g, ""),
          );
          const rows = jsonData.slice(1) as any[][];

          // Check which optional fields are present
          const hasTimeOfDay = headers.includes("timeofday");
          const hasLocationType = headers.includes("locationtype");

          const mappedData: Partial<SoilDataFormData>[] = rows
            .map((row) => {
              if (
                !row ||
                row.every(
                  (cell) => cell === null || cell === undefined || cell === "",
                )
              ) {
                return null;
              }

              const rowData: Partial<SoilDataFormData> = {};
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
                    [
                      "ph",
                      "moisture",
                      "nitrogen",
                      "phosphorus",
                      "potassium",
                      "organicMatter",
                    ].includes(mappedKey)
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
            .filter((row): row is Partial<SoilDataFormData> => row !== null);

          if (mappedData.length === 0) {
            toast.error("No valid data found in the Excel file");
            return;
          }

          const validatedData: SoilDataFormData[] = [];
          const newErrors: any = {};

          mappedData.forEach((row, index) => {
            const result = updatedSoilDto.safeParse(row);
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
              setSoilDataFormData(validatedData);
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
            setSoilDataFormData(validatedData);
            toast.success(
              `Successfully imported ${validatedData.length} rows!`,
            );
          }
        } catch (error) {
          toast.error(
            "Error reading Excel file. Please check the file format.",
          );
        }
    },
    [soilDataFormData],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Require at least one entry; fall back to the current manual entry so a
    // filled-but-not-"added" form is not submitted as an empty no-op.
    let entries = soilDataFormData;
    if (entries.length === 0) {
      const parsed = updatedSoilDto.safeParse(singleSoilData);
      if (parsed.success) {
        entries = [parsed.data];
        setSoilDataFormData(entries);
      } else {
        setErrors(parsed.error.flatten().fieldErrors);
        toast.error("Add at least one soil data entry before submitting.");
        return;
      }
    }

    if (isCreatingLocation) {
      const locationResult = createLocationDto.safeParse(locationFormData);
      if (!locationResult.success) {
        setErrors(locationResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the location data.");
        return;
      }
      const pointGeom = locationFormData.pointGeom;
      if (!pointGeom || (pointGeom[0] === 0 && pointGeom[1] === 0)) {
        setErrors({ pointGeom: ["Please select the location on the map."] });
        toast.error("Please select the location on the map.");
        return;
      }
      pendingEntriesRef.current = entries;
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
      const soilDataWithLocation = entries.map((data) => ({
        ...data,
        locationId: selectedLocationId,
        pointGeom: selectedLocation.pointGeom,
      }));
      const soilDataResult = createSoilDataDto.safeParse(soilDataWithLocation);
      if (soilDataResult.success) {
        createSoilDataMutation.mutate(soilDataResult.data);
      } else {
        setErrors(soilDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the soil data.");
      }
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-card p-4 shadow-md shadow-black/5 sm:p-6 dark:shadow-black/20">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Back navigation */}
        <div className="mb-6">
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            <ArrowLeft /> Back
          </Button>
        </div>
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

                    <LocationPickerMap
                      onLocationSelect={(lat, lng) =>
                        setLocationFormData((prev) => ({
                          ...prev,
                          pointGeom: [lat, lng],
                        }))
                      }
                    />

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

        {/* Soil Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Soil Data</h2>

          {/* File Upload Section */}
          <ExcelDropzone onFile={handleFileUpload} />

          {/* Spreadsheet Section */}
          {!!spreadsheetData.length && (
            <div className="space-y-2">
              <Label>Soil Data Entries</Label>
              <div className="max-w-[60rem] overflow-auto rounded bg-card dark:bg-card">
                <Spreadsheet
                  data={spreadsheetData}
                  columnLabels={[
                    "Measurement Time",
                    "pH Level",
                    "Moisture Level (%)",
                    "Nitrogen Level (ppm)",
                    "Phosphorus Level (ppm)",
                    "Potassium Level (ppm)",
                    "Organic Matter (%)",
                    "Time of Day",
                    "Location Type",
                    "Notes",
                  ]}
                  onChange={(data) => handleSpreadsheetChange(data as any)}
                />
              </div>
            </div>
          )}

          {/* Import errors (from Excel upload or spreadsheet edits) */}
          <ImportErrorList errors={errors} />

          {/* Manual Entry Section */}
          <div className="space-y-6">
            {/* Measurement Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Measurement Time</Label>
                <DateTimePicker
                  value={singleSoilData.measurementTime}
                  onChange={(date) =>
                    setSingleSoilData((prev) => ({
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
                  <Label className="text-sm">pH Level</Label>
                  <Input
                    type="number"
                    name="ph"
                    value={singleSoilData.ph || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.ph && (
                    <p className="text-xs text-red-500">{errors.ph[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Moisture Level (%)</Label>
                  <Input
                    type="number"
                    name="moisture"
                    value={singleSoilData.moisture || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.moisture && (
                    <p className="text-xs text-red-500">{errors.moisture[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Nitrogen Level (ppm)</Label>
                  <Input
                    type="number"
                    name="nitrogen"
                    value={singleSoilData.nitrogen || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.nitrogen && (
                    <p className="text-xs text-red-500">{errors.nitrogen[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Phosphorus Level (ppm)</Label>
                  <Input
                    type="number"
                    name="phosphorus"
                    value={singleSoilData.phosphorus || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.phosphorus && (
                    <p className="text-xs text-red-500">
                      {errors.phosphorus[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Potassium Level (ppm)</Label>
                  <Input
                    type="number"
                    name="potassium"
                    value={singleSoilData.potassium || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.potassium && (
                    <p className="text-xs text-red-500">
                      {errors.potassium[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Organic Matter (%)</Label>
                  <Input
                    type="number"
                    name="organicMatter"
                    value={singleSoilData.organicMatter || ""}
                    onChange={handleSingleSoilDataChange}
                    placeholder="0"
                  />
                  {errors.organicMatter && (
                    <p className="text-xs text-red-500">
                      {errors.organicMatter[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time of Day</Label>
                  <Select
                    value={singleSoilData.timeOfDay || ""}
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
                  <Label className="text-sm">Location Type</Label>
                  <Select
                    value={singleSoilData.locationType || ""}
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
                value={singleSoilData.notes || ""}
                onChange={handleSingleSoilDataChange}
                placeholder="Additional observations or comments..."
                className="h-24"
              />
            </div>

            {errors.locationId && (
              <p className="text-xs text-red-500">{errors.locationId}</p>
            )}

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={handleAddSingleSoilData}>
                Add to list
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <span className="mr-auto text-xs text-muted-foreground">
            {soilDataFormData.length > 0
              ? `${soilDataFormData.length} entr${
                  soilDataFormData.length === 1 ? "y" : "ies"
                } ready to submit`
              : "Your current entry will be submitted"}
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={
              createLocationMutation.isPending ||
              createSoilDataMutation.isPending
            }
          >
            {(createLocationMutation.isPending ||
              createSoilDataMutation.isPending) && (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
