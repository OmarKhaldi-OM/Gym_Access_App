import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as trainerBookingService from '../../services/trainerBookingService.js'

const chipMap = {
  confirmee: { label: 'Confirmée', variant: 'positive' },
  en_attente: { label: 'En attente', variant: 'neutral' },
  annulee: { label: 'Annulée', variant: 'negative' },
}

export default function TrainerBookings() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    trainerBookingService.getTrainerBookings().then(setBookings)
  }, [])

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">Réservations avec coach</h1>

      <Panel>
        <SectionHeader title="Sessions personnelles" />
        <div>
          {bookings.map((b, i) => (
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
                  <p className="text-base font-medium text-text-muted mt-0.5">avec {b.coachNom}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{b.quand}</span>
                <StatusChip variant={chipMap[b.statut].variant}>{chipMap[b.statut].label}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
