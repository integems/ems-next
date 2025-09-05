"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendBiodiversityService } from "@/frontend-services/biodiversity.service";
import { useAuth } from "@/hooks/use-auth";
import { BiodiversityData } from "@/types/common.types";
import { updateBiodiversityDataDto, UpdateBiodiversityDataDto } from "@/dtos/biodiversity.dto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";

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
        species: data.species || undefined,
        abundance: data.abundance as number || undefined,
        habitat: data.habitat || undefined,
        speciesRichness: data.speciesRichness as number || undefined,
        shannonIndex: data.shannonIndex as number || undefined,
        simpsonIndex: data.simpsonIndex as number || undefined,
        notes: data.notes || undefined,
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
            <Label className="text-sm">Species</Label>
            <Input
              type="text"
              name="species"
              value={formData.species || ""}
              onChange={handleChange}
              placeholder="e.g. Quercus robur"
            />
            {errors.species && <p className="text-xs text-red-500">{Array.isArray(errors.species) ? errors.species[0] : errors.species}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Abundance</Label>
            <Input
              type="number"
              name="abundance"
              value={formData.abundance as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.abundance && <p className="text-xs text-red-500">{Array.isArray(errors.abundance) ? errors.abundance[0] : errors.abundance}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Habitat</Label>
            <Input
              type="text"
              name="habitat"
              value={formData.habitat || ""}
              onChange={handleChange}
              placeholder="e.g. Forest"
            />
            {errors.habitat && <p className="text-xs text-red-500">{Array.isArray(errors.habitat) ? errors.habitat[0] : errors.habitat}</p>}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Species Richness</Label>
            <Input
              type="number"
              name="speciesRichness"
              value={formData.speciesRichness as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.speciesRichness && <p className="text-xs text-red-500">{Array.isArray(errors.speciesRichness) ? errors.speciesRichness[0] : errors.speciesRichness}</p>}
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
            <Label className="text-sm">Simpson Index</Label>
            <Input
              type="number"
              name="simpsonIndex"
              value={formData.simpsonIndex as number || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.simpsonIndex && <p className="text-xs text-red-500">{Array.isArray(errors.simpsonIndex) ? errors.simpsonIndex[0] : errors.simpsonIndex}</p>}
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
