import { URL, get_session_code } from './constants.js';

export async function onRequest(context) {
  try {
    const body         = await context.request.json();
    const session_code = get_session_code(context.request, 'session_code');
    if (!body.email || !body.code) {
      return new Response(JSON.stringify({status: 'error',message: 'Falta el correo o el código'}),{ status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!session_code) {
      return new Response(JSON.stringify({status: 'error',message: 'Sin código de sesión. Llamaste primero a /send_code?'}),{ status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    body.session_code  = session_code;
    const response     = await fetch(URL, {method: 'POST',headers: { 'Content-Type': 'application/json' },body:  JSON.stringify(body)});
    const data         = await response.json();
    if (data.valid === true) {
      return new Response(JSON.stringify({ status: 'ok' }), {status: 200,headers: { 'Content-Type': 'application/json' }});
    } else {
      return new Response(JSON.stringify({status: 'error',message: 'Código incorrecto o expirado'}),{ status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({status: 'error',message: 'Failed to validate code',details: err.message}),{ status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
