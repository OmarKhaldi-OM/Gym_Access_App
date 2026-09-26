import { useState, useEffect } from 'react'
import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import * as memberService from '../../services/memberService.js'
import * as activityService from '../../services/activityService.js'

const MY_MEMBER_ID = 'mem-1'

function pairSessions(entries) {
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

export default function MyStatus() {
  const [member, setMember] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    memberService.getMemberById(MY_MEMBER_ID).then(setMember)
    activityService
      .getMemberActivity(MY_MEMBER_ID)
      .then((entries) => setSessions(pairSessions(entries)))
  }, [])

  if (!member) return null

  const current = sessions.find((s) => !s.exit)

  return (
    <Layout role="membre">
      <h1 className="text-2xl font-bold mb-6">Mon statut</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={member.nom} size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">{member.nom}</p>
            <p className="text-base font-medium text-text-muted mt-0.5">Plan {member.plan}</p>
          </div>
          <StatusChip variant={member.statut === 'Actif' ? 'positive' : 'neutral'}>
            {member.statut}
          </StatusChip>
        </div>
        <div className="mt-5 pt-5 border-t border-graphite-line flex items-center justify-between">
          <span className="text-lg font-medium text-text-muted">Dernier passage</span>
          <div className="flex items-center gap-3">
            <span className="text-base font-mono text-text-muted">
              {sessions[0] ? `Entrée ${sessions[0].entry}` : 'Aucun passage'}
            </span>
            {current && <StatusChip variant="positive">En cours</StatusChip>}
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Historique récent" />
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
    </Layout>
  )
}
