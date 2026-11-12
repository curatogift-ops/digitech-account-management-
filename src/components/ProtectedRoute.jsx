import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from './Loading.jsx'

/** Guards routes. Use `ownerOnly` to restrict to the Owner role. */
export default function ProtectedRoute({ ownerOnly = false, children }) {
  const { isAuthenticated, isOwner, booting } = useAuth()
  const location = useLocation()

  if (booting) return <Loading label="Signing you in…" />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />
  return children ?? <Outlet />
}
