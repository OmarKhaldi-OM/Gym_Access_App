import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Toast from '../../components/Toast.jsx'
import { useT } from '../../context/I18nContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as staffService from '../../services/staffService.js'
import { staffDetailsPath, staffListPath } from './staffNavigation.js'

function fullName(account) {
  return [account.prenom, account.nom].filter(Boolean).join(' ')
}

export default function Staff() {
  const t = useT()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accountToDelete, setAccountToDelete] = useState(null)
  const query = searchParams.get('search') || ''
  const roleFilter = ['TRAINER', 'RECEPTIONIST'].includes(searchParams.get('role'))
    ? searchParams.get('role')
    : 'ALL'

  const loadAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await staffService.getStaffAccounts())
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAccounts() }, [])

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return accounts.filter((account) => {
      const matchesRole = roleFilter === 'ALL' || account.role === roleFilter
      const matchesQuery = `${fullName(account)} ${account.email}`.toLocaleLowerCase().includes(normalizedQuery)
      return matchesRole && matchesQuery
    })
  }, [accounts, query, roleFilter])

  const updateListState = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const openDetails = (account) => {
    const query = searchParams.toString()
    navigate(`${staffDetailsPath(account.id)}${query ? `?${query}` : ''}`)
  }

  const openEdit = (account) => {
    const returnTo = staffListPath(searchParams)
    const query = searchParams.toString()
    navigate(`${staffDetailsPath(account.id)}/edit${query ? `?${query}` : ''}`, {
      state: { returnTo },
    })
  }

  const openCreate = () => {
    const initialRole = roleFilter === 'RECEPTIONIST' ? 'RECEPTIONIST' : 'TRAINER'
    navigate(`/admin/staff/new?role=${initialRole}`, { state: { returnTo: listPath } })
  }

  const handleDelete = async () => {
    if (!accountToDelete) return
    await staffService.deleteStaffAccount(accountToDelete)
    setAccounts((current) => current.filter((account) => account.id !== accountToDelete.id))
    showToast(t('staffDeleted'))
  }

  const roleName = (role) => t(role === 'TRAINER' ? 'trainerRole' : 'receptionistRole')
  const listPath = staffListPath(searchParams)

  return (
    <Layout role="admin">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">{t('staffAccounts')}</p>
          <h1 className="text-2xl font-bold">{t('manageStaff')}</h1>
          <p className="mt-2 max-w-3xl text-base text-text-muted">{t('staffManagementHelp')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" disabled={loading} onClick={loadAccounts}>{t('refresh')}</Button>
          <Button disabled={loading || Boolean(error)} onClick={openCreate}>
            + {t('createStaff')}
          </Button>
        </div>
      </header>

      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={loadAccounts} retryLabel={t('retry')} />

      {!loading && !error && (
        <Panel>
          <SectionHeader title={`${t('staffAccounts')} (${results.length})`} />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
            <label className="w-full text-sm font-medium sm:max-w-sm">
              {t('searchStaff')}
              <input
                type="search"
                value={query}
                onChange={(event) => updateListState('search', event.target.value)}
                placeholder={t('searchStaffPlaceholder')}
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              />
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('filterStaffRole')}>
              {[
                ['ALL', 'allStaff'],
                ['TRAINER', 'trainerRole'],
                ['RECEPTIONIST', 'receptionistRole'],
              ].map(([role, label]) => (
                <Button
                  key={role}
                  type="button"
                  variant={roleFilter === role ? 'primary' : 'secondary'}
                  aria-pressed={roleFilter === role}
                  onClick={() => updateListState('role', role)}
                >
                  {t(label)}
                </Button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-graphite-line">
            {results.length === 0 && (
              <ApiEmpty
                message={accounts.length === 0 ? t('noStaffAccounts') : t('noStaffMatches')}
                action={(query || roleFilter !== 'ALL') && (
                  <Button variant="secondary" onClick={() => setSearchParams({}, { replace: true })}>
                    {t('clearFilters')}
                  </Button>
                )}
              />
            )}
            {results.map((account) => (
              <article key={account.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <button
                  type="button"
                  onClick={() => openDetails(account)}
                  className="min-w-0 rounded text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  aria-label={`${t('viewDetails')}: ${fullName(account)}`}
                >
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-semibold">{fullName(account)}</span>
                    <span className="rounded-full bg-teal/20 px-3 py-1 text-sm font-semibold text-teal">
                      {roleName(account.role)}
                    </span>
                  </span>
                  <span className="mt-1 block break-all text-base text-text-muted">{account.email}</span>
                  {account.specialite && (
                    <span className="mt-1 block text-sm text-text-muted">{t('specialty')}: {account.specialite}</span>
                  )}
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => openDetails(account)}>{t('viewDetails')}</Button>
                  <Button type="button" variant="secondary" onClick={() => openEdit(account)}>{t('editStaff')}</Button>
                  <Button type="button" className="!bg-rose-100 !text-rose-800" onClick={() => setAccountToDelete(account)}>
                    {t('deleteStaff')}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      )}

      {accountToDelete && (
        <ConfirmDialog
          title={t('confirmDeletion')}
          description={t('confirmDeleteStaff')}
          itemName={`${fullName(accountToDelete)} · ${roleName(accountToDelete.role)}`}
          onClose={() => setAccountToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
      <Toast message={toastMessage} variant={toastVariant} id={toastId} leaving={toastLeaving} onClose={dismissToast} />
    </Layout>
  )
}
