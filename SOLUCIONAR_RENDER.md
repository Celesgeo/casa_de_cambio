# 🔧 Solución: Repositorio no aparece en Render.com

## ✅ Verificación

Tu repositorio existe y es público:
- ✅ URL: https://github.com/Celesgeo/casa_de_cambio
- ✅ Archivos actualizados: `render.yaml`, `.gitignore`, etc.
- ✅ Es público (accesible sin login)

## 🔍 Pasos para que Render lo encuentre

### Opción 1: Reconectar GitHub en Render

1. En Render Dashboard, ve a **Settings** (arriba a la derecha)
2. Click en **"Connected Accounts"** o **"GitHub"**
3. Si GitHub está conectado:
   - Click en **"Disconnect"** o **"Reconnect"**
   - Autoriza nuevamente el acceso
4. Si GitHub NO está conectado:
   - Click en **"Connect GitHub"**
   - Autoriza Render.com para acceder a tus repositorios
   - Asegúrate de dar permisos a repositorios públicos (y privados si quieres)

### Opción 2: Buscar manualmente

1. En Render Dashboard → **"New +"** → **"Web Service"**
2. En la sección **"Connect a repository"**:
   - Busca en el campo de búsqueda: `casa_de_cambio`
   - O busca: `Celesgeo`
   - Debería aparecer en la lista

### Opción 3: Usar URL directa del repositorio

Si Render tiene opción de ingresar URL manualmente:

1. Copia esta URL:
   ```
   https://github.com/Celesgeo/casa_de_cambio.git
   ```

2. En Render, busca opción **"Connect by URL"** o **"Public Git Repository"**
3. Pega la URL

### Opción 4: Verificar permisos de GitHub

1. Ve a GitHub: https://github.com/settings/applications
2. Busca **"Render"** en las aplicaciones autorizadas
3. Verifica que tenga permisos para:
   - ✅ Acceder a repositorios públicos
   - ✅ (Opcional) Acceder a repositorios privados

### Opción 5: Refrescar la lista en Render

1. En Render Dashboard → **"New +"** → **"Web Service"**
2. Si ves una lista de repositorios:
   - Click en el ícono de **refresh** o **reload** (si existe)
   - O cierra y vuelve a abrir la ventana
   - O espera unos minutos y vuelve a intentar

## 🔄 Alternativa: Crear servicio manualmente

Si Render sigue sin encontrar el repositorio, puedes crear el servicio manualmente:

### Para Backend:

1. **"New +"** → **"Web Service"**
2. Selecciona **"Public Git Repository"** (si está disponible)
3. Ingresa:
   - **Repository URL**: `https://github.com/Celesgeo/casa_de_cambio.git`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Para Frontend:

1. **"New +"** → **"Static Site"**
2. Selecciona **"Public Git Repository"**
3. Ingresa:
   - **Repository URL**: `https://github.com/Celesgeo/casa_de_cambio.git`
   - **Branch**: `main`
   - **Root Directory**: `frontend-web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

## 🆘 Si NADA funciona

### Verificar que el repositorio sea público:

1. Ve a: https://github.com/Celesgeo/casa_de_cambio/settings
2. Scroll hasta **"Danger Zone"**
3. Verifica que diga **"This repository is public"**
4. Si dice privado, click en **"Change visibility"** → **"Make public"**

### Contactar soporte de Render:

1. Ve a: https://render.com/docs
2. O escribe a: support@render.com
3. Menciona que el repositorio público no aparece en la lista

## ✅ Checklist

- [ ] GitHub está conectado en Render Settings
- [ ] Repositorio es público en GitHub
- [ ] Intentaste refrescar/reconectar GitHub en Render
- [ ] Buscaste manualmente `casa_de_cambio` en Render
- [ ] Intentaste usar URL directa del repositorio

## 📸 Screenshots útiles

Si necesitas ayuda adicional, toma screenshots de:
1. Render Dashboard → Settings → Connected Accounts
2. La pantalla donde buscas el repositorio
3. La configuración de visibilidad del repositorio en GitHub
