// ============================================================
// middleware/auth.js — Middleware de autenticación
// Protege rutas privadas: si no hay sesión, redirige al login
// ============================================================

/**
 * isAuthenticated
 * Úsalo en cualquier ruta que requiera login:
 *   router.get('/ruta', isAuthenticated, (req, res) => { ... })
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // Usuario autenticado → continúa
  }
  // No autenticado → redirige al login con mensaje
  req.flash('error_msg', 'Debes iniciar sesión para acceder.');
  res.redirect('/login');
}

/**
 * isGuest
 * Evita que usuarios ya logueados vean el login:
 *   router.get('/login', isGuest, (req, res) => { ... })
 */
function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard'); // Ya logueado → ir al dashboard
  }
  next();
}

module.exports = { isAuthenticated, isGuest };
