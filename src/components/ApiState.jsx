import { useEffect } from 'react'

export function ApiLoading({ message = 'Chargement…' }) {
  return <p className="py-4 text-base font-medium text-text-muted" role="status">{message}</p>
}

export function ApiError({ error, onRetry, retryLabel = 'Réessayer' }) {
  useEffect(() => {
    if (error) window.dispatchEvent(new Event('gate:api-error-dismiss'))
  }, [error])

  if (!error) return null

  const message = error.status === 401
    ? 'Votre session a expiré. Connectez-vous à nouveau.'
    : error.status === 403
      ? 'Vous n’avez pas les droits pour consulter ces données.'
      : error.message || 'Une erreur est survenue lors du chargement des données.'

  return (
    <div role="alert" className="my-4 space-y-3 border-s-4 border-coral px-4 py-3" style={{ color: 'var(--ink)', backgroundColor: 'var(--surface, var(--paper-deep))' }}>
      <p>{message}</p>
      {onRetry && <button type="button" className="button button-dark" onClick={onRetry}>{retryLabel}</button>}
    </div>
  )
}