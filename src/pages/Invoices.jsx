import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { invoiceFields } from '../config/forms.js'
import { INVOICE_STATUS } from '../config/options.js'
import { formatDate, formatINR } from '../utils/format.js'

const columns = [
  {
    key: 'invoice',
    header: 'Invoice',
    render: (i) => (
      <>
        <div className="cell-title">{i.invoice_number}</div>
        <div className="cell-sub">{formatDate(i.invoice_date)}</div>
      </>
    ),
  },
  { key: 'client', header: 'Client', render: (i) => i.client_name },
  { key: 'project', header: 'Project', render: (i) => i.project_name || '—' },
  { key: 'due_date', header: 'Due', render: (i) => formatDate(i.due_date) },
  { key: 'total', header: 'Total', align: 'right', render: (i) => <strong className="num">{formatINR(i.total_amount)}</strong> },
  { key: 'paid', header: 'Paid', align: 'right', render: (i) => <span className="num">{formatINR(i.paid_amount)}</span> },
  {
    key: 'balance',
    header: 'Balance',
    align: 'right',
    render: (i) => <span className={`num ${Number(i.balance) > 0 ? 'text-danger' : 'text-success'}`}>{formatINR(i.balance)}</span>,
  },
  { key: 'status', header: 'Status', render: (i) => <StatusBadge value={i.status} /> },
]

// total = taxable + tax when left blank
const withTotal = (payload) => {
  if (payload.total_amount === '' || payload.total_amount == null) {
    payload.total_amount = String((Number(payload.taxable_amount) || 0) + (Number(payload.tax_amount) || 0))
  }
  ;['tax_amount', 'paid_amount', 'taxable_amount'].forEach((k) => {
    if (payload[k] === null) payload[k] = '0'
  })
  return payload
}

export default function Invoices() {
  const { isOwner } = useAuth()
  return (
    <ResourcePage
      title="Invoices"
      subtitle="Billing records and what is still to be paid."
      endpoint="/invoices/"
      entityName="invoice"
      addLabel="New invoice"
      searchPlaceholder="Search invoice number, client…"
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: INVOICE_STATUS }]}
      fields={invoiceFields}
      transform={withTotal}
      modalSize="lg"
      canAdd={isOwner}
      canDelete={isOwner}
    />
  )
}
