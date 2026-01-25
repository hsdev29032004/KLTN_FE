import { publicRoutes } from "@/constants/public-routes.constant";

export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some((route) => {
    // Exact match
    if (route === pathname) return true;

    // Pattern match (ví dụ: /courses/:id)
    const routePattern = route
      .replace(/:[^\s/]+/g, '[^/]+') // Thay :id bằng [^/]+
      .replace(/\*/g, '.*');

    return new RegExp(`^${routePattern}$`).test(pathname);
  });
}