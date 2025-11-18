# 🔧 Cómo Acceder a la Pantalla de Consentimiento

## 🎯 Estás en: "Descripción general de OAuth"

Desde donde estás ahora, hay varias formas de acceder a la pantalla de consentimiento:

## ✅ Método 1: Desde el Menú Lateral (Más Confiable)

1. **En la página donde estás** ("Descripción general de OAuth")
2. **Busca en el menú lateral izquierdo:**
   - Busca la sección **"APIs y servicios"**
   - Haz clic en **"Pantalla de consentimiento de OAuth"**
   - (Debería estar justo debajo de "Credenciales")

## ✅ Método 2: URL Directa de Edición

Copia y pega esta URL en tu navegador:

```
https://console.cloud.google.com/apis/credentials/consent/edit?project=mimedicina-ebec7
```

**Nota:** Esta URL te lleva directamente a la página de **edición** de la pantalla de consentimiento.

## ✅ Método 3: Desde Credenciales

1. Ve a: https://console.cloud.google.com/apis/credentials?project=mimedicina-ebec7
2. En la parte superior de la página, busca un banner o enlace que diga:
   - **"Configurar pantalla de consentimiento"**
   - O **"Pantalla de consentimiento de OAuth"**
3. Haz clic en ese enlace

## ✅ Método 4: Buscar en la Barra de Búsqueda

1. En la parte superior de Google Cloud Console, hay una **barra de búsqueda**
2. Escribe: `consent screen` o `pantalla de consentimiento`
3. Selecciona la opción que aparezca

## ✅ Método 5: Desde el Selector de Proyecto

1. Asegúrate de que el proyecto seleccionado sea **"MiMedicina"** (ID: `mimedicina-ebec7`)
2. Si no lo está, haz clic en el selector de proyectos (arriba) y selecciona **"MiMedicina"**
3. Luego intenta cualquiera de los métodos anteriores

## 🔍 Si Ninguno Funciona

### Verificar Permisos
1. Asegúrate de tener el rol de **"Propietario"** o **"Editor"** en el proyecto
2. Si no tienes permisos, necesitarás que alguien con permisos te los otorgue

### Limpiar Caché
1. Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac) para recargar sin caché
2. O prueba en una **ventana de incógnito**

### Verificar Estado del Proyecto
1. Ve a: https://console.cloud.google.com/home/dashboard?project=mimedicina-ebec7
2. Verifica que el proyecto esté activo

## 📋 URLs Útiles

- **Pantalla de consentimiento (ver):** https://console.cloud.google.com/apis/credentials/consent?project=mimedicina-ebec7
- **Pantalla de consentimiento (editar):** https://console.cloud.google.com/apis/credentials/consent/edit?project=mimedicina-ebec7
- **Credenciales:** https://console.cloud.google.com/apis/credentials?project=mimedicina-ebec7
- **Descripción general OAuth:** https://console.cloud.google.com/apis/credentials/oauthclient?project=mimedicina-ebec7

## ⚠️ Nota sobre las Advertencias

Las advertencias que ves en "Descripción general de OAuth" son **normales** para apps en modo de prueba:
- ⚠️ "Usa flujos seguros" - No es crítico para desarrollo
- ⚠️ "Verificación de la cuenta de facturación" - No es necesario para modo de prueba

**Estas advertencias NO deberían impedirte configurar la pantalla de consentimiento.**

## 🎯 Próximo Paso

Una vez que accedas a la pantalla de consentimiento, necesitarás:

1. **Si es la primera vez:**
   - Seleccionar "Externo" como tipo de usuario
   - Completar la información básica
   - Agregar el scope: `https://www.googleapis.com/auth/calendar.events`
   - Agregar usuario de prueba: `lucianob77@gmail.com`

2. **Si ya está configurada:**
   - Haz clic en "EDITAR APP"
   - Verifica que tenga el scope `calendar.events`
   - Verifica que tenga el usuario de prueba `lucianob77@gmail.com`

---

**¿Qué método funcionó para ti?** Si ninguno funciona, describe exactamente qué ves cuando intentas acceder.

