'use client';

import { ReactNode } from 'react';
import { NotificationContext } from '@/contexts/notification-context';
import { useNotificationStore } from '@/stores/notification/notification-store';
import { Toaster } from '@/components/ui/sonner';

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const notificationStore = useNotificationStore();

  return (
    <NotificationContext.Provider value={notificationStore}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
};
