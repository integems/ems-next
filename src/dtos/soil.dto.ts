import { z } from "zod";

export const singleSoilData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date(),
  ph: z.number().optional(),
  nitrogen: z.number().optional(),
  phosphorus: z.number().optional(),
  potassium: z.number().optional(),
  organicMatter: z.number().optional(),
  moisture: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createSoilDataDto = z.array(singleSoilData);

export const updateSoilDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date().optional(),
  ph: z.number().optional(),
  nitrogen: z.number().optional(),
  phosphorus: z.number().optional(),
  potassium: z.number().optional(),
  organicMatter: z.number().optional(),
  moisture: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const soilDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateSoilDataDto = z.infer<typeof createSoilDataDto>;
export type UpdateSoilDataDto = z.infer<typeof updateSoilDataDto>;
export type SoilDataFilterDto = z.infer<typeof soilDataFilterDto>;