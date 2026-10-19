import { apiDelete, apiGet, apiPost, apiPut } from './api.js'

export function getCoachNotes(memberId) {
  return apiGet(`/api/coach-notes/member/${memberId}`)
}

export function createCoachNote(memberId, contenu) {
  return apiPost(`/api/coach-notes/member/${memberId}`, { contenu })
}

export function updateCoachNote(id, contenu) {
  return apiPut(`/api/coach-notes/${id}`, { contenu })
}

export function deleteCoachNote(id) {
  return apiDelete(`/api/coach-notes/${id}`)
}
