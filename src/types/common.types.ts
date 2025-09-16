/**
 * Defines the structure for pagination metadata.
 */
export interface PaginationMetadata {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Defines the structure for a paginated API response.
 */
export interface PaginationResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

/**
 * Defines the structure for a data API response.
 */
export interface DataResponse<T> {
  data: T;
  message: string;
}

/**
 * Defines the structure for a message API response.
 */
export interface MessageResponse {
  message: string;
}

export enum UserStatus {
  Active = "active",
  Banned = "banned",
  Suspended = "suspended",
  Online = "online",
  All = "All",
}

export enum RoleName {
  Authenticated = "Authenticated",
  IntegemsAdmin = "IntegemsAdmin",
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  All = "All",
}

export enum Category {
  Air = "air",
  Water = "water",
  Soil = "soil",
  Noise = "noise",
  Biodiversity = "biodiversity",
  Waste = "waste",
}

export enum LocationType {
  Industrial = "industrial",
  Residential = "residential",
  Commercial = "commercial",
  Rural = "rural",
}

export enum TimeOfDay {
  Day = "day",
  Evening = "evening",
  Night = "night",
}

export enum WaterSource {
  Surface = "surface",
  Underground = "underground",
}

export type GeometryPoint = [number, number];

export interface CurrentUser {
  userId?: string;
  email?: string;
  fullName?: string;
  image?: string;
  isAuthenticated: boolean;
  ip?: string;
  role?: RoleName;
  token?: string;
}

export interface User {
  userId: string;
  userIdSerial: number;
  firstName: string;
  middleName: string | null;
  fullName: string;
  lastName: string;
  profileImage: string | null;
  phoneNumber: string | null;
  status: UserStatus;
  password: string; // Added from schema
  gender: string | null;
  email: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  userRole?: UserRoles;
  userAuth?: UserAuths;
  locationsCreated?: Location[];
  airDataCreated?: AirData[];
  waterDataCreated?: WaterData[];
  soilDataCreated?: SoilData[];
  noiseDataCreated?: NoiseData[];
  biodiversityDataCreated?: BiodiversityData[];
  wasteDataCreated?: WasteData[];
}

export interface Role {
  roleId: string;
  roleIdSerial: number;
  roleName: RoleName;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  userRoles?: UserRoles[];
}

export interface UserRoles {
  userRoleId: string;
  userRoleIdSerial: number;
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  user?: User;
  role?: Role;
}

export interface UserAuths {
  userAuthId: string;
  userAuthIdSerial: number;
  userId: string;
  otp: string | null;
  otpExpiry: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  // Relations
  user?: User;
}

export interface Location {
  locationId: string;
  locationIdSerial: number;
  name: string;
  description: string | null;
  pointGeom: GeometryPoint | null;
  altitude: number | null;
  category: Category;
  locationType: LocationType | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  airData?: AirData[];
  waterData?: WaterData[];
  soilData?: SoilData[];
  noiseData?: NoiseData[];
  biodiversityData?: BiodiversityData[];
  wasteData?: WasteData[];
}

export interface AirData {
  airDataId: string;
  airDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  co: number | null;
  so2: number | null;
  temperature: number | null;
  humidity: number | null;
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}

export interface WaterData {
  waterDataId: string;
  waterDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  waterSource: WaterSource | null;
  ph: number | null;
  phMv: number | null;
  orp: number | null;
  ec: number | null;
  ecAbs: number | null;
  resistivity: number | null;
  salinity: number | null;
  pressure: number | null;
  doPercent: number | null;
  dissolvedOxygen: number | null;
  turbidity: number | null;
  bod: number | null;
  cod: number | null;
  totalDissolvedSolids: number | null;
  temperature: number | null;
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}

export interface SoilData {
  soilDataId: string;
  soilDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organicMatter: number | null;
  moisture: number | null;
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}

export interface NoiseData {
  noiseDataId: string;
  noiseDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  duration: string | null; // Interval in schema, represented as string
  laeq: number | null;
  lafMax: number | null;
  frequency: number | null;
  la10: number | null;
  la90: number | null;
  lafMin: number | null;
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}

export interface BiodiversityData {
  biodiversityDataId: string;
  biodiversityDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  speciesCount: number | null;
  shannonIndex: number | null;
  observations: unknown | null; // JSONB
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}

export interface WasteData {
  wasteDataId: string;
  wasteDataIdSerial: number;
  locationId: string | null;
  pointGeom: GeometryPoint | null;
  measurementTime: string;
  timeOfDay: TimeOfDay | null; // Updated to use TimeOfDay enum
  locationType: LocationType | null; // Updated to use LocationType enum
  solidWasteKg: number | null;
  hazardousWasteKg: number | null;
  recycledWasteKg: number | null;
  organicWasteKg: number | null;
  paperWasteKg: number | null;
  plasticWasteKg: number | null;
  cansWasteKg: number | null;
  bottlesWasteKg: number | null;
  eWasteKg: number | null;
  scrapMetalKg: number | null;
  notes: string | null;
  photos: unknown | null; // JSONB
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string;
  // Relations
  location?: Location;
}
