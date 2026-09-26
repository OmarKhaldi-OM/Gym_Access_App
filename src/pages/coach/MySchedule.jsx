import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import ClassDetailModal from '../../components/schedule/ClassDetailModal.jsx'
import * as coachService from '../../services/coachService.js'

const COACH_NAME = 'Rania Sfar'

export default function MySchedule() {
  const [classes, setClasses] = useState([])
  const [personalSessions, setPersonalSessions] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    coachService.getCoachSchedule(COACH_NAME).then((data) => {
      setClasses(data.classes)
      setPersonalSessions(data.personalSessions)
    })
  }, [])

  const classBlocks = classes.map((c) => ({
    id: c.id,
    day: c.jour,
    start: c.heureDebut,
    end: c.heureFin,
    title: c.nom,
    subtitle: 'Cours collectif',
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
    start: p.heureDebut,
    end: p.heureFin,
    title: 'Séance perso',
    subtitle: `Avec ${p.clientNom}`,
    meta: p.studio,
    muted: false,
    badge: { text: '1 client', tone: 'muted' },
  }))

  const blocks = [...classBlocks, ...personalBlocks]

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-4">Mon planning</h1>
      <WeekNav />
      <ScheduleGrid
        blocks={blocks}
        onBlockClick={setSelected}
        emptyMessage="Aucune séance programmée cette semaine"
      />
      <ClassDetailModal block={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}
