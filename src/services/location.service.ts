import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationFilterDto,
} from "@/dtos/location.dto";
import {
  PaginationResponse,
  CurrentUser,
  Category,
} from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing location data.
 */
export class LocationService {
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
   * Fetches all locations with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of locations.
   */
  async findAllLocations(filter: LocationFilterDto) {
    const { page = 1, limit = 10000000, search, category } = filter;
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchConditions = searchTerms.map((term) =>
        or(
          ilike(schema.locations.name, `%${term}%`),
          ilike(schema.locations.description, `%${term}%`),
        ),
      );
      whereClause = and(...searchConditions);
    }

    if (category) {
      const categoryCondition = eq(schema.locations.category, category);
      whereClause = whereClause
        ? and(whereClause, categoryCondition)
        : categoryCondition;
    }

    const [locations, count] = await Promise.all([
      db.query.locations.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.locations.createdAt)],
        columns: {
          geom: false,
        },
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.locations)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(locations, totalItems, page, limit);
  }

  /**
   * Fetches a single location by its ID.
   * @param locationId - The ID of the location to fetch.
   * @returns The location object if found, otherwise throws an error.
   */
  async findLocationById(locationId: string) {
    const location = await db.query.locations.findFirst({
      where: eq(schema.locations.locationId, locationId),
    });

    if (!location) {
      throw new Error("Location not found");
    }

    return { data: location };
  }

  /**
   * Creates a new location record in the database.
   * @param locationDto - The data for creating the new location record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created location object.
   */
  async createLocation(
    locationDto: CreateLocationDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.fullName || currentUser?.email || "system";
    const updatedBy = createdBy;
    const locationId = `${ID_PREFIX}${generateId()}`;

    const [newLocation] = await db
      .insert(schema.locations)
      .values({
        locationId,
        ...locationDto,
        category: locationDto.category as Category,
        locationType: locationDto.locationType,
        geom: locationDto.geom
          ? sql`ST_GeomFromText(${locationDto.geom}, 4326)`
          : undefined,
        pointGeom: locationDto.pointGeom,
        altitude: locationDto.altitude?.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy,
      })
      .returning();

    return {
      message: "Location created successfully",
      data: newLocation,
    };
  }

  /**
   * Updates an existing location record.
   * @param locationId - The ID of the location to update.
   * @param locationDto - The data for updating the location record.
   * @param currentUser - The current authenticated user.
   * @returns The updated location object.
   */
  async updateLocation(
    locationId: string,
    locationDto: UpdateLocationDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.fullName || currentUser?.email || "system";

    const [updatedLocation] = await db
      .update(schema.locations)
      .set({
        ...locationDto,
        locationType: locationDto.locationType,
        geom: locationDto.geom
          ? sql`ST_GeomFromText(${locationDto.geom}, 4326)`
          : undefined,
        pointGeom: locationDto.pointGeom,
        altitude: locationDto.altitude?.toString(),
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.locations.locationId, locationId))
      .returning();

    if (!updatedLocation) {
      throw new Error("Location not found");
    }

    return {
      message: "Location updated successfully",
      data: updatedLocation,
    };
  }

  /**
   * Deletes a location record from the database.
   * @param locationId - The ID of the location to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteLocation(locationId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.locations)
      .where(eq(schema.locations.locationId, locationId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Location not found");
    }
    return { message: "Location deleted successfully" };
  }
}
