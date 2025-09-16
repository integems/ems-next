import axios from "axios";
import {
  CreateWasteDataDto,
  UpdateWasteDataDto,
  WasteDataFilterDto,
} from "@/dtos/waste.dto";
import {
  WasteData,
  PaginationResponse,
  DataResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/waste";

/**
 * Frontend service for interacting with waste data APIs.
 */
export class FrontendWasteService {
  /**
   * Fetches a paginated list of waste data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of waste data.
   */
  async findAllWasteData(
    token: string,
    filter: WasteDataFilterDto = {},
  ): Promise<PaginationResponse<WasteData>> {
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
          "An error occurred while fetching waste data.",
      );
    }
  }

  /**
   * Fetches a single waste data record by its ID.
   * @param token - The authentication token.
   * @param wasteDataId - The ID of the waste data record to fetch.
   * @returns The waste data object.
   */
  async fetchWasteDataById(
    token: string,
    wasteDataId: string,
  ): Promise<WasteData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${wasteDataId}`, {
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
   * Creates a new waste data record.
   * @param token - The authentication token.
   * @param wasteDataDto - The data for creating the new waste data record.
   * @returns The newly created waste data object.
   */
  async createWasteData(
    token: string,
    wasteDataDto: CreateWasteDataDto,
  ): Promise<DataResponse<WasteData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, wasteDataDto, {
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
   * Updates an existing waste data record.
   * @param token - The authentication token.
   * @param wasteDataId - The ID of the waste data record to update.
   * @param wasteDataDto - The data for updating the waste data record.
   * @returns The updated waste data object.
   */
  async updateWasteData(
    token: string,
    wasteDataId: string,
    wasteDataDto: UpdateWasteDataDto,
  ): Promise<DataResponse<WasteData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${wasteDataId}`,
        wasteDataDto,
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
   * Deletes a waste data record.
   * @param token - The authentication token.
   * @param wasteDataId - The ID of the waste data record to delete.
   */
  async deleteWasteData(
    token: string,
    wasteDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${wasteDataId}`, {
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

export const frontendWasteService = new FrontendWasteService();
