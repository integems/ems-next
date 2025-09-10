import { z } from "zod";
import { TimeOfDay, LocationType } from "../types/common.types";

export const singleNoiseData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  duration: z.string().optional(), // Assuming duration is sent as string like '2 hours'
  laeq: z.number().optional(),
  lafMax: z.number().optional(),
  frequency: z.number().optional(),
  la10: z.number().optional(),
  la90: z.number().optional(),
  lafMin: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createNoiseDataDto = z.array(singleNoiseData);

export const updateNoiseDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  duration: z.string().optional(), // Assuming duration is sent as string like '2 hours'
  laeq: z.number().optional(),
  lafMax: z.number().optional(),
  frequency: z.number().optional(),
  la10: z.number().optional(),
  la90: z.number().optional(),
  lafMin: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const noiseDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
});

export type CreateNoiseDataDto = z.infer<typeof createNoiseDataDto>;
export type UpdateNoiseDataDto = z.infer<typeof updateNoiseDataDto>;
export type NoiseDataFilterDto = z.infer<typeof noiseDataFilterDto>;