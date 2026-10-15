import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import { useT } from '../../context/I18nContext.jsx'
import * as requestService from '../../services/coachingRequestService.js'

const statusMap = { pending: ['pending', 'neutral'], accepted: ['accepted', 'positive'], rejected: ['rejected', 'negative'], cancelled: ['cancelled', 'negative'] }

export default function CoachingRequests() {
  const t = useT()
  const { user } = useAuth()
  const { toastMessage, showToast } = useToast()
  const [coaches, setCoaches] = useState([])
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState({ coachId: '', requestedAt: '', goal: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const [availableCoaches, memberRequests, updates] = await Promise.all([
        requestService.getCoaches(),
        requestService.getMemberRequests(user.id),
        requestService.getNotifications(user.id, 'member'),
      ])
      setCoaches(availableCoaches)
      setForm((current) => ({ ...current, coachId: current.coachId || availableCoaches[0]?.id || '' }))
      setRequests(memberRequests)
      setNotifications(updates)
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh().catch(() => {}) }, [user?.id])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await requestService.createRequest({ memberId: user.id, coachId: form.coachId, requestedAt: form.requestedAt, goal: form.goal })
      setForm((current) => ({ ...current, requestedAt: '', goal: '' }))
      await refresh()
      showToast(t('requestSent'))
    } catch (requestError) {
      setError(requestError)
    }
  }

  const cancel = async (id) => {
    try {
      await requestService.updateRequestStatus(id, 'cancelled')
      await refresh()
      showToast(t('requestCancelled'))
    } catch (requestError) {
      setError(requestError)
    }
  }

  const notificationText = (notification) => notification.type === 'coaching-accepted'
    ? `${t('requestWithCoach')} ${notification.coachName} ${t('requestWasAccepted')}`
    : `${t('requestWithCoach')} ${notification.coachName} ${t('requestWasRejected')}`

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('coachingRequests')}</h1>
      {loading && <ApiLoading message={t('loading')} />}
      <ApiError error={error} onRetry={() => refresh().catch(() => {})} />
      {!loading && !error && notifications.length > 0 && <Panel className="mb-6"><SectionHeader title={`${t('notifications')} (${notifications.length})`} /><div className="px-5 py-4 text-sm">{notifications.slice(0, 3).map((item) => <p key={item.id} className="border-b border-graphite-line py-2 last:border-0">{notificationText(item)}</p>)}</div></Panel>}
      <Panel className="p-6 mb-6">
        <SectionHeader title={t('requestCoach')} />
        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-3">
          <label className="text-sm font-medium">{t('coach')}<select required disabled={loading || !coaches.length} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={form.coachId} onChange={(event) => setForm({ ...form, coachId: event.target.value })}>{coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.nom} · {coach.specialty}</option>)}</select>{!loading && !error && coaches.length === 0 && <ApiEmpty message={t('noCoachesAvailable', 'Aucun coach disponible pour le moment.')} />}</label>
          <label className="text-sm font-medium">{t('requestedDateTime')}<input required type="datetime-local" min={new Date().toISOString().slice(0, 16)} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={form.requestedAt} onChange={(event) => setForm({ ...form, requestedAt: event.target.value })} /></label>
          <label className="text-sm font-medium">{t('trainingGoal')}<input required placeholder={t('goalPlaceholder')} className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></label>
          <Button disabled={loading || Boolean(error) || !coaches.length} className="md:col-span-3 justify-self-start">{t('sendRequest')}</Button>
        </form>
      </Panel>
      <Panel>
        <SectionHeader title={t('myRequests')} />
        <div>{!loading && !error && requests.length === 0 && <ApiEmpty message={t('noRequests')} />}
          {!loading && !error && requests.map((request) => {
            const [label, variant] = statusMap[request.status] || statusMap.pending
            return <article key={request.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-graphite-line px-5 py-4 last:border-0"><div><p className="font-semibold">{request.coachName}</p><p className="text-sm text-text-muted">{request.requestedAt} · {request.goal}</p>{request.response && <p className="mt-1 text-sm">{request.response}</p>}</div><div className="flex items-center gap-3"><StatusChip variant={variant}>{t(label)}</StatusChip>{request.status === 'pending' && <Button variant="secondary" onClick={() => cancel(request.id)}>{t('cancel')}</Button>}</div></article>
          })}
        </div>
      </Panel>
      <Toast message={toastMessage} />
    </Layout>
  )
}