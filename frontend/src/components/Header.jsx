import { NavLink, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useT } from '../context/I18nContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import LanguageControls from './LanguageControls.jsx'
import { getRoleDefinition } from '../roles.js'

export default function Header({ role }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const roleDefinition = getRoleDefinition(user?.role || role)
  const navItems = roleDefinition?.navigation || []
  const t = useT()
  const { theme, toggleTheme } = useTheme()
  const name = user?.displayName || user?.email || ''
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="management-header">
      <div className="management-inner max-w-7xl mx-auto px-6">
        <Link to="/" className="management-brand">
          <span className="management-mark">G</span>
          <span>gate<span className="brand-period">.</span></span>
        </Link>

        <nav className="management-nav" aria-label={t('managementNavigation')}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="management-actions">
          <button
            onClick={handleLogout}
            className="management-logout"
          >
            {t('logout')}
          </button>
          <div className="management-user-name">
            <p>{name}</p>
            <span>{roleDefinition ? t(roleDefinition.label) : ''}</span>
          </div>
          <div className="management-avatar">
            {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials}
          </div>
          <LanguageControls />
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme} aria-label={`${t('theme')}: ${theme === 'dark' ? t('light') : t('dark')}`} title={theme === 'dark' ? t('light') : t('dark')}>
            <span className="theme-icon sun" aria-hidden="true">☀</span>
            <span className="theme-icon moon" aria-hidden="true">☾</span>
            <span className="theme-thumb" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
