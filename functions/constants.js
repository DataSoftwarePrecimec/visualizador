export const URL = 'https://script.google.com/macros/s/AKfycbzYWCeUbrcGwVUB6c1nVPVqScL16Lt01wM7jCj_p3Sq9nLjDX3lS_lCaHjrL0rLadO12g/exec';

export function get_session_code(request, cookieName) {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=')
    if (name === cookieName) {
      return rest.join('=')
    }
  }
  return null
}
