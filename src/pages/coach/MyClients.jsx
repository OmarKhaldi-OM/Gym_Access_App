import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const clients = [
  { name: 'Emna Gharbi', plan: 'Premium', lastSession: 'Aujourd\'hui 16:00' },
  { name: 'Yassine Trabelsi', plan: 'Basic', lastSession: 'Il y a 3 jours' },
  { name: 'Amira Chaabane', plan: 'Premium', lastSession: 'Il y a 1 semaine' },
]

export default function MyClients() {
  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">Mes clients</h1>

      <Panel>
        <SectionHeader title={`${clients.length} clients`} />
        <div>
          {clients.map((c, i) => (
            <div
              key={c.name}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== clients.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div>
                  <p className="text-lg font-semibold">{c.name}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">Plan {c.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">
                  Dernière séance : {c.lastSession}
                </span>
                <StatusChip variant="positive">Actif</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
