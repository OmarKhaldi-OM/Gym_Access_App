import { apiGet } from './api.js'
import { apiDelete, apiPost, apiPut } from './api.js'

function dateOnly(value) {
  return Array.isArray(value)
    ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}`
    : value?.slice(0, 10)
}

export async function getProgress(memberId) {
  const [measurements, accessLogs, trainerBookings, classBookings] = await Promise.all([
    apiGet(`/api/progress-logs/member/${memberId}`),
    apiGet(`/api/access-logs/member/${memberId}`),
    apiGet(`/api/trainer-bookings/member/${memberId}`),
    apiGet(`/api/bookings/member/${memberId}`),
  ])
  const now = new Date()
  const attendance = accessLogs.filter((entry) => {
    const value = entry.horodatage
    const year = Array.isArray(value) ? value[0] : Number(value.slice(0, 4))
    const month = Array.isArray(value) ? value[1] - 1 : Number(value.slice(5, 7)) - 1
    return year === now.getFullYear() && month === now.getMonth() && entry.typeAcces?.toLowerCase() === 'entree'
  }).length
  return {
    weight: measurements.filter((item) => item.poids != null).map((item) => ({ id: item.id, date: dateOnly(item.dateMesure), value: item.poids })),
    classesAttended: classBookings.filter((booking) => ['completed', 'attended', 'terminee', 'termine'].includes(booking.statut?.toLowerCase())).length,
    coachingCompleted: trainerBookings.filter((item) => ['completed', 'terminee', 'termine'].includes(item.statut?.toLowerCase())).length,
    attendance,
  }
}
export function addProgressLog(memberId, measurement) {
  return apiPost('/api/progress-logs', {
    memberId,
    dateMesure: measurement.dateMesure,
    poids: Number(measurement.poids),
  })
}
export function getGoals(memberId) { return apiGet(`/api/member-goals/member/${memberId}`) }
export function addGoal(memberId, goal) {
  const payload = { ...goal, memberId, current: 0, status: 'active' }
  if (!payload.deadline) delete payload.deadline
  return apiPost(`/api/member-goals/member/${memberId}`, payload)
}
export function updateGoal(_memberId, id, changes) { return apiPut(`/api/member-goals/${id}`, changes) }
export function deleteGoal(_memberId, id) { return apiDelete(`/api/member-goals/${id}`) }
