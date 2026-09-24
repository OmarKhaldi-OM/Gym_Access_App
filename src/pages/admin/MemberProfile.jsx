import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const sessions = [
  { date: "Aujourd'hui", entry: '09:42', exit: null },
  { date: 'Hier', entry: '17:12', exit: '18:05' },
  { date: '20 Sep', entry: '16:20', exit: '19:40' },
  { date: '18 Sep', entry: '08:05', exit: '09:30' },
]

const classes = [
  { name: 'Yoga Matinal', time: 'Lun 07:00', studio: 'Studio A' },
  { name: 'CrossTraining', time: 'Mer 18:30', studio: 'Studio B' },
]

export default function MemberProfile() {
  return (
    <Layout role="admin">
      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Sana Mabrouk" size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">Sana Mabrouk</h1>
            <p className="text-base font-medium text-text-muted mt-0.5">sana.mabrouk@example.com</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-base font-medium text-text-muted">Plan</p>
            <p className="text-lg font-semibold mt-1">Premium</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Membre depuis</p>
            <p className="text-lg font-mono mt-1">12 Jan 2025</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Enrôlement facial</p>
            <div className="mt-1">
              <StatusChip variant="positive">3 photos enregistrées</StatusChip>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title="Historique des passages" />
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

        <Panel>
          <SectionHeader title="Cours réservés" />
          <div>
            {classes.map((c, i) => (
              <div
                key={c.name}
                className={`px-5 py-4 ${
                  i !== classes.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <p className="text-lg font-semibold">{c.name}</p>
                <p className="text-base font-medium text-text-muted mt-0.5">
                  {c.time} · {c.studio}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  )
}
