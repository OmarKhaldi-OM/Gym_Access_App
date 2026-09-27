import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as memberService from '../../services/memberService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function MyProfile() {
  const { user } = useAuth()
  const memberId = user?.memberId || 'mem-1'
  const [member, setMember] = useState(null)

  useEffect(() => {
    memberService.getMemberById(memberId).then(setMember)
  }, [memberId])

  if (!member) return null

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

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
            <p className="text-base font-medium text-text-muted">Plan</p>
            <p className="text-lg font-semibold mt-1">{member.plan}</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Membre depuis</p>
            <p className="text-lg font-mono mt-1">
              {new Date(member.dateInscription).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">Enrôlement facial</p>
            <div className="mt-1">
              <StatusChip variant={member.visageEnrole ? 'positive' : 'neutral'}>
                {member.visageEnrole ? 'Enrôlé' : 'Non enrôlé'}
              </StatusChip>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Mon abonnement" />
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Plan {member.plan}</p>
            <p className="text-base font-medium text-text-muted mt-0.5">
              {user?.subscription?.billing === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle'}
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
