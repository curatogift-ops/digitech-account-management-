import { Check } from 'lucide-react'
import api, { errorMessage } from '../api/client.js'
import ResourcePage from '../components/ResourcePage.jsx'
import { followUpColumns } from '../config/columns.jsx'
import { followUpFields } from '../config/forms.js'
import { FOLLOWUP_METHOD, FOLLOWUP_STATUS } from '../config/options.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function FollowUps() {
  const { isOwner } = useAuth()

  const complete = async (f, { reload, toast }) => {
    try {
      await api.patch(`/followups/${f.id}/`, { status: 'completed' })
      toast.success('Follow-up marked completed')
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <ResourcePage
      title="Follow-ups"
      subtitle="Calls, meetings and reminders with clients and leads."
      endpoint="/followups/"
      entityName="follow-up"
      addLabel="Schedule follow-up"
      searchPlaceholder="Search notes, outcome, client…"
      columns={followUpColumns}
      filters={[
        { key: 'status', label: 'Status', options: FOLLOWUP_STATUS },
        { key: 'method', label: 'Method', options: FOLLOWUP_METHOD },
      ]}
      fields={followUpFields}
      modalSize="lg"
      canDelete={isOwner}
      rowActions={(f, helpers) =>
        f.status === 'scheduled' && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => complete(f, helpers)}>
            <Check size={14} /> Done
          </button>
        )
      }
    />
  )
}
