import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'

const ThemeContext = createContext(null)

function getInitialTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setCurrentTheme] = useState(getInitialTheme)
  const hasManualOverride = useRef(false)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#171b18' : '#e8e9de',
    )
  }, [theme])

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return undefined

    const handlePreferenceChange = (event) => {
      if (!hasManualOverride.current) {
        setCurrentTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handlePreferenceChange)
    return () => mediaQuery.removeEventListener('change', handlePreferenceChange)
  }, [])

  const setTheme = (nextTheme) => {
    hasManualOverride.current = true
    setCurrentTheme(nextTheme)
  }

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return context
}
