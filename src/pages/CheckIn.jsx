import Layout from '../components/Layout.jsx'
import { Panel } from '../components/Panel.jsx'
import StatusChip from '../components/StatusChip.jsx'
import Avatar from '../components/Avatar.jsx'

export default function CheckIn() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Entrée Principale</h1>

      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="h-56 w-56 rounded-full border-4 border-teal bg-graphite-panel flex items-center justify-center">
          <span className="text-text-muted text-sm font-mono">SCAN EN COURS</span>
        </div>
        <p className="text-2xl font-bold text-teal">Accès autorisé</p>
      </div>

      <Panel className="max-w-md mx-auto p-5">
        <div className="flex items-center gap-4">
          <Avatar name="Sana Mabrouk" size="lg" />
          <div className="flex-1">
            <p className="text-lg font-semibold">Sana Mabrouk</p>
            <p className="text-sm text-text-muted">Plan Premium</p>
          </div>
          <StatusChip variant="positive">Actif</StatusChip>
        </div>
        <div className="mt-4 pt-4 border-t border-graphite-line flex justify-between text-sm">
          <span className="text-text-muted">Dernier passage</span>
          <span className="font-mono text-text-muted">09:42:11</span>
        </div>
      </Panel>
    </Layout>
  )
}
