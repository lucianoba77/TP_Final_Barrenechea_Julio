# 🔧 Crear Cliente OAuth en el Proyecto Correcto

## ✅ Proyecto Correcto Seleccionado

Ahora que tienes seleccionado **"MiMedicina"** (ID: `mimedicina-ebec7`), vamos a crear el cliente OAuth aquí.

## 📋 Pasos para Crear el Cliente OAuth

### Paso 1: Ir a Credenciales OAuth
1. **URL directa:** https://console.cloud.google.com/apis/credentials?project=mimedicina-ebec7
2. O navega manualmente:
   - Asegúrate de que el proyecto seleccionado sea **"MiMedicina"** (ID: `mimedicina-ebec7`)
   - Ve a: **APIs y servicios** → **Credenciales**

### Paso 2: Crear Credencial OAuth
1. Haz clic en **"+ CREAR CREDENCIALES"** (botón azul en la parte superior)
2. Selecciona **"ID de cliente de OAuth"**

### Paso 3: Configurar el Tipo de Aplicación
1. **Tipo de aplicación:** Selecciona **"Aplicación web"**
2. Haz clic en **"Crear"**

### Paso 4: Configurar el Cliente OAuth

#### Nombre del Cliente (Opcional)
- Puedes dejarlo en blanco o poner: `MiMedicina Web Client`

#### Orígenes de JavaScript autorizados
Agrega estos dos orígenes (uno por línea):
```
http://localhost:3000
https://mimedicina-ebec7.firebaseapp.com
```

#### URI de redireccionamiento autorizados
Agrega estos tres URIs (uno por línea):
```
http://localhost:3000/auth/google/callback
https://mimedicina-ebec7.firebaseapp.com/__/auth/handler
https://mimedicina-ebec7.firebaseapp.com/auth/google/callback
```

### Paso 5: Crear y Copiar Credenciales
1. Haz clic en **"Crear"**
2. Se mostrará un modal con las credenciales
3. **IMPORTANTE:** Copia el **Client ID** (lo necesitaremos)
4. Haz clic en **"DESCARGAR JSON"** para descargar el `client_secret.json`
5. Haz clic en **"Aceptar"**

## 📝 Información que Necesitarás

Después de crear el cliente, necesitarás:
- ✅ **Client ID:** (algo como `XXXXX-XXXXX.apps.googleusercontent.com`)
- ✅ **Archivo JSON descargado:** `client_secret_XXXXX.json`

## ⚠️ IMPORTANTE

1. **NO cierres el modal** hasta haber copiado el Client ID y descargado el JSON
2. **Guarda el archivo JSON** en la raíz del proyecto
3. **NO subas el JSON a Git** (ya está en `.gitignore`)

## 🎯 Siguiente Paso

Una vez que tengas el Client ID y el archivo JSON, avísame y:
1. Actualizaré el `.env` con el nuevo Client ID
2. Verificaremos que el archivo JSON esté en el lugar correcto
3. Te guiaré para configurar la pantalla de consentimiento

---

**¿Ya creaste el cliente OAuth?** Envíame el Client ID y confirma que descargaste el JSON.

