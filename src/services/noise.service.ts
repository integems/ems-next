import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateNoiseDataDto,
  UpdateNoiseDataDto,
  NoiseDataFilterDto,
} from "@/dtos/noise.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing noise data.
 */
export class NoiseService {
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
   * Fetches all noise data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of noise data.
   */
  async findAllNoiseData(filter: NoiseDataFilterDto) {
    const { page, limit, search, locationId, startDate, endDate } = filter;
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchConditions = searchTerms.map((term) =>
        or(ilike(schema.noiseData.notes, `%${term}%`)),
      );
      whereClause = and(...searchConditions);
    }

    if (locationId) {
      const locationCondition = eq(schema.noiseData.locationId, locationId);
      whereClause = whereClause
        ? and(whereClause, locationCondition)
        : locationCondition;
    }

    if (startDate && endDate) {
      const dateCondition = and(
        sql`${schema.noiseData.measurementTime} >= ${startDate}`,
        sql`${schema.noiseData.measurementTime} <= ${endDate}`,
      );
      whereClause = whereClause
        ? and(whereClause, dateCondition)
        : dateCondition;
    }

    const [noiseData, count] = await Promise.all([
      db.query.noiseData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.noiseData.createdAt)],
        with: {
          location: true,
        },
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.noiseData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(noiseData, totalItems, page, limit);
  }

  /**
   * Fetches a single noise data record by its ID.
   * @param noiseDataId - The ID of the noise data record to fetch.
   * @returns The noise data object if found, otherwise throws an error.
   */
  async findNoiseDataById(noiseDataId: string) {
    const noiseData = await db.query.noiseData.findFirst({
      where: eq(schema.noiseData.noiseDataId, noiseDataId),
      with: {
        location: true,
      },
    });

    if (!noiseData) {
      throw new Error("Noise data not found");
    }

    return { data: noiseData };
  }

  /**
   * Creates a new noise data record in the database.
   * @param noiseDataDto - The data for creating the new noise data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created noise data object.
   */
  async createNoiseData(
    noiseDataDto: CreateNoiseDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.userId || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = noiseDataDto.map((dto) => ({
      noiseDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime: new Date(dto.measurementTime),
      dbA: dto.dbA?.toString(),
      dbC: dto.dbC?.toString(),
      peak: dto.peak?.toString(),
      frequency: dto.frequency?.toString(),
      pointGeom: dto.pointGeom,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));

    const newNoiseData = await db
      .insert(schema.noiseData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Noise data created successfully",
      data: newNoiseData,
    };
  }

  /**
   * Updates an existing noise data record.
   * @param noiseDataId - The ID of the noise data record to update.
   * @param noiseDataDto - The data for updating the noise data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated noise data object.
   */
  async updateNoiseData(
    noiseDataId: string,
    noiseDataDto: UpdateNoiseDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.userId || currentUser?.email || "system";

    const [updatedNoiseData] = await db
      .update(schema.noiseData)
      .set({
        ...noiseDataDto,
        measurementTime: noiseDataDto.measurementTime
          ? new Date(noiseDataDto.measurementTime)
          : undefined,
        dbA: noiseDataDto.dbA?.toString(),
        dbC: noiseDataDto.dbC?.toString(),
        peak: noiseDataDto.peak?.toString(),
        frequency: noiseDataDto.frequency?.toString(),
        pointGeom: noiseDataDto.pointGeom,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.noiseData.noiseDataId, noiseDataId))
      .returning();

    if (!updatedNoiseData) {
      throw new Error("Noise data not found");
    }

    return {
      message: "Noise data updated successfully",
      data: updatedNoiseData,
    };
  }

  /**
   * Deletes a noise data record from the database.
   * @param noiseDataId - The ID of the noise data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteNoiseData(noiseDataId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.noiseData)
      .where(eq(schema.noiseData.noiseDataId, noiseDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Noise data not found");
    }
    return { message: "Noise data deleted successfully" };
  }
}
