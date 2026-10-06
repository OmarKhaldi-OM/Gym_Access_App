import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'
import { useT } from '../../context/I18nContext.jsx'

const TODAY = new Date().toISOString().slice(0, 10)

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
  const { pendingEnrollments, enroll } = useMembers()
  const { toastMessage, showToast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [todaySessions, setTodaySessions] = useState([])

  useEffect(() => {
    activityService.getActivityLog().then((entries) => setTodaySessions(pairTodaySessions(entries)))
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    memberService.searchMembers(query).then(setResults)
  }, [query])

  const handleEnroll = async (id, nom) => {
    if (await enroll(id)) showToast(`${nom} · ${t('enrolled')}`)
  }

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
            {results.length === 0 && (
              <p className="px-4 py-3 text-base font-medium text-text-muted">{t('noResults')}</p>
            )}
            {results.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.nom} />
                  <p className="text-base font-semibold">{m.nom}</p>
                </div>
                <StatusChip variant={m.statut === 'Actif' ? 'positive' : 'neutral'}>
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
            {todaySessions.length === 0 && (
              <p className="px-5 py-4 text-base font-medium text-text-muted">
                {t('noVisitsToday')}
              </p>
            )}
            {todaySessions.map((a, i) => (
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
            {pendingEnrollments.length === 0 && (
              <p className="px-5 py-4 text-base font-medium text-text-muted">
                {t('noPendingMembers')}
              </p>
            )}
            {pendingEnrollments.map((p, i) => (
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
                <Button onClick={() => handleEnroll(p.id, p.nom)}>{t('register')}</Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Toast message={toastMessage} />
    </Layout>
  )
}
