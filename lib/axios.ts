import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
            {},
            {
              withCredentials: true,
            }
          );

          if (refreshResponse.status === 200) {
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          handleLogout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  // window.location.href = '/login';
}

export default axiosInstance;
