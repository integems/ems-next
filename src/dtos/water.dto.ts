import { z } from "zod";
import { TimeOfDay, LocationType } from "../types/common.types";

export const waterSourceEnum = z.enum([
  "surface",
  "underground",
]);

export const singleWaterData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  waterSource: waterSourceEnum.optional(),
  ph: z.number().optional(),
  phMv: z.number().optional(),
  orp: z.number().optional(),
  ec: z.number().optional(),
  ecAbs: z.number().optional(),
  resistivity: z.number().optional(),
  salinity: z.number().optional(),
  pressure: z.number().optional(),
  doPercent: z.number().optional(),
  dissolvedOxygen: z.number().optional(),
  turbidity: z.number().optional(),
  bod: z.number().optional(),
  cod: z.number().optional(),
  totalDissolvedSolids: z.number().optional(),
  temperature: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createWaterDataDto = z.array(singleWaterData);

export const updateWaterDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  waterSource: waterSourceEnum.optional(),
  ph: z.number().optional(),
  phMv: z.number().optional(),
  orp: z.number().optional(),
  ec: z.number().optional(),
  ecAbs: z.number().optional(),
  resistivity: z.number().optional(),
  salinity: z.number().optional(),
  pressure: z.number().optional(),
  doPercent: z.number().optional(),
  dissolvedOxygen: z.number().optional(),
  turbidity: z.number().optional(),
  bod: z.number().optional(),
  cod: z.number().optional(),
  totalDissolvedSolids: z.number().optional(),
  temperature: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const waterDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  waterSource: waterSourceEnum.optional(),
});

export type CreateWaterDataDto = z.infer<typeof createWaterDataDto>;
export type UpdateWaterDataDto = z.infer<typeof updateWaterDataDto>;
export type WaterDataFilterDto = z.infer<typeof waterDataFilterDto>;