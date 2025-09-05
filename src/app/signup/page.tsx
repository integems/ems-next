"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
} from "@/components/ui/stepper";
import {
  SignUpForm,
  signUpSchema,
  SignUpFormData,
} from "@/components/SignUpForm";
import {
  VerifyEmailForm,
  verifyEmailSchema,
  VerifyEmailFormData,
} from "@/components/VerifyEmailForm";
import { FrontendAuthService } from "@/frontend-services/auth.service";
import { SignUpDto, VerifyOtpDto } from "@/dtos/auth.dto";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const authService = new FrontendAuthService();

export default function SignUpPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
  });
  const [verifyEmailData, setVerifyEmailData] = useState<VerifyEmailFormData>({
    email: "",
    otp: "",
  });
  const [errors, setErrors] = useState<
    Partial<
      Record<
        keyof SignUpFormData | keyof VerifyEmailFormData | "server",
        string
      >
    >
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const [stepOneCompleted, setStepOneCompleted] = useState<boolean>(false);

  const resendOtpMutation = useMutation({
    mutationFn: (data: { email: string }) => authService.resendOtp(data),
    onError: (error: any) => {
      toast.error("Couldn't resend OTP, please try again.");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (data: SignUpDto) => authService.signUp(data),
    onSuccess: (data) => {
      setVerifyEmailData((prev) => ({ ...prev, email: signUpData.email }));
      setActiveStep((prev) => prev + 1);
      setStepOneCompleted(true);
    },
    onError: (error: any) => {
      toast.error("Couldn't sign up, please try again.");
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyOtpDto) => authService.verifyOtp(data),
    onSuccess: (data) => {
      signIn(data.token);
      router.push("/");
    },
    onError: (error: any) => {
      toast.error("Couldn't verify email, please try again.");
    },
  });

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse(signUpData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
      });
      return;
    }

    const requestData: SignUpDto = {
      ...signUpData,
      verified: false,
      fullName: `${signUpData.firstName} ${signUpData.lastName}`,
    };

    signUpMutation.mutate(requestData);
  };

  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = verifyEmailSchema.safeParse(verifyEmailData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0],
      });
      return;
    }

    verifyEmailMutation.mutate(verifyEmailData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeStep === 1) {
      setSignUpData((prev) => ({ ...prev, [name]: value }));
    } else {
      setVerifyEmailData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleOtpChange = (value: string) => {
    setVerifyEmailData((prev) => ({ ...prev, otp: value }));
    setErrors((prev) => ({ ...prev, otp: undefined }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <div className="fixed top-5 left-0 right-0 z-50 p-4">
        <Stepper
          className="flex justify-center items-center gap-4"
          value={activeStep}
          onValueChange={setActiveStep}
        >
          <StepperItem loading={signUpMutation.isPending} key={1} step={1}>
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Register</StepperTitle>
              </div>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
          <StepperItem
            disabled={!stepOneCompleted}
            loading={verifyEmailMutation.isPending}
            key={2}
            step={2}
          >
            <StepperTrigger>
              <StepperIndicator />
              <div>
                <StepperTitle>Verify email</StepperTitle>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
      </div>
      <Card className="w-full max-w-md mt-20">
        <CardHeader />
        <CardContent>
          {activeStep === 1 && (
            <SignUpForm
              signUpData={signUpData}
              handleInputChange={handleInputChange}
              handleSignUpSubmit={handleSignUpSubmit}
              errors={errors}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
              signUpMutation={signUpMutation}
            />
          )}
          {activeStep === 2 && (
            <VerifyEmailForm
              verifyEmailData={verifyEmailData}
              handleInputChange={handleInputChange}
              handleOtpChange={handleOtpChange}
              handleVerifyEmailSubmit={handleVerifyEmailSubmit}
              errors={errors}
              verifyEmailMutation={verifyEmailMutation}
              resendOtpMutation={resendOtpMutation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
