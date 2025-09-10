import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import {
  CreateWaterDataDto,
  UpdateWaterDataDto,
  WaterDataFilterDto,
} from "@/dtos/water.dto";
import { PaginationResponse, CurrentUser } from "@/types/common.types";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);
const ID_PREFIX = "int";
/**
 * Service for managing water data.
 */
export class WaterService {
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
   * Fetches all water data with pagination, filtering, and search capabilities.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of water data.
   */
  async findAllWaterData(filter: WaterDataFilterDto) {
    const { page = 1, limit = 10000000, search, locationId,waterSource, startDate, endDate, timeOfDay, locationType } = filter;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      const searchTerms = search
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0);

      conditions.push(or(...searchTerms.map((term) => ilike(schema.waterData.notes, `%${term}%`))));
    }

    if (locationId) {
      conditions.push(eq(schema.waterData.locationId, locationId));
    }

    if (startDate) {
      conditions.push(sql`${schema.waterData.measurementTime} >= ${startDate.toISOString()}`);
    }

    if (endDate) {
      conditions.push(sql`${schema.waterData.measurementTime} <= ${endDate.toISOString()}`);
    }

    if (timeOfDay) {
      conditions.push(eq(schema.waterData.timeOfDay, timeOfDay));
    }

    if (locationType) {
      conditions.push(eq(schema.waterData.locationType, locationType));
    }

    if (waterSource) {
      conditions.push(eq(schema.waterData.waterSource, waterSource));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [waterData, count] = await Promise.all([
      db.query.waterData.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(schema.waterData.createdAt)],
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
        .from(schema.waterData)
        .where(whereClause),
    ]);

    const totalItems = Number(count[0].count);
    return this.paginateResponse(waterData, totalItems, page, limit);
  }

  /**
   * Fetches a single water data record by its ID.
   * @param waterDataId - The ID of the water data record to fetch.
   * @returns The water data object if found, otherwise throws an error.
   */
  async findWaterDataById(waterDataId: string) {
    const waterData = await db.query.waterData.findFirst({
      where: eq(schema.waterData.waterDataId, waterDataId),
      with: {
        location: true,
      },
    });

    if (!waterData) {
      throw new Error("Water data not found");
    }

    return { data: waterData };
  }

  /**
   * Creates a new water data record in the database.
   * @param waterDataDto - The data for creating the new water data record.
   * @param currentUser - The current authenticated user.
   * @returns The newly created water data object.
   */
  async createWaterData(
    waterDataDto: CreateWaterDataDto,
    currentUser?: CurrentUser,
  ) {
    const createdBy = currentUser?.userId || currentUser?.email || "system";
    const updatedBy = createdBy;

    const dataToInsert = waterDataDto.map((dto) => ({
      waterDataId: `${ID_PREFIX}${generateId()}`,
      ...dto,
      measurementTime: new Date(dto.measurementTime),
      ph: dto.ph?.toString(),
      phMv: dto.phMv?.toString(),
      orp: dto.orp?.toString(),
      ec: dto.ec?.toString(),
      ecAbs: dto.ecAbs?.toString(),
      resistivity: dto.resistivity?.toString(),
      salinity: dto.salinity?.toString(),
      pressure: dto.pressure?.toString(),
      doPercent: dto.doPercent?.toString(),
      dissolvedOxygen: dto.dissolvedOxygen?.toString(),
      turbidity: dto.turbidity?.toString(),
      bod: dto.bod?.toString(),
      cod: dto.cod?.toString(),
      totalDissolvedSolids: dto.totalDissolvedSolids?.toString(),
      temperature: dto.temperature?.toString(),
      pointGeom: dto.pointGeom,
      waterSource: dto.waterSource,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy,
    }));

    const newWaterData = await db
      .insert(schema.waterData)
      .values(dataToInsert)
      .returning();

    return {
      message: "Water data created successfully",
      data: newWaterData,
    };
  }

  /**
   * Updates an existing water data record.
   * @param waterDataId - The ID of the water data record to update.
   * @param waterDataDto - The data for updating the water data record.
   * @param currentUser - The current authenticated user.
   * @returns The updated water data object.
   */
  async updateWaterData(
    waterDataId: string,
    waterDataDto: UpdateWaterDataDto,
    currentUser?: CurrentUser,
  ) {
    const updatedBy = currentUser?.userId || currentUser?.email || "system";

    const [updatedWaterData] = await db
      .update(schema.waterData)
      .set({
        ...waterDataDto,
        measurementTime: waterDataDto.measurementTime
          ? new Date(waterDataDto.measurementTime)
          : undefined,
        timeOfDay: waterDataDto.timeOfDay,
        locationType: waterDataDto.locationType,
        ph: waterDataDto.ph?.toString(),
        phMv: waterDataDto.phMv?.toString(),
        orp: waterDataDto.orp?.toString(),
        ec: waterDataDto.ec?.toString(),
        ecAbs: waterDataDto.ecAbs?.toString(),
        resistivity: waterDataDto.resistivity?.toString(),
        salinity: waterDataDto.salinity?.toString(),
        pressure: waterDataDto.pressure?.toString(),
        doPercent: waterDataDto.doPercent?.toString(),
        dissolvedOxygen: waterDataDto.dissolvedOxygen?.toString(),
        turbidity: waterDataDto.turbidity?.toString(),
        bod: waterDataDto.bod?.toString(),
        cod: waterDataDto.cod?.toString(),
        totalDissolvedSolids: waterDataDto.totalDissolvedSolids?.toString(),
        temperature: waterDataDto.temperature?.toString(),
        pointGeom: waterDataDto.pointGeom,
        waterSource: waterDataDto.waterSource,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(eq(schema.waterData.waterDataId, waterDataId))
      .returning();

    if (!updatedWaterData) {
      throw new Error("Water data not found");
    }

    return {
      message: "Water data updated successfully",
      data: updatedWaterData,
    };
  }

  /**
   * Deletes a water data record from the database.
   * @param waterDataId - The ID of the water data record to delete.
   * @param currentUser - The current authenticated user.
   */
  async deleteWaterData(waterDataId: string, currentUser?: CurrentUser) {
    const deleted = await db
      .delete(schema.waterData)
      .where(eq(schema.waterData.waterDataId, waterDataId))
      .returning();
    if (deleted.length === 0) {
      throw new Error("Water data not found");
    }
    return { message: "Water data deleted successfully" };
  }
}
