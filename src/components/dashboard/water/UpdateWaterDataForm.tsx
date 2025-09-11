"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FrontendWaterService } from "@/frontend-services/water.service";
import { useAuth } from "@/hooks/use-auth";
import {
  WaterData,
  TimeOfDay,
  LocationType,
  WaterSource,
} from "@/types/common.types";
import { updateWaterDataDto, UpdateWaterDataDto } from "@/dtos/water.dto";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const waterService = new FrontendWaterService();

interface UpdateWaterDataFormProps {
  onClose: () => void;
  data: WaterData;
}

type UpdateWaterDataFormData = z.infer<typeof updateWaterDataDto>;

export default function UpdateWaterDataForm({
  onClose,
  data,
}: UpdateWaterDataFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateWaterDataFormData>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData({
        measurementTime: new Date(data.measurementTime),
        ph: (data.ph as number) || undefined,
        phMv: (data.phMv as number) || undefined,
        orp: (data.orp as number) || undefined,
        ec: (data.ec as number) || undefined,
        ecAbs: (data.ecAbs as number) || undefined,
        resistivity: (data.resistivity as number) || undefined,
        salinity: (data.salinity as number) || undefined,
        pressure: (data.pressure as number) || undefined,
        doPercent: (data.doPercent as number) || undefined,
        dissolvedOxygen: (data.dissolvedOxygen as number) || undefined,
        turbidity: (data.turbidity as number) || undefined,
        bod: (data.bod as number) || undefined,
        cod: (data.cod as number) || undefined,
        totalDissolvedSolids:
          (data.totalDissolvedSolids as number) || undefined,
        temperature: (data.temperature as number) || undefined,
        waterSource: data.waterSource || undefined,
        notes: data.notes || undefined,
        timeOfDay: data.timeOfDay || undefined,
        locationType: data.locationType || undefined,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: UpdateWaterDataDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return waterService.updateWaterData(
        currentUser.token,
        data.waterDataId,
        updatedData,
      );
    },
    onSuccess: () => {
      toast.success("Water data updated successfully");
      queryClient.invalidateQueries({ queryKey: ["water-data"] });
      onClose();
    },
    onError: (error: any) => {
      toast("Failed to update water data");
      setErrors({ server: "Failed to update water data" });
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
        <Label className="text-base font-medium">Primary Measurements</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">pH</Label>
            <Input
              type="number"
              name="ph"
              value={(formData.ph as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.ph && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.ph) ? errors.ph[0] : errors.ph}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">pH (mV)</Label>
            <Input
              type="number"
              name="phMv"
              value={(formData.phMv as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.phMv && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.phMv) ? errors.phMv[0] : errors.phMv}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">ORP (mV)</Label>
            <Input
              type="number"
              name="orp"
              value={(formData.orp as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.orp && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.orp) ? errors.orp[0] : errors.orp}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">EC (µS/cm)</Label>
            <Input
              type="number"
              name="ec"
              value={(formData.ec as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.ec && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.ec) ? errors.ec[0] : errors.ec}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">EC Abs. (µS/cm)</Label>
            <Input
              type="number"
              name="ecAbs"
              value={(formData.ecAbs as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.ecAbs && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.ecAbs) ? errors.ecAbs[0] : errors.ecAbs}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Resistivity (Ohm-cm)</Label>
            <Input
              type="number"
              name="resistivity"
              value={(formData.resistivity as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.resistivity && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.resistivity)
                  ? errors.resistivity[0]
                  : errors.resistivity}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Salinity (psu)</Label>
            <Input
              type="number"
              name="salinity"
              value={(formData.salinity as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.salinity && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.salinity)
                  ? errors.salinity[0]
                  : errors.salinity}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Pressure (psi)</Label>
            <Input
              type="number"
              name="pressure"
              value={(formData.pressure as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.pressure && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.pressure)
                  ? errors.pressure[0]
                  : errors.pressure}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">D.O. (%)</Label>
            <Input
              type="number"
              name="doPercent"
              value={(formData.doPercent as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.doPercent && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.doPercent)
                  ? errors.doPercent[0]
                  : errors.doPercent}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">D.O. (ppm)</Label>
            <Input
              type="number"
              name="dissolvedOxygen"
              value={(formData.dissolvedOxygen as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.dissolvedOxygen && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.dissolvedOxygen)
                  ? errors.dissolvedOxygen[0]
                  : errors.dissolvedOxygen}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Turbidity (FNU)</Label>
            <Input
              type="number"
              name="turbidity"
              value={(formData.turbidity as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.turbidity && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.turbidity)
                  ? errors.turbidity[0]
                  : errors.turbidity}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">BOD (mg/L)</Label>
            <Input
              type="number"
              name="bod"
              value={(formData.bod as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.bod && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.bod) ? errors.bod[0] : errors.bod}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">COD (mg/L)</Label>
            <Input
              type="number"
              name="cod"
              value={(formData.cod as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.cod && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.cod) ? errors.cod[0] : errors.cod}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">TDS (ppm)</Label>
            <Input
              type="number"
              name="totalDissolvedSolids"
              value={(formData.totalDissolvedSolids as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.totalDissolvedSolids && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.totalDissolvedSolids)
                  ? errors.totalDissolvedSolids[0]
                  : errors.totalDissolvedSolids}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Temperature (°C)</Label>
            <Input
              type="number"
              name="temperature"
              value={(formData.temperature as number) || 0}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.temperature && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.temperature)
                  ? errors.temperature[0]
                  : errors.temperature}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Water Source</Label>
            <Select
              value={formData.waterSource || ""}
              onValueChange={(value: WaterSource) =>
                setFormData((prev) => ({ ...prev, waterSource: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surface">Surface</SelectItem>
                <SelectItem value="underground">Underground</SelectItem>
              </SelectContent>
            </Select>
            {errors.waterSource && (
              <p className="text-xs text-red-500">
                {Array.isArray(errors.waterSource)
                  ? errors.waterSource[0]
                  : errors.waterSource}
              </p>
            )}
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
