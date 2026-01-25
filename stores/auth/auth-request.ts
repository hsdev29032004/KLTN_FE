import { AxiosResponse } from "axios";
import { Base } from "../base";
import { User, UserLoginResponse } from "@/types/user.type";

export class AuthRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async fetchMe(): Promise<{ data: User }> {
    return this.request('/api/auth/me', {
      method: 'GET',
    });
  }

  async login(email: string, password: string): Promise<UserLoginResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  }

  async register(data: { name: string; email: string; password: string }): Promise<UserLoginResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      data,
    });
  }

  async logout(): Promise<void> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<{ data: any; headers: any }> {
    return this.request('/api/auth/refresh-token', {
      method: 'POST',
    }, true);
  }
}

export const authRequest = new AuthRequest();