import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { ApiError, ApiLoading } from '../../components/ApiState.jsx'
import * as memberService from '../../services/memberService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'

export default function MyProfile() {
  const t = useT()
  const { language } = useI18n()
  const { user } = useAuth()
  const memberId = user?.id
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMember = () => {
    if (!memberId) return
    setLoading(true)
    setError(null)
    memberService.getMemberById(memberId).then(setMember).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMember()
  }, [memberId])

  if (loading) return <Layout role="membre"><ApiLoading message={t('loading')} /></Layout>
  if (error || !member) return <Layout role="membre"><ApiError error={error || new Error(t('requestFailed', 'Impossible de charger votre profil.'))} onRetry={loadMember} /></Layout>

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">{t('myProfile')}</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.nom} size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">{member.nom}</p>
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

      <Panel>
        <SectionHeader title={t('subscription')} />
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{t('plan')} {t(member.plan)}</p>
            <p className="text-base font-medium text-text-muted mt-0.5">
              {member.subscription ? `${member.subscription.dateDebut} – ${member.subscription.dateFin}` : t('noActiveSubscription', 'Aucun abonnement actif')}
            </p>
          </div>
          <StatusChip variant={member.statut === 'Actif' ? 'positive' : 'neutral'}>
            {member.statut}
          </StatusChip>
        </div>
      </Panel>
    </Layout>
  )
}
