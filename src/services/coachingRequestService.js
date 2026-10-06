import { apiGet, apiPatch, apiPost } from './api.js'
import { canAccessFeature, FEATURES, hasRole, ROLES } from '../roles.js'

function dateTime(value) {
  return Array.isArray(value)
    ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}T${String(value[3] || 0).padStart(2, '0')}:${String(value[4] || 0).padStart(2, '0')}`
    : value
}

function mapRequest(request) {
  const status = request.status?.toLowerCase()
  return {
    ...request,
    memberName: request.memberName,
    coachId: request.trainerId,
    coachName: request.trainerName,
    status: status === 'cancelled' ? 'cancelled' : status,
    requestedAt: dateTime(request.requestedAt),
    createdAt: dateTime(request.createdAt),
    updatedAt: dateTime(request.updatedAt),
  }
}

export async function getCoaches() {
  return (await apiGet('/api/trainers')).map((trainer) => ({
    ...trainer,
    nom: [trainer.prenom, trainer.nom].filter(Boolean).join(' '),
    specialty: trainer.specialite || '',
  }))
}

export async function getMemberRequests(memberId) {
  return (await apiGet(`/api/coaching-requests/member/${memberId}`)).map(mapRequest)
}

export async function getCoachRequests(trainerId) {
  return (await apiGet(`/api/coaching-requests/trainer/${trainerId}`)).map(mapRequest)
}

export async function getNotifications(userId, role) {
  const isTrainer = hasRole(role, ROLES.TRAINER)
  const feature = isTrainer ? FEATURES.HANDLE_COACH_REQUESTS : FEATURES.VIEW_MEMBER_REQUESTS
  if (!canAccessFeature(role, feature)) return []
  const requests = isTrainer ? await getCoachRequests(userId) : await getMemberRequests(userId)
  return requests.filter((request) => isTrainer
    ? request.status === 'pending'
    : ['accepted', 'rejected'].includes(request.status))
    .map((request) => ({
      id: request.id,
      type: isTrainer ? 'coaching-request' : `coaching-${request.status}`,
      memberName: request.memberName,
      coachName: request.coachName,
      createdAt: request.updatedAt || request.createdAt,
      read: false,
    }))
}

export async function createRequest(details) {
  return mapRequest(await apiPost('/api/coaching-requests', {
    memberId: details.memberId,
    trainerId: details.coachId,
    requestedAt: details.requestedAt,
    goal: details.goal,
  }))
}

export async function updateRequestStatus(id, status, response = '') {
  return mapRequest(await apiPatch(`/api/coaching-requests/${id}/status`, { status: status.toUpperCase(), response }))
}