import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const sessions = [
  { trainer: 'Wassim Jendoubi', time: "Aujourd'hui 17:00", status: 'confirmed' },
  { trainer: 'Nour Kefi', time: 'Demain 09:00', status: 'pending' },
  { trainer: 'Wassim Jendoubi', time: '25 Sep 16:00', status: 'cancelled' },
]

const chipMap = {
  confirmed: { label: 'Confirmée', variant: 'positive' },
  pending: { label: 'En attente', variant: 'neutral' },
  cancelled: { label: 'Annulée', variant: 'negative' },
}

export default function MyTrainerSessions() {
  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mes séances avec coach</h1>

      <Panel>
        <SectionHeader title="Prochaines séances" />
        <div>
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={s.trainer} />
                <div>
                  <p className="text-lg font-semibold">{s.trainer}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">Coach personnel</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{s.time}</span>
                <StatusChip variant={chipMap[s.status].variant}>{chipMap[s.status].label}</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
