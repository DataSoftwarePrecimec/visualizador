let incons   = {}
let rows     = {}
let contract = []

const today            = new Date();
const manual_button    = document.getElementById('manual_btn');
const download_message = '<p><strong>¿Está seguro que desea descargar el informe?</strong></p><p style="text-align:left;"><strong>Nota:</strong> El informe se actualiza cada 10 minutos.Si desea ver los cambios aquí realizados, se recomienda esperar.</p>'
const reload_message   = '<p><strong>¿Está seguro que desea recargar el la tabla?</strong></p><p><strong>Nota:</strong> Perderá todos los cambios que haya realizado y no haya guardado.</p>';
const success_message  = '<p><strong>Los datos se han guardado con éxito</p>';

const reload_button   = document.getElementById('reload');
const send_button     = document.getElementById('submit');
const download_button = document.getElementById('download');

const buttons = [reload_button, send_button, download_button];

const code_field  = document.getElementById('code_input');
const email_field = document.getElementById('email_input');

const loader_text  = document.getElementById('loading_text')
const loader_wheel = document.getElementById('loading')

const main_div = document.getElementById('main');

const table = document.getElementById('dataTable')

const modal_text = document.getElementById('modal_text');

const confirm_modal  = document.getElementById('confirm_modal');
const confirm_text   = document.getElementById('confirm_text');
const confirm_accept = document.getElementById('confirm_accept');
const confirm_cancel = document.getElementById('confirm_cancel');

const validator      = document.getElementById('validator');
const ips_title      = document.getElementById('ips');
const contract_title = document.getElementById('contract');
