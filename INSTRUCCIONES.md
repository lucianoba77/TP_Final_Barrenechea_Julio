# 🚀 Instrucciones de Instalación y Ejecución

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión 16 o superior)
- **npm** (viene incluido con Node.js)

Puedes verificar tu versión ejecutando:
```bash
node --version
npm --version
```

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- React 18
- React DOM 18
- React Router DOM 6
- React Scripts

## ▶️ Ejecutar la Aplicación

Una vez instaladas las dependencias, ejecuta:

```bash
npm start
```

La aplicación se abrirá automáticamente en tu navegador en [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciales de Login

Para acceder a la aplicación, usa las siguientes credenciales:

- **Email:** `lucianoba77@hotmail.com`
- **Password:** `lucianoba77`

## 📱 Uso de la Aplicación

### Dashboard Principal
- Vista de todos los medicamentos programados para el día
- Muestra el estado de cada medicamento con barras de progreso
- Permite marcar medicamentos como "Tomado"

### Botiquín
- Lista completa de todos tus medicamentos
- Información detallada de cada medicamento
- Opciones para suspender o eliminar medicamentos

### Nueva Medicina
- Formulario completo para agregar nuevos medicamentos
- Selector de color para personalizar visualmente los medicamentos
- Configuración de dosis, horarios y duración del tratamiento

### Historial
- Estadísticas generales de tratamientos
- Adherencia al tratamiento (porcentaje de cumplimiento)
- Resumen semanal de tomas realizadas

### Ajustes
- Configuración personal de usuario
- Opciones de alarmas y notificaciones
- Configuración de alertas de stock bajo

## 🏗️ Estructura del Proyecto

```
MiMedicina/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── MainMenu.js      # Menú de navegación
│   │   └── MedicamentoCard.js # Tarjeta de medicamento
│   ├── context/             # Context API
│   │   ├── AuthContext.js   # Autenticación
│   │   └── MedContext.js    # Gestión de medicamentos
│   ├── screens/             # Pantallas principales
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── NuevaMedicinaScreen.js
│   │   ├── BotiquinScreen.js
│   │   ├── HistorialScreen.js
│   │   └── AjustesScreen.js
│   ├── data/
│   │   └── mockData.js      # Datos de prueba
│   ├── App.js               # Configuración de rutas
│   ├── index.js             # Punto de entrada
│   └── index.css            # Estilos globales
├── package.json
└── README.md
```

## ⚙️ Funcionalidades Principales

### Gestión de Estado
- **AuthContext**: Maneja la autenticación del usuario
- **MedContext**: Gestiona el estado global de medicamentos con operaciones CRUD

### Rutas Protegidas
- Todas las rutas excepto `/login` requieren autenticación
- Redirección automática a login si el usuario no está autenticado

### Operaciones CRUD
- **Crear**: Agregar nuevos medicamentos desde Nueva Medicina
- **Leer**: Visualizar medicamentos en Dashboard y Botiquín
- **Actualizar**: Editar medicamentos desde Botiquín
- **Eliminar**: Eliminar medicamentos desde Botiquín

## 🎨 Características de Diseño

- **Mobile-First**: Optimizado para dispositivos móviles
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Gradientes y Colores**: Interfaz moderna con paleta de colores
- **Iconos**: Uso de emojis para mejorar la usabilidad
- **Animaciones**: Transiciones suaves entre estados

## 📊 Datos Mock

La aplicación incluye 3 medicamentos de prueba:
1. **Paracetamol** - Comprimidos, 1 toma diaria
2. **Pantoprazol** - Comprimidos, 2 tomas diarias
3. **Sertal compuesto** - Inyección, 1 toma diaria

## 🔧 Scripts Disponibles

```bash
npm start      # Inicia el servidor de desarrollo
npm build      # Crea la versión de producción
npm test       # Ejecuta los tests
```

## 💡 Notas Adicionales

- La aplicación funciona completamente en el frontend
- No requiere backend ni base de datos
- Los datos se almacenan en el estado de React
- Los cambios se perderán al recargar la página (comportamiento esperado en un prototipo)

