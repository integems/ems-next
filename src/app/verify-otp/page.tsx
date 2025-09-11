"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FrontendAuthService } from "@/frontend-services/auth.service";
import { Mail, Key, LoaderIcon } from "lucide-react";
import { VerifyOtpDto } from "@/dtos/auth.dto";

const verifyOtpSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  otp: z.string().min(6, { message: "OTP must be 6 characters long" }),
});

const authService = new FrontendAuthService();

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtpPage() {
  const [formData, setFormData] = useState<VerifyOtpFormData>({
    email: "",
    otp: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof VerifyOtpFormData | "server", string>>
  >({});
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: () => {
      router.push("/signin");
    },
    onError: (error: any) => {
      setErrors({ server: error.message });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: authService.resendOtp,
    onSuccess: () => {
      // Optionally show a success message to the user
    },
    onError: (error: any) => {
      setErrors({ server: error.message });
    },
  });

  const handleResendOtp = () => {
    setErrors({});
    const result = verifyOtpSchema.pick({ email: true }).safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
      });
      return;
    }
    resendOtpMutation.mutate({ email: formData.email });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = verifyOtpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0],
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleOtpChange = (value: string) => {
    setFormData((prev) => ({ ...prev, otp: value }));
    setErrors((prev) => ({ ...prev, otp: undefined }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and the OTP you received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errors.server && (
              <p className="text-sm text-red-500">{errors.server}</p>
            )}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full pl-10",
                    errors.email && "border-red-500",
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <InputOTP
                maxLength={6}
                value={formData.otp}
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
                <p className="text-sm text-red-500">{errors.otp}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive an OTP?{" "}
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  className="px-0"
                  disabled={resendOtpMutation.isPending}
                >
                  {resendOtpMutation.isPending ? (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
