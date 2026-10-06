import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import ClassDetailModal from '../../components/schedule/ClassDetailModal.jsx'
import { useClasses } from '../../context/ClassesContext.jsx'
import { useT } from '../../context/I18nContext.jsx'

export default function Schedule() {
  const t = useT()
  const { classes } = useClasses()
  const [selected, setSelected] = useState(null)

  const blocks = classes.map((c) => ({
    id: c.id,
    day: c.jour,
    start: c.heureDebut,
    end: c.heureFin,
    title: c.nom,
    subtitle: c.coachNom,
    meta: `${c.studio} · ${c.placesRestantes}/${c.capaciteMax} ${t('spots')}`,
    muted: c.placesRestantes === 0,
    badge:
      c.placesRestantes === 0
        ? { text: 'Complet', tone: 'solid' }
        : { text: `${c.placesRestantes} places`, tone: 'teal' },
  }))

  return (
    <Layout role="reception">
      <h1 className="text-2xl font-bold mb-4">{t('classSchedule')}</h1>
      <WeekNav />
      <ScheduleGrid blocks={blocks} onBlockClick={setSelected} />
      <ClassDetailModal block={selected} onClose={() => setSelected(null)} />
    </Layout>
  )
}
