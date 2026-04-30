/* ============================================================
   public/js/main.js — Scripts globales de CLOUDSOFT
   Fecha/hora en topbar, notificaciones, utilidades generales
   ============================================================ */

(function () {
  'use strict';

  // ── FECHA Y HORA EN EL TOPBAR ──────────────────────
  // Actualiza el elemento #topbarDate cada segundo
  const topbarDate = document.getElementById('topbarDate');

  function updateDateTime() {
    if (!topbarDate) return;
    const now = new Date();
    const opts = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    topbarDate.textContent = now.toLocaleDateString('es-PE', opts);
  }

  updateDateTime();
  setInterval(updateDateTime, 60000); // Actualizar cada minuto

  // ── AUTO-CERRAR FLASH MESSAGES ─────────────────────
  // Los mensajes de éxito/error desaparecen automáticamente
  const flashes = document.querySelectorAll('.flash');

  flashes.forEach((flash) => {
    setTimeout(() => {
      flash.style.transition = 'opacity 0.5s ease, max-height 0.5s ease';
      flash.style.opacity = '0';
      flash.style.maxHeight = '0';
      flash.style.overflow = 'hidden';
      setTimeout(() => flash.remove(), 500);
    }, 4000); // Desaparece a los 4 segundos
  });

  // ── MOSTRAR/OCULTAR CONTRASEÑA (login) ─────────────
  // Solo activo si estamos en la pantalla de login
//const togglePass = document.getElementById('togglePass');
//const passInput  = document.getElementById('password');
//const eyeIcon    = document.getElementById('eyeIcon');

if (togglePass && passInput && eyeIcon) {
  togglePass.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (passInput.type === 'password') {
      passInput.type = 'text';
      eyeIcon.className = 'ri-eye-line';
    } else {
      passInput.type = 'password';
      eyeIcon.className = 'ri-eye-off-line';
    }
    passInput.focus();
  });
}
  // ── NOTIFICACIONES (placeholder) ───────────────────
  // Para conectar con notificaciones reales:
  //   1. Crea un endpoint GET /api/notificaciones en Express
  //   2. Descomenta y ajusta la función loadNotifications()
  //
  // async function loadNotifications() {
  //   try {
  //     const res  = await fetch('/api/notificaciones');
  //     const data = await res.json();
  //     const badge = document.getElementById('notifBadge');
  //     if (badge && data.count > 0) {
  //       badge.textContent = data.count;
  //       badge.style.display = 'flex';
  //     }
  //   } catch (err) {
  //     console.warn('No se pudieron cargar notificaciones:', err);
  //   }
  // }
  // loadNotifications();
  // setInterval(loadNotifications, 30000); // Revisar cada 30 segundos

  // ── CONFIRMACIONES DE ELIMINACIÓN ──────────────────
  // Agrega data-confirm="¿Seguro que deseas eliminar?" a cualquier botón/enlace
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-confirm]');
    if (!el) return;
    const msg = el.getAttribute('data-confirm') || '¿Estás seguro?';
    if (!confirm(msg)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // ── UTILIDAD: formatear números como moneda ─────────
  // Uso: formatCurrency(1500) → "S/. 1,500.00"
  window.formatCurrency = function (amount, currency = 'S/.') {
    return `${currency} ${Number(amount).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ── UTILIDAD: formatear fechas ──────────────────────
  // Uso: formatDate('2024-01-15') → "15/01/2024"
  window.formatDate = function (dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE');
  };

})();
