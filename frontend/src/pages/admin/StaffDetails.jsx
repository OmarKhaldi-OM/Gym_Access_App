import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'
import { Panel } from '../../components/Panel.jsx'
import Toast from '../../components/Toast.jsx'
import { useT } from '../../context/I18nContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as staffService from '../../services/staffService.js'
import { staffDetailsPath, staffListPath, staffRoleLabelKey } from './staffNavigation.js'

function Detail({ label, value }) {
  return (
    <div className="min-w-0 border-b border-graphite-line py-4 last:border-0">
      <dt className="text-sm font-medium text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-base font-semibold">{value || '—'}</dd>
    </div>
  )
}

export default function StaffDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const t = useT()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const listPath = staffListPath(new URLSearchParams(location.search))

  const loadAccount = async () => {
    setLoading(true)
    setError(null)
    try {
      setAccount(await staffService.getStaffAccount(id))
    } catch (loadError) {
      setError(loadError)
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAccount() }, [id])

  useEffect(() => {
    if (!location.state?.notification) return
    showToast(location.state.notification)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location, navigate, showToast])

  const role = account?.role === 'TRAINER' ? 'TRAINER' : 'RECEPTIONIST'
  const name = account ? [account.prenom, account.nom].filter(Boolean).join(' ') : ''
  const editPath = `${staffDetailsPath(id)}/edit${location.search}`

  return (
    <Layout role="admin">
      <div className="mb-6">
        <button type="button" onClick={() => navigate(listPath, { replace: true })} className="inline-flex min-h-10 items-center gap-2 rounded px-1 text-sm font-semibold text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime">
          <span aria-hidden="true">←</span> {t('backToStaffList')}
        </button>
      </div>

      {loading && <ApiLoading message={t('loading')} />}
      {error && (
        <Panel className="mx-auto max-w-3xl p-5 sm:p-7">
          <h1 className="text-2xl font-bold">{t(error.status === 404 ? 'staffAccountNotFound' : 'staffDetails')}</h1>
          <p className="mt-2 text-base text-text-muted">{t(error.status === 404 ? 'staffAccountMissingHelp' : 'staffAccountLoadFailed')}</p>
          <ApiError error={error} onRetry={loadAccount} retryLabel={t('retry')} />
          <Button variant="secondary" onClick={() => navigate(listPath)}>{t('backToStaffList')}</Button>
        </Panel>
      )}

      {!loading && !error && account && (
        <>
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">{t('staffAccounts')}</p>
              <h1 className="text-2xl font-bold">{t('staffDetails')}</h1>
            </div>
            <Button variant="secondary" onClick={() => navigate(editPath, { state: { returnTo: `${location.pathname}${location.search}` } })}>
              {t('editStaff')}
            </Button>
          </header>

          <Panel className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-5 border-b border-graphite-line p-5 sm:flex-row sm:items-center sm:p-7">
              <Avatar name={name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-bold">{name}</h2>
                <p className="mt-1 break-all text-base text-text-muted">{account.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal/20 px-3 py-1 text-sm font-semibold text-teal">{t(staffRoleLabelKey(role))}</span>
                  <span className="rounded-full border border-graphite-line bg-graphite-hover px-3 py-1 text-sm font-medium">
                    {t('staffStatusNotTracked')}
                  </span>
                </div>
              </div>
            </div>

            <section className="p-5 sm:p-7" aria-labelledby="staff-contact-heading">
              <h2 id="staff-contact-heading" className="border-b border-graphite-line pb-3 text-lg font-semibold">{t('personalInformation')}</h2>
              <dl className="grid gap-x-8 px-2 sm:grid-cols-2">
                <Detail label={t('firstName')} value={account.prenom} />
                <Detail label={t('lastName')} value={account.nom} />
                <Detail label={t('email')} value={account.email} />
                <Detail label={t('phone')} value={account.telephone} />
              </dl>
            </section>

            <section className="border-t border-graphite-line p-5 sm:p-7" aria-labelledby="staff-employment-heading">
              <h2 id="staff-employment-heading" className="border-b border-graphite-line pb-3 text-lg font-semibold">{t('staffEmploymentDetails')}</h2>
              <dl className="grid gap-x-8 px-2 sm:grid-cols-2">
                <Detail label={t('staffRole')} value={t(staffRoleLabelKey(role))} />
                <Detail label={t('hireDate')} value={account.dateEmbauche} />
                {role === 'TRAINER' && <Detail label={t('specialty')} value={account.specialite} />}
              </dl>
            </section>
          </Panel>
        </>
      )}

      <Toast message={toastMessage} variant={toastVariant} id={toastId} leaving={toastLeaving} onClose={dismissToast} />
    </Layout>
  )
}
