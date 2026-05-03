import { Base } from '../base';
import { HomeDashboardResponse } from '@/types/stat.type';

export class StatRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async fetchStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: any }> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return this.request(`/api/stat/lecturer${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getDashboard(): Promise<{ data: any }> {
    return this.request('/api/stat/dashboard', { method: 'GET' });
  }

  async getRevenueStats(
    params?: Record<string, string>,
  ): Promise<{ data: any }> {
    return this.request('/api/stat/revenue', { method: 'GET', params });
  }

  async getRevenueByTeacher(
    params?: Record<string, string>,
  ): Promise<{ data: any }> {
    return this.request('/api/stat/revenue/by-teacher', {
      method: 'GET',
      params,
    });
  }

  async getRevenueByCourse(
    params?: Record<string, string>,
  ): Promise<{ data: any }> {
    return this.request('/api/stat/revenue/by-course', {
      method: 'GET',
      params,
    });
  }

  async getUserStats(params?: Record<string, string>): Promise<{ data: any }> {
    return this.request('/api/stat/users', { method: 'GET', params });
  }

  async getCourseStats(
    params?: Record<string, string>,
  ): Promise<{ data: any }> {
    return this.request('/api/stat/courses', { method: 'GET', params });
  }

  async getHomeDashboard(): Promise<HomeDashboardResponse> {
    return this.request('/api/stat/home', { method: 'GET' });
  }
}

export const statRequest = new StatRequest();
