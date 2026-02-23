import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { showApiNotification } from '@/helpers/notification.helper';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - sẽ được set trong layout.tsx
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Auto show notifications (client-side only)
axiosInstance.interceptors.response.use(
  (response) => {
    // Auto show notification for successful responses if message exists
    // Will only work on client-side due to toast limitation
    if (response.data?.message) {
      showApiNotification.fromResponse(response.status, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Auto show notification for error responses
    // Will only work on client-side due to toast limitation
    showApiNotification.fromError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
