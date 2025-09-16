import axios from "axios";
import {
  CreateWaterDataDto,
  UpdateWaterDataDto,
  WaterDataFilterDto,
} from "@/dtos/water.dto";
import {
  WaterData,
  PaginationResponse,
  DataResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/water";

/**
 * Frontend service for interacting with water data APIs.
 */
export class FrontendWaterService {
  /**
   * Fetches a paginated list of water data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of water data.
   */
  async findAllWaterData(
    token: string,
    filter: WaterDataFilterDto = {},
  ): Promise<PaginationResponse<WaterData>> {
    try {
      const queryParams = {
        page: filter?.page?.toString(),
        limit: filter?.limit?.toString(),
        search: filter?.search,
        locationIds: filter?.locationIds,
        startDate: filter?.startDate,
        endDate: filter?.endDate,
        timeOfDay: filter?.timeOfDay,
        locationType: filter?.locationType,
      };
      const response = await axios.get(API_BASE_URL, {
        params: queryParams,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "An error occurred while fetching water data.",
      );
    }
  }

  /**
   * Fetches a single water data record by its ID.
   * @param token - The authentication token.
   * @param waterDataId - The ID of the water data record to fetch.
   * @returns The water data object.
   */
  async fetchWaterDataById(
    token: string,
    waterDataId: string,
  ): Promise<WaterData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${waterDataId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new water data record.
   * @param token - The authentication token.
   * @param waterDataDto - The data for creating the new water data record.
   * @returns The newly created water data object.
   */
  async createWaterData(
    token: string,
    waterDataDto: CreateWaterDataDto,
  ): Promise<DataResponse<WaterData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, waterDataDto, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an existing water data record.
   * @param token - The authentication token.
   * @param waterDataId - The ID of the water data record to update.
   * @param waterDataDto - The data for updating the water data record.
   * @returns The updated water data object.
   */
  async updateWaterData(
    token: string,
    waterDataId: string,
    waterDataDto: UpdateWaterDataDto,
  ): Promise<DataResponse<WaterData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${waterDataId}`,
        waterDataDto,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a water data record.
   * @param token - The authentication token.
   * @param waterDataId - The ID of the water data record to delete.
   */
  async deleteWaterData(
    token: string,
    waterDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${waterDataId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const frontendWaterService = new FrontendWaterService();
