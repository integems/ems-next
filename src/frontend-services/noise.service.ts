import axios from "axios";
import {
  CreateNoiseDataDto,
  UpdateNoiseDataDto,
  NoiseDataFilterDto,
} from "@/dtos/noise.dto";
import {
  DataResponse,
  NoiseData,
  PaginationResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/noise";

/**
 * Frontend service for interacting with noise data APIs.
 */
export class FrontendNoiseService {
  /**
   * Fetches a paginated list of noise data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of noise data.
   */
  async findAllNoiseData(
    token: string,
    filter: NoiseDataFilterDto = {},
  ): Promise<PaginationResponse<NoiseData>> {
    try {
      const queryParams = {
        page: filter?.page?.toString(),
        limit: filter?.limit?.toString(),
        search: filter?.search,
        locationId: filter?.locationId,
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
          "An error occurred while fetching noise data.",
      );
    }
  }

  /**
   * Fetches a single noise data record by its ID.
   * @param token - The authentication token.
   * @param noiseDataId - The ID of the noise data record to fetch.
   * @returns The noise data object.
   */
  async fetchNoiseDataById(
    token: string,
    noiseDataId: string,
  ): Promise<NoiseData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${noiseDataId}`, {
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
   * Creates a new noise data record.
   * @param token - The authentication token.
   * @param noiseDataDto - The data for creating the new noise data record.
   * @returns The newly created noise data object.
   */
  async createNoiseData(
    token: string,
    noiseDataDto: CreateNoiseDataDto,
  ): Promise<DataResponse<NoiseData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, noiseDataDto, {
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
   * Updates an existing noise data record.
   * @param token - The authentication token.
   * @param noiseDataId - The ID of the noise data record to update.
   * @param noiseDataDto - The data for updating the noise data record.
   * @returns The updated noise data object.
   */
  async updateNoiseData(
    token: string,
    noiseDataId: string,
    noiseDataDto: UpdateNoiseDataDto,
  ): Promise<DataResponse<NoiseData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${noiseDataId}`,
        noiseDataDto,
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
   * Deletes a noise data record.
   * @param token - The authentication token.
   * @param noiseDataId - The ID of the noise data record to delete.
   */
  async deleteNoiseData(
    token: string,
    noiseDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${noiseDataId}`, {
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

export const frontendNoiseService = new FrontendNoiseService();
