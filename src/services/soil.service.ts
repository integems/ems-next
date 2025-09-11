import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateSoilDataDto,
  UpdateSoilDataDto,
  SoilDataFilterDto,
} from "@/dtos/soil.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing soil data.
 */
export class SoilService {
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
   * Fetches all soil data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of soil data.
   */
  async findAllSoilData(filter: SoilDataFilterDto) {
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

    const conditions = [];

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      conditions.push(
        or(
          ...searchTerms.map((term) =>
            ilike(schema.soilData.notes, `%${term}%`),
          ),
        ),
      );
    }

    if (locationId) {
      conditions.push(eq(schema.soilData.locationId, locationId));
    }

    if (startDate) {
      conditions.push(
        sql`${schema.soilData.measurementTime} >= ${startDate.toISOString()}`,
      );
    }

    if (endDate) {
      conditions.push(
        sql`${schema.soilData.measurementTime} <= ${endDate.toISOString()}`,
      );
    }

    if (timeOfDay) {
      conditions.push(eq(schema.soilData.timeOfDay, timeOfDay));
    }

    if (locationType) {
      conditions.push(eq(schema.soilData.locationType, locationType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [soilData, count] = await Promise.all([
      db.query.soilData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.soilData.createdAt)],
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
        .from(schema.soilData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(soilData, totalItems, page, limit);
  }

  /**
   * Fetches a single soil data record by its ID.
   * @param soilDataId - The ID of the soil data record to fetch.
   * @returns The soil data object if found, otherwise throws an error.
   */
  async findSoilDataById(soilDataId: string) {
    const soilData = await db.query.soilData.findFirst({
      where: eq(schema.soilData.soilDataId, soilDataId),
      with: {
        location: true,
      },
    });

    if (!soilData) {
      throw new Error("Soil data not found");
    }

    return { data: soilData };
  }

  /**
   * Creates a new soil data record in the database.
   * @param soilDataDto - The data for creating the new soil data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created soil data object.
   */
  async createSoilData(
    soilDataDto: CreateSoilDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.fullName || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = soilDataDto.map((dto) => ({
      soilDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime: new Date(dto.measurementTime),
      ph: dto.ph?.toString(),
      nitrogen: dto.nitrogen?.toString(),
      phosphorus: dto.phosphorus?.toString(),
      potassium: dto.potassium?.toString(),
      organicMatter: dto.organicMatter?.toString(),
      moisture: dto.moisture?.toString(),
      pointGeom: dto.pointGeom,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));

    const newSoilData = await db
      .insert(schema.soilData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Soil data created successfully",
      data: newSoilData,
    };
  }

  /**
   * Updates an existing soil data record.
   * @param soilDataId - The ID of the soil data record to update.
   * @param soilDataDto - The data for updating the soil data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated soil data object.
   */
  async updateSoilData(
    soilDataId: string,
    soilDataDto: UpdateSoilDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.fullName || currentUser?.email || "system";

    const [updatedSoilData] = await db
      .update(schema.soilData)
      .set({
        ...soilDataDto,
        measurementTime: soilDataDto.measurementTime
          ? new Date(soilDataDto.measurementTime)
          : undefined,
        timeOfDay: soilDataDto.timeOfDay ? soilDataDto.timeOfDay : undefined,
        locationType: soilDataDto.locationType
          ? soilDataDto.locationType
          : undefined,
        ph: soilDataDto.ph?.toString(),
        nitrogen: soilDataDto.nitrogen?.toString(),
        phosphorus: soilDataDto.phosphorus?.toString(),
        potassium: soilDataDto.potassium?.toString(),
        organicMatter: soilDataDto.organicMatter?.toString(),
        moisture: soilDataDto.moisture?.toString(),
        pointGeom: soilDataDto.pointGeom,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.soilData.soilDataId, soilDataId))
      .returning();

    if (!updatedSoilData) {
      throw new Error("Soil data not found");
    }

    return {
      message: "Soil data updated successfully",
      data: updatedSoilData,
    };
  }

  /**
   * Deletes a soil data record from the database.
   * @param soilDataId - The ID of the soil data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteSoilData(soilDataId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.soilData)
      .where(eq(schema.soilData.soilDataId, soilDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Soil data not found");
    }
    return { message: "Soil data deleted successfully" };
  }
}
