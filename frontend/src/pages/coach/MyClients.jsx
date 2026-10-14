import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as coachService from '../../services/coachService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useT } from '../../context/I18nContext.jsx'

export default function MyClients() {
  const t = useT()
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadClients = () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    coachService.getCoachClients(user.id).then(setClients).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { loadClients() }, [user?.id])

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">{t('myClients')}</h1>

      <Panel>
        <SectionHeader title={`${clients.length} ${t('members').toLowerCase()}`} />
        <div>
          {loading && <ApiLoading />}
          <ApiError error={error} onRetry={loadClients} />
          {!loading && !error && clients.length === 0 && <ApiEmpty message={t('noMembers')} />}
          {!loading && !error && clients.map((c, i) => (
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
                  <p className="text-base font-medium text-text-muted mt-0.5">{t('scheduledSessions')}: {c.bookingCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
