import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { PublicShell } from '../components/PublicSite.jsx'
import { useT } from '../context/I18nContext.jsx'

const roleHome = {
  admin: '/admin/dashboard',
  membre: '/membre/dashboard',
  coach: '/coach/planning',
  reception: '/reception/accueil',
}

const roleButtons = [
  { role: 'admin', label: 'Admin' },
  { role: 'membre', label: 'Membre' },
  { role: 'coach', label: 'Coach' },
  { role: 'reception', label: 'Réceptionniste' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, signIn } = useAuth()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSignIn = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await signIn({ email, password })
      navigate(roleHome[user.role] || '/membre/dashboard')
    } catch (signInError) {
      setError(signInError.message || t('wrongCredentials'))
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async (role) => {
    await login(role)
    navigate(roleHome[role])
  }

  return (
    <PublicShell>
      <main className="auth-page signin-page">
        <div className="auth-intro"><p className="eyebrow"><span className="live-dot" /> {t('memberSpace').toUpperCase()}</p><h1>{t('connection')}<br /><em>Gate.</em></h1><p>{t('comparePlans')}</p><div className="auth-manifesto"><span>G / MEMBER</span><p>{t('memberSpace')}</p></div></div>
        <div className="signin-form-wrap">
          <div className="form-heading"><span>{t('memberSpace').toUpperCase()}</span><p>{t('join')} ? <Link to="/plans"><strong>{t('plans')}</strong></Link></p></div>
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>{t('connection')}</h2>
            <label>{t('email')}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('emailPlaceholder')} /></label>
            <label>{t('password')}<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('passwordPlaceholder')} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime submit-button" disabled={submitting}>{submitting ? t('loading') : t('signIn')} <span aria-hidden="true">↗</span></button>
          </form>
          <div className="demo-access"><div><span>{t('demo')}</span><p>{t('memberSpace')}</p></div><div className="demo-buttons">{roleButtons.map((role) => <button key={role.role} onClick={() => handleDemoLogin(role.role)}>{t(role.role === 'membre' ? 'member' : role.role)}</button>)}</div></div>
          <p className="demo-disclaimer">{t('noPayment')}</p>
        </div>
      </main>
    </PublicShell>
  )
}
