"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
} from "@/components/ui/stepper";
import { FrontendAuthService } from "@/frontend-services/auth.service";
import { ForgotPasswordDto, NewPasswordDto } from "@/dtos/auth.dto";
import { toast } from "sonner";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/components/ForgotPasswordForm";
import {
  ResetPasswordForm,
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/components/ResetPasswordForm";

const authService = new FrontendAuthService();

export default function PasswordRecoveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [stepOneCompleted, setStepOneCompleted] = useState<boolean>(false);
  const [forgotPasswordData, setForgotPasswordData] =
    useState<ForgotPasswordFormData>({ email: "" });
  const [resetPasswordData, setResetPasswordData] =
    useState<ResetPasswordFormData>({
      otp: searchParams.get("otp") || "",
      password: "",
      confirmPassword: "",
    });
  const [errors, setErrors] = useState<
    Partial<
      Record<
        keyof ForgotPasswordFormData | keyof ResetPasswordFormData | "server",
        string
      >
    >
  >({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("otp")) {
      setResetPasswordData((prev) => ({
        ...prev,
        otp: searchParams.get("otp") || "",
      }));
      setActiveStep(2); // Move to reset password step if OTP is in URL
    }
  }, [searchParams]);

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
    onSuccess: () => {
      toast.success("Password reset OTP sent to your email.");
      setActiveStep(2);
      setStepOneCompleted(true);
    },
    onError: (error: any) => {
      // console.error(error);
      toast.error("Couldn't send otp, please try again.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: NewPasswordDto) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Your password has been reset successfully.");
      router.push("/signin");
    },
    onError: (error: any) => {
      toast.error("Couldn't reset password, please try again.");
    },
  });

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = forgotPasswordSchema.safeParse(forgotPasswordData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
      });
      return;
    }

    forgotPasswordMutation.mutate(forgotPasswordData);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse(resetPasswordData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        otp: fieldErrors.otp?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    resetPasswordMutation.mutate({
      newPassword: resetPasswordData.password,
      otp: resetPasswordData.otp,
      email: forgotPasswordData.email,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeStep === 1) {
      setForgotPasswordData((prev) => ({ ...prev, [name]: value }));
    } else {
      setResetPasswordData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleOtpChange = (value: string) => {
    setResetPasswordData((prev) => ({ ...prev, otp: value }));
    setErrors((prev) => ({ ...prev, otp: undefined }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <div className="fixed top-10 left-0 right-0 z-50 p-4">
        <Stepper
          className="flex justify-center items-center gap-4"
          value={activeStep}
          onValueChange={setActiveStep}
        >
          <StepperItem
            disabled={forgotPasswordMutation.isPending}
            loading={forgotPasswordMutation.isPending}
            key={1}
            step={1}
          >
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Forgot Password</StepperTitle>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem
            disabled={!stepOneCompleted || resetPasswordMutation.isPending}
            loading={resetPasswordMutation.isPending}
            key={2}
            step={2}
          >
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Reset Password</StepperTitle>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
      </div>
      <Card className="w-full max-w-md mt-20">
        <CardHeader />
        <CardContent>
          {activeStep === 1 && (
            <ForgotPasswordForm
              forgotPasswordData={forgotPasswordData}
              handleInputChange={handleInputChange}
              handleForgotPasswordSubmit={handleForgotPasswordSubmit}
              errors={errors}
              forgotPasswordMutation={forgotPasswordMutation}
            />
          )}
          {activeStep === 2 && (
            <ResetPasswordForm
              email={forgotPasswordData.email}
              resetPasswordData={resetPasswordData}
              handleInputChange={handleInputChange}
              handleOtpChange={handleOtpChange}
              handleResetPasswordSubmit={handleResetPasswordSubmit}
              errors={errors}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
              resetPasswordMutation={resetPasswordMutation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
