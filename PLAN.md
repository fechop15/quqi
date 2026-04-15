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
  - [ ] Página `/perfil` - Ver/editar datos (pendiente)

---

---

### Fase 3: Módulo de Productos ✅ PARCIALMENTE COMPLETADA

- [x] 3.1 Modelo de datos
  - [x] `src/types/producto.ts` - Interfaz Producto

- [x] 3.2 Listado de productos
  - [x] `src/app/productos/page.tsx` - Página principal
  - [x] `src/components/productos/ProductoList.tsx` - Tabla con búsqueda y filtros
  - [x] Alerta visual de stock bajo

- [x] 3.3 Crear productos
  - [x] `src/app/productos/nuevo/page.tsx` - Página de creación (Admin, Gerente)
  - [x] `src/components/productos/ProductoForm.tsx` - Formulario con validación

- [ ] 3.4 Editar/Eliminar productos
  - [ ] `src/app/productos/[id]/editar/page.tsx` - Editar (Admin, Gerente)
  - [ ] Función eliminar en ProductoList

- [ ] 3.5 Gestión de inventario
  - [ ] Historial de movimientos de inventario
  - [ ] `src/app/inventario/movimientos/page.tsx`

---

### Fase 4: Módulo de Ingresos

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

### Fase 5: Módulo de Ventas ✅ PARCIALMENTE COMPLETADA

- [x] 5.1 Modelo de datos
  - [x] `src/types/venta.ts` - Interfaces Venta y VentaItem

- [x] 5.2 Listado de ventas
  - [x] `src/app/ventas/page.tsx` - Página principal
  - [x] `src/components/ventas/VentaList.tsx` - Tabla con estados

- [x] 5.3 Crear ventas
  - [x] `src/app/ventas/nueva/page.tsx` - Página de creación
  - [x] `src/components/ventas/VentaForm.tsx` - Formulario con carrito de productos
  - [x] Descuento automático de stock al registrar venta

- [ ] 5.4 Detalle y edición
  - [ ] `src/app/ventas/[id]/page.tsx` - Ver detalle
  - [ ] Función cancelar venta (Admin, Gerente)

---

### Fase 6: Módulo de Ingresos ✅ COMPLETADA

- [x] 6.1 Modelo de datos
  - [x] `src/types/ingreso.ts`

- [x] 6.2 CRUD de ingresos
  - [x] `src/app/ingresos/page.tsx` - Listado con total acumulado (Admin, Gerente)
  - [x] `src/app/ingresos/nuevo/page.tsx` - Crear (Admin, Gerente)
  - [x] `src/components/ingresos/IngresoList.tsx`
  - [x] `src/components/ingresos/IngresoForm.tsx`

- [ ] 6.3 Editar/Eliminar ingresos
  - [ ] `src/app/ingresos/[id]/editar/page.tsx`

---

### Fase 7: Módulo de Egresos ✅ COMPLETADA

- [x] 7.1 Modelo de datos
  - [x] `src/types/egreso.ts`

- [x] 7.2 CRUD de egresos
  - [x] `src/app/egresos/page.tsx` - Listado con total acumulado (Admin, Gerente)
  - [x] `src/app/egresos/nuevo/page.tsx` - Crear (Admin, Gerente)
  - [x] `src/components/egresos/EgresoList.tsx`
  - [x] `src/components/egresos/EgresoForm.tsx`

- [ ] 7.3 Editar/Eliminar egresos
  - [ ] `src/app/egresos/[id]/editar/page.tsx`

---

### Fase 8: Dashboard y Reportes ✅ PARCIALMENTE COMPLETADA

- [x] 8.1 Dashboard principal
  - [x] `src/app/dashboard/page.tsx` - Vista inicial con datos reales
  - [x] Balance del mes en tiempo real
  - [x] Cards con: ventas hoy, productos en stock, ingresos del mes, egresos del mes

- [ ] 8.2 Gráficos y visualizaciones
  - [ ] Gráfico de ingresos vs egresos (recharts)
  - [ ] Últimas ventas recientes

- [ ] 8.3 Reportes por rol
  - [ ] Admin: todos los reportes, filtros por fecha/usuario
  - [ ] Gerente: reportes generales
  - [ ] Vendedor: solo sus estadísticas

- [ ] 8.4 Exportar reportes
  - [ ] Exportar a CSV
  - [ ] Exportar a PDF (opcional)

---

### Fase 9: Gestión de Usuarios (Solo Admin)

- [ ] 9.1 CRUD de usuarios
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

- [ ] Configurar reglas de seguridad en Firestore (copiar del PLAN.md)
- [ ] Editar producto: `src/app/productos/[id]/editar/page.tsx`
- [ ] Eliminar producto (Admin)
- [ ] Ver detalle de venta: `src/app/ventas/[id]/page.tsx`
- [ ] Cancelar venta (Admin, Gerente)
- [ ] Editar/Eliminar ingresos y egresos
- [ ] Agregar gráficos al dashboard (recharts)
- [ ] Página de usuarios (Admin)

---

*Documento creado: 2026-04-14*
