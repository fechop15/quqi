# Commands
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

# Env Vars Required for Vercel
Firebase config MUST be in both Production AND Development environments:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```
Without ALL of these, build fails with `auth/invalid-api-key`.

# Stack
- Next.js 16 (NOT the Next.js you know - APIs may differ)
- Firebase Auth + Firestore
- TailwindCSS, react-hook-form, zod, recharts

# Architecture

## Route Groups (app folder)
- `(auth)` - Public routes (login, registro)
- `(dashboard)` - Protected routes with sidebar layout

## Pages
| Route | Description |
|-------|-------------|
| `/login`, `/registro` | Autenticación pública |
| `/dashboard` | Panel principal con estadísticas |
| `/productos` | CRUD productos |
| `/ventas` | Registro y listado de ventas |
| `/ingresos` | Ingreso de mercadería |
| `/egresos` | Egresos/gastos |
| `/usuarios` | Gestión de usuarios (admin) |
| `/reportes` | Reportes y gráficos |
| `/perfil` | Perfil del usuario |
| `/inventario/movimientos` | Historial de inventario |

## Roles
- `admin` - Acceso total
- `gerente` - Gestión de productos, ventas, ingresos, egresos, reportes
- `vendedor` - Solo crear ventas y ver productos

## Collections Firestore
- `users` - Perfiles de usuarios (uid, email, nombre, role, activo)
- `productos` - Catálogo de productos
- `ventas` - Registro de ventas
- `ingresos` - Ingresos de mercadería
- `egresos` - Egresos/gastos
- `inventario` - Movimientos de stock

## Key Files
- `src/lib/firebase.ts` - Firebase initialization
- `src/contexts/AuthContext.tsx` - Auth provider with user state
- `src/components/auth/ProtectedRoute.tsx` - Role-based route protection
- `src/hooks/useRole.ts` - Role checking hook

# Available Skills

## UI/UX Pro Max
- **Location**: `.opencode/skills/ui-ux-pro-max/`
- **Purpose**: Professional UI/UX design intelligence
- **Usage**: Request UI/UX tasks naturally (e.g., "Build a landing page", "Improve the dashboard design")