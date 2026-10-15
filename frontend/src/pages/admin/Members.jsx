import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'

export default function Members() {
  const t = useT()
  const { language } = useI18n()
  const { members, loading, error, refresh } = useMembers()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = useMemo(() => members.filter((member) => member.nom.toLocaleLowerCase().includes(normalizedQuery)), [members, normalizedQuery])

  return (
    <Layout role="admin">
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
            <ApiEmpty message={t('noMembers')} action={query.trim() ? <button type="button" className="text-sm font-semibold underline" onClick={() => setQuery('')}>{t('clearSearch', 'Effacer la recherche')}</button> : null} />
          )}
          {!loading && !error && results.map((m, i) => (
            <Link
              to={`/admin/members/${m.id}`}
              key={m.id}
              className={`grid grid-cols-5 items-center gap-4 px-5 py-4 hover:bg-graphite-hover ${
                i !== results.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={m.nom} />
                <span className="text-lg font-semibold">{m.nom}</span>
              </div>
              <span className="text-base font-medium text-text-muted">{m.plan}</span>
              <StatusChip variant={m.statut === 'Actif' ? 'memberActive' : 'memberInactive'}>
                {m.statut}
              </StatusChip>
              <span className="text-base font-mono text-text-muted">
                {new Date(m.dateInscription).toLocaleDateString(language)}
              </span>
              <StatusChip variant={m.visageEnrole ? 'enrollmentComplete' : 'enrollmentPending'}>
                {m.visageEnrole ? 'Visage enrôlé' : 'Non enrôlé'}
              </StatusChip>
            </Link>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
