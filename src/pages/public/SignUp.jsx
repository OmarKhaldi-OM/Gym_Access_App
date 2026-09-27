import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { PublicShell } from '../../components/PublicSite.jsx'
import { getPlan, membershipPlans } from '../../data/membershipPlans.js'
import { useT } from '../../context/I18nContext.jsx'

export default function SignUp() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [planId, setPlanId] = useState(params.get('plan') || 'unlimited')
  const [billing, setBilling] = useState(params.get('billing') === 'yearly' ? 'yearly' : 'monthly')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const plan = getPlan(planId)
  const price = plan[billing]

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signUp({ name, email, password, plan: plan.name, billing })
      navigate('/membre/dashboard')
    } catch (signupError) {
      setError(signupError.message || 'La création du compte a échoué.')
      setSubmitting(false)
    }
  }

  return (
    <PublicShell>
      <main className="auth-page signup-page">
        <div className="auth-intro"><p className="eyebrow"><span className="live-dot" /> TA PLACE EST LÀ</p><h1>On démarre<br /><em>ensemble.</em></h1><p>Crée ton compte et active ton abonnement. Tu pourras compléter ton profil ensuite.</p><div className="auth-manifesto"><span>01</span><p>Un club fait pour avancer à ton rythme.</p></div></div>
        <div className="signup-form-wrap">
          <div className="form-heading"><span>ÉTAPE 01 — TON COMPTE</span><Link to="/signin">Déjà membre ? <strong>Connexion</strong></Link></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>{t('fullName')}<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} /></label>
            <label>{t('email')}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('emailPlaceholder')} /></label>
            <label>{t('password')}<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('passwordPlaceholder')} /></label>
            <div className="signup-plan-select"><div className="select-heading"><span>ÉTAPE 02 — TON ABONNEMENT</span><Link to="/plans">Comparer</Link></div>
              <div className="select-controls"><label>Formule<select value={planId} onChange={(event) => setPlanId(event.target.value)}>{membershipPlans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Facturation<select value={billing} onChange={(event) => setBilling(event.target.value)}><option value="monthly">Mensuelle</option><option value="yearly">Annuelle (-18%)</option></select></label></div>
              <div className="checkout-total"><div><strong>{plan.name}</strong><span>{billing === 'yearly' ? 'Facturation annuelle · TND' : 'Facturation mensuelle · TND'}</span></div><p><strong>{billing === 'yearly' ? `${price * 12} DT` : `${price} DT`}</strong><span>{billing === 'yearly' ? `/ an · ${price} DT/mois` : '/ mois'}</span></p></div>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime submit-button" disabled={submitting}>{submitting ? t('loading') : t('createAccount')} <span aria-hidden="true">↗</span></button>
            <p className="demo-disclaimer">{t('noPayment')}</p>
          </form>
        </div>
      </main>
    </PublicShell>
  )
}