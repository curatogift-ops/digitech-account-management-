import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { errorMessage } from '../api/client.js'

const DEMOS = [
  { label: 'Owner', username: 'owner', password: 'Owner@123' },
  { label: 'Project Manager', username: 'pm', password: 'PM@12345' },
]

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const submit = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
      // Role-aware landing: /dashboard renders OwnerDashboard or PMDashboard
      const from = location.state?.from?.pathname
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Invalid username or password.'
          : errorMessage(err),
      )
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="brand" style={{ border: 0, padding: 0 }}>
          <span className="brand-mark">D</span>
          <div>
            <div className="brand-name">Digitech Avenue</div>
            <div className="brand-sub">Customer & Project Operations</div>
          </div>
        </div>
        <div>
          <h2>One workspace for leads, projects and collections.</h2>
          <p>
            Track every client from first enquiry to final payment, with owner approvals and a clear audit
            trail along the way.
          </p>
          <ul className="hero-points">
            {[
              'Requirements approval workflow',
              'Payment verification & outstanding balances',
              'Role-based dashboards for owner and PMs',
            ].map((t) => (
              <li key={t}>
                <CheckCircle2 size={18} /> {t}
              </li>
            ))}
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Digitech Avenue</small>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand-mobile">
            <span className="brand-mark">D</span>
            <strong style={{ fontFamily: 'var(--font-head)', color: 'var(--navy)', fontSize: 18 }}>
              Digitech Avenue CRM
            </strong>
          </div>
          <h1>Digitech Avenue CRM</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={submit}>
            {error && <div className="alert alert-error" style={{ marginBottom: 0 }}>{error}</div>}
            <label className="field">
              <span className="field-label">Username</span>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ height: 42 }}>
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="demo-box">
            <p>Demo logins</p>
            <div className="demo-buttons">
              {DEMOS.map((d) => (
                <button
                  key={d.username}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setUsername(d.username)
                    setPassword(d.password)
                    setError('')
                  }}
                >
                  {d.label}: {d.username} / {d.password}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
