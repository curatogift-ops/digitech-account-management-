import { useState } from 'react'
import { Check, X } from 'lucide-react'
import api from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import ActionModal from '../components/ActionModal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { approvalFields } from '../config/forms.js'
import { APPROVAL_ACTION, APPROVAL_STATUS } from '../config/options.js'
import { formatDateTime } from '../utils/format.js'

export default function Approvals() {
  const { isOwner } = useAuth()
  const [review, setReview] = useState(null)

  const columns = [
    {
      key: 'req',
      header: 'Request',
      render: (a) => (
        <>
          <div className="cell-title">{a.request_id}</div>
          <div className="cell-sub">{formatDateTime(a.created_at)}</div>
        </>
      ),
    },
    { key: 'requester', header: 'Requested by', render: (a) => a.requester_name || '—' },
    { key: 'action', header: 'Action', render: (a) => a.action_display },
    { key: 'reason', header: 'Reason', render: (a) => (a.reason.length > 90 ? `${a.reason.slice(0, 90)}…` : a.reason) },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <>
          <StatusBadge value={a.status} />
          {a.status === 'approved' && a.expires_at && <div className="cell-sub">Expires {formatDateTime(a.expires_at)}</div>}
        </>
      ),
    },
    { key: 'notes', header: 'Owner notes', render: (a) => a.owner_notes || '—' },
  ]

  const submit = async (notes) => {
    const { item, kind, reload, toast } = review
    await api.post(`/approvals/${item.id}/${kind}/`, { notes })
    toast.success(kind === 'approve' ? 'Request approved (valid for 1 hour)' : 'Request rejected')
    reload()
  }

  return (
    <>
      <ResourcePage
        title="Approvals"
        subtitle={isOwner ? 'Sensitive actions waiting for your decision.' : 'Request owner approval for sensitive actions.'}
        endpoint="/approvals/"
        entityName="approval request"
        addLabel="Request approval"
        modalSize="sm"
        searchable={false}
        columns={columns}
        filters={[
          { key: 'status', label: 'Status', options: APPROVAL_STATUS },
          { key: 'action_type', label: 'Action', options: APPROVAL_ACTION },
        ]}
        fields={approvalFields}
        canEdit={false}
        rowActions={
          isOwner
            ? (a, helpers) =>
                a.status === 'pending' && (
                  <>
                    <button type="button" className="btn btn-success btn-sm" onClick={() => setReview({ item: a, kind: 'approve', ...helpers })}>
                      <Check size={14} /> Approve
                    </button>
                    <button type="button" className="btn btn-warning btn-sm" onClick={() => setReview({ item: a, kind: 'reject', ...helpers })}>
                      <X size={14} /> Reject
                    </button>
                  </>
                )
            : undefined
        }
      />
      {review && (
        <ActionModal
          title={`${review.kind === 'approve' ? 'Approve' : 'Reject'} ${review.item.request_id}`}
          description={`${review.item.action_display} — requested by ${review.item.requester_name}.`}
          label="Notes (optional)"
          confirmLabel={review.kind === 'approve' ? 'Approve' : 'Reject'}
          tone={review.kind === 'approve' ? 'success' : 'danger'}
          onSubmit={submit}
          onClose={() => setReview(null)}
        />
      )}
    </>
  )
}
