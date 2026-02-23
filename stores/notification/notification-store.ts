import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  addNotification,
  removeNotification,
  clearNotifications,
} from './notification.slice';
import { Notification, NotificationOptions } from '@/types/notification.type';
import { toast } from 'sonner';

export const useNotificationStore = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  );

  const generateId = () => `notification-${Date.now()}-${Math.random()}`;

  const notify = (options: NotificationOptions) => {
    const id = generateId();
    const notification: Notification = {
      id,
      ...options,
      duration: options.duration ?? 4000,
      dismissible: options.dismissible ?? true,
    };

    dispatch(addNotification(notification));

    // Use sonner for toast notifications
    const handleDismiss = () => {
      dispatch(removeNotification(id));
    };

    const toastOptions = {
      duration: notification.duration,
      action: notification.action
        ? {
          label: notification.action.label,
          onClick: () => {
            notification.action?.onClick();
          },
        }
        : undefined,
      onDismiss: handleDismiss,
      onAutoClose: handleDismiss,
    };

    let toastId: string | number;

    switch (notification.type) {
      case 'success':
        toastId = toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toastId = toast.error(notification.message, toastOptions);
        break;
      case 'info':
        toastId = toast.info(notification.message, toastOptions);
        break;
      case 'warning':
        toastId = toast.warning(notification.message, toastOptions);
        break;
      case 'loading':
        toastId = toast.loading(notification.message, {
          ...toastOptions,
          duration: Infinity, // Loading toasts should not auto-dismiss
        });
        break;
      default:
        toastId = toast(notification.message, toastOptions);
    }

    return toastId;
  };

  const success = (message: string, options?: Partial<NotificationOptions>) => {
    return notify({
      message,
      type: 'success',
      ...options,
    });
  };

  const error = (message: string, options?: Partial<NotificationOptions>) => {
    return notify({
      message,
      type: 'error',
      ...options,
    });
  };

  const info = (message: string, options?: Partial<NotificationOptions>) => {
    return notify({
      message,
      type: 'info',
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<NotificationOptions>) => {
    return notify({
      message,
      type: 'warning',
      ...options,
    });
  };

  const loading = (message: string, options?: Partial<NotificationOptions>) => {
    return notify({
      message,
      type: 'loading',
      ...options,
    });
  };

  const dismiss = (id: string | number) => {
    toast.dismiss(id);
  };

  const dismissAll = () => {
    toast.dismiss();
    dispatch(clearNotifications());
  };

  return {
    notifications,
    notify,
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    dismissAll,
  };
};
