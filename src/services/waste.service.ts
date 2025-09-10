import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateWasteDataDto,
  UpdateWasteDataDto,
  WasteDataFilterDto,
} from "@/dtos/waste.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";

/**
 * Service for managing waste data.
 */
export class WasteService {
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
   * Fetches all waste data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of waste data.
   */
  async findAllWasteData(filter: WasteDataFilterDto) {
    const { page = 1, limit = 10000000, search, locationId, startDate, endDate, timeOfDay, locationType } = filter;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      conditions.push(or(...searchTerms.map((term) => ilike(schema.wasteData.notes, `%${term}%`))));
    }

    if (locationId) {
      conditions.push(eq(schema.wasteData.locationId, locationId));
    }

    if (startDate) {
      conditions.push(sql`${schema.wasteData.measurementTime} >= ${startDate.toISOString()}`);
    }

    if (endDate) {
      conditions.push(sql`${schema.wasteData.measurementTime} <= ${endDate.toISOString()}`);
    }

    if (timeOfDay) {
      conditions.push(eq(schema.wasteData.timeOfDay, timeOfDay));
    }

    if (locationType) {
      conditions.push(eq(schema.wasteData.locationType, locationType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [wasteData, count] = await Promise.all([
      db.query.wasteData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.wasteData.createdAt)],
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
        .from(schema.wasteData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(wasteData, totalItems, page, limit);
  }

  /**
   * Fetches a single waste data record by its ID.
   * @param wasteDataId - The ID of the waste data record to fetch.
   * @returns The waste data object if found, otherwise throws an error.
   */
  async findWasteDataById(wasteDataId: string) {
    const wasteData = await db.query.wasteData.findFirst({
      where: eq(schema.wasteData.wasteDataId, wasteDataId),
      with: {
        location: true,
      },
    });

    if (!wasteData) {
      throw new Error("Waste data not found");
    }

    return { data: wasteData };
  }

  /**
   * Creates a new waste data record in the database.
   * @param wasteDataDto - The data for creating the new waste data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created waste data object.
   */
  async createWasteData(
    wasteDataDto: CreateWasteDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.userId || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = wasteDataDto.map((dto) => ({
      wasteDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime: new Date(dto.measurementTime),
      solidWasteKg: dto.solidWasteKg?.toString(),
      hazardousWasteKg: dto.hazardousWasteKg?.toString(),
      recycledWasteKg: dto.recycledWasteKg?.toString(),
      bottlesWasteKg: dto.bottlesWasteKg?.toString(),
      organicWasteKg: dto.organicWasteKg?.toString(),
      scrapWasteKg: dto.solidWasteKg?.toString(),
      scrapMetalKg: dto.scrapMetalKg?.toString(),
      cansWasteKg:dto.cansWasteKg?.toString(),
      eWasteKg:dto.eWasteKg?.toString(),
      plasticWasteKg: dto.plasticWasteKg?.toString(),
      paperWasteKg: dto.paperWasteKg?.toString(),
      pointGeom: dto.pointGeom,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));

    const newWasteData = await db
      .insert(schema.wasteData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Waste data created successfully",
      data: newWasteData,
    };
  }

  /**
   * Updates an existing waste data record.
   * @param wasteDataId - The ID of the waste data record to update.
   * @param wasteDataDto - The data for updating the waste data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated waste data object.
   */
  async updateWasteData(
    wasteDataId: string,
    wasteDataDto: UpdateWasteDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.userId || currentUser?.email || "system";

    const [updatedWasteData] = await db
      .update(schema.wasteData)
      .set({
        ...wasteDataDto,
        measurementTime: wasteDataDto.measurementTime
          ? new Date(wasteDataDto.measurementTime)
          : undefined,
        timeOfDay: wasteDataDto.timeOfDay,
        locationType: wasteDataDto.locationType,
        solidWasteKg: wasteDataDto.solidWasteKg?.toString(),
        hazardousWasteKg: wasteDataDto.hazardousWasteKg?.toString(),
        recycledWasteKg: wasteDataDto.recycledWasteKg?.toString(),
        organicWasteKg: wasteDataDto.organicWasteKg?.toString(),
        plasticWasteKg: wasteDataDto.plasticWasteKg?.toString(),
        paperWasteKg: wasteDataDto.paperWasteKg?.toString(),
        cansWasteKg: wasteDataDto.cansWasteKg?.toString(),
        bottlesWasteKg: wasteDataDto.bottlesWasteKg?.toString(),
        eWasteKg: wasteDataDto.eWasteKg?.toString(),
        scrapMetalKg: wasteDataDto.scrapMetalKg?.toString(),
        pointGeom: wasteDataDto.pointGeom,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.wasteData.wasteDataId, wasteDataId))
      .returning();

    if (!updatedWasteData) {
      throw new Error("Waste data not found");
    }

    return {
      message: "Waste data updated successfully",
      data: updatedWasteData,
    };
  }

  /**
   * Deletes a waste data record from the database.
   * @param wasteDataId - The ID of the waste data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteWasteData(wasteDataId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.wasteData)
      .where(eq(schema.wasteData.wasteDataId, wasteDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Waste data not found");
    }
    return { message: "Waste data deleted successfully" };
  }
}
