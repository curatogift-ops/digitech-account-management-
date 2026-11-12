import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import api, { listAll } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import ActionModal from '../components/ActionModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { paymentColumns } from '../config/columns.jsx'
import { paymentFields } from '../config/forms.js'
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../config/options.js'
import { formatINR } from '../utils/format.js'

function OutstandingPanel({ refreshKey }) {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let alive = true
    listAll('/projects/')
      .then((list) => {
        if (!alive) return
        setRows(
          list
            .filter((p) => Number(p.outstanding_balance) > 0 && !['cancelled'].includes(p.status))
            .sort((a, b) => Number(b.outstanding_balance) - Number(a.outstanding_balance)),
        )
      })
      .catch(() => alive && setRows([]))
    return () => {
      alive = false
    }
  }, [refreshKey])

  if (!rows || !rows.length) return null
  const total = rows.reduce((s, p) => s + Number(p.outstanding_balance), 0)

  return (
    <div className="card">
      <div className="card-header">
        <h3>Outstanding balances by project</h3>
        <span className="muted">
          Total outstanding: <strong className="text-danger">{formatINR(total)}</strong>
        </span>
      </div>
      <div className="card-body">
        <ul className="list-plain">
          {rows.slice(0, 6).map((p) => {
            const pct = Number(p.project_value) ? Math.min(100, (Number(p.total_verified_payments) / Number(p.project_value)) * 100) : 0
            return (
              <li key={p.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/projects/${p.id}`} className="cell-title">{p.name}</Link>
                  <div className="cell-sub">{p.client_name} · Collected {formatINR(p.total_verified_payments)} of {formatINR(p.project_value)}</div>
                  <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
                </div>
                <strong className="num text-danger">{formatINR(p.outstanding_balance)}</strong>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function Payments() {
  const { isOwner } = useAuth()
  const [review, setReview] = useState(null) // { payment, kind, reload, toast }
  const [refreshKey, setRefreshKey] = useState(0)

  const submitReview = async (notes) => {
    const { payment, kind, reload, toast } = review
    await api.post(`/payments/${payment.id}/${kind}/`, { notes })
    toast.success(kind === 'verify' ? 'Payment verified' : 'Payment rejected')
    reload()
  }

  return (
    <>
      <ResourcePage
        title={isOwner ? 'Payments' : 'Client Collections'}
        subtitle={
          isOwner
            ? 'Verify payments submitted by your team.'
            : 'Submit client payments for owner verification.'
        }
        endpoint="/payments/"
        entityName="payment"
        addLabel="Submit payment"
        modalTitle={(item) => (item ? `Edit payment ${item.payment_id}` : 'Submit payment')}
        searchPlaceholder="Search payment ID, client, project, reference…"
        columns={paymentColumns}
        filters={[
          { key: 'status', label: 'Status', options: PAYMENT_STATUS },
          { key: 'method', label: 'Method', options: PAYMENT_METHOD },
        ]}
        fields={paymentFields}
        canEdit={(p) => p.status !== 'verified'}
        canDelete={(p) => isOwner && p.status !== 'verified'}
        onChanged={() => setRefreshKey((k) => k + 1)}
        headerExtra={null}
        rowActions={
          isOwner
            ? (p, helpers) =>
                p.status === 'pending_verification' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => setReview({ payment: p, kind: 'verify', ...helpers })}
                    >
                      <Check size={14} /> Verify
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning btn-sm"
                      onClick={() => setReview({ payment: p, kind: 'reject', ...helpers })}
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                )
            : undefined
        }
      />
      <div style={{ marginTop: 18 }}>
        <OutstandingPanel refreshKey={refreshKey} />
      </div>
      {review && (
        <ActionModal
          title={review.kind === 'verify' ? `Verify ${review.payment.payment_id}` : `Reject ${review.payment.payment_id}`}
          description={`${formatINR(review.payment.amount)} from ${review.payment.client_name} for ${review.payment.project_name}.`}
          label={review.kind === 'verify' ? 'Notes (optional)' : 'Reason for rejection'}
          required={review.kind === 'reject'}
          confirmLabel={review.kind === 'verify' ? 'Verify payment' : 'Reject payment'}
          tone={review.kind === 'verify' ? 'success' : 'danger'}
          onSubmit={submitReview}
          onClose={() => setReview(null)}
        />
      )}
    </>
  )
}
