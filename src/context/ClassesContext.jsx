import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import * as classService from '../services/classService.js'
import { useAuth } from './AuthContext.jsx'
import { canAccessFeature, FEATURES } from '../roles.js'

const ClassesContext = createContext(null)

export function ClassesProvider({ children }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const shouldLoadClasses = ['/admin/schedule', '/membre/bookings', '/reception/planning'].includes(pathname)
  const [classes, setClasses] = useState([])
  const [personalSessions, setPersonalSessions] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      if (!shouldLoadClasses) {
        setClasses([])
        setPersonalSessions([])
        setMyBookings([])
        return
      }
      const [classesList, personalList, bookings] = await Promise.all([
        classService.getClasses(),
        canAccessFeature(user, FEATURES.VIEW_OWN_BOOKINGS) ? classService.getPersonalSessions(user.id) : Promise.resolve([]),
        canAccessFeature(user, FEATURES.VIEW_OWN_BOOKINGS) ? classService.getMyBookings(user.id) : Promise.resolve([]),
      ])
      setClasses(classesList)
      setPersonalSessions(personalList)
      setMyBookings(bookings)
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [shouldLoadClasses, user])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const bookClass = useCallback(
    async (classeId) => {
      const result = await classService.bookClass(classeId, user.id)
      await refresh()
      return result
    },
    [refresh, user],
  )

  const cancelBooking = useCallback(
    async (bookingId) => {
      const result = await classService.cancelBooking(bookingId)
      await refresh()
      return result
    },
    [refresh],
  )

  const addClass = useCallback(
    async (classDetails) => {
      const result = await classService.addClass(classDetails)
      await refresh()
      return result
    },
    [refresh],
  )

  const updateClass = useCallback(
    async (id, classDetails) => {
      const result = await classService.updateClass(id, classDetails)
      await refresh()
      return result
    },
    [refresh],
  )

  const deleteClass = useCallback(
    async (id) => {
      const result = await classService.deleteClass(id)
      await refresh()
      return result
    },
    [refresh],
  )

  return (
    <ClassesContext.Provider
      value={{ classes, personalSessions, myBookings, loading, error, bookClass, cancelBooking, addClass, updateClass, deleteClass, refresh }}
    >
      {children}
    </ClassesContext.Provider>
  )
}

export function useClasses() {
  const ctx = useContext(ClassesContext)
  if (!ctx) throw new Error('useClasses doit être utilisé dans un ClassesProvider')
  return ctx
}
