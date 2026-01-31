'use server'

export async function logout() {
  // Clear client-side storage - this will be called from client component
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    window.location.href = '/'
  }
}
