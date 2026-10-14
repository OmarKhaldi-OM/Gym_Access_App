import { Link, NavLink } from 'react-router-dom'
import { useT } from '../context/I18nContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import LanguageControls from './LanguageControls.jsx'

function PublicControls() {
  const t = useT()
  const { theme, toggleTheme } = useTheme()
  return <div className="public-controls"><LanguageControls /><button className={`theme-toggle ${theme}`} onClick={toggleTheme} aria-label={theme === 'dark' ? t('light') : t('dark')}><span className="theme-icon sun" aria-hidden="true">☀</span><span className="theme-icon moon" aria-hidden="true">☾</span><span className="theme-thumb" aria-hidden="true" /></button></div>
}

export function PublicHeader() {
  const t = useT()
  return (
    <header className="public-header">
      <Link className="public-brand" to="/" aria-label={`Gate, ${t('home')}`}>
        <span className="brand-mark">G</span><span>gate<span className="brand-period">.</span></span>
      </Link>
      <nav className="public-nav" aria-label={t('primaryNavigation')}>
        <NavLink to="/plans">{t('plans')}</NavLink>
        <a href="/#club">{t('club')}</a>
        <Link className="nav-login" to="/signin">{t('signIn')}</Link>
        <Link className="button button-dark nav-join" to="/plans">{t('join')} <span aria-hidden="true">↗</span></Link>
        <PublicControls />
      </nav>
    </header>
  )
}

export function PublicFooter() {
  const t = useT()
  return (
    <footer className="public-footer">
      <Link className="public-brand" to="/"><span className="brand-mark">G</span><span>gate<span className="brand-period">.</span></span></Link>
      <span>{t('footerTagline')}</span>
      <Link to="/signin">{t('memberSpace')} <span aria-hidden="true">↗</span></Link>
    </footer>
  )
}

export function PublicShell({ children }) {
  return <div className="public-site"><PublicHeader />{children}<PublicFooter /></div>
}