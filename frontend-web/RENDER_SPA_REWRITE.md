# Evitar 404 en /login (Static Site en Render)

Si al entrar a `https://tu-sitio.onrender.com/login` ves 404 o "Failed to load resource: 404", hay que configurar una **rewrite** en Render para que sea una SPA.

## Pasos en Render

1. Entrá al **Static Site** del frontend en [dashboard.render.com](https://dashboard.render.com)
2. Abrí la pestaña **Redirects/Rewrites**
3. **Add Rule**
4. Completar:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** **Rewrite**
5. Guardar

Con eso, cualquier ruta (`/`, `/login`, `/operations`, etc.) sirve `index.html` y React Router puede manejar la ruta en el cliente.
