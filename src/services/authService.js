import { apiGet, apiGetBlob, apiPost, authStorage } from './api.js'

const USER_KEY = 'gate.user'

export function toFrontendUser(user) {
  const roles = { MEMBER: 'membre', TRAINER: 'coach', RECEPTIONIST: 'reception', ADMIN: 'admin' }
  return {
    ...user,
    displayName: [user.prenom, user.nom].filter(Boolean).join(' '),
    role: roles[user.role] || user.role?.toLowerCase(),
  }
}

async function authenticate(path, payload) {
  const result = await apiPost(path, payload)
  authStorage.save(result.token, { email: result.email, role: result.role })
  const user = await getIdentity()
  authStorage.save(result.token, user)
  return user
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export async function login() {
  throw new Error('Connectez-vous avec votre adresse email et votre mot de passe.')
}

export async function signIn({ email, password }) {
  return authenticate('/api/auth/login', { email: email.trim().toLowerCase(), motDePasse: password })
}

export async function signUp({ name, email, password }) {
  const names = name.trim().split(/\s+/)
  const prenom = names.shift()
  const nom = names.join(' ') || prenom
  return authenticate('/api/auth/register', {
    nom,
    prenom,
    email: email.trim().toLowerCase(),
    motDePasse: password,
  })
}

export async function logout() {
  authStorage.clear()
  return true
}

export async function getIdentity() {
  const identity = await apiGet('/api/auth/me')
  const user = toFrontendUser(identity)
  user.photoUrl = identity.hasProfilePhoto
    ? URL.createObjectURL(await apiGetBlob('/api/auth/me/photo'))
    : ''
  return user
}
