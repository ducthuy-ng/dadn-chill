import { Pool } from 'pg';
import { PGRepository } from '.';
import { Notification } from '../../core/domain/Notification';
import { Sensor } from '../../core/domain/Sensor';
import { BSLogger } from '../BSLogger';

describe('Unit tests of PG Notification Repo', () => {
  const pgConnString = 'postgresql://backend:password@localhost?backend';
  let notificationRepo: PGRepository;

  const sensor1 = new Sensor(1, 'sensor1');
  const sensor2 = new Sensor(1, 'sensor1');

  const pgPool = new Pool({ connectionString: pgConnString });

  beforeAll(() => {
    notificationRepo = new PGRepository(
      { connectionString: pgConnString },
      new BSLogger('notification test logger', {})
    );
  });

  afterAll(async () => {
    await pgPool.end();
    await notificationRepo.disconnect();
  });

  const notification1 = Notification.generate(
    sensor1,
    'Test Notification1',
    'This is a test notification1'
  );

  const notification2 = Notification.generate(
    sensor2,
    'Test Notification2',
    'This is a test notification2'
  );

  test('Insert 1 should be found', async () => {
    await notificationRepo.add(notification1);

    const selectAllNotificationsResult = await pgPool.query(
      'SELECT * FROM data_pipeline.notification WHERE id=$1;',
      [notification1.id]
    );

    if (selectAllNotificationsResult.rows.length !== 1) {
      fail('search by id should return one record');
    }

    const searchSensor = selectAllNotificationsResult.rows[0];
    expect(searchSensor.read_ts).toEqual(notification1.getCreatedTimestamp());
    expect(searchSensor.header).toEqual(notification1.header);
    expect(searchSensor.content).toEqual(notification1.content);

    await pgPool.query('TRUNCATE data_pipeline.notification;');
  });

  test('Insert multiple should be found multiple', async () => {
    await notificationRepo.add(notification1);
    await notificationRepo.add(notification2);

    // ========================== Check Notification 1 ==========================
    const selectAllNotificationsResult1 = await pgPool.query(
      'SELECT * FROM data_pipeline.notification WHERE id=$1;',
      [notification1.id]
    );

    if (selectAllNotificationsResult1.rows.length !== 1) {
      fail('search by id should return one record');
    }

    const searchSensor1 = selectAllNotificationsResult1.rows[0];
    expect(searchSensor1.read_ts).toEqual(notification1.getCreatedTimestamp());
    expect(searchSensor1.header).toEqual(notification1.header);
    expect(searchSensor1.content).toEqual(notification1.content);

    // ========================== Check Notification 2 ==========================
    const selectAllNotificationsResult2 = await pgPool.query(
      'SELECT * FROM data_pipeline.notification WHERE id=$1;',
      [notification2.id]
    );

    if (selectAllNotificationsResult2.rows.length !== 1) {
      fail('search by id should return one record');
    }

    const searchSensor2 = selectAllNotificationsResult2.rows[0];
    expect(searchSensor1.read_ts).toEqual(notification2.getCreatedTimestamp());
    expect(searchSensor2.header).toEqual(notification2.header);
    expect(searchSensor2.content).toEqual(notification2.content);

    await pgPool.query('TRUNCATE data_pipeline.notification;');
  });

  test('Get page of nothing should return nothing', async () => {
    const result = await notificationRepo.getLatestNotification(1);
    expect(result.length).toEqual(0);
  });

  test('Insert then retrieve should get all, if not pass pageSize', async () => {
    await notificationRepo.add(notification1, notification2);

    const result = await notificationRepo.getLatestNotification(1);
    expect(result.length).toEqual(2);
    expect(result).toContainEqual(notification1);
    expect(result).toContainEqual(notification2);
  });
});
