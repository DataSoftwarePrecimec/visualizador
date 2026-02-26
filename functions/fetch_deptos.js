export async function onRequestPost(context) {
  try {
    const deptos = {};
    const body   = await context.request.json();
    const URL = "https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.min.json";
    const response = await fetch(URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const status = response.status;
    const res    = await response.json();
    res.forEach(item => {
      deptos[item.departamento] = item.ciudades;
    });
    return new Response(JSON.stringify(deptos), {
      status: status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Worker error', details: err.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
