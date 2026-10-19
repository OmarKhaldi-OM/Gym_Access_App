import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/I18nContext.jsx'

const labels = {
  en: { error: 'Error', close: 'Close', network: 'Connection problem', validation: 'Check your information', authentication: 'Sign-in required', authorization: 'Access denied', server: 'Temporary server problem' },
  fr: { error: 'Erreur', close: 'Fermer', network: 'Problème de connexion', validation: 'Vérifiez vos informations', authentication: 'Connexion requise', authorization: 'Accès refusé', server: 'Erreur temporaire du serveur' },
  ar: { error: 'خطأ', close: 'إغلاق', network: 'مشكلة في الاتصال', validation: 'تحقق من المعلومات', authentication: 'تسجيل الدخول مطلوب', authorization: 'تم رفض الوصول', server: 'مشكلة مؤقتة في الخادم' },
}

export default function ApiFeedback() {
  const [notification, setNotification] = useState(null)
  const timeoutRef = useRef(null)
  const dismissTimeoutRef = useRef(null)
  const lastNotificationRef = useRef(null)
  const { language } = useI18n()
  const text = labels[language] || labels.fr

  const dismiss = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setNotification((current) => current ? { ...current, leaving: true } : current)
    clearTimeout(dismissTimeoutRef.current)
    dismissTimeoutRef.current = setTimeout(() => setNotification(null), 180)
  }, [])

  useEffect(() => {
    const showError = (event) => {
      const error = event.reason
      const message = typeof error?.message === 'string' && error.category
        ? error.message
        : 'Une erreur inattendue est survenue. Réessayez dans quelques instants.'
      const category = error?.category || 'error'
      const signature = `${category}:${message}`
      const now = Date.now()
      if (lastNotificationRef.current?.signature === signature && now - lastNotificationRef.current.time < 5000) return
      lastNotificationRef.current = { signature, time: now }
      clearTimeout(timeoutRef.current)
      clearTimeout(dismissTimeoutRef.current)
      setNotification({ id: now, message, category, leaving: false })
      timeoutRef.current = setTimeout(dismiss, 7000)
    }
    window.addEventListener('unhandledrejection', showError)
    return () => {
      window.removeEventListener('unhandledrejection', showError)
      clearTimeout(timeoutRef.current)
      clearTimeout(dismissTimeoutRef.current)
    }
  }, [dismiss])

  if (!notification) return null
  const heading = text[notification.category] || text.error
  return (
    <div
      className={`gate-notification gate-notification-error${notification.leaving ? ' is-leaving' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      dir="auto"
    >
      <svg className="gate-notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v4m0 4h.01M10.3 3.9 1.8 18.6A1.6 1.6 0 0 0 3.2 21h17.6a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <div className="gate-notification-copy">
        <p className="gate-notification-title">{heading}</p>
        <p className="gate-notification-message">{notification.message}</p>
      </div>
      <button type="button" className="gate-notification-close" aria-label={text.close} onClick={dismiss}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}