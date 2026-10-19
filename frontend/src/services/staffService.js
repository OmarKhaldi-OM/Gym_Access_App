import { apiDelete, apiGet, apiPost, apiPut } from './api.js'

const endpointByRole = {
  RECEPTIONIST: '/api/staff',
  TRAINER: '/api/trainers',
}

export async function getStaffAccounts() {
  return apiGet('/api/staff')
}

export function getStaffAccount(id) {
  return apiGet(`/api/staff/${encodeURIComponent(id)}`)
}

export function createStaffAccount(account) {
  const { role, ...details } = account
  const endpoint = endpointByRole[role]
  if (!endpoint) throw new Error('Unsupported staff role')
  return apiPost(endpoint, {
    ...details,
    ...(role === 'RECEPTIONIST' ? { role } : {}),
  })
}

export function updateStaffAccount(account) {
  const endpoint = endpointByRole[account.role]
  if (!endpoint) throw new Error('Unsupported staff role')
  const { id, role, ...details } = account
  return apiPut(`${endpoint}/${id}`, details)
}

export function deleteStaffAccount(account) {
  const endpoint = endpointByRole[account.role]
  if (!endpoint) throw new Error('Unsupported staff role')
  return apiDelete(`${endpoint}/${account.id}`)
}

export function resetStaffPassword(id, newPassword) {
  return apiPut(`/api/staff/${encodeURIComponent(id)}/password`, { newPassword })
}
