import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  geometry,
  numeric,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "banned",
  "suspended",
  "online",
]);
export const roleNameEnum = pgEnum("role_name", [
  "Authenticated",
  "IntegemsAdmin",
  "SuperAdmin",
  "Admin",
]);
export const categoryEnum = pgEnum("category", [
  "air",
  "water",
  "soil",
  "noise",
  "biodiversity",
  "waste",
]);

export const users = pgTable(
  "users",
  {
    userId: varchar("user_id", { length: 25 }).primaryKey(),
    userIdSerial: serial("user_id_serial").unique(),
    firstName: varchar("first_name").notNull(),
    middleName: varchar("middle_name"),
    fullName: varchar("full_name").notNull(),
    lastName: varchar("last_name").notNull(),
    profileImage: text("profile_image"),
    phoneNumber: varchar("phone_number"),
    status: userStatusEnum("status").default("active"),
    password: varchar("password").notNull(),
    gender: varchar("gender"),
    email: varchar("email").notNull().unique(),
    verified: boolean("verified").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_users_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type User = typeof users.$inferSelect;

export const roles = pgTable(
  "roles",
  {
    roleId: varchar("role_id", { length: 25 }).primaryKey(),
    roleIdSerial: serial("role_id_serial").unique(),
    roleName: roleNameEnum("role_name").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_roles_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userRoleId: varchar("user_role_id", { length: 25 }).primaryKey(),
    userRoleIdSerial: serial("user_role_id_serial").unique(),
    userId: varchar("user_id", { length: 25 })
      .notNull()
      .references(() => users.userId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roleId: varchar("role_id", { length: 25 })
      .notNull()
      .references(() => roles.roleId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_user_roles_user_id").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
    index("idx_user_roles_role_id").using(
      "btree",
      table.roleId.asc().nullsLast(),
    ),
    index("idx_user_roles_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export const userAuths = pgTable(
  "user_auths",
  {
    userAuthId: varchar("user_auth_id", { length: 25 }).primaryKey(),
    userAuthIdSerial: serial("user_auth_id_serial").unique(),
    userId: varchar("user_id", { length: 25 })
      .notNull()
      .unique()
      .references(() => users.userId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    otp: text("otp"),
    otpExpiry: timestamp("otp_expiry", { mode: "date" }),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
    lastLoginIp: text("last_login_ip"),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_auths_user_id").using(
      "btree",
      table.userId.asc().nullsLast(),
    ),
    index("idx_user_auths_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export const locations = pgTable(
  "locations",
  {
    locationId: varchar("location_id", { length: 25 }).primaryKey(),
    locationIdSerial: serial("location_id_serial").unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    geom: geometry("geom", { type: "polygon", srid: 4326, mode: "tuple" }),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    altitude: numeric("altitude", { precision: 10, scale: 2 }),
    category: categoryEnum("category").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_locations_geom").using("gist", table.geom),
    index("idx_locations_point_geom").using("gist", table.pointGeom),
    index("idx_locations_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export const airData = pgTable(
  "air_data",
  {
    airDataId: varchar("air_data_id", { length: 25 }).primaryKey(),
    airDataIdSerial: serial("air_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    pm25: numeric("pm25", { precision: 10, scale: 2 }),
    pm10: numeric("pm10", { precision: 10, scale: 2 }),
    no2: numeric("no2", { precision: 10, scale: 2 }),
    o3: numeric("o3", { precision: 10, scale: 2 }),
    co: numeric("co", { precision: 10, scale: 2 }),
    so2: numeric("so2", { precision: 10, scale: 2 }),
    temperature: numeric("temperature", { precision: 10, scale: 2 }),
    humidity: numeric("humidity", { precision: 5, scale: 2 }),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_air_data_point_geom").using("gist", table.pointGeom),
    index("idx_air_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_air_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type AirData = typeof airData.$inferSelect;

export const waterData = pgTable(
  "water_data",
  {
    waterDataId: varchar("water_data_id", { length: 25 }).primaryKey(),
    waterDataIdSerial: serial("water_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    ph: numeric("ph", { precision: 5, scale: 2 }),
    dissolvedOxygen: numeric("dissolved_oxygen", { precision: 10, scale: 2 }),
    turbidity: numeric("turbidity", { precision: 10, scale: 2 }),
    bod: numeric("bod", { precision: 10, scale: 2 }),
    cod: numeric("cod", { precision: 10, scale: 2 }),
    totalDissolvedSolids: numeric("total_dissolved_solids", {
      precision: 10,
      scale: 2,
    }),
    temperature: numeric("temperature", { precision: 10, scale: 2 }),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_water_data_point_geom").using("gist", table.pointGeom),
    index("idx_water_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_water_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type WaterData = typeof waterData.$inferSelect;

export const soilData = pgTable(
  "soil_data",
  {
    soilDataId: varchar("soil_data_id", { length: 25 }).primaryKey(),
    soilDataIdSerial: serial("soil_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    ph: numeric("ph", { precision: 5, scale: 2 }),
    nitrogen: numeric("nitrogen", { precision: 10, scale: 2 }),
    phosphorus: numeric("phosphorus", { precision: 10, scale: 2 }),
    potassium: numeric("potassium", { precision: 10, scale: 2 }),
    organicMatter: numeric("organic_matter", { precision: 10, scale: 2 }),
    moisture: numeric("moisture", { precision: 5, scale: 2 }),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_soil_data_point_geom").using("gist", table.pointGeom),
    index("idx_soil_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_soil_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type SoilData = typeof soilData.$inferSelect;

export const noiseData = pgTable(
  "noise_data",
  {
    noiseDataId: varchar("noise_data_id", { length: 25 }).primaryKey(),
    noiseDataIdSerial: serial("noise_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    dbA: numeric("db_a", { precision: 10, scale: 2 }),
    dbC: numeric("db_c", { precision: 10, scale: 2 }),
    peak: numeric("peak", { precision: 10, scale: 2 }),
    frequency: numeric("frequency", { precision: 10, scale: 2 }),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_noise_data_point_geom").using("gist", table.pointGeom),
    index("idx_noise_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_noise_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type NoiseData = typeof noiseData.$inferSelect;

export const biodiversityData = pgTable(
  "biodiversity_data",
  {
    biodiversityDataId: varchar("biodiversity_data_id", {
      length: 25,
    }).primaryKey(),
    biodiversityDataIdSerial: serial("biodiversity_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    speciesCount: integer("species_count"),
    shannonIndex: numeric("shannon_index", { precision: 5, scale: 2 }),
    observations: jsonb("observations"),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_biodiversity_data_point_geom").using("gist", table.pointGeom),
    index("idx_biodiversity_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_biodiversity_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type BiodiversityData = typeof biodiversityData.$inferSelect;

export const wasteData = pgTable(
  "waste_data",
  {
    wasteDataId: varchar("waste_data_id", { length: 25 }).primaryKey(),
    wasteDataIdSerial: serial("waste_data_id_serial").unique(),
    locationId: varchar("location_id", { length: 25 }).references(
      () => locations.locationId,
      { onDelete: "set null" },
    ),
    pointGeom: geometry("point_geom", { type: "point", srid: 4326 }),
    measurementTime: timestamp("measurement_time", { mode: "date" }).notNull(),
    solidWasteKg: numeric("solid_waste_kg", { precision: 10, scale: 2 }),
    hazardousWasteKg: numeric("hazardous_waste_kg", {
      precision: 10,
      scale: 2,
    }),
    recycledWasteKg: numeric("recycled_waste_kg", { precision: 10, scale: 2 }),
    organicWasteKg: numeric("organic_waste_kg", { precision: 10, scale: 2 }),
    plasticWasteKg: numeric("plastic_waste_kg", { precision: 10, scale: 2 }),
    notes: text("notes"),
    photos: jsonb("photos"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    createdBy: varchar("created_by", { length: 80 }).notNull(),
    updatedBy: varchar("updated_by", { length: 80 }).notNull(),
  },
  (table) => [
    index("idx_waste_data_point_geom").using("gist", table.pointGeom),
    index("idx_waste_data_location_id").using(
      "btree",
      table.locationId.asc().nullsLast(),
    ),
    index("idx_waste_data_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast(),
    ),
  ],
);

export type WasteData = typeof wasteData.$inferSelect;

// Define relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  userRole: one(userRoles),
  userAuth: one(userAuths),
  airDataCreated: many(airData),
  waterDataCreated: many(waterData),
  soilDataCreated: many(soilData),
  noiseDataCreated: many(noiseData),
  biodiversityDataCreated: many(biodiversityData),
  wasteDataCreated: many(wasteData),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.userId],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.roleId],
  }),
}));

export const userAuthsRelations = relations(userAuths, ({ one }) => ({
  user: one(users, {
    fields: [userAuths.userId],
    references: [users.userId],
  }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  airData: many(airData),
  waterData: many(waterData),
  soilData: many(soilData),
  noiseData: many(noiseData),
  biodiversityData: many(biodiversityData),
  wasteData: many(wasteData),
}));

export const airDataRelations = relations(airData, ({ one }) => ({
  location: one(locations, {
    fields: [airData.locationId],
    references: [locations.locationId],
  }),
}));

export const waterDataRelations = relations(waterData, ({ one }) => ({
  location: one(locations, {
    fields: [waterData.locationId],
    references: [locations.locationId],
  }),
}));

export const soilDataRelations = relations(soilData, ({ one }) => ({
  location: one(locations, {
    fields: [soilData.locationId],
    references: [locations.locationId],
  }),
}));

export const noiseDataRelations = relations(noiseData, ({ one }) => ({
  location: one(locations, {
    fields: [noiseData.locationId],
    references: [locations.locationId],
  }),
}));

export const biodiversityDataRelations = relations(
  biodiversityData,
  ({ one }) => ({
    location: one(locations, {
      fields: [biodiversityData.locationId],
      references: [locations.locationId],
    }),
  }),
);

export const wasteDataRelations = relations(wasteData, ({ one }) => ({
  location: one(locations, {
    fields: [wasteData.locationId],
    references: [locations.locationId],
  }),
}));
