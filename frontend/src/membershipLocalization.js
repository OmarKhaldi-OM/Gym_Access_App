const numberLocales = {
  en: 'en-GB',
  fr: 'fr-FR',
  ar: 'ar-TN',
}

export function getLocalizedMembershipName(plan, language, fallbackName = '') {
  if (!plan) return ''

  const frenchName = plan.planNom ?? plan.plan ?? plan.nom ?? ''
  if (!frenchName || frenchName === '—') return frenchName

  const localizedName = {
    fr: frenchName,
    en: plan.nomEn ?? plan.planNomEn ?? plan.planEn,
    ar: plan.nomAr ?? plan.planNomAr ?? plan.planAr,
  }[language]

  return typeof localizedName === 'string' && localizedName.trim()
    ? localizedName
    : fallbackName
}

export function formatMembershipNumber(value, language) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value ?? '')

  return new Intl.NumberFormat(numberLocales[language] || numberLocales.fr, {
    maximumFractionDigits: 2,
  }).format(number)
}
