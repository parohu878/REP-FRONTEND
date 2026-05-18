# 🛒 E-commerce Front-end

Este es el cliente Front-end para la aplicación de E-commerce. Está desarrollado utilizando las últimas tecnologías web para ofrecer una experiencia rápida, reactiva y moderna.

## 🚀 Tecnologías Principales

- **Framework**: React 19
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS 4
- **Enrutamiento**: React Router v7
- **Gráficos**: Chart.js / react-chartjs-2
- **Pagos**: Integración con Stripe (@stripe/stripe-js)

## 📦 Instalación y Configuración

1. **Clonar el repositorio y acceder a la carpeta:**
   ```bash
   cd Front-end
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz del Front-end basándote en los requerimientos del proyecto (ej. Clave pública de Stripe, URL de la API).

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible por defecto en `http://localhost:5173`.

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con Hot Module Replacement (HMR).
- `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
- `npm run lint`: Ejecuta ESLint para analizar el código y encontrar problemas.
- `npm run preview`: Sirve la aplicación compilada para previsualizar el build de producción.

## 📁 Estructura del Proyecto

- `/src/components`: Componentes reutilizables de la interfaz.
- `/src/pages`: Vistas principales de la aplicación (Home, Login, Register, Cart, Checkout, Dashboards).
- `/src/assets` y `/img`: Recursos estáticos como imágenes e íconos.

## 📌 Estado
- **Versión**: 0.1 Alpha
- **Estado**: Working