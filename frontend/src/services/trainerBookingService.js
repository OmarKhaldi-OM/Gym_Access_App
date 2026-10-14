import { apiGet, apiPost, apiPatch, authStorage } from './api.js'

function mapBooking(booking) {
  const value = booking.dateHeure
  const rawStatus = booking.statut?.trim().toLowerCase()
  const statusAliases = {
    confirmed: 'confirmee',
    confirmée: 'confirmee',
    pending: 'en_attente',
    'en attente': 'en_attente',
    cancelled: 'annulee',
    canceled: 'annulee',
    completed: 'terminee',
    accepted: 'confirmee',
  }
  const dateTime = Array.isArray(value)
    ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}T${String(value[3]).padStart(2, '0')}:${String(value[4]).padStart(2, '0')}:00`
    : value
  return {
    ...booking,
    clientNom: booking.memberNom,
    coachNom: booking.trainerNom,
    dateTime,
    statut: statusAliases[rawStatus] || rawStatus || 'en_attente',
  }
}

export async function getTrainerBookings() {
  return (await apiGet('/api/trainer-bookings')).map(mapBooking)
}

export async function getBookingsForClient(memberId) {
  if (!memberId || !authStorage.getToken()) return []
  return (await apiGet(`/api/trainer-bookings/member/${memberId}`)).map(mapBooking)
}

export async function getBookingsForTrainer(trainerId) {
  return (await apiGet(`/api/trainer-bookings/trainer/${trainerId}`)).map(mapBooking)
}

export async function createTrainerBooking(details) {
  return mapBooking(await apiPost('/api/trainer-bookings', details))
}

export async function cancelTrainerBooking(id) {
  return mapBooking(await apiPatch(`/api/trainer-bookings/${id}/cancel`))
}