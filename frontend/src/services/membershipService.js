import { apiGet, apiPost } from './api.js'

export function getPlans() {
  return apiGet('/api/plans')
}

export function getMemberSubscriptions(memberId) {
  return apiGet(`/api/subscriptions/member/${memberId}`)
}

export async function getMemberSubscription(memberId) {
  const subscriptions = await getMemberSubscriptions(memberId)
  return [...subscriptions].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))[0] || null
}

export async function createSubscription(memberId, plan) {
  const dateDebut = new Date()
  const dateFin = new Date(dateDebut)
  dateFin.setDate(dateFin.getDate() + plan.dureeJours)
  const format = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return apiPost('/api/subscriptions', {
    memberId,
    planId: plan.id,
    dateDebut: format(dateDebut),
    dateFin: format(dateFin),
    statut: 'ACTIVE',
  })
}