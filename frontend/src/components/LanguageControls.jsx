import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n, useT } from '../context/I18nContext.jsx'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
]

export default function LanguageControls() {
  const { language, setLanguage } = useI18n()
  const t = useT()
  const menuId = useId()
  const controlsRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return

    const triggerRect = trigger.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const viewportPadding = 8
    const isRtl = getComputedStyle(trigger).direction === 'rtl'
    const preferredLeft = isRtl ? triggerRect.right - menuRect.width : triggerRect.left
    const left = Math.max(
      viewportPadding,
      Math.min(preferredLeft, window.innerWidth - menuRect.width - viewportPadding),
    )
    const preferredTop = triggerRect.bottom + 6
    const top = preferredTop + menuRect.height <= window.innerHeight - viewportPadding
      ? preferredTop
      : Math.max(viewportPadding, triggerRect.top - menuRect.height - 6)

    setMenuPosition({ top, left })
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const selectedOption = menuRef.current?.querySelector('[aria-checked="true"]')
    selectedOption?.focus()

    const closeOnOutsideClick = (event) => {
      if (!controlsRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) return undefined

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    document.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      document.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen])

  const handleMenuKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const options = [...(menuRef.current?.querySelectorAll('[role="menuitemradio"]') || [])]
    if (!options.length) return

    event.preventDefault()
    const currentIndex = options.indexOf(document.activeElement)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : (currentIndex + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length
    options[nextIndex]?.focus()
  }

  const selectLanguage = (code) => {
    setLanguage(code)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="language-controls" ref={controlsRef}>
      <button
        ref={triggerRef}
        type="button"
        className="language-trigger"
        aria-label={t('changeLanguage')}
        title={t('changeLanguage')}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg className="language-globe" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" />
          <path d="M2.9 10h14.2M10 2.75c2 2 2.8 4.4 2.8 7.25s-.8 5.25-2.8 7.25C8 15.25 7.2 12.85 7.2 10s.8-5.25 2.8-7.25Z" />
        </svg>
      </button>
      {isOpen && (
        createPortal(
          <div
            id={menuId}
            ref={menuRef}
            className="language-menu"
            role="menu"
            aria-label={t('changeLanguage')}
            onKeyDown={handleMenuKeyDown}
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                className="language-menu-option"
                aria-checked={language === item.code}
                onClick={() => selectLanguage(item.code)}
              >
                <span>{item.name}</span>
                <span className="language-menu-check" aria-hidden="true">
                  {language === item.code ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )
      )}
    </div>
  )
}
