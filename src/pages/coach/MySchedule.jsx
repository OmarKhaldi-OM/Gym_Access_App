import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import { classes, personalSessions } from '../../data/scheduleData.js'

const COACH_NAME = 'Rania Sfar'

const classBlocks = classes
  .filter((c) => c.coach === COACH_NAME)
  .map((c) => ({
    id: c.id,
    day: c.day,
    start: c.start,
    end: c.end,
    title: c.name,
    subtitle: 'Cours collectif',
    meta: c.studio,
    muted: c.spots === 0,
    badge:
      c.spots === 0
        ? { text: 'Complet', tone: 'solid' }
        : { text: `${c.spots} places`, tone: 'teal' },
  }))

const personalBlocks = personalSessions
  .filter((p) => p.coach === COACH_NAME)
  .map((p) => ({
    id: p.id,
    day: p.day,
    start: p.start,
    end: p.end,
    title: 'Séance perso',
    subtitle: `Avec ${p.client}`,
    meta: p.studio,
    muted: false,
    badge: { text: '1 client', tone: 'muted' },
  }))

const blocks = [...classBlocks, ...personalBlocks]

export default function MySchedule() {
  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-4">Mon planning</h1>
      <WeekNav />
      <ScheduleGrid blocks={blocks} emptyMessage="Aucune séance programmée cette semaine" />
    </Layout>
  )
}
