/* ============================================================
   public/js/boletaje.js — Lógica del módulo Boletaje
   Maneja: calendario interactivo, filtro destino, panel info
   ============================================================ */

(function () {
  'use strict';

  // ── Estado ────────────────────────────────────────────────
  const fechaInput   = document.getElementById('fechaActual');
  const destinoInput = document.getElementById('destinoActual');

  let fechaSeleccionada = fechaInput ? fechaInput.value : hoy();
  let viewYear  = parseInt(fechaSeleccionada.split('-')[0]);
  let viewMonth = parseInt(fechaSeleccionada.split('-')[1]) - 1;

  // ── Helpers ───────────────────────────────────────────────
  function hoy() {
    return new Date().toISOString().split('T')[0];
  }

  function formatFecha(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return d + '/' + m + '/' + y;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // ── Navegar a fecha + destino ─────────────────────────────
  function navegar(fecha, destino) {
    const params = new URLSearchParams();
    if (fecha)   params.set('fecha', fecha);
    if (destino) params.set('destino', destino);
    window.location.href = '/movimientos/boletaje?' + params.toString();
  }

  // ── CALENDARIO ────────────────────────────────────────────
  const calTitle   = document.getElementById('calTitle');
  const calDays    = document.getElementById('calDays');
  const calPrev    = document.getElementById('calPrev');
  const calNext    = document.getElementById('calNext');
  const calToday   = document.getElementById('calTodayLabel');

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function renderCalendario() {
    if (!calTitle || !calDays) return;

    calTitle.textContent = MESES[viewMonth] + ' ' + viewYear;

    const primerDia  = new Date(viewYear, viewMonth, 1).getDay();
    const diasMes    = new Date(viewYear, viewMonth + 1, 0).getDate();
    const hoyStr     = hoy();

    calDays.innerHTML = '';

    // Celdas vacías antes del primer día
    for (let i = 0; i < primerDia; i++) {
      const prev = new Date(viewYear, viewMonth, 0 - (primerDia - i - 2));
      const cell = document.createElement('button');
      cell.className = 'cal-day cal-day--other';
      cell.textContent = prev.getDate();
      calDays.appendChild(cell);
    }

    // Días del mes
    for (let d = 1; d <= diasMes; d++) {
      const dateStr = viewYear + '-' + pad(viewMonth + 1) + '-' + pad(d);
      const cell    = document.createElement('button');
      cell.className = 'cal-day';
      cell.textContent = d;
      cell.setAttribute('data-date', dateStr);

      if (dateStr === hoyStr)             cell.classList.add('cal-day--today');
      if (dateStr === fechaSeleccionada)  cell.classList.add('cal-day--selected');

      cell.addEventListener('click', () => {
        fechaSeleccionada = dateStr;
        const dest = destinoInput ? destinoInput.value : '';
        navegar(dateStr, dest);
      });

      calDays.appendChild(cell);
    }

    // Actualizar label de hoy
    if (calToday) {
      const [y, m, dy] = hoyStr.split('-');
      calToday.textContent = dy + '/' + m + '/' + y;
    }
  }

  if (calPrev) calPrev.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendario();
  });

  if (calNext) calNext.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendario();
  });

  renderCalendario();

  // ── FILTRO POR DESTINO ────────────────────────────────────
  const filtroInput = document.getElementById('filtroDestino');
  const filtroList  = document.getElementById('filtroList');
  const filtroClear = document.getElementById('filtroClear');

  if (filtroInput && filtroList) {
    filtroInput.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      filtroList.querySelectorAll('.filtro-item').forEach(li => {
        const txt = li.textContent.toLowerCase();
        li.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }

  // ── Seleccionar destino ───────────────────────────────────
  window.seleccionarDestino = function (destino) {
    navegar(fechaSeleccionada, destino);
  };

  // ── PANEL DE INFORMACIÓN ──────────────────────────────────
  const panelEmpty  = document.querySelector('.boletaje-info__empty');
  const panelDetail = document.getElementById('panelInfoDetail');

  window.seleccionarFila = function (row) {
    // Quitar selección anterior
    document.querySelectorAll('.boletaje-row').forEach(r => r.classList.remove('row--selected'));
    row.classList.add('row--selected');

    if (panelEmpty)  panelEmpty.style.display  = 'none';
    if (panelDetail) panelDetail.style.display = 'block';

    document.getElementById('infoRuta').textContent      = row.dataset.destino || '—';
    document.getElementById('infoServicio').textContent  = row.dataset.servicio || '—';
    document.getElementById('infoPlaca').textContent     = row.dataset.placa    || '—';
    document.getElementById('infoPrecio1').textContent   = 'S/. ' + (row.dataset.precio1 || '0.00');
    document.getElementById('infoPrecio2').textContent   = 'S/. ' + (row.dataset.precio2 || '0.00');
  };

  // ── Badge de fecha ────────────────────────────────────────
  const fechaBadge = document.getElementById('fechaBadge');
  if (fechaBadge) {
    fechaBadge.textContent = formatFecha(fechaSeleccionada);
  }

  // ── Acciones de tabla (placeholders) ─────────────────────
  window.verDetalle = function (id, e) {
    e.stopPropagation();
    alert('Ver detalle de salida ID: ' + id + '\n(Implementar según requerimiento)');
  };

  window.editarSalida = function (id, e) {
    e.stopPropagation();
    alert('Editar salida ID: ' + id + '\n(Implementar según requerimiento)');
  };

  window.eliminarSalida = function (id, e) {
    e.stopPropagation();
    if (confirm('¿Eliminar esta salida?')) {
      alert('Eliminar ID: ' + id + '\n(Implementar según requerimiento)');
    }
  };

  // ── Botones de acción superiores (placeholders) ───────────
  window.imprimirManifiesto    = () => alert('Imprimir Manifiesto\n(Implementar según requerimiento)');
  window.verCroquis            = () => alert('Ver Croquis\n(Implementar según requerimiento)');
  window.verManifiestoExceso   = () => alert('Manifiesto Exceso\n(Implementar según requerimiento)');

})();
