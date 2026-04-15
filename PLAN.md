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
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
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
    match /users/{userId} {
      allow read: if isLoggedIn();
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
      // Los usuarios pueden actualizar su propio perfil
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

---

# PLAN DE REDISEÑO - FASE UX/UI

## Visión del Rediseño

Transformar Quqi de una app funcional a una experiencia visual profesional con un dashboard moderno que inspire confianza y eficiencia.

### Style Guide: Modern Dashboard

| Aspecto | Valor |
|---------|-------|
| **Pattern** | Dashboard-focused + Data Visualization |
| **Style** | Glassmorphism sutil + Soft UI |
| **Mood** | Profesional, limpio, eficiente |
| **Accessibility** | WCAG AA compliant |

### Sistema de Colores

```
Primary:      #6366F1 (Indigo 500)     - Acciones principales
Secondary:    #8B5CF6 (Violet 500)     - Highlights
Success:      #10B981 (Emerald 500)    - Ingresos, completado
Warning:      #F59E0B (Amber 500)      - Alertas, stock bajo
Danger:       #EF4444 (Red 500)         - Egresos, errores
Background:   #F8FAFC (Slate 50)       - Fondo general
Surface:      #FFFFFF                   - Cards, modales
Text Primary: #1E293B (Slate 800)      - Títulos
Text Muted:   #64748B (Slate 500)      - Descripciones
Border:       #E2E8F0 (Slate 200)      - Bordes sutiles
```

### Tipografía

```
Headings: Inter (700, 600) - https://fonts.google.com/specimen/Inter
Body:    Inter (400, 500) - Limpia y legible
Mono:    JetBrains Mono - Para números y datos
```

### Espaciado

```
xs: 4px    |  sm: 8px    |  md: 16px   |  lg: 24px
xl: 32px   |  2xl: 48px  |  3xl: 64px
```

---

## Fases de Rediseño

### Fase R1: Fundamentos del Diseño ✅ EN PROCESO

- [ ] 1.1 Sistema de Diseño Base
  - [ ] Variables CSS en `globals.css`
  - [ ] Configuración de colores, tipografía y espaciado
  - [ ] Tailwind config actualizado con custom tokens

- [ ] 1.2 Componentes Base
  - [ ] `<Button>` - Primario, secundario, outline, ghost, danger
  - [ ] `<Input>` - Con estados: default, focus, error, disabled
  - [ ] `<Select>`, `<Textarea>`, `<Checkbox>`
  - [ ] `<Card>` - Variantes: default, elevated, glass
  - [ ] `<Badge>` - Estados: success, warning, danger, info
  - [ ] `<Modal>` - Con backdrop blur y transiciones
  - [ ] `<Table>` - Headers sticky, hover rows, responsive
  - [ ] `<EmptyState>` - Ilustraciones para estados vacíos

- [ ] 1.3 Iconos (Reemplazar emojis)
  - [ ] Instalar `lucide-react` o `heroicons`
  - [ ] Actualizar sidebar y navegación
  - [ ] Actualizar botones de acciones

### Fase R2: Layout Principal

- [ ] 2.1 Sidebar Redesenhado
  - [ ] Logo con icono SVG profesional
  - [ ] Navegación con iconos y hover states
  - [ ] Indicador de página activa (pill/highlight)
  - [ ] User profile card en footer
  - [ ] Responsive: colapsable en mobile

- [ ] 2.2 Header
  - [ ] Breadcrumbs dinámicos
  - [ ] Search global (futuro)
  - [ ] Notificaciones dropdown (futuro)
  - [ ] Quick actions

- [ ] 2.3 Layout Responsive
  - [ ] Mobile: sidebar como drawer
  - [ ] Tablet: sidebar colapsable
  - [ ] Desktop: sidebar fijo expandido

### Fase R3: Dashboard Premium

- [ ] 3.1 Stats Cards
  - [ ] Icono con fondo gradient
  - [ ] Trend indicator (↑↓)
  - [ ] Hover: elevación sutil
  - [ ] Skeleton loading

- [ ] 3.2 Gráficos Mejorados
  - [ ] Paleta de colores consistente
  - [ ] Tooltips customizados
  - [ ] Leyendas claras
  - [ ] Animaciones de entrada

- [ ] 3.3 Quick Actions
  - [ ] Botones con iconos
  - [ ] Hover states con micro-animaciones
  - [ ] Badges de cantidad

### Fase R4: Páginas de Lista

- [ ] 4.1 Header de Página
  - [ ] Título + descripción
  - [ ] Filtros search
  - [ ] Botón principal CTA

- [ ] 4.2 Tablas Mejoradas
  - [ ] Filas con hover highlight
  - [ ] Acciones en dropdown menu
  - [ ] Paginación estilizada
  - [ ] Bulk actions

- [ ] 4.3 Empty States
  - [ ] Ilustraciones placeholder
  - [ ] Mensaje contextual
  - [ ] CTA para crear

### Fase R5: Formularios Premium

- [ ] 5.1 Input Fields
  - [ ] Labels flotantes
  - [ ] Helper text
  - [ ] Error states con shake
  - [ ] Loading state

- [ ] 5.2 Layout de Forms
  - [ ] Secciones colapsables
  - [ ] Multi-column en desktop
  - [ ] Responsive stack en mobile

- [ ] 5.3 Feedback UI
  - [ ] Toast notifications estilizadas
  - [ ] Progress indicators
  - [ ] Success confirmations

### Fase R6: Autenticación

- [ ] 6.1 Login/Registro
  - [ ] Card centrada con shadow
  - [ ] Branding profesional
  - [ ] Social login buttons (futuro)

- [ ] 6.2 Estados de Carga
  - [ ] Spinner consistente
  - [ ] Skeleton screens
  - [ ] Progressive loading

---

## Componentes a Crear/Actualizar

### Nuevos Componentes (`src/components/ui/`)

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `Button.tsx` | Sistema de botones | Alta |
| `Input.tsx` | Input con validación visual | Alta |
| `Card.tsx` | Card base con variantes | Alta |
| `Badge.tsx` | Tags de estado | Media |
| `Modal.tsx` | Modal con portal | Media |
| `Table.tsx` | Tabla responsive | Media |
| `Dropdown.tsx` | Menú dropdown | Media |
| `Skeleton.tsx` | Loading skeleton | Baja |
| `Avatar.tsx` | Avatar de usuario | Baja |
| `Tooltip.tsx` | Tooltips informativos | Baja |

### Hooks Útiles

| Hook | Uso |
|------|-----|
| `useMediaQuery` | Responsive breakpoints |
| `useCopyToClipboard` | Copiar al clipboard |
| `useToast` | Notificaciones custom |

---

## Orden de Implementación Sugerido

```
1. globals.css + tailwind.config.ts
2. Button, Input, Card (componentes base)
3. Sidebar con iconos
4. Dashboard stats cards
5. Tablas mejoradas
6. Forms premium
7. Login/Registro
8. Polish final
```

---

## Checklist de Calidad

- [ ] Sin emojis (solo SVGs)
- [ ] Contraste WCAG AA (4.5:1 mínimo)
- [ ] Hover states en todos los interactivos
- [ ] Focus visible para keyboard nav
- [ ] Touch targets 44x44px mínimo
- [ ] Responsive en 375px, 768px, 1024px, 1440px
- [ ] prefers-reduced-motion respetado
- [ ] Loading states en datos async

---

*Última actualización: 2026-04-15*
