import { z } from "zod";
import { UserStatus, RoleName } from "@/types/common.types"; // Import enums from schema types

/**
 * Schema for creating a new user.
 */
export const createUserDto = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  roleName: z.enum(RoleName).optional().default(RoleName.Authenticated),
});

/**
 * Schema for updating an existing user.
 */
export const updateUserDto = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  middleName: z.string().optional(),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  profileImage: z.string().optional(),
});

/**
 * Schema for filtering users.
 */
export const userFilterDto = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1)).default(1),
  limit: z.preprocess((val) => Number(val), z.number().min(1)).default(10),
  search: z.string().optional(),
  role: z.nativeEnum(RoleName).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

/**
 * Schema for assigning a role to a user.
 */
export const assignRoleDto = z.object({
  roleId: z.string().min(1, "Role ID is required"),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
export type UserFilterDto = z.infer<typeof userFilterDto>;
export type AssignRoleDto = z.infer<typeof assignRoleDto>;
