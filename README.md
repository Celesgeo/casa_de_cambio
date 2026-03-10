# Exchange Manager

Sistema SaaS multi-tenant para casas de cambio. Gestiona operaciones de compra/venta de divisas, patrimonio, cotizaciones y reportes por compañía.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React, Vite, Material UI

## Cómo ejecutar

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env y configurar MONGODB_URI
npm install
npm run dev
```

El servidor corre en `http://localhost:4000`. La API está en `http://localhost:4000/api`.

### Frontend

```bash
cd frontend-web
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Variables de entorno

### Backend (`.env`)

| Variable      | Descripción                                             |
|---------------|---------------------------------------------------------|
| `MONGODB_URI` | Cadena de conexión a MongoDB (Atlas o local)            |
| `PORT`        | Puerto del servidor (default: 4000)                     |
| `JWT_SECRET`  | Secreto para firmar JWT (default: Alvarez2026)          |

### Frontend

| Variable            | Descripción                                      |
|---------------------|--------------------------------------------------|
| `VITE_API_BASE_URL` | URL base de la API (ej: `http://localhost:4000/api`) |

## Migración de datos existentes

Para vincular datos existentes (users, operations, patrimonies) a la compañía GRUPO ALVAREZ, ejecutá manualmente:

```bash
cd backend
node scripts/migrateToGrupoAlvarez.js
```

Este script no se ejecuta al iniciar el servidor. Solo actualiza documentos sin `companyId`. No modifica contraseñas ni datos existentes.

## Credenciales de demo

Si no existe ninguna compañía en la base de datos, el sistema crea automáticamente:

- **Compañía**: Demo Exchange (plan: demo)
- **Usuario**: 
  - Email: `demo@exchange.com`
  - Contraseña: `demo123`
  - Rol: admin

## Funcionalidades

- **Auth**: Login JWT, bcrypt, roles (admin, manager, teller)
- **Operaciones**: Compra/venta de divisas con actualización de patrimonio
- **Patrimonio**: Balance por moneda (USD, ARS, EUR, BRL, CLP)
- **Cotizaciones**: Dólar Blue desde El Cronista, DolarHoy, DolarAPI, FinanzasArgy
- **Cierre de caja**: Cálculo de balance esperado vs real
- **Reportes**: Balance diario y exportación a Excel
- **Cotización WhatsApp**: Generar imagen para compartir
- **Empleados** (admin): Crear usuarios y activar/desactivar
- **Multi-tenant**: Datos aislados por compañía

## Seguridad

- Helmet
- Rate limiting en login (20 intentos / 15 min)
- Manejo centralizado de errores
