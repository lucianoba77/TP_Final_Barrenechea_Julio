# MiMedicina - Botiquín Virtual

Aplicación React para gestión de medicamentos dirigida a personas mayores y sus asistentes.

## 🚀 Características

- **Dashboard**: Vista de medicamentos programados para el día
- **Botiquín**: Gestión completa de medicamentos (agregar, editar, suspender, eliminar)
- **Historial**: Estadísticas de adherencia y resumen de tratamientos
- **Ajustes**: Configuración personalizada de alarmas y notificaciones
- **Mobile-First**: Diseño optimizado para dispositivos móviles

## 📋 Requisitos

- Node.js 16+ y npm

## 🔧 Instalación

```bash
npm install
```

## ▶️ Ejecutar

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciales de Login

- **Email**: lucianoba77@hotmail.com
- **Password**: lucianoba77

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── MainMenu.js     # Menú de navegación inferior
│   └── MedicamentoCard.js  # Tarjeta de medicamento
├── context/            # Context API para estado global
│   ├── AuthContext.js # Autenticación
│   └── MedContext.js  # Gestión de medicamentos
├── screens/            # Pantallas/Vistas
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── NuevaMedicinaScreen.js
│   ├── BotiquinScreen.js
│   ├── HistorialScreen.js
│   └── AjustesScreen.js
├── data/              # Datos mock
│   └── mockData.js
├── App.js             # Configuración de rutas
└── index.js           # Punto de entrada
```

## 🎨 Tecnologías

- React 18
- React Router DOM
- Context API
- CSS Modules
- Mobile-First Design

## 📱 Vistas

- `/login` - Inicio de sesión
- `/` - Dashboard principal
- `/nuevo` - Agregar nuevo medicamento
- `/botiquin` - Lista de medicamentos
- `/historial` - Estadísticas y adherencia
- `/ajustes` - Configuración

