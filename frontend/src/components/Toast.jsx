import { useT } from '../context/I18nContext.jsx'

const variantIcons = {
  success: <path d="m5 12 4 4L19 6" />,
  error: <path d="M12 8v4m0 4h.01M10.3 3.9 1.8 18.6A1.6 1.6 0 0 0 3.2 21h17.6a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  info: <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
}

export default function Toast({ message, variant = 'success', id, leaving = false, onClose, closeLabel = 'Fermer' }) {
  const t = useT()
  if (!message) return null
  return (
    <div
      key={id}
      className={`gate-toast gate-toast-${variant}${leaving ? ' is-leaving' : ''}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      dir="auto"
    >
      <svg className="gate-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {variantIcons[variant] || variantIcons.info}
      </svg>
      <p>{message}</p>
      <button type="button" className="gate-toast-close" aria-label={t('close', closeLabel)} onClick={onClose}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
