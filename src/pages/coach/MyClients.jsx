import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as coachService from '../../services/coachService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useT } from '../../context/I18nContext.jsx'

export default function MyClients() {
  const t = useT()
  const { user } = useAuth()
  const [clients, setClients] = useState([])

  useEffect(() => {
    if (user?.displayName) coachService.getCoachClients(user.displayName).then(setClients)
  }, [user?.displayName])

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">{t('myClients')}</h1>

      <Panel>
        <SectionHeader title={`${clients.length} ${t('members').toLowerCase()}`} />
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
                  <p className="text-base font-medium text-text-muted mt-0.5">{t('plan')} {t(c.plan)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">
                  {t('lastSession')}: {c.daysSinceLastSession === 0 ? `${t('today')} ${c.lastSessionTime}` : (c.daysSinceLastSession === 7 ? t('weekAgo') : t('daysAgo').replace('{count}', c.daysSinceLastSession))}
                </span>
                <StatusChip variant="positive">Active</StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
