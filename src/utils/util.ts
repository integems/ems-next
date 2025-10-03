import jwt from "jsonwebtoken";
import { config as appConfig } from "@/config/config";
import { db } from "@/database/client";
import { eq } from "drizzle-orm";
import * as schema from "@/database/drizzle/schema";
import { CurrentUser, RoleName } from "@/types/common.types";
import { NextResponse } from "next/server";

export interface AuthResult {
  user?: CurrentUser;
  error?: string;
  statusCode: number;
  status: "success" | "error";
}

/**
 * Authenticates a request by verifying the JWT token and fetching the user from the database.
 * @param authHeader - The Authorization header containing the Bearer token.
 * @returns An object containing the authenticated user or an error message and status code.
 */
export async function authenticateRequest(
  authHeader: string | null,
): Promise<AuthResult> {
  try {
    // Extract token from Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: "Missing or invalid Authorization header",
        statusCode: 401,
        status: "error",
      };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return {
        error: "Missing token",
        statusCode: 401,
        status: "error",
      };
    }

    // Verify JWT
    const payload = jwt.verify(
      token,
      appConfig.getEnv("JWT_SECRET") as string,
    ) as {
      sub: string;
      userId: string;
      email: string;
      fullName?: string;
      profileImage?: string;
    };

    // Validate required fields
    if (!payload.userId) {
      return {
        error: "Invalid token payload",
        statusCode: 401,
        status: "error",
      };
    }

    // Fetch user from database
    const user = await db.query.users.findFirst({
      where: eq(schema.users.userId, payload.userId),
      with: {
        userRole: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return {
        error: "User not found",
        statusCode: 401,
        status: "error",
      };
    }

    // Return authenticated user
    return {
      user: {
        userId: user.userId,
        email: payload.email,
        fullName: payload.fullName || "",
        isAuthenticated: true,
        role:
          (user.userRole?.role.roleName as RoleName) || RoleName.Authenticated,
      },
      statusCode: 200,
      status: "success",
    };
  } catch (error) {
    // console.error("Authentication error:", error);
    return {
      error: "Invalid or expired token",
      statusCode: 401,
      status: "error",
    };
  }
}
