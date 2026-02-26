export async function onRequestPost(context) {
  try {
    const holidays = {};
    const body     = await context.request.json();
    let status     = '';
    for (const year of [body.year, body.year + 1]) {
      const URL      = get_url(body.code, year);
      const response = await fetch(URL, {method: 'GET',headers: {'Content-Type': 'application/json'}});
      status         = response.status;
      const res      = await response.json();
      for (const x of res){
        console.log(format_date(x.date));
      }
      res.forEach(h => {holidays[format_date(h.date)] = true});
    }
    return new Response(JSON.stringify(holidays), {status: status, headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}});
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Worker error', details: err.message }), {status: 500, headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}});
  }
}

function get_url(code, year) {
  return `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`;
}

function format_date(date){
  const parts = date.split('-')
  parts.reverse()
  return parts.join('/')
}

