/**
 * @file This file contains the API routes for handling user collections.
 * It includes operations for fetching all users and creating a new user.
 */

import { createUserDto, userFilterDto } from "@/dtos/user.dto";
import { UserService } from "@/services/user.service";
import { RoleName } from "@/types/common.types";
import { authenticateRequest, authorizeRoles } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const userService = new UserService();

/**
 * Handles the GET request to fetch all users with optional filters.
 * @param request - The incoming Next.js request.
 * @returns A JSON response with the list of users or an error.
 */
export async function GET(request: NextRequest) {
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

    // console.log({ currentUser: auth.user });
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const filters = userFilterDto.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: search ? search : undefined,
      role: role ? role : undefined,
      status: status ? status : undefined,
    });
    const users = await userService.findAllUsers(filters);
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    // console.error(error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

/**
 * Handles the POST request to create a new user.
 * @param request - The incoming Next.js request.
 * @returns A JSON response with the newly created user or an error.
 */
export async function POST(request: NextRequest) {
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

    const authCheck = authorizeRoles(auth.user, [
      RoleName.SuperAdmin,
      RoleName.IntegemsAdmin,
      RoleName.Admin,
    ]);
    if (authCheck) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.statusCode },
      );
    }
    const body = await request.json();
    const userDto = createUserDto.parse(body);
    const newUserResponse = await userService.createUser(userDto, auth.user);
    return NextResponse.json(newUserResponse, { status: 201 });
  } catch (error: any) {
    // console.log({error})
    if (error.message.includes("already")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
