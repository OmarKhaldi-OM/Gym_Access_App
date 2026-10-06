import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './api.js'

const weekdayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function parts(value) {
  if (Array.isArray(value)) {
    return {
      date: value.slice(0, 3).map((part) => String(part).padStart(2, '0')).join('-'),
      time: value.slice(3, 5).map((part) => String(part).padStart(2, '0')).join(':'),
    }
  }
  return { date: value?.slice(0, 10), time: value?.slice(11, 16) }
}

function mapSchedule(schedule, gymClass, bookingCount) {
  const { date, time } = parts(schedule.dateHeure)
  const [hour, minute] = time.split(':').map(Number)
  const end = new Date(2000, 0, 1, hour, minute + (schedule.dureeMin || 60))
  return {
    id: schedule.id,
    scheduleId: schedule.id,
    classId: schedule.classId,
    date,
    jour: weekdayNames[new Date(`${date}T12:00:00`).getDay()],
    heureDebut: time,
    heureFin: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
    nom: schedule.className,
    coachNom: schedule.trainerNom,
    studio: gymClass?.description || '',
    capaciteMax: gymClass?.capaciteMax || 0,
    placesRestantes: Math.max(0, (gymClass?.capaciteMax || 0) - bookingCount),
  }
}

export async function getClasses() {
  const [schedules, gymClasses, bookingCounts] = await Promise.all([
    apiGet('/api/schedules'),
    apiGet('/api/classes'),
    apiGet('/api/bookings/counts'),
  ])
  const classesById = new Map(gymClasses.map((item) => [item.id, item]))
  return schedules.map((schedule) => mapSchedule(schedule, classesById.get(schedule.classId), bookingCounts[schedule.id] || 0))
}

export async function getMyBookings(memberId) {
  if (!memberId) return []
  const [bookings, schedules, gymClasses] = await Promise.all([
    apiGet(`/api/bookings/member/${memberId}`),
    apiGet('/api/schedules'),
    apiGet('/api/classes'),
  ])
  const scheduleById = new Map(schedules.map((schedule) => [schedule.id, schedule]))
  const classById = new Map(gymClasses.map((item) => [item.id, item]))
  return bookings.map((booking) => {
    const schedule = scheduleById.get(booking.scheduleId)
    return {
      ...booking,
      classeId: booking.scheduleId,
      membreId: booking.memberId,
      statut: booking.statut?.toLowerCase() === 'cancelled' ? 'annulee' : 'confirmee',
      classe: schedule
        ? mapSchedule(schedule, classById.get(schedule.classId), bookings.filter((item) => item.scheduleId === schedule.id && item.statut?.toLowerCase() !== 'cancelled').length)
        : null,
    }
  })
}

function durationMinutes(start, end) {
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  return endHour * 60 + endMinute - startHour * 60 - startMinute
}

async function findTrainer(name, trainers) {
  const trainer = trainers.find((item) => `${item.prenom} ${item.nom}`.toLowerCase() === name.trim().toLowerCase())
  if (!trainer) throw new Error('Aucun coach correspondant n’a été trouvé.')
  return trainer
}

export async function addClass(details) {
  const [trainers, classes] = await Promise.all([apiGet('/api/trainers'), apiGet('/api/classes')])
  const trainer = await findTrainer(details.coachNom, trainers)
  let gymClass = classes.find((item) => item.nom.toLowerCase() === details.nom.trim().toLowerCase())
  if (!gymClass) {
    gymClass = await apiPost('/api/classes', { nom: details.nom, description: details.studio, capaciteMax: details.capaciteMax })
  }
  const schedule = await apiPost('/api/schedules', {
    classId: gymClass.id,
    trainerId: trainer.id,
    dateHeure: `${details.date}T${details.heureDebut}:00`,
    dureeMin: durationMinutes(details.heureDebut, details.heureFin),
  })
  return mapSchedule(schedule, gymClass, 0)
}

export async function updateClass(id, details) {
  const [schedule, classes, trainers] = await Promise.all([
    apiGet(`/api/schedules/${id}`),
    apiGet('/api/classes'),
    apiGet('/api/trainers'),
  ])
  const gymClass = classes.find((item) => item.id === schedule.classId)
  const trainer = await findTrainer(details.coachNom, trainers)
  const updatedClass = await apiPut(`/api/classes/${schedule.classId}`, {
    nom: details.nom,
    description: details.studio,
    capaciteMax: details.capaciteMax,
  })
  const updatedSchedule = await apiPut(`/api/schedules/${id}`, {
    classId: schedule.classId,
    trainerId: trainer.id,
    dateHeure: `${details.date}T${details.heureDebut}:00`,
    dureeMin: durationMinutes(details.heureDebut, details.heureFin),
  })
  return mapSchedule(updatedSchedule, updatedClass || gymClass, 0)
}

export async function deleteClass(id) {
  await apiDelete(`/api/schedules/${id}`)
  return id
}

export async function bookClass(scheduleId, memberId) {
  return apiPost('/api/bookings', { memberId, scheduleId, statut: 'CONFIRMEE' })
}

export async function cancelBooking(bookingId) {
  return apiPatch(`/api/bookings/${bookingId}/cancel`)
}

export async function getPersonalSessions(memberId) {
  if (!memberId) return []
  const bookings = await apiGet(`/api/trainer-bookings/member/${memberId}`)
  return bookings.map((booking) => {
    const { date, time } = parts(booking.dateHeure)
    const [hour, minute] = time.split(':').map(Number)
    const end = new Date(2000, 0, 1, hour, minute + 60)
    return {
      id: booking.id,
      date,
      jour: weekdayNames[new Date(`${date}T12:00:00`).getDay()],
      heureDebut: time,
      heureFin: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
      clientNom: booking.memberNom,
      coachNom: booking.trainerNom,
      statut: booking.statut,
    }
  })
}

export async function getClassesForTrainer(trainerId) {
  const [schedules, classes] = await Promise.all([
    apiGet(`/api/schedules/trainer/${trainerId}`),
    apiGet('/api/classes'),
  ])
  const classById = new Map(classes.map((item) => [item.id, item]))
  return schedules.map((schedule) => mapSchedule(schedule, classById.get(schedule.classId), 0))
}