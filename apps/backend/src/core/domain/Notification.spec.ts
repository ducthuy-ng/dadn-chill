import { Notification } from './Notification';
import { Sensor } from './Sensor';

describe('Test Notification domain logic', () => {
  it('Create Notification for Sensor', () => {
    const testSensor = new Sensor(1, 'ABC');
    const notification = Notification.generate(
      testSensor,
      'Temperature too hot',
      'Temperature is too hot'
    );

    expect(notification.nameOfOriginSensor).toEqual('ABC');
    expect(notification.getCreatedTimestamp()).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
    );
  });
});
