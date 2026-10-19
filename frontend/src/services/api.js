import { getApiErrorInfo } from './apiErrors.js'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'gate.token'
const USER_KEY = 'gate.user'

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('gate:unauthorized'))
}

async function parseResponse(response) {
  if (response.status === 204 || response.status === 205) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    const text = await response.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
  return response.text()
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
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    const info = getApiErrorInfo(null, path, null, { network: true })
    const error = new Error(info.message)
    error.category = info.category
    error.title = info.title
    error.cause = cause
    throw error
  }

  if (response.status === 401) clearSession()
  if (response.status === 204 || response.status === 205) return null
  if (responseType === 'blob' && response.ok) return response.blob()

  const body = await parseResponse(response)
  if (!response.ok) {
    const info = getApiErrorInfo(response.status, path, body)
    const error = new Error(info.message)
    error.status = response.status
    error.category = info.category
    error.title = info.title
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
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  },
  clearUser: () => localStorage.removeItem(USER_KEY),
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: clearSession,
}