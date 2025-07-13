-- Create PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_created_at ON maintenance_records(created_at);
CREATE INDEX IF NOT EXISTS idx_asset_id ON maintenance_records(asset_id);

-- Set timezone
SET timezone = 'Asia/Seoul';