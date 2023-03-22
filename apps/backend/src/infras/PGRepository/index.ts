import { Pool } from 'pg';
import { Notification, NotificationRepo } from '../../core/domain/Notification';
import { Sensor, SensorId } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { Logger } from '../../core/usecases/Logger';
import { FailedToStoreEvent, ReadEventRepo } from '../../core/usecases/repos/ReadEventRepo';
import { SensorRepo } from '../../core/usecases/repos/SensorRepo';

export class PGRepository implements SensorRepo, NotificationRepo, ReadEventRepo {
  private static pageSize = 10;

  private connectionPool: Pool;

  private logger: Logger;

  constructor(connectionString: string, logger: Logger) {
    this.connectionPool = new Pool({
      connectionString: connectionString,
    });
    this.connectionPool.on('error', (err) => {
      this.logger.error('Internal server error:', err.message);
      throw err;
    });

    this.logger = logger;
  }

  // TODO
  add(...notifications: Notification[]): void {
    return;
  }

  // TODO
  getLastestNotification(pageNum: number): Notification[] {
    return [];
  }

  async disconnect() {
    await this.connectionPool.end();
  }

  async saveSensor(sensor: Sensor) {
    this.logger.debug(`Save sensor id: ${sensor.getId()}`);
    await this.connectionPool.query(
      'INSERT INTO data_pipeline.sensor VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) \
      ON CONFLICT (id) DO UPDATE SET \
      name=$2, setup_long=$3, setup_lat=$4, last_read_ts=$5, temperature=$6, humidity=$7, light_intensity=$8, earth_moisture=$9;',
      [
        sensor.getId(),
        sensor.getName(),
        sensor.getSetupLocation().longitude,
        sensor.getSetupLocation().latitude,
        sensor.getLastReadTimestamp(),
        sensor.getReadValue().temperature,
        sensor.getReadValue().humidity,
        sensor.getReadValue().lightIntensity,
        sensor.getReadValue().earthMoisture,
      ]
    );

    return;
  }

  private convertDtoToSensor(object: unknown): Sensor {
    return Sensor.reconstruct(
      object['id'],
      object['name'],
      {
        longitude: object['setup_long'],
        latitude: object['setup_lat'],
      },
      object['last_read_ts'],
      object['temperature'],
      object['humidity'],
      object['light_intensity'],
      object['earth_moisture']
    );
  }

  async getById(id: number): Promise<Sensor | null> {
    this.logger.debug(`Get sensor by ID: ${id}`);

    const result = await this.connectionPool.query(
      'SELECT * FROM data_pipeline.sensor WHERE id=$1 LIMIT 1;',
      [id]
    );

    if (result.rowCount !== 1) return null;

    return this.convertDtoToSensor(result.rows[0]);
  }

  async getByPage(pageNum: number): Promise<Sensor[]> {
    this.logger.debug(`Get sensor list of page: ${pageNum}`);
    const result = await this.connectionPool.query(
      'SELECT * FROM data_pipeline.sensor LIMIT $1 OFFSET $2 ROWS;',
      [PGRepository.pageSize, (pageNum - 1) * PGRepository.pageSize]
    );

    const sensorList = result.rows.map(this.convertDtoToSensor);

    return sensorList;
  }

  async getNextId(): Promise<SensorId> {
    this.logger.debug(`Get next sensor ID`);
    const result = await this.connectionPool.query("SELECT nextval('id_sequence') AS next_id;");
    if (result.rowCount !== 1) return NaN;
    return parseInt(result.rows[0]['next_id']);
  }

  async deleteById(id: SensorId): Promise<void> {
    this.logger.debug(`Delete sensor by ID`);
    await this.connectionPool.query('DELETE FROM data_pipeline.sensor WHERE id=$1', [id]);
  }

  async storeEvent(event: SensorReadEvent): Promise<void> {
    this.logger.debug(`Storing event`);
    const result = await this.connectionPool.query(
      'INSERT INTO data_pipeline.sensor_read_event(sensor_id,read_ts,temperature,humidity,light_intensity,earth_moisture) VALUES($1, $2, $3, $4, $5, $6)',
      [
        event.sensorId,
        event.readTimestamp,
        event.sensorValue.temperature,
        event.sensorValue.humidity,
        event.sensorValue.lightIntensity,
        event.sensorValue.earthMoisture,
      ]
    );

    if (result.rowCount !== 1) throw new FailedToStoreEvent('SQL execution error');
  }
}
