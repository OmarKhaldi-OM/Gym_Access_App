import { useState, useEffect, useMemo } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as activityService from '../../services/activityService.js'
import { useT } from '../../context/I18nContext.jsx'

const chipMap = {
  entree: { key: 'entry', variant: 'positive' },
  sortie: { key: 'exit', variant: 'neutral' },
  refuse: { key: 'refusedStatus', variant: 'negative' },
}

const statusFilters = [
  { key: 'tous', labelKey: 'allStatuses' },
  { key: 'entree', labelKey: 'entries' },
  { key: 'sortie', labelKey: 'exits' },
  { key: 'refuse', labelKey: 'refused' },
]

const TODAY = new Date().toISOString().slice(0, 10)

export default function ActivityLog() {
  const t = useT()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('tous')
  const [todayOnly, setTodayOnly] = useState(false)

  useEffect(() => {
    activityService.getActivityLog()
      .then(setLogs)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== 'tous' && l.type !== statusFilter) return false
      if (todayOnly && l.date !== TODAY) return false
      return true
    })
  }, [logs, statusFilter, todayOnly])

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">{t('activity')}</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2 rounded-md text-base font-medium border ${
              statusFilter === f.key
                ? 'bg-coral text-graphite-bg border-coral'
                : 'bg-graphite-panel text-text-muted border-graphite-line hover:text-text-primary'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
        <button
          onClick={() => setTodayOnly((v) => !v)}
          className={`px-4 py-2 rounded-md text-base font-medium border ${
            todayOnly
              ? 'bg-coral text-graphite-bg border-coral'
              : 'bg-graphite-panel text-text-muted border-graphite-line hover:text-text-primary'
          }`}
        >
          {t('todayOnly')}
        </button>
      </div>

      <Panel>
        <SectionHeader title={`${filtered.length} ${t(filtered.length === 1 ? 'event' : 'events')}`} />
        <div>
          {loading && <ApiLoading message={t('loading')} />}
          <ApiError error={error} onRetry={() => {
            setLoading(true)
            setError(null)
            activityService.getActivityLog().then(setLogs).catch(setError).finally(() => setLoading(false))
          }} />
          {!loading && !error && filtered.length === 0 && (
            <ApiEmpty message={t('noEvents')} />
          )}
          {!loading && !error && filtered.map((log, i) => (
            <div
              key={log.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== filtered.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={log.memberArchived ? t('deletedMember') : log.membreNom} />
                <p className="text-lg font-semibold">{log.memberArchived ? t('deletedMember') : log.membreNom}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{log.heure}</span>
                <StatusChip variant={chipMap[log.type].variant}>
                  {t(chipMap[log.type].key)}
                </StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
