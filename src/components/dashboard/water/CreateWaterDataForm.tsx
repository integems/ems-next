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
import { FrontendWaterService } from "@/frontend-services/water.service";
import { useAuth } from "@/hooks/use-auth";
import {
  Category,
  Location,
  LocationType,
  TimeOfDay,
  WaterSource,
} from "@/types/common.types";
import {
  createWaterDataDto,
  CreateWaterDataDto,
  singleWaterData as waterDto,
} from "@/dtos/water.dto";
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
const waterService = new FrontendWaterService();

// Updated waterDto schema with validation for at least one measurement
const updatedWaterDto = waterDto
  .extend({
    ph: z.number().optional(),
    phMv: z.number().optional(),
    orp: z.number().optional(),
    ec: z.number().optional(),
    ecAbs: z.number().optional(),
    resistivity: z.number().optional(),
    salinity: z.number().optional(),
    pressure: z.number().optional(),
    doPercent: z.number().optional(),
    dissolvedOxygen: z.number().optional(),
    turbidity: z.number().optional(),
    bod: z.number().optional(),
    cod: z.number().optional(),
    totalDissolvedSolids: z.number().optional(),
    temperature: z.number().optional(),
    waterSource: z.enum(["surface", "underground"]).optional(),
  })
  .refine(
    (data) =>
      data.ph != null ||
      data.phMv != null ||
      data.orp != null ||
      data.ec != null ||
      data.ecAbs != null ||
      data.resistivity != null ||
      data.salinity != null ||
      data.pressure != null ||
      data.doPercent != null ||
      data.dissolvedOxygen != null ||
      data.turbidity != null ||
      data.bod != null ||
      data.cod != null ||
      data.totalDissolvedSolids != null ||
      data.temperature != null,
    {
      message:
        "At least one measurement (pH, pH (mV), ORP, EC, EC Abs., Resistivity, Salinity, Pressure, D.O. (%), D.O. (ppm), Turbidity, BOD, COD, Total Dissolved Solids, or Temperature) is required",
      path: ["measurements"],
    },
  );

interface CreateWaterDataFormProps {
  onClose: () => void;
}

type WaterDataFormData = z.infer<typeof updatedWaterDto>;

const parameterMappings: { [key: string]: keyof WaterDataFormData } = {
  ph: "ph",
  phmv: "phMv",
  orp: "orp",
  ec: "ec",
  ecabs: "ecAbs",
  resistivity: "resistivity",
  salinity: "salinity",
  pressure: "pressure",
  dopercent: "doPercent",
  dissolvedoxygen: "dissolvedOxygen",
  turbidity: "turbidity",
  bod: "bod",
  cod: "cod",
  totaldissolvedsolids: "totalDissolvedSolids",
  temperature: "temperature",
  watersource: "waterSource",
  measurementtime: "measurementTime",
  notes: "notes",
  timeofday: "timeOfDay",
  locationtype: "locationType",
};

export default function CreateWaterDataForm({
  onClose,
}: CreateWaterDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationFormData, setLocationFormData] = useState<CreateLocationDto>({
    name: "",
    description: "",
    category: Category.Water,
    pointGeom: [0.0, 0.0],
  });
  const [waterDataFormData, setWaterDataFormData] = useState<
    WaterDataFormData[]
  >([]);
  const [singleWaterData, setSingleWaterData] = useState<
    Partial<WaterDataFormData>
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

  const createWaterDataMutation = useMutation({
    mutationFn: (newWaterData: CreateWaterDataDto) =>
      waterService.createWaterData(currentUser!.token || "", newWaterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-data"] });
      toast.success("Water data updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Couldn't add water data.`);
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
      const waterDataWithLocation = waterDataFormData.map((data) => ({
        ...data,
        locationId: newLocationId,
        pointGeom: locationFormData.pointGeom,
      }));
      const result = createWaterDataDto.safeParse(waterDataWithLocation);
      if (result.success) {
        createWaterDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the water quality data.");
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

  const handleSingleWaterDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setSingleWaterData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleAddSingleWaterData = () => {
    const result = updatedWaterDto.safeParse(singleWaterData);
    if (result.success) {
      setWaterDataFormData((prev) => [...prev, result.data]);
      setSingleWaterData({ measurementTime: new Date() });
      setErrors({}); // Clear previous errors
      toast.success("Water data entry added to list!");
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const handleSpreadsheetChange = (data: { value: string }[][]) => {
    const headers = [
      "measurementTime",
      "ph",
      "phMv",
      "orp",
      "ec",
      "ecAbs",
      "resistivity",
      "salinity",
      "pressure",
      "doPercent",
      "dissolvedOxygen",
      "turbidity",
      "bod",
      "cod",
      "totalDissolvedSolids",
      "temperature",
      "conductivity",
      "waterSource",
      "notes",
    ];

    const newData = data.map((row, index) => {
      const rowData: Partial<WaterDataFormData> =
        index < waterDataFormData.length ? { ...waterDataFormData[index] } : {};
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
              "ph",
              "phMv",
              "orp",
              "ec",
              "ecAbs",
              "resistivity",
              "salinity",
              "pressure",
              "doPercent",
              "dissolvedOxygen",
              "turbidity",
              "bod",
              "cod",
              "totalDissolvedSolids",
              "temperature",
            ].includes(header)
          ) {
            rowData[header as keyof WaterDataFormData] = Number(value) as any;
          } else if (header === "waterSource") {
            rowData.waterSource = value as WaterSource;
          } else if (header === "timeOfDay") {
            rowData.timeOfDay = value as TimeOfDay;
          } else if (header === "locationType") {
            rowData.locationType = value as LocationType;
          } else {
            rowData[header as keyof WaterDataFormData] = value as any;
          }
        }
      });
      return rowData as WaterDataFormData;
    });

    // Validate each row
    const validatedData: WaterDataFormData[] = [];
    const newErrors: any = {};
    newData.forEach((row, index) => {
      const result = updatedWaterDto.safeParse(row);
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
      setWaterDataFormData(validatedData);
    }
  };

  const spreadsheetData = waterDataFormData.map((data) => [
    {
      value:
        data.measurementTime instanceof Date
          ? format(data.measurementTime, "MM/dd/yyyy hh:mm a")
          : "",
    },
    { value: data.ph?.toString() || "" },
    { value: data.phMv?.toString() || "" },
    { value: data.orp?.toString() || "" },
    { value: data.ec?.toString() || "" },
    { value: data.ecAbs?.toString() || "" },
    { value: data.resistivity?.toString() || "" },
    { value: data.salinity?.toString() || "" },
    { value: data.pressure?.toString() || "" },
    { value: data.doPercent?.toString() || "" },
    { value: data.dissolvedOxygen?.toString() || "" },
    { value: data.turbidity?.toString() || "" },
    { value: data.bod?.toString() || "" },
    { value: data.cod?.toString() || "" },
    { value: data.totalDissolvedSolids?.toString() || "" },
    { value: data.temperature?.toString() || "" },
    { value: data.waterSource || "" },
    { value: data.notes || "" },
    { value: data.timeOfDay || "" },
    { value: data.locationType || "" },
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
          // Add waterSource to headers if not present
          if (!headers.includes("watersource")) headers.push("watersource");
          if (!headers.includes("conductivity")) headers.push("conductivity");
          const rows = jsonData.slice(1) as any[][];

          const mappedData: WaterDataFormData[] = rows.map((row, index) => {
            const rowData: Partial<WaterDataFormData> =
              index < waterDataFormData.length
                ? { ...waterDataFormData[index] }
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
                  } else if (mappedKey === "timeOfDay") {
                    rowData[mappedKey] = value as TimeOfDay;
                  } else if (mappedKey === "locationType") {
                    rowData[mappedKey] = value as LocationType;
                  } else if (mappedKey === "waterSource") {
                    rowData[mappedKey] = value as WaterSource;
                  } else if (
                    [
                      "ph",
                      "phMv",
                      "orp",
                      "ec",
                      "ecAbs",
                      "resistivity",
                      "salinity",
                      "pressure",
                      "doPercent",
                      "dissolvedOxygen",
                      "turbidity",
                      "bod",
                      "cod",
                      "totalDissolvedSolids",
                      "temperature",
                    ].includes(mappedKey)
                  ) {
                    rowData[mappedKey] = Number(value) as any;
                  } else {
                    rowData[mappedKey] = value as any;
                  }
                }
              }
            });
            return rowData as WaterDataFormData;
          });

          // Validate uploaded data
          const validatedData: WaterDataFormData[] = [];
          const newErrors: any = {};
          mappedData.forEach((row, index) => {
            const result = updatedWaterDto.safeParse(row);
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
            setWaterDataFormData(validatedData);
            toast.success("Excel data imported successfully!");
          }
        } catch (error) {
          toast.error("Error reading Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [waterDataFormData],
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
      const waterDataWithLocation = waterDataFormData.map((data) => ({
        ...data,
        locationId: selectedLocationId,
        pointGeom: selectedLocation.pointGeom,
      }));
      const waterDataResult = createWaterDataDto.safeParse(
        waterDataWithLocation,
      );
      if (waterDataResult.success) {
        createWaterDataMutation.mutate(waterDataResult.data);
      } else {
        setErrors(waterDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the water quality data.");
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

        {/* Water Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Water Quality Data</h2>

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
              <Label>Water Quality Data Entries</Label>
              <div className="max-w-[60rem] overflow-auto rounded">
                <Spreadsheet
                  data={spreadsheetData}
                  columnLabels={[
                    "Measurement Time",
                    "pH",
                    "pH (mV)",
                    "ORP (mV)",
                    "EC (µS/cm)",
                    "EC Abs. (µS/cm)",
                    "Resistivity (Ohm-cm)",
                    "Salinity (psu)",
                    "Pressure (psi)",
                    "D.O. (%)",
                    "D.O. (ppm)",
                    "Turbidity (FNU)",
                    "BOD (mg/L)",
                    "COD (mg/L)",
                    "TDS (ppm)",
                    "Temperature (°C)",
                    "Water Source",
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
                  value={singleWaterData.measurementTime}
                  onChange={(date) =>
                    setSingleWaterData((prev) => ({
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
                  <Label className="text-sm">pH</Label>
                  <Input
                    type="number"
                    name="ph"
                    value={singleWaterData.ph || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.ph && (
                    <p className="text-xs text-red-500">{errors.ph[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">pH (mV)</Label>
                  <Input
                    type="number"
                    name="phMv"
                    value={singleWaterData.phMv || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.phMv && (
                    <p className="text-xs text-red-500">{errors.phMv[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">ORP (mV)</Label>
                  <Input
                    type="number"
                    name="orp"
                    value={singleWaterData.orp || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.orp && (
                    <p className="text-xs text-red-500">{errors.orp[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">EC (µS/cm)</Label>
                  <Input
                    type="number"
                    name="ec"
                    value={singleWaterData.ec || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.ec && (
                    <p className="text-xs text-red-500">{errors.ec[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">EC Abs. (µS/cm)</Label>
                  <Input
                    type="number"
                    name="ecAbs"
                    value={singleWaterData.ecAbs || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.ecAbs && (
                    <p className="text-xs text-red-500">{errors.ecAbs[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Resistivity (Ohm-cm)</Label>
                  <Input
                    type="number"
                    name="resistivity"
                    value={singleWaterData.resistivity || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.resistivity && (
                    <p className="text-xs text-red-500">
                      {errors.resistivity[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Salinity (psu)</Label>
                  <Input
                    type="number"
                    name="salinity"
                    value={singleWaterData.salinity || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.salinity && (
                    <p className="text-xs text-red-500">{errors.salinity[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Pressure (psi)</Label>
                  <Input
                    type="number"
                    name="pressure"
                    value={singleWaterData.pressure || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.pressure && (
                    <p className="text-xs text-red-500">{errors.pressure[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">D.O. (%)</Label>
                  <Input
                    type="number"
                    name="doPercent"
                    value={singleWaterData.doPercent || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.doPercent && (
                    <p className="text-xs text-red-500">
                      {errors.doPercent[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">D.O. (ppm)</Label>
                  <Input
                    type="number"
                    name="dissolvedOxygen"
                    value={singleWaterData.dissolvedOxygen || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.dissolvedOxygen && (
                    <p className="text-xs text-red-500">
                      {errors.dissolvedOxygen[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Turbidity (FNU)</Label>
                  <Input
                    type="number"
                    name="turbidity"
                    value={singleWaterData.turbidity || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.turbidity && (
                    <p className="text-xs text-red-500">
                      {errors.turbidity[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">BOD (mg/L)</Label>
                  <Input
                    type="number"
                    name="bod"
                    value={singleWaterData.bod || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.bod && (
                    <p className="text-xs text-red-500">{errors.bod[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">COD (mg/L)</Label>
                  <Input
                    type="number"
                    name="cod"
                    value={singleWaterData.cod || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.cod && (
                    <p className="text-xs text-red-500">{errors.cod[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">TDS (ppm)</Label>
                  <Input
                    type="number"
                    name="totalDissolvedSolids"
                    value={singleWaterData.totalDissolvedSolids || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.totalDissolvedSolids && (
                    <p className="text-xs text-red-500">
                      {errors.totalDissolvedSolids[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Temperature (°C)</Label>
                  <Input
                    type="number"
                    name="temperature"
                    value={singleWaterData.temperature || ""}
                    onChange={handleSingleWaterDataChange}
                    placeholder="0"
                  />
                  {errors.temperature && (
                    <p className="text-xs text-red-500">
                      {errors.temperature[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Water Source</Label>
                  <Select
                    onValueChange={(value) =>
                      setSingleWaterData((prev) => ({
                        ...prev,
                        waterSource: value as any,
                      }))
                    }
                    value={singleWaterData.waterSource || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surface">Surface</SelectItem>
                      <SelectItem value="underground">Underground</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.waterSource && (
                    <p className="text-xs text-red-500">
                      {errors.waterSource[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time of Day</Label>
                  <Select
                    value={singleWaterData.timeOfDay || ""}
                    onValueChange={(value: TimeOfDay) =>
                      setSingleWaterData((prev) => ({
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
                    value={singleWaterData.locationType || ""}
                    onValueChange={(value: LocationType) =>
                      setSingleWaterData((prev) => ({
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
                value={singleWaterData.notes || ""}
                onChange={handleSingleWaterDataChange}
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
                onClick={handleAddSingleWaterData}
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
              createWaterDataMutation.isPending
            }
          >
            {(createLocationMutation.isPending ||
              createWaterDataMutation.isPending) && (
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
