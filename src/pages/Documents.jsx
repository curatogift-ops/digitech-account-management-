import { Download, Lock } from 'lucide-react'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useLookups from '../hooks/useLookups.js'
import { documentFields } from '../config/forms.js'
import { DOCUMENT_CATEGORY } from '../config/options.js'
import { formatDate } from '../utils/format.js'

export default function Documents() {
  const { isOwner } = useAuth()
  const { data: lookups } = useLookups(['clients', 'projects'])
  const nameOf = (list, id) => (list || []).find((x) => x.id === id)

  const columns = [
    {
      key: 'title',
      header: 'Document',
      render: (d) => (
        <>
          <div className="cell-title">
            {d.title} {d.is_sensitive && <Lock size={13} style={{ verticalAlign: '-1px', color: 'var(--warning)' }} />}
          </div>
          {d.notes && <div className="cell-sub">{d.notes.slice(0, 70)}</div>}
        </>
      ),
    },
    { key: 'category', header: 'Category', render: (d) => <StatusBadge value={d.category} label={d.category_display} tone="info" /> },
    { key: 'client', header: 'Client', render: (d) => nameOf(lookups.clients, d.client)?.client_name || '—' },
    { key: 'project', header: 'Project', render: (d) => nameOf(lookups.projects, d.project)?.name || '—' },
    { key: 'uploaded_by', header: 'Uploaded by', render: (d) => d.uploaded_by_name || '—' },
    { key: 'created_at', header: 'Date', render: (d) => formatDate(d.created_at) },
  ]

  return (
    <ResourcePage
      title="Documents"
      subtitle="Proposals, agreements, designs and receipts."
      endpoint="/documents/"
      entityName="document"
      addLabel="Upload document"
      modalTitle={(item) => (item ? 'Edit document' : 'Upload document')}
      searchPlaceholder="Search title or notes…"
      columns={columns}
      filters={[{ key: 'category', label: 'Category', options: DOCUMENT_CATEGORY }]}
      fields={documentFields}
      canDelete={isOwner}
      rowActions={(d) =>
        d.file_url ? (
          <a className="btn btn-secondary btn-sm" href={d.file_url} target="_blank" rel="noreferrer">
            <Download size={14} /> Open
          </a>
        ) : (
          <span className="muted" style={{ fontSize: 12.5 }}>Restricted</span>
        )
      }
    />
  )
}
