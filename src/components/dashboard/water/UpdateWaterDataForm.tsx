"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendWaterService } from "@/frontend-services/water.service";
import { useAuth } from "@/hooks/use-auth";
import { WaterData } from "@/types/common.types";
import { updateWaterDataDto, UpdateWaterDataDto } from "@/dtos/water.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";

const waterService = new FrontendWaterService();

interface UpdateWaterDataFormProps {
  onClose: () => void;
  data: WaterData;
}

type UpdateWaterDataFormData = z.infer<typeof updateWaterDataDto>;

export default function UpdateWaterDataForm({ onClose, data }: UpdateWaterDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateWaterDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        ph: data.ph as number || undefined,
        temperature: data.temperature as number || undefined,
        turbidity: data.turbidity as number || undefined,
        dissolvedOxygen: data.dissolvedOxygen as number || undefined,
        bod: data.bod as number || undefined,
        cod: data.cod as number || undefined,
        totalDissolvedSolids: data.totalDissolvedSolids as number || undefined,
        conductivity: data.conductivity as number || undefined,
        notes: data.notes || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateWaterDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return waterService.updateWaterData(currentUser.token, data.waterDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Water data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["water-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update water data")
      setErrors({ server: "Failed to update water data" });
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
            <Label className="text-sm">Turbidity (NTU)</Label>
            <Input
              type="number"
              name="turbidity"
              value={formData.turbidity as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.turbidity && <p className="text-xs text-red-500">{Array.isArray(errors.turbidity) ? errors.turbidity[0] : errors.turbidity}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Dissolved Oxygen (mg/L)</Label>
            <Input
              type="number"
              name="dissolvedOxygen"
              value={formData.dissolvedOxygen as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.dissolvedOxygen && <p className="text-xs text-red-500">{Array.isArray(errors.dissolvedOxygen) ? errors.dissolvedOxygen[0] : errors.dissolvedOxygen}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">BOD (mg/L)</Label>
            <Input
              type="number"
              name="bod"
              value={formData.bod as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.bod && <p className="text-xs text-red-500">{Array.isArray(errors.bod) ? errors.bod[0] : errors.bod}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">COD (mg/L)</Label>
            <Input
              type="number"
              name="cod"
              value={formData.cod as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.cod && <p className="text-xs text-red-500">{Array.isArray(errors.cod) ? errors.cod[0] : errors.cod}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Total Dissolved Solids (mg/L)</Label>
            <Input
              type="number"
              name="totalDissolvedSolids"
              value={formData.totalDissolvedSolids as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.totalDissolvedSolids && <p className="text-xs text-red-500">{Array.isArray(errors.totalDissolvedSolids) ? errors.totalDissolvedSolids[0] : errors.totalDissolvedSolids}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Conductivity (μS/cm)</Label>
            <Input
              type="number"
              name="conductivity"
              value={formData.conductivity as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.conductivity && <p className="text-xs text-red-500">{Array.isArray(errors.conductivity) ? errors.conductivity[0] : errors.conductivity}</p>}
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
