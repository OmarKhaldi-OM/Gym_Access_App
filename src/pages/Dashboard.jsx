import Layout from '../components/Layout.jsx'
import StatCard from '../components/StatCard.jsx'
import { Panel, SectionHeader } from '../components/Panel.jsx'
import StatusChip from '../components/StatusChip.jsx'
import CameraFeed from '../components/CameraFeed.jsx'
import Button from '../components/Button.jsx'

const devices = [
  { name: 'Entrée Principale', location: 'Hall d\'accueil', lastScan: '09:42:11', live: true },
  { name: 'Zone Musculation', location: 'Étage 1', lastScan: '09:41:58', live: true },
  { name: 'Studio Cours Collectifs', location: 'Étage 1', lastScan: '09:38:04', live: true },
  { name: 'Sortie Vestiaires', location: 'Rez-de-chaussée', lastScan: '08:56:22', live: false },
]

const pendingEnrollments = [
  { name: 'Yassine Trabelsi', since: 'Inscrit il y a 2 jours' },
  { name: 'Emna Gharbi', since: 'Inscrit il y a 1 jour' },
  { name: 'Karim Bouazizi', since: 'Inscrit il y a 4 heures' },
]

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Caméras en ligne" value="3/4" tone="teal" />
        <StatCard label="Check-ins aujourd'hui" value="128" tone="coral" />
        <StatCard label="Tentatives refusées" value="4" tone="coral" />
        <StatCard label="Enrôlements en attente" value="3" tone="teal" />
      </div>

      <h2 className="text-sm font-semibold mb-3">Caméras</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {devices.map((d) => (
          <Panel key={d.name} className="p-4">
            <CameraFeed live={d.live} className="mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{d.name}</p>
                <p className="text-xs text-text-muted">{d.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-text-muted mb-1">{d.lastScan}</p>
                <StatusChip variant={d.live ? 'positive' : 'neutral'}>
                  {d.live ? 'En ligne' : 'Hors ligne'}
                </StatusChip>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <SectionHeader title="Enrôlement facial en attente" />
        <div>
          {pendingEnrollments.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== pendingEnrollments.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-text-muted">{p.since}</p>
              </div>
              <Button>Enrôler</Button>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
