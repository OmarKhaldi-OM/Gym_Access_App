import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import Button from '../../components/Button.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { ApiEmpty, ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'
import * as classService from '../../services/classService.js'
import { useMembers } from '../../context/MembersContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'
import { getLocalizedMembershipName } from '../../membershipLocalization.js'

function pairSessions(entries) {
  const sessions = []
  let open = null
  ;[...entries].reverse().forEach((entry) => {
    if (entry.type === 'entree') {
      open = { date: entry.date, entry: entry.heure.slice(0, 5), exit: null }
      sessions.push(open)
    } else if (entry.type === 'sortie' && open && open.date === entry.date && !open.exit) {
      open.exit = entry.heure.slice(0, 5)
    }
  })
  return sessions.reverse()
}

export default function MemberProfile({ role, memberListPath, canManage = false }) {
  const t = useT()
  const { language } = useI18n()
  const { id } = useParams()
  const navigate = useNavigate()
  const { removeMember } = useMembers()
  const [member, setMember] = useState(null)
  const [sessions, setSessions] = useState([])
  const [memberBookings, setMemberBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  async function handleDeleteMember() {
    await memberService.deleteMember(id)
    removeMember(id)
    navigate(memberListPath, { replace: true, state: { notification: t('memberDeleted') } })
  }

  if (loading) {
    return (
      <Layout role={role}>
        <ApiLoading message={t('loading')} />
      </Layout>
    )
  }
  if (error || !member) return <Layout role={role}><ApiError error={error || new Error(t('requestFailed'))} onRetry={loadMember} /></Layout>

  const confirmedBookings = memberBookings.filter(
    (booking) => booking.membreId === id && booking.statut === 'CONFIRMED' && booking.classe,
  )

  return (
    <Layout role={role}>
      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.nom} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{member.nom}</h1>
            <p className="text-base font-medium text-text-muted mt-0.5">{member.email}</p>
          </div>
          <StatusChip variant={member.statut === 'Actif' ? 'memberActive' : 'memberInactive'}>
            {t(member.statut === 'Actif' ? 'active' : 'inactive')}
          </StatusChip>
          {canManage && (
            <Button
              type="button"
              variant="secondary"
              className="!bg-red-700 !text-white"
              onClick={() => setConfirmDelete(true)}
            >
              {t('deleteMember')}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-base font-medium text-text-muted">{t('plan')}</p>
            <p className="text-lg font-semibold mt-1">{getLocalizedMembershipName(member, language, t('planNameUnavailable'))}</p>
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
              <StatusChip variant={member.visageEnrole ? 'enrollmentComplete' : 'enrollmentPending'}>
                {t(member.visageEnrole ? 'enrolledStatus' : 'notEnrolled')}
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
            {sessions.map((session, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-5 py-4 ${
                  index !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <span className="text-base font-medium text-text-muted">
                  {new Date(session.date).toLocaleDateString(language)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-text-muted">
                    {t('entry')} {session.entry}
                    {session.exit ? ` — ${t('exit')} ${session.exit}` : ''}
                  </span>
                  {!session.exit && <StatusChip variant="positive">{t('inProgress')}</StatusChip>}
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
            {confirmedBookings.map((booking, index) => (
              <div
                key={booking.id}
                className={`px-5 py-4 ${
                  index !== confirmedBookings.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <p className="text-lg font-semibold">{booking.classe.nom}</p>
                <p className="text-base font-medium text-text-muted mt-0.5">
                  {booking.classe.heureDebut} · {booking.classe.studio}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {canManage && confirmDelete && <ConfirmDialog
        title={t('confirmDeletion')}
        description={t('confirmAnonymizeMember')}
        itemName={member.nom}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteMember}
      />}
    </Layout>
  )
}
