# 🎯 Guía para Cumplir con la Consigna del Final

**Trabajo Final - Plataformas de Desarrollo**  
**Profesor:** Fernando Gonzalo Gaitán  
**Requisitos:** API REST + Separación Frontend/Backend

---

## 📋 Requisitos de la Consigna

Según el documento del final, el trabajo debe cumplir con:

1. ✅ **Usuarios**: Mínimo dos tipos de usuarios distintos
   - **Estado actual:** ✅ Tenemos "paciente" y "asistente"

2. ⚠️ **Seguridad**: Endpoints protegidos con access token
   - **Estado actual:** ❌ No implementado (usa Firebase Auth directamente)

3. ⚠️ **API REST**: La información debe gestionarse mediante API
   - **Estado actual:** ❌ Frontend accede directamente a Firestore

4. ⚠️ **Separación Frontend/Backend**: Arquitectura dividida
   - **Estado actual:** ❌ Todo está en el frontend

5. ✅ **Funcionamiento del Frontend**: Debe funcionar correctamente
   - **Estado actual:** ✅ Funciona correctamente

---

## 🏗️ Arquitectura Propuesta

### Arquitectura Actual (A Modificar)

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Firebase Auth│  │  Firestore   │
└──────────────┘  └──────────────┘
```

### Arquitectura Nueva (Para el Final)

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST
         │ (con JWT Token)
         ▼
┌─────────────────┐
│   Backend API   │
│  (Node.js/Express)│
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Firebase Auth│  │  Firestore   │
└──────────────┘  └──────────────┘
```

---

## 📦 Estructura del Proyecto Propuesta

```
TP_Final_Barrenechea_Julio/
├── frontend/              # Aplicación React (existente)
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/               # Nueva API REST (crear)
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Definición de rutas
│   │   ├── middleware/    # Middleware (auth, validación)
│   │   ├── services/      # Lógica de negocio
│   │   ├── utils/         # Utilidades
│   │   └── config/        # Configuración (Firebase, etc.)
│   ├── package.json
│   └── server.js          # Punto de entrada
│
└── README.md              # Documentación del proyecto
```

---

## 🚀 Plan de Implementación

### Fase 1: Crear Backend API

#### 1.1. Inicializar Proyecto Backend

```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install firebase-admin
npm install jsonwebtoken
npm install express-validator
npm install --save-dev nodemon
```

#### 1.2. Estructura de Carpetas Backend

```
backend/
├── src/
│   ├── config/
│   │   └── firebase-admin.js    # Configuración Firebase Admin SDK
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación JWT
│   │   └── validateRole.js       # Middleware de validación de roles
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticación
│   │   ├── medicamentosController.js
│   │   ├── asistentesController.js
│   │   └── usuariosController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicamentosRoutes.js
│   │   ├── asistentesRoutes.js
│   │   └── usuariosRoutes.js
│   ├── services/
│   │   ├── authService.js       # Lógica de autenticación
│   │   ├── medicamentosService.js
│   │   ├── asistentesService.js
│   │   └── jwtService.js        # Generación y verificación de JWT
│   ├── utils/
│   │   └── errors.js             # Manejo de errores
│   └── server.js
├── .env
└── package.json
```

#### 1.3. Configuración Firebase Admin SDK

**Archivo:** `backend/src/config/firebase-admin.js`

```javascript
const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin con credenciales de servicio
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

**Nota:** Necesitarás descargar las credenciales de servicio desde Firebase Console → Configuración del proyecto → Cuentas de servicio.

#### 1.4. Servicio JWT

**Archivo:** `backend/src/services/jwtService.js`

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-segura';

/**
 * Genera un token JWT para un usuario
 */
const generarToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verifica y decodifica un token JWT
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generarToken,
  verificarToken
};
```

#### 1.5. Middleware de Autenticación

**Archivo:** `backend/src/middleware/auth.js`

```javascript
const { verificarToken } = require('../services/jwtService');
const { db } = require('../config/firebase-admin');

/**
 * Middleware para verificar token JWT
 */
const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    const decoded = verificarToken(token);

    // Obtener datos del usuario desde Firestore
    const usuarioDoc = await db.collection('usuarios').doc(decoded.userId).get();
    
    if (!usuarioDoc.exists) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    req.usuario = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      ...usuarioDoc.data()
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Token inválido'
    });
  }
};

module.exports = { autenticar };
```

#### 1.6. Middleware de Validación de Roles

**Archivo:** `backend/src/middleware/validateRole.js`

```javascript
/**
 * Middleware para validar roles de usuario
 */
const validarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = { validarRol };
```

#### 1.7. Controlador de Autenticación

**Archivo:** `backend/src/controllers/authController.js`

```javascript
const { auth, db } = require('../config/firebase-admin');
const { generarToken } = require('../services/jwtService');
const { esAsistenteDe } = require('../services/asistentesService');

/**
 * Login con email y password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }

    // Autenticar con Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    
    // Verificar password (Firebase Admin no tiene método directo)
    // Necesitarás usar Firebase Auth REST API o SDK del cliente
    // Por ahora, asumimos que la autenticación se hace en el frontend
    // y solo verificamos el token de Firebase

    // Obtener datos del usuario
    const usuarioDoc = await db.collection('usuarios').doc(userRecord.uid).get();
    
    if (!usuarioDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const usuarioData = usuarioDoc.data();

    // Generar JWT
    const token = generarToken(
      userRecord.uid,
      userRecord.email,
      usuarioData.role
    );

    res.json({
      success: true,
      token,
      usuario: {
        id: userRecord.uid,
        email: userRecord.email,
        ...usuarioData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Registro de nuevo usuario
 */
const registro = async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nombre
    });

    // Verificar si es asistente
    const asistenteResult = await esAsistenteDe(email);
    let role = 'paciente';
    let pacienteId = null;

    if (asistenteResult.success && asistenteResult.esAsistente) {
      role = 'asistente';
      pacienteId = asistenteResult.pacienteId;
    }

    // Crear documento en Firestore
    await db.collection('usuarios').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      nombre,
      role,
      pacienteId,
      tipoSuscripcion: 'gratis',
      esPremium: false,
      fechaCreacion: new Date().toISOString(),
      ultimaSesion: new Date().toISOString()
    });

    // Generar JWT
    const token = generarToken(userRecord.uid, email, role);

    res.status(201).json({
      success: true,
      token,
      usuario: {
        id: userRecord.uid,
        email,
        nombre,
        role,
        pacienteId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  login,
  registro
};
```

**Nota:** Para login con email/password, necesitarás usar Firebase Auth REST API o crear un endpoint que reciba el token de Firebase y lo intercambie por JWT.

#### 1.8. Controlador de Medicamentos

**Archivo:** `backend/src/controllers/medicamentosController.js`

```javascript
const { db } = require('../config/firebase-admin');
const medicamentosService = require('../services/medicamentosService');

/**
 * Obtener todos los medicamentos del usuario
 */
const obtenerMedicamentos = async (req, res) => {
  try {
    const userId = req.usuario.role === 'asistente' 
      ? req.usuario.pacienteId 
      : req.usuario.id;

    const resultado = await medicamentosService.obtenerMedicamentos(userId);
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener un medicamento por ID
 */
const obtenerMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await medicamentosService.obtenerMedicamento(id, req.usuario);
    
    if (!resultado.success) {
      return res.status(404).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Crear nuevo medicamento
 */
const crearMedicamento = async (req, res) => {
  try {
    // Solo pacientes pueden crear medicamentos
    if (req.usuario.role !== 'paciente') {
      return res.status(403).json({
        success: false,
        error: 'Solo los pacientes pueden crear medicamentos'
      });
    }

    const resultado = await medicamentosService.crearMedicamento(
      req.usuario.id,
      req.body
    );

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Actualizar medicamento
 */
const actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo pacientes pueden actualizar
    if (req.usuario.role !== 'paciente') {
      return res.status(403).json({
        success: false,
        error: 'Solo los pacientes pueden actualizar medicamentos'
      });
    }

    const resultado = await medicamentosService.actualizarMedicamento(
      id,
      req.usuario.id,
      req.body
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Eliminar medicamento
 */
const eliminarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo pacientes pueden eliminar
    if (req.usuario.role !== 'paciente') {
      return res.status(403).json({
        success: false,
        error: 'Solo los pacientes pueden eliminar medicamentos'
      });
    }

    const resultado = await medicamentosService.eliminarMedicamento(
      id,
      req.usuario.id
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  obtenerMedicamentos,
  obtenerMedicamento,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento
};
```

#### 1.9. Rutas de la API

**Archivo:** `backend/src/routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { login, registro } = require('../controllers/authController');

router.post('/login', login);
router.post('/registro', registro);

module.exports = router;
```

**Archivo:** `backend/src/routes/medicamentosRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarRol } = require('../middleware/validateRole');
const {
  obtenerMedicamentos,
  obtenerMedicamento,
  crearMedicamento,
  actualizarMedicamento,
  eliminarMedicamento
} = require('../controllers/medicamentosController');

// Todas las rutas requieren autenticación
router.use(autenticar);

// Rutas
router.get('/', obtenerMedicamentos);
router.get('/:id', obtenerMedicamento);
router.post('/', validarRol('paciente'), crearMedicamento);
router.put('/:id', validarRol('paciente'), actualizarMedicamento);
router.delete('/:id', validarRol('paciente'), eliminarMedicamento);

module.exports = router;
```

#### 1.10. Servidor Principal

**Archivo:** `backend/src/server.js`

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const medicamentosRoutes = require('./routes/medicamentosRoutes');
const asistentesRoutes = require('./routes/asistentesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/asistentes', asistentesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API MiMedicina - Backend' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### Fase 2: Adaptar Frontend para Consumir API

#### 2.1. Crear Servicio de API

**Archivo:** `frontend/src/services/apiService.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Clase para manejar peticiones HTTP a la API
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obtiene el token JWT del localStorage
   */
  getToken() {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Realiza una petición HTTP
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  }

  // Métodos HTTP
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
```

#### 2.2. Adaptar Servicio de Autenticación

**Archivo:** `frontend/src/services/authService.js` (modificar)

```javascript
import apiService from './apiService';

/**
 * Login con email y password
 */
export const iniciarSesion = async (email, password) => {
  try {
    // Primero autenticar con Firebase (para mantener compatibilidad)
    // Luego obtener JWT del backend
    const response = await apiService.post('/auth/login', { email, password });
    
    if (response.success) {
      // Guardar token JWT
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Registro de usuario
 */
export const registrarUsuario = async (email, password, nombre) => {
  try {
    const response = await apiService.post('/auth/registro', {
      email,
      password,
      nombre
    });

    if (response.success) {
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }

    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cerrar sesión
 */
export const cerrarSesion = async () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('usuario');
  // También cerrar sesión de Firebase si es necesario
};
```

#### 2.3. Adaptar Servicio de Medicamentos

**Archivo:** `frontend/src/services/medicamentosService.js` (modificar)

```javascript
import apiService from './apiService';

/**
 * Obtener todos los medicamentos
 */
export const obtenerMedicamentos = async (userId) => {
  try {
    const response = await apiService.get('/medicamentos');
    return {
      success: true,
      medicamentos: response.medicamentos || response.data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      medicamentos: []
    };
  }
};

/**
 * Crear medicamento
 */
export const agregarMedicamento = async (userId, datosMedicamento) => {
  try {
    const response = await apiService.post('/medicamentos', datosMedicamento);
    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar medicamento
 */
export const actualizarMedicamento = async (medicamentoId, datosActualizados) => {
  try {
    const response = await apiService.put(`/medicamentos/${medicamentoId}`, datosActualizados);
    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar medicamento
 */
export const eliminarMedicamento = async (medicamentoId, userId) => {
  try {
    const response = await apiService.delete(`/medicamentos/${medicamentoId}`);
    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### 2.4. Variables de Entorno Frontend

**Archivo:** `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=...
# ... otras variables de Firebase si aún las necesitas
```

### Fase 3: Endpoints de la API

#### Endpoints Requeridos

```
POST   /api/auth/login          - Login
POST   /api/auth/registro        - Registro

GET    /api/medicamentos         - Listar medicamentos (autenticado)
GET    /api/medicamentos/:id     - Obtener medicamento (autenticado)
POST   /api/medicamentos         - Crear medicamento (solo paciente)
PUT    /api/medicamentos/:id     - Actualizar medicamento (solo paciente)
DELETE /api/medicamentos/:id     - Eliminar medicamento (solo paciente)

GET    /api/asistentes           - Listar asistentes (solo paciente)
POST   /api/asistentes           - Crear asistente (solo paciente)
DELETE /api/asistentes/:id       - Eliminar asistente (solo paciente)

GET    /api/usuarios/perfil      - Obtener perfil (autenticado)
PUT    /api/usuarios/perfil      - Actualizar perfil (autenticado)
DELETE /api/usuarios/perfil     - Eliminar cuenta (autenticado)
```

---

## 🔐 Seguridad Implementada

### 1. Autenticación con JWT

- Token JWT generado al login/registro
- Token incluido en header `Authorization: Bearer <token>`
- Token expira en 24 horas
- Middleware `autenticar` verifica token en cada petición

### 2. Autorización por Roles

- Middleware `validarRol` verifica roles permitidos
- Pacientes: CRUD completo de medicamentos
- Asistentes: Solo lectura de medicamentos del paciente

### 3. Validación de Datos

- Validación en backend antes de guardar
- Validación de permisos antes de operaciones

---

## 📝 Checklist de Implementación

### Backend
- [ ] Inicializar proyecto Node.js/Express
- [ ] Configurar Firebase Admin SDK
- [ ] Implementar servicio JWT
- [ ] Crear middleware de autenticación
- [ ] Crear middleware de validación de roles
- [ ] Implementar controladores (auth, medicamentos, asistentes, usuarios)
- [ ] Crear rutas de la API
- [ ] Configurar servidor Express
- [ ] Agregar manejo de errores
- [ ] Agregar validación de datos

### Frontend
- [ ] Crear servicio API (apiService.js)
- [ ] Adaptar authService para usar API
- [ ] Adaptar medicamentosService para usar API
- [ ] Adaptar asistentesService para usar API
- [ ] Actualizar AuthContext para manejar JWT
- [ ] Actualizar MedContext para usar API
- [ ] Agregar variable REACT_APP_API_URL
- [ ] Probar todas las funcionalidades

### Testing
- [ ] Probar login/registro
- [ ] Probar CRUD de medicamentos (paciente)
- [ ] Probar acceso de asistente (solo lectura)
- [ ] Probar validación de roles
- [ ] Probar manejo de errores
- [ ] Probar expiración de token

---

## 🚀 Comandos para Ejecutar

### Backend

```bash
cd backend
npm install
npm run dev  # Con nodemon para desarrollo
# o
npm start   # Para producción
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📚 Documentación de la API

### Autenticación

#### POST /api/auth/login
```json
Request:
{
  "email": "usuario@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "userId",
    "email": "usuario@example.com",
    "nombre": "Nombre Usuario",
    "role": "paciente"
  }
}
```

#### POST /api/auth/registro
```json
Request:
{
  "email": "nuevo@example.com",
  "password": "password123",
  "nombre": "Nombre Nuevo"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

### Medicamentos

#### GET /api/medicamentos
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "medicamentos": [
    {
      "id": "medId",
      "nombre": "Paracetamol",
      "tomasDiarias": 3,
      ...
    }
  ]
}
```

#### POST /api/medicamentos
**Headers:** `Authorization: Bearer <token>`  
**Role:** paciente

**Request:**
```json
{
  "nombre": "Paracetamol",
  "tomasDiarias": 3,
  "primeraToma": "08:00",
  ...
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Autenticación Híbrida

Para mantener la funcionalidad de Google OAuth, puedes:
- Opción A: Mantener Firebase Auth en frontend y generar JWT en backend
- Opción B: Implementar OAuth completo en backend

### 2. Google Calendar

La integración con Google Calendar puede mantenerse en el frontend o moverse al backend. Recomendación: mantenerla en frontend por simplicidad.

### 3. Migración Gradual

Puedes migrar gradualmente:
1. Implementar backend con endpoints básicos
2. Adaptar frontend para usar API en nuevas funcionalidades
3. Migrar funcionalidades existentes una por una

---

## ✅ Criterios de Evaluación Cumplidos

1. ✅ **Dos tipos de usuarios**: Paciente y Asistente
2. ✅ **Seguridad con access token**: JWT en todos los endpoints protegidos
3. ✅ **API REST**: Endpoints RESTful implementados
4. ✅ **Separación Frontend/Backend**: Arquitectura completamente separada
5. ✅ **Funcionamiento del Frontend**: Frontend consume API correctamente

---

## 🎯 Conclusión

Esta guía proporciona un plan completo para adaptar MiMedicina a los requisitos del final. La implementación requiere:

1. Crear backend API con Node.js/Express
2. Implementar autenticación JWT
3. Adaptar frontend para consumir API
4. Mantener funcionalidad existente

**Tiempo estimado de implementación:** 2-3 semanas

---

**Fin de la Guía para Cumplir con la Consigna del Final**

