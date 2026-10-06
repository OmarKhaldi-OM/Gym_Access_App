import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import ClassDetailModal from '../../components/schedule/ClassDetailModal.jsx'
import * as coachService from '../../services/coachService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function MySchedule() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [personalSessions, setPersonalSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (!user?.displayName) return
    coachService.getCoachSchedule(user.displayName).then((data) => {
      setClasses(data.classes)
      setPersonalSessions(data.personalSessions)
    })
  }, [user?.displayName])

  const classBlocks = classes.map((c) => ({
    id: c.id,
    day: c.jour,
    date: c.date,
    start: c.heureDebut,
    end: c.heureFin,
    title: c.nom,
    subtitle: 'groupClass',
    meta: c.studio,
    muted: c.placesRestantes === 0,
    badge:
      c.placesRestantes === 0
        ? { text: 'Complet', tone: 'solid' }
        : { text: `${c.placesRestantes} places`, tone: 'teal' },
  }))

  const personalBlocks = personalSessions.map((p) => ({
    id: p.id,
    day: p.jour,
    date: p.date,
    start: p.heureDebut,
    end: p.heureFin,
    title: 'personalSession',
    subtitle: `${p.clientNom}`,
    meta: p.studio,
    muted: false,
    badge: { text: '1 client', tone: 'muted' },
  }))

  const blocks = [...classBlocks, ...personalBlocks]

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-4">Mon planning</h1>
      <WeekNav weekOffset={weekOffset} onWeekChange={setWeekOffset} />
      <ScheduleGrid
        blocks={blocks}
        weekOffset={weekOffset}
        onBlockClick={setSelected}
        emptyMessage="noSessions"
      />
      <ClassDetailModal block={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}
