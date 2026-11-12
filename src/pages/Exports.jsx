import { useState } from 'react'
import { Check, Download, X } from 'lucide-react'
import api from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import ActionModal from '../components/ActionModal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { exportFields } from '../config/forms.js'
import { EXPORT_FORMAT, EXPORT_STATUS } from '../config/options.js'
import { formatDateTime } from '../utils/format.js'

export default function Exports() {
  const { isOwner } = useAuth()
  const [review, setReview] = useState(null)

  const columns = [
    {
      key: 'export',
      header: 'Request',
      render: (x) => (
        <>
          <div className="cell-title">{x.export_id}</div>
          <div className="cell-sub">{formatDateTime(x.created_at)}</div>
        </>
      ),
    },
    { key: 'requester', header: 'Requested by', render: (x) => x.requester_name || '—' },
    { key: 'type', header: 'Data', render: (x) => x.export_type },
    { key: 'format', header: 'Format', render: (x) => String(x.format).toUpperCase() },
    { key: 'reason', header: 'Reason', render: (x) => (x.reason.length > 80 ? `${x.reason.slice(0, 80)}…` : x.reason) },
    { key: 'status', header: 'Status', render: (x) => <StatusBadge value={x.status} /> },
  ]

  const submit = async () => {
    const { item, kind, reload, toast } = review
    await api.post(`/exports/${item.id}/${kind}/`)
    toast.success(kind === 'approve' ? 'Export approved' : 'Export rejected')
    reload()
  }

  return (
    <>
      <ResourcePage
        title="Export Requests"
        subtitle={isOwner ? 'Approve or reject requests to export company data.' : 'Request approval to export data.'}
        endpoint="/exports/"
        entityName="export request"
        addLabel="Request export"
        modalSize="sm"
        searchable={false}
        columns={columns}
        filters={[
          { key: 'status', label: 'Status', options: EXPORT_STATUS },
          { key: 'format', label: 'Format', options: EXPORT_FORMAT },
        ]}
        fields={exportFields}
        canEdit={false}
        rowActions={(x, helpers) => (
          <>
            {x.file && (
              <a className="btn btn-secondary btn-sm" href={x.file} target="_blank" rel="noreferrer">
                <Download size={14} /> Download
              </a>
            )}
            {isOwner && x.status === 'pending' && (
              <>
                <button type="button" className="btn btn-success btn-sm" onClick={() => setReview({ item: x, kind: 'approve', ...helpers })}>
                  <Check size={14} /> Approve
                </button>
                <button type="button" className="btn btn-warning btn-sm" onClick={() => setReview({ item: x, kind: 'reject', ...helpers })}>
                  <X size={14} /> Reject
                </button>
              </>
            )}
          </>
        )}
      />
      {review && (
        <ActionModal
          title={`${review.kind === 'approve' ? 'Approve' : 'Reject'} ${review.item.export_id}`}
          description={`${review.item.export_type} (${String(review.item.format).toUpperCase()}) requested by ${review.item.requester_name}. Reason: ${review.item.reason}`}
          confirmLabel={review.kind === 'approve' ? 'Approve export' : 'Reject export'}
          tone={review.kind === 'approve' ? 'success' : 'danger'}
          inputType="none"
          onSubmit={submit}
          onClose={() => setReview(null)}
        />
      )}
    </>
  )
}
