CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE
  IF NOT EXISTS data_pipeline.notification (
    id UUID PRIMARY KEY,
    id_of_origin_sensor INT,
    name_of_origin_sensor VARCHAR(50),
    read_ts TIMESTAMP WITH TIME ZONE,
    header VARCHAR(100),
    content TEXT,
  );
