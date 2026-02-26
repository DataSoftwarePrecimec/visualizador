//################## VALIDACIÓN DE DATOS DE INGRESO AL SISTEMA ##################// 

//ENVIAR DATOS
async function submit_form(){
  const valid_rows = get_valid_rows()
  if (valid_rows.length) {
    try {
      const payload = await get_payload(valid_rows);
      disable_buttons(true);
      toggle_table(true);
      const code   = code_field.value.trim();
      const email  = email_field.value.trim().toLowerCase();
      const fields = {cmd: 'save_data', code: code, email: email, payload: payload, contract: contract};
      const res    = await fetch("/handle_data", {method: "POST", headers: {"Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const data   = await res.json();
      if (data.saved) {
        show_message(success_message, 'green')
        rows = data.data.rows;
        fill_rows()
      } else {
        show_message("El servidor no devolvió un PDF válido.");
      }
    } catch (err) {
      console.error("Download error:", err);
      show_message("Error descargando el informe.");
    } finally {
      disable_buttons(false)
      toggle_table(false)
    }
  }
}

async function get_payload(trs) {
  return Promise.all(
    trs.map(async tr => {
      let nota = '';
      if (tr._pdfFile instanceof File) {
        try {
          nota = await base_64(tr._pdfFile);
        } catch (e) {
          nota = '';
        }
      }
      const etiquetaSelect = tr.children[10]?.querySelector('select');
      const selectedOption = etiquetaSelect?.selectedOptions?.[0];
      const category       = selectedOption?.dataset?.category;
      return {
        nota:        nota,
        order:       tr.children[0]?.textContent.trim() || '',
        names:       tr.children[2]?.textContent.trim() || '',
        aprobacion:  tr.children[8]?.querySelector('select')?.value || '',
        grupo:       tr.children[9]?.querySelector('select')?.value || '',
        etiqueta:    etiquetaSelect?.value || '',
        responsable: category || tr.children[1]?.textContent.trim() || '',
        descripcion: tr.children[11]?.querySelector('textarea')?.value.trim() || ''
      };
    })
  );
}

//DESPUES DE VALIDAR EL CODIGO ENVIADO AL CORREO ELECTRÓNICO
async function on_code_validated() {
  try {
    email_field.disabled       = true
    code_field.disabled        = true
    loader_text.textContent    = 'Descargando datos...';
    loader_wheel.style.display = 'block';
    const email                = email_field.value.trim().toLowerCase();
    const code                 = code_field.value.trim();
    const res                  = await fetch('/handle_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({cmd: 'get_data', email: email, code: code}) });
    const data                 = await res.json();
    if (data.status === 'ok') {
      incons                     = data.data.incons;
      rows                       = data.data.rows;
      contract                   = data.contract;
      validator.style.display    = 'none';
      loader_wheel.style.display = 'none';
      main_div.style.display     = 'block';
      ips_title.textContent      = contract[1].toUpperCase()
      contract_title.textContent = contract[2].toUpperCase()
      fill_rows()
    } else {
      show_message('Error al validar el código: ' + (data.message || 'desconocido'));
    }
  } catch (err) {
    show_message('Error de red: ' + err.message);
  }
}

function reset_incons_row(tr) {
  const fields = tr.querySelectorAll('.grupo, .etiqueta, .descripcion');
  fields.forEach(el => {
    el.disabled = true;
    delete el.dataset.manual;
    if (el.tagName === 'SELECT') {
      el.innerHTML = '';
    } else if (el.tagName === 'TEXTAREA') {
      el.value = '';
      el.placeholder = '';
    }
  });
}

function render_links(linksObj) {
  if (!linksObj || Object.keys(linksObj).length === 0) return '';
  return Object.entries(linksObj).map(([label, url]) =>`<a href="${url}" target="_blank" rel="noopener">${label}</a>`).join('<br>');
}

function render_note(links) {
  const noteObj = links?.NOTA_ACLARATORIA;
  if (noteObj && Object.keys(noteObj).length > 0) {
    const [label, url] = Object.entries(noteObj)[0];
    return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
  }
  return `<label class="upload_btn"><span class="upload_text">SUBIR ARCHIVO</span><input type="file" accept="application/pdf" hidden></label>`;
}

function render_hc(links) {
  const noteObj = links?.HC;
  if (noteObj && Object.keys(noteObj).length > 0) {
    const [label, url] = Object.entries(noteObj)[0];
    return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
  }
  return `<label class="upload_btn"><span class="upload_text">SUBIR ARCHIVO</span><input type="file" accept="application/pdf" hidden></label>`;
}

function fill_rows() {
  table.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.order || ''}</td>
      <td>${row.state || ''}</td>
      <td>${row.name || ''}</td>
      <td>${row.surgery || ''}</td>
      <td>${render_links(row.links?.PROFORMA)}</td>
      <td>${render_links(row.links?.GASTO_QUIRURGICO)}</td>
      <td>${render_links(row.links?.FACTURA)}</td>
      <td>${render_hc(row.links)}</td>
      <td>${render_note(row.links)}</td>
      <td>${render_approval(!!row.links?.FACTURA)}</td>
      <td><select class="grupo" disabled></select></td>
      <td><select class="etiqueta" disabled></select></td>
      <td><textarea class="descripcion" disabled></textarea></td>
      <td><textarea class="anotacion"></textarea></td>
      <td><button class="modificar-btn" disabled>MODIFICAR</button></td>
    `;
    table.appendChild(tr);
  });
}

function is_row_valid(tr) {
  const approval    = tr.querySelector('.approval-select')?.value || null;
  const hasPdf      = !!tr._pdfFile;
  const grupo       = tr.querySelector('.grupo')?.value || null;
  const etiqueta    = tr.querySelector('.etiqueta')?.value || null;
  const descripcion = tr.querySelector('.descripcion')?.value.trim() || null;
  const hasIncons = grupo && etiqueta && descripcion ? 'T' : grupo || etiqueta || descripcion ? 'F' :'N';
  if (!approval) {
    return hasPdf;
  }
  if (approval.startsWith('APROBAR')) {
    return true;
  }
  if (approval.startsWith('RECHAZAR')) {
    return hasIncons === 'T';
  }
  return false;
}

function get_valid_rows() {
  return [...document.querySelectorAll('#dataTable tr')]
    .filter(is_row_valid);
}

function toggle_table(disable) {
  table.querySelectorAll('select, textarea, button, input[type="file"]').forEach(el => {
    if (disable) {
      el.disabled = true;
    } else {
      el.disabled = el.dataset.manual !== '1';
    }
  });
  table.querySelectorAll('label.upload_btn').forEach(label => {label.classList.toggle('disabled', disable);});
}

function fill_group(selector) {
  selector.innerHTML = '<option value="" selected disabled>Seleccione un grupo</option>';
  Object.keys(incons).forEach(key => {selector.insertAdjacentHTML('beforeend',`<option value="${key}">${key}</option>`);});
}

function fill_label(selector, group) {
  const wasDisabled    = selector.disabled;
  const lockedByToggle = selector.dataset.lockedByToggle === '1';
  selector.innerHTML   = '<option value="" selected disabled>Seleccione una etiqueta</option>';
  (incons[group] || []).forEach(([label, category]) => {
    selector.insertAdjacentHTML('beforeend',`<option value="${label}" data-category="${category}">${label}</option>`);
  });
  selector.disabled = wasDisabled || lockedByToggle;
}

function render_approval(invoiced) {
  const options = invoiced
    ? `
      <option value="" selected disabled>Seleccione una opción</option>
      <option value="APROBAR FACTURA">APROBAR FACTURA</option>
      <option value="RECHAZAR FACTURA">RECHAZAR FACTURA</option>
    `
    : `
      <option value="" selected disabled>Seleccione una opción</option>
      <option value="APROBAR PROFORMA">APROBAR PROFORMA</option>
      <option value="RECHAZAR PROFORMA">RECHAZAR PROFORMA</option>
    `;
  return `
    <select class="approval-select" data-manual="1">
      ${options}
    </select>
  `;
}

function pdf(input, tr) {
  const file = input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    alert('Solo se permiten archivos PDF');
    input.value = '';
    return;
  }
  const label = input.closest('.upload_btn');
  const text  = label.querySelector('.upload_text');
  text.textContent = 'NOTA SUBIDA';
  label.classList.add('uploaded');
  tr.dataset.noteReady = '1';
  tr._pdfFile = file;
  input.value = '';
}

function base_64(file) {
  return new Promise(res => {
    if (!file) return res(null);
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function reload_rows(){
  const confirmed = await open_confirm_modal(reload_message);
  if (confirmed) {
     main_div.style.display    = 'none';
    loader_wheel.style.display = 'none';
    on_code_validated()
  }
}

function disable_buttons(disable){
  buttons.forEach(btn => btn.disabled = disable);
}

async function download_report(){
  const confirmed = await open_confirm_modal(download_message);
  if (confirmed) {
    try {
      disable_buttons(true)
      toggle_table(true)
      const code = code_field.value.trim();
      const email = email_field.value.trim().toLowerCase();
      const res  = await fetch("/handle_data", {method: "POST", headers: {"Content-Type": "application/json" }, body: JSON.stringify({cmd: 'download_report', code: code, email: email}) });
      const data = await res.json();
      if (data && data.filedata) {
        const byteChars   = atob(data.filedata);
        const byteNumbers = Array.from(byteChars, c => c.charCodeAt(0));
        const byteArray   = new Uint8Array(byteNumbers);
        const blob        = new Blob([byteArray], { type: "application/pdf" });
        const link        = document.createElement("a");
        link.href         = URL.createObjectURL(blob);
        link.download     = data.filename;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        show_message("El servidor no devolvió un PDF válido.");
      }
    } catch (err) {
      console.error("Download error:", err);
      show_message("Error descargando el informe.");
    } finally {
      disable_buttons(false)
      toggle_table(false)
    }
  }
}

function open_confirm_modal(message) {
  return new Promise(resolve => {
    confirm_text.innerHTML = message;
    confirm_modal.style.display = 'block';
    const cleanup = result => {
      confirm_modal.style.display = 'none';
      confirm_accept.onclick = confirm_cancel.onclick = null;
      resolve(result);
    };
    confirm_accept.onclick = () => cleanup(true);
    confirm_cancel.onclick = () => cleanup(false);
  });
}

//################## UTILIDADES ##################// 
//FORMATEAR FECHA A DIA/MES/AÑO
function format_date(date_str) {
  if (!date_str) return ''; 
  const date = new Date(date_str); 
  if (isNaN(date)) return date_str;
  const day   = String(date.getDate()).padStart(2, '0'); 
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year  = date.getFullYear(); 
  return `${day}/${month}/${year}`;
}

//FORMATEAR FECHA A AÑO-MES-DÍA
function format_date_line(date){
  date       = new Date(date)
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

//FORMATEAR FECHA A HORA:MINUTO
function format_time(date) {
  date = new Date(date);
  const hours   = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

//FORMATEAR NOMBRE A: PRIMER_NOMBRE SEGUNDO_NOMBRE PRIMER_APELLIDO SEGUNDO APELLLIDO
function format_name(first, last) {
  const full = `${(first || '').trim()} ${(last || '').trim()}`.trim();
  return full.toLowerCase().split(' ').filter(word => word.length > 0).map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

//MODALS
//ABRIR CUALQUIER MODAL
function open_modal(id) {
  close_all_modals();
  const modal = document.getElementById(id);
  if (!modal){
    return;
  };
  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

//CERRAR CUALQUIER MODAL
function close_modal(id) {
  const modal = document.getElementById(id);
  if (!modal) {
    return;
  }
  modal.classList.remove("show");
  if (!document.querySelector(".modal.show")) {
    document.body.classList.remove("modal-open");
  }
}

//CERRAR TODOS LOS MODALES
function close_all_modals() {
  document.querySelectorAll(".modal.show").forEach(m => {
    m.classList.remove("show");
  });
  document.body.classList.remove("modal-open");
}

//MODAL DE MENSAJE
//MOSTRAR MENSAJE MODAL
function show_message(msg, color = 'red') {
  modal_text.innerHTML   = msg;
  modal_text.style.color = color;
  open_modal("modal_message");
}

//OCULTAR MENSAJE MODAL
function hide_message() {
  close_modal("modal_message");
}

//OBTENER VALOR DEL CAMPO
function get_value(id) {
  return document.getElementById(id)?.value.trim() || '';
}
