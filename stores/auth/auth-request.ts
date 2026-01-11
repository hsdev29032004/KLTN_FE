import { Base } from "../base";

interface User {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

interface LoginResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export class AuthRequest extends Base {
  async fetchMe(): Promise<{ user: User }> {
    return this.request('/api/auth/me', {
      method: 'GET',
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  }

  async register(data: { name: string; email: string; password: string }): Promise<LoginResponse> {
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
}

export const authRequest = new AuthRequest();