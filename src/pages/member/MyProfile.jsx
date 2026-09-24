import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'

export default function MyProfile() {
  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Sana Mabrouk" size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">Sana Mabrouk</p>
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

      <Panel>
        <SectionHeader title="Mon abonnement" />
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Plan Premium</p>
            <p className="text-base font-medium text-text-muted mt-0.5">Renouvellement le 12 Oct 2026</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
      </Panel>
    </Layout>
  )
}
