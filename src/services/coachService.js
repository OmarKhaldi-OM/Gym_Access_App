import { apiGet } from './api.js'
import { getBookingsForTrainer } from './trainerBookingService.js'
import { getClassesForTrainer } from './classService.js'

async function trainerForName(name) {
  const trainers = await apiGet('/api/trainers')
  return trainers.find((trainer) => `${trainer.prenom} ${trainer.nom}`.toLowerCase() === name.toLowerCase())
}

export async function getCoachClients(coachName) {
  const trainer = await trainerForName(coachName)
  if (!trainer) return []
  const bookings = await getBookingsForTrainer(trainer.id)
  const uniqueMembers = new Map(bookings.map((booking) => [booking.memberId, {
    id: booking.memberId,
    nom: booking.clientNom,
    plan: '—',
    lastSessionTime: booking.dateTime,
    daysSinceLastSession: Math.max(0, Math.floor((Date.now() - new Date(booking.dateTime).getTime()) / 86400000)),
  }]))
  return [...uniqueMembers.values()]
}

export async function getCoachSchedule(coachName) {
  const trainer = await trainerForName(coachName)
  if (!trainer) return { classes: [], personalSessions: [] }
  const [classes, personalSessions] = await Promise.all([
    getClassesForTrainer(trainer.id),
    getBookingsForTrainer(trainer.id),
  ])
  return { classes, personalSessions: personalSessions.map((booking) => ({
    ...booking,
    date: booking.dateTime.slice(0, 10),
    jour: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(booking.dateTime).getDay()],
    heureDebut: booking.dateTime.slice(11, 16),
    heureFin: new Date(new Date(booking.dateTime).getTime() + 3600000).toTimeString().slice(0, 5),
    clientNom: booking.clientNom,
  })) }
}
