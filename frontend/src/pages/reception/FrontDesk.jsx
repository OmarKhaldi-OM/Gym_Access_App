import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import * as activityService from '../../services/activityService.js'
import { useT } from '../../context/I18nContext.jsx'

const now = new Date()
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

function pairTodaySessions(entries) {
  const byMember = new Map()
  ;[...entries]
    .filter((e) => e.date === TODAY)
    .reverse()
    .forEach((e) => {
      if (e.type === 'entree') {
        byMember.set(e.membreId, { nom: e.membreNom, entry: e.heure.slice(0, 5), exit: null })
      } else if (e.type === 'sortie' && byMember.has(e.membreId)) {
        byMember.get(e.membreId).exit = e.heure.slice(0, 5)
      }
    })
  return [...byMember.values()]
}

export default function FrontDesk() {
  const t = useT()
  const { members, pendingEnrollments, loading: membersLoading, error: membersError, refresh } = useMembers()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [todaySessions, setTodaySessions] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState(null)

  useEffect(() => {
    activityService.getActivityLog()
      .then((entries) => setTodaySessions(pairTodaySessions(entries)))
      .catch(setActivityError)
      .finally(() => setActivityLoading(false))
  }, [])

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const results = useMemo(() => members.filter((member) => member.nom.toLocaleLowerCase().includes(normalizedQuery)), [members, normalizedQuery])

  return (
    <Layout role="reception">
      <h1 className="text-2xl font-bold mb-6">Accueil</h1>

      <div className="mb-8">
        <label className="block text-base font-medium text-text-muted mb-2">
          Rechercher un membre
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('namePlaceholderMember')}
          className="w-full max-w-md bg-graphite-panel border border-graphite-line rounded-md px-4 py-2.5 text-base placeholder:text-text-muted"
        />
        {query.trim() && (
          <div className="mt-3 max-w-md rounded-xl border border-graphite-line bg-graphite-panel divide-y divide-graphite-line">
            {membersLoading && <ApiLoading message={t('loading')} />}
            {!membersLoading && !membersError && results.length === 0 && (
              <ApiEmpty message={t('noResults')} />
            )}
            {!membersLoading && !membersError && results.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.nom} />
                  <p className="text-base font-semibold">{m.nom}</p>
                </div>
                <StatusChip variant={m.statut === 'Actif' ? 'memberActive' : 'memberInactive'}>
                  {m.statut}
                </StatusChip>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title={t('presentToday')} />
          <div>
            {activityLoading && <ApiLoading message={t('loading')} />}
            <ApiError error={activityError} onRetry={() => {
              setActivityLoading(true)
              setActivityError(null)
              activityService.getActivityLog().then((entries) => setTodaySessions(pairTodaySessions(entries))).catch(setActivityError).finally(() => setActivityLoading(false))
            }} />
            {!activityLoading && !activityError && todaySessions.length === 0 && (
              <ApiEmpty message={t('noVisitsToday')} />
            )}
            {!activityLoading && !activityError && todaySessions.map((a, i) => (
              <div
                key={a.nom + i}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== todaySessions.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={a.nom} />
                  <p className="text-lg font-semibold">{a.nom}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-text-muted">
                    {t('entry')} {a.entry}
                    {a.exit ? ` — ${t('exit')} ${a.exit}` : ''}
                  </span>
                  {!a.exit && <StatusChip variant="positive">{t('present')}</StatusChip>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title={t('enrollmentQueue')} />
          <div>
            {membersLoading && <ApiLoading message={t('loading')} />}
            <ApiError error={membersError} onRetry={refresh} />
            {!membersLoading && !membersError && pendingEnrollments.length === 0 && (
              <ApiEmpty message={t('noPendingMembers')} />
            )}
            {!membersLoading && !membersError && pendingEnrollments.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== pendingEnrollments.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <div>
                  <p className="text-lg font-semibold">{p.nom}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">{p.daysSince === 0 ? t('registeredToday') : (p.daysSince === 1 ? t('registeredOneDay') : t('registeredDays').replace('{count}', p.daysSince))}</p>
                </div>
                <Button disabled={membersLoading} onClick={() => navigate(`/reception/face-recognition?memberId=${encodeURIComponent(p.id)}`)}>{t('register')}</Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  )
}
