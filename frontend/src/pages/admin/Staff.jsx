import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Toast from '../../components/Toast.jsx'
import { useT } from '../../context/I18nContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as staffService from '../../services/staffService.js'

const emptyForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  motDePasse: '',
  dateEmbauche: '',
  specialite: '',
  role: 'TRAINER',
}

function fullName(account) {
  return [account.prenom, account.nom].filter(Boolean).join(' ')
}

function localToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

export default function Staff() {
  const t = useT()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [editingAccount, setEditingAccount] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)

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

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = useMemo(() => accounts.filter((account) => {
    const matchesRole = roleFilter === 'ALL' || account.role === roleFilter
    const matchesQuery = `${fullName(account)} ${account.email}`.toLocaleLowerCase().includes(normalizedQuery)
    return matchesRole && matchesQuery
  }), [accounts, normalizedQuery, roleFilter])

  const openCreateForm = () => {
    setForm({ ...emptyForm })
    setEditingAccount(null)
    setActionError(null)
    setFormOpen(true)
  }

  const openEditForm = (account) => {
    setForm({
      nom: account.nom || '',
      prenom: account.prenom || '',
      email: account.email || '',
      telephone: account.telephone || '',
      motDePasse: '',
      dateEmbauche: account.dateEmbauche || '',
      specialite: account.specialite || '',
      role: account.role,
    })
    setEditingAccount(account)
    setActionError(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingAccount(null)
    setForm({ ...emptyForm })
    setActionError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setActionError(null)
    const accountData = {
      ...(editingAccount ? { id: editingAccount.id } : {}),
      role: form.role,
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim().toLowerCase(),
      telephone: form.telephone.trim() || null,
      dateEmbauche: form.dateEmbauche,
      ...(form.role === 'TRAINER' ? { specialite: form.specialite.trim() } : {}),
      ...(!editingAccount ? { motDePasse: form.motDePasse } : {}),
    }

    try {
      const saved = editingAccount
        ? await staffService.updateStaffAccount(accountData)
        : await staffService.createStaffAccount(accountData)
      const savedAccount = { ...saved, telephone: accountData.telephone, role: form.role }
      setAccounts((current) => editingAccount
        ? current.map((account) => account.id === savedAccount.id ? savedAccount : account)
        : [...current, savedAccount])
      setSelectedAccount(savedAccount)
      showToast(t(editingAccount ? 'staffUpdated' : 'staffCreated'))
      closeForm()
    } catch (saveError) {
      setActionError(saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!accountToDelete) return
    await staffService.deleteStaffAccount(accountToDelete)
    setAccounts((current) => current.filter((account) => account.id !== accountToDelete.id))
    if (selectedAccount?.id === accountToDelete.id) setSelectedAccount(null)
    if (editingAccount?.id === accountToDelete.id) closeForm()
    showToast(t('staffDeleted'))
  }

  const roleName = (role) => t(role === 'TRAINER' ? 'trainerRole' : 'receptionistRole')

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('manageStaff')}</h1>
          <p className="mt-2 max-w-3xl text-base text-text-muted">{t('staffManagementHelp')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" disabled={loading} onClick={loadAccounts}>{t('refresh')}</Button>
          {!formOpen && <Button disabled={loading || Boolean(error)} onClick={openCreateForm}>+ {t('createStaff')}</Button>}
        </div>
      </div>

      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={loadAccounts} retryLabel={t('retry')} />

      {formOpen && (
        <Panel className="mb-6">
          <SectionHeader title={t(editingAccount ? 'editStaff' : 'createStaff')} />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-medium">
              {t('firstName')}
              <input required maxLength="255" autoComplete="given-name" value={form.prenom} onChange={(event) => setForm({ ...form, prenom: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
            </label>
            <label className="text-sm font-medium">
              {t('lastName')}
              <input required maxLength="255" autoComplete="family-name" value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
            </label>
            <label className="text-sm font-medium">
              {t('email')}
              <input required type="email" maxLength="255" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
            </label>
            <label className="text-sm font-medium">
              {t('phone')}
              <input type="tel" maxLength="255" autoComplete="tel" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
            </label>
            <label className="text-sm font-medium">
              {t('staffRole')}
              <select disabled={Boolean(editingAccount)} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary">
                <option value="TRAINER">{t('trainerRole')}</option>
                <option value="RECEPTIONIST">{t('receptionistRole')}</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              {t('hireDate')}
              <input required type="date" max={localToday()} value={form.dateEmbauche} onChange={(event) => setForm({ ...form, dateEmbauche: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
            </label>
            {form.role === 'TRAINER' && (
              <label className="text-sm font-medium sm:col-span-2">
                {t('specialty')}
                <input required maxLength="255" value={form.specialite} onChange={(event) => setForm({ ...form, specialite: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
              </label>
            )}
            {!editingAccount && (
              <label className="text-sm font-medium sm:col-span-2">
                {t('initialPassword')}
                <input required type="password" minLength="8" autoComplete="new-password" value={form.motDePasse} onChange={(event) => setForm({ ...form, motDePasse: event.target.value })} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary" />
                <span className="mt-1 block text-sm text-text-muted">{t('initialPasswordHelp')}</span>
              </label>
            )}
            <ApiError error={actionError} fallbackMessage={t('staffSaveFailed')} />
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? t('saving') : t(editingAccount ? 'saveChanges' : 'createStaff')}</Button>
              <Button type="button" variant="secondary" disabled={saving} onClick={closeForm}>{t('cancel')}</Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <SectionHeader title={`${t('staffAccounts')} (${results.length})`} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <label className="w-full text-sm font-medium sm:max-w-sm">
            {t('searchStaff')}
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchStaffPlaceholder')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary placeholder:text-text-muted" />
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
                onClick={() => setRoleFilter(role)}
              >
                {t(label)}
              </Button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-graphite-line">
          {!loading && !error && results.length === 0 && (
            <ApiEmpty message={accounts.length === 0 ? t('noStaffAccounts') : t('noStaffMatches')} action={(query || roleFilter !== 'ALL') && <Button variant="secondary" onClick={() => { setQuery(''); setRoleFilter('ALL') }}>{t('clearFilters')}</Button>} />
          )}
          {!loading && !error && results.map((account) => (
            <article key={account.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">{fullName(account)}</h2>
                  <span className="rounded-full bg-teal/20 px-3 py-1 text-sm font-semibold text-teal">{roleName(account.role)}</span>
                </div>
                <p className="mt-1 break-all text-base text-text-muted">{account.email}</p>
                {account.specialite && <p className="mt-1 text-sm text-text-muted">{t('specialty')}: {account.specialite}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => { setSelectedAccount(account); setFormOpen(false) }}>{t('viewDetails')}</Button>
                <Button type="button" variant="secondary" onClick={() => openEditForm(account)}>{t('editStaff')}</Button>
                <Button type="button" className="!bg-rose-100 !text-rose-800" onClick={() => setAccountToDelete(account)}>{t('deleteStaff')}</Button>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      {selectedAccount && (
        <Panel className="mt-6">
          <SectionHeader title={t('staffDetails')} />
          <dl className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-sm text-text-muted">{t('fullName')}</dt><dd className="mt-1 font-semibold">{fullName(selectedAccount)}</dd></div>
            <div><dt className="text-sm text-text-muted">{t('staffRole')}</dt><dd className="mt-1 font-semibold">{roleName(selectedAccount.role)}</dd></div>
            <div><dt className="text-sm text-text-muted">{t('email')}</dt><dd className="mt-1 break-all font-semibold">{selectedAccount.email}</dd></div>
            <div><dt className="text-sm text-text-muted">{t('phone')}</dt><dd className="mt-1 font-semibold">{selectedAccount.telephone || '—'}</dd></div>
            <div><dt className="text-sm text-text-muted">{t('hireDate')}</dt><dd className="mt-1 font-semibold">{selectedAccount.dateEmbauche || '—'}</dd></div>
            {selectedAccount.role === 'TRAINER' && <div><dt className="text-sm text-text-muted">{t('specialty')}</dt><dd className="mt-1 font-semibold">{selectedAccount.specialite || '—'}</dd></div>}
            <p className="text-sm text-text-muted sm:col-span-2 lg:col-span-3">{t('staffStatusUnavailable')}</p>
          </dl>
          <div className="flex gap-3 px-5 pb-5">
            <Button variant="secondary" onClick={() => openEditForm(selectedAccount)}>{t('editStaff')}</Button>
            <Button variant="secondary" onClick={() => setSelectedAccount(null)}>{t('close')}</Button>
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
