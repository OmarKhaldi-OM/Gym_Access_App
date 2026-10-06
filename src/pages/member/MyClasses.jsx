import { useState } from 'react'
import Layout from '../../components/Layout.jsx'
import WeekNav from '../../components/schedule/WeekNav.jsx'
import ScheduleGrid from '../../components/schedule/ScheduleGrid.jsx'
import ClassDetailModal from '../../components/schedule/ClassDetailModal.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useClasses } from '../../context/ClassesContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import { useT } from '../../context/I18nContext.jsx'

export default function MyClasses() {
  const { classes, myBookings, loading, error, refresh, bookClass, cancelBooking } = useClasses()
  const { toastMessage, showToast } = useToast()
  const t = useT()
  const [selectedId, setSelectedId] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const myBookingFor = (classeId) =>
    myBookings.find((b) => b.classeId === classeId && b.statut === 'confirmee')

  const blocks = classes.map((c) => {
    const booking = myBookingFor(c.id)
    const full = c.placesRestantes === 0

    let badge
    if (booking) badge = { text: 'Réservé', tone: 'teal' }
    else if (full) badge = { text: 'Complet', tone: 'solid' }
    else badge = { text: `${c.placesRestantes} places`, tone: 'teal' }

    return {
      id: c.id,
      day: c.jour,
      date: c.date,
      start: c.heureDebut,
      end: c.heureFin,
      title: c.nom,
      subtitle: c.coachNom,
      meta: c.studio,
      muted: full && !booking,
      badge,
    }
  })

  const selectedClass = classes.find((c) => c.id === selectedId) ?? null
  const selectedBlock = selectedClass
    ? blocks.find((b) => b.id === selectedClass.id)
    : null
  const selectedBooking = selectedClass ? myBookingFor(selectedClass.id) : null

  const handleBook = async () => {
    try {
      await bookClass(selectedClass.id)
      showToast(`${t('reserved')}: ${selectedClass.nom}`)
    } catch (error) {
      window.dispatchEvent(new Event('gate:api-error-dismiss'))
      showToast(error.message || t('classIsFull'))
    }
    setSelectedId(null)
  }

  const handleCancel = async () => {
    await cancelBooking(selectedBooking.id)
    showToast(`${t('bookingCancelled')}: ${selectedClass.nom}`)
    setSelectedId(null)
  }

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-4">{t('myClasses')}</h1>
      <WeekNav weekOffset={weekOffset} onWeekChange={setWeekOffset} />
      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={refresh} />
      {!loading && !error && <ScheduleGrid blocks={blocks} weekOffset={weekOffset} onBlockClick={(b) => setSelectedId(b.id)} />}

      <ClassDetailModal block={selectedBlock} onClose={() => setSelectedId(null)}>
        {selectedBooking ? (
          <Button variant="secondary" className="w-full" disabled={loading} onClick={handleCancel}>
            {t('cancelBooking')}
          </Button>
        ) : selectedClass && selectedClass.placesRestantes > 0 ? (
          <Button className="w-full" disabled={loading} onClick={handleBook}>
            {t('reserve')}
          </Button>
        ) : (
          <p className="text-base font-medium text-text-muted w-full text-center">
            {t('classIsFull')}
          </p>
        )}
      </ClassDetailModal>

      <Toast message={toastMessage} />
    </Layout>
  )
}
