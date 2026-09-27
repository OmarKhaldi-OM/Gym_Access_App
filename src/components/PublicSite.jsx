import { Link, NavLink } from 'react-router-dom'
import { useI18n, useT } from '../context/I18nContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function PublicControls() {
  const t = useT()
  const { language, setLanguage } = useI18n()
  const { theme, toggleTheme } = useTheme()
  return <div className="public-controls"><select className="language-select" aria-label={t('language')} value={language} onChange={(event) => setLanguage(event.target.value)}><option value="fr">FR</option><option value="en">EN</option><option value="ar">AR</option></select><button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? t('light') : t('dark')}>{theme === 'dark' ? '☼' : '☾'}</button></div>
}

export function PublicHeader() {
  const t = useT()
  return (
    <header className="public-header">
      <Link className="public-brand" to="/" aria-label="Gate, accueil">
        <span className="brand-mark">G</span><span>gate<span className="brand-period">.</span></span>
      </Link>
      <nav className="public-nav" aria-label="Navigation principale">
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
  return (
    <footer className="public-footer">
      <Link className="public-brand" to="/"><span className="brand-mark">G</span><span>gate<span className="brand-period">.</span></span></Link>
      <span>Entraîne-toi à ta façon. Va plus loin.</span>
      <Link to="/signin">{useT()('memberSpace')} <span aria-hidden="true">↗</span></Link>
    </footer>
  )
}

export function PublicShell({ children }) {
  return <div className="public-site"><PublicHeader />{children}<PublicFooter /></div>
}