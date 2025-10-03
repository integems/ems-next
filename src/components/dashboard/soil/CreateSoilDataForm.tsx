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
import { FrontendSoilService } from "@/frontend-services/soil.service";
import { useAuth } from "@/hooks/use-auth";
import { Category, Location } from "@/types/common.types";
import {
  createSoilDataDto,
  CreateSoilDataDto,
  singleSoilData as soilDto,
} from "@/dtos/soil.dto";
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
};

export default function CreateSoilDataForm({
  onClose,
}: CreateSoilDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locationFormData, setLocationFormData] = useState<CreateLocationDto>({
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

  const createSoilDataMutation = useMutation({
    mutationFn: (newSoilData: CreateSoilDataDto) =>
      soilService.createSoilData(currentUser!.token || "", newSoilData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soil-data"] });
      toast.success("Soil data updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(`Couldn't add data.`);
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
      const soilDataWithLocation = soilDataFormData.map((data) => ({
        ...data,
        locationId: newLocationId,
        pointGeom: locationFormData.pointGeom,
      }));
      const result = createSoilDataDto.safeParse(soilDataWithLocation);
      if (result.success) {
        createSoilDataMutation.mutate(result.data);
      } else {
        setErrors(result.error.flatten().fieldErrors);
        toast.error("Please correct errors in the soil quality data.");
      }
    },
    onError: (error: any) => {
      toast.error(`Couldn't add location`);
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
      toast.error("Please correct errors in the spreadsheet data.");
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
          const rows = jsonData.slice(1) as any[][];

          const mappedData: SoilDataFormData[] = rows.map((row, index) => {
            const rowData: Partial<SoilDataFormData> =
              index < soilDataFormData.length
                ? { ...soilDataFormData[index] }
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
                      "ph",
                      "moisture",
                      "nitrogen",
                      "phosphorus",
                      "potassium",
                      "organicMatter",
                    ].includes(mappedKey)
                  ) {
                    rowData[mappedKey] = Number(value) as any;
                  } else {
                    rowData[mappedKey] = value as any;
                  }
                }
              }
            });
            return rowData as SoilDataFormData;
          });

          // Validate uploaded data
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
            setErrors(newErrors);
            toast.error("Please correct errors in the uploaded data.");
          } else {
            setErrors({}); // Clear previous errors
            setSoilDataFormData(validatedData);
            toast.success("Excel data imported successfully!");
          }
        } catch (error) {
          toast.error("Error reading Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [soilDataFormData],
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
      const soilDataWithLocation = soilDataFormData.map((data) => ({
        ...data,
        locationId: selectedLocationId,
        pointGeom: selectedLocation.pointGeom,
      }));
      const soilDataResult = createSoilDataDto.safeParse(soilDataWithLocation);
      if (soilDataResult.success) {
        createSoilDataMutation.mutate(soilDataResult.data);
      } else {
        setErrors(soilDataResult.error.flatten().fieldErrors);
        toast.error("Please correct errors in the soil quality data.");
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

        {/* Soil Data Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Soil Quality Data</h2>

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
              <Label>Soil Quality Data Entries</Label>
              <div className="max-w-[60rem] overflow-auto rounded">
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
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button size="sm" type="button" variant="outline" onClick={onClose}>
            <ArrowLeft /> Back
          </Button>
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
      <div className="h-20"></div>
    </div>
  );
}
