import {
  PaginationResponse,
  DataResponse,
  MessageResponse,
  User,
  UserRoles,
  Role,
} from "@/types/common.types";

// Simplified User type for responses
export type UserResponse = User;

// Response types
export type UsersResponse = PaginationResponse<User>;
export type UserDataResponse = DataResponse<User>;
export type UserRoleResponse = DataResponse<UserRoles>;
export type UserMessageResponse = MessageResponse;
