import { apiDelete, apiPut, apiUpload, authStorage } from './api.js'
import { getIdentity, toFrontendUser } from './authService.js'

function mapProfile(user) {
  return { ...user, nom: [user.prenom, user.nom].filter(Boolean).join(' '), telephone: user.telephone || '', bio: user.bio || '', photo: user.photoUrl || '' }
}

export async function getProfile() {
  return mapProfile(await getIdentity())
}

export async function updateProfile(_userId, profile, photoFile) {
  const names = profile.nom.trim().split(/\s+/)
  const prenom = names.shift()
  const nom = names.join(' ') || prenom
  const updated = await apiPut('/api/auth/me', { nom, prenom, email: profile.email.trim(), telephone: profile.telephone, bio: profile.bio })
  const token = updated.token
  authStorage.save(token, toFrontendUser(updated))
  if (photoFile) await apiUpload('/api/auth/me/photo', photoFile)
  const user = await getIdentity()
  authStorage.save(token, user)
  window.dispatchEvent(new CustomEvent('gate:identity', { detail: user }))
  return mapProfile(user)
}

export async function removeProfilePhoto() {
  await apiDelete('/api/auth/me/photo')
  const user = await getIdentity()
  authStorage.save(authStorage.getToken(), user)
  window.dispatchEvent(new CustomEvent('gate:identity', { detail: user }))
  return mapProfile(user)
}
