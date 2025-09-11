"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="relative flex items-center">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={signUpData.firstName}
            onChange={handleInputChange}
            className={cn("w-full pl-10", errors.firstName && "border-red-500")}
          />
        </div>
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            name="middleName"
            placeholder="Middle Name (Optional)"
            value={signUpData.middleName}
            onChange={handleInputChange}
            className={cn("w-full pl-10")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={signUpData.lastName}
            onChange={handleInputChange}
            className={cn("w-full pl-10", errors.lastName && "border-red-500")}
          />
        </div>
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={signUpData.email}
            onChange={handleInputChange}
            className={cn("w-full pl-10", errors.email && "border-red-500")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={signUpData.password}
            onChange={handleInputChange}
            className={cn("w-full pl-10", errors.password && "border-red-500")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={signUpData.confirmPassword}
            onChange={handleInputChange}
            className={cn(
              "w-full pl-10",
              errors.confirmPassword && "border-red-500",
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword as string}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <PasswordValidator
          password={signUpData.password}
          confirmPassword={signUpData.confirmPassword}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={signUpMutation.isPending}
      >
        {signUpMutation.isPending ? (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Sign up"
        )}
      </Button>
    </form>
  );
}
