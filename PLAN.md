# Plan de Desarrollo - Quqi

Aplicación web para gestión de ingresos, egresos y ventas con autenticación y roles.

---

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 16 (App Router) | Framework principal |
| React | UI components |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos |
| Firebase Authentication | Login/Registro |
| Firebase Firestore | Base de datos |
| Firebase Security Rules | Seguridad por roles |

---

## Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total: CRUD completo de ingresos, egresos, ventas, productos, usuarios y reportes |
| **Gerente** | Lectura/escritura de ingresos, egresos, ventas, productos. Reportes. Sin gestión de usuarios |
| **Vendedor** | Solo registro de ventas. Vista de productos (lectura). Solo ve sus propias ventas |

---

## Fases de Desarrollo

### Fase 1: Configuración e Infraestructura ✅ COMPLETADA

- [x] 1.1 Configurar Firebase en el proyecto
  - [x] Crear proyecto en Firebase Console (quqi-3ecdf)
  - [x] Habilitar Authentication (Email/Password)
  - [x] Habilitar Firestore Database
  - [x] Configurar variables de entorno (.env.local)
  - [x] Crear utilitario de conexión `src/lib/firebase.ts`

- [x] 1.2 Configurar contexto de autenticación
  - [x] `src/contexts/AuthContext.tsx` - Proveedor de autenticación
  - [x] Hooks personalizados `useAuth`
  - [x] Types para usuario y roles

- [x] 1.3 Sistema de rutas protegidas
  - [x] Middleware para protección de rutas
  - [x] Página de login `/login`
  - [x] Página de registro `/registro`

---

### Fase 2: Autenticación y Autorización ✅ COMPLETADA

- [x] 2.1 Componentes de autenticación
  - [x] `src/components/auth/LoginForm.tsx`
  - [x] `src/components/auth/RegisterForm.tsx`
  - [x] `src/components/auth/ProtectedRoute.tsx`

- [x] 2.2 Gestión de roles
  - [x] Colección `users` en Firestore con campo `role`
  - [x] Función `checkRole(requiredRoles: string[])`
  - [x] Componente `RoleGuard` para proteger UI por rol

- [x] 2.3 Perfil de usuario
  - [x] Cerrar sesión implementado
  - [x] Página `/perfil` - Ver/editar datos del usuario

### Fase 3: Módulo de Productos ✅ COMPLETADA

- [x] 3.1 Modelo de datos
  - [x] `src/types/producto.ts` - Interfaz Producto

- [x] 3.2 Listado de productos
  - [x] `src/app/(dashboard)/productos/page.tsx` - Página principal
  - [x] `src/components/productos/ProductoList.tsx` - Tabla con búsqueda y filtros
  - [x] Alerta visual de stock bajo

- [x] 3.3 Crear productos
  - [x] `src/app/(dashboard)/productos/nuevo/page.tsx` - Página de creación (Admin, Gerente)
  - [x] `src/components/productos/ProductoForm.tsx` - Formulario con validación

- [x] 3.4 Editar/Eliminar productos
  - [x] `src/app/(dashboard)/productos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [x] Función eliminar en ProductoList (solo Admin)

- [x] 3.5 Gestión de inventario ✅ COMPLETADA
  - [x] Historial de movimientos de inventario
  - [x] `src/app/(dashboard)/inventario/movimientos/page.tsx`
  - [x] Registro automático al crear/editar productos
  - [x] Registro automático al registrar ventas

---

### Fase 4: Módulo de Ingresos ✅ COMPLETADA

- [x] 4.1 Modelo de datos
  ```typescript
  interface Ingreso {
    id: string;
    monto: number;
    descripcion: string;
    fecha: string;
    categoria: string;
    creadoPor: string;
    createdAt: Timestamp;
  }
  ```

- [x] 4.2 CRUD de ingresos
  - [x] `src/app/(dashboard)/ingresos/page.tsx` - Listado con búsqueda y filtros
  - [x] `src/app/(dashboard)/ingresos/nuevo/page.tsx` - Crear producto (Admin, Gerente)
  - [x] `src/app/(dashboard)/ingresos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [x] `src/components/ingresos/IngresoList.tsx`
  - [x] `src/components/ingresos/IngresoForm.tsx`
  - [x] Función eliminar en IngresoList (solo Admin)

---

### Fase 5: Módulo de Ventas ✅ COMPLETADA

- [x] 5.1 Modelo de datos
  - [x] `src/types/venta.ts` - Interfaces Venta y VentaItem

- [x] 5.2 Listado de ventas
  - [x] `src/app/(dashboard)/ventas/page.tsx` - Página principal
  - [x] `src/components/ventas/VentaList.tsx` - Tabla con estados

- [x] 5.3 Crear ventas
  - [x] `src/app/(dashboard)/ventas/nueva/page.tsx` - Página de creación
  - [x] `src/components/ventas/VentaForm.tsx` - Formulario con carrito de productos
  - [x] Descuento automático de stock al registrar venta

- [x] 5.4 Detalle y edición
  - [x] `src/app/(dashboard)/ventas/[id]/page.tsx` - Ver detalle
  - [x] Función cancelar venta (Admin, Gerente) con restauración de stock

---

### Fase 6: Módulo de Egresos ✅ COMPLETADA

- [x] 6.1 Modelo de datos
  - [x] `src/types/egreso.ts`

- [x] 6.2 CRUD de egresos
  - [x] `src/app/(dashboard)/egresos/page.tsx` - Listado con total acumulado (Admin, Gerente)
  - [x] `src/app/(dashboard)/egresos/nuevo/page.tsx` - Crear (Admin, Gerente)
  - [x] `src/app/(dashboard)/egresos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [x] `src/components/egresos/EgresoList.tsx`
  - [x] `src/components/egresos/EgresoForm.tsx`
  - [x] Función eliminar en EgresoList (solo Admin)

---

### Fase 7: Dashboard y Reportes ✅ PARCIALMENTE COMPLETADA

- [x] 7.1 Dashboard principal
  - [x] `src/app/(dashboard)/dashboard/page.tsx` - Vista inicial con datos reales
  - [x] Balance del mes en tiempo real
  - [x] Cards con: ventas hoy, productos en stock, ingresos del mes, egresos del mes
  - [x] Accesos rápidos a formularios de creación

- [x] 7.2 Gráficos y visualizaciones
  - [x] Gráfico de ingresos vs egresos (recharts) - últimos 6 meses
  - [x] Últimas ventas recientes en dashboard

- [ ] 7.3 Reportes por rol
  - [ ] Admin: todos los reportes, filtros por fecha/usuario
  - [ ] Gerente: reportes generales
  - [ ] Vendedor: solo sus estadísticas

- [ ] 7.4 Exportar reportes
  - [ ] Exportar a CSV (opcional)
  - [ ] Exportar a PDF (opcional)

---

### Fase 8: Gestión de Usuarios (Solo Admin) ✅ COMPLETADA

- [x] 8.1 CRUD de usuarios
  - [x] `src/app/(dashboard)/usuarios/page.tsx` - Listado con búsqueda y filtros
  - [x] `src/app/(dashboard)/usuarios/nuevo/page.tsx` - Crear usuario con Firebase Auth
  - [x] `src/app/(dashboard)/usuarios/[id]/editar/page.tsx` - Editar rol y datos
  - [x] `src/components/usuarios/UserList.tsx` - Tabla con activar/desactivar y eliminar
  - [x] `src/components/usuarios/UserForm.tsx` - Formulario con validación
  - [x] `src/types/usuario.ts` - Interfaces Usuario y UsuarioForm

---

## Estructura de Directorios Actual

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard principal
│   │   ├── productos/
│   │   │   ├── page.tsx            # Listado
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx        # Crear
│   │   │   └── [id]/
│   │   │       └── editar/
│   │   │           └── page.tsx    # Editar
│   │   ├── ingresos/
│   │   │   ├── page.tsx            # Listado
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx        # Crear
│   │   │   └── [id]/
│   │   │       └── editar/
│   │   │           └── page.tsx    # Editar
│   │   ├── egresos/
│   │   │   ├── page.tsx            # Listado
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx        # Crear
│   │   │   └── [id]/
│   │   │       └── editar/
│   │   │           └── page.tsx    # Editar
│   │   ├── ventas/
│   │   │   ├── page.tsx            # Listado
│   │   │   ├── nueva/
│   │   │   │   └── page.tsx        # Crear
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detalle + Cancelar
│   │   ├── inventario/
│   │   │   └── movimientos/
│   │   │       └── page.tsx        # Historial de movimientos
│   │   ├── usuarios/
│   │   │   ├── page.tsx            # Listado
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx        # Crear
│   │   │   └── [id]/
│   │   │       └── editar/
│   │   │           └── page.tsx    # Editar rol
│   │   └── perfil/
│   │       └── page.tsx            # Perfil del usuario
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── productos/
│   │   ├── ProductoList.tsx
│   │   └── ProductoForm.tsx
│   ├── ingresos/
│   │   ├── IngresoList.tsx
│   │   └── IngresoForm.tsx
│   ├── egresos/
│   │   ├── EgresoList.tsx
│   │   └── EgresoForm.tsx
│   ├── ventas/
│   │   ├── VentaList.tsx
│   │   └── VentaForm.tsx
│   ├── usuarios/
│   │   ├── UserList.tsx
│   │   └── UserForm.tsx
│   └── inventario/
│       └── InventarioMovimientos.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useRole.ts
├── lib/
│   ├── firebase.ts
│   └── utils.ts                    # formatCurrency (COP)
├── types/
│   ├── auth.ts
│   ├── producto.ts
│   ├── ingreso.ts
│   ├── egreso.ts
│   ├── venta.ts
│   ├── usuario.ts
│   └── inventario.ts
└── middleware.ts
```

---

## Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isLoggedIn() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role;
    }

    function hasRole(requiredRoles) {
      let userRole = getUserRole();
      return userRole in requiredRoles;
    }

    function isAdmin() {
      return getUserRole() == 'admin';
    }

    function isManager() {
      return getUserRole() in ['admin', 'gerente'];
    }

    // Usuarios (perfiles del sistema)
    match /usuarios/{userId} {
      allow read: if isLoggedIn();
      allow create, update, delete: if isAdmin();
      allow update: if isLoggedIn() && request.auth.uid == userId;
    }

    // Ingresos
    match /ingresos/{ingresoId} {
      allow read: if isLoggedIn() && isManager();
      allow create, update, delete: if isLoggedIn() && isManager();
    }

    // Egresos
    match /egresos/{egresoId} {
      allow read: if isLoggedIn() && isManager();
      allow create, update, delete: if isLoggedIn() && isManager();
    }

    // Ventas
    match /ventas/{ventaId} {
      allow read: if isLoggedIn();
      allow create: if isLoggedIn();
      allow update: if isLoggedIn() && isManager();
      allow delete: if isAdmin();
    }

    // Productos
    match /productos/{productoId} {
      allow read: if isLoggedIn();
      allow create, update: if isLoggedIn() && isManager();
      allow delete: if isAdmin();
    }

    // Movimientos de inventario
    match /movimientos_inventario/{movimientoId} {
      allow read: if isLoggedIn() && isManager();
      allow create: if isLoggedIn() && isManager();
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Dependencias Instaladas

```bash
# Firebase
npm install firebase

# Visualización
npm install recharts

# Notificaciones toast
npm install sonner
```

---

## Próximos Pasos Inmediatos

- [ ] Reportes por rol con filtros por fecha
- [ ] Exportar reportes a CSV
- [ ] Actualizar reglas de seguridad de Firestore (colección movimientos_inventario)

---

*Última actualización: 2026-04-14*
