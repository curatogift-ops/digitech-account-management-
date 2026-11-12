import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'
import EntityForm from '../components/EntityForm.jsx'
import ResourcePage from '../components/ResourcePage.jsx'
import { followUpColumns, paymentColumns, projectColumns } from '../config/columns.jsx'
import { clientFields, followUpFields, paymentFields, projectFields } from '../config/forms.js'
import { formatDate, formatINR } from '../utils/format.js'

const TABS = ['Overview', 'Projects', 'Payments', 'Follow-ups']

function KV({ label, children, wide }) {
  return (
    <div className={`kv${wide ? ' kv-wide' : ''}`}>
      <span className="kv-label">{label}</span>
      <div className="kv-value">{children || '—'}</div>
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [client, setClient] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Overview')
  const [editing, setEditing] = useState(false)

  const load = useCallback(() => {
    api
      .get(`/clients/${id}/`)
      .then(({ data }) => {
        setClient(data)
        setError('')
      })
      .catch((e) => setError(errorMessage(e)))
  }, [id])

  useEffect(() => {
    setClient(null)
    setTab('Overview')
    load()
  }, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!client) return <Loading label="Loading client…" />

  const projects = client.projects || []
  const totalValue = projects.reduce((s, p) => s + Number(p.project_value || 0), 0)
  const totalPaid = projects.reduce((s, p) => s + Number(p.total_verified_payments || 0), 0)
  const totalDue = projects.reduce((s, p) => s + Number(p.outstanding_balance || 0), 0)

  return (
    <div className="page">
      <div>
        <Link to="/clients" className="back-link"><ArrowLeft size={14} /> Clients</Link>
        <div className="detail-head">
          <div>
            <h1>{client.client_name}</h1>
            <div className="detail-meta">
              <span className="muted">{client.client_id}</span>
              {client.company_name && <span>{client.company_name}</span>}
              <StatusBadge value={client.status} />
            </div>
            <div className="detail-meta muted">
              {client.phone && <span className="row" style={{ gap: 5 }}><Phone size={14} /> {client.phone}</span>}
              {client.email && <span className="row" style={{ gap: 5 }}><Mail size={14} /> {client.email}</span>}
              {client.location && <span className="row" style={{ gap: 5 }}><MapPin size={14} /> {client.location}</span>}
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit client
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="stack">
          <div className="card card-pad">
            <div className="money-strip">
              <div className="money-item"><div className="l">Projects</div><div className="v">{projects.length}</div></div>
              <div className="money-item"><div className="l">Contract value</div><div className="v">{formatINR(totalValue)}</div></div>
              <div className="money-item ok"><div className="l">Collected</div><div className="v">{formatINR(totalPaid)}</div></div>
              <div className={`money-item ${totalDue > 0 ? 'due' : 'ok'}`}><div className="l">Outstanding</div><div className="v">{formatINR(totalDue)}</div></div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="kv-grid">
              <KV label="Contact person">{client.contact_person}</KV>
              <KV label="Alternate phone">{client.alternate_phone}</KV>
              <KV label="Assigned PM">{client.assigned_pm_name}</KV>
              <KV label="Industry">{client.industry}</KV>
              <KV label="Business type">{client.business_type}</KV>
              <KV label="Lead source">{client.lead_source}</KV>
              <KV label="Website">
                {client.website ? <a href={client.website} target="_blank" rel="noreferrer">{client.website}</a> : null}
              </KV>
              <KV label="GST">{client.gst_details}</KV>
              <KV label="Client since">{formatDate(client.created_at)}</KV>
              <KV label="Address" wide>{client.address}</KV>
              <KV label="Notes" wide>{client.notes}</KV>
            </div>
          </div>
        </div>
      )}

      {tab === 'Projects' && (
        <ResourcePage
          embedded
          endpoint="/projects/"
          entityName="project"
          addLabel="Add project"
          columns={projectColumns}
          fields={projectFields}
          params={{ client: id }}
          initialValues={{ client: Number(id) }}
          rowLink={(p) => `/projects/${p.id}`}
          modalSize="lg"
          onChanged={load}
        />
      )}

      {tab === 'Payments' && (
        <ResourcePage
          embedded
          endpoint="/payments/"
          entityName="payment"
          addLabel="Submit payment"
          columns={paymentColumns}
          fields={paymentFields}
          params={{ client: id }}
          initialValues={{ client: Number(id) }}
          canEdit={(p) => p.status !== 'verified'}
          onChanged={load}
        />
      )}

      {tab === 'Follow-ups' && (
        <ResourcePage
          embedded
          endpoint="/followups/"
          entityName="follow-up"
          addLabel="Schedule follow-up"
          columns={followUpColumns}
          fields={followUpFields}
          params={{ client: id }}
          initialValues={{ client: Number(id) }}
          modalSize="lg"
        />
      )}

      {editing && (
        <Modal title={`Edit ${client.client_id}`} size="lg" onClose={() => setEditing(false)}>
          <EntityForm
            fields={clientFields}
            endpoint="/clients/"
            id={client.id}
            initial={client}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              toast.success('Client updated')
              load()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
