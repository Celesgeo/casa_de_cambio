# Frontend y App Móvil con Backend en Render

**Backend ya desplegado:** https://casa-de-cambio-1.onrender.com  
**URL de la API:** https://casa-de-cambio-1.onrender.com/api

---

## 1. Agregar el Frontend en Render (Static Site)

### Pasos en Render.com

1. **Dashboard** → **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio: **casa_de_cambio**
3. Configuración:

| Campo | Valor |
|-------|--------|
| **Name** | `casa-de-cambio-frontend` (o el que prefieras) |
| **Branch** | `main` |
| **Root Directory** | `frontend-web` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Instance Type** | Free |

4. **Variables de entorno** (Add Environment Variable):

| KEY | VALUE |
|-----|--------|
| `VITE_API_BASE_URL` | `https://casa-de-cambio-1.onrender.com/api` |

5. **Deploy** → Create Static Site
6. Espera el build. La URL del frontend será algo como:  
   `https://casa-de-cambio-frontend.onrender.com` (o el nombre que hayas puesto)

### Regla SPA (evitar 404 en /login y otras rutas)

Para que las rutas como `/login` no devuelvan 404, en Render hay que agregar una **rewrite**:

1. En el **Static Site** → pestaña **Redirects/Rewrites**
2. **Add Rule**
3. **Source:** `/*`
4. **Destination:** `/index.html`
5. **Action:** **Rewrite** (no Redirect)
6. Guardar

Así todas las rutas sirven `index.html` y React Router funciona bien.

### Verificar

- Abre la URL del frontend
- Deberías ver el login
- Usuario: `grupoalvarez` / Contraseña: `elterribleusd1`

---

## 2. Configurar la App Móvil para Producción

Para que la app móvil use el backend en Render (desde cualquier red):

### Opción A: Archivo .env (recomendado)

Edita `grupo-alvarez-mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://casa-de-cambio-1.onrender.com/api
```

### Opción B: app.config.js

Si prefieres no usar .env, en `grupo-alvarez-mobile/app.config.js` en `extra`:

```js
apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://casa-de-cambio-1.onrender.com/api',
```

### Reiniciar la app

```bash
cd grupo-alvarez-mobile
npx expo start --clear
```

Después de esto, la app móvil usará el backend en Render y funcionará desde cualquier WiFi o datos móviles (ya no necesitas estar en la misma red que tu computadora).

---

## Resumen de URLs

| Servicio | URL |
|----------|-----|
| **Backend API** | https://casa-de-cambio-1.onrender.com/api |
| **Health check** | https://casa-de-cambio-1.onrender.com/api/health |
| **Frontend** (después del deploy) | https://casa-de-cambio-frontend.onrender.com (o la que te asigne Render) |
| **App móvil** | Misma app, apuntando al backend de Render vía .env |

---

## Nota sobre el plan Free

- El backend se “duerme” tras ~15 min sin uso.
- La primera petición después de eso puede tardar 30–50 segundos.
- Es normal en el plan gratuito.
