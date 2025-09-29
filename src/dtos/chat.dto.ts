import { z } from "zod";

export const ChatFilterSchema = z.object({
  search: z.string().optional(),
  locationIds: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeOfDay: z.enum(["day", "evening", "night"]).optional(),
  locationType: z
    .enum(["industrial", "residential", "commercial", "rural"])
    .optional(),
});

export type ChatFilterDto = z.infer<typeof ChatFilterSchema>;
