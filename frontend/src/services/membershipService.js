import { apiDelete, apiGet, apiPost, apiPut } from './api.js'

export function getPlans() {
  return apiGet('/api/plans')
}

export function createPlan(plan) {
  return apiPost('/api/plans', plan)
}

export function updatePlan(planId, plan) {
  return apiPut(`/api/plans/${planId}`, plan)
}

export function deletePlan(planId) {
  return apiDelete(`/api/plans/${planId}`)
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