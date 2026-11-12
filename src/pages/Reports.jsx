import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FolderKanban, IndianRupee, Target, Wallet } from 'lucide-react'
import { errorMessage, listAll } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import { LEAD_STATUS, PROJECT_STATUS, TASK_STATUS } from '../config/options.js'
import { formatINR, formatINRCompact } from '../utils/format.js'

function Bars({ rows, format = (v) => v, color = '' }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  const visible = rows.filter((r) => r.value > 0 || rows.length <= 6)
  if (!visible.length) return <p className="muted">No data yet.</p>
  return (
    <div className="bar-list">
      {visible.map((r) => (
        <div className="bar-row" key={r.label}>
          <span title={r.label} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${color}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="bar-val">{format(r.value)}</span>
        </div>
      ))}
    </div>
  )
}

function countBy(items, key, options) {
  const counts = {}
  items.forEach((i) => {
    counts[i[key]] = (counts[i[key]] || 0) + 1
  })
  return options.map((o) => ({ label: o.label, value: counts[o.value] || 0 }))
}

export default function Reports() {
  const { isOwner } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      listAll('/leads/'),
      listAll('/projects/'),
      listAll('/payments/'),
      listAll('/tasks/'),
    ])
      .then(([leads, projects, payments, tasks]) => alive && setData({ leads, projects, payments, tasks }))
      .catch((e) => alive && setError(errorMessage(e)))
    return () => {
      alive = false
    }
  }, [])

  const report = useMemo(() => {
    if (!data) return null
    const { leads, projects, payments, tasks } = data
    const verified = payments.filter((p) => p.status === 'verified')

    // Last 6 months of verified collections
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        value: 0,
      })
    }
    verified.forEach((p) => {
      const m = months.find((x) => x.key === String(p.payment_date).slice(0, 7))
      if (m) m.value += Number(p.amount)
    })

    const byClient = {}
    projects.forEach((p) => {
      byClient[p.client_name] = (byClient[p.client_name] || 0) + Number(p.outstanding_balance || 0)
    })
    const topOutstanding = Object.entries(byClient)
      .map(([label, value]) => ({ label, value }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    const totalValue = projects.reduce((s, p) => s + Number(p.project_value || 0), 0)
    const collected = verified.reduce((s, p) => s + Number(p.amount), 0)
    const converted = leads.filter((l) => l.converted_client).length

    return {
      leadsByStatus: countBy(leads, 'status', LEAD_STATUS),
      projectsByStatus: countBy(projects, 'status', PROJECT_STATUS),
      tasksByStatus: countBy(tasks, 'status', TASK_STATUS),
      months,
      topOutstanding,
      totalValue,
      collected,
      outstanding: totalValue - collected,
      converted,
      leadCount: leads.length,
      projectCount: projects.length,
      pendingPayments: payments.filter((p) => p.status === 'pending_verification').length,
    }
  }, [data])

  if (error) return <ErrorState message={error} />
  if (!report) return <Loading label="Building reports…" />

  const conv = report.leadCount ? Math.round((report.converted / report.leadCount) * 100) : 0

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isOwner ? 'Reports' : 'My Reports'}</h1>
          <p className="muted">{isOwner ? 'Company-wide performance summary.' : 'Summary of your leads, projects and collections.'}</p>
        </div>
        <Link to="/exports?new=1" className="btn btn-secondary"><Download size={16} /> Request data export</Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Leads" value={report.leadCount} hint={`${conv}% converted to clients`} icon={Target} tone="blue" />
        <StatCard label="Projects" value={report.projectCount} hint={`${formatINRCompact(report.totalValue)} contracted`} icon={FolderKanban} tone="blue" />
        <StatCard label="Collected (verified)" value={formatINRCompact(report.collected)} hint={formatINR(report.collected)} icon={IndianRupee} tone="green" />
        <StatCard label="Outstanding" value={formatINRCompact(report.outstanding)} hint={`${report.pendingPayments} payments awaiting verification`} icon={Wallet} tone="red" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Collections — last 6 months</h3></div>
          <div className="card-body"><Bars rows={report.months} format={formatINRCompact} color="green" /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Top outstanding clients</h3></div>
          <div className="card-body"><Bars rows={report.topOutstanding} format={formatINRCompact} color="amber" /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Leads by status</h3></div>
          <div className="card-body"><Bars rows={report.leadsByStatus} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Projects by status</h3></div>
          <div className="card-body"><Bars rows={report.projectsByStatus} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Tasks by status</h3></div>
          <div className="card-body"><Bars rows={report.tasksByStatus} /></div>
        </div>
      </div>
    </div>
  )
}
