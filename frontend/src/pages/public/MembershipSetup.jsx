import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { PublicShell } from '../../components/PublicSite.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import * as membershipService from '../../services/membershipService.js'
import { hasMembershipHistory } from '../../membershipAccess.js'
import { formatMembershipNumber, getLocalizedMembershipName } from '../../membershipLocalization.js'

export default function MembershipSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const t = useT()
  const { language } = useI18n()
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(0)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      membershipService.getPlans(),
      membershipService.getMemberSubscriptions(user.id),
    ])
      .then(([availablePlans, subscriptions]) => {
        if (!active) return
        if (hasMembershipHistory(subscriptions)) {
          setAlreadyEnrolled(true)
          return
        }
        setPlans(availablePlans)
        setSelectedPlanId((current) => (
          [searchParams.get('plan'), current].find((candidate) =>
            availablePlans.some((plan) => plan.id === candidate),
          ) || availablePlans[0]?.id || ''
        ))
      })
      .catch((loadError) => {
        if (active) setError(loadError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user.id, retry, searchParams])

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedPlan || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await membershipService.createSubscription(selectedPlan)
      navigate('/membre/dashboard', { replace: true })
    } catch (enrollmentError) {
      setError(enrollmentError)
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadyEnrolled) return <Navigate to="/membre/dashboard" replace />

  return (
    <PublicShell>
      <main className="plans-page">
        <section className="plans-heading">
          <p className="eyebrow"><span className="live-dot" /> {t('memberSpace').toUpperCase()}</p>
          <h1>{t('membershipSetupTitle')}</h1>
          <p>{t('membershipSetupHelp')}</p>
        </section>
        <section className="mx-auto max-w-5xl px-5 pb-16">
          {loading && <ApiLoading message={t('loading')} />}
          <ApiError
            error={error}
            onRetry={() => setRetry((current) => current + 1)}
            retryLabel={t('retry', 'Réessayer')}
          />
          {!loading && !error && plans.length === 0 && (
            <ApiEmpty
              message={t('noPlansAvailable')}
              action={<button type="button" className="button button-dark" onClick={() => setRetry((current) => current + 1)}>{t('retry', 'Réessayer')}</button>}
            />
          )}
          {!loading && !error && plans.length > 0 && (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const selected = plan.id === selectedPlanId
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-lg border p-5 text-start transition-colors ${
                        selected
                          ? 'border-coral bg-coral/10'
                          : 'border-graphite-line bg-graphite-bg hover:border-text-muted'
                      }`}
                    >
                      <span className="block text-lg font-bold">{getLocalizedMembershipName(plan, language, t('planNameUnavailable'))}</span>
                      <span className="mt-2 block text-text-muted">
                        <bdi>{formatMembershipNumber(plan.dureeJours, language)}</bdi> {t('days')} · <bdi>{formatMembershipNumber(plan.prix, language)} {t('currencyTnd')}</bdi>
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedPlan && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button className="button button-lime" type="submit" disabled={submitting}>
                    {submitting ? t('loading') : t('selectMembership')}
                  </button>
                  <span className="text-sm text-text-muted">{t('noPayment')}</span>
                </div>
              )}
            </form>
          )}
          <p className="mt-8 text-sm text-text-muted">
            <Link className="text-link" to="/plans">{t('compare')}</Link>
          </p>
        </section>
      </main>
    </PublicShell>
  )
}
