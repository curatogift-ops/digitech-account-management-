import { titleCase } from '../utils/format.js'

const TONES = {
  success: [
    'active', 'confirmed', 'approved', 'verified', 'completed', 'done', 'paid', 'ready_for_launch',
    'converted', 'granted', 'used',
  ],
  warning: [
    'pending', 'pending_verification', 'awaiting_approval', 'scheduled', 'submitted', 'review',
    'partially_paid', 'changes_requested', 'negotiation', 'proposal_sent', 'high', 'client_review',
    'design_approval', 'revisions', 'internal_testing', 'sent', 'delayed', 'owner_approval',
  ],
  danger: [
    'rejected', 'lost', 'overdue', 'blocked', 'missed', 'cancelled', 'urgent', 'expired', 'refunded',
  ],
  info: [
    'new', 'contacted', 'discussion', 'requirement_collected', 'in_progress', 'planning', 'uiux',
    'development', 'medium', 'todo', 'client', 'developer', 'internal',
  ],
}

function toneFor(value) {
  const v = String(value ?? '').toLowerCase()
  for (const [tone, list] of Object.entries(TONES)) {
    if (list.includes(v)) return tone
  }
  return 'neutral'
}

export default function StatusBadge({ status, value, label, tone }) {
  const resolved = value ?? status
  if (!resolved && !label) return <span className="muted">—</span>
  return (
    <span className={`status badge badge-${tone || toneFor(resolved)} ${String(resolved || '').toLowerCase()}`}>
      {label || titleCase(resolved)}
    </span>
  )
}
