EXPLAIN ANALYZE WITH selected_record_in_range AS (
  SELECT
    date_trunc('day', read_ts) AS event_date,
    temperature,
    humidity,
    light_intensity,
    earth_moisture
  FROM
    data_pipeline.sensor_read_event
  WHERE
    (
      read_ts >= '2023-03-09'
      AND read_ts < ('2023-03-11' :: TIMESTAMP + INTERVAL '1 day')
    )
    AND sensor_id = 1
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
