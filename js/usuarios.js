/* ============================================================
   public/js/usuarios.js — Scripts de la sección Usuarios
   Maneja: modales, validación de contraseñas, mostrar/ocultar pass
   ============================================================ */

// ── ABRIR MODAL CREAR ──────────────────────────────────────
function abrirModalCrear() {
  document.getElementById('modalCrear').classList.add('active');
  document.body.style.overflow = 'hidden';
  // Limpiar formulario
  document.querySelector('#modalCrear form').reset();
}

// ── ABRIR MODAL EDITAR (carga datos por AJAX) ─────────────
async function abrirModalEditar(id) {
  try {
    const res  = await fetch('/utilitarios/usuarios/' + id + '/datos');
    const user = await res.json();

    if (user.error) {
      alert('Error: ' + user.error);
      return;
    }

    // Rellenar campos del modal
    document.getElementById('editNombre').value   = user.nombre   || '';
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editEmail').value    = user.email    || '';
    document.getElementById('editRol').value      = user.rol      || 'operador';
    document.getElementById('editPass').value     = '';

    // Actualizar la acción del formulario con el ID correcto
    document.getElementById('formEditar').action = '/utilitarios/usuarios/' + id + '/editar';

    document.getElementById('modalEditar').classList.add('active');
    document.body.style.overflow = 'hidden';

  } catch (err) {
    alert('Error al cargar datos del usuario.');
    console.error(err);
  }
}

// ── CERRAR MODAL ───────────────────────────────────────────
function cerrarModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Cerrar modal al hacer clic en el overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      cerrarModal(this.id);
    }
  });
});

// Cerrar con ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      cerrarModal(m.id);
    });
  }
});

// ── MOSTRAR / OCULTAR CONTRASEÑA ──────────────────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'ri-eye-line';
  } else {
    input.type = 'password';
    icon.className = 'ri-eye-off-line';
  }
}

// ── VALIDAR CONTRASEÑAS COINCIDEN AL CREAR ────────────────
const formCrear = document.querySelector('#modalCrear form');
if (formCrear) {
  formCrear.addEventListener('submit', function(e) {
    const pass    = document.getElementById('crearPass').value;
    const confirm = document.getElementById('crearPassConfirm').value;

    if (pass !== confirm) {
      e.preventDefault();
      // Mostrar error visual
      document.getElementById('crearPassConfirm').style.borderColor = '#ff4d6d';
      document.getElementById('crearPassConfirm').style.boxShadow   = '0 0 0 3px rgba(255,77,109,0.15)';

      // Crear mensaje de error temporal
      let errMsg = document.getElementById('passErrorMsg');
      if (!errMsg) {
        errMsg = document.createElement('span');
        errMsg.id = 'passErrorMsg';
        errMsg.style.cssText = 'color:#ff4d6d;font-size:0.8rem;margin-top:4px;display:block';
        document.getElementById('crearPassConfirm').parentNode.after(errMsg);
      }
      errMsg.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    // Limpiar error si coinciden
    document.getElementById('crearPassConfirm').style.borderColor = '';
    document.getElementById('crearPassConfirm').style.boxShadow   = '';
    const errMsg = document.getElementById('passErrorMsg');
    if (errMsg) errMsg.remove();
  });
}

// ── AUTO-CERRAR FLASH MESSAGES ────────────────────────────
document.querySelectorAll('.flash').forEach(flash => {
  setTimeout(() => {
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.opacity    = '0';
    setTimeout(() => flash.remove(), 500);
  }, 4000);
});
