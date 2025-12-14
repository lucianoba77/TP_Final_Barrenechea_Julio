# 🚀 Instrucciones para Continuar el Desarrollo

Este documento contiene todas las instrucciones necesarias para continuar desarrollando MiMedicina en otro computador.

---

## 📋 Pasos Iniciales

### 1. Clonar el Repositorio

```bash
git clone https://github.com/[TU_USUARIO]/TP_Final_Barrenechea_Julio.git
cd TP_Final_Barrenechea_Julio
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y configura tus credenciales:
   - **Firebase**: Obtén las credenciales desde [Firebase Console](https://console.firebase.google.com/)
   - **Google Calendar** (opcional): Configura `REACT_APP_GOOGLE_CLIENT_ID` siguiendo las instrucciones en `.env.example`

### 4. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita **Authentication**:
   - Métodos: Email/Password y Google
4. Crea una base de datos **Firestore**:
   - Modo: Prueba (para desarrollo)
5. Configura las **Reglas de Seguridad** (ver sección más abajo)
6. Obtén las credenciales de configuración:
   - Configuración del proyecto → Tus aplicaciones → Web
   - Copia las credenciales al archivo `.env`

### 5. Configurar Firestore Rules

Ve a Firebase Console → Firestore Database → Reglas y pega las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function esAsistente() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)) && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'asistente';
    }
    
    function pacienteIdDelAsistente() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.pacienteId;
    }

    // Reglas para usuarios
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if esAsistente() && pacienteIdDelAsistente() == userId;
    }

    // Reglas para medicamentos
    match /medicamentos/{medicamentoId} {
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
      allow read: if esAsistente() && 
                     pacienteIdDelAsistente() == resource.data.userId;
      allow list: if request.auth != null &&
                     request.query.limit <= 100 &&
                     (resource.data.userId == request.auth.uid ||
                      (esAsistente() && pacienteIdDelAsistente() == resource.data.userId));
    }

    // Reglas para asistentes
    match /asistentes/{asistenteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Reglas para googleTokens
    match /googleTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. (Opcional) Configurar Google Calendar

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Habilita **Google Calendar API**:
   - APIs & Services → Library → Buscar "Google Calendar API" → Enable
4. Crea credenciales OAuth 2.0:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Tipo: Web application
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - (Tu URL de producción si la tienes)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/google/callback`
     - (Tu URL de producción si la tienes)
5. Copia el **Client ID** y pégalo en `.env` como `REACT_APP_GOOGLE_CLIENT_ID`

### 7. Iniciar la Aplicación

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm start          # Inicia servidor de desarrollo
npm run build      # Genera build de producción
npm test           # Ejecuta tests
```

### Git
```bash
git status         # Ver estado de cambios
git add .          # Agregar todos los cambios
git commit -m "mensaje"  # Hacer commit
git push           # Subir cambios a GitHub
git pull           # Descargar cambios de GitHub
```

---

## 📁 Estructura del Proyecto

Consulta `RESUMEN_DESARROLLO.md` para una descripción completa de la arquitectura y estructura del proyecto.

---

## 🐛 Solución de Problemas Comunes

### Error: "Missing or insufficient permissions"
- **Causa:** Reglas de Firestore no configuradas correctamente
- **Solución:** Verifica las reglas de seguridad en Firebase Console

### Error: "The query requires an index"
- **Causa:** Query requiere índice compuesto
- **Solución:** Ya está resuelto en el código (ordenamiento manual), pero si aparece, crea el índice desde el enlace proporcionado

### Error: "Firebase not initialized"
- **Causa:** Variables de entorno no configuradas
- **Solución:** Verifica que el archivo `.env` existe y tiene todas las variables necesarias

### Google Calendar no se conecta
- **Causa:** Client ID no configurado o redirect URI incorrecto
- **Solución:** Verifica `REACT_APP_GOOGLE_CLIENT_ID` en `.env` y las URIs autorizadas en Google Cloud Console

---

## 📚 Documentación Adicional

- **README.md**: Documentación principal del proyecto
- **RESUMEN_DESARROLLO.md**: Resumen completo del desarrollo y estado actual
- **.env.example**: Plantilla de variables de entorno con instrucciones

---

## 🔐 Credenciales de Prueba

### Paciente
- **Email:** mimedicinaprueba@gmail.com
- **Password:** 123456@@
- También se puede loguear con Google

### Asistente
- **Email:** miasistente@mimedicina.com
- **Password:** 123456@@

---

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NUNCA** subas `node_modules/` (instalar con `npm install`)
- **NUNCA** subas la carpeta `build/` (generar con `npm run build`)

---

## 🎯 Estado Actual del Proyecto

- ✅ Funcional y listo para producción
- ✅ Build generado y optimizado
- ✅ Código limpio (sin logs de debug)
- ✅ Google Calendar integrado
- ✅ Sistema de asistentes funcionando
- ✅ Cálculo de adherencia corregido

**Última actualización:** Diciembre 2024  
**Último cambio:** Eliminación del resumen semanal del historial

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa `RESUMEN_DESARROLLO.md` para contexto completo
2. Verifica la configuración de Firebase y variables de entorno
3. Revisa la consola del navegador para errores específicos

---

**¡Listo para continuar desarrollando! 🚀**

