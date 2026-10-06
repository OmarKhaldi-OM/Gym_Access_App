import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import * as progressService from '../../services/progressService.js'

export default function Progress() {
  const t = useT()
  const { language } = useI18n()
  const { user } = useAuth()
  const memberId = user?.id
  const [progress, setProgress] = useState(null)
  const [goals, setGoals] = useState([])
  const [goal, setGoal] = useState({ name: '', target: 5, deadline: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!memberId) return
    setLoading(true)
    setError(null)
    try {
      const [data, nextGoals] = await Promise.all([
        progressService.getProgress(memberId),
        progressService.getGoals(memberId),
      ])
      setProgress(data)
      setGoals(nextGoals)
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh().catch(() => {})
  }, [memberId])

  const addGoal = async (event) => {
    event.preventDefault()
    try {
      await progressService.addGoal(memberId, { ...goal, target: Number(goal.target) })
      setGoal({ name: '', target: 5, deadline: '' })
      await refresh()
    } catch (requestError) {
      setError(requestError)
    }
  }

  if (loading) return <Layout role="membre"><ApiLoading message={t('loading')} /></Layout>
  if (error || !progress) return <Layout role="membre"><ApiError error={error || new Error(t('requestFailed', 'Impossible de charger votre progression.'))} onRetry={() => refresh().catch(() => {})} /></Layout>

  const latestWeight = progress.weight.at(-1)?.value
  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('myProgressGoals')}</h1>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Panel className="p-5"><p className="text-sm text-text-muted">{t('classesAttended')}</p><p className="mt-2 text-3xl font-bold text-coral">{progress.classesAttended}</p></Panel>
        <Panel className="p-5"><p className="text-sm text-text-muted">{t('coachingSessions')}</p><p className="mt-2 text-3xl font-bold text-coral">{progress.coachingCompleted}</p></Panel>
        <Panel className="p-5"><p className="text-sm text-text-muted">{t('attendanceThisMonth')}</p><p className="mt-2 text-3xl font-bold text-coral">{progress.attendance}</p></Panel>
        <Panel className="p-5"><p className="text-sm text-text-muted">{t('latestWeight')}</p><p className="mt-2 text-3xl font-bold text-coral">{latestWeight == null ? '—' : `${latestWeight} kg`}</p></Panel>
      </div>
      <Panel className="mb-6">
        <SectionHeader title={t('weightProgress')} />
        <div className="flex min-h-48 items-end gap-3 p-5">
          {progress.weight.length === 0 && <ApiEmpty message={t('noProgressData', 'Aucune mesure enregistrée.')} />}
          {progress.weight.map((point) => <div key={point.date} className="flex flex-1 flex-col items-center gap-2"><span className="text-sm font-semibold">{point.value} kg</span><div className="w-full max-w-16 rounded-t-md bg-coral" style={{ height: `${point.value * 2}px` }} /><span className="text-xs text-text-muted"><span dir="ltr">{new Date(`${point.date}T12:00:00`).toLocaleDateString(language, { month: 'short', year: 'numeric' })}</span></span></div>)}
        </div>
      </Panel>
      <Panel>
        <SectionHeader title={t('personalGoals')} />
        <form onSubmit={addGoal} className="grid gap-3 p-5 md:grid-cols-4">
          <input required aria-label={t('goalName')} className="rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" placeholder={t('goalName')} value={goal.name} onChange={(event) => setGoal({ ...goal, name: event.target.value })} />
          <input required type="number" min="1" aria-label={t('target')} className="rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" placeholder={t('target')} value={goal.target} onChange={(event) => setGoal({ ...goal, target: event.target.value })} />
          <input type="date" aria-label={t('deadline')} className="rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={goal.deadline} onChange={(event) => setGoal({ ...goal, deadline: event.target.value })} />
          <Button>{t('addGoal')}</Button>
        </form>
        <div>{goals.length === 0 && <ApiEmpty message={t('noGoals', 'Aucun objectif pour le moment. Ajoutez un objectif avec le formulaire ci-dessus.')} />}{goals.map((item) => <div key={item.id} className="border-t border-graphite-line p-5"><div className="flex justify-between"><strong>{item.name}</strong><span>{item.current}/{item.target}</span></div><ProgressBar value={item.current} max={item.target} /></div>)}</div>
      </Panel>
    </Layout>
  )
}