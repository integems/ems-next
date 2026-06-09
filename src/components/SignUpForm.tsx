"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, LoaderIcon } from "lucide-react";
import { PasswordValidator } from "@/components/PasswordValidator";

export const signUpSchema = z
  .object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  signUpData: SignUpFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignUpSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof SignUpFormData | "server", string>>;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  signUpMutation: any;
}

export function SignUpForm({
  signUpData,
  handleInputChange,
  handleSignUpSubmit,
  errors,
  showPassword,
  togglePasswordVisibility,
  signUpMutation,
}: SignUpFormProps) {
  return (
    <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <div className="relative flex items-center">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="firstName"
              type="text"
              name="firstName"
              placeholder="Jane"
              value={signUpData.firstName}
              onChange={handleInputChange}
              aria-invalid={!!errors.firstName}
              className="h-11 w-full pl-10"
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName as string}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <div className="relative flex items-center">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lastName"
              type="text"
              name="lastName"
              placeholder="Doe"
              value={signUpData.lastName}
              onChange={handleInputChange}
              aria-invalid={!!errors.lastName}
              className="h-11 w-full pl-10"
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName as string}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="middleName">
          Middle name <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative flex items-center">
          <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="middleName"
            type="text"
            name="middleName"
            placeholder="Middle name"
            value={signUpData.middleName}
            onChange={handleInputChange}
            className="h-11 w-full pl-10"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative flex items-center">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={signUpData.email}
            onChange={handleInputChange}
            aria-invalid={!!errors.email}
            className="h-11 w-full pl-10"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email as string}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative flex items-center">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password"
            value={signUpData.password}
            onChange={handleInputChange}
            aria-invalid={!!errors.password}
            className="h-11 w-full pl-10 pr-11"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password as string}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative flex items-center">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={signUpData.confirmPassword}
            onChange={handleInputChange}
            aria-invalid={!!errors.confirmPassword}
            className="h-11 w-full pl-10 pr-11"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword as string}
          </p>
        )}
      </div>
      <PasswordValidator
        password={signUpData.password}
        confirmPassword={signUpData.confirmPassword}
      />
      <Button
        type="submit"
        className="h-11 w-full text-base"
        disabled={signUpMutation.isPending}
      >
        {signUpMutation.isPending ? (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
