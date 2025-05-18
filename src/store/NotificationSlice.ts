import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationType } from '../components/NotificationSystem';

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (
      state,
      action: PayloadAction<{
        type: NotificationType;
        title: string;
        message: string;
      }>
    ) => {
      const { type, title, message } = action.payload;
      
      state.notifications.unshift({
        id: uuidv4(),
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false
      });
      
      // Limit to 20 notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },
    
    // Mark a notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    // Remove a notification
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
