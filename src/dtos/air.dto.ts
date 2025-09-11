import { number, z } from "zod";
import { TimeOfDay, LocationType } from "../types/common.types";

export const singleAirData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  pm25: z.number().optional(),
  pm10: z.number().optional(),
  no2: z.number().optional(),
  o3: z.number().optional(),
  co: z.number().optional(),
  so2: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createAirDataDto = z.array(singleAirData);

export const updateAirDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  measurementTime: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
  pm25: z.number().optional(),
  pm10: z.number().optional(),
  no2: z.number().optional(),
  o3: z.number().optional(),
  co: z.number().optional(),
  so2: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const airDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
});

export type CreateAirDataDto = z.infer<typeof createAirDataDto>;
export type UpdateAirDataDto = z.infer<typeof updateAirDataDto>;
export type AirDataFilterDto = z.infer<typeof airDataFilterDto>;
