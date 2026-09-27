import { useT } from '../context/I18nContext.jsx'

const variants = {
  positive: 'bg-teal/20 text-teal',
  negative: 'bg-rose-100 text-rose-800',
  neutral: 'bg-graphite-hover text-text-muted',
}

export default function StatusChip({ children, variant = 'neutral' }) {
  const t = useT()
  const statusKey = {
    Actif: 'active', Active: 'active',
    Suspendu: 'suspended', Suspended: 'suspended',
    'Visage enrôlé': 'enrolled', 'Face enrolled': 'enrolled',
    'Non enrôlé': 'notEnrolled', 'Not enrolled': 'notEnrolled',
    Entrée: 'entry', Entry: 'entry', Sortie: 'exit', Exit: 'exit',
    Refusé: 'refusedStatus', Refused: 'refusedStatus',
  }[children]
  return (
    <span
      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-base font-medium whitespace-nowrap ${variants[variant]}`}
    >
      {statusKey ? t(statusKey) : children}
    </span>
  )
}
