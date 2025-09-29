import { customAlphabet } from "nanoid";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcrypt";
import * as schema from "../src/database/drizzle/schema";
import { config } from "../src/config/config";

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
        phoneNumber: "+23276000001",
        role: "SuperAdmin",
        password: "admin123",
      },
      {
        email: "admin1@example.com",
        firstName: "Admin",
        lastName: "User",
        fullName: "Admin User",
        phoneNumber: "+23276000002",
        role: "Admin",
        password: "admin123",
      },
      {
        email: "staff@example.com",
        firstName: "Staff",
        lastName: "User",
        fullName: "Staff User",
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

      await db.insert(schema.userRoles).values({
        userRoleId: `int${generateId()}`,
        userId,
        roleId: roles[userData.role],
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });

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
      const pointCoords: [number, number] = [
        city.lon + (Math.random() * 0.01 - 0.005),
        city.lat + (Math.random() * 0.01 - 0.005),
      ];

      const locationTypes = [
        "industrial",
        "residential",
        "commercial",
        "rural",
      ];

      await db.insert(schema.locations).values({
        locationId,
        name: `${city.name} Monitoring Station`,
        description: `Environmental monitoring station in ${city.name}`,
        pointGeom: pointCoords,
        altitude: (Math.random() * 100).toString(),
        category: city.category as any,
        locationType: locationTypes[
          Math.floor(Math.random() * locationTypes.length)
        ] as any,
        createdBy: "system",
        createdAt: now,
        updatedBy: "system",
        updatedAt: now,
      });
      locations[city.name] = locationId;
    }

    // Seed environmental data
    const categories = [
      "air",
      "water",
      "soil",
      "noise",
      "biodiversity",
      "waste",
    ];

    for (const cityName in locations) {
      const locationId = locations[cityName];
      const city = cities.find((c) => c.name === cityName);
      if (!city) continue;

      for (let i = 0; i < 12; i++) {
        // For each of the last 12 months
        const measurementTime = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          Math.floor(Math.random() * 28) + 1,
        );

        for (const category of categories) {
          const pointCoords: [number, number] = [
            city.lon + (Math.random() * 0.01 - 0.005),
            city.lat + (Math.random() * 0.01 - 0.005),
          ];

          if (category === "air") {
            const timeOfDays = ["day", "evening", "night"];
            const locationTypes = [
              "industrial",
              "residential",
              "commercial",
              "rural",
            ];
            await db.insert(schema.airData).values({
              airDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              timeOfDay: timeOfDays[
                Math.floor(Math.random() * timeOfDays.length)
              ] as any,
              locationType: locationTypes[
                Math.floor(Math.random() * locationTypes.length)
              ] as any,
              pm25: (Math.random() * 100).toString(),
              pm10: (Math.random() * 150).toString(),
              no2: (Math.random() * 50).toString(),
              o3: (Math.random() * 80).toString(),
              co: (Math.random() * 10).toString(),
              so2: (Math.random() * 20).toString(),
              temperature: (Math.random() * 40).toString(),
              humidity: (Math.random() * 100).toString(),
              notes: `Air quality measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          } else if (category === "water") {
            const waterSources = ["surface", "underground"];
            await db.insert(schema.waterData).values({
              waterDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              ph: (6 + Math.random() * 2).toString(),
              phMv: (Math.random() * 100).toString(),
              orp: (Math.random() * 200).toString(),
              ec: (Math.random() * 1000).toString(),
              ecAbs: (Math.random() * 1000).toString(),
              resistivity: (Math.random() * 100).toString(),
              salinity: (Math.random() * 40).toString(),
              pressure: (Math.random() * 100).toString(),
              doPercent: (Math.random() * 100).toString(),
              dissolvedOxygen: (Math.random() * 10).toString(),
              turbidity: (Math.random() * 50).toString(),
              bod: (Math.random() * 20).toString(),
              cod: (Math.random() * 50).toString(),
              totalDissolvedSolids: (Math.random() * 1000).toString(),
              temperature: (Math.random() * 30).toString(),
              waterSource: waterSources[
                Math.floor(Math.random() * waterSources.length)
              ] as any,
              notes: `Water quality measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          } else if (category === "soil") {
            const timeOfDays = ["day", "evening", "night"];
            const locationTypes = [
              "industrial",
              "residential",
              "commercial",
              "rural",
            ];
            await db.insert(schema.soilData).values({
              soilDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              timeOfDay: timeOfDays[
                Math.floor(Math.random() * timeOfDays.length)
              ] as any,
              locationType: locationTypes[
                Math.floor(Math.random() * locationTypes.length)
              ] as any,
              ph: (5 + Math.random() * 3).toString(),
              nitrogen: (Math.random() * 100).toString(),
              phosphorus: (Math.random() * 50).toString(),
              potassium: (Math.random() * 200).toString(),
              organicMatter: (Math.random() * 10).toString(),
              moisture: (Math.random() * 50).toString(),
              notes: `Soil quality measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          } else if (category === "noise") {
            const timeOfDays = ["day", "evening", "night"];
            await db.insert(schema.noiseData).values({
              noiseDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              laeq: (40 + Math.random() * 60).toString(),
              lafMax: (50 + Math.random() * 50).toString(),
              la10: (60 + Math.random() * 40).toString(),
              la90: (30 + Math.random() * 40).toString(),
              lafMin: (20 + Math.random() * 30).toString(),
              timeOfDay: timeOfDays[
                Math.floor(Math.random() * timeOfDays.length)
              ] as any,
              duration: `${Math.floor(Math.random() * 59) + 1} minutes`,
              frequency: (20 + Math.random() * 980).toString(),
              notes: `Noise measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          } else if (category === "biodiversity") {
            const timeOfDays = ["day", "evening", "night"];
            const locationTypes = [
              "industrial",
              "residential",
              "commercial",
              "rural",
            ];
            await db.insert(schema.biodiversityData).values({
              biodiversityDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              timeOfDay: timeOfDays[
                Math.floor(Math.random() * timeOfDays.length)
              ] as any,
              locationType: locationTypes[
                Math.floor(Math.random() * locationTypes.length)
              ] as any,
              speciesCount: Math.floor(Math.random() * 50) + 10,
              shannonIndex: (Math.random() * 4).toString(),
              observations: [
                { species: "Oak", count: Math.floor(Math.random() * 10) },
                { species: "Pine", count: Math.floor(Math.random() * 10) },
              ],
              notes: `Biodiversity measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          } else if (category === "waste") {
            const timeOfDays = ["day", "evening", "night"];
            const locationTypes = [
              "industrial",
              "residential",
              "commercial",
              "rural",
            ];
            await db.insert(schema.wasteData).values({
              wasteDataId: `int${generateId()}`,
              locationId,
              pointGeom: pointCoords,
              measurementTime,
              timeOfDay: timeOfDays[
                Math.floor(Math.random() * timeOfDays.length)
              ] as any,
              locationType: locationTypes[
                Math.floor(Math.random() * locationTypes.length)
              ] as any,
              solidWasteKg: (Math.random() * 1000).toString(),
              hazardousWasteKg: (Math.random() * 100).toString(),
              recycledWasteKg: (Math.random() * 500).toString(),
              organicWasteKg: (Math.random() * 600).toString(),
              plasticWasteKg: (Math.random() * 400).toString(),
              paperWasteKg: (Math.random() * 200).toString(),
              cansWasteKg: (Math.random() * 50).toString(),
              bottlesWasteKg: (Math.random() * 75).toString(),
              eWasteKg: (Math.random() * 30).toString(),
              scrapMetalKg: (Math.random() * 150).toString(),
              notes: `Waste measurement in ${city.name}`,
              photos: ["https://picsum.photos/400/300"],
              createdBy: "system",
              createdAt: now,
              updatedBy: "system",
              updatedAt: now,
            });
          }
        }
      }
    }

    console.log("✅ Database seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
