import axios from "axios";
import { Role } from "@/types/common.types";

export class RoleService {
  private API_URL = "/api/roles";

  /**
   * Fetches all roles.
   * @param token - The authentication token.
   * @returns A list of roles.
   */
  async getAllRoles(token: string): Promise<Role[]> {
    try {
      const response = await axios.get(this.API_URL, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }
}
