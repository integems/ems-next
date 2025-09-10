import axios from "axios";
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  AssignRoleDto,
} from "@/dtos/user.dto";
import {
  UsersResponse,
  UserDataResponse,
  UserRoleResponse,
  UserMessageResponse,
  UserResponse,
} from "@/types/user.types";

const API_BASE_URL = "/api/users";

export class FrontendUserService {
  /**
   * Fetches a paginated list of users based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of users.
   */
  async findAllUsers(
    token: string,
    filter: UserFilterDto,
  ): Promise<UsersResponse> {
    try {
      const queryParams = {
        page: filter.page.toString(),
        limit: filter.limit.toString(),
        role: filter.role,
        status: filter.status,
        search: filter.search,
      };
      const response = await axios.get(API_BASE_URL, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "An error occurred while fetching users.",
      );
    }
  }

  /**
   * Fetches a single user by their ID.
   * @param token - The authentication token.
   * @param userId - The ID of the user to fetch.
   * @returns The user object.
   */
  async fetchUserById(token: string, userId: string): Promise<UserResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new user.
   * @param token - The authentication token.
   * @param userDto - The data for creating the new user.
   * @returns The newly created user object.
   */
  async createUser(
    token: string,
    userDto: CreateUserDto,
  ): Promise<UserDataResponse> {
    try {
      const response = await axios.post(API_BASE_URL, userDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an existing user.
   * @param token - The authentication token.
   * @param userId - The ID of the user to update.
   * @ även userDto - The data for updating the user.
   * @returns The updated user object.
   */
  async updateUser(
    token: string,
    userId: string,
    userDto: UpdateUserDto,
  ): Promise<UserDataResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/${userId}`, userDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a user.
   * @param token - The authentication token.
   * @param userId - The ID of the user to delete.
   */
  async deleteUser(
    token: string,
    userId: string,
  ): Promise<UserMessageResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Assigns a role to a user.
   * @param token - The authentication token.
   * @param userId - The ID of the user.
   * @param assignRoleDto - The role assignment data.
   * @returns The newly created user role object.
   */
  async assignRoleToUser(
    token: string,
    userId: string,
    assignRoleDto: AssignRoleDto,
  ): Promise<UserRoleResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${userId}/roles`,
        assignRoleDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const frontendUserService = new FrontendUserService();
