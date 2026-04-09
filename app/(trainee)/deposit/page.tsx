'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Deposit feature has been removed. Redirect to home.
export default function DepositPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
