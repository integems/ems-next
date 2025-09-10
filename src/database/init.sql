
-- Enable PostGIS extension (run once per database)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Role
CREATE ROLE ems LOGIN PASSWORD 'ems';
ALTER ROLE ems SET TIME ZONE 'UTC';

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Create ENUM types in public schema
CREATE TYPE public.user_status AS ENUM ('active', 'banned', 'suspended', 'online');
CREATE TYPE public.role_name AS ENUM ('Authenticated', 'IntegemsAdmin', 'SuperAdmin', 'Admin');
CREATE TYPE public.category AS ENUM ('air', 'water', 'soil', 'noise', 'biodiversity', 'waste');
CREATE TYPE public.location_type AS ENUM ('industrial', 'residential', 'commercial', 'rural');
CREATE TYPE public.time_of_day AS ENUM ('day', 'evening', 'night');
CREATE TYPE public.water_source AS ENUM ('surface', 'underground');

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    user_id VARCHAR(25) PRIMARY KEY,
    user_id_serial SERIAL UNIQUE,
    first_name VARCHAR NOT NULL,
    middle_name VARCHAR,
    full_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    profile_image TEXT,
    phone_number VARCHAR,
    status public.user_status DEFAULT 'active',
    password VARCHAR NOT NULL,
    gender VARCHAR,
    email VARCHAR NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    role_id VARCHAR(25) PRIMARY KEY,
    role_id_serial SERIAL UNIQUE,
    role_name public.role_name NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_role_id VARCHAR(25) PRIMARY KEY,
    user_role_id_serial SERIAL UNIQUE,
    user_id VARCHAR(25) NOT NULL,
    role_id VARCHAR(25) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create user_auths table
CREATE TABLE IF NOT EXISTS public.user_auths (
    user_auth_id VARCHAR(25) PRIMARY KEY,
    user_auth_id_serial SERIAL UNIQUE,
    user_id VARCHAR(25) NOT NULL UNIQUE,
    otp TEXT,
    otp_expiry TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    created_by VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(80) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    location_id VARCHAR(25) PRIMARY KEY,
    location_id_serial SERIAL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    geom geometry(POLYGON, 4326),
    point_geom geometry(POINT, 4326),
    altitude NUMERIC(10, 2),
    category public.category NOT NULL,
    location_type public.location_type,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL
);

-- Create air_data table
CREATE TABLE IF NOT EXISTS public.air_data (
    air_data_id VARCHAR(25) PRIMARY KEY,
    air_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    pm25 NUMERIC(10, 2),
    pm10 NUMERIC(10, 2),
    no2 NUMERIC(10, 2),
    o3 NUMERIC(10, 2),
    co NUMERIC(10, 2),
    so2 NUMERIC(10, 2),
    temperature NUMERIC(10, 2),
    humidity NUMERIC(5, 2),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create water_data table
CREATE TABLE IF NOT EXISTS public.water_data (
    water_data_id VARCHAR(25) PRIMARY KEY,
    water_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    water_source public.water_source,
    ph NUMERIC(5, 2),
    ph_mv NUMERIC(10, 2),
    orp NUMERIC(10, 2),
    ec NUMERIC(10, 2),
    ec_abs NUMERIC(10, 2),
    resistivity NUMERIC(10, 2),
    salinity NUMERIC(10, 2),
    pressure NUMERIC(10, 2),
    do_percent NUMERIC(10, 2),
    dissolved_oxygen NUMERIC(10, 2),
    turbidity NUMERIC(10, 2),
    bod NUMERIC(10, 2),
    cod NUMERIC(10, 2),
    total_dissolved_solids NUMERIC(10, 2),
    temperature NUMERIC(10, 2),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create soil_data table
CREATE TABLE IF NOT EXISTS public.soil_data (
    soil_data_id VARCHAR(25) PRIMARY KEY,
    soil_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    ph NUMERIC(5, 2),
    nitrogen NUMERIC(10, 2),
    phosphorus NUMERIC(10, 2),
    potassium NUMERIC(10, 2),
    organic_matter NUMERIC(10, 2),
    moisture NUMERIC(5, 2),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create noise_data table
CREATE TABLE IF NOT EXISTS public.noise_data (
    noise_data_id VARCHAR(25) PRIMARY KEY,
    noise_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    duration INTERVAL,
    laeq NUMERIC(10, 2),
    laf_max NUMERIC(10, 2),
    frequency NUMERIC(10, 2),
    la10 NUMERIC(10, 2),
    la90 NUMERIC(10, 2),
    laf_min NUMERIC(10, 2),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create biodiversity_data table
CREATE TABLE IF NOT EXISTS public.biodiversity_data (
    biodiversity_data_id VARCHAR(25) PRIMARY KEY,
    biodiversity_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    species_count INTEGER,
    shannon_index NUMERIC(5, 2),
    observations JSONB,
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create waste_data table
CREATE TABLE IF NOT EXISTS public.waste_data (
    waste_data_id VARCHAR(25) PRIMARY KEY,
    waste_data_id_serial SERIAL UNIQUE,
    location_id VARCHAR(25),
    point_geom geometry(POINT, 4326),
    measurement_time TIMESTAMPTZ NOT NULL,
    time_of_day public.time_of_day,
    location_type public.location_type,
    solid_waste_kg NUMERIC(10, 2),
    hazardous_waste_kg NUMERIC(10, 2),
    recycled_waste_kg NUMERIC(10, 2),
    organic_waste_kg NUMERIC(10, 2),
    paper_waste_kg NUMERIC(10, 2),
    plastic_waste_kg NUMERIC(10, 2),
    cans_waste_kg NUMERIC(10, 2),
    bottles_waste_kg NUMERIC(10, 2),
    e_waste_kg NUMERIC(10, 2),
    scrap_metal_kg NUMERIC(10, 2),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users USING btree (created_at ASC NULLS LAST);

-- Create indexes for roles table
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON public.roles USING btree (created_at ASC NULLS LAST);

-- Create indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles USING btree (user_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles USING btree (role_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_roles_created_at ON public.user_roles USING btree (created_at ASC NULLS LAST);

-- Create indexes for user_auths table
CREATE INDEX IF NOT EXISTS idx_user_auths_user_id ON public.user_auths USING btree (user_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_auths_created_at ON public.user_auths USING btree (created_at ASC NULLS LAST);

-- Create indexes for locations table
CREATE INDEX IF NOT EXISTS idx_locations_geom ON public.locations USING gist (geom);
CREATE INDEX IF NOT EXISTS idx_locations_point_geom ON public.locations USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON public.locations USING btree (created_at ASC NULLS LAST);

-- Create indexes for air_data table
CREATE INDEX IF NOT EXISTS idx_air_data_point_geom ON public.air_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_air_data_location_id ON public.air_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_air_data_created_at ON public.air_data USING btree (created_at ASC NULLS LAST);

-- Create indexes for water_data table
CREATE INDEX IF NOT EXISTS idx_water_data_point_geom ON public.water_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_water_data_location_id ON public.water_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_water_data_created_at ON public.water_data USING btree (created_at ASC NULLS LAST);

-- Create indexes for soil_data table
CREATE INDEX IF NOT EXISTS idx_soil_data_point_geom ON public.soil_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_soil_data_location_id ON public.soil_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_soil_data_created_at ON public.soil_data USING btree (created_at ASC NULLS LAST);

-- Create indexes for noise_data table
CREATE INDEX IF NOT EXISTS idx_noise_data_point_geom ON public.noise_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_noise_data_location_id ON public.noise_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_noise_data_created_at ON public.noise_data USING btree (created_at ASC NULLS LAST);

-- Create indexes for biodiversity_data table
CREATE INDEX IF NOT EXISTS idx_biodiversity_data_point_geom ON public.biodiversity_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_biodiversity_data_location_id ON public.biodiversity_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_biodiversity_data_created_at ON public.biodiversity_data USING btree (created_at ASC NULLS LAST);

-- Create indexes for waste_data table
CREATE INDEX IF NOT EXISTS idx_waste_data_point_geom ON public.waste_data USING gist (point_geom);
CREATE INDEX IF NOT EXISTS idx_waste_data_location_id ON public.waste_data USING btree (location_id ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_waste_data_created_at ON public.waste_data USING btree (created_at ASC NULLS LAST);

-- Grant Access to role
GRANT USAGE ON SCHEMA public TO ems;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ems;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ems;
