import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { clientFields } from '../config/forms.js'
import { CLIENT_STATUS } from '../config/options.js'

export default function Clients() {
  const { isOwner } = useAuth()

  const columns = [
    {
      key: 'client',
      header: 'Client',
      render: (c) => (
        <>
          <div className="cell-title">{c.client_name}</div>
          <div className="cell-sub">{c.client_id}{c.company_name ? ` · ${c.company_name}` : ''}</div>
        </>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (c) => (
        <>
          <div>{c.phone}</div>
          <div className="cell-sub">{c.email || '—'}</div>
        </>
      ),
    },
    { key: 'location', header: 'Location', render: (c) => c.location || '—' },
    { key: 'industry', header: 'Industry', render: (c) => c.industry || c.business_type || '—' },
    { key: 'project_count', header: 'Projects', align: 'right', render: (c) => <span className="num">{c.project_count ?? 0}</span> },
    { key: 'pm', header: 'Assigned PM', render: (c) => c.assigned_pm_name || '—' },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge value={c.status} /> },
  ]

  return (
    <ResourcePage
      title="Clients"
      subtitle="Everyone you work with, in one place."
      endpoint="/clients/"
      entityName="client"
      addLabel="Add client"
      searchPlaceholder="Search name, company, phone, email…"
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: CLIENT_STATUS }]}
      fields={clientFields}
      modalSize="lg"
      canDelete={isOwner}
      rowLink={(c) => `/clients/${c.id}`}
    />
  )
}
