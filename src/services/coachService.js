import { getBookingsForTrainer } from './trainerBookingService.js'
import { getClassesForTrainer } from './classService.js'

export async function getCoachClients(trainerId) {
  const bookings = (await getBookingsForTrainer(trainerId))
    .filter((booking) => booking.statut !== 'annulee')
  const uniqueMembers = new Map()
  bookings.forEach((booking) => {
    const client = uniqueMembers.get(booking.memberId) || {
      id: booking.memberId,
      nom: booking.clientNom,
      bookingCount: 0,
    }
    client.bookingCount += 1
    uniqueMembers.set(booking.memberId, client)
  })
  return [...uniqueMembers.values()]
}

export async function getCoachSchedule(trainerId) {
  const [classes, personalSessions] = await Promise.all([
    getClassesForTrainer(trainerId),
    getBookingsForTrainer(trainerId),
  ])
  return { classes, personalSessions: personalSessions.filter((booking) => booking.statut !== 'annulee').map((booking) => ({
    ...booking,
    date: booking.dateTime.slice(0, 10),
    jour: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date(booking.dateTime).getDay()],
    heureDebut: booking.dateTime.slice(11, 16),
    heureFin: new Date(new Date(booking.dateTime).getTime() + 3600000).toTimeString().slice(0, 5),
    clientNom: booking.clientNom,
  })) }
}
