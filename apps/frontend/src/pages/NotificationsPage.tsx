import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Notification {
  id: number;
  content: string;
}

function fetchAllNotifications(): Notification[] {
  return [
    {
      id: 1,
      content: 'Thông báo 1',
    },
    {
      id: 2,
      content: 'Thông báo 2',
    },
    {
      id: 3,
      content: 'Thông báo 1',
    },
    {
      id: 4,
      content: 'Thông báo 2',
    },
    {
      id: 5,
      content: 'Thông báo 1',
    },
    {
      id: 6,
      content: 'Thông báo 2',
    },
    {
      id: 7,
      content: 'Thông báo 1',
    },
    {
      id: 8,
      content: 'Thông báo 2',
    },
    {
      id: 9,
      content: 'Thông báo 1',
    },
    {
      id: 10,
      content: 'Thông báo 2',
    },
    {
      id: 11,
      content: 'Thông báo 1',
    },
    {
      id: 12,
      content: 'Thông báo 2',
    },
    {
      id: 13,
      content: 'Thông báo 1',
    },
    {
      id: 14,
      content: 'Thông báo 2',
    },
    {
      id: 15,
      content: 'Thông báo 1',
    },
  ];
}

const NotificationListItem: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  return (
    <li className="border-y py-3 hover:cursor-pointer hover:bg-slate-50">
      {notification.content}
    </li>
  );
};

export default function NotificationsPage() {
  const notifications: Notification[] = fetchAllNotifications();

  return (
    <div className="p-4">
      <Link to={'/'}>
        <div className="flex items-center gap-x-1 hover:text-blue-500">
          <FaArrowLeft className="text-xl" />
          <div>Quay về trang chủ</div>
        </div>
      </Link>

      <h1 className="my-4 text-4xl">Thông báo đã nhận</h1>

      <ul className="w-full table-fixed">
        {notifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </ul>

      <button className="button p-4" type="button">
        Hiển thị thêm...
      </button>
    </div>
  );
}
