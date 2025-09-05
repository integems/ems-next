import { UserStatus } from "@/types/common.types";
import { z } from "zod";

export const SignUpDtoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  fullName: z.string().min(1, "Full name is required"),
  profileImage: z.string().optional(),
  phoneNumber: z.string().optional(),
  status: z.enum(UserStatus).optional(),
  password: z.string().min(1, "Password is required"),
  gender: z.string().optional(),
  email: z.email("Invalid email address").min(1, "Email is required"),
  verified: z.boolean().optional().default(false),
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;

export const SignInDtoSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;

export const VerifyOtpDtoSchema = z.object({
  otp: z.string().min(6, "6 digits OTP is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpDtoSchema>;

export const ResendOtpDtoSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export type ResendOtpDto = z.infer<typeof ResendOtpDtoSchema>;

export const ForgotPasswordDtoSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

export const NewPasswordDtoSchema = z.object({
  otp: z.string().min(1, "OTP is required"),
  newPassword: z.string().min(1, "New password is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export type NewPasswordDto = z.infer<typeof NewPasswordDtoSchema>;

export const OAuthDtoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  profileImage: z.string().optional(),
});

export type OAuthDto = z.infer<typeof OAuthDtoSchema>;
