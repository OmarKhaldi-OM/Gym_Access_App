import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as authService from '../services/authService.js'
import { authStorage } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getToken() ? authService.getCurrentUser() : null)
  const [ready, setReady] = useState(() => !authStorage.getToken())

  useEffect(() => {
    const clearUser = () => {
      setUser(null)
      setReady(true)
    }
    const updateUser = (event) => setUser(event.detail)
    window.addEventListener('gate:unauthorized', clearUser)
    window.addEventListener('gate:identity', updateUser)
    if (authStorage.getToken()) {
      authService.getIdentity()
        .then((currentUser) => {
          authStorage.save(authStorage.getToken(), currentUser)
          setUser(currentUser)
        })
        .catch((identityError) => {
          if (identityError.status === 401) clearUser()
          else setReady(true)
        })
        .finally(() => setReady(true))
    } else {
      localStorage.removeItem('gate.user')
    }
    return () => {
      window.removeEventListener('gate:unauthorized', clearUser)
      window.removeEventListener('gate:identity', updateUser)
    }
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

  return <AuthContext.Provider value={{ user, ready, signIn, signUp, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
