import { useAuth } from '@/contexts/AuthContext';
import { Role, ROLE_PERMISSIONS } from '@/types/auth';

export function useRole() {
  const { profile, hasRole } = useAuth();

  const role = profile?.role;

  const can = (permission: string): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  const is = (requiredRole: Role | Role[]): boolean => {
    if (!role) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  return {
    role,
    is,
    can,
    isAdmin: () => role === 'admin',
    isGerente: () => role === 'gerente',
    isVendedor: () => role === 'vendedor',
    hasRole,
  };
}
