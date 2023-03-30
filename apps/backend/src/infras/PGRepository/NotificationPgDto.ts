export type RetrievedNotificationDto = {
  id: string;
  id_of_origin_sensor: number;
  name_of_origin_sensor: string;
  read_ts: Date;
  header: string;
  content: string;
};
