import Button from '../../components/Button.jsx'
import { ApiError } from '../../components/ApiState.jsx'
import { Panel } from '../../components/Panel.jsx'
import { useT } from '../../context/I18nContext.jsx'

function localToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function Field({ label, value, onChange, required = false, ...props }) {
  const t = useT()
  return (
    <label className="block text-sm font-medium">
      <span className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-700" aria-label={t('requiredField')}>*</span>}
      </span>
      <input
        {...props}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-11 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      />
    </label>
  )
}

export default function StaffAccountForm({
  account,
  form,
  onChange,
  onSubmit,
  onCancel,
  actionError,
  saving,
  isCreate = false,
}) {
  const t = useT()
  const update = (field, value) => onChange((current) => ({ ...current, [field]: value }))

  return (
    <Panel className="mx-auto max-w-3xl">
      <form className="space-y-6 p-5 sm:p-7" onSubmit={onSubmit}>
        <p className="text-sm text-text-muted">{t('requiredFieldsHint')}</p>
        <section aria-labelledby="staff-identity-heading">
          <div className="mb-4 border-b border-graphite-line pb-3">
            <h2 id="staff-identity-heading" className="text-lg font-semibold">{t('personalInformation')}</h2>
            {account && <p className="mt-1 text-sm text-text-muted">{t('staffAccountId')}: {account.id}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('firstName')} value={form.prenom} onChange={(value) => update('prenom', value)} required maxLength="255" autoComplete="given-name" />
            <Field label={t('lastName')} value={form.nom} onChange={(value) => update('nom', value)} required maxLength="255" autoComplete="family-name" />
            <Field label={t('email')} type="email" value={form.email} onChange={(value) => update('email', value)} required maxLength="255" autoComplete="email" />
            <Field label={t('phone')} type="tel" value={form.telephone} onChange={(value) => update('telephone', value)} maxLength="255" autoComplete="tel" />
          </div>
        </section>

        {isCreate && (
          <section aria-labelledby="staff-create-employment-heading">
            <div className="mb-4 border-b border-graphite-line pb-3">
              <h2 id="staff-create-employment-heading" className="text-lg font-semibold">{t('staffEmploymentDetails')}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                {t('staffRole')}
                <select
                  required
                  value={form.role}
                  onChange={(event) => update('role', event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5 text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  <option value="TRAINER">{t('trainerRole')}</option>
                  <option value="RECEPTIONIST">{t('receptionistRole')}</option>
                </select>
              </label>
              <Field label={t('hireDate')} type="date" value={form.dateEmbauche} onChange={(value) => update('dateEmbauche', value)} required max={localToday()} />
              {form.role === 'TRAINER' && (
                <Field label={t('specialty')} value={form.specialite} onChange={(value) => update('specialite', value)} required maxLength="255" />
              )}
            </div>
          </section>
        )}

        {isCreate && (
          <section aria-labelledby="staff-security-heading">
            <div className="mb-4 border-b border-graphite-line pb-3">
              <h2 id="staff-security-heading" className="text-lg font-semibold">{t('initialPassword')}</h2>
            </div>
            <div>
              <Field label={t('initialPassword')} type="password" value={form.motDePasse} onChange={(value) => update('motDePasse', value)} required minLength="8" autoComplete="new-password" />
              <p className="mt-1.5 text-sm text-text-muted">{t('initialPasswordHelp')}</p>
            </div>
          </section>
        )}

        {!isCreate && (
          <section aria-labelledby="staff-employment-heading">
            <div className="mb-4 border-b border-graphite-line pb-3">
              <h2 id="staff-employment-heading" className="text-lg font-semibold">{t('staffEmploymentDetails')}</h2>
              <p className="mt-1 text-sm text-text-muted">{t('staffRoleCannotChange')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('staffRole')} value={t(form.role === 'TRAINER' ? 'trainerRole' : 'receptionistRole')} onChange={() => {}} disabled />
              <Field label={t('hireDate')} type="date" value={form.dateEmbauche} onChange={(value) => update('dateEmbauche', value)} required max={localToday()} />
              {form.role === 'TRAINER' && (
                <Field label={t('specialty')} value={form.specialite} onChange={(value) => update('specialite', value)} required maxLength="255" />
              )}
            </div>
          </section>
        )}

        <ApiError error={actionError} fallbackMessage={t('staffSaveFailed')} />
        <div className="flex flex-col-reverse gap-3 border-t border-graphite-line pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={saving} onClick={onCancel}>{t('cancel')}</Button>
          <Button type="submit" disabled={saving}>{saving ? t('saving') : t(isCreate ? 'createStaff' : 'saveChanges')}</Button>
        </div>
      </form>
    </Panel>
  )
}
