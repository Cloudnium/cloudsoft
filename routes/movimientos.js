// ============================================================
// routes/movimientos.js — Sección Movimientos
// GET /movimientos/boletaje  → Página principal de Boletaje
// ============================================================

const express = require('express');
const router  = express.Router();
const { isAuthenticated } = require('../middleware/auth');

const getDB = () => require('../config/supabase');

// GET /movimientos → redirige a boletaje
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/movimientos/boletaje');
});

// ─── GET /movimientos/boletaje ─────────────────────────────
router.get('/boletaje', isAuthenticated, async (req, res) => {
  const supabase = getDB();
  let destinos = [];
  let salidas  = [];
  let dbError  = null;

  // Fecha seleccionada (por query param o hoy)
  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
  const destino = req.query.destino || '';

  try {
    // Cargar destinos únicos para el filtro
    const { data: dData } = await supabase
      .from('boletaje_salidas')
      .select('destino')
      .order('destino');

    if (dData) {
      const vistos = new Set();
      destinos = dData.filter(d => {
        if (vistos.has(d.destino)) return false;
        vistos.add(d.destino);
        return true;
      });
    }

    // Cargar salidas filtradas por fecha y destino
    let query = supabase
      .from('boletaje_salidas')
      .select('*')
      .eq('fecha', fecha)
      .order('hora_salida1');

    if (destino) query = query.eq('destino', destino);

    const { data: sData, error } = await query;
    if (error) throw error;
    salidas = sData || [];

  } catch (err) {
    console.error('Error boletaje:', err.message);
    dbError = 'No se pudieron cargar los datos.';
  }

  res.render('sections/boletaje', {
    layout:    'main',
    title:     'Boletaje — CLOUDSOFT',
    activeMenu: 'movimientos',
    activeSubmenu: 'boletaje',
    pageTitle: 'Boletaje',
    fecha,
    destino,
    destinos,
    salidas,
    dbError,
    success_msg: req.flash('success_msg'),
    error_msg:   req.flash('error_msg'),
  });
});

// ─── Egresos placeholder ───────────────────────────────────
router.get('/egresos', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main', title: 'Egresos — CLOUDSOFT',
    activeMenu: 'movimientos', pageTitle: 'Egresos',
  });
});

// ─── Historial placeholder ─────────────────────────────────
router.get('/historial', isAuthenticated, (req, res) => {
  res.render('sections/placeholder', {
    layout: 'main', title: 'Historial — CLOUDSOFT',
    activeMenu: 'movimientos', pageTitle: 'Historial',
  });
});

module.exports = router;
