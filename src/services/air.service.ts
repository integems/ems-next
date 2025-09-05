import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateAirDataDto,
  UpdateAirDataDto,
  AirDataFilterDto,
} from "@/dtos/air.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing air quality data.
 */
export class AirService {
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
   * Fetches all air data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of air data.
   */
  async findAllAirData(filter: AirDataFilterDto) {
    const { page = 1, limit = 10000000, search, locationId, startDate, endDate } = filter;
    const offset = (page - 1) * limit;


    let whereClause: any = undefined;

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      const searchConditions = searchTerms.map((term) =>
        or(ilike(schema.airData.notes, `%${term}%`)),
      );
      whereClause = and(...searchConditions);
    }

    if (locationId) {
      const locationCondition = eq(schema.airData.locationId, locationId);
      whereClause = whereClause
        ? and(whereClause, locationCondition)
        : locationCondition;
    }

    if (startDate && endDate) {
      try {
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const dateCondition = and(
          sql`${schema.airData.measurementTime} >= ${startDateTime.toISOString()}`,
          sql`${schema.airData.measurementTime} <= ${endDateTime.toISOString()}`,
        );
        whereClause = whereClause
          ? and(whereClause, dateCondition)
          : dateCondition;
      } catch (error) {
        throw new Error("Invalid date format provided");
      }
    }

    const [airData, count] = await Promise.all([
      db.query.airData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.airData.createdAt)],
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
        .from(schema.airData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(airData, totalItems, page, limit);
  }

  /**
   * Fetches a single air data record by its ID.
   * @param airDataId - The ID of the air data record to fetch.
   * @returns The air data object if found, otherwise throws an error.
   */
  async findAirDataById(airDataId: string) {
    const airData = await db.query.airData.findFirst({
      where: eq(schema.airData.airDataId, airDataId),
      with: {
        location: true,
      },
    });

    if (!airData) {
      throw new Error("Air data not found");
    }

    return { data: airData };
  }

  /**
   * Creates a new air data record in the database.
   * @param airDataDto - The data for creating the new air data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created air data object.
   */
  async createAirData(
    airDataDto: CreateAirDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.userId || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = airDataDto.map((dto) => ({
      airDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime:new Date(dto.measurementTime),
      pm25: dto.pm25?.toString(),
      pm10: dto.pm10?.toString(),
      no2: dto.no2?.toString(),
      o3: dto.o3?.toString(),
      co: dto.co?.toString(),
      so2: dto.so2?.toString(),
      temperature: dto.temperature?.toString(),
      humidity: dto.humidity?.toString(),
      pointGeom: dto.pointGeom,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));
    const newAirData = await db
      .insert(schema.airData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Air data created successfully",
      data: newAirData,
    };
  }

  /**
   * Updates an existing air data record.
   * @param airDataId - The ID of the air data record to update.
   * @param airDataDto - The data for updating the air data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated air data object.
   */
  async updateAirData(
    airDataId: string,
    airDataDto: UpdateAirDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.userId || currentUser?.email || "system";

    const [updatedAirData] = await db
      .update(schema.airData)
      .set({
        ...airDataDto,
        measurementTime:airDataDto.measurementTime ? new Date(airDataDto.measurementTime):undefined,
        pm25: airDataDto.pm25?.toString(),
        pm10: airDataDto.pm10?.toString(),
        no2: airDataDto.no2?.toString(),
        o3: airDataDto.o3?.toString(),
        co: airDataDto.co?.toString(),
        so2: airDataDto.so2?.toString(),
        temperature: airDataDto.temperature?.toString(),
        humidity: airDataDto.humidity?.toString(),
        pointGeom: airDataDto.pointGeom,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.airData.airDataId, airDataId))
      .returning();

    if (!updatedAirData) {
      throw new Error("Air data not found");
    }

    return {
      message: "Air data updated successfully",
      data: updatedAirData,
    };
  }

  /**
   * Deletes an air data record from the database.
   * @param airDataId - The ID of the air data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteAirData(airDataId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.airData)
      .where(eq(schema.airData.airDataId, airDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Air data not found");
    }
    return { message: "Air data deleted successfully" };
  }
}
