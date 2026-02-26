//CREAR SESSION_CODE
window.initializer = async function () {
  const modal    = document.getElementById('modal_message');
  const closeBtn = document.getElementById('modal_close');
  if (modal && closeBtn) {
    closeBtn.addEventListener('click', hide_message);
    window.addEventListener('click', (event) => {
      if (event.target === modal) hide_message();
    });
  } else {
    console.error('Modal elements NOT FOUND after include');
  }
  try {
    const res = await fetch('/fetch_holidays', {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify({year: today.getFullYear(), code: 'CO'})});
    holis = await res.json();
  } catch (err) {
    console.error('Error loading holidays:', err);
  }
  try {
    const res = await fetch('/fetch_deptos', {method: 'POST',headers: {'Content-Type': 'application/json',}, body: JSON.stringify({request: true})});
    deptos = await res.json();
  } catch (err) {
    console.error('Error loading holidays:', err);
  }
  try {
    const response = await fetch('/session_code', { method: 'POST', credentials: 'include' });
    if (!response.ok) console.error('Failed to get session code');
  } catch (err) {
    console.error('Network error:', err);
  }
};

//VALIDAR PATRÓN DEL CORREO Y DESBLOQUEAR BOTÓN:
document.getElementById('email_input').addEventListener('input', function () {
  const email = this.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('send_email_btn').disabled = !isValid;
});

//VALIDAR PATRÓN DEL CÓDIGO Y DESBLOQUEAR BOTÓN
document.getElementById('code_input').addEventListener('input', function () {
  const code = this.value.trim();
  const isValid = /^\d{6}$/.test(code);
  document.getElementById('validate_code_btn').disabled = !isValid;
});

//VALIDAR CORREO EN BACKEND Y ENVIAR CÓDIGO
document.getElementById('send_email_btn').addEventListener('click', async (e) => {
  const btn = e.target;
  btn.disabled = true;
  const email = document.getElementById('email_input').value.trim().toLowerCase();
  try {
    const res = await fetch('/handle_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cmd: 'send_code', email: email }) });
    const data = await res.json();
    if (data.status === 'ok') {
      show_message('Código enviado a <br><b>' + email + '</b>.<br>Por favor revise su correo e ingrese el código en el campo correspondiente.', 'black');
      document.getElementById('code_input').disabled = false;
    } else {
      show_message('Error al enviar el código: ' + (data.message || 'desconocido'));
      btn.disabled = false;
    }
  } catch (err) {
    show_message('Error de red: ' + err.message);
    btn.disabled = false;
  }
});

//VALIDAR CÓDIGO EN BACKEND
document.getElementById('validate_code_btn').addEventListener('click', async () => {
  const email = document.getElementById('email_input').value.trim().toLowerCase();
  const code = document.getElementById('code_input').value.trim();
  const btn = document.getElementById('validate_code_btn');
  btn.disabled = true;
  try {
    const res = await fetch('/validate_code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cmd: 'validate_code', email: email, code: code }) });
    const data = await res.json();
    if (data.status === 'ok') {
      on_code_validated()
    } else {
      show_message('Código incorrecto o expirado');
      btn.disabled = false;
    }
  } catch (err) {
    console.error('Error en /validate_code:', err);
    show_message('Error de red al validar el código');
    btn.disabled = false;
  }
});

table.addEventListener('change', e => {
  const target = e.target;
  const tr = target.closest('tr');
  if (!tr) return;
  if (target.type === 'file') {
    pdf(target, tr);
    return;
  }
  if (target.classList.contains('approval-select')) {
    const rejected = target.value.startsWith('RECHAZAR');
    const grupo = tr.querySelector('.grupo');
    if (rejected) {
      grupo.disabled = false;
      grupo.dataset.manual = '1';
      fill_group(grupo);
    } else {
      reset_incons_row(tr);
    }
    return;
  }
  if (target.classList.contains('grupo')) {
    const etiqueta = tr.querySelector('.etiqueta');
    const descripcion = tr.querySelector('.descripcion');
    etiqueta.disabled = !target.value;
    descripcion.disabled = true;
    if (target.value) {
      etiqueta.dataset.manual = '1';
      fill_label(etiqueta, target.value);
    } else {
      etiqueta.innerHTML = '';
    }
    return;
  }
  if (target.classList.contains('etiqueta')) {
    const descripcion = tr.querySelector('.descripcion');
    descripcion.disabled = !target.value;
    descripcion.placeholder = "Describa el motivo del rechazo...";
    if (target.value) {
      descripcion.dataset.manual = '1';
    }
    return;
  }
});