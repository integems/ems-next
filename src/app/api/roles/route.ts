import { NextResponse } from "next/server";
import { RoleService } from "@/services/role.service";

const roleService = new RoleService();

/**
 * Handles the GET request to fetch all roles.
 * @returns A JSON response with the list of roles or an error.
 */
export async function GET() {
  try {
    const roles = await roleService.findAllRoles();
    return NextResponse.json(roles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
