CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE
  IF NOT EXISTS data_pipeline.sensor_read_event (
    sensor_id SERIAL PRIMARY KEY,
    read_ts TIMESTAMP WITH TIME ZONE,
    temperature REAL,
    humidity REAL,
    light_intensity REAL,
    earth_moisture REAL
  );
