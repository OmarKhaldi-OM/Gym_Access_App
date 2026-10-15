import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useT } from '../context/I18nContext.jsx'

let googleScriptPromise
let initializedClientId
let activeCallbacksRef

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      let script = document.getElementById('google-identity-services')
      const onLoad = () => window.google?.accounts?.id
        ? resolve(window.google)
        : reject(new Error('Google Identity Services failed to initialize.'))
      const onError = () => reject(new Error('Google Identity Services could not be loaded.'))
      if (!script) {
        script = document.createElement('script')
        script.id = 'google-identity-services'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', onLoad, { once: true })
      script.addEventListener('error', onError, { once: true })
    }).catch((error) => {
      googleScriptPromise = undefined
      throw error
    })
  }
  return googleScriptPromise
}

export default function GoogleIdentityButton({ onCredential, onError, disabled = false }) {
  const containerRef = useRef(null)
  const callbacksRef = useRef({ onCredential, onError })
  const [setupError, setSetupError] = useState('')
  const { theme } = useTheme()
  const t = useT()

  callbacksRef.current = { onCredential, onError }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    let active = true
    if (!clientId) {
      setSetupError(t('googleMissingClientId'))
      return () => { active = false }
    }

    activeCallbacksRef = callbacksRef
    setSetupError('')
    loadGoogleIdentityServices()
      .then((google) => {
        if (!active || !containerRef.current) return
        if (initializedClientId !== clientId) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              const callbacks = activeCallbacksRef?.current
              if (response.credential) callbacks?.onCredential(response.credential)
              else callbacks?.onError?.(new Error('Google did not return an identity credential.'))
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          })
          initializedClientId = clientId
        }
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.min(360, containerRef.current.clientWidth || 360),
        })
      })
      .catch((error) => {
        if (!active) return
        setSetupError(t('googleUnavailable'))
        callbacksRef.current.onError?.(error)
      })

    return () => {
      active = false
      if (activeCallbacksRef === callbacksRef) activeCallbacksRef = null
      containerRef.current?.replaceChildren()
    }
  }, [theme, t])

  return (
    <div className="google-signin">
      <div
        ref={containerRef}
        aria-busy={disabled}
        className={disabled ? 'google-signin-disabled' : ''}
      />
      {setupError && <p className="form-error" role="alert">{setupError}</p>}
    </div>
  )
}
