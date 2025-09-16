import axios from "axios";
import {
  CreateSoilDataDto,
  UpdateSoilDataDto,
  SoilDataFilterDto,
} from "@/dtos/soil.dto";
import {
  SoilData,
  PaginationResponse,
  DataResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/soil";

/**
 * Frontend service for interacting with soil data APIs.
 */
export class FrontendSoilService {
  /**
   * Fetches a paginated list of soil data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of soil data.
   */
  async findAllSoilData(
    token: string,
    filter: SoilDataFilterDto = {},
  ): Promise<PaginationResponse<SoilData>> {
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
          "An error occurred while fetching soil data.",
      );
    }
  }

  /**
   * Fetches a single soil data record by its ID.
   * @param token - The authentication token.
   * @param soilDataId - The ID of the soil data record to fetch.
   * @returns The soil data object.
   */
  async fetchSoilDataById(
    token: string,
    soilDataId: string,
  ): Promise<SoilData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${soilDataId}`, {
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
   * Creates a new soil data record.
   * @param token - The authentication token.
   * @param soilDataDto - The data for creating the new soil data record.
   * @returns The newly created soil data object.
   */
  async createSoilData(
    token: string,
    soilDataDto: CreateSoilDataDto,
  ): Promise<DataResponse<SoilData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, soilDataDto, {
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
   * Updates an existing soil data record.
   * @param token - The authentication token.
   * @param soilDataId - The ID of the soil data record to update.
   * @param soilDataDto - The data for updating the soil data record.
   * @returns The updated soil data object.
   */
  async updateSoilData(
    token: string,
    soilDataId: string,
    soilDataDto: UpdateSoilDataDto,
  ): Promise<DataResponse<SoilData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${soilDataId}`,
        soilDataDto,
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
   * Deletes a soil data record.
   * @param token - The authentication token.
   * @param soilDataId - The ID of the soil data record to delete.
   */
  async deleteSoilData(
    token: string,
    soilDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${soilDataId}`, {
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

export const frontendSoilService = new FrontendSoilService();
