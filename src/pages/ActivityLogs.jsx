import ResourcePage from '../components/ResourcePage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDateTime, titleCase } from '../utils/format.js'

const MODELS = ['Lead', 'Client', 'Requirement', 'Project', 'Task', 'Payment', 'Document', 'ApprovalRequest', 'ExportRequest', 'User'].map(
  (m) => ({ value: m, label: m }),
)

export default function ActivityLogs() {
  const { isOwner } = useAuth()

  const columns = [
    { key: 'when', header: 'When', render: (l) => <span className="num">{formatDateTime(l.created_at)}</span> },
    ...(isOwner ? [{ key: 'user', header: 'User', render: (l) => l.user_name || '—' }] : []),
    { key: 'action', header: 'Action', render: (l) => <span className="cell-title">{titleCase(l.action)}</span> },
    { key: 'model', header: 'Record type', render: (l) => l.model_name || '—' },
    {
      key: 'object',
      header: 'Record',
      render: (l) => (
        <>
          <div>{l.object_repr || '—'}</div>
          {l.object_id && <div className="cell-sub">{l.object_id}</div>}
        </>
      ),
    },
    { key: 'ip', header: 'IP', render: (l) => <span className="muted">{l.ip_address || '—'}</span> },
  ]

  return (
    <ResourcePage
      title={isOwner ? 'Activity Logs' : 'My Activity'}
      subtitle={isOwner ? 'Audit trail of everything that happens in the CRM.' : 'A record of your recent actions.'}
      endpoint="/activity-logs/"
      entityName="activity entry"
      searchPlaceholder="Search action or record…"
      columns={columns}
      filters={[{ key: 'model_name', label: 'Record type', options: MODELS }]}
      canAdd={false}
      canEdit={false}
      canDelete={false}
      emptyTitle="No activity yet"
    />
  )
}
