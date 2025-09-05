"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendWasteService } from "@/frontend-services/waste.service";
import { useAuth } from "@/hooks/use-auth";
import { WasteData } from "@/types/common.types";
import { updateWasteDataDto, UpdateWasteDataDto } from "@/dtos/waste.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";

const wasteService = new FrontendWasteService();

interface UpdateWasteDataFormProps {
  onClose: () => void;
  data: WasteData;
}

type UpdateWasteDataFormData = z.infer<typeof updateWasteDataDto>;

export default function UpdateWasteDataForm({ onClose, data }: UpdateWasteDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateWasteDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        solidWasteKg: data.solidWasteKg as number || undefined,
        hazardousWasteKg: data.hazardousWasteKg as number || undefined,
        recycledWasteKg: data.recycledWasteKg as number || undefined,
        organicWasteKg: data.organicWasteKg as number || undefined,
        plasticWasteKg: data.plasticWasteKg as number || undefined,
        notes: data.notes || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateWasteDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return wasteService.updateWasteData(currentUser.token, data.wasteDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Waste data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["waste-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update waste data")
      setErrors({ server: "Failed to update waste data" });
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
            <Label className="text-sm">Solid Waste (kg)</Label>
            <Input
              type="number"
              name="solidWasteKg"
              value={formData.solidWasteKg as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.solidWasteKg && <p className="text-xs text-red-500">{Array.isArray(errors.solidWasteKg) ? errors.solidWasteKg[0] : errors.solidWasteKg}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Hazardous Waste (kg)</Label>
            <Input
              type="number"
              name="hazardousWasteKg"
              value={formData.hazardousWasteKg as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.hazardousWasteKg && <p className="text-xs text-red-500">{Array.isArray(errors.hazardousWasteKg) ? errors.hazardousWasteKg[0] : errors.hazardousWasteKg}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Recycled Waste (kg)</Label>
            <Input
              type="number"
              name="recycledWasteKg"
              value={formData.recycledWasteKg as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.recycledWasteKg && <p className="text-xs text-red-500">{Array.isArray(errors.recycledWasteKg) ? errors.recycledWasteKg[0] : errors.recycledWasteKg}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Organic Waste (kg)</Label>
            <Input
              type="number"
              name="organicWasteKg"
              value={formData.organicWasteKg as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.organicWasteKg && <p className="text-xs text-red-500">{Array.isArray(errors.organicWasteKg) ? errors.organicWasteKg[0] : errors.organicWasteKg}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Plastic Waste (kg)</Label>
            <Input
              type="number"
              name="plasticWasteKg"
              value={formData.plasticWasteKg as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.plasticWasteKg && <p className="text-xs text-red-500">{Array.isArray(errors.plasticWasteKg) ? errors.plasticWasteKg[0] : errors.plasticWasteKg}</p>}
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
