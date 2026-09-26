import { trainerBookings as initialBookings } from '../mocks/trainerBookings.js'

let trainerBookings = [...initialBookings]

// Plus tard : GET /api/trainer-bookings
export async function getTrainerBookings() {
  return Promise.resolve([...trainerBookings])
}

// Plus tard : GET /api/trainer-bookings/member/{memberId}
export async function getBookingsForClient(clientNom) {
  return Promise.resolve(trainerBookings.filter((b) => b.clientNom === clientNom))
}
