import { useState, useCallback, useRef, useEffect } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)
  const exitTimeoutRef = useRef(null)

  const dismissToast = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setToast((current) => current ? { ...current, leaving: true } : current)
    clearTimeout(exitTimeoutRef.current)
    exitTimeoutRef.current = setTimeout(() => setToast(null), 180)
  }, [])

  useEffect(() => () => {
    clearTimeout(timeoutRef.current)
    clearTimeout(exitTimeoutRef.current)
  }, [])

  const showToast = useCallback((text, duration = 3200, variant = 'success') => {
    clearTimeout(timeoutRef.current)
    clearTimeout(exitTimeoutRef.current)
    setToast({ id: Date.now() + Math.random(), message: text, variant, leaving: false })
    timeoutRef.current = setTimeout(dismissToast, duration)
  }, [dismissToast])

  return {
    toastMessage: toast?.message,
    toastVariant: toast?.variant,
    toastId: toast?.id,
    toastLeaving: toast?.leaving,
    showToast,
    dismissToast,
  }
}
