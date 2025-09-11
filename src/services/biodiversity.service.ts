import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateBiodiversityDataDto,
  UpdateBiodiversityDataDto,
  BiodiversityDataFilterDto,
} from "@/dtos/biodiversity.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing biodiversity data.
 */
export class BiodiversityService {
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
   * Fetches all biodiversity data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of biodiversity data.
   */
  async findAllBiodiversityData(filter: BiodiversityDataFilterDto) {
    const {
      page = 1,
      limit = 10000000,
      search,
      locationId,
      startDate,
      endDate,
      timeOfDay,
      locationType,
    } = filter;
    const offset = (page - 1) * limit;

    console.log({ page, offset });

    const conditions = [];

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      conditions.push(
        or(
          ...searchTerms.map((term) =>
            ilike(schema.biodiversityData.notes, `%${term}%`),
          ),
        ),
      );
    }

    if (locationId) {
      conditions.push(eq(schema.biodiversityData.locationId, locationId));
    }

    if (startDate) {
      conditions.push(
        sql`${schema.biodiversityData.measurementTime} >= ${startDate.toISOString()}`,
      );
    }

    if (endDate) {
      conditions.push(
        sql`${schema.biodiversityData.measurementTime} <= ${endDate.toISOString()}`,
      );
    }

    if (timeOfDay) {
      conditions.push(eq(schema.biodiversityData.timeOfDay, timeOfDay));
    }

    if (locationType) {
      conditions.push(eq(schema.biodiversityData.locationType, locationType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [biodiversityData, count] = await Promise.all([
      db.query.biodiversityData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.biodiversityData.createdAt)],
        with: {
          location: {
            columns: {
              geom: false,
              pointGeom: false,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.biodiversityData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(biodiversityData, totalItems, page, limit);
  }

  /**
   * Fetches a single biodiversity data record by its ID.
   * @param biodiversityDataId - The ID of the biodiversity data record to fetch.
   * @returns The biodiversity data object if found, otherwise throws an error.
   */
  async findBiodiversityDataById(biodiversityDataId: string) {
    const biodiversityData = await db.query.biodiversityData.findFirst({
      where: eq(schema.biodiversityData.biodiversityDataId, biodiversityDataId),
      with: {
        location: true,
      },
    });

    if (!biodiversityData) {
      throw new Error("Biodiversity data not found");
    }

    return { data: biodiversityData };
  }

  /**
   * Creates a new biodiversity data record in the database.
   * @param biodiversityDataDto - The data for creating the new biodiversity data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created biodiversity data object.
   */
  async createBiodiversityData(
    biodiversityDataDto: CreateBiodiversityDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.fullName || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = biodiversityDataDto.map((dto) => ({
      biodiversityDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime: new Date(dto.measurementTime),
      speciesCount: dto.speciesCount,
      shannonIndex: dto.shannonIndex?.toString(),
      observations: dto.observations,
      pointGeom: dto.pointGeom,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));

    const newBiodiversityData = await db
      .insert(schema.biodiversityData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Biodiversity data created successfully",
      data: newBiodiversityData,
    };
  }

  /**
   * Updates an existing biodiversity data record.
   * @param biodiversityDataId - The ID of the biodiversity data record to update.
   * @param biodiversityDataDto - The data for updating the biodiversity data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated biodiversity data object.
   */
  async updateBiodiversityData(
    biodiversityDataId: string,
    biodiversityDataDto: UpdateBiodiversityDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.fullName || currentUser?.email || "system";

    const [updatedBiodiversityData] = await db
      .update(schema.biodiversityData)
      .set({
        ...biodiversityDataDto,
        measurementTime: biodiversityDataDto.measurementTime
          ? new Date(biodiversityDataDto.measurementTime)
          : undefined,
        timeOfDay: biodiversityDataDto.timeOfDay
          ? biodiversityDataDto.timeOfDay
          : undefined,
        locationType: biodiversityDataDto.locationType
          ? biodiversityDataDto.locationType
          : undefined,
        speciesCount: biodiversityDataDto.speciesCount,
        shannonIndex: biodiversityDataDto.shannonIndex?.toString(),
        observations: biodiversityDataDto.observations,
        pointGeom: biodiversityDataDto.pointGeom,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.biodiversityData.biodiversityDataId, biodiversityDataId))
      .returning();

    if (!updatedBiodiversityData) {
      throw new Error("Biodiversity data not found");
    }

    return {
      message: "Biodiversity data updated successfully",
      data: updatedBiodiversityData,
    };
  }

  /**
   * Deletes a biodiversity data record from the database.
   * @param biodiversityDataId - The ID of the biodiversity data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteBiodiversityData(
    biodiversityDataId: string,
    currentUser?: CurrentUser,
  ) {
    const deleted = await db
      .delete(schema.biodiversityData)
      .where(eq(schema.biodiversityData.biodiversityDataId, biodiversityDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Biodiversity data not found");
    }
    return { message: "Biodiversity data deleted successfully" };
  }
}
