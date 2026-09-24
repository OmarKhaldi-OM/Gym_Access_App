import Layout from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import { classes } from '../../data/scheduleData.js'

const blocks = classes.map((c) => ({
  id: c.id,
  day: c.day,
  start: c.start,
  end: c.end,
  title: c.name,
  subtitle: c.coach,
  meta: c.studio,
  muted: c.spots === 0,
  badge:
    c.spots === 0
      ? { text: 'Complet', tone: 'solid' }
      : { text: `${c.spots} places`, tone: 'teal' },
}))

export default function ClassSchedule() {
  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Planning des cours</h1>
        <Button>Ajouter un cours</Button>
      </div>

      <WeekNav />
      <ScheduleGrid blocks={blocks} />
    </Layout>
  )
}
