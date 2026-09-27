import { members as initialMembers } from '../mocks/members.js'

const STORAGE_KEY = 'gate.members'

function loadMembers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [...initialMembers]
  } catch {
    return [...initialMembers]
  }
}

// État en mémoire — représente ce qui viendrait de GET /api/members.
let members = loadMembers()

function saveMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
}

function daysAgoLabel(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  if (days === 0) return "Inscrit aujourd'hui"
  if (days === 1) return 'Inscrit il y a 1 jour'
  return `Inscrit il y a ${days} jours`
}

// Plus tard : GET /api/members
export async function getMembers() {
  return Promise.resolve([...members])
}

// Plus tard : GET /api/members/{id}
export async function getMemberById(id) {
  return Promise.resolve(members.find((m) => m.id === id) ?? null)
}

export async function addMember(member) {
  members = [...members, member]
  saveMembers()
  return Promise.resolve(member)
}

// Plus tard : GET /api/members?search=...
export async function searchMembers(query) {
  const q = query.trim().toLowerCase()
  if (!q) return Promise.resolve([...members])
  return Promise.resolve(members.filter((m) => m.nom.toLowerCase().includes(q)))
}

// Dérivé des membres dont visageEnrole === false
// Plus tard : GET /api/face-embeddings/pending (ou équivalent)
export async function getPendingEnrollments() {
  return Promise.resolve(
    members
      .filter((m) => !m.visageEnrole)
      .map((m) => ({ id: m.id, nom: m.nom, since: daysAgoLabel(m.dateInscription) })),
  )
}

// Plus tard : POST /api/face-embeddings (avec les photos)
export async function enrollMember(id) {
  members = members.map((m) => (m.id === id ? { ...m, visageEnrole: true } : m))
  saveMembers()
  return Promise.resolve(members.find((m) => m.id === id) ?? null)
}
