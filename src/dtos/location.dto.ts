import { z } from "zod";
import { LocationType, Category } from "../types/common.types";

export const createLocationDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  geom: z.string().optional(), // WKT string for polygon
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  altitude: z.number().optional(),
  category: z.enum(Category).optional(),
  locationType: z.enum(LocationType).optional(),
});

export const updateLocationDto = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  geom: z.string().optional(), // WKT string for polygon
  pointGeom: z.tuple([z.number(), z.number()]).optional(),
  altitude: z.number().optional(),
  category: z.enum(Category).optional(),
  locationType: z.enum(LocationType).optional(),
});

export const locationFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  category: z.enum(Category).optional(),
});

export type CreateLocationDto = z.infer<typeof createLocationDto>;
export type UpdateLocationDto = z.infer<typeof updateLocationDto>;
export type LocationFilterDto = z.infer<typeof locationFilterDto>;
