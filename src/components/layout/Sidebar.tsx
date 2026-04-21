'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Users,
  User,
  LogOut,
  ChevronRight,
  FileText,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/reportes', label: 'Reportes', icon: <FileText className="h-5 w-5" />, roles: ['admin', 'gerente'] },
  { href: '/ventas', label: 'Ventas', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/productos', label: 'Productos', icon: <Package className="h-5 w-5" /> },
  { href: '/inventario/movimientos', label: 'Inventario', icon: <ClipboardList className="h-5 w-5" />, roles: ['admin', 'gerente'] },
  { href: '/ingresos', label: 'Ingresos', icon: <TrendingUp className="h-5 w-5" />, roles: ['admin', 'gerente'] },
  { href: '/egresos', label: 'Egresos', icon: <TrendingDown className="h-5 w-5" />, roles: ['admin', 'gerente'] },
  { href: '/usuarios', label: 'Usuarios', icon: <Users className="h-5 w-5" />, roles: ['admin'] },
  { href: '/perfil', label: 'Mi Perfil', icon: <User className="h-5 w-5" /> },
  { href: '/configuracion', label: 'Configuración', icon: <Settings className="h-5 w-5" />, roles: ['admin', 'gerente'] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { profile, logout } = useAuth();
  const role = useRole();
  const pathname = usePathname();
  const { config } = useConfiguracion();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const isVisible = (itemRoles?: string[]) => {
    if (!itemRoles) return true;
    return role.is(itemRoles as any);
  };

  const getRoleBadge = (roleName: string) => {
    const badges: Record<string, { label: string; variant: string }> = {
      admin: { label: 'Administrador', variant: 'bg-primary-100 text-primary-700' },
      gerente: { label: 'Gerente', variant: 'bg-success-50 text-success-600' },
      vendedor: { label: 'Vendedor', variant: 'bg-blue-50 text-blue-600' },
    };
    return badges[roleName] || { label: roleName, variant: 'bg-gray-100 text-gray-700' };
  };

  const roleBadge = profile?.role ? getRoleBadge(profile.role) : null;

  return (
    <>
      {onClose && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-64
          bg-white border-r border-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.nombreNegocio || 'Logo'}
              className="h-9 w-9 object-contain rounded-lg"
            />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: config?.colorPrimario || '#6366f1', color: 'white' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
          <span className="text-xl font-bold text-text-primary">
            {config?.nombreNegocio || 'Quqi'}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (!isVisible(item.roles)) return null;

              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5
                      text-sm font-medium transition-all duration-200
                      cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                      }
                    `}
                  >
                    <span
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-lg
                        transition-colors duration-200
                        ${isActive ? 'bg-primary-100 text-primary-600' : 'text-text-muted group-hover:bg-gray-100 group-hover:text-text-secondary'}
                      `}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          {profile && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                {profile.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {profile.nombre}
                </p>
                {roleBadge && (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge.variant}`}>
                    {roleBadge.label}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
              text-danger-500 hover:bg-danger-50 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
