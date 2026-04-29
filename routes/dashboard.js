// ============================================================
// routes/dashboard.js — Ruta del panel principal
// GET /dashboard → Página de inicio del sistema
// ============================================================

const express = require('express');
const router  = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// ─── GET /dashboard ───────────────────────────
router.get('/', isAuthenticated, (req, res) => {
  res.render('dashboard', {
    layout: 'main',
    title: 'Dashboard — CLOUDSOFT',
    activeMenu: 'dashboard',   // Indica qué menú lateral está activo
    pageTitle: 'Panel Principal',
  });
});

module.exports = router;
