# 📚 Machy — Sistema de Ventas con Escaneo de Código de Barras

Aplicación web responsiva (PWA-compatible) para **Librería Machy** — punto de venta, inventario, control de usuarios y generación de boletas PDF.

**Stack**: React + Vite + Tailwind | Express + TypeScript + Prisma | PostgreSQL  
**Arquitectura**: MVC (Model-View-Controller)  
**Metodología**: Extreme Programming (XP) | IEEE Std 1016-2009

---

## 🚀 Probar en local con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jhn2059/machy.git
cd machy

# 2. Levantar los 3 servicios (DB + API + Frontend)
docker compose up -d

# 3. Esperar ~15 segundos (migraciones + seed automáticos)

# 4. Abrir en el navegador
#    http://localhost:5173
```

### Credenciales de prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Admin | `admin@machy.pe` | `admin123` | Administrador |
| Vendedor | `vendedor@machy.pe` | `vendedor123` | Vendedor |

### Comandos Docker útiles

```bash
docker compose ps                     # Ver estado de los contenedores
docker compose logs machy-api         # Logs del backend
docker compose logs machy-web         # Logs del frontend
docker compose down                   # Detener servicios
docker compose down -v                # Reset completo (borra BD)
```

### Servicios locales

| Servicio | URL |
|----------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| Base de datos | localhost:5432 |

---

## 📦 Instalación sin Docker (desarrollo)

Requisitos: **Node.js 20+** y **PostgreSQL 16+**

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example packages/backend/.env
# Edita DATABASE_URL con tu PostgreSQL local

# 3. Ejecutar migraciones y seed
cd packages/backend
npx prisma migrate dev --name init
npx prisma db seed

# 4. Iniciar backend (puerto 3000)
npm run dev

# 5. En otra terminal, iniciar frontend (puerto 5173)
cd packages/frontend
npm run dev
```

---

## ☁️ Desplegar en producción

### 1. Supabase (Base de Datos)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a Project Settings → Database → Connection string
3. Copia la URI en modo **Session Pooler** (puerto 6543):

```
postgresql://postgres.xxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### 2. Render (Backend API)

1. Crea cuenta en [render.com](https://render.com) y conecta este repositorio
2. Crea un **Web Service** o usa **Blueprint** (detecta `render.yaml` automáticamente)
3. Configura las variables de entorno:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | URI de Supabase |
| `JWT_SECRET` | (genera uno aleatorio) |
| `CORS_ORIGIN` | URL de Vercel (ej. `https://machy.vercel.app`) |

Render comandos automáticos:
- **Build**: `npm install && npx prisma generate && npm run build`
- **Start**: `npx prisma migrate deploy && npm start`

### 3. Vercel (Frontend React)

1. Conecta este repositorio en [vercel.com](https://vercel.com)
2. Configura el proyecto:

| Campo | Valor |
|-------|-------|
| Framework | Vite |
| Root Directory | `packages/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_API_URL` = URL de Render + `/api` |

### 4. Verificar despliegue

Abre la URL de Vercel, inicia sesión con las credenciales de prueba, y verifica que todo funcione.

---

## 🏗️ Estructura del proyecto (MVC)

```
taipe/
├── packages/
│   ├── backend/                     # Express + TypeScript + Prisma
│   │   ├── src/
│   │   │   ├── config/              # env, database, cors, constants
│   │   │   ├── models/              # M - Prisma queries
│   │   │   ├── controllers/         # C - Request handlers + Zod
│   │   │   ├── routes/              # URL mapping
│   │   │   ├── middleware/          # auth, roles, shift
│   │   │   └── utils/               # jwt, pdf, errors
│   │   └── prisma/
│   │       ├── schema.prisma        # 9 modelos + 5 enums
│   │       └── seed.ts
│   │
│   └── frontend/                    # React + Vite + Tailwind
│       └── src/
│           ├── models/              # M - API services (axios)
│           ├── controllers/         # C - Custom hooks
│           ├── views/               # V - Pages + Components
│           │   ├── layouts/         # PublicLayout, PrivateLayout
│           │   ├── pages/           # 11 módulos
│           │   └── components/      # BarcodeScanner, ProtectedRoute
│           └── context/             # AuthContext (JWT + inactividad)
│
├── docker-compose.yml               # machy-db + machy-api + machy-web
├── render.yaml                      # Blueprint para Render
└── .env.example                     # Variables de entorno
```

---

## 🔐 Roles del sistema

| Rol | Acceso |
|-----|--------|
| **Administrador** | Todo: dashboard, ventas, productos, inventario, categorías, proveedores, usuarios, asistencia, configuración |
| **Vendedor** | Punto de venta, catálogo activo (solo lectura), historial propio, escaneo |

---

## 🧪 API Endpoints

### Auth
| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/login` | No |
| POST | `/api/auth/logout` | Sí |
| GET | `/api/auth/me` | Sí |
| POST | `/api/auth/recover` | No |

### Usuarios (Admin)
| Método | Ruta |
|--------|------|
| GET | `/api/users` |
| POST | `/api/users` |
| GET | `/api/users/:id` |
| PUT | `/api/users/:id` |
| PATCH | `/api/users/:id/toggle` |

### Productos
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/products` | Cualquiera |
| POST | `/api/products` | Admin |
| GET | `/api/products/barcode/:code` | Cualquiera |
| PUT | `/api/products/:id` | Admin |
| PATCH | `/api/products/:id/discontinue` | Admin |
| GET | `/api/products/low-stock` | Cualquiera |
| GET | `/api/products/stock-summary` | Cualquiera |

### Ventas
| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/sales` | Cualquiera |
| GET | `/api/sales` | Cualquiera |
| GET | `/api/sales/:id/boleta` | Cualquiera |
| PUT | `/api/sales/:id/void` | Admin |

### Otros
| Método | Ruta | Auth |
|--------|------|------|
| GET/POST/PUT | `/api/categories` | Admin |
| GET/POST/PUT | `/api/suppliers` | Admin |
| GET | `/api/attendance` | Admin |
| GET/PUT | `/api/config` | Admin |

---

## 💡 Características técnicas

- **bcrypt** cost 12 para contraseñas
- **JWT** con expiración 8h + refresh automático
- **Bloqueo** tras 5 intentos fallidos (15 min)
- **Transacciones ACID** en ventas (Prisma `$transaction`)
- **Cálculo automático** IGV 18% en soles peruanos (S/ PEN)
- **Escaneo** EAN-13, EAN-8, Code 128, QR, UPC-A vía cámara (html5-qrcode)
- **Boletas PDF** con datos del negocio, detalle, IGV y total
- **Historial de precios** automático al modificar producto
- **Alertas** de stock bajo en dashboard e inventario
- **Restricción** de acceso por turno laboral (Mañana/Tarde/Completo)
- **Cierre automático** por inactividad (30 min) con advertencia a los 28 min
- **Middleware RBAC** Admin/Vendedor con 403 en rutas no autorizadas
- **Validación Zod** en todos los inputs del backend
- **Responsive** mobile-first (360px+), sidebar colapsable

---

## 📄 Documentación relacionada

- `ERS_LibreriaMachy_v1.0.pdf` — Especificación de Requerimientos (IEEE 1016-2009)
- `render.yaml` — Configuración de despliegue para Render
- `.env.example` — Variables de entorno requeridas
