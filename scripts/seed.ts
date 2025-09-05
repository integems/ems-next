import { customAlphabet } from "nanoid";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcrypt";
import * as schema from "../src/database/drizzle/schema";
import { config } from "../src/config/config";
import { sql } from "drizzle-orm";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

const pool = new Pool({
  host: config.getEnv("POSTGRES_HOST") as string,
  port: config.getEnv("POSTGRES_PORT") as number,
  database: config.getEnv("POSTGRES_DB") as string,
  user: config.getEnv("POSTGRES_USER") as string,
  password: config.getEnv("POSTGRES_PASSWORD") as string,
});

const db = drizzle(pool, { schema });

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedDatabase() {
  try {
    const now = new Date();

    // Seed roles
    const roleNames = ["Authenticated", "IntegemsAdmin", "SuperAdmin", "Admin"];
    const roles: { [key: string]: string } = {};

    for (const name of roleNames) {
      const roleId = `int${generateId()}`;
      await db.insert(schema.roles).values({
        roleId,
        roleName: name as any,
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });
      roles[name] = roleId;
    }

    // Seed users
    const usersData = [
      {
        email: "admin@example.com",
        firstName: "Super",
        lastName: "Admin",
        fullName: "Super Admin",
        middleName: null,
        phoneNumber: "+23276000001",
        role: "SuperAdmin",
        password: "admin123",
      },
      {
        email: "admin1@example.com",
        firstName: "Admin",
        lastName: "User",
        fullName: "Admin User",
        middleName: null,
        phoneNumber: "+23276000002",
        role: "Admin",
        password: "admin123",
      },
      {
        email: "staff@example.com",
        firstName: "Staff",
        lastName: "User",
        fullName: "Staff User",
        middleName: null,
        phoneNumber: "+23276000003",
        role: "Authenticated",
        password: "staff123",
      },
    ];

    const users: { [key: string]: string } = {};

    for (const userData of usersData) {
      const userId = `int${generateId()}`;
      await db.insert(schema.users).values({
        userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        middleName: userData.middleName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        password: await hashPassword(userData.password),
        status: "active",
        gender: "Male",
        profileImage: "https://picsum.photos/200/200",
        verified: false,
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });

      // Create user role
      await db.insert(schema.userRoles).values({
        userRoleId: `int${generateId()}`,
        userId,
        roleId: roles[userData.role],
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });

      // Create user auth
      await db.insert(schema.userAuths).values({
        userAuthId: `int${generateId()}`,
        userId,
        otp: null,
        otpExpiry: null,
        lastLoginAt: now,
        lastLoginIp: "127.0.0.1",
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });

      users[userData.email] = userId;
    }

    // Seed locations
    const cities = [
      { name: "Freetown", lon: -13.2356, lat: 8.4871, category: "air" },
      { name: "Bo", lon: -11.735, lat: 7.965, category: "water" },
      { name: "Kenema", lon: -11.19, lat: 7.876, category: "soil" },
      { name: "Makeni", lon: -12.044, lat: 8.881, category: "noise" },
      { name: "Koidu", lon: -10.971, lat: 8.645, category: "biodiversity" },
      { name: "Port Loko", lon: -12.787, lat: 8.766, category: "waste" },
    ];

    const locations: { [key: string]: string } = {};

    for (const city of cities) {
      const locationId = `int${generateId()}`;
      const baseLon = city.lon;
      const baseLat = city.lat;
      const offset = 0.01; // Larger area for location polygon
      const polygonWKT = `POLYGON((
        ${baseLon} ${baseLat},
        ${baseLon + offset} ${baseLat + offset},
        ${baseLon + offset} ${baseLat - offset},
        ${baseLon - offset} ${baseLat - offset},
        ${baseLon} ${baseLat}
      ))`;
      const pointCoords: [number, number] = [
        baseLon + (Math.random() * offset * 0.5 - offset * 0.25),
        baseLat + (Math.random() * offset * 0.5 - offset * 0.25),
      ];

      await db.insert(schema.locations).values({
        locationId,
        name: `${city.name} Monitoring Station`,
        description: `Environmental monitoring station in ${city.name}`,
        geom: sql`ST_GeomFromText(${polygonWKT}, 4326)`,
        pointGeom: pointCoords,
        altitude: (Math.random() * 100).toString(), // 0-100m
        category: city.category as any,
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });
      locations[city.name] = locationId;
    }

    // Seed environmental data (100 measurements per category, spread over 6 months)
    const startDate = new Date("2025-01-01T00:00:00Z");
    const endDate = new Date("2025-08-18T23:59:59Z");
    const timeIncrement = (endDate.getTime() - startDate.getTime()) / 100; // Spread 100 measurements

    const categories = [
      "air",
      "water",
      "soil",
      "noise",
      "biodiversity",
      "waste",
    ];

    for (const category of categories) {
      const city = cities.find((c) => c.category === category);
      if (!city) continue;
      const locationId = locations[city.name];

      for (let i = 0; i < 100; i++) {
        const measurementTime = new Date(
          startDate.getTime() + i * timeIncrement,
        );
        const baseLon = city.lon;
        const baseLat = city.lat;
        const offset = 0.005; // Small offset for measurement points
        const pointCoords: [number, number] = [
          baseLon + (Math.random() * offset * 2 - offset),
          baseLat + (Math.random() * offset * 2 - offset),
        ];

        if (category === "air") {
          await db.insert(schema.airData).values({
            airDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            pm25: (Math.random() * 100).toString(), // 0-100 µg/m³
            pm10: (Math.random() * 150).toString(), // 0-150 µg/m³
            no2: (Math.random() * 50).toString(), // 0-50 µg/m³
            o3: (Math.random() * 80).toString(), // 0-80 µg/m³
            co: (Math.random() * 10).toString(), // 0-10 mg/m³
            so2: (Math.random() * 20).toString(), // 0-20 µg/m³
            temperature: (Math.random() * 40).toString(), // 0-40 °C
            humidity: (Math.random() * 100).toString(), // 0-100%
            notes: `Air quality measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        } else if (category === "water") {
          await db.insert(schema.waterData).values({
            waterDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            ph: (6 + Math.random() * 2).toString(), // 6-8 pH
            dissolvedOxygen: (Math.random() * 10).toString(), // 0-10 mg/L
            turbidity: (Math.random() * 50).toString(), // 0-50 NTU
            bod: (Math.random() * 20).toString(), // 0-20 mg/L
            cod: (Math.random() * 50).toString(), // 0-50 mg/L
            totalDissolvedSolids: (Math.random() * 1000).toString(), // 0-1000 mg/L
            temperature: (Math.random() * 30).toString(), // 0-30 °C
            notes: `Water quality measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        } else if (category === "soil") {
          await db.insert(schema.soilData).values({
            soilDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            ph: (5 + Math.random() * 3).toString(), // 5-8 pH
            nitrogen: (Math.random() * 100).toString(), // 0-100 mg/kg
            phosphorus: (Math.random() * 50).toString(), // 0-50 mg/kg
            potassium: (Math.random() * 200).toString(), // 0-200 mg/kg
            organicMatter: (Math.random() * 10).toString(), // 0-10%
            moisture: (Math.random() * 50).toString(), // 0-50%
            notes: `Soil quality measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        } else if (category === "noise") {
          await db.insert(schema.noiseData).values({
            noiseDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            dbA: (40 + Math.random() * 60).toString(), // 40-100 dB
            dbC: (50 + Math.random() * 50).toString(), // 50-100 dB
            peak: (60 + Math.random() * 40).toString(), // 60-100 dB
            frequency: (20 + Math.random() * 980).toString(), // 20-1000 Hz
            notes: `Noise measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        } else if (category === "biodiversity") {
          await db.insert(schema.biodiversityData).values({
            biodiversityDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            speciesCount: Math.floor(Math.random() * 50) + 10, // 10-60 species (integer)
            shannonIndex: (Math.random() * 4).toString(), // 0-4
            observations: [
              { species: "Oak", count: Math.floor(Math.random() * 10) },
              { species: "Pine", count: Math.floor(Math.random() * 10) },
            ],
            notes: `Biodiversity measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        } else if (category === "waste") {
          await db.insert(schema.wasteData).values({
            wasteDataId: `int${generateId()}`,
            locationId,
            pointGeom: pointCoords,
            measurementTime,
            solidWasteKg: (Math.random() * 1000).toString(), // 0-1000 kg
            hazardousWasteKg: (Math.random() * 100).toString(), // 0-100 kg
            recycledWasteKg: (Math.random() * 500).toString(), // 0-500 kg
            organicWasteKg: (Math.random() * 600).toString(), // 0-600 kg
            plasticWasteKg: (Math.random() * 400).toString(), // 0-400 kg
            notes: `Waste measurement ${i + 1} in ${city.name}`,
            photos: ["https://picsum.photos/400/300"],
            createdBy: "system",
            createdAt: now,
            updatedBy: "system",
            updatedAt: now,
          });
        }
      }
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
