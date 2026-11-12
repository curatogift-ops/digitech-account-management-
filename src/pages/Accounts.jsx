import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, FileText, IndianRupee, Receipt, TrendingUp, Wallet } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import StatCard from '../components/StatCard.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatINR, formatINRCompact } from '../utils/format.js'

export default function Accounts() {
  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([
      api.get('/accounts-dashboard/'),
      api.get('/payments/').catch(() => ({ data: { results: [] } })),
      api.get('/projects/', { params: { ordering: '-project_value' } }).catch(() => ({ data: { results: [] } })),
    ])
      .then(([a, p, pr]) => {
        setData(a.data)
        setRecent((p.data.results || p.data).slice(0, 6))
        setProjects(
          (pr.data.results || pr.data)
            .filter((x) => Number(x.outstanding_balance) > 0)
            .sort((x, y) => Number(y.outstanding_balance) - Number(x.outstanding_balance))
            .slice(0, 6),
        )
        setError('')
      })
      .catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Loading label="Loading accounts…" />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Accounts</h1>
          <p className="muted">Company collections, expenses and cash position.</p>
        </div>
        <div className="page-actions">
          <Link to="/invoices?new=1" className="btn btn-secondary"><FileText size={16} /> New invoice</Link>
          <Link to="/expenses?new=1" className="btn btn-secondary"><Receipt size={16} /> Add expense</Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total business revenue" value={formatINRCompact(data.total_business_revenue)} hint={formatINR(data.total_business_revenue)} icon={IndianRupee} tone="green" />
        <StatCard label="Monthly income" value={formatINRCompact(data.monthly_income)} hint="Verified this month" icon={TrendingUp} tone="green" />
        <StatCard label="Outstanding" value={formatINRCompact(data.total_outstanding)} hint="Contracted minus verified" icon={Wallet} tone="red" alert={data.total_outstanding > 0} />
        <StatCard label="Contracted value" value={formatINRCompact(data.contracted_project_value)} icon={Briefcase} tone="blue" to="/projects" />
        <StatCard label="Total expenses" value={formatINRCompact(data.total_expenses)} icon={Receipt} tone="amber" to="/expenses" />
        <StatCard label="Net cash movement" value={formatINRCompact(data.net_cash_movement)} icon={TrendingUp} tone={data.net_cash_movement >= 0 ? 'green' : 'red'} />
        <StatCard label="Invoices issued" value={data.invoices_issued} hint={formatINR(data.invoice_total)} icon={FileText} tone="blue" to="/invoices" />
        <StatCard label="Pending verifications" value={data.pending_verifications} icon={Clock} tone="amber" to="/payments" alert={data.pending_verifications > 0} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Recent payments</h3><Link to="/payments">View all</Link></div>
          <div className="card-body">
            {!recent.length ? <p className="muted">No payments recorded yet.</p> : (
              <ul className="list-plain">
                {recent.map((p) => (
                  <li key={p.id}>
                    <div>
                      <div className="cell-title">{p.client_name}</div>
                      <div className="cell-sub">{p.payment_id} · {formatDate(p.payment_date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong className="num">{formatINR(p.amount)}</strong>
                      <div><StatusBadge value={p.status} /></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Largest outstanding balances</h3><Link to="/projects">All projects</Link></div>
          <div className="card-body">
            {!projects.length ? <p className="muted">No outstanding balances.</p> : (
              <ul className="list-plain">
                {projects.map((p) => (
                  <li key={p.id}>
                    <div>
                      <Link to={`/projects/${p.id}`} className="cell-title">{p.name}</Link>
                      <div className="cell-sub">{p.client_name}</div>
                    </div>
                    <strong className="num text-danger">{formatINR(p.outstanding_balance)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
