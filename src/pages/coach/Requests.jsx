import { useEffect, useState } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Button from '../../components/Button.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../hooks/useToast.js'
import { useT } from '../../context/I18nContext.jsx'
import * as requestService from '../../services/coachingRequestService.js'

const statuses = { pending: ['pending', 'neutral'], accepted: ['accepted', 'positive'], rejected: ['rejected', 'negative'], cancelled: ['cancelled', 'negative'] }

export default function Requests() {
  const t = useT()
  const { user } = useAuth()
  const { toastMessage, showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [responses, setResponses] = useState({})

  const refresh = async () => {
    if (!user?.id) return
    const [items, updates] = await Promise.all([
      requestService.getCoachRequests(user.id),
      requestService.getNotifications(user.id, 'coach'),
    ])
    setRequests(items)
    setNotifications(updates)
  }

  useEffect(() => { refresh().catch(() => {}) }, [user?.id])

  const decide = async (request, status) => {
    await requestService.updateRequestStatus(request.id, status, responses[request.id] || '')
    await refresh()
    showToast(t(status === 'accepted' ? 'requestAccepted' : 'requestRejected'))
  }

  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">{t('coachingRequests')}</h1>
      {notifications.length > 0 && <Panel className="mb-6"><SectionHeader title={`${t('notifications')} (${notifications.length})`} /><div className="px-5 py-4 text-sm">{notifications.slice(0, 3).map((item) => <p key={item.id} className="border-b border-graphite-line py-2 last:border-0">{item.memberName} {t('memberSentRequest')}</p>)}</div></Panel>}
      <Panel>
        <SectionHeader title={t('incomingRequests')} />
        <div>{requests.length === 0 && <p className="p-5 text-text-muted">{t('noIncomingRequests')}</p>}
          {requests.map((request) => {
            const [label, variant] = statuses[request.status] || statuses.pending
            return <article key={request.id} className="border-b border-graphite-line p-5 last:border-0"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xl font-semibold">{request.memberName}</p><p className="text-sm text-text-muted">{t('requested')}: <span dir="ltr">{request.requestedAt}</span></p><p className="mt-2 text-base">{t('trainingGoal')}: {request.goal}</p></div><StatusChip variant={variant}>{t(label)}</StatusChip></div>{request.status === 'pending' && <div className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-[260px] flex-1 text-sm font-medium">{t('response')}<input className="mt-1 w-full rounded-md border border-graphite-line bg-graphite-bg px-3 py-2.5" value={responses[request.id] || ''} onChange={(event) => setResponses({ ...responses, [request.id]: event.target.value })} placeholder={t('optionalMessage')} /></label><Button onClick={() => decide(request, 'accepted')}>{t('accept')}</Button><Button variant="secondary" onClick={() => decide(request, 'rejected')}>{t('reject')}</Button></div>}</article>
          })}
        </div>
      </Panel>
      <Toast message={toastMessage} />
    </Layout>
  )
}