// ============================================================
// routes/utilitarios.js — Sección Utilitarios
// USUARIOS: listar, crear, editar, inhabilitar/habilitar, eliminar
// La contraseña se hashea aquí con bcryptjs antes de ir a Supabase
// ============================================================

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { isAuthenticated } = require('../middleware/auth');

const getDB = () => require('../config/supabase');

// GET /utilitarios → redirige a usuarios
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/utilitarios/usuarios');
});

// ─────────────────────────────────────────────────────────────
// LISTAR USUARIOS
// GET /utilitarios/usuarios
// ─────────────────────────────────────────────────────────────
router.get('/usuarios', isAuthenticated, async (req, res) => {
  const supabase = getDB();
  let usuarios = [];
  let dbError  = null;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, email, nombre, rol, activo, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    usuarios = data || [];
  } catch (err) {
    console.error('Error cargando usuarios:', err.message);
    dbError = 'No se pudieron cargar los usuarios.';
  }

  res.render('sections/usuarios', {
    layout:        'main',
    title:         'Gestión de Usuarios — CLOUDSOFT',
    activeMenu:    'utilitarios',
    activeSubmenu: 'usuarios',
    pageTitle:     'Gestión de Usuarios',
    usuarios,
    dbError,
    success_msg:   req.flash('success_msg'),
    error_msg:     req.flash('error_msg'),
  });
});

// ─────────────────────────────────────────────────────────────
// CREAR USUARIO
// POST /utilitarios/usuarios/crear
// ─────────────────────────────────────────────────────────────
router.post('/usuarios/crear', isAuthenticated, async (req, res) => {
  const { username, email, nombre, password, rol } = req.body;

  if (!username || !email || !nombre || !password || !rol) {
    req.flash('error_msg', 'Todos los campos son obligatorios.');
    return res.redirect('/utilitarios/usuarios');
  }

  if (password.length < 6) {
    req.flash('error_msg', 'La contraseña debe tener al menos 6 caracteres.');
    return res.redirect('/utilitarios/usuarios');
  }

  const supabase = getDB();

  try {
    // Verificar username duplicado
    const { data: existe } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .limit(1);

    if (existe && existe.length > 0) {
      req.flash('error_msg', 'El nombre de usuario "' + username + '" ya existe.');
      return res.redirect('/utilitarios/usuarios');
    }

    // Generar hash bcrypt (10 rondas)
    const password_hash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('usuarios')
      .insert([{
        username:      username.trim().toLowerCase(),
        email:         email.trim().toLowerCase(),
        nombre:        nombre.trim(),
        password_hash,
        rol:           rol.trim(),
        activo:        true,
      }]);

    if (error) throw error;

    req.flash('success_msg', 'Usuario "' + username + '" creado correctamente.');
    res.redirect('/utilitarios/usuarios');

  } catch (err) {
    console.error('Error creando usuario:', err.message);
    if (err.message && err.message.includes('duplicate')) {
      req.flash('error_msg', 'El email ya está registrado.');
    } else {
      req.flash('error_msg', 'Error al crear el usuario: ' + err.message);
    }
    res.redirect('/utilitarios/usuarios');
  }
});

// ─────────────────────────────────────────────────────────────
// OBTENER DATOS DE USUARIO (para modal de edición vía AJAX)
// GET /utilitarios/usuarios/:id/datos
// ─────────────────────────────────────────────────────────────
router.get('/usuarios/:id/datos', isAuthenticated, async (req, res) => {
  const supabase = getDB();
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, email, nombre, rol, activo')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'No encontrado.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// EDITAR USUARIO
// POST /utilitarios/usuarios/:id/editar
// ─────────────────────────────────────────────────────────────
router.post('/usuarios/:id/editar', isAuthenticated, async (req, res) => {
  const { username, email, nombre, rol, password } = req.body;
  const supabase = getDB();

  if (!username || !email || !nombre || !rol) {
    req.flash('error_msg', 'Usuario, email, nombre y rol son obligatorios.');
    return res.redirect('/utilitarios/usuarios');
  }

  try {
    const updates = {
      username: username.trim().toLowerCase(),
      email:    email.trim().toLowerCase(),
      nombre:   nombre.trim(),
      rol:      rol.trim(),
    };

    // Solo actualizar contraseña si se envió una nueva
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        req.flash('error_msg', 'La nueva contraseña debe tener al menos 6 caracteres.');
        return res.redirect('/utilitarios/usuarios');
      }
      updates.password_hash = await bcrypt.hash(password.trim(), 10);
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', req.params.id);

    if (error) throw error;

    req.flash('success_msg', 'Usuario "' + username + '" actualizado correctamente.');
    res.redirect('/utilitarios/usuarios');

  } catch (err) {
    console.error('Error editando usuario:', err.message);
    req.flash('error_msg', 'Error al editar: ' + err.message);
    res.redirect('/utilitarios/usuarios');
  }
});

// ─────────────────────────────────────────────────────────────
// INHABILITAR / HABILITAR USUARIO (toggle activo)
// POST /utilitarios/usuarios/:id/toggle
// ─────────────────────────────────────────────────────────────
router.post('/usuarios/:id/toggle', isAuthenticated, async (req, res) => {
  const supabase = getDB();

  // No puede inhabilitarse a sí mismo
  if (req.session.user && req.session.user.id === req.params.id) {
    req.flash('error_msg', 'No puedes inhabilitarte a ti mismo.');
    return res.redirect('/utilitarios/usuarios');
  }

  try {
    const { data: user, error: fetchErr } = await supabase
      .from('usuarios')
      .select('activo, username')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !user) throw new Error('Usuario no encontrado.');

    const nuevoEstado = !user.activo;

    const { error } = await supabase
      .from('usuarios')
      .update({ activo: nuevoEstado })
      .eq('id', req.params.id);

    if (error) throw error;

    req.flash('success_msg', 'Usuario "' + user.username + '" ' + (nuevoEstado ? 'habilitado' : 'inhabilitado') + '.');
    res.redirect('/utilitarios/usuarios');

  } catch (err) {
    console.error('Error toggle usuario:', err.message);
    req.flash('error_msg', 'Error: ' + err.message);
    res.redirect('/utilitarios/usuarios');
  }
});

// ─────────────────────────────────────────────────────────────
// ELIMINAR USUARIO
// POST /utilitarios/usuarios/:id/eliminar
// ─────────────────────────────────────────────────────────────
router.post('/usuarios/:id/eliminar', isAuthenticated, async (req, res) => {
  // No puede eliminarse a sí mismo
  if (req.session.user && req.session.user.id === req.params.id) {
    req.flash('error_msg', 'No puedes eliminar tu propio usuario.');
    return res.redirect('/utilitarios/usuarios');
  }

  const supabase = getDB();

  try {
    const { data: user } = await supabase
      .from('usuarios')
      .select('username')
      .eq('id', req.params.id)
      .single();

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    req.flash('success_msg', 'Usuario "' + (user ? user.username : '') + '" eliminado.');
    res.redirect('/utilitarios/usuarios');

  } catch (err) {
    console.error('Error eliminando usuario:', err.message);
    req.flash('error_msg', 'Error al eliminar: ' + err.message);
    res.redirect('/utilitarios/usuarios');
  }
});

// ─── Configuración placeholder ────────────────────────────
router.get('/configuracion', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main', title: 'Configuración — CLOUDSOFT',
    activeMenu: 'utilitarios', pageTitle: 'Configuración',
  });
});

// ─── Backup placeholder ───────────────────────────────────
router.get('/backup', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main', title: 'Backup — CLOUDSOFT',
    activeMenu: 'utilitarios', pageTitle: 'Backup',
  });
});

module.exports = router;
