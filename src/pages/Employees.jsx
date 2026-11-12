import { UserX } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { employeeFields } from '../config/forms.js'
import { ROLES } from '../config/options.js'
import { formatDate, titleCase } from '../utils/format.js'

const columns = [
  {
    key: 'name',
    header: 'Employee',
    render: (u) => (
      <>
        <div className="cell-title">{u.display_name}</div>
        <div className="cell-sub">@{u.username}{u.designation ? ` · ${u.designation}` : ''}</div>
      </>
    ),
  },
  { key: 'role', header: 'Role', render: (u) => <StatusBadge value={u.role} label={titleCase(u.role)} tone={u.role === 'owner' ? 'info' : 'neutral'} /> },
  {
    key: 'contact',
    header: 'Contact',
    render: (u) => (
      <>
        <div>{u.phone || '—'}</div>
        <div className="cell-sub">{u.email || '—'}</div>
      </>
    ),
  },
  { key: 'joined', header: 'Joined', render: (u) => formatDate(u.date_joined) },
  {
    key: 'status',
    header: 'Status',
    render: (u) => (
      <StatusBadge
        value={u.is_active && u.is_active_employee ? 'active' : 'inactive'}
      />
    ),
  },
]

export default function Employees() {
  const deactivate = async (u, { reload, toast }) => {
    if (!window.confirm(`Deactivate ${u.display_name}? They will no longer be able to sign in.`)) return
    try {
      await api.post(`/employees/${u.id}/deactivate/`)
      toast.success('Employee deactivated')
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <ResourcePage
      title="Employees"
      subtitle="Manage team members and their roles."
      endpoint="/employees/"
      entityName="employee"
      addLabel="Add employee"
      searchPlaceholder="Search name, username, email, phone…"
      columns={columns}
      filters={[{ key: 'role', label: 'Role', options: ROLES }]}
      fields={employeeFields}
      rowActions={(u, helpers) =>
        u.is_active && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => deactivate(u, helpers)}>
            <UserX size={14} /> Deactivate
          </button>
        )
      }
    />
  )
}
