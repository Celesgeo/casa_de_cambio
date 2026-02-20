# 📤 Pasos para Subir a GitHub

## Comandos a ejecutar (en orden)

### 1. Ver qué archivos cambiaron
```bash
cd /Users/orellanoceleste/Downloads/CASADECAMBIO-APP
git status
```

### 2. Agregar todos los cambios
```bash
git add .
```

### 3. Hacer commit con mensaje descriptivo
```bash
git commit -m "Configuración completa para Render.com: backend, frontend, mobile y documentación"
```

### 4. Subir a GitHub
```bash
git push origin main
```

---

## Si hay algún error

### Error: "nothing to commit"
Significa que todos los cambios ya están commiteados. Solo necesitas hacer push:
```bash
git push origin main
```

### Error: "authentication failed"
Necesitas autenticarte con GitHub. Opciones:

**Opción 1: Personal Access Token**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Usa el token como contraseña cuando Git lo pida

**Opción 2: SSH Key**
```bash
# Generar SSH key (si no tienes una)
ssh-keygen -t ed25519 -C "tu_email@example.com"

# Agregar al ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub
# Copia esto y agrégalo en GitHub → Settings → SSH and GPG keys
```

### Error: "branch is behind"
Primero haz pull y luego push:
```bash
git pull origin main
git push origin main
```

---

## Verificar que se subió correctamente

1. Ve a tu repositorio en GitHub:
   https://github.com/Celesgeo/casa_de_cambio

2. Deberías ver:
   - ✅ `render.yaml`
   - ✅ `DEPLOY.md`
   - ✅ `GUIA_RENDER.md`
   - ✅ `backend/.env.production.example`
   - ✅ `frontend-web/.env.production.example`
   - ✅ Todos los cambios en los archivos modificados

---

## Después de subir a GitHub

Continúa con `GUIA_RENDER.md` para conectar a Render.com
