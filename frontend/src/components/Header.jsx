import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useT } from '../context/I18nContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { getRoleDefinition } from '../roles.js'
import Avatar from './Avatar.jsx'
import LanguageControls from './LanguageControls.jsx'

export default function Header({ role }) {
  const navigate = useNavigate()
  const menuButtonRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const roleDefinition = getRoleDefinition(user?.role || role)
  const navItems = roleDefinition?.navigation || []
  const t = useT()
  const { theme, toggleTheme } = useTheme()
  const name = user?.displayName || ''
  const roleName = roleDefinition ? t(roleDefinition.label) : ''

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (document.querySelector('.management-account-popover')) return
        setIsMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  const handleLogout = async () => {
    setIsMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  const renderNavigation = (onNavigate) => (
    <nav className="management-nav" aria-label={t('managementNavigation')}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          {t(item.key)}
        </NavLink>
      ))}
    </nav>
  )

  const preferences = (
    <div className="management-preferences" role="group" aria-label={t('preferences')}>
      <LanguageControls />
      <button
        type="button"
        className={`theme-toggle management-theme-toggle ${theme}`}
        onClick={toggleTheme}
        aria-pressed={theme === 'dark'}
        aria-label={`${t('theme')}: ${theme === 'dark' ? t('dark') : t('light')}`}
        title={theme === 'dark' ? t('light') : t('dark')}
      >
        {theme === 'dark' ? (
          <svg className="management-theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          <svg className="management-theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
          </svg>
        )}
      </button>
    </div>
  )

  return (
    <header className="management-header">
      <div className="management-mobile-bar">
        <div className="management-brand-controls">
          <LinkBrand />
          {preferences}
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          className="management-menu-toggle"
          aria-label={t('managementNavigation')}
          aria-controls="management-sidebar"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="management-backdrop"
          aria-label={t('close')}
          onClick={closeMobileMenu}
        />
      )}

      <aside id="management-sidebar" className={`management-sidebar${isMobileMenuOpen ? ' is-open' : ''}`}>
        <div className="management-brand-controls management-sidebar-brand">
          <LinkBrand />
          {preferences}
        </div>
        {renderNavigation(closeMobileMenu)}
        <AccountMenu
          menuId="management-account-menu"
          user={user}
          name={name}
          roleName={roleName}
          profilePath={roleDefinition?.profilePath}
          onLogout={handleLogout}
          onProfileNavigate={() => setIsMobileMenuOpen(false)}
        />
      </aside>
    </header>
  )
}

function AccountMenu({ menuId, user, name, roleName, profilePath, onLogout, onProfileNavigate }) {
  const t = useT()
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleMenuKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') return
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])]
    if (!items.length) return
    event.preventDefault()
    const currentIndex = items.indexOf(document.activeElement)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : (currentIndex + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
    items[nextIndex]?.focus()
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false)
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

  return (
    <div className="management-account" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="management-account-trigger"
        aria-label={`${t('accountMenu')}: ${name || roleName}`}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar name={name} src={user?.photoUrl || ''} />
        <span className="management-user-name">
          <span className="management-user-display-name">{name}</span>
          <span className="management-user-role">{roleName}</span>
        </span>
        <span className="management-account-chevron" aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div id={menuId} className="management-account-popover" role="menu" onKeyDown={handleMenuKeyDown}>
          <div className="management-popover-identity" role="presentation">
            <span>{name}</span>
            <small>{roleName}</small>
          </div>
          {profilePath && (
            <Link
              to={profilePath}
              role="menuitem"
              onClick={() => {
                setIsOpen(false)
                onProfileNavigate?.()
              }}
            >
              {t('myProfile')}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  )
}

function LinkBrand() {
  return (
    <Link to="/" className="management-brand">
      <span className="management-mark">G</span>
      <span>gate<span className="brand-period">.</span></span>
    </Link>
  )
}
