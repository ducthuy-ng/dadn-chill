CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE IF NOT EXISTS data_pipeline.sensor_read_event (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id SERIAL NOT NULL,
  read_ts TIMESTAMP WITH TIME ZONE,
  temperature REAL,
  humidity REAL,
  light_intensity REAL,
  earth_moisture REAL
);

COPY data_pipeline.sensor_read_event
FROM
  '/docker-entrypoint-initdb.d/sensor_read_events.csv' WITH (FORMAT CSV, HEADER TRUE);

CREATE
OR REPLACE FUNCTION data_pipeline.calculate_avg_for_sensor(
  id INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP
) RETURNS TABLE(
  agg_date TIMESTAMP WITH TIME ZONE,
  avg_temp REAL,
  avg_humid REAL,
  avg_light REAL,
  avg_moist REAL
) AS $$ WITH selected_record_in_range AS (
  SELECT
    date_trunc('DAY', read_ts) AS event_date,
    temperature,
    humidity,
    light_intensity,
    earth_moisture
  FROM
    data_pipeline.sensor_read_event
  WHERE
    (
      read_ts >= start_date
      AND read_ts < (end_date + INTERVAL '1 DAY')
    )
    AND sensor_id = id
)
SELECT
  event_date,
  AVG(temperature) AS avg_temp,
  AVG(humidity) AS avg_humid,
  AVG(light_intensity) AS avg_light,
  AVG(earth_moisture) AS avg_moist
FROM
  selected_record_in_range
GROUP BY
  event_date
ORDER BY
  event_date;

$$ LANGUAGE SQL RETURNS NULL ON NULL INPUT;

CREATE
OR REPLACE FUNCTION data_pipeline.calculate_all_sensors_avg(start_date TIMESTAMP, end_date TIMESTAMP) RETURNS TABLE(
  agg_date TIMESTAMP WITH TIME ZONE,
  avg_temp REAL,
  avg_humid REAL,
  avg_light REAL,
  avg_moist REAL
) AS $$ WITH selected_record_in_range AS (
  SELECT
    date_trunc('DAY', read_ts) AS event_date,
    temperature,
    humidity,
    light_intensity,
    earth_moisture
  FROM
    data_pipeline.sensor_read_event
  WHERE
    read_ts >= start_date
    AND read_ts < (end_date + INTERVAL '1 DAY')
)
SELECT
  event_date,
  AVG(temperature) AS avg_temp,
  AVG(humidity) AS avg_humid,
  AVG(light_intensity) AS avg_light,
  AVG(earth_moisture) AS avg_moist
FROM
  selected_record_in_range
GROUP BY
  event_date
ORDER BY
  event_date;

$$ LANGUAGE SQL RETURNS NULL ON NULL INPUT;

-- SELECT * FROM calculate_avg_for_sensor(1, '2023-03-10', '2023-03-14');
-- CREATE INDEX read_ts_idx ON data_pipeline.sensor_read_event(read_ts);
-- CREATE INDEX event_date_idx ON data_pipeline.sensor_read_event(date_trunc(' DAY ', read_ts));
-- CREATE INDEX sensor_idx ON data_pipeline.sensor_read_event(sensor_id);
