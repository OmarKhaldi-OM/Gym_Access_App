import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as activityService from '../../services/activityService.js'
import { useT } from '../../context/I18nContext.jsx'

export default function Dashboard() {
  const { pendingEnrollments, enroll } = useMembers()
  const { toastMessage, showToast } = useToast()
  const [activity, setActivity] = useState([])
  const t = useT()

  useEffect(() => {
    activityService.getActivityLog().then(setActivity)
  }, [])

  const checkInsToday = activity.filter((a) => a.type === 'entree').length
  const deniedToday = activity.filter((a) => a.type === 'refuse').length

  const handleEnroll = async (id, nom) => {
    if (await enroll(id)) showToast(`${nom} · ${t('enrolled')}`)
  }

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label={t('today')} value={checkInsToday} tone="coral" />
        <StatCard label={t('refused')} value={deniedToday} tone="coral" />
        <StatCard label={t('notEnrolled')} value={pendingEnrollments.length} tone="teal" />
      </div>

      <Panel>
        <SectionHeader title={t('notEnrolled')} />
        <div>
          {pendingEnrollments.length === 0 && (
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
