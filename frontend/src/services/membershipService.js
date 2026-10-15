import { apiDelete, apiGet, apiPost, apiPut } from './api.js'

export function getPlans() {
  return apiGet('/api/plans')
}

export function getPlansForManagement() {
  return apiGet('/api/plans/manage')
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

export function createSubscription(plan) {
  return apiPost('/api/subscriptions/enroll', { planId: plan.id })
}