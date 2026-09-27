import { classes as initialClasses } from '../mocks/classes.js'
import { personalSessions as initialPersonalSessions } from '../mocks/personalSessions.js'
import { myBookings as initialMyBookings } from '../mocks/myBookings.js'

// État en mémoire — représenterait GET /api/schedules, GET /api/trainer-bookings, etc.
let classes = [...initialClasses]
let personalSessions = [...initialPersonalSessions]
let myBookings = [...initialMyBookings]

// Plus tard : GET /api/schedules
export async function getClasses() {
  return Promise.resolve([...classes])
}

export async function addClass(classDetails) {
  const newClass = { id: `${classDetails.jour}-${classDetails.heureDebut.replace(':', '')}-${Date.now()}`, ...classDetails }
  classes = [...classes, newClass]
  return Promise.resolve({ ...newClass })
}

export async function updateClass(id, classDetails) {
  classes = classes.map((item) => (item.id === id ? { ...item, ...classDetails, id } : item))
  return Promise.resolve(classes.find((item) => item.id === id) ?? null)
}

export async function deleteClass(id) {
  const deleted = classes.find((item) => item.id === id) ?? null
  classes = classes.filter((item) => item.id !== id)
  myBookings = myBookings.filter((booking) => booking.classeId !== id)
  return Promise.resolve(deleted)
}

// Plus tard : GET /api/schedules/trainer/{trainerId}
export async function getPersonalSessions() {
  return Promise.resolve([...personalSessions])
}

// Plus tard : GET /api/bookings/member/{memberId}
export async function getMyBookings(memberId) {
  return Promise.resolve(
    myBookings
      .filter((b) => b.membreId === memberId)
      .map((b) => ({ ...b, classe: classes.find((c) => c.id === b.classeId) ?? null })),
  )
}

// Plus tard : POST /api/bookings  { classeId, membreId }
export async function bookClass(classeId, membreId) {
  const target = classes.find((c) => c.id === classeId)
  if (!target || target.placesRestantes <= 0) {
    return Promise.reject(new Error('Aucune place disponible'))
  }

  classes = classes.map((c) =>
    c.id === classeId ? { ...c, placesRestantes: c.placesRestantes - 1 } : c,
  )

  const existing = myBookings.find((b) => b.classeId === classeId && b.membreId === membreId)
  if (existing) {
    myBookings = myBookings.map((b) => (b.id === existing.id ? { ...b, statut: 'confirmee' } : b))
  } else {
    myBookings = [
      ...myBookings,
      { id: `booking-${Date.now()}`, classeId, membreId, statut: 'confirmee' },
    ]
  }

  return Promise.resolve({ classe: classes.find((c) => c.id === classeId) })
}

// Plus tard : PATCH /api/bookings/{id}/cancel
export async function cancelBooking(bookingId) {
  const booking = myBookings.find((b) => b.id === bookingId)
  if (!booking) return Promise.reject(new Error('Réservation introuvable'))

  myBookings = myBookings.map((b) =>
    b.id === bookingId ? { ...b, statut: 'annulee' } : b,
  )
  classes = classes.map((c) =>
    c.id === booking.classeId ? { ...c, placesRestantes: c.placesRestantes + 1 } : c,
  )

  return Promise.resolve({ booking })
}
