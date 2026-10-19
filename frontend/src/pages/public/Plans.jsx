import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicShell } from '../../components/PublicSite.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as membershipService from '../../services/membershipService.js'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import { formatMembershipNumber, getLocalizedMembershipName } from '../../membershipLocalization.js'

export default function Plans() {
  const t = useT()
  const { language } = useI18n()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPlans = () => {
    setLoading(true)
    setError(null)
    membershipService.getPlans()
      .then(setPlans)
      .catch(setError)
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
          {error && <ApiError error={error} onRetry={loadPlans} />}
        </section>
        <section className="plan-grid" aria-label={t('choosePlanAria')}>
          {loading && <ApiLoading message={t('loading')} />}
          {!loading && plans.length === 0 && !error && <ApiEmpty message={t('noPlansAvailable', 'Aucun forfait disponible pour le moment.')} />}
          {!loading && !error && plans.map((plan, index) => (
            <article className={`plan-card plan-${['lime', 'dark', 'warm'][index % 3]}`} key={plan.id}>
              <div className="plan-card-top">
                <span className="plan-index">{String(index + 1).padStart(2, '0')} / {String(plans.length).padStart(2, '0')}</span>
                <span className="plan-duration"><bdi>{formatMembershipNumber(plan.dureeJours, language)}</bdi> {t('days')}</span>
              </div>
              <h2>{getLocalizedMembershipName(plan, language, t('planNameUnavailable'))}</h2>
              <p className="plan-strapline"><bdi>{formatMembershipNumber(plan.dureeJours, language)}</bdi> {t('daysAccess')}</p>
              <div className="plan-price"><bdi>{formatMembershipNumber(plan.prix, language)}<span className="currency"> {t('currencyTnd')}</span></bdi></div>
              <p className="billing-note">{t('membershipPlan')}</p>
              <div className="plan-divider" />
              <Link to={`/signup?plan=${plan.id}`} className={`button button-${['lime', 'dark', 'warm'][index % 3]}`}>
                {t('choose')} {getLocalizedMembershipName(plan, language, t('planNameUnavailable'))} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </section>
        <section className="plans-bottom"><span>{t('clubInformation')}</span><p>{t('clubDetailsPending')}</p><span className="plans-currency">{t('currencyTnd')}</span></section>
      </main>
    </PublicShell>
  )
}