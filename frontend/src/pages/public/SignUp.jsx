import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { PublicShell } from '../../components/PublicSite.jsx'
import { ApiLoading } from '../../components/ApiState.jsx'
import * as membershipService from '../../services/membershipService.js'
import { useT } from '../../context/I18nContext.jsx'
import GoogleIdentityButton from '../../components/GoogleIdentityButton.jsx'

export default function SignUp() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registeredUser, setRegisteredUser] = useState(null)
  const [planId, setPlanId] = useState(params.get('plan') || 'unlimited')
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const plan = plans.find((item) => item.id === planId) || plans[0]

  const loadPlans = () => {
    setPlansLoading(true)
    setError('')
    membershipService.getPlans().then((availablePlans) => {
      setPlans(availablePlans)
      if (!availablePlans.some((item) => item.id === planId)) setPlanId(availablePlans[0]?.id || '')
    }).catch((requestError) => {
      setError(requestError.message)
    }).finally(() => setPlansLoading(false))
  }

  useEffect(() => { loadPlans() }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const account = registeredUser || await signUp({ name, email, password })
      setRegisteredUser(account)
      if (plan) await membershipService.createSubscription(plan)
      navigate('/membre/dashboard')
    } catch (signupError) {
      setError(signupError.message || t('signupError'))
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async (credential) => {
    setError('')
    setSubmitting(true)
    try {
      await signInWithGoogle(credential)
      navigate(`/membership/setup?plan=${encodeURIComponent(planId)}`, { replace: true })
    } catch (googleSignInError) {
      setError(googleSignInError.message || t('googleSignInError'))
      setSubmitting(false)
    }
  }

  return (
    <PublicShell>
      <main className="auth-page signup-page">
        <div className="auth-intro"><p className="eyebrow"><span className="live-dot" /> {t('signupTagline')}</p><h1>{t('signupTitle')}</h1><p>{t('signupIntro')}</p><div className="auth-manifesto"><span>01</span><p>{t('signupManifesto')}</p></div></div>
        <div className="signup-form-wrap">
          <div className="form-heading"><span>{t('signupStepAccount')}</span><Link to="/signin">{t('alreadyMember')} <strong>{t('signIn')}</strong></Link></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>{t('fullName')}<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} /></label>
            <label>{t('email')}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('emailPlaceholder')} /></label>
            <label>{t('password')}<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('passwordPlaceholder')} /></label>
            <div className="signup-plan-select"><div className="select-heading"><span>{t('signupStepPlan')}</span><Link to="/plans">{t('compare')}</Link></div>
              <div className="select-controls"><label>{t('membershipType')}<select required disabled={plansLoading || plans.length === 0} value={planId} onChange={(event) => setPlanId(event.target.value)}>{plans.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}</select></label>{plansLoading ? <ApiLoading message={t('loading')} /> : <p>{plan ? `${plan.prix} DT · ${plan.dureeJours} jours` : t('noPlansAvailable', 'Aucun forfait disponible pour le moment.')}</p>}</div>
              {plan && <div className="checkout-total"><div><strong>{plan.nom}</strong><span>{plan.dureeJours} jours</span></div><p><strong>{plan.prix} DT</strong></p></div>}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime submit-button" disabled={submitting || plansLoading || !plan}>{submitting ? t('loading') : t('createAccount')} <span aria-hidden="true">↗</span></button>
            {!plansLoading && !plans.length && <button type="button" className="text-link" onClick={loadPlans}>{t('retry', 'Réessayer')}</button>}
            <p className="demo-disclaimer">{t('noPayment')}</p>
          </form>
          <div className="google-auth-option">
            <p>{t('orContinueWith')}</p>
            <GoogleIdentityButton onCredential={handleGoogleSignIn} disabled={submitting} />
            <p className="text-sm text-text-muted">{t('googleRegistrationHelp')}</p>
          </div>
        </div>
      </main>
    </PublicShell>
  )
}