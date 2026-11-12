import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { session } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.access ? session.user : null))
  const [booting, setBooting] = useState(Boolean(session.access))

  // Validate the stored session and refresh the user profile on load.
  useEffect(() => {
    let alive = true
    if (!session.access) {
      setBooting(false)
      return undefined
    }
    api
      .get('/auth/me/')
      .then(({ data }) => {
        if (!alive) return
        session.save({ user: data })
        setUser(data)
      })
      .catch(() => {
        /* 401 is handled by the interceptor (logout event) */
      })
      .finally(() => alive && setBooting(false))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    session.save(data)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    session.clear()
    setUser(null)
  }, [])

  const updateUser = useCallback((next) => {
    session.save({ user: next })
    setUser(next)
  }, [])

  const value = useMemo(
    () => ({
      user,
      booting,
      loading: booting,
      isAuthenticated: Boolean(user),
      isOwner: Boolean(user?.is_owner || user?.role === 'owner'),
      login,
      logout,
      updateUser,
    }),
    [user, booting, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
