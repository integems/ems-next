import { z } from "zod";

export const singleBiodiversityData = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date(),
  species: z.string().optional(),
  abundance: z.number().int().optional(),
  habitat: z.string().optional(),
  speciesRichness: z.number().int().optional(),
  shannonIndex: z.number().optional(),
  simpsonIndex: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const createBiodiversityDataDto = z.array(singleBiodiversityData);

export const updateBiodiversityDataDto = z.object({
  locationId: z.string().optional(),
  pointGeom: z.tuple([z.number(),z.number()]).optional(),
  measurementTime: z.date().optional(),
  species: z.string().optional(),
  abundance: z.number().int().optional(),
  habitat: z.string().optional(),
  speciesRichness: z.number().int().optional(),
  shannonIndex: z.number().optional(),
  simpsonIndex: z.number().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export const biodiversityDataFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).optional(),
  search: z.string().optional(),
  locationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateBiodiversityDataDto = z.infer<
  typeof createBiodiversityDataDto
>;
export type UpdateBiodiversityDataDto = z.infer<
  typeof updateBiodiversityDataDto
>;
export type BiodiversityDataFilterDto = z.infer<
  typeof biodiversityDataFilterDto
>;