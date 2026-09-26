import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as coachService from '../../services/coachService.js'

const COACH_NAME = 'Rania Sfar'

export default function MyClients() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    coachService.getCoachClients(COACH_NAME).then(setClients)
  }, [])

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">Mes clients</h1>

      <Panel>
        <SectionHeader title={`${clients.length} clients`} />
        <div>
          {clients.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== clients.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={c.nom} />
                <div>
                  <p className="text-lg font-semibold">{c.nom}</p>
                  <p className="text-base font-medium text-text-muted mt-0.5">Plan {c.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">
                  Dernière séance : {c.derniereSeance}
                </span>
                <StatusChip variant="positive">Actif</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
