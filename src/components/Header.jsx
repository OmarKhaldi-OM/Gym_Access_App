import { NavLink, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useT } from '../context/I18nContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import LanguageControls from './LanguageControls.jsx'

const navByRole = {
  admin: [
    { to: '/admin/dashboard', key: 'dashboard' }, { to: '/admin/activity', key: 'activity' }, { to: '/admin/members', key: 'members' }, { to: '/admin/schedule', key: 'schedule' }, { to: '/admin/trainer-bookings', key: 'trainerBookings' }, { to: '/admin/profile', key: 'profile' },
  ],
  membre: [
    { to: '/membre/dashboard', key: 'status' }, { to: '/membre/bookings', key: 'bookings' }, { to: '/membre/trainer-sessions', key: 'trainerSessions' }, { to: '/membre/coaching', key: 'coachingRequests' }, { to: '/membre/progress', key: 'progress' }, { to: '/membre/profile', key: 'profile' },
  ],
  coach: [
    { to: '/coach/planning', key: 'schedule' }, { to: '/coach/clients', key: 'members' }, { to: '/coach/requests', key: 'coachingRequests' }, { to: '/coach/profil', key: 'profile' },
  ],
  reception: [
  { to: '/reception/accueil', key: 'home' }, { to: '/reception/planning', key: 'schedule' }, { to: '/reception/profil', key: 'profile' },
  ],
}

const roleLabel = {
  admin: 'admin', membre: 'member', coach: 'coach', reception: 'reception',
}

export default function Header({ role = 'admin' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const navItems = navByRole[role]
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
            <span>{t(roleLabel[role])}</span>
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
