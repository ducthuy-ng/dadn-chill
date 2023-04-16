CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE IF NOT EXISTS data_pipeline.sensor_read_event (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id SERIAL NOT NULL,
  read_ts TIMESTAMP,
  temperature REAL,
  humidity REAL,
  light_intensity REAL,
  earth_moisture REAL
);

COPY data_pipeline.sensor_read_event
FROM
  '/docker-entrypoint-initdb.d/sensor_read_events.csv' WITH (FORMAT CSV, HEADER TRUE);

-- CREATE INDEX read_ts_idx ON data_pipeline.sensor_read_event(read_ts);
-- CREATE INDEX event_date_idx ON data_pipeline.sensor_read_event(date_trunc('day', read_ts));
-- CREATE INDEX sensor_idx ON data_pipeline.sensor_read_event(sensor_id);
