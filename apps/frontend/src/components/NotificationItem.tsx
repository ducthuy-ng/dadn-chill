import { useContext } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { Notification } from '../core/domain/Notification';
import { NotificationPageContext } from '../pages/NotificationsPage';

interface NotificationItemProps {
  notification: Notification;
  setSelectedNotiId: React.Dispatch<React.SetStateAction<number>>;
}

export function NotificationItem(props: NotificationItemProps) {
  const selectedNotiId = useContext(NotificationPageContext);
  const isShowingDetail = selectedNotiId === props.notification.id;

  const toggleContent = () => {
    selectedNotiId === props.notification.id
      ? props.setSelectedNotiId(-1)
      : props.setSelectedNotiId(props.notification.id);
  };

  return (
    <div className="border-b">
      <div
        className={`flex flex-row items-center justify-between border-black px-3 py-4 hover:cursor-pointer hover:bg-slate-50
        ${isShowingDetail ? 'bg-slate-50' : ''}`}
        onClick={toggleContent}
      >
        <div>
          <h2 className="text-lg font-medium">{props.notification.sensor_name}</h2>
          <h3 className="text-sm font-extralight">{props.notification.header}</h3>
        </div>

        <FaAngleDown className={`transition-transform ${isShowingDetail && 'rotate-180'}`} />
      </div>

      <hr className={`${isShowingDetail ? 'block' : 'hidden'}`} />
      <div
        className={`overflow-scroll whitespace-pre-line transition-all
        ${isShowingDetail ? 'h-64' : 'h-0'}`}
      >
        <div className="p-3">{props.notification.content}</div>
      </div>
    </div>
  );
}
