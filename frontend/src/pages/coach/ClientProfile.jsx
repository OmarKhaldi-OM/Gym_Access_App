import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import Button from '../../components/Button.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import * as coachService from '../../services/coachService.js'
import * as coachNoteService from '../../services/coachNoteService.js'

function dateTime(value) {
  if (Array.isArray(value)) {
    return new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0)
  }
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

function localizedDate(value, language, options = {}) {
  const date = dateTime(value)
  if (!date || Number.isNaN(date.getTime())) return '—'
  return options.timeStyle
    ? date.toLocaleString(language, options)
    : date.toLocaleDateString(language, options)
}

function memberName(profile) {
  return [profile.prenom, profile.nom].filter(Boolean).join(' ')
}

export default function ClientProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const { language } = useI18n()
  const t = useT()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [savingNote, setSavingNote] = useState(false)

  const load = useCallback(async () => {
    if (!user?.id || !id) return
    setLoading(true)
    setError(null)
    try {
      setDetails(await coachService.getCoachClientDetails(user.id, id))
    } catch (requestError) {
      setError(requestError)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => { load() }, [load])

  const saveNote = async (event) => {
    event.preventDefault()
    setSavingNote(true)
    setActionError(null)
    try {
      if (editingNoteId) await coachNoteService.updateCoachNote(editingNoteId, noteText)
      else await coachNoteService.createCoachNote(id, noteText)
      setNoteText('')
      setEditingNoteId(null)
      await load()
    } catch (requestError) {
      setActionError(requestError)
    } finally {
      setSavingNote(false)
    }
  }

  const editNote = (note) => {
    setEditingNoteId(note.id)
    setNoteText(note.contenu)
    setActionError(null)
  }

  const removeNote = async () => {
    setActionError(null)
    await coachNoteService.deleteCoachNote(noteToDelete)
    if (editingNoteId === noteToDelete) {
      setEditingNoteId(null)
      setNoteText('')
    }
    setNoteToDelete(null)
    await load()
  }

  if (loading) return <Layout role="coach"><ApiLoading message={t('loading')} /></Layout>
  if (error || !details) {
    return <Layout role="coach"><ApiError error={error || new Error(t('clientProfileUnavailable'))} onRetry={load} /></Layout>
  }

  const { profile, goals, measurements, sessions, notes } = details
  return (
    <Layout role="coach">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/coach/clients" className="text-sm font-semibold text-text-muted hover:text-text-primary">
            ← {t('backToClients')}
          </Link>
          <h1 className="mt-3 text-2xl font-bold">{memberName(profile)}</h1>
        </div>
      </div>

      <Panel className="mb-6">
        <SectionHeader title={t('clientProfile')} />
        <dl className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm text-text-muted">{t('emailLabel')}</dt><dd className="mt-1 font-medium" dir="ltr">{profile.email}</dd></div>
          <div><dt className="text-sm text-text-muted">{t('dateOfBirth')}</dt><dd className="mt-1 font-medium">{localizedDate(profile.dateNaissance, language)}</dd></div>
          <div><dt className="text-sm text-text-muted">{t('memberSince')}</dt><dd className="mt-1 font-medium">{localizedDate(profile.dateInscription, language)}</dd></div>
        </dl>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHeader title={t('personalGoals')} />
          {goals.length === 0 ? <ApiEmpty message={t('noGoals')} /> : (
            <ul className="divide-y divide-graphite-line">
              {goals.map((goal) => (
                <li key={goal.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{goal.name}</strong>
                    <span className="text-sm text-text-muted">{goal.current}/{goal.target} · {t(goal.status, goal.status)}</span>
                  </div>
                  {goal.deadline && <p className="mt-2 text-sm text-text-muted">{t('deadline')}: {localizedDate(goal.deadline, language)}</p>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <SectionHeader title={t('weightProgress')} />
          {measurements.length === 0 ? <ApiEmpty message={t('noProgressData')} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-graphite-hover text-text-muted">
                  <tr>
                    <th className="px-5 py-3 text-start font-semibold">{t('date')}</th>
                    <th className="px-5 py-3 text-start font-semibold">{t('weight')}</th>
                    <th className="px-5 py-3 text-start font-semibold">{t('bodyFat')}</th>
                    <th className="px-5 py-3 text-start font-semibold">{t('notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((entry) => (
                    <tr key={entry.id} className="border-t border-graphite-line">
                      <td className="px-5 py-3" dir="ltr">{localizedDate(entry.dateMesure, language)}</td>
                      <td className="px-5 py-3">{entry.poids == null ? '—' : `${entry.poids} kg`}</td>
                      <td className="px-5 py-3">{entry.masseGrasse == null ? '—' : `${entry.masseGrasse}%`}</td>
                      <td className="px-5 py-3">{entry.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <Panel className="mt-6">
        <SectionHeader title={t('sessionHistory')} />
        {sessions.length === 0 ? <ApiEmpty message={t('noClientSessions')} /> : (
          <ul className="divide-y divide-graphite-line">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 p-5">
                <span>{localizedDate(session.dateTime, language, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="text-sm text-text-muted">{t(session.statut, session.statut)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="mt-6">
        <SectionHeader title={t('coachNotes')} />
        <form onSubmit={saveNote} className="grid gap-3 p-5">
          <label htmlFor="coach-note" className="font-medium">{editingNoteId ? t('editNote') : t('addNote')}</label>
          <textarea
            id="coach-note"
            required
            maxLength={10000}
            rows={4}
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            className="w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5"
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={savingNote || !noteText.trim()}>{savingNote ? t('saving') : t('saveNote')}</Button>
            {editingNoteId && (
              <Button type="button" variant="secondary" onClick={() => { setEditingNoteId(null); setNoteText('') }}>
                {t('cancel')}
              </Button>
            )}
          </div>
          <ApiError error={actionError} />
        </form>
        {notes.length === 0 ? <ApiEmpty message={t('noCoachNotes')} /> : (
          <ul className="divide-y divide-graphite-line">
            {notes.map((note) => (
              <li key={note.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap break-words">{note.contenu}</p>
                  <time className="mt-2 block text-sm text-text-muted" dateTime={note.createdAt} dir="ltr">
                    {localizedDate(note.createdAt, language, { dateStyle: 'medium', timeStyle: 'short' })}
                  </time>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => editNote(note)}>{t('editNote')}</Button>
                  <Button type="button" variant="secondary" onClick={() => setNoteToDelete(note.id)}>{t('delete')}</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {noteToDelete && (
        <ConfirmDialog
          title={t('confirmDeletion')}
          description={t('confirmDeleteCoachNote')}
          onConfirm={removeNote}
          onClose={() => setNoteToDelete(null)}
        />
      )}
    </Layout>
  )
}
