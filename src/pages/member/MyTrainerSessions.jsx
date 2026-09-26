import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as trainerBookingService from '../../services/trainerBookingService.js'

const MY_NAME = 'Sana Mabrouk'

const chipMap = {
  confirmee: { label: 'Confirmée', variant: 'positive' },
  en_attente: { label: 'En attente', variant: 'neutral' },
  annulee: { label: 'Annulée', variant: 'negative' },
}

export default function MyTrainerSessions() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    trainerBookingService.getBookingsForClient(MY_NAME).then(setSessions)
  }, [])

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mes séances avec coach</h1>

      <Panel>
        <SectionHeader title="Mes séances" />
        <div>
          {sessions.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              Aucune séance programmée.
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
                  <p className="text-base font-medium text-text-muted mt-0.5">Coach personnel</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{s.quand}</span>
                <StatusChip variant={chipMap[s.statut].variant}>{chipMap[s.statut].label}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
