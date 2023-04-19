# Note

Result are recorded for the **4th** execution time, for stability purposes.

# Without index

```
GroupAggregate  (cost=7908.63..7909.05 rows=11 width=40) (actual time=63.472..75.467 rows=3 loops=1)
  Group Key: (date_trunc('day'::text, sensor_read_event.read_ts))
  ->  Sort  (cost=7908.63..7908.66 rows=11 width=24) (actual time=57.860..64.289 rows=70255 loops=1)
        Sort Key: (date_trunc('day'::text, sensor_read_event.read_ts))
        Sort Method: external merge  Disk: 2344kB
        ->  Gather  (cost=1000.00..7908.44 rows=11 width=24) (actual time=0.733..32.232 rows=70255 loops=1)
              Workers Planned: 2
              Workers Launched: 2
              ->  Parallel Seq Scan on sensor_read_event  (cost=0.00..6907.34 rows=5 width=24) (actual time=0.066..28.150 rows=23418 loops=3)
                    Filter: ((read_ts >= '2023-03-09 00:00:00'::timestamp without time zone) AND (read_ts < '2023-03-12 00:00:00'::timestamp without time zone) AND (sensor_id = 1))
                    Rows Removed by Filter: 111643
Planning Time: 0.176 ms
Execution Time: 76.560 ms
```

# With sensor_idx

```plsql
CREATE INDEX sensor_idx ON data_pipeline.sensor_read_event(sensor_id);
```

```
GroupAggregate  (cost=14806.93..17393.87 rows=68985 width=40) (actual time=79.341..90.224 rows=3 loops=1)
  Group Key: (date_trunc('day'::text, sensor_read_event.read_ts))
  ->  Sort  (cost=14806.93..14979.39 rows=68985 width=24) (actual time=74.052..79.844 rows=70255 loops=1)
        Sort Key: (date_trunc('day'::text, sensor_read_event.read_ts))
        Sort Method: external merge  Disk: 2344kB
        ->  Bitmap Heap Scan on sensor_read_event  (cost=2048.51..9262.61 rows=68985 width=24) (actual time=10.653..47.461 rows=70255 loops=1)
              Recheck Cond: (sensor_id = 1)
              Filter: ((read_ts >= '2023-03-09 00:00:00'::timestamp without time zone) AND (read_ts < '2023-03-12 00:00:00'::timestamp without time zone))
              Rows Removed by Filter: 117196
              Heap Blocks: exact=3787
              ->  Bitmap Index Scan on sensor_idx  (cost=0.00..2031.26 rows=185979 width=0) (actual time=9.922..9.922 rows=187451 loops=1)
                    Index Cond: (sensor_id = 1)
Planning Time: 0.256 ms
Execution Time: 91.295 ms
```

# With event_date_idx

```pl/sql
CREATE INDEX event_date_idx ON data_pipeline.sensor_read_event(date_trunc('day', read_ts));
```

When using this, I also change the query (comparing `date_trunc('day', read_ts)` instead of raw `read_ts`) to make sure it uses the index

```
GroupAggregate  (cost=3353.39..3353.77 rows=10 width=40) (actual time=74.883..85.942 rows=3 loops=1)
  Group Key: (date_trunc('day'::text, sensor_read_event.read_ts))
  ->  Sort  (cost=3353.39..3353.42 rows=10 width=24) (actual time=69.521..75.597 rows=70255 loops=1)
        Sort Key: (date_trunc('day'::text, sensor_read_event.read_ts))
        Sort Method: external merge  Disk: 2344kB
        ->  Bitmap Heap Scan on sensor_read_event  (cost=28.69..3353.23 rows=10 width=24) (actual time=7.263..40.721 rows=70255 loops=1)
              Recheck Cond: ((date_trunc('day'::text, read_ts) >= '2023-03-09 00:00:00'::timestamp without time zone) AND (date_trunc('day'::text, read_ts) < '2023-03-12 00:00:00'::timestamp without time zone))
              Filter: (sensor_id = 1)
              Rows Removed by Filter: 81047
              Heap Blocks: exact=1415
              ->  Bitmap Index Scan on event_date_idx  (cost=0.00..28.68 rows=2026 width=0) (actual time=6.862..6.863 rows=151302 loops=1)
                    Index Cond: ((date_trunc('day'::text, read_ts) >= '2023-03-09 00:00:00'::timestamp without time zone) AND (date_trunc('day'::text, read_ts) < '2023-03-12 00:00:00'::timestamp without time zone))
Planning Time: 0.241 ms
Execution Time: 87.230 ms
```

# With read_ts_idx

```pl/sql
CREATE INDEX read_ts_idx ON data_pipeline.sensor_read_event(read_ts);
```

```
GroupAggregate  (cost=3359.26..3359.64 rows=10 width=40) (actual time=75.277..86.364 rows=3 loops=1)
  Group Key: (date_trunc('day'::text, sensor_read_event.read_ts))
  ->  Sort  (cost=3359.26..3359.29 rows=10 width=24) (actual time=69.962..75.934 rows=70255 loops=1)
        Sort Key: (date_trunc('day'::text, sensor_read_event.read_ts))
        Sort Method: external merge  Disk: 2344kB
        ->  Bitmap Heap Scan on sensor_read_event  (cost=44.68..3359.10 rows=10 width=24) (actual time=11.781..42.947 rows=70255 loops=1)
              Recheck Cond: ((read_ts >= '2023-03-09 00:00:00'::timestamp without time zone) AND (read_ts < '2023-03-12 00:00:00'::timestamp without time zone))
              Filter: (sensor_id = 1)
              Rows Removed by Filter: 81047
              Heap Blocks: exact=1415
              ->  Bitmap Index Scan on read_ts_idx  (cost=0.00..44.68 rows=2026 width=0) (actual time=11.492..11.492 rows=151302 loops=1)
                    Index Cond: ((read_ts >= '2023-03-09 00:00:00'::timestamp without time zone) AND (read_ts < '2023-03-12 00:00:00'::timestamp without time zone))
Planning Time: 0.229 ms
Execution Time: 87.642 ms
```

# Summary

It seems like, to executing this query without indexes, PostgreSQL can use multi-cores to be more efficiently. For this result, I will not create any index.
