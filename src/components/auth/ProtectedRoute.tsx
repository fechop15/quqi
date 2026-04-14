'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types/auth';
import { useRole } from '@/hooks/useRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const role = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Verificar roles si se especifican
  useEffect(() => {
    if (!loading && user && requiredRoles && requiredRoles.length > 0) {
      if (!role.hasRole(requiredRoles)) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, requiredRoles, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0 && !role.hasRole(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}
