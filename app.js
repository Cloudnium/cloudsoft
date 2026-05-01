// ============================================================
// app.js — Servidor principal de CLOUDSOFT
// ============================================================

const path = require('path');

// Cargar .env con ruta absoluta ANTES de cualquier otro require
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const exphbs  = require('express-handlebars');
const session = require('express-session');
const flash   = require('connect-flash');

const app = express();

// ─────────────────────────────────────────────
// MOTOR DE PLANTILLAS: Handlebars + Helpers
// ─────────────────────────────────────────────
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir:   path.join(__dirname, 'views/layouts'),
  partialsDir:  path.join(__dirname, 'views/partials'),
  helpers: {

    servicioSlug: (s) => {
      if (!s) return 'default';
      const sl = s.toLowerCase();
      if (sl.includes('black'))    return 'black';
      if (sl.includes('econom'))   return 'economico';
      if (sl.includes('turista') || sl.includes('premium')) return 'turista-premium';
      return 'default';
    },

    // Comparar igualdad (para menú activo)
    eq: (a, b) => a === b,

    // Año actual para footer
    currentYear: () => new Date().getFullYear(),

    // Primera letra del nombre para avatar
    avatarLetra: (nombre) => {
      if (!nombre) return '?';
      return nombre.charAt(0).toUpperCase();
    },

    // Etiqueta legible del rol
    rolLabel: (rol) => {
      const roles = {
        admin:    'Administrador',
        operador: 'Operador',
        consulta: 'Solo Consulta',
      };
      return roles[rol] || rol || 'Sin rol';
    },
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ─────────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'cloudsoft_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

// Flash messages
app.use(flash());

// Variables globales para las vistas
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg   = req.flash('error_msg');
  res.locals.user        = req.session.user || null;
  next();
});

// ─────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────
app.use('/',              require('./routes/auth'));
app.use('/dashboard',     require('./routes/dashboard'));
app.use('/tabla',         require('./routes/tabla'));
app.use('/movimientos',   require('./routes/movimientos'));
app.use('/consultas',     require('./routes/consultas'));
app.use('/liquidaciones', require('./routes/liquidaciones'));
app.use('/reportes',      require('./routes/reportes'));
app.use('/utilitarios',   require('./routes/utilitarios'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { layout: false, title: '404 - No encontrado' });
});

// ─────────────────────────────────────────────
// INICIO DEL SERVIDOR
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ CLOUDSOFT corriendo en http://localhost:' + PORT);
});
