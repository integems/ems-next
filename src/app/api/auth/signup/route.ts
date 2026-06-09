import { SignUpDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for user signup.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the signup operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signUpDto = SignUpDtoSchema.parse(body);

    const result = await authService.signUp(signUpDto);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const message: string = error?.message || "";
    if (message.includes("already exists")) {
      return NextResponse.json({ message }, { status: 409 });
    }
    if (message.includes("OTP") || message.includes("email")) {
      return NextResponse.json(
        {
          message:
            "We couldn't send your verification email. Please try again shortly.",
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
