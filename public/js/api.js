// public/js/api.js
function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: authHeaders()
  })

  // Token expirado ou inválido → volta para o login
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login.html'
    return
  }

  return response
}
