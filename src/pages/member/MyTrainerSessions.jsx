import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
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

  useEffect(() => {
    if (user?.id) trainerBookingService.getBookingsForClient(user.id).then(setSessions)
  }, [user?.id])

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('myCoachSessions')}</h1>

      <Panel>
        <SectionHeader title={t('myCoachSessions')} />
        <div>
          {sessions.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              {t('noSessions')}
            </p>
          )}
          {sessions.map((s, i) => (
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
                <StatusChip variant={chipMap[s.statut].variant}>{t(chipMap[s.statut].key)}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
