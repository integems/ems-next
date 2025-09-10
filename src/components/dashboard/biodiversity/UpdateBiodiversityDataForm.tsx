"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { useAuth } from "@/hooks/use-auth";
import { BiodiversityData, TimeOfDay, LocationType } from "@/types/common.types";
import { updateBiodiversityDataDto, UpdateBiodiversityDataDto } from "@/dtos/biodiversity.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const biodiversityService = new FrontendBiodiversityService();

interface UpdateBiodiversityDataFormProps {
  onClose: () => void;
  data: BiodiversityData;
}

type UpdateBiodiversityDataFormData = z.infer<typeof updateBiodiversityDataDto>;

export default function UpdateBiodiversityDataForm({ onClose, data }: UpdateBiodiversityDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateBiodiversityDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        speciesCount: data.speciesCount as number || undefined,
        shannonIndex: data.shannonIndex as number || undefined,
        notes: data.notes || undefined,
        timeOfDay: data.timeOfDay || undefined,
        locationType: data.locationType || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateBiodiversityDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return biodiversityService.updateBiodiversityData(currentUser.token, data.biodiversityDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Biodiversity data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["biodiversity-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update biodiversity data")
      setErrors({ server: "Failed to update biodiversity data" });
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
        <Label className="text-base font-medium">Measurements</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Species Count</Label>
            <Input
              type="number"
              name="speciesCount"
              value={formData.speciesCount as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.speciesCount && <p className="text-xs text-red-500">{Array.isArray(errors.speciesCount) ? errors.speciesCount[0] : errors.speciesCount}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Shannon Index</Label>
            <Input
              type="number"
              name="shannonIndex"
              value={formData.shannonIndex as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.shannonIndex && <p className="text-xs text-red-500">{Array.isArray(errors.shannonIndex) ? errors.shannonIndex[0] : errors.shannonIndex}</p>}
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
