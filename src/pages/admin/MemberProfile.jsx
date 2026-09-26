import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'
import { useClasses } from '../../context/ClassesContext.jsx'

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
  const { id } = useParams()
  const { myBookings } = useClasses()
  const [member, setMember] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    memberService.getMemberById(id).then(setMember)
    activityService.getMemberActivity(id).then((entries) => setSessions(pairSessions(entries)))
  }, [id])

  if (!member) {
    return (
      <Layout role="admin">
        <p className="text-base font-medium text-text-muted">Chargement du profil…</p>
      </Layout>
    )
  }

  const confirmedBookings = myBookings.filter(
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

      <div className="grid grid-cols-2 gap-6">
        <Panel>
          <SectionHeader title="Historique des passages" />
          <div>
            {sessions.length === 0 && (
              <p className="px-5 py-4 text-base font-medium text-text-muted">
                Aucun passage enregistré.
              </p>
            )}
            {sessions.map((s, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== sessions.length - 1 ? 'border-b border-graphite-line' : ''
                }`}
              >
                <span className="text-base font-medium text-text-muted">
                  {new Date(s.date).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-mono text-text-muted">
                    Entrée {s.entry}
                    {s.exit ? ` — Sortie ${s.exit}` : ''}
                  </span>
                  {!s.exit && <StatusChip variant="positive">En cours</StatusChip>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader title="Cours réservés" />
          <div>
            {confirmedBookings.length === 0 && (
              <p className="px-5 py-4 text-base font-medium text-text-muted">
                Aucun cours réservé.
              </p>
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
