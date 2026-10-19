import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import Toast from '../../components/Toast.jsx'
import { useToast } from '../../hooks/useToast.js'
import { getLocalizedMembershipName } from '../../membershipLocalization.js'

export default function MemberList({ role, memberPath }) {
  const t = useT()
  const { language } = useI18n()
  const { members, loading, error, refresh } = useMembers()
  const location = useLocation()
  const navigate = useNavigate()
  const { toastMessage, toastVariant, toastId, toastLeaving, showToast, dismissToast } = useToast()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = useMemo(() => members.filter((member) => member.nom.toLocaleLowerCase().includes(normalizedQuery)), [members, normalizedQuery])

  useEffect(() => {
    if (!location.state?.notification) return
    showToast(location.state.notification)
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate, showToast])

  return (
    <Layout role={role}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('members')}</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchMember')}
          aria-label={t('searchMember')}
          className="bg-graphite-panel border border-graphite-line rounded-md px-4 py-2.5 text-base placeholder:text-text-muted w-64"
        />
      </div>

      <Panel>
        <SectionHeader title={`${results.length} ${results.length === 1 ? t('member') : t('members').toLowerCase()}`} />
        <div>
          {loading && <ApiLoading message={t('loading')} />}
          <ApiError error={error} onRetry={refresh} />
          {!loading && !error && results.length === 0 && (
            <ApiEmpty message={t('noMembers')} action={query.trim() ? <button type="button" className="text-sm font-semibold underline" onClick={() => setQuery('')}>{t('clearSearch')}</button> : null} />
          )}
          {!loading && !error && results.map((member, index) => (
            <Link
              to={`${memberPath}/${member.id}`}
              key={member.id}
              className={`grid grid-cols-5 items-center gap-4 px-5 py-4 hover:bg-graphite-hover ${
                index !== results.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.nom} />
                <span className="text-lg font-semibold">{member.nom}</span>
              </div>
              <span className="text-base font-medium text-text-muted">{getLocalizedMembershipName(member, language, t('planNameUnavailable'))}</span>
              <StatusChip variant={member.statut === 'Actif' ? 'memberActive' : 'memberInactive'}>
                {t(member.statut === 'Actif' ? 'active' : 'inactive')}
              </StatusChip>
              <span className="text-base font-mono text-text-muted">
                {new Date(member.dateInscription).toLocaleDateString(language)}
              </span>
              <StatusChip variant={member.visageEnrole ? 'enrollmentComplete' : 'enrollmentPending'}>
                {t(member.visageEnrole ? 'enrolled' : 'notEnrolled')}
              </StatusChip>
            </Link>
          ))}
        </div>
      </Panel>
      <Toast message={toastMessage} variant={toastVariant} id={toastId} leaving={toastLeaving} onClose={dismissToast} />
    </Layout>
  )
}
