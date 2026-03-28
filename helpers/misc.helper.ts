import { User } from "@/types/user.type";
import { isPublicRoute } from "./route.helper";

export const getRedirectPath = (user: User | null, currentPath: string): string => {
  // Chưa đăng nhập
  if (!user) {
    return isPublicRoute(currentPath) ? currentPath : '/login';
  }

  // Đã đăng nhập → home theo role
  switch (user.role?.name) {
    case 'User':
      return '/';
    case 'Teacher':
      return '/lecturer/dashboard';
    case 'Admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
};
