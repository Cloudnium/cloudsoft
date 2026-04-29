// ============================================================
// config/supabase.js — Cliente de Supabase
// Las credenciales vienen del .env cargado en app.js
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  SUPABASE_URL o SUPABASE_KEY no definidos en .env');
  module.exports = null;
} else {
  console.log('✅ Supabase conectado:', supabaseUrl);
  module.exports = createClient(supabaseUrl, supabaseKey);
}
