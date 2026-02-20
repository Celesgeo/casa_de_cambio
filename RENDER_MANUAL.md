# 🚀 Configuración Manual en Render.com (Si el repositorio no aparece)

Si Render no encuentra tu repositorio automáticamente, puedes configurarlo manualmente.

## 📋 Información del Repositorio

- **URL**: `https://github.com/Celesgeo/casa_de_cambio.git`
- **Branch**: `main`
- **Es público**: ✅ Sí

---

## 🔧 Backend - Configuración Manual

### Paso 1: Crear Web Service

1. Render Dashboard → **"New +"** → **"Web Service"**
2. Si ves opción **"Public Git Repository"** o **"Connect by URL"**, úsala
3. Si no, busca en la lista y si no aparece, sigue estos pasos:

### Paso 2: Configuración

**Si puedes ingresar URL manualmente:**

```
Repository URL: https://github.com/Celesgeo/casa_de_cambio.git
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

**Si solo puedes seleccionar de lista:**

1. Ve a **Settings** → **Connected Accounts**
2. **Disconnect** y **Reconnect** GitHub
3. Espera 1-2 minutos
4. Vuelve a **"New +"** → **"Web Service"**
5. Busca `casa_de_cambio` o `Celesgeo`

### Paso 3: Variables de Entorno

Después de crear el servicio, agrega estas variables:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://celesteorellano14_db_user:grupoalvarez2026@exchange1.kdarpoj.mongodb.net/?appName=exchange1
JWT_SECRET = super_secret_jwt_key_change_me
CORS_ORIGINS = *
REQUIRE_AUTH = true
```

---

## 🌐 Frontend - Configuración Manual

### Paso 1: Crear Static Site

1. Render Dashboard → **"New +"** → **"Static Site"**
2. Busca `casa_de_cambio` o usa URL manual si está disponible

### Paso 2: Configuración

```
Repository URL: https://github.com/Celesgeo/casa_de_cambio.git
Branch: main
Root Directory: frontend-web
Build Command: npm install && npm run build
Publish Directory: dist
```

### Paso 3: Variable de Entorno

Después de crear el backend, agrega:

```
VITE_API_BASE_URL = https://tu-backend-url.onrender.com/api
```

*(Reemplaza con la URL real del backend)*

---

## 🔄 Reconectar GitHub (Paso a Paso)

1. **Render Dashboard** → Click en tu **nombre/avatar** (arriba derecha)
2. Click en **"Account Settings"** o **"Settings"**
3. Ve a **"Connected Accounts"** o **"Integrations"**
4. Busca **"GitHub"**
5. Si está conectado:
   - Click en **"Disconnect"**
   - Espera 5 segundos
   - Click en **"Connect GitHub"**
   - Autoriza nuevamente
6. Si NO está conectado:
   - Click en **"Connect GitHub"**
   - Autoriza Render.com
   - Asegúrate de dar permisos a repositorios públicos

7. **Espera 1-2 minutos** para que Render sincronice
8. Vuelve a **"New +"** → **"Web Service"**
9. Busca `casa_de_cambio`

---

## ✅ Verificación Rápida

**¿El repositorio es público?**
- Ve a: https://github.com/Celesgeo/casa_de_cambio
- Si puedes verlo sin login → ✅ Es público
- Si pide login → ❌ Es privado (cámbialo a público)

**¿GitHub está conectado en Render?**
- Render Dashboard → Settings → Connected Accounts
- Debe aparecer GitHub con estado "Connected"

**¿Render tiene permisos?**
- GitHub → Settings → Applications → Render
- Debe tener acceso a repositorios públicos

---

## 🆘 Último Recurso

Si después de todo esto no aparece:

1. **Espera 5-10 minutos** (a veces Render tarda en sincronizar)
2. **Cierra sesión y vuelve a entrar** en Render
3. **Intenta desde otro navegador** (Chrome, Firefox, Safari)
4. **Contacta soporte**: support@render.com
