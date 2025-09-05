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
    console.error(error);
    if (error.message.includes("already exists")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
