import { apiGet, apiPost } from './api.js'

export function getPlans() {
  return apiGet('/api/plans')
}

export async function getMemberSubscription(memberId) {
  const subscriptions = await apiGet(`/api/subscriptions/member/${memberId}`)
  return subscriptions.sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))[0] || null
}

export async function createSubscription(memberId, plan) {
  const dateDebut = new Date()
  const dateFin = new Date(dateDebut)
  dateFin.setDate(dateFin.getDate() + plan.dureeJours)
  const format = (date) => date.toISOString().slice(0, 10)
  return apiPost('/api/subscriptions', {
    memberId,
    planId: plan.id,
    dateDebut: format(dateDebut),
    dateFin: format(dateFin),
    statut: 'ACTIVE',
  })
}