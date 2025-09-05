import { z } from "zod";

export const singleNoiseData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date(),
  dbA: z.number().optional(),
  dbC: z.number().optional(),
  peak: z.number().optional(),
  frequency: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createNoiseDataDto = z.array(singleNoiseData);

export const updateNoiseDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date().optional(),
  dbA: z.number().optional(),
  dbC: z.number().optional(),
  peak: z.number().optional(),
  frequency: z.number().optional(),
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
});

export type CreateNoiseDataDto = z.infer<typeof createNoiseDataDto>;
export type UpdateNoiseDataDto = z.infer<typeof updateNoiseDataDto>;
export type NoiseDataFilterDto = z.infer<typeof noiseDataFilterDto>;