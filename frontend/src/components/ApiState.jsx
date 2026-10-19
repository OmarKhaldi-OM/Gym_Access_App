export function ApiLoading({ message = 'Chargement…' }) {
  return <div className="flex min-h-20 items-center gap-3 py-4 text-base font-medium text-text-muted" role="status">
    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
    <span>{message}</span>
  </div>
}

export function ApiEmpty({ message, action, className = '' }) {
  return <div className={`flex flex-col items-start gap-3 px-5 py-6 text-base text-text-muted ${className}`} role="status">
    <p>{message}</p>
    {action}
  </div>
}

export function ApiError({ error, onRetry, retryLabel = 'Réessayer', fallbackMessage = 'Une erreur est survenue lors du chargement des données.' }) {
  if (!error) return null

  const rawMessage = typeof error.message === 'string' ? error.message.trim() : ''
  const safeMessage = rawMessage.length <= 300
    && !/(?:exception|stack\s*trace|\bat\s+[\w.$]+\(|<\/?(?:html|body|pre)\b)/i.test(rawMessage)
    ? rawMessage
    : ''
  const message = error.status === 401
    ? 'Votre session a expiré. Connectez-vous à nouveau.'
    : error.status === 403
      ? 'Vous n’avez pas l’autorisation nécessaire pour effectuer cette action.'
      : safeMessage || fallbackMessage

  return (
    <div role="alert" className="my-4 space-y-3 border-s-4 border-coral px-4 py-3" style={{ color: 'var(--ink)', backgroundColor: 'var(--surface, var(--paper-deep))' }}>
      <p>{message}</p>
      {onRetry && ![401, 403].includes(error.status) && <button type="button" className="button button-dark" onClick={onRetry}>{retryLabel}</button>}
    </div>
  )
}