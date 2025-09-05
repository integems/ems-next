import { db } from "@/database/client";

export class RoleService {
  async findAllRoles() {
    const roles = await db.query.roles.findMany();
    return roles;
  }
}
