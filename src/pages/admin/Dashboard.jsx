import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import StatCard from '../../components/StatCard.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { useMembers } from '../../context/MembersContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import * as activityService from '../../services/activityService.js'

export default function Dashboard() {
  const { pendingEnrollments, enroll } = useMembers()
  const { toastMessage, showToast } = useToast()
  const [activity, setActivity] = useState([])

  useEffect(() => {
    activityService.getActivityLog().then(setActivity)
  }, [])

  const checkInsToday = activity.filter((a) => a.type === 'entree').length
  const deniedToday = activity.filter((a) => a.type === 'refuse').length

  const handleEnroll = async (id, nom) => {
    await enroll(id)
    showToast(`${nom} a été inscrit à l'enrôlement facial`)
  }

  return (
    <Layout role="admin">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Check-ins aujourd'hui" value={checkInsToday} tone="coral" />
        <StatCard label="Tentatives refusées" value={deniedToday} tone="coral" />
        <StatCard label="Membres à enrôler" value={pendingEnrollments.length} tone="teal" />
      </div>

      <Panel>
        <SectionHeader title="Enrôlement facial en attente" />
        <div>
          {pendingEnrollments.length === 0 && (
            <p className="px-5 py-4 text-base font-medium text-text-muted">
              Aucun membre en attente d'enrôlement.
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
                <p className="text-base font-medium text-text-muted mt-0.5">{p.since}</p>
              </div>
              <Button onClick={() => handleEnroll(p.id, p.nom)}>Enrôler</Button>
            </div>
          ))}
        </div>
      </Panel>

      <Toast message={toastMessage} />
    </Layout>
  )
}
