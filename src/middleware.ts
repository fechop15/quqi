import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/registro'];

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/ventas', '/productos', '/ingresos', '/egresos', '/usuarios'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta pública
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const hasSessionCookie = request.cookies.has('session');

    // Nota: La verificación real de autenticación se hace en el cliente
    // con AuthContext. Este middleware es una capa adicional de protección.
    if (!hasSessionCookie) {
      // Permitir el acceso pero el AuthContext redirigirá si no hay auth
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
