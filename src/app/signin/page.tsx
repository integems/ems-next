"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FrontendAuthService } from "@/frontend-services/auth.service";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock, Eye, EyeOff, LoaderIcon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { OAuthDto } from "@/dtos/auth.dto";
import { Logo } from "@/components/sidebar";

// Zod schema for form validation
const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Enter valid password" }),
});

const authService = new FrontendAuthService();

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormData | "server", string>>
  >({});
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const mutation = useMutation({
    mutationFn: authService.signIn,
    onSuccess: (data) => {
      if (rememberMe) {
        signIn(data.token);
      } else {
        signIn(data.token);
      }
      router.push("/");
    },
    onError: (error: any) => {
      setErrors({ server: error.message });
    },
  });

  const handleGoogleCallback = (token: string) => {
    const credential = jwtDecode(token) as any;

    const requesPayload: OAuthDto = {
      firstName: credential?.given_name || credential?.email,
      lastName: credential?.family_name || credential?.email,
      email: credential?.email,
      profileImage: credential?.picture,
      fullName: credential?.name || credential?.email,
    };
    console.log({ Response: requesPayload });
    oAuthMutation.mutate(requesPayload);
  };
  const oAuthMutation = useMutation({
    mutationFn: authService.oAuthSignIn,
    onSuccess: (data) => {
      if (rememberMe) {
        signIn(data.token);
      } else {
        signIn(data.token);
      }
      router.push("/dashboard");
    },
    onError: (error: any) => {
      setErrors({ server: "Couldn't signin, Please try again." });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center text-center w-full mb-10">
            <Logo />
          </div>

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
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full pl-10",
                    errors.password && "border-red-500",
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label
                  htmlFor="remember"
                  className="text-muted-foreground font-normal"
                >
                  Remember me
                </Label>
              </div>
              <Link
                className="text-sm text-primary hover:no-underline"
                href="/password-recovery"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              Sign in
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link
                  className="text-primary hover:no-underline ml-1"
                  href="/signup"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold my-3">
                Or
              </span>
            </div>
          </div>
          {/* <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.3-107.7H248V256h236.8z"
                ></path>
              </svg>
            )}
            Google
          </Button> */}
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              handleGoogleCallback(credentialResponse.credential as string);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            useOneTap
          />
        </CardContent>
      </Card>
    </div>
  );
}
