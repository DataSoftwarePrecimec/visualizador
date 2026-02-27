let rows     = {}
let contract = []

const manual_button    = document.getElementById('manual_btn');

const reload_button   = document.getElementById('reload');
const download_button = document.getElementById('download');

const buttons = [reload_button, download_button];

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
const date_label     = document.getElementById('last_updated');
