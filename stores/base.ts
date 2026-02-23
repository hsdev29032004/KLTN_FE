// stores/base.ts
import axios, { AxiosInstance } from "axios";
import axiosInstance from "@/lib/axios";
import { showApiNotification } from "@/helpers/notification.helper";

export class Base {
  protected axiosInstance: AxiosInstance;
  protected access_token = '';
  protected refresh_token = '';

  constructor(accessToken?: string, refreshToken?: string) {
    if (accessToken || refreshToken) {

      this.axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${accessToken || ''}; refresh_token=${refreshToken || ''}`,
        },
        withCredentials: true,
      });

      // Add interceptors for server-side axios instance
      // Note: Notifications will only show on client-side due to toast limitation
      this.axiosInstance.interceptors.response.use(
        (response) => {
          // Auto show notification for successful responses if message exists
          // Will be skipped on server-side (SSR)
          if (response.data?.message) {
            showApiNotification.fromResponse(response.status, response.data);
          }
          return response;
        },
        (error) => {
          // Auto show notification for error responses
          // Will be skipped on server-side (SSR)
          showApiNotification.fromError(error);
          return Promise.reject(error);
        }
      );

      this.access_token = accessToken || '';
      this.refresh_token = refreshToken || '';
    } else {
      this.axiosInstance = axiosInstance;
    }
  }

  protected async request<T>(
    url: string,
    options: any = {},
    returnHeaders = false
  ): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      url,
      ...options,
      cache: "no-store",
    });

    if (returnHeaders) {
      return {
        data: response.data,
        headers: response.headers,
      } as unknown as T;
    }

    return response.data;
  }

  // client-side refresh token sẽ update cookie → axios tự gửi
  public updateTokens(access_token?: string, refresh_token?: string) {
    this.access_token = access_token || '';
    this.refresh_token = refresh_token || '';

    if (typeof window === "undefined") {
      this.axiosInstance.defaults.headers["Cookie"] =
        `access_token=${this.access_token}; refresh_token=${this.refresh_token}`;
    }
  }
}
