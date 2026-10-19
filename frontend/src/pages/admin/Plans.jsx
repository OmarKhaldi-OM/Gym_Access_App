import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import Button from '../../components/Button.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Toast from '../../components/Toast.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as membershipService from '../../services/membershipService.js'
import { formatMembershipNumber, getLocalizedMembershipName } from '../../membershipLocalization.js'

const emptyForm = { nom: '', nomEn: '', nomAr: '', prix: '', dureeJours: '', actif: true }

export default function AdminPlans() {
  const t = useT()
  const { language } = useI18n()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  const loadPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      setPlans(await membershipService.getPlansForManagement())
    } catch (loadError) {
      setError(loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlans() }, [])

  const openCreateForm = () => {
    setForm(emptyForm)
    setEditingPlan(null)
    setActionError(null)
    setFormOpen(true)
  }

  const openEditForm = (plan) => {
    setForm({
      nom: plan.nom,
      nomEn: plan.nomEn || '',
      nomAr: plan.nomAr || '',
      prix: String(plan.prix),
      dureeJours: String(plan.dureeJours),
      actif: plan.actif,
    })
    setEditingPlan(plan)
    setActionError(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingPlan(null)
    setForm(emptyForm)
    setActionError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setActionError(null)
    const planData = {
      nom: form.nom.trim(),
      nomEn: form.nomEn.trim(),
      nomAr: form.nomAr.trim(),
      prix: Number(form.prix),
      dureeJours: Number(form.dureeJours),
      actif: form.actif,
    }
    try {
      const savedPlan = editingPlan
        ? await membershipService.updatePlan(editingPlan.id, planData)
        : await membershipService.createPlan(planData)
      setPlans((current) => editingPlan
        ? current.map((plan) => plan.id === savedPlan.id ? savedPlan : plan)
        : [...current, savedPlan])
      showToast(t(editingPlan ? 'planUpdated' : 'planCreated'))
      closeForm()
    } catch (saveError) {
      setActionError(saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!planToDelete) return
    await membershipService.deletePlan(planToDelete.id)
    setPlans((current) => current.filter((item) => item.id !== planToDelete.id))
    if (editingPlan?.id === planToDelete.id) closeForm()
    showToast(t('planDeleted'))
  }

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('managePlans')}</h1>
        {!formOpen && <Button disabled={loading || Boolean(error)} onClick={openCreateForm}>+ {t('createPlan')}</Button>}
      </div>

      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={loadPlans} retryLabel={t('retry')} />
      <ApiError error={actionError} onRetry={() => setActionError(null)} retryLabel={t('close')} />

      {formOpen && (
        <Panel className="mb-6">
          <SectionHeader title={t(editingPlan ? 'editPlan' : 'createPlan')} />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-medium sm:col-span-2">
              {t('planName')}
              <input
                required
                maxLength={255}
                dir="auto"
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary"
                value={form.nom}
                onChange={(event) => setForm({ ...form, nom: event.target.value })}
              />
            </label>
            <label className="text-sm font-medium">
              {t('planNameEnglish')}
              <input
                required
                maxLength={255}
                dir="auto"
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary"
                value={form.nomEn}
                onChange={(event) => setForm({ ...form, nomEn: event.target.value })}
              />
            </label>
            <label className="text-sm font-medium">
              {t('planNameArabic')}
              <input
                required
                maxLength={255}
                dir="auto"
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary"
                value={form.nomAr}
                onChange={(event) => setForm({ ...form, nomAr: event.target.value })}
              />
            </label>
            <label className="text-sm font-medium">
              {t('planPrice')}
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary"
                value={form.prix}
                onChange={(event) => setForm({ ...form, prix: event.target.value })}
              />
            </label>
            <label className="text-sm font-medium">
              {t('planDuration')}
              <input
                required
                type="number"
                min="1"
                step="1"
                className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary"
                value={form.dureeJours}
                onChange={(event) => setForm({ ...form, dureeJours: event.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(event) => setForm({ ...form, actif: event.target.checked })}
              />
              {t('planAvailable')}
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? t('loading') : t(editingPlan ? 'saveChanges' : 'createPlan')}</Button>
              <Button type="button" variant="secondary" disabled={saving} onClick={closeForm}>{t('cancel')}</Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <SectionHeader title={`${t('plans')} (${plans.length})`} />
        <div>
          {!loading && !error && plans.length === 0 && (
            <ApiEmpty message={t('noPlansAvailable')} action={!formOpen && <Button onClick={openCreateForm}>{t('createPlan')}</Button>} />
          )}
          {!loading && !error && plans.map((plan) => (
            <article key={plan.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-line p-5 last:border-0">
              <div>
                <h2 className="text-lg font-semibold">{getLocalizedMembershipName(plan, language, t('planNameUnavailable'))}</h2>
                <p className="text-text-muted"><bdi>{formatMembershipNumber(plan.prix, language)} {t('currencyTnd')}</bdi> · <bdi>{formatMembershipNumber(plan.dureeJours, language)}</bdi> {t('days')}</p>
                <p className="text-sm text-text-muted">{t(plan.actif ? 'active' : 'inactive')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" disabled={saving} onClick={() => openEditForm(plan)}>{t('editPlan')}</Button>
                <Button className="!bg-rose-100 !text-rose-800" disabled={saving} onClick={() => setPlanToDelete(plan)}>{t('deletePlan')}</Button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      {planToDelete && <ConfirmDialog
        title={t('confirmDeletion')}
        description={t('confirmDeletePlan')}
        itemName={getLocalizedMembershipName(planToDelete, language, t('planNameUnavailable'))}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDelete}
      />}
      <Toast message={toastMessage} variant={toastVariant} id={toastId} leaving={toastLeaving} onClose={dismissToast} />
    </Layout>
  )
}
