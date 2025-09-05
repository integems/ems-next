import { OAuthDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for user google OAuth signin.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the signin operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signInDto = OAuthDtoSchema.parse(body);
    const result = await authService.googleOAuthCallback(signInDto);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (
      error.message.includes("Invalid") ||
      error.message.includes("incorrect")
    ) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
