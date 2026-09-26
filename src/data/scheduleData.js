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
