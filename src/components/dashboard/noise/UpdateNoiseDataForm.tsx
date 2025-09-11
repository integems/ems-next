"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { useAuth } from "@/hooks/use-auth";
import { NoiseData, TimeOfDay, LocationType } from "@/types/common.types";
import { updateNoiseDataDto } from "@/dtos/noise.dto";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const noiseService = new FrontendNoiseService();

interface UpdateNoiseDataFormProps {
  onClose: () => void;
  data: NoiseData;
}

type UpdateNoiseDataFormData = z.infer<typeof updateNoiseDataDto>;

export default function UpdateNoiseDataForm({
  onClose,
  data,
}: UpdateNoiseDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateNoiseDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        locationId: data.locationId || undefined,
        pointGeom: data.pointGeom || undefined,
        measurementTime: data.measurementTime
          ? new Date(data.measurementTime)
          : undefined,
        timeOfDay: data.timeOfDay || undefined,
        locationType: data.locationType || undefined,
        duration: data.duration || undefined,
        laeq: (data.laeq as number) || undefined,
        lafMax: (data.lafMax as number) || undefined,
        frequency: (data.frequency as number) || undefined,
        la10: (data.la10 as number) || undefined,
        la90: (data.la90 as number) || undefined,
        lafMin: (data.lafMin as number) || undefined,
        notes: data.notes || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateNoiseDataFormData) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return noiseService.updateNoiseData(
        currentUser.token,
        data.noiseDataId,
        updatedData,
      );
    },
    onSuccess: () => {
      toast.success("Noise data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["noise-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to update noise data");
      setErrors({ server: "Failed to update noise data" });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
    setErrors((prev: any) => ({
      ...prev,
      [name]: undefined,
      server: undefined,
    }));
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
            <p className="text-xs text-red-500">
              {Array.isArray(errors.measurementTime)
                ? errors.measurementTime[0]
                : errors.measurementTime}
            </p>
          )}
        </div>
        <div></div>
      </div>
      <div className="space-y-4">
        <Label className="text-base font-medium">Noise Measurements</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">LAeq (dB)</Label>
            <Input
              type="number"
              name="laeq"
              value={formData.laeq || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.laeq && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.laeq) ? errors.laeq[0] : errors.laeq}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">LAFMax (dB)</Label>
            <Input
              type="number"
              name="lafMax"
              value={formData.lafMax || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.lafMax && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.lafMax)
                  ? errors.lafMax[0]
                  : errors.lafMax}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Frequency (Hz)</Label>
            <Input
              type="number"
              name="frequency"
              value={formData.frequency || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.frequency && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.frequency)
                  ? errors.frequency[0]
                  : errors.frequency}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">LA10 (dB)</Label>
            <Input
              type="number"
              name="la10"
              value={formData.la10 || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.la10 && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.la10) ? errors.la10[0] : errors.la10}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">LA90 (dB)</Label>
            <Input
              type="number"
              name="la90"
              value={formData.la90 || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.la90 && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.la90) ? errors.la90[0] : errors.la90}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">LAFMin (dB)</Label>
            <Input
              type="number"
              name="lafMin"
              value={formData.lafMin || ""}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.lafMin && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.lafMin)
                  ? errors.lafMin[0]
                  : errors.lafMin}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Duration</Label>
            <Input
              type="text"
              name="duration"
              value={formData.duration || ""}
              onChange={handleChange}
              placeholder="e.g., 2 hours"
            />
            {errors.duration && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.duration)
                  ? errors.duration[0]
                  : errors.duration}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            {errors.timeOfDay && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.timeOfDay)
                  ? errors.timeOfDay[0]
                  : errors.timeOfDay}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Location Type</Label>
            <Select
              value={formData.locationType || ""}
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
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.locationType && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.locationType)
                  ? errors.locationType[0]
                  : errors.locationType}
              </p>
            )}
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
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
