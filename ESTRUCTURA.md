# ============================================================
# ESTRUCTURA DEL PROYECTO — CLOUDSOFT
# Sistema interno en Node.js + Express + Handlebars
# ============================================================

cloudsoft/
│
├── app.js                          ← Servidor principal (Express, middlewares, rutas)
├── .env.example                    ← Variables de entorno (copiar a .env y configurar)
├── .env                            ← ⚠️ NO subir a Git (credenciales reales)
├── .gitignore                      ← node_modules, .env, etc.
├── package.json                    ← Dependencias del proyecto
├── database.sql                    ← Script SQL para crear las tablas en Supabase
│
├── config/
│   └── supabase.js                 ← Cliente de Supabase (singleton)
│
├── middleware/
│   └── auth.js                     ← isAuthenticated / isGuest (protección de rutas)
│
├── routes/                         ← Un archivo por sección del sistema
│   ├── auth.js                     ← GET/POST /login, GET /logout
│   ├── dashboard.js                ← GET /dashboard
│   ├── tabla.js                    ← GET /tabla y sub-rutas
│   ├── movimientos.js              ← GET /movimientos y sub-rutas
│   ├── consultas.js                ← GET /consultas y sub-rutas
│   ├── liquidaciones.js            ← GET /liquidaciones y sub-rutas
│   ├── reportes.js                 ← GET /reportes y sub-rutas
│   └── utilitarios.js              ← GET /utilitarios y sub-rutas
│
├── views/                          ← Plantillas Handlebars (.hbs)
│   ├── layouts/
│   │   ├── main.hbs                ← Layout principal (con sidebar y topbar)
│   │   └── auth.hbs                ← Layout para login (sin sidebar)
│   │
│   ├── partials/
│   │   ├── sidebar.hbs             ← Barra lateral de navegación
│   │   └── topbar.hbs              ← Barra superior
│   │
│   ├── login.hbs                   ← Pantalla de inicio de sesión
│   ├── dashboard.hbs               ← Panel principal
│   ├── 404.hbs                     ← Página de error 404
│   │
│   └── sections/                   ← Vistas de cada sección del menú
│       ├── placeholder.hbs         ← Vista temporal (reemplazar por la real)
│       ├── tabla.hbs               ← (crear cuando implementes Tabla)
│       ├── movimientos.hbs         ← (crear cuando implementes Movimientos)
│       ├── consultas.hbs           ← (crear cuando implementes Consultas)
│       ├── liquidaciones.hbs       ← (crear cuando implementes Liquidaciones)
│       ├── reportes.hbs            ← (crear cuando implementes Reportes)
│       └── utilitarios.hbs         ← (crear cuando implementes Utilitarios)
│
├── public/                         ← Archivos estáticos (servidos directamente)
│   │
│   ├── css/
│   │   ├── main.css                ← Variables CSS, reset, layout, topbar, flash
│   │   ├── sidebar.css             ← Estilos del sidebar y sub-menús
│   │   ├── login.css               ← Estilos del login y slider
│   │   └── dashboard.css           ← Cards, tablas, botones, badges reutilizables
│   │
│   ├── js/
│   │   ├── login-slider.js         ← Slider automático del login (autoplay, touch)
│   │   ├── sidebar.js              ← Colapso, sub-menús, responsive del sidebar
│   │   └── main.js                 ← Fecha/hora, flash messages, utilidades globales
│   │
│   ├── images/
│   │   ├── logo.png                ← ✏️ REEMPLAZAR con tu logo (180×60 px aprox.)
│   │   ├── avatar-default.png      ← ✏️ REEMPLAZAR con avatar por defecto
│   │   │
│   │   └── slides/                 ← Imágenes del slider del login
│   │       ├── slide1.jpg          ← ✏️ REEMPLAZAR con tus imágenes (1920×1080)
│   │       ├── slide2.jpg          ← ✏️ REEMPLAZAR
│   │       └── slide3.jpg          ← ✏️ REEMPLAZAR
│   │
│   └── icons/
│       └── favicon.ico             ← ✏️ REEMPLAZAR con tu favicon
│
└── ESTRUCTURA.md                   ← Este archivo

═══════════════════════════════════════════════════════════════
CÓMO PONER EN MARCHA EL PROYECTO
═══════════════════════════════════════════════════════════════

1. Instalar dependencias:
   npm install

2. Configurar variables de entorno:
   cp .env.example .env
   → Editar .env con tus credenciales de Supabase

3. Crear la base de datos en Supabase:
   → Ir a app.supabase.com → SQL Editor
   → Copiar y ejecutar el contenido de database.sql

4. Agregar imágenes:
   → Reemplazar los archivos en public/images/ con tus propias imágenes
   → Ver sección "CÓMO CAMBIAR IMÁGENES" abajo

5. Iniciar el servidor:
   node app.js
   → Abrir http://localhost:3000

═══════════════════════════════════════════════════════════════
CÓMO CAMBIAR IMÁGENES, LOGOS E ÍCONOS
═══════════════════════════════════════════════════════════════

LOGO DEL SISTEMA:
  → Reemplaza: public/images/logo.png
  → Aparece en: sidebar (esquina superior) y pantalla de login
  → Tamaño recomendado: 200×60 px, fondo transparente (PNG)
  → Código: views/partials/sidebar.hbs línea con class="sidebar__logo"
             views/login.hbs línea con class="login-logo"

AVATAR POR DEFECTO:
  → Reemplaza: public/images/avatar-default.png
  → Aparece cuando el usuario no tiene foto configurada
  → Tamaño recomendado: 100×100 px (cuadrado)

IMÁGENES DEL SLIDER (Login):
  → Reemplaza: public/images/slides/slide1.jpg, slide2.jpg, slide3.jpg
  → Tamaño recomendado: 1920×1080 px (horizontal, alta calidad)
  → Para agregar más slides: editar views/login.hbs
     Copiar un bloque <div class="slide"> y cambiar data-bg y textos

ÍCONOS DEL MENÚ LATERAL:
  → Usa clases de Remixicon: https://remixicon.com
  → Busca el ícono, copia la clase (ej: ri-home-4-line)
  → Cambiar en: views/partials/sidebar.hbs
  → Ejemplo: <i class="ri-table-2 sidebar__icon"></i>

FAVICON:
  → Reemplaza: public/icons/favicon.ico
  → O agrega en el <head> del layout: <link rel="icon" href="/icons/favicon.ico">

COLORES DEL SISTEMA:
  → Editar: public/css/main.css → sección :root {}
  → Variables principales:
      --color-primary:   Color del sidebar y botones (morado por defecto)
      --bg-sidebar:      Fondo del sidebar
      --color-accent:    Color de acentos (verde menta)

═══════════════════════════════════════════════════════════════
CÓMO AGREGAR SUB-OPCIONES AL MENÚ
═══════════════════════════════════════════════════════════════

1. Ir a: views/partials/sidebar.hbs
2. Dentro del grupo correspondiente, agregar un <li>:
   <li><a href="/tabla/nueva-opcion" class="sidebar__subitem">
     <i class="ri-circle-line"></i> Nueva Opción
   </a></li>

3. Crear la ruta en: routes/tabla.js
   router.get('/nueva-opcion', isAuthenticated, (req, res) => {
     res.render('sections/tabla-nueva', { ... });
   });

4. Crear la vista: views/sections/tabla-nueva.hbs

═══════════════════════════════════════════════════════════════
CREDENCIALES INICIALES (cambiar en producción)
═══════════════════════════════════════════════════════════════
  Usuario:    admin
  Contraseña: Admin123!
  → Cambiar en Supabase después del primer acceso

═══════════════════════════════════════════════════════════════
DEPENDENCIAS INSTALADAS
═══════════════════════════════════════════════════════════════
  express              → Servidor web
  express-handlebars   → Motor de plantillas .hbs
  express-session      → Manejo de sesiones de usuario
  bcryptjs             → Hash de contraseñas
  connect-flash        → Mensajes flash entre peticiones
  @supabase/supabase-js → Cliente de Supabase (base de datos)
  dotenv               → Variables de entorno desde .env
