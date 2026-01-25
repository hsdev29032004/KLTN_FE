export interface Permission {
  id: string;
  api: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  methods: string;
  createdAt: string;
  updatedAt: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: RolePermission[];
}

export interface Ban {
  id: string;
  reason: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  banId: string | null;
  roleId: string;
  isDeleted: boolean;
  timeBan: string | null;
  timeUnBan: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: Role;
  ban: Ban | null;
}

export interface UserLoginResponse {
  message: string;
  data: {
    user: User;
  };
}