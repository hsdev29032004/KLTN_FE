import {
  AdminUserListParams,
  AdminUserListResponse,
  LecturerProfileParams,
  LecturerProfileResponse,
  User,
} from '@/types/user.type';
import { Base } from '../base';

export class UserRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getAllUsersAdmin(
    params?: AdminUserListParams,
  ): Promise<AdminUserListResponse> {
    return this.request('/api/user/admin/all', {
      method: 'GET',
      params,
    });
  }

  async getUserDetailAdmin(
    id: string,
  ): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}`, {
      method: 'GET',
    });
  }

  async updateUserAdmin(
    id: string,
    data: {
      fullName?: string;
      avatar?: string;
      introduce?: string;
      roleId?: string;
      bankNumber?: string;
      bankName?: string;
    },
  ): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}`, {
      method: 'PATCH',
      data,
    });
  }

  async banUser(
    id: string,
    data: { reason: string; timeUnBan?: string },
  ): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}/ban`, {
      method: 'POST',
      data,
    });
  }

  async unbanUser(id: string): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}/unban`, {
      method: 'POST',
    });
  }

  async deleteUser(id: string): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async restoreUser(id: string): Promise<{ message: string; data: User }> {
    return this.request(`/api/user/admin/${id}/restore`, {
      method: 'POST',
    });
  }

  async updateProfile(data: {
    fullName?: string;
    avatar?: string;
    introduce?: string;
    bankNumber?: string;
    bankName?: string;
  }): Promise<{ message: string; data: User }> {
    return this.request('/api/user/profile', {
      method: 'PATCH',
      data,
    });
  }

  async getLecturerProfile(
    slug: string,
    params?: LecturerProfileParams,
  ): Promise<LecturerProfileResponse> {
    return this.request(`/api/user/profile/${slug}`, {
      method: 'GET',
      params,
    });
  }
}

export const userRequest = new UserRequest();
