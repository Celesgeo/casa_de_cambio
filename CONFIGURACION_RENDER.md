# Configuración Render - Casa de Cambio

## Backend (casa-de-cambio-backend o grupo-alvarez-backend)

### Variables de entorno

| Variable      | Valor                                |
|---------------|--------------------------------------|
| MONGODB_URI   | `mongodb+srv://user:pass@cluster...` |
| JWT_SECRET    | `Alvarez2026` (o el mismo valor en backend y Render) |
| CORS_ORIGINS  | `*`                                  |
| REQUIRE_AUTH  | `true`                               |

### URL del backend

Tras el deploy: `https://TU-SERVICIO.onrender.com`  
API base: `https://TU-SERVICIO.onrender.com/api`

---

## Frontend (Static Site)

### Root Directory

`frontend-web`

### Build

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Variable de entorno

| Variable             | Valor                                                |
|----------------------|------------------------------------------------------|
| VITE_API_BASE_URL    | `https://TU-BACKEND.onrender.com/api`                |

Ejemplo: `https://casa-de-cambio-backend.onrender.com/api`

**Importante:** Debe coincidir con la URL real del backend. Después de agregar o cambiar esta variable, hacer **deploy** para que el build use el valor nuevo.

---

## Credenciales

- **Usuario:** grupoalvarez
- **Contraseña:** elterribleusd1

---

## URLs

- **App web:** `https://TU-FRONTEND.onrender.com` o `https://TU-FRONTEND.onrender.com/#/`
- **Backend health:** `https://TU-BACKEND.onrender.com/api/health`

---

## Si el servidor tarda

En plan gratuito el backend se duerme. Si el login falla:

1. Abrir en otra pestaña: `https://TU-BACKEND.onrender.com/api/health`
2. Esperar ~1 minuto a que cargue
3. Volver a la app y reintentar login
