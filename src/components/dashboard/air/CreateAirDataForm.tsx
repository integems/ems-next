"use client"
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { FrontendLocationService } from "@/frontend-services/location.service";
import { FrontendAirService } from "@/frontend-services/air.service";
import { useAuth } from "@/hooks/use-auth";
import { Category, Location, TimeOfDay, LocationType } from "@/types/common.types";
import { createAirDataDto, CreateAirDataDto, singleAirData as airDto } from "@/dtos/air.dto";
import { createLocationDto, CreateLocationDto } from "@/dtos/location.dto";
import { Loader2, Upload, MapPin, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LocationPickerMap from "@/components/LocationPickerMap";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";
import * as XLSX from "xlsx";
import { Spreadsheet } from "react-spreadsheet";
import { format } from "date-fns";


const locationService = new FrontendLocationService();
const airService = new FrontendAirService();

// Updated airDto schema with validation for at least one measurement
const updatedAirDto = airDto.extend({
  pm25: z.number().optional(),
  pm10: z.number().optional(),
  no2: z.number().optional(),
  o3: z.number().optional(),
  co: z.number().optional(),
  so2: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
}).refine(
  (data) =>
    data.pm25 != null ||
    data.pm10 != null ||
    data.no2 != null ||
    data.o3 != null ||
    data.co != null ||
    data.so2 != null ||
    data.temperature != null ||
    data.humidity != null,
  {
    message: "At least one measurement (PM2.5, PM10, NO₂, O₃, CO, SO₂, temperature, or humidity) is required",
    path: ["measurements"],
  }
);

interface CreateAirDataFormProps {
  onClose: () => void;
}

type AirDataFormData = z.infer<typeof updatedAirDto>;

const parameterMappings: { [key: string]: keyof AirDataFormData } = {
  rh: "humidity",
  humidity: "humidity",
  relativehumidity: "humidity",
  pm25: "pm25",
  "pm2.5": "pm25",
  pm10: "pm10",
  no2: "no2",
  "no₂": "no2",
  o3: "o3",
  "o₃": "o3",
  co: "co",
  so2: "so2",
  "so₂": "so2",
  temp: "temperature",
  temperature: "temperature",
  measurementtime: "measurementTime",
  notes: "notes",
  timeofday: "timeOfDay",
  locationtype: "locationType",
};

export default function CreateAirDataForm({ onClose }: CreateAirDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [locationFormData, setLocationFormData] = useState<CreateLocationDto & { locationType?: LocationType }>({
    name: "",
    description: "",
    category: Category.Air,
    pointGeom: [0.0, 0.0],
  });
  const [airDataFormData, setAirDataFormData] = useState<AirDataFormData[]>([
    {
      measurementTime: new Date(),
    },
  ]);
  const [singleAirData, setSingleAirData] = useState<Partial<AirDataFormData>>({
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
      const response = await locationService.findAllLocations(currentUser.token || "", {
        page: 1,
        limit: 1000,
      });
      return response.data;
    },
    enabled: !!currentUser?.token,
  });

  const locations: Location[] = locationsData || [];

  const createAirDataMutation = useMutation({
    mutationFn: (newAirData: CreateAirDataDto) =>
      airService.createAirData(currentUser?.token || "", newAirData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["air-data"] });
      toast.success("Air data updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating air data: ${error.message}`);
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: (newLocation: CreateLocationDto) =>
      locationService.createLocation(currentUser?.token || "", newLocation),
    onSuccess: (data) => {
      console.log({"Created Location":data})
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location created successfully!");
      const newLocationId = data.data.locationId;
      const airDataWithLocation = airDataFormData.map((data) => ({
        ...data,
        locationId: newLocationId,
        pointGeom: locationFormData.pointGeom,
      }));
      const result = createAirDataDto.safeParse(airDataWithLocation);
      if (result.success) {
        createAirDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the air quality data.");
      }
    },
    onError: (error: any) => {
      toast.error(`Error creating location: ${error.message}`);
    },
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSingleAirDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSingleAirData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleTimeOfDayChange = (value: TimeOfDay) => {
    setSingleAirData((prev) => ({ ...prev, timeOfDay: value }));
  };

  const handleLocationTypeChange = (value: LocationType) => {
    setSingleAirData((prev) => ({ ...prev, locationType: value }));
  };

  const handleAddSingleAirData = () => {
    const result = updatedAirDto.safeParse(singleAirData);
    if (result.success) {
      setAirDataFormData((prev) => [...prev, result.data]);
      setSingleAirData({ measurementTime: new Date() });
      setErrors({}); // Clear previous errors
      toast.success("Air data entry added to list!");
    } else {
      setErrors(result.error.flatten().fieldErrors);
    }
  };

  const handleSpreadsheetChange = (data: { value: string }[][]) => {
    const headers = [
      "measurementTime",
      "pm25",
      "pm10",
      "no2",
      "o3",
      "co",
      "so2",
      "temperature",
      "humidity",
      "notes",
      "timeOfDay",
      "locationType",
    ];

    const newData = data.map((row, index) => {
      const rowData: Partial<AirDataFormData> = index < airDataFormData.length ? { ...airDataFormData[index] } : {};
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
            ["pm25", "pm10", "no2", "o3", "co", "so2", "temperature", "humidity"].includes(header)
          ) {
            rowData[header as keyof AirDataFormData] = Number(value) as any;
          } else {
            rowData[header as keyof AirDataFormData] = value as any;
          }
        }
      });
      return rowData as AirDataFormData;
    });

    // Validate each row
    const validatedData: AirDataFormData[] = [];
    const newErrors: any = {};
    newData.forEach((row, index) => {
      const result = updatedAirDto.safeParse(row);
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
      setAirDataFormData(validatedData);
    }
  };

  const spreadsheetData = airDataFormData.map((data) => [
    { value: data.measurementTime instanceof Date ? format(data.measurementTime, "MM/dd/yyyy hh:mm a") : "" },
    { value: data.pm25?.toString() || "" },
    { value: data.pm10?.toString() || "" },
    { value: data.no2?.toString() || "" },
    { value: data.o3?.toString() || "" },
    { value: data.co?.toString() || "" },
    { value: data.so2?.toString() || "" },
    { value: data.temperature?.toString() || "" },
    { value: data.humidity?.toString() || "" },
    { value: data.notes || "" },
    { value: data.timeOfDay || "" },
    { value: data.locationType || "" },
  ]);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
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

          const mappedData: AirDataFormData[] = rows.map((row, index) => {
            const rowData: Partial<AirDataFormData> = index < airDataFormData.length ? { ...airDataFormData[index] } : {};
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
                      toast.error(`Invalid date format in uploaded file: ${value}`);
                    }
                  } else if (mappedKey === "timeOfDay") {
                    rowData[mappedKey] = value as TimeOfDay;
                  } else if (mappedKey === "locationType") {
                    rowData[mappedKey] = value as LocationType;
                  } else if (
                    ["pm25", "pm10", "no2", "o3", "co", "so2", "temperature", "humidity"].includes(
                      mappedKey,
                    )
                  ) {
                    rowData[mappedKey] = Number(value) as any;
                  } else {
                    rowData[mappedKey] = value as any;
                  }
                }
              }
            });
            return rowData as AirDataFormData;
          });

          // Validate uploaded data
          const validatedData: AirDataFormData[] = [];
          const newErrors: any = {};
          mappedData.forEach((row, index) => {
            const result = updatedAirDto.safeParse(row);
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
            setAirDataFormData(validatedData);
            toast.success("Excel data imported successfully!");
          }
        } catch (error) {
          toast.error("Error reading Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [airDataFormData],
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
      const selectedLocation = locations.find((loc) => loc.locationId === selectedLocationId);
      if (!selectedLocation?.pointGeom) {
        setErrors({ locationId: "Selected location has no coordinates." });
        toast.error("Selected location has no coordinates.");
        return;
      }
      const airDataWithLocation = airDataFormData.map((data) => ({
        ...data,
        locationId: selectedLocationId,
        pointGeom: selectedLocation.pointGeom,
      }));
      const airDataResult = createAirDataDto.safeParse(airDataWithLocation);
      if (airDataResult.success) {
        createAirDataMutation.mutate(airDataResult.data);
      } else {
        setErrors(airDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the air quality data.");
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

            <Tabs value={isCreatingLocation ? "create" : "existing"} className="w-full">
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
                          <SelectItem key={location.locationId} value={location.locationId}>
                            {location.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.locationId && <p className="text-xs text-red-500">{errors.locationId}</p>}
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
                      {errors.name && <p className="text-xs text-red-500">{errors.name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newLocationDescription">Description</Label>
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
                        onValueChange={(value) => setLocationFormData((prev) => ({ ...prev, locationType: value as LocationType }))}
                        value={locationFormData.locationType || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.locationType && <p className="text-xs text-red-500">{errors.locationType[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Location on Map</Label>
                    <div className="h-64 border rounded-lg overflow-hidden">
                      <LocationPickerMap
                        onLocationSelect={(lat, lng) =>
                          setLocationFormData((prev) => ({ ...prev, pointGeom: [lat, lng] }))
                        }
                      />
                    </div>
                    {errors.pointGeom && (
                      <p className="text-xs text-red-500">{errors.pointGeom[0]}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Air Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Air Quality Data</h2>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Import from Excel (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
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
          <div className="space-y-2">
            <Label>Air Quality Data Entries</Label>
            <div className="max-w-[60rem] overflow-auto rounded">
              <Spreadsheet
                data={spreadsheetData}
                columnLabels={[
                  "Measurement Time",
                  "PM2.5 (µg/m³)",
                  "PM10 (µg/m³)",
                  "NO₂ (µg/m³)",
                  "O₃ (µg/m³)",
                  "CO (µg/m³)",
                  "SO₂ (µg/m³)",
                  "Temperature (°C)",
                  "Humidity (%)",
                  "Notes",
                  "Time of Day",
                  "Location Type",
                ]}
                onChange={(data)=>handleSpreadsheetChange(data as any)}
              />
       
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-6">
            {/* Measurement Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Measurement Time</Label>
                <DateTimePicker
                  value={singleAirData.measurementTime}
                  onChange={(date) =>
                    setSingleAirData((prev) => ({
                      ...prev,
                      measurementTime: date || new Date(),
                    }))
                  }
                />
                {errors.measurementTime && (
                  <p className="text-xs text-red-500">{errors.measurementTime[0]}</p>
                )}
              </div>
              <div></div>
            </div>

            {/* Primary Measurements */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Primary Measurements</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">PM2.5 (µg/m³)</Label>
                  <Input
                    type="number"
                    name="pm25"
                    value={singleAirData.pm25 || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.pm25 && <p className="text-xs text-red-500">{errors.pm25[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">PM10 (µg/m³)</Label>
                  <Input
                    type="number"
                    name="pm10"
                    value={singleAirData.pm10 || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.pm10 && <p className="text-xs text-red-500">{errors.pm10[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Temperature (°C)</Label>
                  <Input
                    type="number"
                    name="temperature"
                    value={singleAirData.temperature || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.temperature && (
                    <p className="text-xs text-red-500">{errors.temperature[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Humidity (%)</Label>
                  <Input
                    type="number"
                    name="humidity"
                    value={singleAirData.humidity || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.humidity && <p className="text-xs text-red-500">{errors.humidity[0]}</p>}
                </div>
              </div>
            </div>

            {/* Additional Parameters */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">NO₂ (µg/m³)</Label>
                  <Input
                    type="number"
                    name="no2"
                    value={singleAirData.no2 || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.no2 && <p className="text-xs text-red-500">{errors.no2[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">O₃ (µg/m³)</Label>
                  <Input
                    type="number"
                    name="o3"
                    value={singleAirData.o3 || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.o3 && <p className="text-xs text-red-500">{errors.o3[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">CO (µg/m³)</Label>
                  <Input
                    type="number"
                    name="co"
                    value={singleAirData.co || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.co && <p className="text-xs text-red-500">{errors.co[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">SO₂ (µg/m³)</Label>
                  <Input
                    type="number"
                    name="so2"
                    value={singleAirData.so2 || ""}
                    onChange={handleSingleAirDataChange}
                    placeholder="0"
                  />
                  {errors.so2 && <p className="text-xs text-red-500">{errors.so2[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Time of Day</Label>
                  <Select
                    value={singleAirData.timeOfDay || ""}
                    onValueChange={(value: TimeOfDay) => handleTimeOfDayChange(value)}
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
                  {errors.timeOfDay && <p className="text-xs text-red-500">{errors.timeOfDay[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Location Type</Label>
                  <Select
                    value={singleAirData.locationType || ""}
                    onValueChange={(value: LocationType) => handleLocationTypeChange(value)}
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
                  {errors.locationType && <p className="text-xs text-red-500">{errors.locationType[0]}</p>}
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
                value={singleAirData.notes || ""}
                onChange={handleSingleAirDataChange}
                placeholder="Additional observations or comments..."
                className="h-24"
              />
            </div>

              {errors.locationId && (
                <p className="text-xs text-red-500">{errors.locationId}</p>
              )}

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={handleAddSingleAirData}>
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
            disabled={createLocationMutation.isPending || createAirDataMutation.isPending}
          >
            {(createLocationMutation.isPending || createAirDataMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </form>
      <div className="h-20"></div>
    </div>
  );
}