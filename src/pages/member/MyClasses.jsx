import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import { classes, myBookings } from '../../data/scheduleData.js'

const blocks = myBookings
  .map((b) => {
    const c = classes.find((cl) => cl.id === b.classId)
    if (!c) return null
    const cancelled = b.status === 'cancelled'
    return {
      id: c.id,
      day: c.day,
      start: c.start,
      end: c.end,
      title: c.name,
      subtitle: c.coach,
      meta: c.studio,
      muted: cancelled,
      badge: cancelled
        ? { text: 'Annulé', tone: 'solid' }
        : { text: 'Réservé', tone: 'teal' },
    }
  })
  .filter(Boolean)

export default function MyClasses() {
  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-4">Mes cours</h1>
      <WeekNav />
      <ScheduleGrid blocks={blocks} emptyMessage="Aucun cours réservé cette semaine" />
    </Layout>
  )
}
