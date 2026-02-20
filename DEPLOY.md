# Guía de Deployment en Render.com

## Pasos para desplegar en Render.com

### 1. Preparación

1. Crear cuenta en [Render.com](https://render.com)
2. Conectar tu repositorio de GitHub (o GitLab/Bitbucket)

### 2. Deploy del Backend

1. En Render Dashboard, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `grupo-alvarez-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (o el que prefieras)

4. **Variables de Entorno** (en "Environment"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=tu_mongodb_connection_string
   JWT_SECRET=tu_jwt_secret_super_seguro
   CORS_ORIGINS=*
   REQUIRE_AUTH=true
   ```

5. Click **"Create Web Service"**
6. Espera a que el build termine y copia la URL del backend (ej: `https://grupo-alvarez-backend.onrender.com`)

### 3. Deploy del Frontend

1. En Render Dashboard, click en **"New +"** → **"Static Site"**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `grupo-alvarez-frontend`
   - **Build Command**: `cd frontend-web && npm install && npm run build`
   - **Publish Directory**: `frontend-web/dist`

4. **Variables de Entorno**:
   ```
   VITE_API_BASE_URL=https://grupo-alvarez-backend.onrender.com/api
   ```
   (Reemplaza con la URL real de tu backend)

5. Click **"Create Static Site"**
6. Espera a que el build termine

### 4. Configurar App Móvil

Actualiza `grupo-alvarez-mobile/.env` o `app.config.js` con la URL del backend en producción:

```env
EXPO_PUBLIC_API_BASE_URL=https://grupo-alvarez-backend.onrender.com/api
```

### 5. Seed del Usuario Inicial

Después del deploy del backend, ejecuta el seed para crear el usuario:

```bash
# Opción 1: Desde tu máquina local (conectado a la misma MongoDB)
cd backend
npm run seed

# Opción 2: Usar Render Shell (en Render Dashboard → Shell)
cd backend
npm run seed
```

### 6. Verificar

- Backend: `https://grupo-alvarez-backend.onrender.com/api/health`
- Frontend: `https://grupo-alvarez-frontend.onrender.com`
- Login con: `grupoalvarez` / `elterribleusd1`

## Notas Importantes

- **Free Plan**: Los servicios se "duermen" después de 15 minutos de inactividad. La primera petición puede tardar ~30 segundos en despertar.
- **MongoDB**: Usa MongoDB Atlas (gratis) o cualquier MongoDB compatible.
- **CORS**: El backend está configurado para aceptar todas las conexiones (`CORS_ORIGINS=*`).
- **HTTPS**: Render proporciona HTTPS automáticamente.

## Troubleshooting

### Backend no responde
- Verifica que `PORT=10000` (Render usa el puerto que proporciona en `PORT`)
- Revisa los logs en Render Dashboard
- Verifica que MongoDB esté accesible desde Render

### Frontend no conecta al backend
- Verifica que `VITE_API_BASE_URL` tenga la URL correcta del backend
- Asegúrate de incluir `/api` al final de la URL
- Revisa la consola del navegador para errores CORS

### App móvil no conecta
- Actualiza `.env` con la URL de producción
- Verifica que el backend acepte conexiones desde cualquier origen (`CORS_ORIGINS=*`)
