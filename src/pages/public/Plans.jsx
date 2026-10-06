import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicShell } from '../../components/PublicSite.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as membershipService from '../../services/membershipService.js'
import { useT } from '../../context/I18nContext.jsx'

export default function Plans() {
  const t = useT()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPlans = () => {
    setLoading(true)
    setError('')
    membershipService.getPlans()
      .then(setPlans)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPlans() }, [])

  return (
    <PublicShell>
      <main className="plans-page">
        <section className="plans-heading">
          <p className="eyebrow"><span className="live-dot" /> {t('plans').toUpperCase()} GATE</p>
          <h1>{t('choosePlan')}</h1>
          <p>{t('comparePlans')}</p>
          {error && <ApiError error={new Error(error)} onRetry={loadPlans} />}
        </section>
        <section className="plan-grid" aria-label={t('choosePlanAria')}>
          {loading && <ApiLoading message={t('loading')} />}
          {!loading && plans.length === 0 && !error && <p>Aucun forfait disponible pour le moment.</p>}
          {plans.map((plan, index) => (
            <article className={`plan-card plan-${['lime', 'dark', 'warm'][index % 3]}`} key={plan.id}>
              <div className="plan-card-top">
                <span className="plan-index">{String(index + 1).padStart(2, '0')} / {String(plans.length).padStart(2, '0')}</span>
                <span className="plan-duration">{plan.dureeJours} jours</span>
              </div>
              <h2>{plan.nom}</h2>
              <p className="plan-strapline">{plan.dureeJours} jours d’accès</p>
              <div className="plan-price">{plan.prix}<span className="currency">DT</span></div>
              <p className="billing-note">{t('membershipPlan')}</p>
              <div className="plan-divider" />
              <Link to={`/signup?plan=${plan.id}`} className={`button button-${['lime', 'dark', 'warm'][index % 3]}`}>
                {t('choose')} {plan.nom} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </section>
        <section className="plans-bottom"><span>{t('clubInformation')}</span><p>{t('clubDetailsPending')}</p><span className="plans-currency">TND / DT</span></section>
      </main>
    </PublicShell>
  )
}