"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendNoiseService } from "@/frontend-services/noise.service";
import { useAuth } from "@/hooks/use-auth";
import { NoiseData } from "@/types/common.types";
import { updateNoiseDataDto, UpdateNoiseDataDto } from "@/dtos/noise.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";

const noiseService = new FrontendNoiseService();

interface UpdateNoiseDataFormProps {
  onClose: () => void;
  data: NoiseData;
}

type UpdateNoiseDataFormData = z.infer<typeof updateNoiseDataDto>;

export default function UpdateNoiseDataForm({ onClose, data }: UpdateNoiseDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateNoiseDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        dbA: data.dbA as number || undefined,
        dbC: data.dbC as number || undefined,
        peak: data.peak as number || undefined,
        frequency: data.frequency as number || undefined,
        notes: data.notes || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateNoiseDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return noiseService.updateNoiseData(currentUser.token, data.noiseDataId, updatedData);
    },
    onSuccess: () => {
      toast.success("Noise data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["noise-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update noise data")
      setErrors({ server: "Failed to update noise data" });
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
            <Label className="text-sm">dbA</Label>
            <Input
              type="number"
              name="dbA"
              value={formData.dbA as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.dbA && <p className="text-xs text-red-500">{Array.isArray(errors.dbA) ? errors.dbA[0] : errors.dbA}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">dbC</Label>
            <Input
              type="number"
              name="dbC"
              value={formData.dbC as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.dbC && <p className="text-xs text-red-500">{Array.isArray(errors.dbC) ? errors.dbC[0] : errors.dbC}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Peak</Label>
            <Input
              type="number"
              name="peak"
              value={formData.peak as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.peak && <p className="text-xs text-red-500">{Array.isArray(errors.peak) ? errors.peak[0] : errors.peak}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Frequency (Hz)</Label>
            <Input
              type="number"
              name="frequency"
              value={formData.frequency as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.frequency && <p className="text-xs text-red-500">{Array.isArray(errors.frequency) ? errors.frequency[0] : errors.frequency}</p>}
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
