export const days = [
  { key: 'lundi', label: 'Lundi', date: '21 sept.' },
  { key: 'mardi', label: 'Mardi', date: '22 sept.' },
  { key: 'mercredi', label: 'Mercredi', date: '23 sept.' },
  { key: 'jeudi', label: 'Jeudi', date: '24 sept.' },
  { key: 'vendredi', label: 'Vendredi', date: '25 sept.' },
  { key: 'samedi', label: 'Samedi', date: '26 sept.' },
]

export const OPEN_HOUR = 7
export const CLOSE_HOUR = 21
export const HOUR_HEIGHT = 64 // px par heure
export const TOTAL_HEIGHT = (CLOSE_HOUR - OPEN_HOUR) * HOUR_HEIGHT
export const hourMarks = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR + 1 },
  (_, i) => OPEN_HOUR + i,
)

export const toDecimal = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h + m / 60
}

// Cours collectifs (GymClass / ClassSchedule) — géré par l'admin
export const classes = [
  { id: 'lundi-0700', day: 'lundi', start: '07:00', end: '08:00', name: 'Yoga Matinal', coach: 'Nour Kefi', studio: 'Studio A', spots: 4 },
  { id: 'lundi-1000', day: 'lundi', start: '10:00', end: '11:00', name: 'Pilates', coach: 'Rania Sfar', studio: 'Studio A', spots: 6 },
  { id: 'lundi-1830', day: 'lundi', start: '18:30', end: '19:30', name: 'CrossTraining', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 0 },

  { id: 'mardi-1200', day: 'mardi', start: '12:00', end: '13:00', name: 'Spinning', coach: 'Karim Bouazizi', studio: 'Studio C', spots: 6 },
  { id: 'mardi-1700', day: 'mardi', start: '17:00', end: '18:00', name: 'Boxe', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 2 },
  { id: 'mardi-1900', day: 'mardi', start: '19:00', end: '20:00', name: 'Pilates Soir', coach: 'Rania Sfar', studio: 'Studio A', spots: 5 },

  { id: 'mercredi-0700', day: 'mercredi', start: '07:00', end: '08:00', name: 'Yoga Matinal', coach: 'Nour Kefi', studio: 'Studio A', spots: 2 },
  { id: 'mercredi-1000', day: 'mercredi', start: '10:00', end: '11:00', name: 'Pilates', coach: 'Rania Sfar', studio: 'Studio A', spots: 0 },
  { id: 'mercredi-1900', day: 'mercredi', start: '19:00', end: '20:00', name: 'Boxe', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 3 },

  { id: 'jeudi-0800', day: 'jeudi', start: '08:00', end: '09:00', name: 'CrossTraining Matin', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 4 },
  { id: 'jeudi-1230', day: 'jeudi', start: '12:30', end: '13:30', name: 'Spinning', coach: 'Karim Bouazizi', studio: 'Studio C', spots: 1 },
  { id: 'jeudi-1800', day: 'jeudi', start: '18:00', end: '19:00', name: 'Yoga Doux', coach: 'Nour Kefi', studio: 'Studio A', spots: 6 },

  { id: 'vendredi-0700', day: 'vendredi', start: '07:00', end: '08:00', name: 'Yoga Matinal', coach: 'Nour Kefi', studio: 'Studio A', spots: 3 },
  { id: 'vendredi-1000', day: 'vendredi', start: '10:00', end: '11:00', name: 'Pilates', coach: 'Rania Sfar', studio: 'Studio A', spots: 4 },
  { id: 'vendredi-1730', day: 'vendredi', start: '17:30', end: '18:30', name: 'CrossTraining', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 0 },
  { id: 'vendredi-1930', day: 'vendredi', start: '19:30', end: '20:30', name: 'Spinning Soirée', coach: 'Karim Bouazizi', studio: 'Studio C', spots: 5 },

  { id: 'samedi-0900', day: 'samedi', start: '09:00', end: '10:00', name: 'Yoga Weekend', coach: 'Nour Kefi', studio: 'Studio A', spots: 8 },
  { id: 'samedi-1030', day: 'samedi', start: '10:30', end: '11:30', name: 'Boxe Découverte', coach: 'Wassim Jendoubi', studio: 'Studio B', spots: 6 },
  { id: 'samedi-1130', day: 'samedi', start: '11:30', end: '13:00', name: 'Pilates Duo', coach: 'Rania Sfar', studio: 'Studio A', spots: 2 },
]

// Séances perso (TrainerBooking) — 1 coach, 1 client
export const personalSessions = [
  { id: 'perso-1', day: 'lundi', start: '16:00', end: '17:00', coach: 'Rania Sfar', client: 'Emna Gharbi', studio: 'Studio A' },
  { id: 'perso-2', day: 'mardi', start: '09:00', end: '10:00', coach: 'Rania Sfar', client: 'Yassine Trabelsi', studio: 'Studio A' },
  { id: 'perso-3', day: 'vendredi', start: '15:30', end: '16:30', coach: 'Rania Sfar', client: 'Amira Chaabane', studio: 'Studio B' },
  { id: 'perso-4', day: 'mercredi', start: '17:00', end: '18:00', coach: 'Wassim Jendoubi', client: 'Karim Bouazizi', studio: 'Studio B' },
]

// Réservations du membre connecté (Sana Mabrouk) — référencent les cours ci-dessus
export const myBookings = [
  { classId: 'lundi-0700', status: 'confirmed' },
  { classId: 'mercredi-1900', status: 'confirmed' },
  { classId: 'vendredi-1000', status: 'cancelled' },
]
