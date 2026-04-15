'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/ventas', label: 'Ventas', icon: '💰' },
  { href: '/productos', label: 'Productos', icon: '📦' },
  { href: '/inventario/movimientos', label: 'Inventario', icon: '📋', roles: ['admin', 'gerente'] },
  { href: '/ingresos', label: 'Ingresos', icon: '📈', roles: ['admin', 'gerente'] },
  { href: '/egresos', label: 'Egresos', icon: '📉', roles: ['admin', 'gerente'] },
  { href: '/usuarios', label: 'Usuarios', icon: '👥', roles: ['admin'] },
  { href: '/perfil', label: 'Mi Perfil', icon: '👤' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, logout } = useAuth();
  const role = useRole();
  const pathname = usePathname();

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-gray-900">Quqi</h1>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            isVisible(item.roles) && (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="mb-3 text-sm">
            <p className="font-medium text-gray-900">{profile?.nombre}</p>
            <p className="text-gray-500">{profile?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex h-16 items-center justify-end border-b bg-white px-8">
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
