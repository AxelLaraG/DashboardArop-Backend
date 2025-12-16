# 🚀 Backend - Dashboard de Gestión de Usuarios

API RESTful construida con **Node.js**, **Express** y **TypeScript**. Este backend gestiona la autenticación, roles y administración de usuarios utilizando el patrón de diseño **Repository** para una arquitectura limpia y escalable.

![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Pre-requisitos](#-pre-requisitos)
- [Instalación](#-instalación)
- [Configuración (.env)](#-configuración-env)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)

## ✨ Características

- **Arquitectura en Capas:** Separación clara entre Rutas, Controladores y Repositorios.
- **TypeScript:** Tipado estático para un código más robusto y mantenible.
- **Autenticación:** Sistema de Login y manejo de seguridad (JWT sugerido).
- **Gestión de Roles:** Filtrado y acceso de usuarios basado en roles de base de datos.
- **MySQL:** Conexión eficiente a base de datos relacional.

## 🛠 Pre-requisitos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [MySQL](https://www.mysql.com/)
- Un gestor de paquetes como `npm` o `yarn`.

## 📦 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
    cd backend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

## ⚙️ Configuración (.env)

Crea un archivo `.env` en la raíz del proyecto (puedes basarte en un `.env.example` si existe) y define las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_base_de_datos
DB_PORT=3306
JWT_SECRET=tu_secreto_super_seguro
```

## ▶️ Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

`npm run dev` -> Ejecuta la aplicación en modo desarrollo (usando nodemon o ts-node-dev). El servidor se reiniciará ante cambios.
`npm run build` -> Compila el código TypeScript a JavaScript en la carpeta dist/ o build/.
`npm start` -> Ejecuta la versión compilada de la aplicación (ideal para producción). Asegúrate de haber ejecutado npm run build antes.

## 📂 Estructura del Proyecto
La arquitectura sigue el patrón Repository para desacoplar la lógica de negocio del acceso a datos:

```Plaintextsrc/
├── config/           # Configuración de BD y variables de entorno
├── controllers/      # Lógica de entrada/salida (req, res)
├── interfaces/       # Definiciones de tipos TypeScript (Modelos)
├── middlewares/      # Validaciones, Auth y manejo de errores
├── repositories/     # Acceso directo a Base de Datos (SQL Queries)
├── routes/           # Definición de endpoints y métodos HTTP
└── index.ts          # Punto de entrada de la aplicación
```
