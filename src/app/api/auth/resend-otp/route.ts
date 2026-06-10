import { ResendOtpDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for resending OTP.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resendOtpDto = ResendOtpDtoSchema.parse(body);

    const result = await authService.resendOtp(resendOtpDto);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Couldn't resend the code. Please try again." },
      { status: 500 },
    );
  }
}
