/* ============================================================
   public/js/login-slider.js — Slider automático del login
   Controla el cambio automático de imágenes en el panel derecho
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIGURACIÓN ──────────────────────────────────
  // Cambiar estos valores para ajustar el comportamiento

  /** Tiempo entre slides en milisegundos (default: 5 segundos) */
  const SLIDE_INTERVAL = 5000;

  /** Duración de la transición en ms (debe coincidir con CSS: 0.8s) */
  const TRANSITION_DURATION = 800;

  // ── ELEMENTOS DEL DOM ─────────────────────────────
  const slider    = document.getElementById('loginSlider');
  const dotsWrap  = document.getElementById('sliderDots');
  const btnPrev   = document.getElementById('slidePrev');
  const btnNext   = document.getElementById('slideNext');

  if (!slider) return; // No estamos en la página de login → salir

  const slides = Array.from(slider.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoTimer    = null;
  let isAnimating  = false;

  // ── INICIALIZACIÓN ─────────────────────────────────
  // Aplicar la imagen de fondo a cada slide desde el atributo data-bg
  slides.forEach((slide, i) => {
    const bg = slide.getAttribute('data-bg');
    if (bg) {
      slide.style.backgroundImage = `url('${bg}')`;
    }
  });

  // Crear los puntos de navegación dinámicamente
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  // ── FUNCIÓN PRINCIPAL: ir a un slide específico ────
  function goTo(index, direction) {
    if (isAnimating || index === currentIndex) return;
    isAnimating = true;

    // Ocultar slide actual
    slides[currentIndex].classList.remove('active');
    updateDot(currentIndex, false);

    // Calcular el índice correcto (circular)
    currentIndex = (index + slides.length) % slides.length;

    // Mostrar nuevo slide
    slides[currentIndex].classList.add('active');
    updateDot(currentIndex, true);

    // Reiniciar animación del contenido del slide activo
    const content = slides[currentIndex].querySelector('.slide-content');
    if (content) {
      content.style.animation = 'none';
      void content.offsetWidth; // fuerza reflow
      content.style.animation = '';
    }

    setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
  }

  // Actualizar estado visual de los puntos
  function updateDot(index, active) {
    const dots = dotsWrap.querySelectorAll('.slider-dot');
    if (dots[index]) {
      dots[index].classList.toggle('active', active);
    }
  }

  // ── AUTO-PLAY ──────────────────────────────────────
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goTo(currentIndex + 1);
    }, SLIDE_INTERVAL);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Pausar al pasar el mouse sobre el slider
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // ── CONTROLES PREV/NEXT ────────────────────────────
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      goTo(currentIndex - 1);
      startAuto(); // Reinicia el timer al hacer clic
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      goTo(currentIndex + 1);
      startAuto();
    });
  }

  // ── SOPORTE TOUCH (swipe en móvil) ─────────────────
  let touchStartX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  // ── INICIAR ────────────────────────────────────────
  startAuto();

})();
