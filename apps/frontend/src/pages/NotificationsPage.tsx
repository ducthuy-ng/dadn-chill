import { createContext, useState } from 'react';
import { NotificationItem } from '../components/NotificationItem';
import { Notification } from '../core/domain/Notification';

function fetchAllNotifications(): Notification[] {
  return [
    {
      id: 1,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1\n Xin chaof \nabcd',
    },
    {
      id: 2,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 3,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 4,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 5,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 6,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 7,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 8,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 9,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 10,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 11,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 12,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 13,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
    {
      id: 14,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 2',
    },
    {
      id: 15,
      sensor_name: 'Sensor 1',
      header: 'Thông báo chung',
      content: 'Thông báo 1',
    },
  ];
}

export const NotificationPageContext = createContext(-1);

export default function NotificationsPage() {
  // navigation
  const notifications: Notification[] = fetchAllNotifications();

  const [selectedNotiId, setSelectedNotiId] = useState<number>(-1);

  return (
    <div className="p-4">
      {/* <Link to={'/'} className="inline-block">
        <span className="flex items-center gap-x-1 hover:text-blue-500">
          <FaArrowLeft className="text-xl" />
          <div>Quay về trang chủ</div>
        </span>
      </Link> */}

      <h1 className="my-4 text-4xl">Thông báo đã nhận</h1>

      <div className="w-full table-fixed rounded-md border">
        <NotificationPageContext.Provider value={selectedNotiId}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              setSelectedNotiId={setSelectedNotiId}
            />
          ))}
        </NotificationPageContext.Provider>
      </div>

      <div className="flex w-full justify-center py-2">
        <button className="button rounded-lg border p-4 hover:bg-slate-50" type="button">
          Hiển thị thêm...
        </button>
      </div>
    </div>
  );
}
