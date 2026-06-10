import { VerifyOtpDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for OTP verification.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the OTP verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const verifyOtpDto = VerifyOtpDtoSchema.parse(body);

    const result = await authService.verifyOtp(verifyOtpDto);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const message: string = error?.message || "";
    // Only surface OTP-related validation messages to the user.
    if (message.includes("OTP") || message.includes("expired")) {
      return NextResponse.json({ message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Couldn't verify your email. Please try again." },
      { status: 500 },
    );
  }
}
