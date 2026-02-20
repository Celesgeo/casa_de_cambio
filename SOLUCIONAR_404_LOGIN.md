# Solucionar 404 en /login (Render Static Site)

## Solución inmediata (sin tocar Render)

**Entrá siempre por la página principal**, no por `/login`:

- **https://casa-de-cambio-2.onrender.com/**

Desde ahí, si no estás logueado, la app te lleva a `#/login` sola. Así nunca se pide `/login` al servidor y no hay 404. En la pantalla de login hay un enlace a la página principal por si ves el error.

---

## El problema

Cuando entrás a `https://tu-sitio.onrender.com/login`, Render devuelve **404** porque busca un archivo físico `/login` que no existe. En una SPA (Single Page Application), todas las rutas deben servir `index.html` para que React Router funcione.

## Solución: Configurar Rewrite en Render Dashboard

Render **requiere** configurar esto manualmente en el dashboard. No hay archivo de configuración que lo haga automáticamente.

### Pasos exactos:

1. **Entrá a [dashboard.render.com](https://dashboard.render.com)**

2. **Buscá tu Static Site** (ej: `casa-de-cambio-2` o `grupo-alvarez-frontend`)

3. **Click en el servicio** para abrirlo

4. **Pestaña "Redirects/Rewrites"** (en el menú lateral izquierdo)

5. **Click en "Add Rule"** o "Add Redirect/Rewrite"

6. **Completar el formulario:**

   ```
   Source Path:     /*
   Destination Path: /index.html
   Action:          Rewrite
   ```

   ⚠️ **IMPORTANTE:** Usá **Rewrite** (no Redirect). Redirect cambia la URL en el navegador; Rewrite sirve `index.html` sin cambiar la URL.

7. **Click en "Save"** o "Add Rule"

8. **Esperá unos segundos** - Render aplica los cambios automáticamente

9. **Probá:** Entrá a `https://tu-sitio.onrender.com/login` - debería funcionar

---

## Verificación

Después de agregar la rewrite:

- ✅ `https://tu-sitio.onrender.com/` → funciona
- ✅ `https://tu-sitio.onrender.com/login` → funciona (antes daba 404)
- ✅ `https://tu-sitio.onrender.com/operations` → funciona
- ✅ `https://tu-sitio.onrender.com/cualquier-ruta` → funciona

---

## Si sigue sin funcionar

1. **Verificá que la rewrite esté guardada** en el dashboard
2. **Esperá 1-2 minutos** - a veces Render tarda en aplicar cambios
3. **Limpiá caché del navegador** (Ctrl+Shift+R o Cmd+Shift+R)
4. **Verificá que el Static Site esté en "Live"** (no "Paused")

---

## Nota técnica

Render Static Sites no soporta archivos de configuración como `_redirects` o `vercel.json`. La única forma es configurarlo en el dashboard. El archivo `public/_redirects` que agregamos al proyecto es por si Render lo reconoce en el futuro, pero actualmente **no funciona automáticamente**.
