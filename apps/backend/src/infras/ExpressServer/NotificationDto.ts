import { SensorId } from '../../core/domain/Sensor';
import { Notification } from '../../core/domain/Notification';

export type NotificationDto = {
  id: string;
  idOfOriginSensor: SensorId;
  nameOfOriginSensor: string;

  createTimestamp: string;

  header: string;
  content: string;
};

export function convertToNotificationDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    idOfOriginSensor: notification.idOfOriginSensor,
    nameOfOriginSensor: notification.nameOfOriginSensor,
    createTimestamp: notification.getCreatedTimestamp(),
    header: notification.header,
    content: notification.content,
  };
}
