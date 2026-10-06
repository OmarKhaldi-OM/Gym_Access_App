import { useEffect, useState } from 'react'

export default function ApiFeedback() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const showError = (event) => setMessage(event.detail)
    const dismissError = () => setMessage('')
    window.addEventListener('gate:api-error', showError)
    window.addEventListener('gate:api-error-dismiss', dismissError)
    return () => {
      window.removeEventListener('gate:api-error', showError)
      window.removeEventListener('gate:api-error-dismiss', dismissError)
    }
  }, [])

  if (!message) return null
  return (
    <div role="alert" className="fixed bottom-4 end-4 z-[100] flex max-w-md items-center gap-4 border border-coral bg-graphite-panel px-4 py-3 text-sm shadow-lg">
      <p>{message}</p>
      <button type="button" className="text-lg leading-none" aria-label="Fermer" onClick={() => setMessage('')}>×</button>
    </div>
  )
}