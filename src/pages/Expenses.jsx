import { Check, X } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { expenseFields } from '../config/forms.js'
import { EXPENSE_STATUS } from '../config/options.js'
import { formatDate, formatINR } from '../utils/format.js'

const columns = [
  {
    key: 'expense',
    header: 'Expense',
    render: (e) => (
      <>
        <div className="cell-title">{e.title}</div>
        <div className="cell-sub">{e.expense_id}</div>
      </>
    ),
  },
  { key: 'category', header: 'Category', render: (e) => e.category || '—' },
  { key: 'project', header: 'Project', render: (e) => e.project_name || '—' },
  { key: 'expense_date', header: 'Date', render: (e) => formatDate(e.expense_date) },
  { key: 'amount', header: 'Amount', align: 'right', render: (e) => <strong className="num">{formatINR(e.amount)}</strong> },
  { key: 'submitted_by', header: 'Submitted by', render: (e) => e.submitted_by_name || '—' },
  { key: 'status', header: 'Status', render: (e) => <StatusBadge value={e.status} /> },
  {
    key: 'receipt',
    header: 'Receipt',
    render: (e) =>
      e.receipt ? (
        <a href={e.receipt} target="_blank" rel="noreferrer">View</a>
      ) : (
        <span className="muted">—</span>
      ),
  },
]

export default function Expenses() {
  const setStatus = async (e, status, { reload, toast }) => {
    try {
      await api.patch(`/expenses/${e.id}/`, { status })
      toast.success(`Expense ${status}`)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <ResourcePage
      title="Expenses"
      subtitle="Company spend, with approvals."
      endpoint="/expenses/"
      entityName="expense"
      addLabel="Add expense"
      searchPlaceholder="Search expense ID, title, notes…"
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: EXPENSE_STATUS }]}
      fields={expenseFields}
      canDelete
      rowActions={(e, helpers) => (
        <>
          {e.status === 'submitted' && (
            <>
              <button type="button" className="btn btn-success btn-sm" onClick={() => setStatus(e, 'approved', helpers)}>
                <Check size={14} /> Approve
              </button>
              <button type="button" className="btn btn-warning btn-sm" onClick={() => setStatus(e, 'rejected', helpers)}>
                <X size={14} /> Reject
              </button>
            </>
          )}
          {e.status === 'approved' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus(e, 'paid', helpers)}>
              Mark paid
            </button>
          )}
        </>
      )}
    />
  )
}
