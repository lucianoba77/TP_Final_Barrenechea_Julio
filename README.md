# MiMedicina - Botiquín Virtual

Aplicación React para gestión de medicamentos dirigida a personas mayores y sus asistentes.

## 🚀 Características

- **Dashboard**: Vista de medicamentos programados para el día con indicadores visuales de tomas
- **Botiquín**: Gestión completa de medicamentos (agregar, editar, suspender, eliminar, control de stock)
- **Historial**: Estadísticas de adherencia y resumen de tratamientos (diario, semanal, mensual, total)
- **Ajustes**: Configuración de asistentes, sincronización con Google Calendar y eliminación de cuenta
- **Sistema de Asistentes**: Permite a cuidadores/asistentes acceder al botiquín e historial del paciente
- **Medicamentos Ocasionales**: Soporte para medicamentos sin horario fijo
- **Medicamentos Crónicos**: Tratamientos sin fin de fecha
- **Control de Stock**: Alertas inteligentes cuando el stock está bajo
- **Autenticación**: Login con email/password o Google
- **Mobile-First**: Diseño optimizado para dispositivos móviles

## 📋 Requisitos

- Node.js 14 o superior
- npm o yarn
- Cuenta de Firebase (para autenticación y base de datos)
- Cuenta de Google Cloud (opcional, para sincronización con Google Calendar)

## 🔐 Credenciales de Login (Paciente)

- **Email**: mimedicinaprueba@gmail.com
- **Password**: 123456@@
- **También se puede loguear con cuenta de Google**

Credenciales de Login (Asistente)
(Sólo con usuario y contraseña)
- **Email**: miasistente@mimedicina.com
- **Password**: 123456@@ mimedicinaprueba@gmail.com



## 🏗️ Arquitectura

```
src/
├── components/              # Componentes reutilizables
│   ├── MainMenu.jsx        # Menú de navegación inferior
│   ├── MedicamentoCard.jsx  # Tarjeta de medicamento
│   ├── UserMenu.jsx         # Menú de usuario (logout, ajustes)
│   ├── GestionarAsistentes.jsx  # Gestión de asistentes
│   ├── GoogleCalendarSync.jsx   # Sincronización con Google Calendar
│   ├── ConfirmDialog.jsx   # Diálogo de confirmación
│   ├── Toast.jsx           # Notificaciones toast
│   └── VerificarFirebase.jsx   # Verificación de configuración Firebase
├── context/                # Context API para estado global
│   ├── AuthContext.jsx     # Autenticación y usuario actual
│   ├── MedContext.jsx      # Gestión de medicamentos
│   └── NotificationContext.jsx  # Sistema de notificaciones
├── screens/                # Pantallas/Vistas
│   ├── LandingScreen.jsx   # Pantalla de inicio (marketing)
│   ├── LoginScreen.jsx     # Inicio de sesión
│   ├── DashboardScreen.jsx # Dashboard principal
│   ├── NuevaMedicinaScreen.jsx  # Formulario de medicamento
│   ├── BotiquinScreen.jsx  # Lista de medicamentos
│   ├── HistorialScreen.jsx # Estadísticas y adherencia
│   └── AjustesScreen.jsx   # Configuración
├── services/               # Servicios para comunicación con Firebase
│   ├── authService.js      # Autenticación
│   ├── medicamentosService.js  # CRUD de medicamentos
│   ├── asistentesService.js # Gestión de asistentes
│   └── calendarService.js  # Sincronización con Google Calendar
├── utils/                  # Utilidades
│   ├── adherenciaUtils.js  # Cálculos de adherencia
│   ├── presentacionIcons.js  # Íconos de presentación de medicamentos
│   ├── googleAuthHelper.js # Helpers para autenticación Google
│   └── verificarFirebase.js # Verificación de configuración
├── hooks/                  # Custom hooks
│   └── useStockAlerts.js   # Alertas de stock
├── config/                 # Configuración
│   └── firebase.js         # Configuración de Firebase
├── constants/              # Constantes
│   └── colores.js          # Colores pasteles para medicamentos
├── img/                    # Imágenes y assets
│   ├── MiMedicina_Logo.png
│   ├── GoogelPlayStore.png
│   └── [íconos de presentaciones]
├── App.jsx                 # Configuración de rutas
└── index.js                # Punto de entrada
```

## 🎨 Tecnologías

- **React 18** - Biblioteca de UI
- **React Router DOM** - Enrutamiento
- **Firebase** - Autenticación y base de datos (Firestore)
- **Google APIs** - Sincronización con Google Calendar
- **Context API** - Gestión de estado global
- **CSS Modules** - Estilos modulares
- **Mobile-First Design** - Diseño responsive optimizado para móviles

## 📱 Vistas y Rutas

- `/` - Landing page (pantalla de inicio/marketing)
- `/login` - Inicio de sesión
- `/dashboard` - Dashboard principal (solo pacientes)
- `/nuevo` - Agregar/editar medicamento
- `/botiquin` - Lista de medicamentos (pacientes y asistentes)
- `/historial` - Estadísticas y adherencia (pacientes y asistentes)
- `/ajustes` - Configuración (solo pacientes)

## 🔒 Roles y Permisos

- **Paciente**: Acceso completo a todas las funcionalidades
- **Asistente**: Acceso de solo lectura al botiquín e historial del paciente asignado

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
# REACT_APP_FIREBASE_API_KEY=...
# REACT_APP_FIREBASE_AUTH_DOMAIN=...
# REACT_APP_FIREBASE_PROJECT_ID=...
# REACT_APP_FIREBASE_STORAGE_BUCKET=...
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
# REACT_APP_FIREBASE_APP_ID=...
# REACT_APP_FIREBASE_MEASUREMENT_ID=...
# REACT_APP_GOOGLE_CLIENT_ID=...

# Iniciar servidor de desarrollo
npm start
```

## 🚀 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm build` - Construye la aplicación para producción
- `npm test` - Ejecuta los tests
- `npm eject` - Expone la configuración de Create React App (irreversible)

