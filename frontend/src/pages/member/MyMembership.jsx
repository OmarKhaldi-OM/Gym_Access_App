import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import * as membershipService from '../../services/membershipService.js'

function formatDate(value, language) {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString(language)
}

function getLocalDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export default function MyMembership() {
  const { user } = useAuth()
  const t = useT()
  const { language } = useI18n()
  const [plans, setPlans] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [success, setSuccess] = useState(false)

  const loadMembership = useCallback((isActive = () => true) => {
    setLoading(true)
    setError(null)
    Promise.all([
      membershipService.getPlans(),
      membershipService.getMemberSubscriptions(user.id),
    ])
      .then(([availablePlans, memberSubscriptions]) => {
        if (!isActive()) return
        setPlans(availablePlans)
        setSubscriptions(memberSubscriptions)
        setSelectedPlanId((current) => current || availablePlans[0]?.id || '')
      })
      .catch((requestError) => {
        if (isActive()) setError(requestError)
      })
      .finally(() => {
        if (isActive()) setLoading(false)
      })
  }, [user.id])

  useEffect(() => {
    let active = true
    loadMembership(() => active)
    return () => { active = false }
  }, [loadMembership])

  const today = getLocalDate()
  const activeSubscription = useMemo(
    () => subscriptions
      .filter((item) => item.statut === 'ACTIVE' && item.dateFin >= today)
      .sort((a, b) => b.dateFin.localeCompare(a.dateFin))[0] || null,
    [subscriptions, today],
  )
  const latestSubscription = useMemo(
    () => [...subscriptions].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))[0] || null,
    [subscriptions],
  )
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)

  async function handleReactivate() {
    if (!selectedPlan) return
    setSubmitting(true)
    setActionError(null)
    setSuccess(false)
    try {
      const created = await membershipService.createSubscription(selectedPlan)
      setSubscriptions((current) => [...current, created])
      setSuccess(true)
    } catch (requestError) {
      setActionError(requestError)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Layout role="membre"><ApiLoading message={t('loading')} /></Layout>
  if (error) return (
    <Layout role="membre">
      <ApiError error={error} onRetry={() => loadMembership()} retryLabel={t('retry', 'Réessayer')} />
    </Layout>
  )

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('subscription')}</h1>

      <Panel className="p-6 mb-6">
        <SectionHeader title={t('membershipStatus')} />
        {success && <p className="mb-4 text-emerald-400" role="status">{t('membershipReactivated')}</p>}
        {activeSubscription ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold">{activeSubscription.planNom}</p>
            <p className="text-text-muted">
              {t('membershipActiveUntil')} {formatDate(activeSubscription.dateFin, language)}
            </p>
          </div>
        ) : latestSubscription ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold">{latestSubscription.planNom}</p>
            <p className="text-text-muted">
              {t('membershipExpired')} {formatDate(latestSubscription.dateFin, language)}
            </p>
          </div>
        ) : (
          <p className="text-text-muted">{t('noMembership')}</p>
        )}
      </Panel>

      {activeSubscription ? (
        <Panel className="p-6">
          <p>{t('membershipAlreadyActive')}</p>
        </Panel>
      ) : (
        <Panel className="p-6">
          <SectionHeader title={t('reactivateMembership')} />
          <p className="text-text-muted mb-5">{t('selectMembershipToReactivate')}</p>

          {plans.length === 0 ? (
            <ApiEmpty message={t('noPlansAvailable')} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => {
                  const selected = plan.id === selectedPlanId
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-lg border p-5 text-left transition-colors ${
                        selected
                          ? 'border-coral bg-coral/10'
                          : 'border-graphite-line bg-graphite-bg hover:border-text-muted'
                      }`}
                    >
                      <span className="block text-lg font-bold">{plan.nom}</span>
                      <span className="mt-2 block text-text-muted">
                        {plan.dureeJours} {t('days')} · {plan.prix} DT
                      </span>
                    </button>
                  )
                })}
              </div>
              {actionError && <ApiError error={actionError} />}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Button onClick={handleReactivate} disabled={!selectedPlan || submitting}>
                  {submitting ? t('loading') : t('reactivateMembership')}
                </Button>
                <span className="text-sm text-text-muted">{t('noPayment')}</span>
              </div>
            </>
          )}
        </Panel>
      )}
    </Layout>
  )
}
