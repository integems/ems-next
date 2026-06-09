import { z } from "zod";

export const ContactDtoSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.email("Invalid email address").min(1, "Email is required"),
  subject: z.string().max(150).optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export type ContactDto = z.infer<typeof ContactDtoSchema>;
