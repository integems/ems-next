CREATE TYPE "public"."category" AS ENUM('air', 'water', 'soil', 'noise', 'biodiversity', 'waste');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('Authenticated', 'IntegemsAdmin', 'SuperAdmin', 'Admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'banned', 'suspended', 'online');--> statement-breakpoint
CREATE TABLE "air_data" (
	"air_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"air_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"pm25" numeric(10, 2),
	"pm10" numeric(10, 2),
	"no2" numeric(10, 2),
	"o3" numeric(10, 2),
	"co" numeric(10, 2),
	"so2" numeric(10, 2),
	"temperature" numeric(10, 2),
	"humidity" numeric(5, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "air_data_air_data_id_serial_unique" UNIQUE("air_data_id_serial")
);
--> statement-breakpoint
CREATE TABLE "biodiversity_data" (
	"biodiversity_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"biodiversity_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"species_count" integer,
	"shannon_index" numeric(5, 2),
	"observations" jsonb,
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "biodiversity_data_biodiversity_data_id_serial_unique" UNIQUE("biodiversity_data_id_serial")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"location_id" varchar(25) PRIMARY KEY NOT NULL,
	"location_id_serial" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"geom" geometry(point),
	"point_geom" geometry(point),
	"altitude" numeric(10, 2),
	"category" "category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "locations_location_id_serial_unique" UNIQUE("location_id_serial")
);
--> statement-breakpoint
CREATE TABLE "noise_data" (
	"noise_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"noise_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"db_a" numeric(10, 2),
	"db_c" numeric(10, 2),
	"peak" numeric(10, 2),
	"frequency" numeric(10, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "noise_data_noise_data_id_serial_unique" UNIQUE("noise_data_id_serial")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" varchar(25) PRIMARY KEY NOT NULL,
	"role_id_serial" serial NOT NULL,
	"role_name" "role_name" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "roles_role_id_serial_unique" UNIQUE("role_id_serial")
);
--> statement-breakpoint
CREATE TABLE "soil_data" (
	"soil_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"soil_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"ph" numeric(5, 2),
	"nitrogen" numeric(10, 2),
	"phosphorus" numeric(10, 2),
	"potassium" numeric(10, 2),
	"organic_matter" numeric(10, 2),
	"moisture" numeric(5, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "soil_data_soil_data_id_serial_unique" UNIQUE("soil_data_id_serial")
);
--> statement-breakpoint
CREATE TABLE "user_auths" (
	"user_auth_id" varchar(25) PRIMARY KEY NOT NULL,
	"user_auth_id_serial" serial NOT NULL,
	"user_id" varchar(25) NOT NULL,
	"otp" text,
	"otp_expiry" timestamp,
	"last_login_at" timestamp,
	"last_login_ip" text,
	"created_by" varchar(80) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_auths_user_auth_id_serial_unique" UNIQUE("user_auth_id_serial"),
	CONSTRAINT "user_auths_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_role_id" varchar(25) PRIMARY KEY NOT NULL,
	"user_role_id_serial" serial NOT NULL,
	"user_id" varchar(25) NOT NULL,
	"role_id" varchar(25) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "user_roles_user_role_id_serial_unique" UNIQUE("user_role_id_serial")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" varchar(25) PRIMARY KEY NOT NULL,
	"user_id_serial" serial NOT NULL,
	"first_name" varchar NOT NULL,
	"middle_name" varchar,
	"full_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"profile_image" text,
	"phone_number" varchar,
	"status" "user_status" DEFAULT 'active',
	"password" varchar NOT NULL,
	"gender" varchar,
	"email" varchar NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "users_user_id_serial_unique" UNIQUE("user_id_serial"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waste_data" (
	"waste_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"waste_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"solid_waste_kg" numeric(10, 2),
	"hazardous_waste_kg" numeric(10, 2),
	"recycled_waste_kg" numeric(10, 2),
	"organic_waste_kg" numeric(10, 2),
	"plastic_waste_kg" numeric(10, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "waste_data_waste_data_id_serial_unique" UNIQUE("waste_data_id_serial")
);
--> statement-breakpoint
CREATE TABLE "water_data" (
	"water_data_id" varchar(25) PRIMARY KEY NOT NULL,
	"water_data_id_serial" serial NOT NULL,
	"location_id" varchar(25),
	"point_geom" geometry(point),
	"measurement_time" timestamp NOT NULL,
	"ph" numeric(5, 2),
	"dissolved_oxygen" numeric(10, 2),
	"turbidity" numeric(10, 2),
	"bod" numeric(10, 2),
	"cod" numeric(10, 2),
	"total_dissolved_solids" numeric(10, 2),
	"temperature" numeric(10, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" varchar(80) NOT NULL,
	"updated_by" varchar(80) NOT NULL,
	CONSTRAINT "water_data_water_data_id_serial_unique" UNIQUE("water_data_id_serial")
);
--> statement-breakpoint
ALTER TABLE "air_data" ADD CONSTRAINT "air_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biodiversity_data" ADD CONSTRAINT "biodiversity_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noise_data" ADD CONSTRAINT "noise_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soil_data" ADD CONSTRAINT "soil_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auths" ADD CONSTRAINT "user_auths_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "waste_data" ADD CONSTRAINT "waste_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_data" ADD CONSTRAINT "water_data_location_id_locations_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("location_id") ON DELETE set null ON UPDATE no action;