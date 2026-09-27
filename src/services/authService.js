import { users } from '../mocks/users.js'
import { addMember } from './memberService.js'

const ACCOUNT_KEY = 'gate.accounts'
const SESSION_KEY = 'gate.user'

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '[]')
  } catch {
    return []
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { ...user }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

// Plus tard : POST /auth/login  { email, motDePasse } -> { token, ...user }
export async function login(role) {
  const user = users.find((u) => u.role === role)
  return Promise.resolve(user ? saveSession(user) : null)
}

export async function signIn({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = getAccounts().find((entry) => entry.email === normalizedEmail)
  if (!account || account.passwordHash !== (await hashPassword(password))) {
    throw new Error('Adresse e-mail ou mot de passe incorrect.')
  }
  return saveSession(account.user)
}

export async function signUp({ name, email, password, plan, billing }) {
  const normalizedEmail = email.trim().toLowerCase()
  const exists = users.some((entry) => entry.email.toLowerCase() === normalizedEmail)
    || getAccounts().some((entry) => entry.email === normalizedEmail)
  if (exists) throw new Error('Cette adresse e-mail est déjà utilisée.')

  const memberId = `mem-${crypto.randomUUID()}`
  const user = {
    id: `user-${crypto.randomUUID()}`,
    nom: name.trim(),
    email: normalizedEmail,
    role: 'membre',
    memberId,
    subscription: { plan, billing, startedAt: new Date().toISOString() },
  }
  const member = {
    id: memberId,
    nom: user.nom,
    email: user.email,
    plan,
    statut: 'Actif',
    dateInscription: new Date().toISOString().slice(0, 10),
    visageEnrole: false,
  }
  await addMember(member)
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify([
    ...getAccounts(),
    { email: normalizedEmail, passwordHash: await hashPassword(password), user },
  ]))
  return saveSession(user)
}

export async function logout() {
  localStorage.removeItem(SESSION_KEY)
  return Promise.resolve(true)
}
