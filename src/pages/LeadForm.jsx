import EntityForm from '../components/EntityForm.jsx'
import { leadFields } from '../config/forms.js'

/** Create / edit form for a lead. Rendered inside a modal by Leads.jsx. */
export default function LeadForm({ lead, onSaved, onCancel }) {
  return (
    <EntityForm
      fields={leadFields}
      endpoint="/leads/"
      id={lead?.id}
      initial={lead}
      onSaved={onSaved}
      onCancel={onCancel}
      submitLabel={lead ? 'Save lead' : 'Create lead'}
    />
  )
}
