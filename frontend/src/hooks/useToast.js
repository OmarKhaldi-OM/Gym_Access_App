import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [message, setMessage] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((text, duration = 2500) => {
    clearTimeout(timeoutRef.current)
    setMessage(text)
    timeoutRef.current = setTimeout(() => setMessage(null), duration)
  }, [])

  return { toastMessage: message, showToast }
}
