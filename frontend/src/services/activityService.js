import { apiGet } from './api.js'

function mapLog(log) {
  const value = log.horodatage
  const timestamp = Array.isArray(value)
    ? { date: value.slice(0, 3).map((part) => String(part).padStart(2, '0')).join('-'), time: value.slice(3, 5).map((part) => String(part).padStart(2, '0')).join(':') }
    : { date: value?.slice(0, 10), time: value?.slice(11, 16) }
  const accessType = log.typeAcces?.toLowerCase()
  return {
    ...log,
    membreId: log.memberId,
    membreNom: log.memberNom,
    memberArchived: log.memberArchived,
    date: timestamp.date,
    heure: timestamp.time,
    type: log.resultat?.toLowerCase() === 'refuse' ? 'refuse' : accessType === 'sortie' ? 'sortie' : 'entree',
  }
}

export async function getActivityLog() {
  return (await apiGet('/api/access-logs')).map(mapLog).sort((a, b) => `${b.date}${b.heure}`.localeCompare(`${a.date}${a.heure}`))
}

export async function getMemberActivity(memberId) {
  return (await apiGet(`/api/access-logs/member/${memberId}`)).map(mapLog).sort((a, b) => `${b.date}${b.heure}`.localeCompare(`${a.date}${a.heure}`))
}