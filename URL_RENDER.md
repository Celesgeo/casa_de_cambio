# 🔗 URLs Correctas para Render.com

## ✅ URL Correcta del Repositorio

Render necesita la URL completa con `.git` al final:

```
https://github.com/Celesgeo/casa_de_cambio.git
```

**NO uses:**
- ❌ `https://github.com/Celesgeo/casa_de_cambio` (sin .git)
- ❌ `github.com/Celesgeo/casa_de_cambio.git` (sin https://)
- ❌ `Celesgeo/casa_de_cambio` (formato corto)

## 🔧 Pasos en Render.com

### Opción 1: Conectar GitHub Primero (Recomendado)

1. **Antes de crear el servicio**, ve a:
   - Render Dashboard → **Settings** (arriba derecha)
   - Click en **"Connected Accounts"** o **"Integrations"**
   - Busca **"GitHub"**
   - Si NO está conectado: Click **"Connect GitHub"**
   - Autoriza Render.com para acceder a tus repositorios

2. **Después de conectar GitHub:**
   - Vuelve a **"New +"** → **"Web Service"**
   - Ahora deberías ver una lista de tus repositorios
   - Busca `casa_de_cambio` en la lista
   - Selecciónalo

### Opción 2: Usar URL Manual (Si está disponible)

Si Render tiene la opción **"Public Git Repository"** o **"Connect by URL"**:

1. En el campo **"Repository URL"**, ingresa:
   ```
   https://github.com/Celesgeo/casa_de_cambio.git
   ```

2. **Branch**: `main`

3. Click **"Connect"** o **"Continue"**

## ⚠️ Si dice "URL no válida"

### Verifica:

1. **Que el repositorio sea público:**
   - Ve a: https://github.com/Celesgeo/casa_de_cambio
   - Debe ser accesible sin login
   - Si pide login, cámbialo a público en Settings → Change visibility

2. **Que GitHub esté conectado:**
   - Render necesita acceso a GitHub para verificar la URL
   - Ve a Settings → Connected Accounts → GitHub debe estar conectado

3. **Formato de la URL:**
   - Debe empezar con `https://`
   - Debe terminar con `.git`
   - Sin espacios al inicio o final

## 🔄 Alternativa: Blueprint (render.yaml)

Si Render soporta Blueprints:

1. Render Dashboard → **"New +"** → **"Blueprint"**
2. Selecciona tu repositorio `casa_de_cambio`
3. Render leerá automáticamente el archivo `render.yaml`
4. Configurará ambos servicios (backend y frontend) automáticamente

## 📝 URLs Completas para Copiar

**Backend:**
```
https://github.com/Celesgeo/casa_de_cambio.git
Branch: main
Root Directory: backend
```

**Frontend:**
```
https://github.com/Celesgeo/casa_de_cambio.git
Branch: main
Root Directory: frontend-web
```
