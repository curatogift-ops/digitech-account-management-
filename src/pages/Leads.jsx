import { useNavigate } from 'react-router-dom'
import { UserCheck } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { LEAD_STATUS, PRIORITY } from '../config/options.js'
import { formatDate, formatINR } from '../utils/format.js'
import LeadForm from './LeadForm.jsx'

export default function Leads() {
  const { isOwner } = useAuth()
  const navigate = useNavigate()

  const columns = [
    {
      key: 'lead',
      header: 'Lead',
      render: (l) => (
        <>
          <div className="cell-title">{l.client_name}</div>
          <div className="cell-sub">{l.lead_id}{l.company ? ` · ${l.company}` : ''}</div>
        </>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (l) => (
        <>
          <div>{l.phone}</div>
          <div className="cell-sub">{l.email || '—'}</div>
        </>
      ),
    },
    { key: 'required_service', header: 'Service', render: (l) => l.required_service || '—' },
    { key: 'estimated_value', header: 'Est. value', align: 'right', render: (l) => <span className="num">{formatINR(l.estimated_value)}</span> },
    { key: 'priority', header: 'Priority', render: (l) => <StatusBadge value={l.priority} /> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge value={l.status} label={l.status_display} /> },
    { key: 'assigned', header: 'Assigned to', render: (l) => l.assigned_to_name || '—' },
    { key: 'next_follow_up', header: 'Next follow-up', render: (l) => formatDate(l.next_follow_up) },
  ]

  const convert = async (lead, { reload, toast }) => {
    if (!window.confirm(`Convert ${lead.client_name} into a client?`)) return
    try {
      const { data } = await api.post(`/leads/${lead.id}/convert/`)
      toast.success('Lead converted to client')
      reload()
      navigate(`/clients/${data.id}`)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <ResourcePage
      title="Leads"
      subtitle="Track enquiries from first contact to confirmation."
      endpoint="/leads/"
      entityName="lead"
      addLabel="Add lead"
      searchPlaceholder="Search name, company, phone, lead ID…"
      columns={columns}
      filters={[
        { key: 'status', label: 'Status', options: LEAD_STATUS },
        { key: 'priority', label: 'Priority', options: PRIORITY },
      ]}
      renderForm={({ item, onSaved, onCancel }) => <LeadForm lead={item} onSaved={onSaved} onCancel={onCancel} />}
      modalSize="lg"
      modalTitle={(item) => (item ? `Edit lead ${item.lead_id}` : 'New lead')}
      canDelete={isOwner}
      rowActions={(lead, helpers) =>
        lead.converted_client ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/clients/${lead.converted_client}`)}>
            View client
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => convert(lead, helpers)}>
            <UserCheck size={14} /> Convert
          </button>
        )
      }
    />
  )
}
