import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import EntityForm from '../components/EntityForm.jsx'
import Loading, { ErrorState } from '../components/Loading.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { SERVICE_TYPES } from '../config/options.js'

export const requirementFields = [
  { section: 'Overview' },
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients', required: true },
  { name: 'company', label: 'Company' },
  { name: 'solution_type', label: 'Solution type', suggestions: SERVICE_TYPES },
  { name: 'required_platforms', label: 'Required platforms', placeholder: 'Web, Android, iOS…' },
  { name: 'expected_timeline', label: 'Expected timeline', placeholder: 'e.g. 8–10 weeks' },
  { name: 'client_budget', label: 'Client budget (₹)', type: 'number' },
  { name: 'estimated_value', label: 'Our estimated value (₹)', type: 'number' },
  { section: 'Business context' },
  { name: 'business_objective', label: 'Business objective', type: 'textarea' },
  { name: 'current_problem', label: 'Current problem', type: 'textarea' },
  { name: 'user_types', label: 'User types', type: 'textarea' },
  { section: 'Features' },
  { name: 'customer_features', label: 'Customer features', type: 'textarea' },
  { name: 'staff_features', label: 'Staff features', type: 'textarea' },
  { name: 'admin_features', label: 'Admin features', type: 'textarea' },
  { name: 'detailed_features', label: 'Detailed features', type: 'textarea' },
  { name: 'essential_features', label: 'Essential features (MVP)', type: 'textarea' },
  { name: 'future_features', label: 'Future features', type: 'textarea' },
  { section: 'Technical' },
  { name: 'integrations', label: 'Integrations', type: 'textarea' },
  { name: 'payment_requirements', label: 'Payment requirements', type: 'textarea' },
  { name: 'notifications', label: 'Notifications', type: 'textarea' },
  { name: 'location_gps', label: 'Location / GPS', type: 'textarea' },
  { name: 'reference_apps', label: 'Reference apps / sites', type: 'textarea' },
  { section: 'Notes' },
  { name: 'meeting_notes', label: 'Meeting notes', type: 'textarea' },
  { name: 'clarification_questions', label: 'Clarification questions', type: 'textarea' },
]

export default function RequirementForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [requirement, setRequirement] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const submittedRef = useRef(false)

  useEffect(() => {
    if (!id) return undefined
    let alive = true
    api
      .get(`/requirements/${id}/`)
      .then(({ data }) => alive && setRequirement(data))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const initial = useMemo(() => {
    if (requirement) return requirement
    const c = searchParams.get('client')
    return c ? { client: Number(c) } : undefined
  }, [requirement, searchParams])

  if (loading) return <Loading label="Loading requirement…" />
  if (error) return <ErrorState message={error} />

  const locked = requirement && !['draft', 'changes_requested'].includes(requirement.status)

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div>
        <Link to={id ? `/requirements/${id}` : '/requirements'} className="back-link">
          <ArrowLeft size={14} /> {id ? 'Back to requirement' : 'Requirements'}
        </Link>
        <div className="detail-head">
          <div>
            <h1>{id ? `Edit ${requirement?.requirement_id}` : 'New requirement'}</h1>
            {requirement && (
              <div className="detail-meta">
                <StatusBadge value={requirement.status} label={requirement.status_display} />
                <span className="muted">Version {requirement.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {requirement?.status === 'changes_requested' && requirement.owner_comments && (
        <div className="alert alert-warning" style={{ marginBottom: 0 }}>
          <strong>Owner requested changes:</strong> {requirement.owner_comments}
        </div>
      )}
      {locked && (
        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          This requirement is {requirement.status_display?.toLowerCase()} and can no longer be edited.
        </div>
      )}

      {!locked && (
        <div className="card card-pad">
          <EntityForm
            fields={requirementFields}
            endpoint="/requirements/"
            id={id}
            initial={initial}
            submitLabel="Save draft"
            cancelLabel="Cancel"
            onCancel={() => navigate(id ? `/requirements/${id}` : '/requirements')}
            extraSubmits={[
              {
                label: 'Submit to Owner',
                variant: 'success',
                after: async (saved) => {
                  await api.post(`/requirements/${saved.id}/submit/`)
                  submittedRef.current = true
                },
              },
            ]}
            onSaved={(saved) => {
              toast.success(submittedRef.current ? 'Submitted to owner for approval' : 'Draft saved')
              navigate(`/requirements/${saved.id}`)
            }}
          />
        </div>
      )}
    </div>
  )
}
