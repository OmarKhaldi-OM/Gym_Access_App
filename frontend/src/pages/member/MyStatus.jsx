import { useState, useEffect, useCallback } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useT } from '../../context/I18nContext.jsx'
import { useI18n } from '../../context/I18nContext.jsx'

function pairSessions(entries) {
  const sessions = []
  let open = null
  ;[...entries].reverse().forEach((e) => {
    if (e.type === 'entree') {
      open = { date: e.date, entry: e.heure.slice(0, 5), exit: null }
      sessions.push(open)
    } else if (e.type === 'sortie' && open && open.date === e.date && !open.exit) {
      open.exit = e.heure.slice(0, 5)
    }
  })
  return sessions.reverse()
}

export default function MyStatus() {
  const { user } = useAuth()
  const memberId = user?.id
  const t = useT()
  const { language } = useI18n()
  const [member, setMember] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStatus = useCallback((isActive = () => true) => {
    setLoading(true)
    setError(null)
    Promise.all([
      memberService.getMemberById(memberId),
      activityService.getMemberActivity(memberId),
    ])
      .then(([memberData, entries]) => {
        if (!isActive()) return
        setMember(memberData)
        setSessions(pairSessions(entries))
      })
      .catch((requestError) => {
        if (isActive()) setError(requestError)
      })
      .finally(() => {
        if (isActive()) setLoading(false)
      })
  }, [memberId])

  useEffect(() => {
    let active = true
    loadStatus(() => active)
    return () => { active = false }
  }, [loadStatus])

  if (loading) return <Layout role="membre"><ApiLoading message={t('loading')} /></Layout>
  if (error || !member) return (
    <Layout role="membre">
      <ApiError error={error || new Error(t('requestFailed', 'Impossible de charger votre statut.'))} onRetry={loadStatus} />
    </Layout>
  )

  const current = sessions.find((s) => !s.exit)

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('status')}</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.nom} size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">{member.nom}</p>
            <p className="text-base font-medium text-text-muted mt-0.5">{t('plan')} {t(member.plan)}</p>
          </div>
          <StatusChip variant={member.statut === 'Actif' ? 'positive' : 'neutral'}>
            {member.statut}
          </StatusChip>
        </div>
        <div className="mt-5 pt-5 border-t border-graphite-line flex items-center justify-between">
          <span className="text-lg font-medium text-text-muted">{t('exit')}</span>
          <div className="flex items-center gap-3">
            <span className="text-base font-mono text-text-muted">
              {sessions[0] ? `${t('entry')} ${sessions[0].entry}` : t('noPassages')}
            </span>
            {current && <StatusChip variant="positive">{t('active')}</StatusChip>}
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title={t('activity')} />
        <div>
          {sessions.length === 0 && <ApiEmpty message={t('noPassages')} />}
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <span className="text-base font-medium text-text-muted">
                {new Date(s.date).toLocaleDateString(language)}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-base font-mono text-text-muted">
                  {t('entry')} {s.entry}
                  {s.exit ? ` — ${t('exit')} ${s.exit}` : ''}
                </span>
                {!s.exit && <StatusChip variant="positive">{t('active')}</StatusChip>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
