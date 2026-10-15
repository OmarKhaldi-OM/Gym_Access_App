import { apiDelete, apiGet, apiPost } from './api.js'

function fullName(member) {
  return [member.prenom, member.nom].filter(Boolean).join(' ')
}

function dateOnly(value) {
  return Array.isArray(value)
    ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}`
    : value?.slice(0, 10)
}

function dateTime(value) {
  if (!Array.isArray(value)) return value
  const [year, month, day, hour = 0, minute = 0, second = 0] = value
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

function mapSubscription(subscription) {
  if (!subscription) return null
  return { ...subscription, dateDebut: dateOnly(subscription.dateDebut), dateFin: dateOnly(subscription.dateFin) }
}

function mapMember(member, subscription = null) {
  subscription = mapSubscription(subscription)
  return {
    ...member,
    nom: fullName(member),
    plan: subscription?.planNom || '—',
    dateInscription: dateTime(member.dateInscription),
    statut: subscription?.statut?.toUpperCase() === 'ACTIVE' ? 'Actif' : 'Inactif',
    visageEnrole: member.visageEnrole,
    subscription,
  }
}

export async function getMembers() {
  const [members, subscriptions] = await Promise.all([
    apiGet('/api/members'),
    apiGet('/api/subscriptions'),
  ])
  const latestByMember = new Map()
  subscriptions.map(mapSubscription).forEach((subscription) => {
    const previous = latestByMember.get(subscription.memberId)
    if (!previous || subscription.dateDebut > previous.dateDebut) latestByMember.set(subscription.memberId, subscription)
  })
  return members.map((member) => mapMember(member, latestByMember.get(member.id)))
}

export async function getMemberById(id) {
  const [member, subscriptions] = await Promise.all([
    apiGet(`/api/members/${id}`),
    apiGet(`/api/subscriptions/member/${id}`),
  ])
  const subscription = subscriptions.map(mapSubscription).sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))[0]
  return mapMember(member, subscription)
}

export async function addMember(member) {
  return apiPost('/api/members', {
    nom: member.nom,
    prenom: member.prenom,
    email: member.email,
    motDePasse: member.password,
    dateNaissance: member.dateNaissance,
  })
}

export function deleteMember(id) {
  return apiDelete(`/api/members/${id}`)
}

export async function searchMembers(query) {
  const members = await getMembers()
  const normalized = query.trim().toLowerCase()
  return normalized ? members.filter((member) => member.nom.toLowerCase().includes(normalized)) : members
}

export async function getPendingEnrollments(membersList) {
  const members = membersList || await getMembers()
  return members.filter((member) => !member.visageEnrole).map((member) => ({
    id: member.id,
    nom: member.nom,
    daysSince: Math.max(0, Math.floor((Date.now() - new Date(member.dateInscription).getTime()) / 86400000)),
  }))
}
