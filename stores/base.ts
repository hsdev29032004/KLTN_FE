import axiosInstance from "@/lib/axios";
import { AxiosInstance } from "axios";

export abstract class Base {
  protected axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axiosInstance;
  }

  protected async request<T>(url: string, options: any = {}): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      url,
      ...options,
    });
    return response.data;
  }
}