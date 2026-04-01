import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { User } from '@/types/user.type';
import { getRedirectPath } from '@/helpers/misc.helper';
import { isPublicRoute } from '@/helpers/route.helper';

export async function useRedirectServer(user: User | null) {
  const headersList = await headers();
  const currentPath = headersList.get('x-pathname') || '/';
  const redirectPath = getRedirectPath(user, currentPath);

  let shouldRedirect = false;

  // ======================
  // 1️⃣ CHƯA ĐĂNG NHẬP
  // ======================
  if (!user) {
    // private route → login
    if (!isPublicRoute(currentPath)) {
      shouldRedirect = true;
    }
  }

  // ======================
  // 2️⃣ ĐÃ ĐĂNG NHẬP
  // ======================
  else {
    // '/' là public nhưng chỉ User được ở
    if (currentPath === '/' && user.role.name !== 'User') {
      shouldRedirect = true;
    }

    // User thường → cấm lecturer/admin
    else if (
      user.role.name === 'User' &&
      (currentPath.startsWith('/lecturer') || currentPath.startsWith('/admin'))
    ) {
      shouldRedirect = true;
    }

    // Teacher → chỉ được /lecturer/*
    else if (
      user.role.name === 'Teacher' &&
      !currentPath.startsWith('/lecturer')
    ) {
      shouldRedirect = true;
    }

    // Admin → chỉ được /admin/*
    else if (
      user.role.name === 'Admin' &&
      !currentPath.startsWith('/admin')
    ) {
      shouldRedirect = true;
    }
  }

  if (shouldRedirect && redirectPath !== currentPath) {
    redirect(redirectPath);
  }
}
