import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import ClassDetailModal from '../../components/schedule/ClassDetailModal.jsx'
import CreateClassModal from '../../components/schedule/CreateClassModal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Toast from '../../components/Toast.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useClasses } from '../../context/ClassesContext.jsx'
import { useT } from '../../context/I18nContext.jsx'
import { getDaysForWeek } from '../../data/scheduleData.js'
import { useToast } from '../../hooks/useToast.js'

export default function ClassSchedule() {
  const { classes, loading, error, refresh, addClass, updateClass, deleteClass } = useClasses()
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [classToDelete, setClassToDelete] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const { toastMessage, showToast } = useToast()
  const t = useT()
  const baseDays = getDaysForWeek(0)
  const selectedClass = classes.find((item) => item.id === selected?.id) ?? null

  const handleDelete = async () => {
    if (!classToDelete) return
    await deleteClass(classToDelete.id)
    setSelected(null)
    showToast(t('classDeleted'))
  }

  const blocks = classes.map((c) => ({
    id: c.id,
    day: c.jour,
    start: c.heureDebut,
    end: c.heureFin,
    title: c.nom,
    subtitle: c.coachNom,
    date: c.date || baseDays.find((day) => day.key === c.jour)?.dateValue,
    meta: `${c.date ? `${c.date} · ` : ''}${c.studio} · ${c.placesRestantes}/${c.capaciteMax} ${t('spots')}`,
    muted: c.placesRestantes === 0,
    badge:
      c.placesRestantes === 0
        ? { text: 'Complet', tone: 'solid' }
        : { text: `${c.placesRestantes} places`, tone: 'teal' },
  }))

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('classSchedule')}</h1>
        <Button disabled={loading || Boolean(error)} onClick={() => setCreating(true)}>+ {t('createClass')}</Button>
      </div>

      <WeekNav weekOffset={weekOffset} onWeekChange={setWeekOffset} />
      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={refresh} />
      {!loading && !error && <ScheduleGrid blocks={blocks} weekOffset={weekOffset} onBlockClick={setSelected} />}

      <ClassDetailModal block={selected} onClose={() => setSelected(null)}>
        {selectedClass && <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setCreating(selectedClass)}>{t('editClass')}</Button>
          <Button className="flex-1 !bg-rose-100 !text-rose-800" onClick={() => setClassToDelete(selectedClass)}>{t('deleteClass')}</Button>
        </div>}
      </ClassDetailModal>
      {creating && <CreateClassModal initialClass={creating === true ? null : creating} onClose={() => setCreating(false)} onCreate={async (details) => { if (creating === true) await addClass(details); else await updateClass(creating.id, details); setCreating(false) }} />}
      {classToDelete && <ConfirmDialog
        title={t('confirmDeletion')}
        description={t('confirmDeleteClass')}
        itemName={classToDelete.nom}
        onClose={() => setClassToDelete(null)}
        onConfirm={handleDelete}
      />}
      <Toast message={toastMessage} />
    </Layout>
  )
}
