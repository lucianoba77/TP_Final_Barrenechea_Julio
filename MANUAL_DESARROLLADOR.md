# 📘 Manual del Desarrollador - MiMedicina

**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Autor:** Julio Luciano Barrenechea

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Gestión de Medicamentos](#gestión-de-medicamentos)
7. [Sistema de Asistentes](#sistema-de-asistentes)
8. [Integración con Google Calendar](#integración-con-google-calendar)
9. [Cálculo de Adherencia](#cálculo-de-adherencia)
10. [Context API y Estado Global](#context-api-y-estado-global)
11. [Rutas y Navegación](#rutas-y-navegación)
12. [Servicios y Utilidades](#servicios-y-utilidades)
13. [Base de Datos Firestore](#base-de-datos-firestore)
14. [Seguridad y Permisos](#seguridad-y-permisos)

---

## Introducción

MiMedicina es una aplicación web React diseñada para la gestión de medicamentos, dirigida principalmente a personas mayores y sus cuidadores/asistentes. La aplicación permite gestionar medicamentos, controlar la adherencia al tratamiento, sincronizar eventos con Google Calendar y compartir acceso con asistentes.

### Objetivos del Proyecto

- Facilitar la gestión de medicamentos para personas mayores
- Proporcionar herramientas de seguimiento de adherencia
- Permitir que asistentes/cuidadores accedan a la información del paciente
- Sincronizar recordatorios con Google Calendar
- Ofrecer una interfaz intuitiva y mobile-first

---

## Arquitectura del Sistema

### Arquitectura Actual (Frontend Directo a Firebase)

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
│ (Auth)       │  │  (Database)  │
└──────────────┘  └──────────────┘
         │
         ▼
┌─────────────────┐
│ Google Calendar │
│      API        │
└─────────────────┘
```

### Flujo de Datos

1. **Autenticación**: Usuario se autentica con Firebase Auth
2. **Autorización**: Se verifica el rol (paciente/asistente) en Firestore
3. **Operaciones CRUD**: Se realizan directamente desde el frontend a Firestore
4. **Sincronización**: Los eventos se crean en Google Calendar mediante API

---

## Estructura del Proyecto

### Estructura de Carpetas Detallada

```
MiMedicina/
├── public/                    # Archivos estáticos públicos
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── MainMenu.jsx      # Menú de navegación inferior
│   │   ├── MedicamentoCard.jsx  # Tarjeta de medicamento
│   │   ├── UserMenu.jsx      # Menú de usuario (logout, ajustes)
│   │   ├── GestionarAsistentes.jsx  # Gestión de asistentes
│   │   ├── GoogleCalendarSync.jsx    # Sincronización Google Calendar
│   │   ├── GoogleCalendarCallback.jsx # Callback OAuth
│   │   ├── ConfirmDialog.jsx # Diálogo de confirmación
│   │   ├── Toast.jsx         # Notificaciones toast
│   │   └── VerificarFirebase.jsx  # Verificación de configuración
│   │
│   ├── context/              # Context API para estado global
│   │   ├── AuthContext.jsx   # Context de autenticación
│   │   ├── MedContext.jsx    # Context de medicamentos
│   │   └── NotificationContext.jsx  # Context de notificaciones
│   │
│   ├── screens/              # Pantallas/Vistas principales
│   │   ├── LandingScreen.jsx    # Pantalla de inicio (marketing)
│   │   ├── LoginScreen.jsx      # Inicio de sesión
│   │   ├── DashboardScreen.jsx # Dashboard principal
│   │   ├── NuevaMedicinaScreen.jsx  # Formulario de medicamento
│   │   ├── BotiquinScreen.jsx   # Lista de medicamentos
│   │   ├── HistorialScreen.jsx  # Estadísticas y adherencia
│   │   └── AjustesScreen.jsx    # Configuración
│   │
│   ├── services/             # Servicios para comunicación con Firebase
│   │   ├── authService.js    # Servicio de autenticación
│   │   ├── medicamentosService.js  # CRUD de medicamentos
│   │   ├── asistentesService.js    # Gestión de asistentes
│   │   └── calendarService.js      # Sincronización Google Calendar
│   │
│   ├── utils/                # Utilidades y helpers
│   │   ├── adherenciaUtils.js     # Cálculos de adherencia
│   │   ├── presentacionIcons.js    # Íconos de presentaciones
│   │   ├── googleAuthHelper.js    # Helpers para OAuth Google
│   │   └── verificarFirebase.js   # Verificación de configuración
│   │
│   ├── hooks/                # Custom React Hooks
│   │   └── useStockAlerts.js  # Hook para alertas de stock
│   │
│   ├── config/               # Configuración
│   │   └── firebase.js       # Configuración de Firebase
│   │
│   ├── constants/           # Constantes
│   │   └── colores.js       # Colores pasteles para medicamentos
│   │
│   ├── img/                  # Imágenes y assets
│   │   ├── MiMedicina_Logo.png
│   │   └── [íconos de presentaciones]
│   │
│   ├── App.jsx               # Componente principal y rutas
│   ├── index.js              # Punto de entrada
│   └── index.css             # Estilos globales
│
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts
└── README.md                 # Documentación principal
```

---

## Tecnologías Utilizadas

### Frontend

- **React 18.2.0**: Biblioteca de UI
- **React Router DOM 6.20.0**: Enrutamiento de la aplicación
- **Context API**: Gestión de estado global (sin Redux)
- **CSS Modules**: Estilos modulares por componente

### Backend/Servicios

- **Firebase 12.5.0**:
  - **Firebase Auth**: Autenticación (Email/Password y Google OAuth)
  - **Firestore**: Base de datos NoSQL
- **Google Calendar API**: Sincronización de eventos

### Herramientas de Desarrollo

- **Create React App**: Scaffolding del proyecto
- **npm**: Gestor de paquetes
- **ESLint**: Linter de código

---

## Sistema de Autenticación

### Flujo de Autenticación

#### 1. Registro de Usuario

**Archivo:** `src/services/authService.js`

```javascript
export const registrarUsuario = async (email, password, nombre)
```

**Proceso:**
1. Verifica si el email corresponde a un asistente existente
2. Crea usuario en Firebase Auth
3. Actualiza el perfil con el nombre
4. Determina el rol (paciente o asistente)
5. Crea documento en Firestore (`usuarios/{userId}`)

**Estructura del documento de usuario:**
```javascript
{
  id: string,              // UID de Firebase Auth
  email: string,
  nombre: string,
  role: 'paciente' | 'asistente',
  pacienteId: string | null,  // Solo para asistentes
  tipoSuscripcion: 'gratis',
  esPremium: boolean,
  fechaCreacion: ISO string,
  ultimaSesion: ISO string
}
```

#### 2. Inicio de Sesión

**Métodos disponibles:**
- **Email/Password**: `iniciarSesion(email, password)`
- **Google OAuth**: `iniciarSesionConGoogle()`

**Proceso:**
1. Autentica con Firebase Auth
2. Obtiene datos del usuario desde Firestore
3. Verifica si es asistente (si no tiene rol definido)
4. Retorna usuario con toda su información

#### 3. Observación del Estado de Autenticación

**Archivo:** `src/context/AuthContext.jsx`

```javascript
useEffect(() => {
  const unsubscribe = observarEstadoAuth((usuario) => {
    setUsuarioActual(usuario);
    setCargando(false);
  });
  return () => unsubscribe();
}, []);
```

El `AuthContext` observa cambios en el estado de autenticación y actualiza el estado global automáticamente.

### Roles y Permisos

#### Paciente
- Acceso completo a todas las funcionalidades
- Puede crear y gestionar asistentes
- Puede conectar Google Calendar
- Puede modificar sus medicamentos

#### Asistente
- Solo lectura del botiquín e historial del paciente
- No puede modificar medicamentos
- No puede acceder a ajustes
- Encabezados personalizados con nombre del paciente

---

## Gestión de Medicamentos

### Estructura de Datos de Medicamento

**Colección:** `medicamentos`

```javascript
{
  id: string,                    // ID del documento en Firestore
  userId: string,                 // ID del usuario propietario
  nombre: string,                 // Nombre del medicamento
  presentacion: string,           // 'pastillas', 'jarabe', 'inyeccion', etc.
  tomasDiarias: number,          // Número de tomas por día (0 = ocasional)
  primeraToma: string,           // Hora de la primera toma (HH:mm)
  stockInicial: number,          // Stock inicial
  stockActual: number,           // Stock actual
  stockMinimo: number,           // Stock mínimo para alertas
  activo: boolean,                // Si el medicamento está activo
  esCronico: boolean,             // Si es un medicamento crónico
  diasTratamiento: number | null, // Días de tratamiento (null si es crónico)
  fechaInicio: string,            // Fecha de inicio (YYYY-MM-DD)
  fechaFin: string | null,        // Fecha de fin (null si es crónico)
  afeccion: string,               // Para qué afección se toma
  instrucciones: string,          // Instrucciones adicionales
  tomasRealizadas: Array<{       // Array de tomas realizadas
    fecha: string,                // Fecha (YYYY-MM-DD)
    hora: string,                 // Hora (HH:mm)
    tomada: boolean               // Si fue tomada
  }>,
  eventoIds: Array<string>,       // IDs de eventos en Google Calendar
  fechaCreacion: ISO string,
  fechaActualizacion: ISO string
}
```

### Operaciones CRUD

**Archivo:** `src/services/medicamentosService.js`

#### Crear Medicamento
```javascript
export const agregarMedicamento = async (userId, datosMedicamento)
```

**Proceso:**
1. Valida los datos del medicamento
2. Crea documento en Firestore
3. Si tiene Google Calendar conectado, crea eventos
4. Retorna el medicamento creado con su ID

#### Leer Medicamentos
```javascript
export const obtenerMedicamentos = async (userId)
export const obtenerMedicamento = async (medicamentoId)
```

**Proceso:**
1. Consulta Firestore con filtro por `userId`
2. Ordena manualmente por `primeraToma`
3. Retorna array de medicamentos

#### Actualizar Medicamento
```javascript
export const actualizarMedicamento = async (medicamentoId, datosActualizados)
```

**Proceso:**
1. Actualiza documento en Firestore
2. Si cambió horario y tiene Google Calendar, actualiza eventos
3. Retorna resultado de la operación

#### Eliminar Medicamento
```javascript
export const eliminarMedicamento = async (medicamentoId, userId)
```

**Proceso:**
1. Elimina eventos de Google Calendar si existen
2. Elimina documento de Firestore
3. Retorna resultado de la operación

### Suscripción en Tiempo Real

```javascript
export const suscribirMedicamentos = (userId, callback)
```

Permite escuchar cambios en tiempo real en los medicamentos del usuario mediante `onSnapshot` de Firestore.

---

## Sistema de Asistentes

### Concepto

Los asistentes son usuarios que pueden acceder de forma limitada (solo lectura) a la información de un paciente. Un paciente puede crear múltiples asistentes.

### Flujo de Creación de Asistente

**Archivo:** `src/services/asistentesService.js`

```javascript
export const agregarAsistente = async (pacienteId, emailAsistente, nombreAsistente, password, credencialesPaciente)
```

**Proceso:**
1. Crea documento en colección `asistentes`
2. Si el asistente ya tiene cuenta, actualiza su rol
3. Si no tiene cuenta, se creará cuando se registre
4. El asistente queda vinculado al paciente mediante `pacienteId`

### Estructura de Datos de Asistente

**Colección:** `asistentes`

```javascript
{
  id: string,                    // ID del documento
  pacienteId: string,            // ID del paciente
  emailAsistente: string,        // Email del asistente
  nombreAsistente: string,       // Nombre del asistente
  fechaCreacion: ISO string      // Fecha de creación
}
```

### Verificación de Asistente

```javascript
export const esAsistenteDe = async (emailAsistente, opciones)
```

Verifica si un email corresponde a un asistente y retorna:
- `esAsistente`: boolean
- `pacienteId`: ID del paciente asignado
- `paciente`: Datos del paciente (si se solicita)

### Permisos de Asistente

Los asistentes tienen acceso de **solo lectura** a:
- Botiquín del paciente (ver medicamentos)
- Historial del paciente (ver estadísticas)

**No pueden:**
- Modificar medicamentos
- Agregar medicamentos
- Acceder a ajustes
- Gestionar otros asistentes

---

## Integración con Google Calendar

### Flujo OAuth 2.0

**Archivo:** `src/utils/googleAuthHelper.js`

1. **Inicio de Autorización:**
   ```javascript
   autorizarGoogleCalendar(clientId)
   ```
   - Redirige a Google OAuth
   - Solicita permisos de Google Calendar

2. **Callback:**
   - Ruta: `/auth/google/callback`
   - Componente: `GoogleCalendarCallback.jsx`
   - Extrae token del hash de la URL
   - Guarda token en Firestore (`googleTokens/{userId}`)

3. **Almacenamiento de Token:**
   ```javascript
   guardarTokenGoogle(userId, tokenData)
   ```
   - Guarda en colección `googleTokens`
   - Incluye `expires_in` y `fechaObtencion`

### Creación de Eventos

**Archivo:** `src/services/calendarService.js`

#### Evento Individual
```javascript
export const crearEventoToma = async (accessToken, medicamento, fecha, hora)
```

**Proceso:**
1. Construye objeto de evento con formato Google Calendar
2. Incluye recordatorios (15 y 5 minutos antes)
3. Asigna color según presentación del medicamento
4. Crea evento mediante API REST de Google Calendar
5. Retorna `eventoId` para almacenarlo en el medicamento

#### Eventos Recurrentes
```javascript
export const crearEventosRecurrentes = async (accessToken, medicamento)
```

**Proceso:**
1. Calcula horarios de todas las tomas del día
2. Crea eventos para cada día del tratamiento
3. Límite de 100 eventos por medicamento
4. Para crónicos: crea eventos para 90 días
5. Para ocasionales: no crea eventos

### Actualización y Eliminación

- **Actualizar**: Cuando cambia el horario de un medicamento
- **Eliminar**: Cuando se elimina un medicamento o se desconecta Google Calendar

---

## Cálculo de Adherencia

### Concepto

La adherencia mide el porcentaje de tomas realizadas vs. tomas esperadas en un período determinado.

### Funciones Principales

**Archivo:** `src/utils/adherenciaUtils.js`

#### Calcular Adherencia
```javascript
export const calcularAdherencia = (medicamento, periodo = 'total')
```

**Parámetros:**
- `medicamento`: Objeto del medicamento con `tomasRealizadas`
- `periodo`: 'total' | 'mensual' | 'semanal'

**Proceso:**
1. Determina rango de fechas según período
2. Calcula tomas esperadas (días × tomasDiarias)
3. Filtra tomas realizadas en el período
4. Calcula porcentaje: (realizadas / esperadas) × 100

**Retorna:**
```javascript
{
  porcentaje: number,      // 0-100
  realizadas: number,      // Cantidad de tomas realizadas
  esperadas: number,       // Cantidad de tomas esperadas
  dias: number            // Días en el período
}
```

#### Adherencia Promedio
```javascript
export const calcularAdherenciaPromedio = (medicamentos, periodo)
```

Calcula el promedio de adherencia de todos los medicamentos.

#### Estado de Adherencia
```javascript
export const obtenerEstadoAdherencia = (porcentaje)
```

Retorna:
- Color (verde/amarillo/rojo)
- Icono
- Mensaje descriptivo

### Normalización de Fechas

**Importante:** Las fechas se normalizan a formato `YYYY-MM-DD` para comparaciones consistentes, evitando problemas con timezones.

---

## Context API y Estado Global

### AuthContext

**Archivo:** `src/context/AuthContext.jsx`

**Estado:**
- `usuarioActual`: Usuario autenticado actual
- `cargando`: Estado de carga de autenticación

**Funciones:**
- `login(email, password)`: Iniciar sesión
- `registro(email, password, nombre)`: Registrar usuario
- `loginWithGoogle()`: Login con Google
- `logout()`: Cerrar sesión
- `eliminarCuenta()`: Eliminar cuenta del usuario

**Uso:**
```javascript
const { usuarioActual, login, logout } = useAuth();
```

### MedContext

**Archivo:** `src/context/MedContext.jsx`

**Estado:**
- `medicamentos`: Array de medicamentos
- `cargando`: Estado de carga

**Funciones:**
- `cargarMedicamentos()`: Carga medicamentos del usuario
- `agregarMedicamento(datos)`: Agrega nuevo medicamento
- `actualizarMedicamento(id, datos)`: Actualiza medicamento
- `eliminarMedicamento(id)`: Elimina medicamento

**Suscripción en Tiempo Real:**
- Se suscribe automáticamente a cambios en Firestore
- Actualiza el estado cuando hay cambios

### NotificationContext

**Archivo:** `src/context/NotificationContext.jsx`

**Funciones:**
- `showSuccess(mensaje)`: Muestra notificación de éxito
- `showError(mensaje)`: Muestra notificación de error
- `showWarning(mensaje)`: Muestra notificación de advertencia
- `showInfo(mensaje)`: Muestra notificación informativa

**Uso:**
```javascript
const { showSuccess, showError } = useNotification();
```

---

## Rutas y Navegación

### Configuración de Rutas

**Archivo:** `src/App.jsx`

```javascript
<Routes>
  <Route path="/" element={<LandingScreen />} />
  <Route path="/login" element={<LoginScreen />} />
  <Route path="/dashboard" element={<RutaProtegida><DashboardScreen /></RutaProtegida>} />
  <Route path="/nuevo" element={<RutaProtegida><NuevaMedicinaScreen /></RutaProtegida>} />
  <Route path="/botiquin" element={<RutaProtegida><BotiquinScreen /></RutaProtegida>} />
  <Route path="/historial" element={<RutaProtegida><HistorialScreen /></RutaProtegida>} />
  <Route path="/ajustes" element={<RutaProtegida rolesPermitidos={['paciente']}><AjustesScreen /></RutaProtegida>} />
  <Route path="/auth/google/callback" element={<GoogleCalendarCallback />} />
</Routes>
```

### Rutas Protegidas

**Componente:** `RutaProtegida`

- Verifica autenticación
- Verifica roles permitidos
- Redirige a `/login` si no está autenticado
- Redirige a `/botiquin` si el rol no está permitido

### Navegación

- **MainMenu**: Menú inferior con navegación principal
- **UserMenu**: Menú de usuario (logout, ajustes)
- **React Router**: Navegación programática con `useNavigate()`

---

## Servicios y Utilidades

### Servicios (src/services/)

#### authService.js
- Autenticación con Firebase Auth
- Gestión de usuarios en Firestore
- Verificación de roles

#### medicamentosService.js
- CRUD completo de medicamentos
- Suscripción en tiempo real
- Integración con Google Calendar

#### asistentesService.js
- Creación y gestión de asistentes
- Verificación de asistente
- Obtención de lista de asistentes

#### calendarService.js
- Gestión de tokens de Google
- Creación/actualización/eliminación de eventos
- Verificación de conexión

### Utilidades (src/utils/)

#### adherenciaUtils.js
- Cálculos de adherencia
- Estadísticas de tomas
- Normalización de fechas

#### googleAuthHelper.js
- Helpers para OAuth de Google
- Extracción de tokens de URL
- Construcción de URLs de autorización

#### presentacionIcons.js
- Mapeo de presentaciones a íconos
- Colores asociados

#### verificarFirebase.js
- Verificación de configuración de Firebase
- Validación de variables de entorno

---

## Base de Datos Firestore

### Colecciones

#### usuarios
- **ID**: `userId` (UID de Firebase Auth)
- **Campos**: Ver sección [Sistema de Autenticación](#sistema-de-autenticación)

#### medicamentos
- **ID**: Auto-generado por Firestore
- **Campos**: Ver sección [Gestión de Medicamentos](#gestión-de-medicamentos)

#### asistentes
- **ID**: Auto-generado por Firestore
- **Campos**: Ver sección [Sistema de Asistentes](#sistema-de-asistentes)

#### googleTokens
- **ID**: `userId`
- **Campos**:
  ```javascript
  {
    access_token: string,
    expires_in: number,
    fechaObtencion: ISO string,
    token_type: string,
    scope: string,
    userId: string
  }
  ```

### Índices

**Nota:** El proyecto evita índices compuestos ordenando manualmente en JavaScript.

---

## Seguridad y Permisos

### Firestore Security Rules

Las reglas deben incluir:

1. **Helper Functions:**
   - `esAsistente()`: Verifica si el usuario es asistente
   - `pacienteIdDelAsistente()`: Obtiene el pacienteId del asistente

2. **Reglas para usuarios:**
   - Lectura/escritura: Solo el propio usuario
   - Lectura: Asistentes pueden leer su paciente asignado

3. **Reglas para medicamentos:**
   - Crear: Solo si `userId` coincide con usuario autenticado
   - Leer: Propietario o asistente del paciente
   - Actualizar/Eliminar: Solo el propietario

4. **Reglas para asistentes:**
   - Lectura: Usuarios autenticados
   - Crear/Actualizar/Eliminar: Usuarios autenticados

5. **Reglas para googleTokens:**
   - Lectura/Escritura: Solo el propio usuario

### Validación en el Frontend

Aunque las reglas de Firestore son la última línea de defensa, el frontend también valida:
- Roles antes de mostrar opciones
- Permisos antes de realizar operaciones
- Datos antes de enviar a Firestore

---

## Flujos de Usuario Principales

### 1. Registro y Primer Uso

1. Usuario accede a `/login`
2. Selecciona "Registrarse"
3. Completa formulario (email, password, nombre)
4. Se crea cuenta en Firebase Auth
5. Se crea documento en `usuarios`
6. Redirige a `/dashboard`

### 2. Agregar Medicamento

1. Usuario navega a `/nuevo`
2. Completa formulario de medicamento
3. Si tiene Google Calendar conectado, se crean eventos
4. Medicamento aparece en dashboard y botiquín

### 3. Marcar Toma Realizada

1. Usuario ve medicamento en dashboard
2. Hace clic en botón "Tomado"
3. Se actualiza `tomasRealizadas` en Firestore
4. Se actualiza estadística de adherencia

### 4. Crear Asistente

1. Usuario va a `/ajustes`
2. Sección "Gestionar Asistentes"
3. Ingresa email y nombre del asistente
4. Se crea documento en `asistentes`
5. Asistente puede registrarse y acceder

### 5. Conectar Google Calendar

1. Usuario va a `/ajustes`
2. Sección "Google Calendar"
3. Hace clic en "Conectar"
4. Redirige a Google OAuth
5. Autoriza permisos
6. Callback guarda token
7. Se crean eventos para medicamentos existentes

---

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

1. **Suscripción en Tiempo Real:**
   - Solo una suscripción activa por usuario
   - Se limpia al desmontar componente

2. **Ordenamiento Manual:**
   - Evita índices compuestos en Firestore
   - Ordena en memoria después de obtener datos

3. **Límite de Eventos:**
   - Máximo 100 eventos por medicamento
   - Para crónicos: 90 días

4. **Lazy Loading:**
   - Componentes cargados bajo demanda
   - Rutas protegidas verifican autenticación

---

## Manejo de Errores

### Estrategias

1. **Try-Catch en Servicios:**
   - Todos los servicios retornan `{ success, error }`
   - Errores se capturan y se retornan mensajes amigables

2. **Notificaciones al Usuario:**
   - Errores se muestran mediante `NotificationContext`
   - Mensajes claros y accionables

3. **Validación de Datos:**
   - Validación en frontend antes de enviar
   - Validación en Firestore Rules

---

## Testing y Debugging

### Herramientas

- **React DevTools**: Inspección de componentes y estado
- **Firebase Console**: Monitoreo de Firestore y Auth
- **Google Calendar**: Verificación de eventos creados
- **Console del Navegador**: Logs de desarrollo (removidos en producción)

### Puntos de Verificación

1. Autenticación funciona correctamente
2. Medicamentos se crean/actualizan/eliminan
3. Asistentes pueden acceder a datos del paciente
4. Google Calendar sincroniza eventos
5. Adherencia se calcula correctamente

---

## Próximos Pasos y Mejoras

### Mejoras Sugeridas

1. **Backend API:**
   - Separar lógica de negocio del frontend
   - Implementar API REST
   - Ver sección [Guía para Final](#guía-para-final)

2. **Testing:**
   - Tests unitarios con Jest
   - Tests de integración
   - Tests E2E con Cypress

3. **Optimizaciones:**
   - Paginación de medicamentos
   - Caché de datos
   - Service Workers para offline

4. **Funcionalidades:**
   - Notificaciones push nativas
   - Exportación de reportes PDF
   - Compartir medicamentos entre usuarios

---

## Conclusión

Este manual proporciona una visión completa de la arquitectura, funcionalidades y estructura del proyecto MiMedicina. Para más detalles sobre cómo adaptar el proyecto para cumplir con la consigna del final, consulta la [Guía para Final](#guía-para-final).

---

**Fin del Manual del Desarrollador**

