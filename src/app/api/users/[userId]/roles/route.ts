/**
 * @file This file contains the API route for assigning a role to a user.
 */

import { assignRoleDto } from "@/dtos/user.dto";
import { UserService } from "@/services/user.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { userId: string };
}

const userService = new UserService();

/**
 * Handles the POST request to assign a role to a user.
 * @param request - The incoming Next.js request.
 * @param params - The route parameters, containing the userId.
 * @returns A JSON response with the newly created user role or an error.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await authenticateRequest(authHeader);

    if (auth.status === "error") {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      );
    }
    if (!auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { userId } = params;
    const body = await request.json();
    const { roleId } = assignRoleDto.parse(body);
    const newUserRoleResponse = await userService.assignRoleToUser(
      userId,
      roleId,
      auth.user,
    );
    return NextResponse.json(newUserRoleResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
