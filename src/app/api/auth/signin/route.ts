import { SignInDtoSchema } from "@/dtos/auth.dto";
import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

/**
 * Handles the POST request for user signin.
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the result of the signin operation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signInDto = SignInDtoSchema.parse(body);

    const result = await authService.signIn(signInDto);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    const message: string = error?.message || "";
    if (
      message.includes("Invalid") ||
      message.includes("incorrect") ||
      message.includes("No account")
    ) {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
