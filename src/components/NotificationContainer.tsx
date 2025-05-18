import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/Hooks';
import { markAsRead, clearAllNotifications } from '../store/NotificationSlice';
import NotificationSystem from './NotificationSystem';

const NotificationContainer = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  
  // Handle marking a notification as read
  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };
  
  // Handle clearing all notifications
  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };
  
  return (
    <NotificationSystem
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onClearAll={handleClearAll}
    />
  );
};

export default NotificationContainer;
