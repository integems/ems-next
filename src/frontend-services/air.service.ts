import axios from "axios";
import {
  CreateAirDataDto,
  UpdateAirDataDto,
  AirDataFilterDto,
} from "@/dtos/air.dto";
import {
  AirData,
  DataResponse,
  PaginationResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/air";

/**
 * Frontend service for interacting with air data APIs.
 */
export class FrontendAirService {
  /**
   * Fetches a paginated list of air data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of air data.
   */
  async findAllAirData(
    token: string,
    filter: AirDataFilterDto = {},
  ): Promise<PaginationResponse<AirData>> {
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
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 500) {
        throw new Error(
          "An internal server error occurred while fetching air data",
        );
      }
      throw error;
    }
  }

  /**
   * Fetches a single air data record by its ID.
   * @param token - The authentication token.
   * @param airDataId - The ID of the air data record to fetch.
   * @returns The air data object.
   */
  async fetchAirDataById(token: string, airDataId: string): Promise<AirData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${airDataId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new air data record.
   * @param token - The authentication token.
   * @param airDataDto - The data for creating the new air data record.
   * @returns The newly created air data object.
   */
  async createAirData(
    token: string,
    airDataDto: CreateAirDataDto,
  ): Promise<DataResponse<AirData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, airDataDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an existing air data record.
   * @param token - The authentication token.
   * @param airDataId - The ID of the air data record to update.
   * @param airDataDto - The data for updating the air data record.
   * @returns The updated air data object.
   */
  async updateAirData(
    token: string,
    airDataId: string,
    airDataDto: UpdateAirDataDto,
  ): Promise<DataResponse<AirData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${airDataId}`,
        airDataDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes an air data record.
   * @param token - The authentication token.
   * @param airDataId - The ID of the air data record to delete.
   */
  async deleteAirData(
    token: string,
    airDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${airDataId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const frontendAirService = new FrontendAirService();
