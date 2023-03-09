import { Sensor } from '../sensor';
import { Notification } from './index';

describe('Test Notification domain logic', () => {
  it('Create Notification for Sensor', () => {
    const testSensor = new Sensor(1, 'ABC');
    const notification = new Notification(
      testSensor,
      'Temperature too hot',
      'Temperature is too hot'
    );

    expect(notification.getSensorName()).toEqual('ABC');
    expect(notification.getCreatedTimestamp()).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
    );
  });
});
