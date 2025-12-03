/**
 * @file This file contains the API routes for handling a single user.
 * It includes operations for fetching, updating, and deleting a user by their ID.
 */

import { updateUserDto } from "@/dtos/user.dto";
import { UserService } from "@/services/user.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ userId: string }>;
}

const userService = new UserService();

/**
 * Handles the GET request to fetch a single user by their ID.
 * @param request - The incoming Next.js request.
 * @param params - The route parameters, containing the userId.
 * @returns A JSON response with the user data or an error.
 */
export async function GET(request: NextRequest, { params }: Params) {
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
    const { userId } = await params;
    const userResponse = await userService.findUserById(userId);
    return NextResponse.json(userResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

/**
 * Handles the PUT request to update an existing user.
 * @param request - The incoming Next.js request.
 * @param params - The route parameters, containing the userId.
 * @returns A JSON response with the updated user data or an error.
 */
export async function PUT(request: NextRequest, { params }: Params) {
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
    const { userId } = await params;
    const body = await request.json();
    const userDto = updateUserDto.parse(body);
    const updatedUserResponse = await userService.updateUser(
      userId,
      userDto,
      auth.user,
    );
    return NextResponse.json(updatedUserResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

/**
 * Handles the DELETE request to delete a user by their ID.
 * @param request - The incoming Next.js request.
 * @param params - The route parameters, containing the userId.
 * @returns A JSON response confirming the deletion or an error.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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
    const { userId } = await params;
    const deleteResponse = await userService.deleteUser(userId, auth.user);
    return NextResponse.json(deleteResponse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
