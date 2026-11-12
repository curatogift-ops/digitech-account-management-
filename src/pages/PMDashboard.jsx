import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  FolderKanban,
  IndianRupee,
  Target,
  UserPlus,
  Users,
  Clock,
  Timer,
  CheckCircle2,
} from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatCard from '../components/StatCard.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatDateTime, todayISO } from '../utils/format.js'

export default function PMDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [followups, setFollowups] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      api.get('/dashboard/'),
      api.get('/tasks/', { params: { assigned_to: user?.id } }).catch(() => ({ data: { results: [] } })),
      api.get('/followups/', { params: { status: 'scheduled' } }).catch(() => ({ data: { results: [] } })),
    ])
      .then(([d, t, f]) => {
        if (!alive) return
        setData(d.data)
        setTasks((t.data.results || t.data).filter((x) => x.status !== 'done').slice(0, 6))
        setFollowups((f.data.results || f.data).slice(0, 6))
      })
      .catch((e) => alive && setError(errorMessage(e)))
    return () => {
      alive = false
    }
  }, [user?.id])

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return <Loading label="Loading dashboard…" />

  const m = data.metrics || {}
  const today = todayISO()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Hello, {user?.first_name || user?.display_name || 'there'}</h1>
          <p className="muted">Your day at a glance.</p>
        </div>
      </div>

      <h3 className="section-title">Quick actions</h3>
      <div className="quick-actions">
        <Link className="btn btn-primary" to="/leads?new=1"><UserPlus size={16} /> New lead</Link>
        <Link className="btn btn-secondary" to="/clients?new=1"><Users size={16} /> New client</Link>
        <Link className="btn btn-secondary" to="/requirements/new"><ClipboardList size={16} /> New requirement</Link>
        <Link className="btn btn-secondary" to="/tasks?new=1"><CheckSquare size={16} /> Add task</Link>
        <Link className="btn btn-secondary" to="/followups?new=1"><CalendarClock size={16} /> Schedule follow-up</Link>
        <Link className="btn btn-secondary" to="/payments?new=1"><IndianRupee size={16} /> Submit payment</Link>
      </div>

      <h3 className="section-title">Operations</h3>
      <div className="stat-grid">
        <StatCard label="My leads" value={m.my_leads} icon={Target} tone="blue" to="/leads" />
        <StatCard label="Active clients" value={m.my_active_clients} icon={Users} tone="blue" to="/clients" />
        <StatCard label="Active projects" value={m.my_active_projects} icon={FolderKanban} tone="blue" to="/projects" />
        <StatCard label="Requirements awaiting" value={m.requirements_awaiting} hint="Waiting for owner" icon={Clock} tone="amber" to="/requirements" />
        <StatCard label="Requirements approved" value={m.requirements_approved} icon={CheckCircle2} tone="green" to="/requirements" />
        <StatCard label="Tasks due today" value={m.tasks_due_today} icon={Timer} tone="amber" to="/tasks" />
        <StatCard label="Overdue tasks" value={m.overdue_tasks} icon={AlertTriangle} tone="red" to="/tasks" alert={m.overdue_tasks > 0} />
        <StatCard label="Today’s follow-ups" value={m.todays_followups} hint={`${m.upcoming_followups ?? 0} upcoming`} icon={CalendarClock} tone="blue" to="/followups" />
        <StatCard label="Payments pending" value={m.pending_payments} hint="Awaiting owner verification" icon={IndianRupee} tone="amber" to="/payments" />
        <StatCard label="Near delivery" value={m.projects_near_delivery} hint="Due within 7 days" icon={FolderKanban} tone="red" to="/projects" alert={m.projects_near_delivery > 0} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>My open tasks</h3>
            <Link to="/tasks">View all</Link>
          </div>
          <div className="card-body">
            {!tasks.length ? (
              <p className="muted">No open tasks. Nice work!</p>
            ) : (
              <ul className="list-plain">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <div>
                      <div className="cell-title">{t.title}</div>
                      <div className={`cell-sub${t.due_date && t.due_date < today ? ' text-danger' : ''}`}>
                        Due {formatDate(t.due_date)}{t.project_name ? ` · ${t.project_name}` : ''}
                      </div>
                    </div>
                    <StatusBadge value={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Upcoming follow-ups</h3>
            <Link to="/followups">View all</Link>
          </div>
          <div className="card-body">
            {!followups.length ? (
              <p className="muted">No follow-ups scheduled.</p>
            ) : (
              <ul className="list-plain">
                {followups.map((f) => (
                  <li key={f.id}>
                    <div>
                      <div className="cell-title">{f.client_name || f.lead_name || 'Follow-up'}</div>
                      <div className="cell-sub">{formatDateTime(f.scheduled_at)}</div>
                    </div>
                    <StatusBadge value={f.method} tone="info" />
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
