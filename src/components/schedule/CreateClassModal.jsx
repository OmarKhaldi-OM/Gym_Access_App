import { useEffect, useState } from 'react'
import { ApiError } from '../ApiState.jsx'
import { useT } from '../../context/I18nContext.jsx'
import * as coachingRequestService from '../../services/coachingRequestService.js'

const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const initialForm = { nom: '', date: defaultDate, heureDebut: '09:00', heureFin: '10:00', coachNom: '', studio: 'Studio A', capaciteMax: 10 }

function dayFromDate(dateValue) {
  const dayKeys = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  return dayKeys[new Date(`${dateValue}T12:00:00`).getDay()]
}

export default function CreateClassModal({ onClose, onCreate, initialClass = null }) {
  const t = useT()
  const [form, setForm] = useState(() => initialClass ? {
    nom: initialClass.nom,
    date: initialClass.date,
    heureDebut: initialClass.heureDebut,
    heureFin: initialClass.heureFin,
    coachNom: initialClass.coachNom,
    studio: initialClass.studio,
    capaciteMax: initialClass.capaciteMax,
  } : initialForm)
  const [saving, setSaving] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState(null)
  const editing = Boolean(initialClass)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const matchingCoaches = coaches.filter((coach) => coach.nom.toLocaleLowerCase().includes(form.coachNom.trim().toLocaleLowerCase()))
  const selectedCoachIsValid = coaches.some((coach) => coach.nom.toLocaleLowerCase() === form.coachNom.trim().toLocaleLowerCase())

  const loadCoaches = async () => {
    setCoachesLoading(true)
    setCoachesError(null)
    try {
      setCoaches(await coachingRequestService.getCoaches())
    } catch (error) {
      setCoachesError(error)
    } finally {
      setCoachesLoading(false)
    }
  }

  useEffect(() => { loadCoaches() }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    await onCreate({ ...form, jour: dayFromDate(form.date), capaciteMax: Number(form.capaciteMax), placesRestantes: Number(form.capaciteMax) })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form className="schedule-create-modal management-panel w-full max-w-lg rounded-xl border border-graphite-line bg-graphite-panel p-6" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold">{t(editing ? 'editClass' : 'createClass', editing ? 'Modifier le cours' : 'Ajouter un cours')}</h2>
          <button type="button" className="text-2xl leading-none text-text-muted" onClick={onClose} aria-label={t('close')}>×</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 text-sm font-medium">{t('className', 'Nom du cours')}<input required value={form.nom} onChange={update('nom')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('date', 'Date')}<input required type="date" value={form.date} onChange={update('date')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('studio', 'Studio')}<input required value={form.studio} onChange={update('studio')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('startTime', 'Début')}<input required type="time" value={form.heureDebut} onChange={update('heureDebut')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('endTime', 'Fin')}<input required type="time" value={form.heureFin} onChange={update('heureFin')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('coach', 'Coach')}<input required list="class-coach-options" autoComplete="off" value={form.coachNom} onChange={update('coachNom')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
          <label className="text-sm font-medium">{t('capacity', 'Capacité')}<input required min="1" type="number" value={form.capaciteMax} onChange={update('capaciteMax')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" /></label>
        </div>
        <datalist id="class-coach-options">
          {matchingCoaches.map((coach) => <option key={coach.id} value={coach.nom} label={coach.specialty} />)}
        </datalist>
        {coachesLoading && <p className="mt-2 text-sm text-text-muted" role="status">{t('loading')}</p>}
        {!coachesLoading && !coachesError && form.coachNom.trim() && matchingCoaches.length === 0 && <p className="mt-2 text-sm text-text-muted" role="status">{t('noResults')}</p>}
        <ApiError error={coachesError} onRetry={loadCoaches} />
        <div className="flex justify-end gap-3 mt-6"><button type="button" className="px-4 py-2.5 rounded-md border border-graphite-line text-text-muted" onClick={onClose}>{t('close')}</button><button className="button button-lime" disabled={saving || !selectedCoachIsValid}>{saving ? t('loading') : t(editing ? 'saveChanges' : 'createClass', editing ? 'Enregistrer' : 'Ajouter un cours')} <span aria-hidden="true">↗</span></button></div>
      </form>
    </div>
  )
}