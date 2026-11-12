import ResourcePage from '../components/ResourcePage.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { projectColumns } from '../config/columns.jsx'
import { projectFields } from '../config/forms.js'
import { PRIORITY, PROJECT_STATUS } from '../config/options.js'

export default function Projects() {
  const { isOwner } = useAuth()
  return (
    <ResourcePage
      title="Projects"
      subtitle="Delivery status and outstanding balances."
      endpoint="/projects/"
      entityName="project"
      addLabel="Add project"
      searchPlaceholder="Search project, client, ID…"
      columns={projectColumns}
      filters={[
        { key: 'status', label: 'Status', options: PROJECT_STATUS },
        { key: 'priority', label: 'Priority', options: PRIORITY },
      ]}
      fields={projectFields}
      modalSize="lg"
      canDelete={isOwner}
      rowLink={(p) => `/projects/${p.id}`}
    />
  )
}
