# Subir a GitHub y conectar hosting

## Paso 1: Inicializar Git (si no está inicializado)

```bash
cd /Users/orellanoceleste/Downloads/CASADECAMBIO-APP
git init
```

## Paso 2: Crear .gitignore (si no existe)

Asegurá que `.gitignore` incluya:
- `node_modules/`
- `.env` (secretos)
- `dist/` (build)
- `.DS_Store`

## Paso 3: Conectar al repositorio remoto

```bash
git remote add origin https://github.com/Celesgeo/casa_de_cambio.git
```

Si ya tenés un `origin`, actualizalo:
```bash
git remote set-url origin https://github.com/Celesgeo/casa_de_cambio.git
```

## Paso 4: Agregar, commitear y subir

```bash
git add .
git commit -m "Grupo Alvarez - Casa de cambio: frontend, backend, mobile"
git branch -M main
git push -u origin main
```

## Nota sobre el repo

El repositorio [https://github.com/Celesgeo/casa_de_cambio](https://github.com/Celesgeo/casa_de_cambio) está vacío. Al hacer push, se subirá todo el proyecto (backend, frontend-web, grupo-alvarez-mobile).

## Hosting

Para conectar el hosting (Vercel, Netlify, etc.):
- **Frontend web**: Configurar el directorio raíz como `frontend-web` y build command `npm run build`
- **Backend**: Desplegar en Railway, Render, o similar con Node.js
