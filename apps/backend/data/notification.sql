CREATE SCHEMA IF NOT EXISTS data_pipeline;

CREATE TABLE IF NOT EXISTS data_pipeline.notification (
  id UUID PRIMARY KEY,
  id_of_origin_sensor INT,
  name_of_origin_sensor VARCHAR(50),
  read_ts TIMESTAMP WITH TIME ZONE,
  header VARCHAR(100),
  content TEXT
);

INSERT INTO
  data_pipeline.notification
VALUES
  (
    'f9fc3098-2142-4979-b02d-6da7f14955c6',
    1,
    'Cảm biến 1',
    '2023-05-05T08:16:49.388537+07',
    'Test 1',
    'Test notification 1'
  ),
  (
    '0a100fb5-03e8-42b6-8e3e-478b1d8aa8d7',
    4,
    'Cảm biến 4',
    '2023-05-05T08:16:49.388537+07',
    'Test 2',
    'Test notification 2'
  ),
  (
    '99fda656-0c28-46a9-a09d-a566155e73fb',
    1,
    'Cảm biến 1',
    '2023-05-05T08:16:49.388537+07',
    'Test 3',
    'Test notification 3'
  ),
  (
    'bd78e4d7-dd67-4c7f-aa44-00b5f7843b8a',
    3,
    'Cảm biến 3',
    '2023-05-05T08:16:49.388537+07',
    'Test 4',
    'Test notification 4'
  ),
  (
    '9a4ee61f-145b-49b8-8d5d-84e81bd6db62',
    2,
    'Cảm biến 2',
    '2023-05-05T08:16:49.388537+07',
    'Test 5',
    'Test notification 5'
  ),
  (
    '4161fd4b-4f0f-4b4e-847b-7e36a7a74bf4',
    5,
    'Cảm biến 5',
    '2023-05-05T08:16:49.388537+07',
    'Test 6',
    'Test notification 6'
  );
