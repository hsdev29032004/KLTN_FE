export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  notify: (options: NotificationOptions) => string | number;
  success: (message: string, options?: Partial<NotificationOptions>) => string | number;
  error: (message: string, options?: Partial<NotificationOptions>) => string | number;
  info: (message: string, options?: Partial<NotificationOptions>) => string | number;
  warning: (message: string, options?: Partial<NotificationOptions>) => string | number;
  loading: (message: string, options?: Partial<NotificationOptions>) => string | number;
  dismiss: (id: string | number) => void;
  dismissAll: () => void;
}

export interface NotificationOptions {
  message: string;
  type: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}
