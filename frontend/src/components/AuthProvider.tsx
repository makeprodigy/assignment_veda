'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initAuth, isLoading, user } = useAuthStore();

  useEffect(() => {
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!isPublic && !user) {
      router.replace('/login');
    } else if (isPublic && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, pathname, router, user]);

  return <>{children}</>;
}
