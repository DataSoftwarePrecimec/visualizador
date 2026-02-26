export const URL = 'https://script.google.com/macros/s/AKfycbyhrBhvF_lhsYXb7ELGsLP4H1hMoILvYnBXKdTFg0xrkPGMl8Rm0r6YEwZ1QZ0uDxRR4A/exec';

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
