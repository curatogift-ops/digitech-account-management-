import { useState } from 'react'
import { Check } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { taskColumns } from '../config/columns.jsx'
import { pendingFields, taskFields } from '../config/forms.js'
import { PENDING_CATEGORY, PRIORITY, TASK_STATUS } from '../config/options.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, isOverdue, todayISO } from '../utils/format.js'

const pendingColumns = [
  {
    key: 'description',
    header: 'Pending item',
    render: (p) => (
      <>
        <div className="cell-title">{p.description.length > 80 ? `${p.description.slice(0, 80)}…` : p.description}</div>
        {p.next_action && <div className="cell-sub">Next: {p.next_action.slice(0, 70)}</div>}
      </>
    ),
  },
  { key: 'category', header: 'Category', render: (p) => <StatusBadge value={p.category} label={p.category_display} /> },
  { key: 'responsible', header: 'Responsible', render: (p) => p.responsible_name || '—' },
  { key: 'priority', header: 'Priority', render: (p) => <StatusBadge value={p.priority} /> },
  {
    key: 'due_date',
    header: 'Due',
    render: (p) => (
      <span className={p.category !== 'completed' && isOverdue(p.due_date) ? 'text-danger' : undefined}>
        {formatDate(p.due_date)}
      </span>
    ),
  },
]

export default function Tasks() {
  const { isOwner } = useAuth()
  const [tab, setTab] = useState('tasks')

  const markDone = async (t, { reload, toast }) => {
    try {
      await api.patch(`/tasks/${t.id}/`, { status: 'done', completion_date: todayISO() })
      toast.success('Task completed')
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const markPendingDone = async (p, { reload, toast }) => {
    try {
      await api.patch(`/pending-work/${p.id}/`, { category: 'completed' })
      toast.success('Pending item completed')
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isOwner ? 'Tasks' : 'Tasks & Pending'}</h1>
          <p className="muted">Work assigned to the team and items waiting on others.</p>
        </div>
      </div>

      <div className="tabs">
        <button type="button" className={`tab${tab === 'tasks' ? ' active' : ''}`} onClick={() => setTab('tasks')}>Tasks</button>
        <button type="button" className={`tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>Pending work</button>
      </div>

      {tab === 'tasks' ? (
        <ResourcePage
          embedded
          key="tasks"
          handleNewParam
          endpoint="/tasks/"
          entityName="task"
          addLabel="Add task"
          searchPlaceholder="Search tasks…"
          columns={taskColumns}
          filters={[
            { key: 'status', label: 'Status', options: TASK_STATUS },
            { key: 'priority', label: 'Priority', options: PRIORITY },
          ]}
          fields={taskFields}
          modalSize="lg"
          canDelete={isOwner}
          rowActions={(t, helpers) =>
            t.status !== 'done' && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => markDone(t, helpers)}>
                <Check size={14} /> Done
              </button>
            )
          }
        />
      ) : (
        <ResourcePage
          embedded
          key="pending"
          endpoint="/pending-work/"
          entityName="pending item"
          addLabel="Add pending item"
          searchPlaceholder="Search pending items…"
          columns={pendingColumns}
          filters={[
            { key: 'category', label: 'Category', options: PENDING_CATEGORY },
            { key: 'priority', label: 'Priority', options: PRIORITY },
          ]}
          fields={pendingFields}
          modalSize="lg"
          canDelete={isOwner}
          rowActions={(p, helpers) =>
            p.category !== 'completed' && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => markPendingDone(p, helpers)}>
                <Check size={14} /> Done
              </button>
            )
          }
        />
      )}
    </div>
  )
}
