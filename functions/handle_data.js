import { URL, get_session_code } from './constants.js';

export async function onRequestPost(context) {
  try {
    const body        = await context.request.json();
    body.session_code = get_session_code(context.request, 'session_code');
    console.log(body);
    const response    = await fetch(URL,{method: 'POST',headers: { 'Content-Type': 'application/json' },body: JSON.stringify(body),});
    const res         = await response.json();
    for (const key in res){
      console.log(key);
      console.log(res[key]);
    }
    return new Response(JSON.stringify(res), {status: response.status,headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*',},});
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Worker error', details: err.message }),{status: 500,headers: { 'Content-Type': 'application/json','Access-Control-Allow-Origin': '*',},});
  }
}
