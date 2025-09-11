import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import { CreateUserDto, UpdateUserDto, UserFilterDto } from "@/dtos/user.dto";
import { PaginationResponse, RoleName, UserStatus } from "@/types/common.types";
import * as bcrypt from "bcrypt";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { CurrentUser } from "@/types/common.types"; // Assuming types are in schema.types.ts

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

export class UserService {
  /**
   * Excludes the password field from a user object.
   * @param user - The user object.
   * @returns A user object without the password.
   */
  private excludePassword<T extends { password?: string | null }>(
    user: T,
  ): Omit<T, "password"> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Creates a paginated response for a list of items.
   * @param data - The data to be paginated.
   * @param totalItems - The total number of items.
   * @param page - The current page number.
   * @param limit - The number of items per page.
   * @returns A paginated response object.
   */
  private paginateResponse<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
  ): PaginationResponse<T> {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data,
      metadata: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Fetches all users with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of users.
   */
  async findAllUsers(filter: UserFilterDto) {
    const { page, limit, search, role, status } = filter;
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchConditions = searchTerms.map((term) =>
        or(
          ilike(schema.users.firstName, `%${term}%`),
          ilike(schema.users.lastName, `%${term}%`),
          ilike(schema.users.email, `%${term}%`),
        ),
      );
      whereClause = and(...searchConditions);
    }

    if (status && status !== UserStatus.All) {
      const statusQuery = eq(schema.users.status, status);
      whereClause = whereClause ? and(whereClause, statusQuery) : statusQuery;
    }

    if (role && role !== RoleName.All) {
      const roles = await db.query.roles.findMany({
        where: eq(schema.roles.roleName, role),
      });
      const roleIds = roles.map((r) => r.roleId);
      if (roleIds.length > 0) {
        const userRolesQuery = db
          .select({ userId: schema.userRoles.userId })
          .from(schema.userRoles)
          .where(inArray(schema.userRoles.roleId, roleIds));

        const userRoleWhere = sql`${schema.users.userId} IN ${userRolesQuery}`;
        whereClause = whereClause
          ? and(whereClause, userRoleWhere)
          : userRoleWhere;
      }
    }

    const [users, count] = await Promise.all([
      db.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        columns: {
          password: false,
        },
        orderBy: [desc(schema.users.createdAt)],
        with: {
          userRole: {
            with: {
              role: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.users)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(users, totalItems, page, limit);
  }

  /**
   * Fetches a single user by their ID.
   * @param userId - The ID of the user to fetch.
   * @returns The user object if found, otherwise null.
   */
  async findUserById(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.userId, userId),
      columns: {
        password: false,
      },
      with: {
        userRole: {
          with: {
            role: true,
          },
        },
        userAuth: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Creates a new user in the database.
   * @param userDto - The data for creating the new user.
   * @param currentUser - The current authenticated user.
   * @returns The newly created user object.
   */
  async createUser(userDto: CreateUserDto, currentUser?: CurrentUser) {
    const { email, password, roleName, ...rest } = userDto;
    const createdBy = currentUser?.fullName || currentUser?.email || "system";
    const updatedBy = createdBy;

    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `${ID_PREFIX}${generateId()}`;

    const newUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({
          userId,
          email,
          password: hashedPassword,
          fullName: `${rest.firstName} ${rest.lastName}`,
          createdBy,
          updatedBy,
          ...rest,
        })
        .returning();

      const role = await tx.query.roles.findFirst({
        where: eq(
          schema.roles.roleName,
          roleName === RoleName.All ? RoleName.Authenticated : roleName,
        ),
      });

      if (role) {
        await tx.insert(schema.userRoles).values({
          userRoleId: `${ID_PREFIX}${generateId()}`,
          userId: user.userId,
          roleId: role.roleId,
          createdBy,
          updatedBy,
        });
      }

      await tx.insert(schema.userAuths).values({
        userAuthId: `${ID_PREFIX}${generateId()}`,
        userId: user.userId,
        createdBy,
        updatedBy,
        lastLoginIp: currentUser?.ip || null,
      });

      return user;
    });

    return {
      message: "User created successfully",
      data: this.excludePassword(newUser),
    };
  }

  /**
   * Updates an existing user.
   * @param userId - The ID of the user to update.
   * @param userDto - The data for updating the user.
   * @param currentUser - The current authenticated user.
   * @returns The updated user object.
   */
  async updateUser(
    userId: string,
    userDto: UpdateUserDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.fullName || currentUser?.email || "system";

    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...userDto,
        status: userDto.status === UserStatus.All ? undefined : userDto.status,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.users.userId, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return {
      message: "User updated successfully",
      data: this.excludePassword(updatedUser),
    };
  }

  /**
   * Deletes a user from the database.
   * @param userId - The ID of the user to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteUser(userId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.users)
      .where(eq(schema.users.userId, userId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("User not found");
    }
    return { message: "User deleted successfully" };
  }

  /**
   * Assigns a role to a user.
   * @param userId - The ID of the user.
   * @param roleId - The ID of the role to assign.
   * @param currentUser - The current authenticated user.
   * @returns The newly created user role object.
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.fullName || currentUser?.email || "system";
    const updatedBy = createdBy;

    const user = await db.query.users.findFirst({
      where: eq(schema.users.userId, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const role = await db.query.roles.findFirst({
      where: eq(schema.roles.roleId, roleId),
    });

    if (!role) {
      throw new Error("Role not found");
    }

    const existingUserRole = await db.query.userRoles.findFirst({
      where: and(eq(schema.userRoles.userId, userId)),
      with: { role: true },
    });
    if (existingUserRole) {
      const [updatedRole] = await db
        .update(schema.userRoles)
        .set({
          roleId,
          updatedBy,
        })
        .where(eq(schema.userRoles.userRoleId, existingUserRole.userRoleId))
        .returning();
      return {
        message: "Role assigned successfully",
        data: updatedRole,
      };
    }

    const [newUserRole] = await db
      .insert(schema.userRoles)
      .values({
        userRoleId: `${ID_PREFIX}${generateId()}`,
        userId,
        roleId,
        createdBy,
        updatedBy,
      })
      .returning();
    return {
      message: "Role assigned successfully",
      data: newUserRole,
    };
  }
}
