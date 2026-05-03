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
  slug?: string;
  introduce?: string;
  banId: string | null;
  roleId: string;
  isDeleted: boolean;
  timeBan: string | null;
  timeUnBan: string | null;
  availableAmount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: Role;
  ban: Ban | null;
  _count?: {
    courses: number;
    userCourses: number;
    invoices: number;
    reviews?: number;
    transactions?: number;
  };
}

export interface AdminUserListParams {
  search?: string;
  roleId?: string;
  roleName?: string;
  isBanned?: string;
  isDeleted?: string;
  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: string;
}

export interface AdminUserListResponse {
  message: string;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserLoginResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface LecturerCourse {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  star: number;
  studentCount: number;
  _count: {
    reviews: number;
    lessons: number;
  };
}

export interface LecturerStats {
  totalCourses: number;
  totalStudents: number;
  totalReviews: number;
  avgRating: number;
}

export interface LecturerProfile {
  id: string;
  fullName: string;
  avatar: string | null;
  slug: string;
  introduce: string;
  createdAt: string;
  role: {
    name: string;
  };
  stats: LecturerStats;
  courses: LecturerCourse[];
}

export interface LecturerProfileResponse {
  message: string;
  data: LecturerProfile;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LecturerProfileParams {
  page?: number;
  limit?: number;
}
