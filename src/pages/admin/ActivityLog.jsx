import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const logs = [
  { name: 'Sana Mabrouk', time: '09:42:11', type: 'in' },
  { name: 'Yassine Trabelsi', time: '09:38:47', type: 'in' },
  { name: 'Nour Kefi', time: '09:35:02', type: 'denied' },
  { name: 'Wassim Jendoubi', time: '09:20:15', type: 'out' },
  { name: 'Emna Gharbi', time: '09:12:33', type: 'in' },
  { name: 'Karim Bouazizi', time: '08:58:09', type: 'out' },
  { name: 'Amira Chaabane', time: '08:51:44', type: 'denied' },
]

const chipMap = {
  in: { label: 'Entrée', variant: 'positive' },
  out: { label: 'Sortie', variant: 'neutral' },
  denied: { label: 'Refusé', variant: 'negative' },
}

export default function ActivityLog() {
  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">Journal d'activité</h1>

      <div className="flex gap-3 mb-4">
        <div className="px-4 py-2 rounded-md border border-graphite-line bg-graphite-panel text-base font-medium text-text-muted">
          Toutes les entrées
        </div>
        <div className="px-4 py-2 rounded-md border border-graphite-line bg-graphite-panel text-base font-medium text-text-muted">
          Aujourd'hui
        </div>
        <div className="px-4 py-2 rounded-md border border-graphite-line bg-graphite-panel text-base font-medium text-text-muted">
          Tous les statuts
        </div>
      </div>

      <Panel>
        <SectionHeader title="Événements récents" />
        <div>
          {logs.map((log, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== logs.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={log.name} />
                <p className="text-lg font-semibold">{log.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{log.time}</span>
                <StatusChip variant={chipMap[log.type].variant}>
                  {chipMap[log.type].label}
                </StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
