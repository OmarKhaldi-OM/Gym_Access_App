import { useState, useEffect, useMemo } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as activityService from '../../services/activityService.js'

const chipMap = {
  entree: { label: 'Entrée', variant: 'positive' },
  sortie: { label: 'Sortie', variant: 'neutral' },
  refuse: { label: 'Refusé', variant: 'negative' },
}

const statusFilters = [
  { key: 'tous', label: 'Tous les statuts' },
  { key: 'entree', label: 'Entrées' },
  { key: 'sortie', label: 'Sorties' },
  { key: 'refuse', label: 'Refusés' },
]

const TODAY = '2026-09-24'

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [statusFilter, setStatusFilter] = useState('tous')
  const [todayOnly, setTodayOnly] = useState(false)

  useEffect(() => {
    activityService.getActivityLog().then(setLogs)
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
      <h1 className="text-2xl font-bold mb-6">Journal d'activité</h1>

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
            {f.label}
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
          Aujourd'hui
        </button>
      </div>

      <Panel>
        <SectionHeader title={`${filtered.length} événement${filtered.length > 1 ? 's' : ''}`} />
        <div>
          {filtered.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              Aucun événement pour ce filtre.
            </p>
          )}
          {filtered.map((log, i) => (
            <div
              key={log.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== filtered.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar name={log.membreNom} />
                <p className="text-lg font-semibold">{log.membreNom}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-mono text-text-muted">{log.heure}</span>
                <StatusChip variant={chipMap[log.type].variant}>
                  {chipMap[log.type].label}
                </StatusChip>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  )
}
