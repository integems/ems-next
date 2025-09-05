"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendSoilService } from "@/frontend-services/soil.service";
import { useAuth } from "@/hooks/use-auth";
import { SoilData } from "@/types/common.types";
import { updateSoilDataDto, UpdateSoilDataDto } from "@/dtos/soil.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";

const soilService = new FrontendSoilService();

interface UpdateSoilDataFormProps {
  onClose: () => void;
  data: SoilData;
}

type UpdateSoilDataFormData = z.infer<typeof updateSoilDataDto>;

export default function UpdateSoilDataForm({ onClose, data }: UpdateSoilDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateSoilDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        ph: data.ph as number || undefined,
        nitrogen: data.nitrogen as number || undefined,
        phosphorus: data.phosphorus as number || undefined,
        potassium: data.potassium as number || undefined,
        organicMatter: data.organicMatter as number || undefined,
        moisture: data.moisture as number || undefined,
        notes: data.notes || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateSoilDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return soilService.updateSoilData(currentUser.token, data.soilDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Soil data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["soil-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update soil data")
      setErrors({ server: "Failed to update soil data" });
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
            <Label className="text-sm">pH Level</Label>
            <Input
              type="number"
              name="ph"
              value={formData.ph as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.ph && <p className="text-xs text-red-500">{Array.isArray(errors.ph) ? errors.ph[0] : errors.ph}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Moisture Level (%)</Label>
            <Input
              type="number"
              name="moisture"
              value={formData.moisture as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.moisture && <p className="text-xs text-red-500">{Array.isArray(errors.moisture) ? errors.moisture[0] : errors.moisture}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Nitrogen Level (ppm)</Label>
            <Input
              type="number"
              name="nitrogen"
              value={formData.nitrogen as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.nitrogen && <p className="text-xs text-red-500">{Array.isArray(errors.nitrogen) ? errors.nitrogen[0] : errors.nitrogen}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Phosphorus Level (ppm)</Label>
            <Input
              type="number"
              name="phosphorus"
              value={formData.phosphorus as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.phosphorus && <p className="text-xs text-red-500">{Array.isArray(errors.phosphorus) ? errors.phosphorus[0] : errors.phosphorus}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Potassium Level (ppm)</Label>
            <Input
              type="number"
              name="potassium"
              value={formData.potassium as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.potassium && <p className="text-xs text-red-500">{Array.isArray(errors.potassium) ? errors.potassium[0] : errors.potassium}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Organic Matter (%)</Label>
            <Input
              type="number"
              name="organicMatter"
              value={formData.organicMatter as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.organicMatter && <p className="text-xs text-red-500">{Array.isArray(errors.organicMatter) ? errors.organicMatter[0] : errors.organicMatter}</p>}
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
