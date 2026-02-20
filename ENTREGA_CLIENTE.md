# Cómo entregar la app a tu cliente (Web + Móvil)

## URLs que debes darle a tu cliente

| Uso | URL |
|-----|-----|
| **App web (escritorio y celular)** | https://casa-de-cambio-2.onrender.com |
| **Solo por si te pide la API** | https://casa-de-cambio-1.onrender.com |

**Usuario de prueba:** `grupoalvarez`  
**Contraseña:** `elterribleusd1`

---

## 1. Acceso WEB (listo)

Tu cliente puede usar la app desde cualquier navegador:

- En la PC: que entre a **https://casa-de-cambio-2.onrender.com**
- En el celular: que abra esa misma URL en Chrome/Safari (la web es responsive)

No tiene que instalar nada. Puede guardar la página en la pantalla de inicio como “acceso directo” si quiere.

---

## 2. Acceso MÓVIL (app instalable)

Tienes dos formas de que tu cliente use la app en el celular:

### Opción A – Usar la web en el celular (más rápido)

Que entre desde el navegador del celular a:

**https://casa-de-cambio-2.onrender.com**

Es la misma app, adaptada a pantalla chica. No requiere instalar nada.

### Opción B – App instalable (Android .apk)

Si quieres entregar una app que se instale como cualquier aplicación:

1. Instala EAS CLI (una vez):
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión en Expo:
   ```bash
   cd grupo-alvarez-mobile
   eas login
   ```
3. Genera el APK para Android:
   ```bash
   eas build --platform android --profile preview
   ```
4. Cuando termine, EAS te dará un **enlace para descargar el .apk**. Ese enlace se lo pasas a tu cliente; lo abre en el celular Android y instala la app.

**Requisito:** La carpeta `grupo-alvarez-mobile` debe tener el archivo `eas.json` (ya está en el proyecto). El `.env` debe tener:
`EXPO_PUBLIC_API_BASE_URL=https://casa-de-cambio-1.onrender.com/api`

---

## Resumen para enviar al cliente

Puedes copiar y pegar algo así (ajusta el nombre del negocio si quieres):

---

**Acceso a la aplicación – Casa de Cambio**

- **En computadora o celular (navegador):**  
  https://casa-de-cambio-2.onrender.com  

- **Usuario:** grupoalvarez  
- **Contraseña:** (la que tú les indiques)

La primera vez que entren puede tardar unos segundos en cargar (servidor en plan gratuito).  
Si te envío además el enlace de la app para Android, podrás instalarla como una app más en el celular.

---
