import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FolderKanban,
  IndianRupee,
  PauseCircle,
  Receipt,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatINR, formatINRCompact } from '../utils/format.js'

function ActionCard({ to, count, title, hint }) {
  return (
    <Link to={to} className={`action-card ${count > 0 ? 'has-items' : 'zero'}`}>
      <div className="action-count">{count ?? 0}</div>
      <div>
        <strong>{title}</strong>
        <span>{hint}</span>
      </div>
    </Link>
  )
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [awaiting, setAwaiting] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      api.get('/dashboard/'),
      api.get('/accounts-dashboard/').catch(() => ({ data: null })),
      api.get('/requirements/', { params: { status: 'awaiting_approval' } }).catch(() => ({ data: { results: [] } })),
      api.get('/payments/', { params: { status: 'pending_verification' } }).catch(() => ({ data: { results: [] } })),
    ])
      .then(([d, a, r, p]) => {
        if (!alive) return
        setData(d.data)
        setAccounts(a.data)
        setAwaiting((r.data.results || r.data).slice(0, 5))
        setPendingPayments((p.data.results || p.data).slice(0, 5))
      })
      .catch((e) => alive && setError(errorMessage(e)))
    return () => {
      alive = false
    }
  }, [])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return <Loading label="Loading dashboard…" />

  const m = data.metrics || {}
  const a = data.action_centre || {}

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.first_name || user?.display_name || 'Owner'}</h1>
          <p className="muted">Company overview and items that need your attention.</p>
        </div>
      </div>

      <h3 className="section-title">Action centre</h3>
      <div className="action-grid">
        <ActionCard to="/requirements" count={a.requirements_awaiting} title="Requirements to approve" hint="Awaiting your review" />
        <ActionCard to="/payments" count={a.payments_pending} title="Payments to verify" hint="Submitted by PMs" />
        <ActionCard to="/exports" count={a.export_requests} title="Export requests" hint="Pending approval" />
        <ActionCard to="/tasks" count={a.overdue_tasks} title="Overdue tasks" hint="Past due date" />
        <ActionCard to="/projects" count={a.delayed_projects} title="Delayed projects" hint="Past expected completion" />
      </div>

      <h3 className="section-title">Company metrics</h3>
      <div className="stat-grid">
        <StatCard label="Total revenue (verified)" value={formatINRCompact(m.total_revenue)} hint={formatINR(m.total_revenue)} icon={IndianRupee} tone="green" />
        <StatCard label="Outstanding" value={formatINRCompact(m.total_outstanding)} hint="Contracted minus verified" icon={Wallet} tone="red" alert={m.total_outstanding > 0} />
        <StatCard label="Total project value" value={formatINRCompact(m.total_project_value)} icon={Briefcase} tone="blue" />
        <StatCard label="Monthly expenses" value={formatINRCompact(m.monthly_expenses)} icon={Receipt} tone="amber" />
        <StatCard label="Net cash movement" value={formatINRCompact(m.net_cash_movement)} icon={TrendingUp} tone={m.net_cash_movement >= 0 ? 'green' : 'red'} />
        <StatCard label="Total leads" value={m.total_leads} hint={`${m.new_leads ?? 0} new`} icon={Target} tone="blue" to="/leads" />
        <StatCard label="Active projects" value={m.active_projects} hint={`${m.confirmed_projects ?? 0} confirmed overall`} icon={FolderKanban} tone="blue" to="/projects" />
        <StatCard label="Completed projects" value={m.completed_projects} icon={CheckCircle2} tone="green" to="/projects" />
        <StatCard label="On hold" value={m.on_hold_projects} icon={PauseCircle} tone="slate" to="/projects" />
      </div>

      {accounts && (
        <>
          <h3 className="section-title">Accounts snapshot</h3>
          <div className="stat-grid">
            <StatCard label="Monthly income" value={formatINRCompact(accounts.monthly_income)} icon={IndianRupee} tone="green" />
            <StatCard label="Invoices issued" value={accounts.invoices_issued} hint={formatINR(accounts.invoice_total)} icon={Receipt} tone="blue" to="/invoices" />
            <StatCard label="Pending verifications" value={accounts.pending_verifications} icon={Clock} tone="amber" to="/payments" alert={accounts.pending_verifications > 0} />
            <StatCard label="Total expenses" value={formatINRCompact(accounts.total_expenses)} icon={AlertTriangle} tone="amber" to="/expenses" />
          </div>
        </>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Requirements awaiting approval</h3>
            <Link to="/requirements">View all</Link>
          </div>
          <div className="card-body">
            {!awaiting.length ? (
              <p className="muted">Nothing waiting for review.</p>
            ) : (
              <ul className="list-plain">
                {awaiting.map((r) => (
                  <li key={r.id}>
                    <div>
                      <Link to={`/requirements/${r.id}`} className="cell-title">{r.requirement_id} · {r.client_name}</Link>
                      <div className="cell-sub">By {r.created_by_name || '—'} · {formatDate(r.submitted_at)}</div>
                    </div>
                    <span className="num">{formatINR(r.estimated_value)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Payments pending verification</h3>
            <Link to="/payments">View all</Link>
          </div>
          <div className="card-body">
            {!pendingPayments.length ? (
              <p className="muted">All payments are verified.</p>
            ) : (
              <ul className="list-plain">
                {pendingPayments.map((p) => (
                  <li key={p.id}>
                    <div>
                      <Link to="/payments" className="cell-title">{p.payment_id} · {p.client_name}</Link>
                      <div className="cell-sub">{p.project_name} · {formatDate(p.payment_date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num"><strong>{formatINR(p.amount)}</strong></div>
                      <StatusBadge value={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <Link className="btn btn-secondary" to="/requirements"><ClipboardList size={16} /> Review requirements</Link>
        <Link className="btn btn-secondary" to="/exports"><Download size={16} /> Export requests</Link>
        <Link className="btn btn-secondary" to="/reports"><TrendingUp size={16} /> Reports</Link>
      </div>
    </div>
  )
}
