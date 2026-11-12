import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatDateTime, formatINR, isOverdue } from '../utils/format.js'

export const projectColumns = [
  {
    key: 'project',
    header: 'Project',
    render: (p) => (
      <>
        <div className="cell-title">{p.name}</div>
        <div className="cell-sub">{p.project_id}</div>
      </>
    ),
  },
  {
    key: 'client',
    header: 'Client',
    render: (p) => (
      <Link to={`/clients/${p.client}`} onClick={(e) => e.stopPropagation()}>
        {p.client_name}
      </Link>
    ),
  },
  { key: 'project_value', header: 'Value', align: 'right', render: (p) => <span className="num">{formatINR(p.project_value)}</span> },
  { key: 'paid', header: 'Collected', align: 'right', render: (p) => <span className="num">{formatINR(p.total_verified_payments)}</span> },
  {
    key: 'outstanding',
    header: 'Outstanding',
    align: 'right',
    render: (p) => (
      <span className={`num ${Number(p.outstanding_balance) > 0 ? 'text-danger' : 'text-success'}`}>
        <strong>{formatINR(p.outstanding_balance)}</strong>
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (p) => <StatusBadge value={p.status} label={p.status_display} /> },
  { key: 'expected', header: 'Due', render: (p) => formatDate(p.expected_completion) },
]

export const paymentColumns = [
  {
    key: 'payment',
    header: 'Payment',
    render: (p) => (
      <>
        <div className="cell-title">{p.payment_id}</div>
        <div className="cell-sub">{formatDate(p.payment_date)}</div>
      </>
    ),
  },
  { key: 'client', header: 'Client', render: (p) => p.client_name },
  { key: 'project', header: 'Project', render: (p) => p.project_name },
  { key: 'amount', header: 'Amount', align: 'right', render: (p) => <strong className="num">{formatINR(p.amount)}</strong> },
  {
    key: 'method',
    header: 'Method',
    render: (p) => (
      <>
        <div>{String(p.method || '').replace(/_/g, ' ').toUpperCase()}</div>
        <div className="cell-sub">{p.transaction_reference || '—'}</div>
      </>
    ),
  },
  { key: 'submitted_by', header: 'Submitted by', render: (p) => p.submitted_by_name || '—' },
  { key: 'status', header: 'Status', render: (p) => <StatusBadge value={p.status} label={p.status_display} /> },
  {
    key: 'proof',
    header: 'Proof',
    render: (p) =>
      p.proof ? (
        <a href={p.proof} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          View
        </a>
      ) : (
        <span className="muted">—</span>
      ),
  },
]

export const followUpColumns = [
  {
    key: 'who',
    header: 'Client / Lead',
    render: (f) => (
      <>
        <div className="cell-title">{f.client_name || f.lead_name || '—'}</div>
        <div className="cell-sub">{f.employee_name}</div>
      </>
    ),
  },
  { key: 'scheduled_at', header: 'Scheduled', render: (f) => <span className="num">{formatDateTime(f.scheduled_at)}</span> },
  { key: 'method', header: 'Method', render: (f) => <StatusBadge value={f.method} tone="info" /> },
  {
    key: 'notes',
    header: 'Notes / Next action',
    render: (f) => (
      <>
        <div>{f.discussion_notes ? f.discussion_notes.slice(0, 70) : '—'}</div>
        {f.next_action && <div className="cell-sub">Next: {f.next_action.slice(0, 60)}</div>}
      </>
    ),
  },
  { key: 'status', header: 'Status', render: (f) => <StatusBadge value={f.status} /> },
]

export const taskColumns = [
  {
    key: 'task',
    header: 'Task',
    render: (t) => (
      <>
        <div className="cell-title">{t.title}</div>
        <div className="cell-sub">{t.task_id}{t.project_name ? ` · ${t.project_name}` : t.client_name ? ` · ${t.client_name}` : ''}</div>
      </>
    ),
  },
  { key: 'assigned', header: 'Assigned to', render: (t) => t.assigned_to_name || '—' },
  { key: 'priority', header: 'Priority', render: (t) => <StatusBadge value={t.priority} /> },
  {
    key: 'due_date',
    header: 'Due',
    render: (t) => (
      <span className={t.status !== 'done' && isOverdue(t.due_date) ? 'text-danger' : undefined}>
        {formatDate(t.due_date)}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (t) => <StatusBadge value={t.status} label={t.status_display} /> },
]
