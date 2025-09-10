"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendAirService } from "@/frontend-services/air.service";
import { useAuth } from "@/hooks/use-auth";
import { AirData, TimeOfDay, LocationType } from "@/types/common.types";
import { updateAirDataDto, UpdateAirDataDto } from "@/dtos/air.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const airService = new FrontendAirService();

interface UpdateAirDataFormProps {
  onClose: () => void;
  data: AirData;
}

type UpdateAirDataFormData = z.infer<typeof updateAirDataDto>;

export default function UpdateAirDataForm({ onClose, data }: UpdateAirDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateAirDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        pm25: data.pm25 as number || undefined,
        pm10: data.pm10 as number || undefined,
        no2: data.no2 as number || undefined,
        o3: data.o3 as number || undefined,
        co: data.co as number || undefined,
        so2: data.so2 as number || undefined,
        temperature: data.temperature as number || undefined,
        humidity: data.humidity as number || undefined,
        notes: data.notes || undefined,
        timeOfDay: data.timeOfDay || undefined,
        locationType: data.locationType || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateAirDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return airService.updateAirData(currentUser.token, data.airDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Air data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["air-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update air data")
      setErrors({ server: "Failed to update air data" });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
    setErrors((prev:any) => ({ ...prev, [name]: undefined, server: undefined }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, measurementTime: date }));
  };

  const handleTimeOfDayChange = (value: TimeOfDay) => {
    setFormData((prev) => ({ ...prev, timeOfDay: value }));
  };

  const handleLocationTypeChange = (value: LocationType) => {
    setFormData((prev) => ({ ...prev, locationType: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && <p className="text-sm text-red-500">{errors.server}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Measurement Time</Label>
          <DateTimePicker
            value={formData.measurementTime}
            onChange={handleDateChange}
          />
          {errors.measurementTime && (
            <p className="text-xs text-red-500">{Array.isArray(errors.measurementTime) ? errors.measurementTime[0] : errors.measurementTime}</p>
          )}
        </div>
        <div></div>
      </div>
      <div className="space-y-4">
        <Label className="text-base font-medium">Primary Measurements</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">PM2.5 (µg/m³)</Label>
            <Input
              type="number"
              name="pm25"
              value={formData.pm25 as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.pm25 && <p className="text-xs text-red-500">{Array.isArray(errors.pm25) ? errors.pm25[0] : errors.pm25}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">PM10 (µg/m³)</Label>
            <Input
              type="number"
              name="pm10"
              value={formData.pm10 as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.pm10 && <p className="text-xs text-red-500">{Array.isArray(errors.pm10) ? errors.pm10[0] : errors.pm10}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Temperature (°C)</Label>
            <Input
              type="number"
              name="temperature"
              value={formData.temperature as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.temperature && <p className="text-xs text-red-500">{Array.isArray(errors.temperature) ? errors.temperature[0] : errors.temperature}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Humidity (%)</Label>
            <Input
              type="number"
              name="humidity"
              value={formData.humidity as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.humidity && <p className="text-xs text-red-500">{Array.isArray(errors.humidity) ? errors.humidity[0] : errors.humidity}</p>}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">NO₂ (µg/m³)</Label>
            <Input
              type="number"
              name="no2"
              value={formData.no2 as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.no2 && <p className="text-xs text-red-500">{Array.isArray(errors.no2) ? errors.no2[0] : errors.no2}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">O₃ (µg/m³)</Label>
            <Input
              type="number"
              name="o3"
              value={formData.o3 as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.o3 && <p className="text-xs text-red-500">{Array.isArray(errors.o3) ? errors.o3[0] : errors.o3}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">CO (µg/m³)</Label>
            <Input
              type="number"
              name="co"
              value={formData.co || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.co && <p className="text-xs text-red-500">{Array.isArray(errors.co) ? errors.co[0] : errors.co}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">SO₂ (µg/m³)</Label>
            <Input
              type="number"
              name="so2"
              value={formData.so2 || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.so2 && <p className="text-xs text-red-500">{Array.isArray(errors.so2) ? errors.so2[0] : errors.so2}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Time of Day</Label>
            <Select
              value={formData.timeOfDay || ""}
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
            {errors.timeOfDay && <p className="text-xs text-red-500">{Array.isArray(errors.timeOfDay) ? errors.timeOfDay[0] : errors.timeOfDay}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Location Type</Label>
            <Select
              value={formData.locationType || ""}
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
            {errors.locationType && <p className="text-xs text-red-500">{Array.isArray(errors.locationType) ? errors.locationType[0] : errors.locationType}</p>}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Additional observations or comments..."
          className="h-24"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}