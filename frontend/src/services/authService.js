import { apiGet, apiGetBlob, apiPost, authStorage } from './api.js'
import { normalizeRole } from '../roles.js'

export function toFrontendUser(user) {
  return {
    ...user,
    displayName: [user.prenom, user.nom].filter(Boolean).join(' '),
    role: normalizeRole(user.role),
  }
}

async function authenticate(path, payload) {
  const result = await apiPost(path, payload)
  authStorage.save(result.token, { email: result.email, role: result.role })
  try {
    const user = await getIdentity()
    authStorage.save(result.token, user)
    return user
  } catch (error) {
    authStorage.clear()
    throw error
  }
}

export function getCurrentUser() {
  return authStorage.getUser()
}

export async function login() {
  throw new Error('Connectez-vous avec votre adresse email et votre mot de passe.')
}

export async function signIn({ email, password }) {
  return authenticate('/api/auth/login', { email: email.trim().toLowerCase(), motDePasse: password })
}

export async function signInWithFace(imageBase64) {
  return authenticate('/api/auth/face-login', { imageBase64 })
}

export async function signInWithGoogle(credential) {
  return authenticate('/api/auth/google', { credential })
}

export async function linkGoogleAccount(credential) {
  return apiPost('/api/auth/google/link', { credential })
}

export async function getGoogleLinkStatus() {
  return apiGet('/api/auth/google/link/status')
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
