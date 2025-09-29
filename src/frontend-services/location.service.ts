import axios from "axios";
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationFilterDto,
} from "@/dtos/location.dto";
import {
  DataResponse,
  Location,
  PaginationResponse,
} from "@/types/common.types";

const API_BASE_URL = "/api/locations";

/**
 * Frontend service for interacting with location APIs.
 */
export class FrontendLocationService {
  /**
   * Fetches a paginated list of locations based on the provided filters.
   * @param token - The authentication token.
   * @param filter - The filtering and pagination options.
   * @returns A paginated list of locations.
   */
  async findAllLocations(
    token: string,
    filter: LocationFilterDto,
  ): Promise<PaginationResponse<Location>> {
    try {
      const queryParams = {
        page: filter?.page?.toString(),
        limit: filter?.limit?.toString(),
        search: filter?.search,
        category: filter?.category,
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
          "An error occurred while fetching locations.",
      );
    }
  }

  /**
   * Fetches a single location by its ID.
   * @param token - The authentication token.
   * @param locationId - The ID of the location to fetch.
   * @returns The location object.
   */
  async fetchLocationById(
    token: string,
    locationId: string,
  ): Promise<Location> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${locationId}`, {
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
   * Creates a new location.
   * @param token - The authentication token.
   * @param locationDto - The data for creating the new location.
   * @returns The newly created location object.
   */
  async createLocation(
    token: string,
    locationDto: CreateLocationDto,
  ): Promise<DataResponse<Location>> {
    try {
      const response = await axios.post(API_BASE_URL, locationDto, {
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
   * Updates an existing location.
   * @param token - The authentication token.
   * @param locationId - The ID of the location to update.
   * @param locationDto - The data for updating the location.
   * @returns The updated location object.
   */
  async updateLocation(
    token: string,
    locationId: string,
    locationDto: UpdateLocationDto,
  ): Promise<DataResponse<Location>> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${locationId}`,
        locationDto,
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
   * Deletes a location.
   * @param token - The authentication token.
   * @param locationId - The ID of the location to delete.
   */
  async deleteLocation(
    token: string,
    locationId: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${locationId}`, {
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

export const frontendLocationService = new FrontendLocationService();
