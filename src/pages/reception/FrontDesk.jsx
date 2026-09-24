import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import Button from '../../components/Button.jsx'

const todayActivity = [
  { name: 'Sana Mabrouk', entry: '09:42', exit: null },
  { name: 'Yassine Trabelsi', entry: '09:38', exit: null },
  { name: 'Nour Kefi', entry: '08:15', exit: '09:05' },
  { name: 'Wassim Jendoubi', entry: '07:50', exit: '09:20' },
  { name: 'Emna Gharbi', entry: '07:40', exit: null },
]

const pendingEnrollments = [
  { name: 'Yassine Trabelsi', since: 'Inscrit il y a 2 jours' },
  { name: 'Emna Gharbi', since: 'Inscrit il y a 1 jour' },
  { name: 'Karim Bouazizi', since: 'Inscrit il y a 4 heures' },
]

export default function FrontDesk() {
  return (
    <Layout role="reception">
      <h1 className="text-2xl font-bold mb-6">Accueil</h1>

      <div className="mb-8">
        <label className="block text-base font-medium text-text-muted mb-2">
          Rechercher un membre
        </label>
        <input
          type="text"
          placeholder="Nom du membre..."
          className="w-full max-w-md bg-graphite-panel border border-graphite-line rounded-md px-4 py-2.5 text-base placeholder:text-text-muted"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title="Présents aujourd'hui" />
          <div>
            {todayActivity.map((a, i) => (
              <div
                key={a.name}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== todayActivity.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={a.name} />
                  <p className="text-lg font-semibold">{a.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-text-muted">
                    Entrée {a.entry}
                    {a.exit ? ` — Sortie ${a.exit}` : ''}
                  </span>
                  {!a.exit && <StatusChip variant="positive">Présent</StatusChip>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="File d'enrôlement" />
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
                <Button>Inscrire</Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  )
}
