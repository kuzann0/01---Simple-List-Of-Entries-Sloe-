import { useState } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [notificationExiting, setNotificationExiting] = useState(false);

  const showNotification = (message, type = "info") => {
    setNotificationExiting(false);
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotificationExiting(true);
    }, 1800);
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
      setNotificationExiting(false);
    }, 2400);
  };

  const hideNotification = () => {
    setNotificationExiting(true);
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
      setNotificationExiting(false);
    }, 400);
  };

  return {
    notification,
    notificationExiting,
    showNotification,
    hideNotification
  };
}
