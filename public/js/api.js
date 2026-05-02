function tokenValido() {
  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    localStorage.removeItem('token')
    return false
  }
}

// Para páginas autenticadas (painel, perfil, etc.)
function requireAuth() {
  if (!tokenValido()) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}

// Para páginas públicas (login, cadastro, index)
function requireGuest() {
  if (tokenValido()) {
    window.location.href = '/painel'
  }
}

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

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  return response
}
