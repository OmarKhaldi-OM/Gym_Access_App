import { coachClients as initialClients } from '../mocks/coachClients.js'
import { getClasses, getPersonalSessions } from './classService.js'

let coachClients = [...initialClients]

// Plus tard : GET /api/trainers/{id}/clients
export async function getCoachClients(coachNom) {
  return Promise.resolve(coachClients.filter((c) => c.coachNom === coachNom))
}

// Plus tard : GET /api/schedules/trainer/{trainerId} + GET /api/trainer-bookings/trainer/{trainerId}
export async function getCoachSchedule(coachNom) {
  const [classes, personalSessions] = await Promise.all([getClasses(), getPersonalSessions()])
  return {
    classes: classes.filter((c) => c.coachNom === coachNom),
    personalSessions: personalSessions.filter((p) => p.coachNom === coachNom),
  }
}
