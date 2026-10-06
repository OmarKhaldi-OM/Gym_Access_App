const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const TOKEN_KEY = 'gate.token'
const USER_KEY = 'gate.user'

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('gate:unauthorized'))
}

export async function apiRequest(path, options = {}) {
  const { responseType, ...requestOptions } = options
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(requestOptions.headers || {})
  if (requestOptions.body && !(requestOptions.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers })
  } catch {
    const error = new Error('Le serveur est injoignable. Verifiez que le serveur est demarre puis reessayez.')
    window.dispatchEvent(new CustomEvent('gate:api-error', { detail: error.message }))
    throw error
  }

  if (response.status === 401) clearSession()
  if (response.status === 204) return null
  if (responseType === 'blob' && response.ok) return response.blob()

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const message = response.status === 401
      ? path === '/api/auth/login'
        ? 'Adresse e-mail ou mot de passe incorrect.'
        : 'Votre session a expiré. Connectez-vous à nouveau.'
      : response.status === 403
        ? 'Vous n’avez pas les droits pour effectuer cette action.'
        : body?.message || `La requete a echoue (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    window.dispatchEvent(new CustomEvent('gate:api-error', { detail: message }))
    throw error
  }
  return body
}

export function apiGet(path) {
  return apiRequest(path)
}

export function apiGetBlob(path) {
  return apiRequest(path, { responseType: 'blob' })
}

export function apiUpload(path, file) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest(path, { method: 'PUT', body })
}

export function apiPost(path, body) {
  return apiRequest(path, { method: 'POST', body: JSON.stringify(body) })
}

export function apiPut(path, body) {
  return apiRequest(path, { method: 'PUT', body: JSON.stringify(body) })
}

export function apiPatch(path, body) {
  return apiRequest(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) })
}

export function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' })
}

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: clearSession,
}