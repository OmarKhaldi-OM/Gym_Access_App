import { users } from '../mocks/users.js'

// Plus tard : POST /auth/login  { email, motDePasse } -> { token, ...user }
export async function login(role) {
  const user = users.find((u) => u.role === role)
  return Promise.resolve(user ? { ...user } : null)
}

export async function logout() {
  return Promise.resolve(true)
}
