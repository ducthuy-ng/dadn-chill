CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE IF NOT EXISTS data_pipeline.sensor_read_event (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id SERIAL NOT NULL,
  read_ts VARCHAR(25),
  temperature REAL,
  humidity REAL,
  light_intensity REAL,
  earth_moisture REAL
);
