import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'
import * as classService from '../../services/classService.js'
import { useI18n, useT } from '../../context/I18nContext.jsx'

function pairSessions(entries) {
  // Regroupe les entrées/sorties consécutives d'un même jour en sessions.
  const sessions = []
  let open = null
  ;[...entries].reverse().forEach((e) => {
    if (e.type === 'entree') {
      open = { date: e.date, entry: e.heure.slice(0, 5), exit: null }
      sessions.push(open)
    } else if (e.type === 'sortie' && open && open.date === e.date && !open.exit) {
      open.exit = e.heure.slice(0, 5)
    }
  })
  return sessions.reverse()
}

export default function MemberProfile() {
  const t = useT()
  const { language } = useI18n()
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [sessions, setSessions] = useState([])
  const [memberBookings, setMemberBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMember = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      memberService.getMemberById(id),
      activityService.getMemberActivity(id),
      classService.getMyBookings(id),
    ])
      .then(([memberData, entries, bookings]) => {
        setMember(memberData)
        setSessions(pairSessions(entries))
        setMemberBookings(bookings)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadMember() }, [id])

  if (loading) {
    return (
      <Layout role="admin">
        <ApiLoading message={t('loading')} />
      </Layout>
    )
  }
  if (error || !member) return <Layout role="admin"><ApiError error={error || new Error(t('requestFailed', 'Impossible de charger ce membre.'))} onRetry={loadMember} /></Layout>

  const confirmedBookings = memberBookings.filter(
    (b) => b.membreId === id && b.statut === 'confirmee' && b.classe,
  )

  return (
    <Layout role="admin">
      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.nom} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{member.nom}</h1>
            <p className="text-base font-medium text-text-muted mt-0.5">{member.email}</p>
          </div>
          <StatusChip variant={member.statut === 'Actif' ? 'positive' : 'neutral'}>
            {member.statut}
          </StatusChip>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-base font-medium text-text-muted">{t('plan')}</p>
            <p className="text-lg font-semibold mt-1">{t(member.plan)}</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">{t('memberSince')}</p>
            <p className="text-lg font-mono mt-1">
              {new Date(member.dateInscription).toLocaleDateString(language)}
            </p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">{t('facialEnrollment')}</p>
            <div className="mt-1">
              <StatusChip variant={member.visageEnrole ? 'positive' : 'neutral'}>
                {member.visageEnrole ? t('enrolledStatus') : t('notEnrolled')}
              </StatusChip>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title={t('visitHistory')} />
          <div>
            {sessions.length === 0 && <ApiEmpty message={t('noPassages')} />}
            {sessions.map((s, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <span className="text-base font-medium text-text-muted">
                  {new Date(s.date).toLocaleDateString(language)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-text-muted">
                    {t('entry')} {s.entry}
                    {s.exit ? ` — ${t('exit')} ${s.exit}` : ''}
                  </span>
                  {!s.exit && <StatusChip variant="positive">{t('inProgress')}</StatusChip>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title={t('bookedClasses')} />
          <div>
            {confirmedBookings.length === 0 && (
              <ApiEmpty message={t('noBookedClasses')} />
            )}
            {confirmedBookings.map((b, i) => (
              <div
                key={b.id}
                className={`px-5 py-4 ${
                  i !== confirmedBookings.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <p className="text-lg font-semibold">{b.classe.nom}</p>
                <p className="text-base font-medium text-text-muted mt-0.5">
                  {b.classe.heureDebut} · {b.classe.studio}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  )
}
