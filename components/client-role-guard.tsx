// components/client-route-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { getRedirectPath } from '@/helpers/misc.helper';
import { isPublicRoute } from '@/helpers/route.helper';
import { User } from '@/types/user.type';

function shouldRedirectClient(user: User | null, currentPath: string): boolean {
  if (!user) {
    return !isPublicRoute(currentPath);
  }

  if (currentPath === '/' && user.role.name !== 'User') return true;

  if (
    user.role.name === 'User' &&
    (currentPath.startsWith('/lecturer') || currentPath.startsWith('/admin'))
  ) return true;

  if (user.role.name === 'Teacher' && !currentPath.startsWith('/lecturer')) return true;

  if (user.role.name === 'Admin' && !currentPath.startsWith('/admin')) return true;

  return false;
}

export function ClientRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Luôn lấy user mới nhất từ Redux, không dùng prop
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!shouldRedirectClient(user, pathname)) return;

    const redirectPath = getRedirectPath(user, pathname);
    if (redirectPath !== pathname) {
      router.replace(redirectPath);
    }
  }, [pathname, user]); // user thay đổi → effect chạy lại ngay

  return null;
}