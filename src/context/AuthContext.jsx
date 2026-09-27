import { createContext, useContext, useState, useCallback } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())

  const login = useCallback(async (role) => {
    const loggedInUser = await authService.login(role)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const signIn = useCallback(async (credentials) => {
    const loggedInUser = await authService.signIn(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const signUp = useCallback(async (details) => {
    const registeredUser = await authService.signUp(details)
    setUser(registeredUser)
    return registeredUser
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signIn, signUp, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
