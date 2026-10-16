import { useEffect, useId, useRef, useState } from 'react'
import Button from './Button.jsx'
import { ApiError } from './ApiState.jsx'
import { useT } from '../context/I18nContext.jsx'

const focusableSelector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export default function ConfirmDialog({
  title,
  description,
  itemName,
  confirmLabel,
  onConfirm,
  onClose,
}) {
  const t = useT()
  const titleId = useId()
  const descriptionId = useId()
  const itemNameId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const submittingRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  onCloseRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    const cancelButton = dialog?.querySelector('[data-confirm-cancel]')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelButton?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (!submittingRef.current) onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const focusable = [...dialog.querySelectorAll(focusableSelector)]
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus()
    }
  }, [])

  const handleConfirm = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onCloseRef.current()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError : new Error(t('deletionFailed')))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submittingRef.current) onCloseRef.current()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={itemName ? `${descriptionId} ${itemNameId}` : descriptionId}
        aria-busy={submitting}
        tabIndex="-1"
        className="confirm-dialog w-full max-w-md rounded-xl border p-5 shadow-2xl sm:p-6"
        style={{
          backgroundColor: 'var(--surface, #f3f3eb)',
          color: 'var(--ink)',
          borderColor: 'var(--line)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, .24)',
        }}
      >
        <div className="flex items-start gap-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-1 h-6 w-6 shrink-0 text-red-700" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
          </svg>
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-bold">{title}</h2>
            <p id={descriptionId} className="mt-2 text-base text-text-muted">{description}</p>
            {itemName && (
              <p id={itemNameId} className="mt-2 break-words text-base font-semibold">{itemName}</p>
            )}
          </div>
        </div>

        {error && <ApiError error={error} fallbackMessage={t('deletionFailed')} />}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            data-confirm-cancel
            disabled={submitting}
            onClick={() => onCloseRef.current()}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="inline-flex items-center justify-center gap-2 !bg-red-700 !text-white hover:!bg-red-800 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {submitting ? t('deleting') : confirmLabel || t('delete')}
          </Button>
        </div>
      </section>
    </div>
  )
}
