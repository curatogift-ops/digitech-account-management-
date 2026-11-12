import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'
import EntityForm from '../components/EntityForm.jsx'
import ResourcePage from '../components/ResourcePage.jsx'
import { paymentColumns, taskColumns } from '../config/columns.jsx'
import { paymentFields, projectFields, taskFields } from '../config/forms.js'
import { MILESTONE_STATUS } from '../config/options.js'
import { formatDate, formatINR } from '../utils/format.js'

const TABS = ['Overview', 'Tasks', 'Payments']

function MilestoneModal({ projectId, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', due_date: '', status: 'pending', description: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const body = { ...form }
      if (!body.due_date) delete body.due_date
      await api.post(`/projects/${projectId}/add_milestone/`, body)
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal title="Add milestone" onClose={onClose} size="sm">
      <form onSubmit={submit} className="stack">
        {error && <div className="alert alert-error">{error}</div>}
        <label className="field">
          <span className="field-label">Title<em className="req">*</em></span>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span className="field-label">Due date</span>
          <input className="input" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {MILESTONE_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Description</span>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Add milestone'}</button>
        </div>
      </form>
    </Modal>
  )
}

function KV({ label, children, wide }) {
  return (
    <div className={`kv${wide ? ' kv-wide' : ''}`}>
      <span className="kv-label">{label}</span>
      <div className="kv-value">{children || '—'}</div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { isOwner } = useAuth()
  const [project, setProject] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Overview')
  const [editing, setEditing] = useState(false)
  const [addingMilestone, setAddingMilestone] = useState(false)

  const load = useCallback(() => {
    api
      .get(`/projects/${id}/`)
      .then(({ data }) => {
        setProject(data)
        setError('')
      })
      .catch((e) => setError(errorMessage(e)))
  }, [id])

  useEffect(() => {
    setProject(null)
    load()
  }, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!project) return <Loading label="Loading project…" />

  const value = Number(project.project_value)
  const collected = Number(project.total_verified_payments)
  const outstanding = Number(project.outstanding_balance)
  const pct = value ? Math.min(100, (collected / value) * 100) : 0

  return (
    <div className="page">
      <div>
        <Link to="/projects" className="back-link"><ArrowLeft size={14} /> Projects</Link>
        <div className="detail-head">
          <div>
            <h1>{project.name}</h1>
            <div className="detail-meta">
              <span className="muted">{project.project_id}</span>
              <StatusBadge value={project.status} label={project.status_display} />
              <StatusBadge value={project.priority} />
              <span className="muted">
                Client: <Link to={`/clients/${project.client}`}>{project.client_name}</Link>
              </span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit project
          </button>
        </div>
      </div>

      <div className="card card-pad stack">
        <div className="money-strip">
          <div className="money-item"><div className="l">Project value</div><div className="v">{formatINR(value)}</div></div>
          <div className="money-item ok"><div className="l">Collected (verified)</div><div className="v">{formatINR(collected)}</div></div>
          <div className={`money-item ${outstanding > 0 ? 'due' : 'ok'}`}><div className="l">Outstanding</div><div className="v">{formatINR(outstanding)}</div></div>
          <div className="money-item"><div className="l">Advance agreed</div><div className="v">{formatINR(project.advance_amount)}</div></div>
        </div>
        <div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>
          <div className="cell-sub" style={{ marginTop: 5 }}>{pct.toFixed(0)}% of project value collected</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="stack">
          <div className="card card-pad">
            <div className="kv-grid">
              <KV label="Service type">{project.service_type}</KV>
              <KV label="Assigned PM">{project.assigned_pm_name}</KV>
              <KV label="Start date">{formatDate(project.start_date)}</KV>
              <KV label="Expected completion">{formatDate(project.expected_completion)}</KV>
              <KV label="Actual completion">{formatDate(project.actual_completion)}</KV>
              <KV label="Requirement">
                {project.requirement ? <Link to={`/requirements/${project.requirement}`}>View requirement</Link> : null}
              </KV>
              <KV label="Approved scope" wide>{project.approved_scope}</KV>
              <KV label="Payment schedule" wide>{project.payment_schedule}</KV>
              <KV label="Blockers" wide>{project.blockers}</KV>
              <KV label="Notes" wide>{project.notes}</KV>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Milestones</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddingMilestone(true)}>
                <Plus size={14} /> Add milestone
              </button>
            </div>
            <div className="card-body">
              {!project.milestones?.length ? (
                <p className="muted">No milestones yet.</p>
              ) : (
                <ul className="list-plain">
                  {project.milestones.map((m) => (
                    <li key={m.id}>
                      <div>
                        <div className="cell-title">{m.title}</div>
                        <div className="cell-sub">Due {formatDate(m.due_date)}{m.description ? ` · ${m.description}` : ''}</div>
                      </div>
                      <StatusBadge value={m.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {project.members?.length > 0 && (
            <div className="card">
              <div className="card-header"><h3>Team</h3></div>
              <div className="card-body">
                <ul className="list-plain">
                  {project.members.map((m) => (
                    <li key={m.id}><span className="cell-title">{m.user_name}</span><span className="muted">{m.role_label || 'Member'}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Tasks' && (
        <ResourcePage
          embedded
          endpoint="/tasks/"
          entityName="task"
          addLabel="Add task"
          columns={taskColumns}
          fields={taskFields}
          params={{ project: id }}
          initialValues={{ project: Number(id), client: project.client }}
          canDelete={isOwner}
          modalSize="lg"
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
          params={{ project: id }}
          initialValues={{ project: Number(id), client: project.client }}
          canEdit={(p) => p.status !== 'verified'}
          onChanged={load}
        />
      )}

      {editing && (
        <Modal title={`Edit ${project.project_id}`} size="lg" onClose={() => setEditing(false)}>
          <EntityForm
            fields={projectFields}
            endpoint="/projects/"
            id={project.id}
            initial={project}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              toast.success('Project updated')
              load()
            }}
          />
        </Modal>
      )}

      {addingMilestone && (
        <MilestoneModal
          projectId={project.id}
          onClose={() => setAddingMilestone(false)}
          onSaved={() => {
            setAddingMilestone(false)
            toast.success('Milestone added')
            load()
          }}
        />
      )}
    </div>
  )
}
