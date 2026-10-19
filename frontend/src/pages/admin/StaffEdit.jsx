import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import Button from '../../components/Button.jsx'
import { Panel } from '../../components/Panel.jsx'
import { useT } from '../../context/I18nContext.jsx'
import * as staffService from '../../services/staffService.js'
import StaffAccountForm from './StaffAccountForm.jsx'
import { staffDetailsPath, staffListPath } from './staffNavigation.js'

const blankForm = (role = 'TRAINER') => ({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  dateEmbauche: '',
  specialite: '',
  motDePasse: '',
  role,
})

function accountForm(account) {
  return {
    nom: account.nom || '',
    prenom: account.prenom || '',
    email: account.email || '',
    telephone: account.telephone || '',
    dateEmbauche: account.dateEmbauche || '',
    specialite: account.specialite || '',
    motDePasse: '',
    role: account.role,
  }
}

export default function StaffEdit({ isCreate = false }) {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const t = useT()
  const [account, setAccount] = useState(null)
  const [form, setForm] = useState(() => blankForm(searchParams.get('role') === 'RECEPTIONIST' ? 'RECEPTIONIST' : 'TRAINER'))
  const [loading, setLoading] = useState(!isCreate)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const detailsPath = id ? `${staffDetailsPath(id)}${location.search}` : null
  const fallbackReturnPath = isCreate ? staffListPath(searchParams) : detailsPath
  const returnTo = location.state?.returnTo || fallbackReturnPath

  const loadAccount = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const loaded = await staffService.getStaffAccount(id)
      setAccount(loaded)
      setForm(accountForm(loaded))
    } catch (error) {
      setLoadError(error)
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isCreate) loadAccount()
  }, [id, isCreate])

  const cancel = () => navigate(returnTo, { replace: true })

  const submit = async (event) => {
    event.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setActionError(null)
    const payload = {
      ...(isCreate ? {} : { id }),
      role: form.role,
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone.trim() || null,
      dateEmbauche: form.dateEmbauche,
      ...(form.role === 'TRAINER' ? { specialite: form.specialite.trim() } : {}),
      ...(isCreate ? { motDePasse: form.motDePasse } : {}),
    }

    try {
      const saved = isCreate
        ? await staffService.createStaffAccount(payload)
        : await staffService.updateStaffAccount(payload)
      const preservedQuery = isCreate && returnTo.startsWith('/admin/staff?')
        ? returnTo.slice('/admin/staff'.length)
        : location.search
      navigate(`${staffDetailsPath(saved.id)}${preservedQuery}`, {
        replace: true,
        state: { notification: t(isCreate ? 'staffCreated' : 'staffUpdated') },
      })
    } catch (error) {
      setActionError(error)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const title = t(isCreate ? 'createStaff' : 'editStaff')
  const roleName = t(form.role === 'TRAINER' ? 'trainerRole' : 'receptionistRole')

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={cancel}
            className="inline-flex min-h-10 items-center gap-2 rounded px-1 text-sm font-semibold text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <span aria-hidden="true">←</span> {t(isCreate ? 'backToStaffList' : (returnTo === detailsPath ? 'backToDetails' : 'backToStaffList'))}
          </button>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-text-muted">{t('staffAccounts')}</p>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
          {!isCreate && account && <p className="mt-2 text-sm text-text-muted">{roleName} · {t('staffAccountId')}: {account.id}</p>}
        </div>
      </div>

      {loading && <ApiLoading message={t('loading')} />}
      {loadError && (
        <Panel className="mx-auto max-w-3xl p-5 sm:p-7">
          <h2 className="text-xl font-bold">{t(loadError.status === 404 ? 'staffAccountNotFound' : 'staffAccountLoadTitle')}</h2>
          <p className="mt-2 text-base text-text-muted">{t(loadError.status === 404 ? 'staffAccountMissingHelp' : 'staffAccountLoadFailed')}</p>
          <ApiError error={loadError} onRetry={loadAccount} retryLabel={t('retry')} />
          <Button variant="secondary" onClick={() => navigate(staffListPath(searchParams), { replace: true })}>{t('backToStaffList')}</Button>
        </Panel>
      )}
      {!loading && !loadError && (isCreate || account) && (
        <StaffAccountForm
          account={account}
          form={form}
          onChange={setForm}
          onSubmit={submit}
          onCancel={cancel}
          actionError={actionError}
          saving={saving}
          isCreate={isCreate}
        />
      )}
    </Layout>
  )
}
