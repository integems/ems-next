import { NewPasswordDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for resetting user password.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the password reset operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPasswordDto = NewPasswordDtoSchema.parse(body);

    const result = await authService.resetPassword(newPasswordDto);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
