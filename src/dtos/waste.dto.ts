import { z } from "zod";

export const singleWasteData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date(),
  solidWasteKg: z.number().optional(),
  hazardousWasteKg: z.number().optional(),
  recycledWasteKg: z.number().optional(),
  organicWasteKg: z.number().optional(),
  plasticWasteKg: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createWasteDataDto = z.array(singleWasteData);

export const updateWasteDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date().optional(),
  solidWasteKg: z.number().optional(),
  hazardousWasteKg: z.number().optional(),
  recycledWasteKg: z.number().optional(),
  organicWasteKg: z.number().optional(),
  plasticWasteKg: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const wasteDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateWasteDataDto = z.infer<typeof createWasteDataDto>;
export type UpdateWasteDataDto = z.infer<typeof updateWasteDataDto>;
export type WasteDataFilterDto = z.infer<typeof wasteDataFilterDto>;