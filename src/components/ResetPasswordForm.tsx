"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Lock, Eye, EyeOff, LoaderIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PasswordValidator } from "@/components/PasswordValidator";

export const resetPasswordSchema = z
  .object({
    otp: z.string().min(6, { message: "OTP must be 6 characters long" }),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  email: string;
  resetPasswordData: ResetPasswordFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOtpChange: (value: string) => void;
  handleResetPasswordSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof ResetPasswordFormData | "server", string>>;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  resetPasswordMutation: any;
}

export function ResetPasswordForm({
  email,
  resetPasswordData,
  handleInputChange,
  handleOtpChange,
  handleResetPasswordSubmit,
  errors,
  showPassword,
  togglePasswordVisibility,
  resetPasswordMutation,
}: ResetPasswordFormProps) {
  return (
    <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
      <div className="space-y-2 flex flex-col items-center">
        <div className="text-center text-sm text-muted-foreground m-2">
          <p>
            Verification code is sent to the email {email}, enter the
            verification code below
          </p>
        </div>
        <InputOTP
          maxLength={6}
          value={resetPasswordData.otp}
          onChange={handleOtpChange}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {errors.otp && (
          <p className="text-sm text-red-500">{errors.otp as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New Password"
            value={resetPasswordData.password}
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
            placeholder="Confirm New Password"
            value={resetPasswordData.confirmPassword}
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
          password={resetPasswordData.password}
          confirmPassword={resetPasswordData.confirmPassword}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={resetPasswordMutation.isPending}
      >
        {resetPasswordMutation.isPending ? (
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}
