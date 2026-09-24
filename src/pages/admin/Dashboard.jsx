import Layout from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'

const pendingEnrollments = [
  { name: 'Yassine Trabelsi', since: 'Inscrit il y a 2 jours' },
  { name: 'Emna Gharbi', since: 'Inscrit il y a 1 jour' },
  { name: 'Karim Bouazizi', since: 'Inscrit il y a 4 heures' },
]

export default function Dashboard() {
  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Check-ins aujourd'hui" value="128" tone="coral" />
        <StatCard label="Tentatives refusées" value="4" tone="coral" />
        <StatCard label="Membres à enrôler" value="3" tone="teal" />
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
                <p className="text-lg font-semibold">{p.name}</p>
                <p className="text-base font-medium text-text-muted mt-0.5">{p.since}</p>
              </div>
              <Button>Enrôler</Button>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
