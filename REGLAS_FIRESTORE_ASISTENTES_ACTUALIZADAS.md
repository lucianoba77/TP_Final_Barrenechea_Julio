# 🔒 Reglas de Firestore para Asistentes

## ⚠️ Problema

Cuando entras en Ajustes, aparece el error "missing or insufficient Permission" porque las reglas de Firestore no permiten leer la colección `asistentes`.

## ✅ Solución: Actualizar Reglas de Firestore

Ve a Firebase Console y actualiza las reglas de Firestore:

### URL Directa:
https://console.firebase.google.com/project/mimedicina-ebec7/firestore/rules

### Reglas Completas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para usuarios
    match /usuarios/{userId} {
      // Los usuarios pueden leer y escribir su propio documento
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Los asistentes pueden leer el documento de su paciente
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/asistentes/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/asistentes/$(request.auth.uid)).data.pacienteId == userId;
    }
    
    // Reglas para medicamentos
    match /medicamentos/{medicamentoId} {
      // Los pacientes pueden crear medicamentos para sí mismos
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      // Los pacientes pueden leer sus propios medicamentos
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      // Los pacientes pueden actualizar y eliminar sus propios medicamentos
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      // Los asistentes pueden leer los medicamentos de su paciente
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/asistentes/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/asistentes/$(request.auth.uid)).data.pacienteId == resource.data.userId;
    }
    
    // Reglas para asistentes
    match /asistentes/{asistenteId} {
      // Los pacientes pueden leer sus propios asistentes
      allow read: if request.auth != null && 
        resource.data.pacienteId == request.auth.uid;
      
      // Los pacientes pueden crear asistentes para sí mismos
      allow create: if request.auth != null && 
        request.resource.data.pacienteId == request.auth.uid;
      
      // Los pacientes pueden eliminar sus propios asistentes
      allow delete: if request.auth != null && 
        resource.data.pacienteId == request.auth.uid;
      
      // Los asistentes pueden leer su propio documento
      allow read: if request.auth != null && 
        request.auth.uid == asistenteId;
    }
    
    // Reglas para tokens de Google Calendar
    match /googleTokens/{userId} {
      // Los usuarios solo pueden leer y escribir su propio token
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para tomas de medicamentos
    match /tomas/{tomaId} {
      // Los usuarios pueden leer y escribir sus propias tomas
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      // Los asistentes pueden leer las tomas de su paciente
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/asistentes/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/asistentes/$(request.auth.uid)).data.pacienteId == resource.data.userId;
    }
  }
}
```

## 📋 Pasos para Aplicar las Reglas

1. **Ve a Firebase Console:**
   - URL: https://console.firebase.google.com/project/mimedicina-ebec7/firestore/rules

2. **Copia y pega las reglas** de arriba en el editor

3. **Haz clic en "Publicar"** (botón azul en la parte superior)

4. **Espera unos segundos** para que las reglas se propaguen

5. **Recarga la página de Ajustes** en tu aplicación

## ✅ Verificación

Después de aplicar las reglas, deberías poder:
- ✅ Ver la lista de asistentes en Ajustes
- ✅ Agregar nuevos asistentes
- ✅ Eliminar asistentes
- ✅ Ver la sincronización con Google Calendar sin errores
- ✅ **Agregar nuevos medicamentos** (corregido)
- ✅ Leer, actualizar y eliminar medicamentos

## 🔍 Si Sigue Fallando

1. **Verifica que estés autenticado:**
   - Asegúrate de estar logueado en la aplicación

2. **Verifica el proyecto:**
   - Asegúrate de que las reglas se aplicaron al proyecto correcto (`mimedicina-ebec7`)

3. **Revisa la consola del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Console"
   - Busca errores específicos de Firestore

4. **Espera unos minutos:**
   - A veces las reglas tardan unos minutos en propagarse completamente

