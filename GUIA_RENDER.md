# 🚀 Guía Completa: Deploy en Render.com

## Paso 1: Subir cambios a GitHub

### 1.1 Verificar cambios pendientes

```bash
cd /Users/orellanoceleste/Downloads/CASADECAMBIO-APP
git status
```

### 1.2 Agregar todos los archivos nuevos y modificados

```bash
# Agregar todos los cambios
git add .

# O agregar específicamente:
git add .gitignore
git add render.yaml
git add DEPLOY.md
git add backend/.env.production.example
git add backend/scripts/checkUser.js
git add frontend-web/.env.production.example
git add backend/package.json
git add backend/src/
git add frontend-web/src/
git add frontend-web/vite.config.ts
```

### 1.3 Hacer commit

```bash
git commit -m "Configuración para Render.com: backend, frontend y documentación"
```

### 1.4 Subir a GitHub

```bash
git push origin main
```

---

## Paso 2: Crear cuenta en Render.com

1. Ve a [https://render.com](https://render.com)
2. Click en **"Get Started for Free"**
3. Elige **"Sign up with GitHub"** (recomendado)
4. Autoriza Render.com para acceder a tus repositorios
5. Confirma tu email

---

## Paso 3: Deploy del Backend

### 3.1 Crear Web Service

1. En Render Dashboard, click en **"New +"** (arriba a la derecha)
2. Selecciona **"Web Service"**

### 3.2 Conectar repositorio

1. Si es la primera vez, conecta tu cuenta de GitHub
2. Busca tu repositorio: `casa_de_cambio` (o el nombre que tenga)
3. Click en **"Connect"**

### 3.3 Configurar el servicio

Completa los siguientes campos:

- **Name**: `grupo-alvarez-backend`
- **Environment**: `Node`
- **Region**: Elige el más cercano (ej: `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend` (IMPORTANTE: solo el backend)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (o el que prefieras)

### 3.4 Variables de Entorno

Click en **"Advanced"** → **"Add Environment Variable"** y agrega:

```
NODE_ENV = production
```

```
PORT = 10000
```

```
MONGODB_URI = mongodb+srv://celesteorellano14_db_user:grupoalvarez2026@exchange1.kdarpoj.mongodb.net/?appName=exchange1
```
*(Usa tu connection string real de MongoDB)*

```
JWT_SECRET = super_secret_jwt_key_change_me
```
*(Cambia por uno más seguro en producción)*

```
CORS_ORIGINS = *
```

```
REQUIRE_AUTH = true
```

### 3.5 Crear el servicio

1. Click en **"Create Web Service"**
2. Espera a que termine el build (puede tardar 3-5 minutos)
3. Cuando termine, verás la URL del backend (ej: `https://grupo-alvarez-backend.onrender.com`)
4. **COPIA ESTA URL** - la necesitarás para el frontend

### 3.6 Verificar que funciona

Abre en tu navegador:
```
https://grupo-alvarez-backend.onrender.com/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "service": "GRUPO ALVAREZ EXCHANGE SYSTEM",
  "timestamp": "..."
}
```

---

## Paso 4: Crear usuario inicial (Seed)

### Opción A: Desde tu máquina local

```bash
cd backend
npm run seed
```

### Opción B: Desde Render Shell

1. En Render Dashboard, ve a tu servicio `grupo-alvarez-backend`
2. Click en **"Shell"** (en el menú lateral)
3. Ejecuta:
```bash
cd backend
npm run seed
```

Esto creará el usuario:
- **Email**: `grupoalvarez`
- **Password**: `elterribleusd1`

---

## Paso 5: Deploy del Frontend

### 5.1 Crear Static Site

1. En Render Dashboard, click en **"New +"**
2. Selecciona **"Static Site"**

### 5.2 Conectar repositorio

1. Selecciona el mismo repositorio (`casa_de_cambio`)
2. Click en **"Connect"**

### 5.3 Configurar el servicio

- **Name**: `grupo-alvarez-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend-web` (IMPORTANTE)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Plan**: `Free`

### 5.4 Variables de Entorno

Click en **"Environment"** y agrega:

```
VITE_API_BASE_URL = https://grupo-alvarez-backend.onrender.com/api
```
*(Reemplaza con la URL REAL de tu backend del Paso 3.5)*

### 5.5 Crear el servicio

1. Click en **"Create Static Site"**
2. Espera a que termine el build (puede tardar 3-5 minutos)
3. Cuando termine, verás la URL del frontend (ej: `https://grupo-alvarez-frontend.onrender.com`)

### 5.6 Verificar que funciona

1. Abre la URL del frontend en tu navegador
2. Deberías ver la pantalla de login
3. Prueba iniciar sesión con:
   - Usuario: `grupoalvarez`
   - Contraseña: `elterribleusd1`

---

## Paso 6: Actualizar App Móvil (Opcional)

Si querés que la app móvil use el backend en producción:

1. Edita `grupo-alvarez-mobile/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://grupo-alvarez-backend.onrender.com/api
```
*(Reemplaza con la URL REAL de tu backend)*

2. Reinicia Expo:
```bash
cd grupo-alvarez-mobile
npx expo start --clear
```

---

## Resumen de URLs

Después del deploy, tendrás:

- **Backend API**: `https://grupo-alvarez-backend.onrender.com/api`
- **Frontend Web**: `https://grupo-alvarez-frontend.onrender.com`
- **Health Check**: `https://grupo-alvarez-backend.onrender.com/api/health`

---

## Troubleshooting

### ❌ Backend no inicia

- Verifica que `PORT=10000` esté configurado
- Revisa los logs en Render Dashboard → "Logs"
- Verifica que MongoDB esté accesible (IP whitelist en MongoDB Atlas)

### ❌ Frontend no conecta al backend

- Verifica que `VITE_API_BASE_URL` tenga la URL correcta del backend
- Asegúrate de incluir `/api` al final
- Revisa la consola del navegador (F12) para errores

### ❌ Error 401 (No autorizado)

- Verifica que ejecutaste el seed: `npm run seed`
- Verifica que `REQUIRE_AUTH=true` en el backend
- Verifica que `JWT_SECRET` esté configurado

### ❌ Error CORS

- Verifica que `CORS_ORIGINS=*` en el backend
- Revisa los logs del backend en Render

### ⏰ Servicio "dormido" (Free Plan)

- Los servicios gratuitos se duermen después de 15 minutos de inactividad
- La primera petición puede tardar ~30 segundos en "despertar"
- Esto es normal en el plan gratuito

---

## Próximos pasos

1. ✅ Subir cambios a GitHub
2. ✅ Crear cuenta en Render.com
3. ✅ Deploy del Backend
4. ✅ Crear usuario con seed
5. ✅ Deploy del Frontend
6. ✅ Probar login y funcionalidades

¡Listo! Tu app estará en producción 🎉
