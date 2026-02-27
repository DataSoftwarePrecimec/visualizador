//################## VALIDACIÓN DE DATOS DE INGRESO AL SISTEMA ##################// 

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
      <td>${render_links(row.links?.NOTA)}</td>
      <td>${render_approval(!!row.links?.HC)}</td>
    `;
    table.appendChild(tr);
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
