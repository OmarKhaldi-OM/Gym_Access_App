import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as trainerBookingService from '../../services/trainerBookingService.js'
import { useI18n, useT } from '../../context/I18nContext.jsx'

const chipMap = {
  confirmee: { key: 'confirmed', variant: 'positive' },
  en_attente: { key: 'pending', variant: 'neutral' },
  annulee: { key: 'cancelled', variant: 'negative' },
  terminee: { key: 'completed', variant: 'positive' },
}

export default function TrainerBookings() {
  const t = useT()
  const { language } = useI18n()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBookings = () => {
    setLoading(true)
    setError(null)
    trainerBookingService.getTrainerBookings().then(setBookings).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { loadBookings() }, [])

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">{t('trainerReservations')}</h1>

      <Panel>
        <SectionHeader title={t('personalSessions')} />
        <div>
          {loading && <ApiLoading message={t('loading')} />}
          <ApiError error={error} onRetry={loadBookings} />
          {!loading && !error && bookings.length === 0 && <ApiEmpty message={t('noSessions')} />}
          {!loading && !error && bookings.map((b, i) => (
            <div
              key={b.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== bookings.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={b.clientNom} />
                <div>
                  <p className="text-lg font-semibold">{b.clientNom}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">{t('withCoach')} {b.coachNom}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <time className="text-base text-text-muted" dateTime={b.dateTime}>{new Date(b.dateTime).toLocaleString(language, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                <StatusChip variant={(chipMap[b.statut] || chipMap.en_attente).variant}>{t((chipMap[b.statut] || chipMap.en_attente).key)}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
