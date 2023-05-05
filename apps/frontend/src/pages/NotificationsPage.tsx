import { createContext, useMemo, useState } from 'react';
import { NotificationItem } from '../components/NotificationItem';
import { Notification } from '../core/domain/Notification';
import NotificationAdapter from '../core/services/NotificationAdapter';
import { http } from '../core/services/httpClient';
import GetNotification from '../core/application/GetNotification';

// function fetchAllNotifications(): Notification[] {
//   return
// }

export const NotificationPageContext = createContext(-1);

export default function NotificationsPage() {
  // navigation
  const [notifications, setNotification] = useState([] as Notification[]);

  useMemo(() => {
    const notificationAdapter = new NotificationAdapter(http);
    new GetNotification(notificationAdapter, 0, 10)
      .executeUsecase()
      .then((result) => setNotification(result));
  }, []);

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
