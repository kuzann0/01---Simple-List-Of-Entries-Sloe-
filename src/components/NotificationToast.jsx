import React from 'react';

export function NotificationToast({ notification, notificationExiting }) {
  if (!notification.show) return null;

  return (
    <div className={`notification-toast notification-${notification.type} ${notificationExiting ? "notification-exit" : ""}`}>
      <span className="notification-message">{notification.message}</span>
    </div>
  );
}
