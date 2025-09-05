import { ForgotPasswordDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for the forgot password functionality.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const forgotPasswordDto = ForgotPasswordDtoSchema.parse(body);

    const result = await authService.forgotPassword(forgotPasswordDto);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
