// ============================================================
// routes/auth.js — Login solo por USERNAME + PASSWORD
// No usa correo para iniciar sesión, solo el campo 'usuario'
// que corresponde al username en la tabla usuarios
// ============================================================

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { isGuest, isAuthenticated } = require('../middleware/auth');

// ─── GET / → redirige según sesión ────────────
router.get('/', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

// ─── GET /login → muestra el formulario ───────
router.get('/login', isGuest, (req, res) => {
  res.render('login', {
    layout: 'auth',
    title: 'Iniciar Sesión — CLOUDSOFT',
  });
});

// ─── POST /login → valida credenciales ────────
router.post('/login', isGuest, async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    req.flash('error_msg', 'Completa usuario y contraseña.');
    return res.redirect('/login');
  }

  // Obtener supabase AQUÍ (después de que app.js cargó el .env)
  const supabase = require('../config/supabase');

  // ── MODO SIN BASE DE DATOS (fallback de prueba) ──
  if (!supabase) {
    if (usuario === 'admin' && password === 'Admin123!') {
      req.session.user = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        nombre: 'Administrador',
        email: 'admin@cloudsoft.com',
        rol: 'admin',
        avatar: null,
      };
      return res.redirect('/dashboard');
    }
    req.flash('error_msg', 'Usuario o contraseña incorrectos.');
    return res.redirect('/login');
  }

  // ── LOGIN NORMAL: buscar SOLO por username ──
  // No busca por email — el login es únicamente por usuario
  try {
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', usuario.trim())
      .limit(1);

    if (error) {
      console.error('Error Supabase:', error);
      req.flash('error_msg', 'Error al conectar con la base de datos.');
      return res.redirect('/login');
    }

    if (!users || users.length === 0) {
      req.flash('error_msg', 'Usuario o contraseña incorrectos.');
      return res.redirect('/login');
    }

    const user = users[0];

    if (!user.activo) {
      req.flash('error_msg', 'Tu cuenta está desactivada. Contacta al administrador.');
      return res.redirect('/login');
    }

    // Verificar contraseña con bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.flash('error_msg', 'Usuario o contraseña incorrectos.');
      return res.redirect('/login');
    }

    // Crear sesión
    req.session.user = {
      id:       user.id,
      username: user.username,
      nombre:   user.nombre,
      email:    user.email,
      rol:      user.rol,
      avatar:   user.avatar_url || null,
    };

    res.redirect('/dashboard');

  } catch (err) {
    console.error('Error en login:', err);
    req.flash('error_msg', 'Error interno del servidor.');
    res.redirect('/login');
  }
});

// ─── GET /logout ───────────────────────────────
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
