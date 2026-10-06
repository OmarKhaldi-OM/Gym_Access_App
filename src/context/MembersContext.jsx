import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as memberService from '../services/memberService.js'
import { useAuth } from './AuthContext.jsx'
import { canAccessFeature, FEATURES } from '../roles.js'

const MembersContext = createContext(null)

export function MembersProvider({ children }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (!user) {
        setMembers([])
        setPendingEnrollments([])
      } else if (canAccessFeature(user, FEATURES.MANAGE_MEMBERS)) {
        const membersList = await memberService.getMembers()
        const pending = await memberService.getPendingEnrollments(membersList)
        setMembers(membersList)
        setPendingEnrollments(pending)
      } else if (canAccessFeature(user, FEATURES.VIEW_OWN_MEMBER_RECORD)) {
        setMembers([await memberService.getMemberById(user.id)])
        setPendingEnrollments([])
      } else {
        setMembers([])
        setPendingEnrollments([])
      }
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const enroll = useCallback(
    async (id) => {
      try {
        await memberService.enrollMember(id)
        await refresh()
        return true
      } catch {
        return false
      }
    },
    [refresh],
  )

  const search = useCallback((query) => memberService.searchMembers(query), [])

  return (
    <MembersContext.Provider
      value={{ members, pendingEnrollments, loading, error, enroll, search, refresh }}
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
