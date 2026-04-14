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

### Fase 1: Configuración e Infraestructura

- [ ] 1.1 Configurar Firebase en el proyecto
  - [ ] Crear proyecto en Firebase Console
  - [ ] Habilitar Authentication (Email/Password)
  - [ ] Habilitar Firestore Database
  - [ ] Configurar variables de entorno (.env.local)
  - [ ] Crear utilitario de conexión `src/lib/firebase.ts`

- [ ] 1.2 Configurar contexto de autenticación
  - [ ] `src/contexts/AuthContext.tsx` - Proveedor de autenticación
  - [ ] Hooks personalizados `useAuth`
  - [ ] Types para usuario y roles

- [ ] 1.3 Sistema de rutas protegidas
  - [ ] HOC `withAuth` para proteger páginas
  - [ ] Middleware para redirección por roles
  - [ ] Página de login `/login`
  - [ ] Página de registro `/registro`

---

### Fase 2: Autenticación y Autorización

- [ ] 2.1 Componentes de autenticación
  - [ ] `src/components/auth/LoginForm.tsx`
  - [ ] `src/components/auth/RegisterForm.tsx`
  - [ ] `src/components/auth/ProtectedRoute.tsx`

- [ ] 2.2 Gestión de roles
  - [ ] Colección `users` en Firestore con campo `role`
  - [ ] Función `checkRole(requiredRoles: string[])`
  - [ ] Componente `RoleGuard` para proteger UI por rol

- [ ] 2.3 Perfil de usuario
  - [ ] Página `/perfil` - Ver/editar datos
  - [ ] Cerrar sesión

---

### Fase 4: Módulo de Productos e Inventario

- [ ] 4.1 Modelo de datos
  ```typescript
  interface Producto {
    id: string;
    nombre: string;
    descripcion?: string;
    precioCompra: number;
    precioVenta: number;
    stock: number;
    stockMinimo: number;
    categoria?: string;
    sku?: string;
    activo: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```

- [ ] 4.2 CRUD de productos
  - [ ] `src/app/productos/page.tsx` - Listado con búsqueda y filtros
  - [ ] `src/app/productos/nuevo/page.tsx` - Crear producto (Admin, Gerente)
  - [ ] `src/app/productos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [ ] `src/components/productos/ProductoList.tsx`
  - [ ] `src/components/productos/ProductoForm.tsx`
  - [ ] `src/components/productos/StockAlert.tsx` - Alerta de stock bajo

- [ ] 4.3 Gestión de inventario
  - [ ] Ajuste de stock manual (entradas/salidas)
  - [ ] Historial de movimientos de inventario
  - [ ] `src/app/inventario/movimientos/page.tsx`

---

### Fase 5: Módulo de Ingresos

- [ ] 3.1 Modelo de datos
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

- [ ] 3.2 CRUD de ingresos
  - [ ] `src/app/ingresos/page.tsx` - Listado (Admin, Gerente)
  - [ ] `src/app/ingresos/nuevo/page.tsx` - Crear (Admin, Gerente)
  - [ ] `src/app/ingresos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [ ] `src/components/ingresos/IngresoList.tsx`
  - [ ] `src/components/ingresos/IngresoForm.tsx`

---

### Fase 6: Módulo de Egresos

- [ ] 4.1 Modelo de datos
  ```typescript
  interface Egreso {
    id: string;
    monto: number;
    descripcion: string;
    fecha: string;
    categoria: string;
    creadoPor: string;
    createdAt: Timestamp;
  }
  ```

- [ ] 4.2 CRUD de egresos
  - [ ] `src/app/egresos/page.tsx` - Listado (Admin, Gerente)
  - [ ] `src/app/egresos/nuevo/page.tsx` - Crear (Admin, Gerente)
  - [ ] `src/app/egresos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [ ] `src/components/egresos/EgresoList.tsx`
  - [ ] `src/components/egresos/EgresoForm.tsx`

---

### Fase 7: Módulo de Ventas

- [ ] 5.1 Modelo de datos
  ```typescript
  interface Venta {
    id: string;
    total: number;
    items: VentaItem[];
    cliente?: string;
    vendedorId: string;
    fecha: Timestamp;
    estado: 'pendiente' | 'completada' | 'cancelada';
  }
  
  interface VentaItem {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }
  ```

- [ ] 5.2 CRUD de ventas
  - [ ] `src/app/ventas/page.tsx` - Listado
    - Admin/Gerente: ven todas
    - Vendedor: solo las suyas
  - [ ] `src/app/ventas/nueva/page.tsx` - Crear venta
  - [ ] `src/app/ventas/[id]/page.tsx` - Detalle
  - [ ] `src/components/ventas/VentaList.tsx`
  - [ ] `src/components/ventas/VentaForm.tsx`
  - [ ] `src/components/ventas/VentaItems.tsx`

---

### Fase 8: Dashboard y Reportes

- [ ] 6.1 Dashboard principal
  - [ ] `src/app/dashboard/page.tsx`
  - [ ] Cards con totales (ingresos, egresos, balance)
  - [ ] Gráfico de ingresos vs egresos (recharts)
  - [ ] Últimas ventas

- [ ] 6.2 Reportes por rol
  - [ ] Admin: todos los reportes, filtros por fecha/usuario
  - [ ] Gerente: reportes generales
  - [ ] Vendedor: solo sus estadísticas

- [ ] 6.3 Exportar reportes
  - [ ] Exportar a CSV
  - [ ] Exportar a PDF (opcional)

---

### Fase 9: Gestión de Usuarios (Solo Admin)

- [ ] 7.1 CRUD de usuarios
  - [ ] `src/app/usuarios/page.tsx` - Listado
  - [ ] `src/app/usuarios/nuevo/page.tsx` - Crear
  - [ ] `src/app/usuarios/[id]/editar/page.tsx` - Editar rol
  - [ ] `src/components/usuarios/UserList.tsx`
  - [ ] `src/components/usuarios/UserForm.tsx`

---

## Estructura de Directorios Propuesta

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registro/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── productos/
│   │   ├── inventario/
│   │   ├── ingresos/
│   │   ├── egresos/
│   │   ├── ventas/
│   │   └── usuarios/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── productos/
│   ├── inventario/
│   ├── ingresos/
│   ├── egresos/
│   ├── ventas/
│   ├── usuarios/
│   └── ui/ (componentes reutilizables)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useRole.ts
├── lib/
│   ├── firebase.ts
│   └── utils.ts
├── types/
│   ├── auth.ts
│   ├── producto.ts
│   ├── ingreso.ts
│   ├── egreso.ts
│   └── venta.ts
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
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return getUserRole() == 'admin';
    }
    
    function isManager() {
      return getUserRole() == 'gerente' || isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isLoggedIn() && (userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
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
      allow read: if isLoggedIn() && 
        (isAdmin() || isManager() || resource.data.vendedorId == request.auth.uid);
      allow create: if isLoggedIn();
      allow update: if isLoggedIn() && (isAdmin() || isManager());
      allow delete: if isAdmin();
    }
    
    // Productos
    match /productos/{productoId} {
      allow read: if isLoggedIn();
      allow create, update: if isLoggedIn() && isManager();
      allow delete: if isAdmin();
    }
    
    // Inventario movimientos
    match /inventario_movimientos/{movimientoId} {
      allow read: if isLoggedIn() && isManager();
      allow create: if isLoggedIn() && isManager();
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

## Dependencias a Instalar

```bash
# Firebase y visualización
npm install firebase recharts

# Utilidades (opcional pero recomendado)
npm install react-hook-form zod @hookform/resolvers sonner
# - react-hook-form: gestión de formularios
# - zod: validación de esquemas
# - sonner: notificaciones toast

npm install -D @types/firebase
```

---

## Próximos Pasos Inmediatos

1. [ ] Crear proyecto en Firebase Console
2. [ ] Obtener credenciales de Firebase
3. [ ] Instalar dependencias (`firebase`, `recharts`)
4. [ ] Configurar `src/lib/firebase.ts`
5. [ ] Crear `AuthContext` y hooks
6. [ ] Implementar login/registro
7. [ ] Configurar reglas de seguridad en Firestore

---

*Documento creado: 2026-04-14*
