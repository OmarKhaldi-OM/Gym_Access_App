import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

const members = [
  { name: 'Sana Mabrouk', plan: 'Premium', status: 'Actif', joined: '12 Jan 2025', enrolled: true },
  { name: 'Yassine Trabelsi', plan: 'Basic', status: 'Actif', joined: '03 Fév 2025', enrolled: false },
  { name: 'Nour Kefi', plan: 'Premium', status: 'Actif', joined: '28 Nov 2024', enrolled: true },
  { name: 'Wassim Jendoubi', plan: 'Basic', status: 'Suspendu', joined: '17 Mar 2025', enrolled: true },
  { name: 'Emna Gharbi', plan: 'Premium', status: 'Actif', joined: '05 Sep 2025', enrolled: false },
  { name: 'Karim Bouazizi', plan: 'Basic', status: 'Actif', joined: '21 Aoû 2025', enrolled: false },
  { name: 'Amira Chaabane', plan: 'Premium', status: 'Actif', joined: '09 Avr 2025', enrolled: true },
]

export default function Members() {
  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Membres</h1>
        <input
          type="text"
          placeholder="Rechercher un membre..."
          className="bg-graphite-panel border border-graphite-line rounded-md px-4 py-2.5 text-base placeholder:text-text-muted w-64"
        />
      </div>

      <Panel>
        <SectionHeader title={`${members.length} membres`} />
        <div>
          {members.map((m, i) => (
            <div
              key={m.name}
              className={`grid grid-cols-5 items-center gap-4 px-5 py-4 ${
                i !== members.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={m.name} />
                <span className="text-lg font-semibold">{m.name}</span>
              </div>
              <span className="text-base font-medium text-text-muted">{m.plan}</span>
              <StatusChip variant={m.status === 'Actif' ? 'positive' : 'neutral'}>
                {m.status}
              </StatusChip>
              <span className="text-base font-mono text-text-muted">{m.joined}</span>
              <StatusChip variant={m.enrolled ? 'positive' : 'neutral'}>
                {m.enrolled ? 'Visage enrôlé' : 'Non enrôlé'}
              </StatusChip>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
