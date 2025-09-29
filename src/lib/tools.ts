import { tool as createTool } from "ai";
import { z } from "zod";
import { AirService } from "@/services/air.service";
import { WaterService } from "@/services/water.service";
import { SoilService } from "@/services/soil.service";
import { NoiseService } from "@/services/noise.service";
import { BiodiversityService } from "@/services/biodiversity.service";
import { WasteService } from "@/services/waste.service";
import { LocationService } from "@/services/location.service";
import { Category, LocationType, TimeOfDay } from "@/types/common.types";

const airService = new AirService();
const waterService = new WaterService();
const soilService = new SoilService();
const noiseService = new NoiseService();
const biodiversityService = new BiodiversityService();
const wasteService = new WasteService();
const locationService = new LocationService();

const commonInputSchema = {
  search: z.string().optional(),
  locationIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeOfDay: z.enum(TimeOfDay).optional(),
  locationType: z.enum(LocationType).optional(),
};

export const airDataTool = createTool({
  description:
    "Display air quality data for specified locations and time period",
  inputSchema: z.object(commonInputSchema),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
    };
    return await airService.findAllAirData(filter);
  },
});

export const waterDataTool = createTool({
  description:
    "Display water quality data for specified locations and time period",
  inputSchema: z.object({
    ...commonInputSchema,
    waterSource: z.enum(["surface", "underground"]).optional(),
  }),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
    waterSource,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
      waterSource,
    };
    return await waterService.findAllWaterData(filter);
  },
});

export const soilDataTool = createTool({
  description:
    "Display soil quality data for specified locations and time period",
  inputSchema: z.object(commonInputSchema),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
    };
    return await soilService.findAllSoilData(filter);
  },
});

export const noiseDataTool = createTool({
  description:
    "Display noise level data for specified locations and time period",
  inputSchema: z.object(commonInputSchema),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
    };
    return await noiseService.findAllNoiseData(filter);
  },
});

export const biodiversityDataTool = createTool({
  description:
    "Display biodiversity data for specified locations and time period",
  inputSchema: z.object(commonInputSchema),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
    };
    return await biodiversityService.findAllBiodiversityData(filter);
  },
});

export const wasteDataTool = createTool({
  description:
    "Display waste management data for specified locations and time period",
  inputSchema: z.object(commonInputSchema),
  execute: async function ({
    search,
    locationIds,
    startDate,
    endDate,
    timeOfDay,
    locationType,
  }) {
    const filter = {
      search,
      locationIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay,
      locationType,
    };
    return await wasteService.findAllWasteData(filter);
  },
});

export const locationTool = createTool({
  description: "Get location information based on search query or category",
  inputSchema: z.object({
    search: z.string().optional(),
    category: z.enum(Category).optional(),
  }),
  execute: async function ({ search, category }) {
    const filter = {
      search,
      category,
    };
    return await locationService.findAllLocations(filter);
  },
});

export const tools = {
  displayAirData: airDataTool,
  displayWaterData: waterDataTool,
  displaySoilData: soilDataTool,
  displayNoiseData: noiseDataTool,
  displayBiodiversityData: biodiversityDataTool,
  displayWasteData: wasteDataTool,
  displayLocationData: locationTool,
};
