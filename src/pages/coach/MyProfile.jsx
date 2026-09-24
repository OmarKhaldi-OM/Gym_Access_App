import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

export default function MyProfile() {
  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Rania Sfar" size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">Rania Sfar</p>
            <p className="text-base font-medium text-text-muted mt-0.5">rania.sfar@gym.com</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-base font-medium text-text-muted">Spécialité</p>
            <p className="text-lg font-semibold mt-1">Pilates, renforcement</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Coach depuis</p>
            <p className="text-lg font-mono mt-1">Mars 2023</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Studio principal</p>
            <p className="text-lg font-semibold mt-1">Studio A</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Cette semaine" />
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-base font-medium text-text-muted">Séances programmées</p>
          <p className="text-lg font-semibold">5</p>
        </div>
      </Panel>
    </Layout>
  )
}
