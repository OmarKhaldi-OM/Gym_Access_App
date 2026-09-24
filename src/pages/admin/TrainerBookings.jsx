import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const bookings = [
  { client: 'Sana Mabrouk', trainer: 'Wassim Jendoubi', time: "Aujourd'hui 17:00", status: 'confirmed' },
  { client: 'Emna Gharbi', trainer: 'Nour Kefi', time: "Aujourd'hui 18:30", status: 'confirmed' },
  { client: 'Karim Bouazizi', trainer: 'Wassim Jendoubi', time: 'Demain 09:00', status: 'pending' },
  { client: 'Amira Chaabane', trainer: 'Nour Kefi', time: '25 Sep 16:00', status: 'cancelled' },
]

const chipMap = {
  confirmed: { label: 'Confirmée', variant: 'positive' },
  pending: { label: 'En attente', variant: 'neutral' },
  cancelled: { label: 'Annulée', variant: 'negative' },
}

export default function TrainerBookings() {
  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">Réservations avec coach</h1>

      <Panel>
        <SectionHeader title="Sessions personnelles" />
        <div>
          {bookings.map((b, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== bookings.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={b.client} />
                <div>
                  <p className="text-lg font-semibold">{b.client}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">avec {b.trainer}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{b.time}</span>
                <StatusChip variant={chipMap[b.status].variant}>
                  {chipMap[b.status].label}
                </StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
