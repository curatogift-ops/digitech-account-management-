import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, FolderPlus, MessageSquareWarning, Pencil, Send, X } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import ActionModal from '../components/ActionModal.jsx'
import { formatDate, formatDateTime, formatINR } from '../utils/format.js'

const SECTIONS = [
  {
    title: 'Business context',
    items: [
      ['business_objective', 'Business objective'],
      ['current_problem', 'Current problem'],
      ['user_types', 'User types'],
    ],
  },
  {
    title: 'Features',
    items: [
      ['customer_features', 'Customer features'],
      ['staff_features', 'Staff features'],
      ['admin_features', 'Admin features'],
      ['detailed_features', 'Detailed features'],
      ['essential_features', 'Essential features (MVP)'],
      ['future_features', 'Future features'],
    ],
  },
  {
    title: 'Technical',
    items: [
      ['integrations', 'Integrations'],
      ['payment_requirements', 'Payment requirements'],
      ['notifications', 'Notifications'],
      ['location_gps', 'Location / GPS'],
      ['reference_apps', 'Reference apps / sites'],
    ],
  },
  {
    title: 'Notes',
    items: [
      ['meeting_notes', 'Meeting notes'],
      ['clarification_questions', 'Clarification questions'],
    ],
  },
]

function KV({ label, children, wide }) {
  return (
    <div className={`kv${wide ? ' kv-wide' : ''}`}>
      <span className="kv-label">{label}</span>
      <div className="kv-value">{children || '—'}</div>
    </div>
  )
}

export default function RequirementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOwner, user } = useAuth()
  const [req, setReq] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'approve' | 'changes' | 'reject' | 'project'
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api
      .get(`/requirements/${id}/`)
      .then(({ data }) => {
        setReq(data)
        setError('')
      })
      .catch((e) => setError(errorMessage(e)))
  }, [id])

  useEffect(() => {
    setReq(null)
    load()
  }, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!req) return <Loading label="Loading requirement…" />

  const canEdit = ['draft', 'changes_requested'].includes(req.status) && (isOwner || req.created_by === user?.id)
  const canSubmit = canEdit
  const canReview = isOwner && req.status === 'awaiting_approval'
  const canCreateProject = req.status === 'approved'

  const submit = async () => {
    setBusy(true)
    try {
      await api.post(`/requirements/${req.id}/submit/`)
      toast.success('Submitted to owner for approval')
      load()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const review = (kind) => async (comments) => {
    await api.post(`/requirements/${req.id}/${kind}/`, { comments })
    toast.success(
      kind === 'approve' ? 'Requirement approved' : kind === 'reject' ? 'Requirement rejected' : 'Changes requested',
    )
    load()
  }

  const createProject = async (name) => {
    const { data } = await api.post(`/requirements/${req.id}/create_project/`, name ? { name } : {})
    toast.success('Project created')
    navigate(`/projects/${data.id}`)
  }

  return (
    <div className="page">
      <div>
        <Link to="/requirements" className="back-link"><ArrowLeft size={14} /> Requirements</Link>
        <div className="detail-head">
          <div>
            <h1>{req.requirement_id} <span className="muted" style={{ fontSize: 18 }}>v{req.version}</span></h1>
            <div className="detail-meta">
              <StatusBadge value={req.status} label={req.status_display} />
              <span>Client: <Link to={`/clients/${req.client}`}>{req.client_name}</Link></span>
              <span className="muted">By {req.created_by_name || '—'}</span>
            </div>
          </div>
          <div className="page-actions">
            {canEdit && (
              <Link to={`/requirements/${req.id}/edit`} className="btn btn-secondary"><Pencil size={15} /> Edit</Link>
            )}
            {canSubmit && (
              <button type="button" className="btn btn-primary" onClick={submit} disabled={busy}>
                <Send size={15} /> Submit to Owner
              </button>
            )}
            {canReview && (
              <>
                <button type="button" className="btn btn-success" onClick={() => setModal('approve')}><Check size={15} /> Approve</button>
                <button type="button" className="btn btn-warning" onClick={() => setModal('changes')}><MessageSquareWarning size={15} /> Request changes</button>
                <button type="button" className="btn btn-danger" onClick={() => setModal('reject')}><X size={15} /> Reject</button>
              </>
            )}
            {canCreateProject && (
              <button type="button" className="btn btn-primary" onClick={() => setModal('project')}>
                <FolderPlus size={15} /> Create project
              </button>
            )}
          </div>
        </div>
      </div>

      {req.owner_comments && (
        <div className={`alert ${req.status === 'approved' ? 'alert-info' : 'alert-warning'}`} style={{ marginBottom: 0 }}>
          <strong>Owner comments:</strong> {req.owner_comments}
        </div>
      )}

      <div className="card card-pad">
        <div className="kv-grid">
          <KV label="Company">{req.company}</KV>
          <KV label="Solution type">{req.solution_type}</KV>
          <KV label="Platforms">{req.required_platforms}</KV>
          <KV label="Timeline">{req.expected_timeline}</KV>
          <KV label="Client budget">{req.client_budget != null ? formatINR(req.client_budget) : null}</KV>
          <KV label="Estimated value">{formatINR(req.estimated_value)}</KV>
          <KV label="Submitted">{formatDateTime(req.submitted_at)}</KV>
          <KV label="Reviewed">{req.reviewed_at ? formatDateTime(req.reviewed_at) : null}</KV>
          <KV label="Created">{formatDate(req.created_at)}</KV>
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.title} className="card">
          <div className="card-header"><h3>{s.title}</h3></div>
          <div className="card-body">
            <div className="kv-grid">
              {s.items.map(([key, label]) => (
                <KV key={key} label={label} wide>{req[key]}</KV>
              ))}
            </div>
          </div>
        </div>
      ))}

      {modal === 'approve' && (
        <ActionModal
          title="Approve requirement"
          description={`Approve ${req.requirement_id} for ${req.client_name}?`}
          label="Comments (optional)"
          confirmLabel="Approve"
          tone="success"
          onSubmit={review('approve')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'changes' && (
        <ActionModal
          title="Request changes"
          description="Tell the project manager what needs to change before approval."
          label="What needs to change?"
          required
          confirmLabel="Request changes"
          tone="primary"
          onSubmit={review('request_changes')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'reject' && (
        <ActionModal
          title="Reject requirement"
          label="Reason"
          required
          confirmLabel="Reject"
          tone="danger"
          onSubmit={review('reject')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'project' && (
        <ActionModal
          title="Create project"
          description="A project will be created from this approved requirement (scope and value are copied over)."
          label="Project name"
          inputType="text"
          defaultValue={`${req.client_name} – ${req.solution_type || 'Project'}`}
          confirmLabel="Create project"
          onSubmit={createProject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
