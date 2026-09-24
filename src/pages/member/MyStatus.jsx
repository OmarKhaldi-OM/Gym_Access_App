import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const sessions = [
  { date: "Aujourd'hui", entry: '09:42', exit: null },
  { date: 'Hier', entry: '17:12', exit: '18:05' },
  { date: '20 Sep', entry: '16:20', exit: '19:40' },
]

export default function MyStatus() {
  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mon statut</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Sana Mabrouk" size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">Sana Mabrouk</p>
            <p className="text-base font-medium text-text-muted mt-0.5">Plan Premium</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
        <div className="mt-5 pt-5 border-t border-graphite-line flex items-center justify-between">
          <span className="text-lg font-medium text-text-muted">Dernier passage</span>
          <div className="flex items-center gap-3">
            <span className="text-base font-mono text-text-muted">Entrée 09:42</span>
            <StatusChip variant="positive">En cours</StatusChip>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Historique récent" />
        <div>
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <span className="text-base font-medium text-text-muted">{s.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-base font-mono text-text-muted">
                  Entrée {s.entry}
                  {s.exit ? ` — Sortie ${s.exit}` : ''}
                </span>
                {!s.exit && <StatusChip variant="positive">En cours</StatusChip>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
