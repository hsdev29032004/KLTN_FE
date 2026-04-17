import { Base } from '../base';

export class RoleRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getRoles(): Promise<{ data: any[] }> {
    return this.request('/api/roles', { method: 'GET' });
  }

  async getRole(id: string): Promise<{ data: any }> {
    return this.request(`/api/roles/${id}`, { method: 'GET' });
  }

  async createRole(data: { name: string }): Promise<{ data: any }> {
    return this.request('/api/roles', { method: 'POST', data });
  }

  async updateRole(id: string, data: { name?: string }): Promise<{ data: any }> {
    return this.request(`/api/roles/${id}`, { method: 'PUT', data });
  }

  async assignPermission(roleId: string, payload: { permissionId?: string; api?: string; methods: string }) {
    return this.request(`/api/roles/${roleId}/permissions`, { method: 'POST', data: payload });
  }

  async updateRolePermission(roleId: string, permissionId: string, data: { methods: string }) {
    return this.request(`/api/roles/${roleId}/permissions/${permissionId}`, { method: 'PUT', data });
  }

  async removeRolePermission(roleId: string, permissionId: string) {
    return this.request(`/api/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' });
  }

  async getPermissions(): Promise<{ data: any[] }> {
    return this.request('/api/permissions', { method: 'GET' });
  }

  async createPermission(data: { api: string }) {
    return this.request('/api/permissions', { method: 'POST', data });
  }
}

export const roleRequest = new RoleRequest();
