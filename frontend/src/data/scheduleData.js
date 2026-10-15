// Constantes géométriques de la grille hebdomadaire.
// Les données (cours, séances, réservations) vivent désormais dans /src/mocks
// et sont exposées via /src/services — ce fichier ne contient que la mise en page.

export const days = [
  { key: 'lundi', label: 'Lundi', date: '21 sept.' },
  { key: 'mardi', label: 'Mardi', date: '22 sept.' },
  { key: 'mercredi', label: 'Mercredi', date: '23 sept.' },
  { key: 'jeudi', label: 'Jeudi', date: '24 sept.' },
  { key: 'vendredi', label: 'Vendredi', date: '25 sept.' },
  { key: 'samedi', label: 'Samedi', date: '26 sept.' },
  { key: 'dimanche', label: 'Dimanche', date: '27 sept.' },
]

function currentWeekStart() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start
}

export function getDaysForWeek(weekOffset = 0, language = document.documentElement.lang || 'en') {
  const start = currentWeekStart()
  start.setDate(start.getDate() + weekOffset * 7)
  return days.map((day, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      ...day,
      dateValue: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat(language, { weekday: 'long' }).format(date),
      date: date.toLocaleDateString(language, { day: '2-digit', month: 'short' }),
    }
  })
}

export const OPEN_HOUR = 7
export const CLOSE_HOUR = 22
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
