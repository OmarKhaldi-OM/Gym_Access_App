import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as memberService from '../services/memberService.js'

const MembersContext = createContext(null)

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([])
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [membersList, pending] = await Promise.all([
      memberService.getMembers(),
      memberService.getPendingEnrollments(),
    ])
    setMembers(membersList)
    setPendingEnrollments(pending)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const enroll = useCallback(
    async (id) => {
      await memberService.enrollMember(id)
      await refresh()
    },
    [refresh],
  )

  const search = useCallback((query) => memberService.searchMembers(query), [])

  return (
    <MembersContext.Provider
      value={{ members, pendingEnrollments, loading, enroll, search, refresh }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const ctx = useContext(MembersContext)
  if (!ctx) throw new Error('useMembers doit être utilisé dans un MembersProvider')
  return ctx
}
