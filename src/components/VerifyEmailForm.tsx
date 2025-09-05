"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const verifyEmailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  otp: z.string().min(6, { message: "OTP must be 6 characters long" }),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

interface VerifyEmailFormProps {
  verifyEmailData: VerifyEmailFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOtpChange: (value: string) => void;
  handleVerifyEmailSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof VerifyEmailFormData | "server", string>>;
  verifyEmailMutation: any;
  resendOtpMutation: any;
}

export function VerifyEmailForm({
  verifyEmailData,
  handleInputChange,
  handleOtpChange,
  handleVerifyEmailSubmit,
  errors,
  verifyEmailMutation,
  resendOtpMutation,
}: VerifyEmailFormProps) {
  return (
    <form onSubmit={handleVerifyEmailSubmit} className="flex flex-col gap-4">
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Verification code is sent to the email {verifyEmailData.email}, enter
          the verification code below
        </p>
      </div>
      <div className="space-y-2 flex flex-col items-center">
        <InputOTP
          maxLength={6}
          value={verifyEmailData.otp}
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
      <Button
        type="submit"
        className="w-full"
        disabled={verifyEmailMutation.isPending}
      >
        {verifyEmailMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Verify Email"
        )}
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive an OTP?{" "}
          <Button
            variant="link"
            onClick={() =>
              resendOtpMutation.mutate({ email: verifyEmailData.email })
            }
            className="px-0"
            disabled={resendOtpMutation.isPending}
          >
            {resendOtpMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Resend OTP"
            )}
          </Button>
        </p>
      </div>
    </form>
  );
}
