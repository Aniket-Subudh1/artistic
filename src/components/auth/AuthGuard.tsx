'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthLogic } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

export function AuthGuard({ children, redirectTo = '/auth/signin', requiredRole }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthLogic();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to signin with return URL
        const currentPath = window.location.pathname;
        router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have the required role; send to home instead of dashboard
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requiredRole]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}