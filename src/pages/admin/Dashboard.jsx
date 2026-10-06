import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { ApiError } from '../../components/ApiState.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as activityService from '../../services/activityService.js'
import { useT } from '../../context/I18nContext.jsx'

export default function Dashboard() {
  const { pendingEnrollments, enroll, loading: membersLoading, error: membersError, refresh: refreshMembers } = useMembers()
  const { toastMessage, showToast } = useToast()
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState(null)
  const t = useT()

  const loadActivity = () => {
    setActivityLoading(true)
    setActivityError(null)
    activityService.getActivityLog().then(setActivity).catch(setActivityError).finally(() => setActivityLoading(false))
  }

  useEffect(() => { loadActivity() }, [])

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayActivity = activity.filter((item) => item.date === todayKey)
  const checkInsToday = todayActivity.filter((a) => a.type === 'entree').length
  const deniedToday = todayActivity.filter((a) => a.type === 'refuse').length

  const handleEnroll = async (id, nom) => {
    if (await enroll(id)) showToast(`${nom} · ${t('enrolled')}`)
  }

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label={t('today')} value={activityLoading ? '…' : checkInsToday} tone="coral" />
        <StatCard label={t('refused')} value={activityLoading ? '…' : deniedToday} tone="coral" />
        <StatCard label={t('notEnrolled')} value={membersLoading ? '…' : pendingEnrollments.length} tone="teal" />
      </div>

      <ApiError error={activityError} onRetry={loadActivity} />
      <ApiError error={membersError ? new Error(membersError) : null} onRetry={refreshMembers} />
      <Panel>
        <SectionHeader title={t('notEnrolled')} />
        <div>
          {membersLoading && <p className="px-5 py-4 text-base font-medium text-text-muted" role="status">{t('loading')}</p>}
          {!membersLoading && !membersError && pendingEnrollments.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              {t('noMembers')}
            </p>
          )}
          {pendingEnrollments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i !== pendingEnrollments.length - 1 ? 'border-b border-graphite-line' : ''
              }`}
            >
              <div>
                <p className="text-lg font-semibold">{p.nom}</p>
                <p className="text-base font-medium text-text-muted mt-0.5">{p.daysSince === 0 ? t('registeredToday') : (p.daysSince === 1 ? t('registeredOneDay') : t('registeredDays').replace('{count}', p.daysSince))}</p>
              </div>
              <Button onClick={() => handleEnroll(p.id, p.nom)}>{t('enrolled')}</Button>
            </div>
          ))}
        </div>
      </Panel>

      <Toast message={toastMessage} />
    </Layout>
  )
}
