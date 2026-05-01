/* ============================================================
   public/js/sidebar.js — Sidebar responsivo CLOUDSOFT
   Maneja: colapso escritorio, drawer móvil, submenús
   ============================================================ */

(function () {
  'use strict';

  const body      = document.body;
  const sidebar   = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (!sidebar) return;

  // ── Crear overlay para móvil ───────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  body.appendChild(overlay);
  overlay.addEventListener('click', closeMobile);

  // ── Detectar si es móvil ───────────────────────────────
  const isMobile = () => window.innerWidth <= 768;

  // ── Botón toggle ───────────────────────────────────────
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isMobile()) {
        toggleMobile();
      } else {
        toggleDesktop();
      }
    });
  }

  // ── ESCRITORIO: colapsar/expandir ─────────────────────
  function toggleDesktop() {
    const collapsed = body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
  }

  // ── MÓVIL: abrir/cerrar drawer ─────────────────────────
  function toggleMobile() {
    const isOpen = body.classList.toggle('sidebar-open');
    overlay.style.display = isOpen ? 'block' : 'none';
    body.style.overflow   = isOpen ? 'hidden' : '';
  }

  function closeMobile() {
    body.classList.remove('sidebar-open');
    overlay.style.display = 'none';
    body.style.overflow   = '';
  }

  // ── Restaurar estado colapsado al cargar (solo desktop) ─
  if (!isMobile()) {
    if (localStorage.getItem('sidebarCollapsed') === '1') {
      body.classList.add('sidebar-collapsed');
    }
  }

  // ── Submenús desplegables ──────────────────────────────
  sidebar.querySelectorAll('.sidebar__toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const group   = this.closest('.sidebar__group');
      const id      = this.getAttribute('data-target');
      const submenu = document.getElementById(id);
      if (!group || !submenu) return;

      // En escritorio colapsado: expandir primero
      if (body.classList.contains('sidebar-collapsed') && !isMobile()) {
        body.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', '0');
        setTimeout(() => openGroup(group, submenu), 50);
        return;
      }

      const isOpen = group.classList.contains('sidebar__group--open');
      isOpen ? closeGroup(group, submenu) : openGroup(group, submenu);
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

  // ── Cerrar sidebar al navegar en móvil ─────────────────
  sidebar.querySelectorAll('.sidebar__subitem, .sidebar__item--active').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile()) closeMobile();
    });
  });

  // ── Cerrar sidebar al redimensionar a escritorio ───────
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeMobile();
      overlay.style.display = 'none';
    }
  });

  // ── Cerrar con tecla ESC en móvil ──────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isMobile()) closeMobile();
  });

})();
