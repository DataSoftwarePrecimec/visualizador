export async function onRequestPost(context) {
  const sessionCode = crypto.randomUUID();
  const headers     = new Headers();
  headers.set('Set-Cookie',`session_code=${sessionCode}; HttpOnly; Secure; Path=/; SameSite=Strict`);
  return new Response(null, { status: 204, headers });
}
