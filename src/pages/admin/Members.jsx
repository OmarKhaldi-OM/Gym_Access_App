import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import * as memberService from '../../services/memberService.js'
import { useI18n, useT } from '../../context/I18nContext.jsx'

export default function Members() {
  const t = useT()
  const { language } = useI18n()
  const { members } = useMembers()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    memberService.searchMembers(query).then(setResults)
  }, [query, members])

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
          {results.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              {t('noMembers')}
            </p>
          )}
          {results.map((m, i) => (
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
              <StatusChip variant={m.statut === 'Actif' ? 'positive' : 'neutral'}>
                {m.statut}
              </StatusChip>
              <span className="text-base font-mono text-text-muted">
                {new Date(m.dateInscription).toLocaleDateString(language)}
              </span>
              <StatusChip variant={m.visageEnrole ? 'positive' : 'neutral'}>
                {m.visageEnrole ? 'Visage enrôlé' : 'Non enrôlé'}
              </StatusChip>
            </Link>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
