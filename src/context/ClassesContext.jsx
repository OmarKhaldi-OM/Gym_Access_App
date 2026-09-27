import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as classService from '../services/classService.js'

const ClassesContext = createContext(null)

const MY_MEMBER_ID = 'mem-1' // Sana Mabrouk — compte membre de démo

export function ClassesProvider({ children }) {
  const [classes, setClasses] = useState([])
  const [personalSessions, setPersonalSessions] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [classesList, personalList, bookings] = await Promise.all([
      classService.getClasses(),
      classService.getPersonalSessions(),
      classService.getMyBookings(MY_MEMBER_ID),
    ])
    setClasses(classesList)
    setPersonalSessions(personalList)
    setMyBookings(bookings)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const bookClass = useCallback(
    async (classeId) => {
      const result = await classService.bookClass(classeId, MY_MEMBER_ID)
      await refresh()
      return result
    },
    [refresh],
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
      value={{ classes, personalSessions, myBookings, loading, bookClass, cancelBooking, addClass, updateClass, deleteClass, refresh }}
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
