CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE SEQUENCE id_sequence;

CREATE TABLE
  IF NOT EXISTS data_pipeline.sensor (
    id INTEGER PRIMARY KEY DEFAULT nextval ('id_sequence'),
    name VARCHAR(50),
    setup_long REAL,
    setup_lat REAL,
    last_read_ts VARCHAR(25),
    temperature REAL,
    humidity REAL,
    light_intensity REAL,
    earth_moisture REAL
  );

INSERT INTO
  data_pipeline.sensor (name, setup_long, setup_lat, last_read_ts, temperature, humidity, light_intensity, earth_moisture)
VALUES
  ('Cảm biến 1', 10.552493, 106.873474, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1),
  ('Cảm biến 2', 10.5390624, 106.879069, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1),
  ('Cảm biến 3', 10.5257651, 106.8480182, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1),
  ('Cảm biến 4', 10.5122799, 106.7979179, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1),
  ('Cảm biến 5', 10.478189, 106.839396, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1),
  ('Cảm biến 6', 10.4792, 106.8984, '2023-03-12T15:12:13+07:00', 1, 1, 1, 1);
