import { Link } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { REQUIREMENT_STATUS } from '../config/options.js'
import { formatDate, formatINR } from '../utils/format.js'

export default function Requirements() {
  const { isOwner, user } = useAuth()

  const columns = [
    {
      key: 'req',
      header: 'Requirement',
      render: (r) => (
        <>
          <div className="cell-title">{r.requirement_id} <span className="muted">v{r.version}</span></div>
          <div className="cell-sub">{r.solution_type || '—'}</div>
        </>
      ),
    },
    { key: 'client', header: 'Client', render: (r) => r.client_name },
    { key: 'estimated_value', header: 'Estimated value', align: 'right', render: (r) => <span className="num">{formatINR(r.estimated_value)}</span> },
    { key: 'timeline', header: 'Timeline', render: (r) => r.expected_timeline || '—' },
    { key: 'created_by', header: 'Created by', render: (r) => r.created_by_name || '—' },
    { key: 'submitted_at', header: 'Submitted', render: (r) => formatDate(r.submitted_at) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} label={r.status_display} /> },
  ]

  return (
    <ResourcePage
      title="Requirements"
      subtitle={isOwner ? 'Review and approve requirements submitted by your team.' : 'Capture client requirements and submit them for approval.'}
      endpoint="/requirements/"
      entityName="requirement"
      searchPlaceholder="Search requirement ID, client, solution…"
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: REQUIREMENT_STATUS }]}
      canAdd={false}
      canEdit={false}
      canDelete={false}
      headerExtra={
        <Link to="/requirements/new" className="btn btn-primary">
          <Plus size={16} /> New requirement
        </Link>
      }
      rowLink={(r) => `/requirements/${r.id}`}
      rowActions={(r) =>
        ['draft', 'changes_requested'].includes(r.status) && (isOwner || r.created_by === user?.id) ? (
          <Link to={`/requirements/${r.id}/edit`} className="btn btn-secondary btn-sm">
            <Pencil size={13} /> Edit
          </Link>
        ) : null
      }
    />
  )
}
