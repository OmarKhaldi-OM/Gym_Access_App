import Layout from '../components/Layout.jsx'
import { Panel, SectionHeader } from '../components/Panel.jsx'
import StatusChip from '../components/StatusChip.jsx'
import Avatar from '../components/Avatar.jsx'

const history = [
  { time: '09:42:11', date: 'Aujourd\'hui', type: 'in' },
  { time: '18:05:33', date: 'Hier', type: 'out' },
  { time: '17:12:02', date: 'Hier', type: 'in' },
  { time: '19:40:18', date: '20 Sep', type: 'out' },
]

const classes = [
  { name: 'Yoga Matinal', time: 'Lun 07:00', studio: 'Studio A' },
  { name: 'CrossTraining', time: 'Mer 18:30', studio: 'Studio B' },
]

export default function MemberProfile() {
  return (
    <Layout>
      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Sana Mabrouk" size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">Sana Mabrouk</h1>
            <p className="text-sm text-text-muted">sana.mabrouk@example.com</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-xs text-text-muted">Plan</p>
            <p className="text-sm font-semibold mt-1">Premium</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Membre depuis</p>
            <p className="text-sm font-mono mt-1">12 Jan 2025</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Enrôlement facial</p>
            <StatusChip variant="positive">3 photos enregistrées</StatusChip>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title="Historique des passages" />
          <div>
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3 ${
                  i !== history.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <span className="text-sm text-text-muted">{h.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-text-muted">{h.time}</span>
                  <StatusChip variant={h.type === 'in' ? 'positive' : 'neutral'}>
                    {h.type === 'in' ? 'Entrée' : 'Sortie'}
                  </StatusChip>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="Cours réservés" />
          <div>
            {classes.map((c, i) => (
              <div
                key={c.name}
                className={`px-5 py-3 ${
                  i !== classes.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{c.time} · {c.studio}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  )
}
