import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as trainerBookingService from '../../services/trainerBookingService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'

const chipMap = {
  confirmee: { key: 'confirmed', variant: 'positive' },
  en_attente: { key: 'pending', variant: 'neutral' },
  annulee: { key: 'cancelled', variant: 'negative' },
}

export default function MyTrainerSessions() {
  const t = useT()
  const { language } = useI18n()
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSessions = () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    trainerBookingService.getBookingsForClient(user.id).then(setSessions).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { loadSessions() }, [user?.id])

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('myCoachSessions')}</h1>

      <Panel>
        <SectionHeader title={t('myCoachSessions')} />
        <div>
          {loading && <ApiLoading message={t('loading')} />}
          <ApiError error={error} onRetry={loadSessions} />
          {!loading && !error && sessions.length === 0 && <ApiEmpty message={t('noSessions')} />}
          {!loading && !error && sessions.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={s.coachNom} />
                <div>
                  <p className="text-lg font-semibold">{s.coachNom}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">{t('personalCoach')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <time className="text-base text-text-muted" dateTime={s.dateTime}>{new Date(s.dateTime).toLocaleString(language, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                <StatusChip variant={(chipMap[s.statut] || chipMap.en_attente).variant}>{t((chipMap[s.statut] || chipMap.en_attente).key)}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
