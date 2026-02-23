'use client';

import { createContext, useContext } from 'react';
import { NotificationContextType } from '@/types/notification.type';

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            'useNotification must be used within a NotificationProvider'
        );
    }
    return context;
};
