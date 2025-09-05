"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Loader2 } from "lucide-react";

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  forgotPasswordData: ForgotPasswordFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleForgotPasswordSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof ForgotPasswordFormData | "server", string>>;
  forgotPasswordMutation: any;
}

export function ForgotPasswordForm({
  forgotPasswordData,
  handleInputChange,
  handleForgotPasswordSubmit,
  errors,
  forgotPasswordMutation,
}: ForgotPasswordFormProps) {
  return (
    <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="text-center text-sm text-muted-foreground m-2">
          <p>Enter the email address you used to create your account</p>
        </div>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={forgotPasswordData.email}
            onChange={handleInputChange}
            className={cn("w-full pl-10", errors.email && "border-red-500")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email as string}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}
