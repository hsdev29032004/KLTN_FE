import { getRedirectPath } from '@/helpers/misc.helper';
import { User } from '@/types/user.type';
import { useRouter, usePathname } from 'next/navigation';

export function useRedirect() {
  const router = useRouter();
  const currentPath = usePathname();

  return (user: User) => {
    const path = getRedirectPath(user, currentPath);

    if (!currentPath.startsWith(path) || path === '/') {
      router.push(path);
    }
  };
}