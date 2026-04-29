/* ============================================================
   public/js/sidebar.js — Comportamiento del sidebar
   Maneja: colapso, menús desplegables, responsive
   ============================================================ */

(function () {
  'use strict';

  // ── ELEMENTOS ──────────────────────────────────────
  const body          = document.body;
  const sidebar       = document.getElementById('sidebar');
  const toggleBtn     = document.getElementById('sidebarToggle');
  const mainWrapper   = document.getElementById('mainWrapper');

  if (!sidebar) return;

  // ── CREAR OVERLAY para móvil ───────────────────────
  // Se muestra como fondo oscuro cuando el sidebar se abre en móvil
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  body.appendChild(overlay);

  overlay.addEventListener('click', closeMobileSidebar);

  // ── BOTÓN TOGGLE (topbar) ─────────────────────────
  // En escritorio: colapsa el sidebar
  // En móvil: muestra/oculta el sidebar
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMobileSidebar();
      } else {
        toggleDesktopCollapse();
      }
    });
  }

  // ── COLAPSO EN ESCRITORIO ──────────────────────────
  function toggleDesktopCollapse() {
    const isCollapsed = body.classList.toggle('sidebar-collapsed');
    // Guardar preferencia en localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
  }

  // ── SIDEBAR MÓVIL ──────────────────────────────────
  function toggleMobileSidebar() {
    const isOpen = body.classList.toggle('sidebar-open');
    overlay.style.display = isOpen ? 'block' : 'none';
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileSidebar() {
    body.classList.remove('sidebar-open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ── RESTAURAR ESTADO DEL SIDEBAR AL CARGAR ─────────
  // Solo en escritorio
  if (window.innerWidth > 768) {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === '1') {
      body.classList.add('sidebar-collapsed');
    }
  }

  // ── MENÚS DESPLEGABLES (sub-menús) ─────────────────
  // Cada botón con clase .sidebar__toggle activa su sub-menú
  const toggleButtons = sidebar.querySelectorAll('.sidebar__toggle');

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const group     = this.closest('.sidebar__group');
      const targetId  = this.getAttribute('data-target');
      const submenu   = document.getElementById(targetId);

      if (!group || !submenu) return;

      const isOpen = group.classList.contains('sidebar__group--open');

      // Si el sidebar está colapsado en escritorio,
      // expandir primero y luego abrir el sub-menú
      if (body.classList.contains('sidebar-collapsed') && window.innerWidth > 768) {
        body.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', '0');
        // Pequeña espera para la animación de expansión
        setTimeout(() => openGroup(group, submenu), 50);
        return;
      }

      if (isOpen) {
        closeGroup(group, submenu);
      } else {
        // Opcional: cerrar otros grupos abiertos (acordeón)
        // Descomenta para activar comportamiento acordeón:
        // closeAllGroups();
        openGroup(group, submenu);
      }
    });
  });

  function openGroup(group, submenu) {
    group.classList.add('sidebar__group--open');
    submenu.classList.add('open');
  }

  function closeGroup(group, submenu) {
    group.classList.remove('sidebar__group--open');
    submenu.classList.remove('open');
  }

  // Cierra todos los grupos (para modo acordeón)
  function closeAllGroups() {
    sidebar.querySelectorAll('.sidebar__group--open').forEach((g) => {
      g.classList.remove('sidebar__group--open');
      const sub = g.querySelector('.sidebar__submenu');
      if (sub) sub.classList.remove('open');
    });
  }

  // ── AJUSTE RESPONSIVE AL REDIMENSIONAR ─────────────
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      // Cerrar el overlay de móvil si el usuario agranda la ventana
      closeMobileSidebar();
      overlay.style.display = 'none';
    }
  });

})();
