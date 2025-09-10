import axios from "axios";
import {
  CreateBiodiversityDataDto,
  UpdateBiodiversityDataDto,
  BiodiversityDataFilterDto,
} from "@/dtos/biodiversity.dto";
import { BiodiversityData, DataResponse, PaginationResponse } from "@/types/common.types";

const API_BASE_URL = "/api/biodiversity";

/**
 * Frontend service for interacting with biodiversity data APIs.
 */
export class FrontendBiodiversityService {
  /**
   * Fetches a paginated list of biodiversity data based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of biodiversity data.
   */
  async findAllBiodiversityData(
    token: string,
    filter: BiodiversityDataFilterDto = {},
  ): Promise<PaginationResponse<BiodiversityData>> {
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
      throw new Error(
        error.response?.data?.message ||
          "An error occurred while fetching biodiversity data.",
      );
    }
  }

  /**
   * Fetches a single biodiversity data record by its ID.
   * @param token - The authentication token.
   * @param biodiversityDataId - The ID of the biodiversity data record to fetch.
   * @returns The biodiversity data object.
   */
  async fetchBiodiversityDataById(
    token: string,
    biodiversityDataId: string,
  ): Promise<BiodiversityData> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${biodiversityDataId}`,
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
   * Creates a new biodiversity data record.
   * @param token - The authentication token.
   * @param biodiversityDataDto - The data for creating the new biodiversity data record.
   * @returns The newly created biodiversity data object.
   */
  async createBiodiversityData(
    token: string,
    biodiversityDataDto: CreateBiodiversityDataDto,
  ): Promise<DataResponse<BiodiversityData[]>> {
    try {
      const response = await axios.post(API_BASE_URL, biodiversityDataDto, {
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
   * Updates an existing biodiversity data record.
   * @param token - The authentication token.
   * @param biodiversityDataId - The ID of the biodiversity data record to update.
   * @param biodiversityDataDto - The data for updating the biodiversity data record.
   * @returns The updated biodiversity data object.
   */
  async updateBiodiversityData(
    token: string,
    biodiversityDataId: string,
    biodiversityDataDto: UpdateBiodiversityDataDto,
  ): Promise<DataResponse<BiodiversityData>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${biodiversityDataId}`,
        biodiversityDataDto,
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
   * Deletes a biodiversity data record.
   * @param token - The authentication token.
   * @param biodiversityDataId - The ID of the biodiversity data record to delete.
   */
  async deleteBiodiversityData(
    token: string,
    biodiversityDataId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/${biodiversityDataId}`,
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
}

export const frontendBiodiversityService = new FrontendBiodiversityService();
