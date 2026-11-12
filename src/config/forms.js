import * as O from './options.js'
import { formatINR, todayISO } from '../utils/format.js'

export const leadFields = [
  { section: 'Lead details' },
  { name: 'client_name', label: 'Client / Lead name', required: true },
  { name: 'company', label: 'Company' },
  { name: 'contact_person', label: 'Contact person' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'location', label: 'Location' },
  { name: 'business_type', label: 'Business type' },
  { name: 'required_service', label: 'Required service', suggestions: O.SERVICE_TYPES },
  { name: 'lead_source', label: 'Lead source', suggestions: O.LEAD_SOURCES },
  { section: 'Pipeline' },
  { name: 'enquiry_date', label: 'Enquiry date', type: 'date', default: todayISO() },
  { name: 'assigned_to', label: 'Assigned to', type: 'select', lookup: 'employees' },
  { name: 'estimated_value', label: 'Estimated value (₹)', type: 'number' },
  { name: 'client_budget', label: 'Client budget (₹)', type: 'number' },
  { name: 'priority', label: 'Priority', type: 'select', options: O.PRIORITY, default: 'medium' },
  { name: 'status', label: 'Status', type: 'select', options: O.LEAD_STATUS, default: 'new' },
  { name: 'next_follow_up', label: 'Next follow-up', type: 'datetime' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const clientFields = [
  { section: 'Client details' },
  { name: 'client_name', label: 'Client name', required: true },
  { name: 'company_name', label: 'Company name' },
  { name: 'contact_person', label: 'Contact person' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'alternate_phone', label: 'Alternate phone', type: 'tel' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
  { name: 'location', label: 'Location' },
  { name: 'industry', label: 'Industry' },
  { name: 'business_type', label: 'Business type' },
  { name: 'gst_details', label: 'GST number' },
  { name: 'lead_source', label: 'Lead source', suggestions: O.LEAD_SOURCES },
  { section: 'Account' },
  { name: 'assigned_pm', label: 'Assigned PM', type: 'select', lookup: 'employees' },
  { name: 'status', label: 'Status', type: 'select', options: O.CLIENT_STATUS, default: 'active' },
  { name: 'address', label: 'Address', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const projectFields = [
  { name: 'name', label: 'Project name', required: true, full: true },
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients', required: true },
  { name: 'service_type', label: 'Service type', suggestions: O.SERVICE_TYPES },
  { name: 'project_value', label: 'Project value (₹)', type: 'number' },
  { name: 'advance_amount', label: 'Advance amount (₹)', type: 'number' },
  { name: 'assigned_pm', label: 'Assigned PM', type: 'select', lookup: 'employees' },
  { name: 'priority', label: 'Priority', type: 'select', options: O.PRIORITY, default: 'medium' },
  { name: 'status', label: 'Status', type: 'select', options: O.PROJECT_STATUS, default: 'not_started' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'expected_completion', label: 'Expected completion', type: 'date' },
  { name: 'actual_completion', label: 'Actual completion', type: 'date', editOnly: true },
  { name: 'approved_scope', label: 'Approved scope', type: 'textarea' },
  { name: 'payment_schedule', label: 'Payment schedule', type: 'textarea' },
  { name: 'blockers', label: 'Blockers', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const taskFields = [
  { name: 'title', label: 'Task title', required: true, full: true },
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients' },
  { name: 'project', label: 'Project', type: 'select', lookup: 'projects' },
  { name: 'assigned_to', label: 'Assigned to', type: 'select', lookup: 'employees' },
  { name: 'priority', label: 'Priority', type: 'select', options: O.PRIORITY, default: 'medium' },
  { name: 'status', label: 'Status', type: 'select', options: O.TASK_STATUS, default: 'todo' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'due_date', label: 'Due date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'comments', label: 'Comments', type: 'textarea' },
]

export const pendingFields = [
  { name: 'description', label: 'What is pending?', type: 'textarea', required: true },
  { name: 'category', label: 'Category', type: 'select', options: O.PENDING_CATEGORY, default: 'client' },
  { name: 'priority', label: 'Priority', type: 'select', options: O.PRIORITY, default: 'medium' },
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients' },
  { name: 'project', label: 'Project', type: 'select', lookup: 'projects' },
  { name: 'responsible', label: 'Responsible', type: 'select', lookup: 'employees' },
  { name: 'due_date', label: 'Due date', type: 'date' },
  { name: 'latest_update', label: 'Latest update', type: 'textarea' },
  { name: 'next_action', label: 'Next action', type: 'textarea' },
]

export const followUpFields = [
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients' },
  { name: 'lead', label: 'Lead', type: 'select', lookup: 'leads' },
  { name: 'project', label: 'Project', type: 'select', lookup: 'projects' },
  { name: 'employee', label: 'Assigned to', type: 'select', lookup: 'employees', ownerOnly: true },
  { name: 'scheduled_at', label: 'Scheduled for', type: 'datetime', required: true },
  { name: 'method', label: 'Method', type: 'select', options: O.FOLLOWUP_METHOD, default: 'call' },
  { name: 'status', label: 'Status', type: 'select', options: O.FOLLOWUP_STATUS, default: 'scheduled' },
  { name: 'next_follow_up', label: 'Next follow-up', type: 'datetime' },
  { name: 'discussion_notes', label: 'Discussion notes', type: 'textarea' },
  { name: 'outcome', label: 'Outcome', type: 'textarea' },
  { name: 'next_action', label: 'Next action', type: 'textarea' },
]

export const paymentFields = [
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients', required: true },
  {
    name: 'project',
    label: 'Project',
    type: 'select',
    lookup: 'projects',
    required: true,
    dependsOn: 'client',
    lookupFilter: (row, values) => !values.client || String(row.client) === String(values.client),
    hint: (values, { lookups }) => {
      const p = (lookups.projects || []).find((x) => String(x.id) === String(values.project))
      return p
        ? `Project value ${formatINR(p.project_value)} · Verified ${formatINR(p.total_verified_payments)} · Outstanding ${formatINR(p.outstanding_balance)}`
        : null
    },
  },
  { name: 'amount', label: 'Amount received (₹)', type: 'number', required: true },
  { name: 'payment_date', label: 'Payment date', type: 'date', required: true, default: todayISO() },
  { name: 'method', label: 'Method', type: 'select', options: O.PAYMENT_METHOD, default: 'upi' },
  { name: 'transaction_reference', label: 'Transaction / UTR reference' },
  { name: 'proof', label: 'Payment proof (screenshot / receipt)', type: 'file', accept: 'image/*,.pdf', full: true },
  { name: 'collection_notes', label: 'Collection notes', type: 'textarea' },
]

export const expenseFields = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'category', label: 'Category', suggestions: O.EXPENSE_CATEGORIES },
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
  { name: 'expense_date', label: 'Expense date', type: 'date', required: true, default: todayISO() },
  { name: 'project', label: 'Project', type: 'select', lookup: 'projects' },
  { name: 'status', label: 'Status', type: 'select', options: O.EXPENSE_STATUS, default: 'submitted', ownerOnly: true },
  { name: 'receipt', label: 'Receipt', type: 'file', accept: 'image/*,.pdf', full: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const invoiceFields = [
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients', required: true },
  {
    name: 'project',
    label: 'Project',
    type: 'select',
    lookup: 'projects',
    dependsOn: 'client',
    lookupFilter: (row, values) => !values.client || String(row.client) === String(values.client),
  },
  { name: 'invoice_date', label: 'Invoice date', type: 'date', required: true, default: todayISO() },
  { name: 'due_date', label: 'Due date', type: 'date' },
  { name: 'taxable_amount', label: 'Taxable amount (₹)', type: 'number', required: true },
  { name: 'tax_amount', label: 'Tax / GST amount (₹)', type: 'number' },
  { name: 'total_amount', label: 'Total amount (₹)', type: 'number', help: 'Leave blank to use taxable + tax.' },
  { name: 'paid_amount', label: 'Paid so far (₹)', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: O.INVOICE_STATUS, default: 'draft' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const documentFields = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'category', label: 'Category', type: 'select', options: O.DOCUMENT_CATEGORY, default: 'other' },
  { name: 'client', label: 'Client', type: 'select', lookup: 'clients' },
  { name: 'project', label: 'Project', type: 'select', lookup: 'projects' },
  { name: 'file', label: 'File', type: 'file', requiredOnCreate: true, full: true },
  { name: 'is_sensitive', label: 'Sensitive', type: 'checkbox', checkLabel: 'Mark as sensitive (Owner access only)' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export const employeeFields = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'last_name', label: 'Last name' },
  { name: 'username', label: 'Username', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password', required: true, createOnly: true },
  { name: 'role', label: 'Role', type: 'select', options: O.ROLES, default: 'project_manager', required: true },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'designation', label: 'Designation' },
  { name: 'is_active_employee', label: 'Active', type: 'checkbox', checkLabel: 'Active employee', editOnly: true },
]

export const approvalFields = [
  { name: 'action_type', label: 'Action requested', type: 'select', options: O.APPROVAL_ACTION, required: true, full: true },
  { name: 'reason', label: 'Reason', type: 'textarea', required: true, rows: 4 },
]

export const exportFields = [
  { name: 'export_type', label: 'What do you need exported?', required: true, suggestions: O.EXPORT_TYPES },
  { name: 'format', label: 'Format', type: 'select', options: O.EXPORT_FORMAT, default: 'csv' },
  { name: 'reason', label: 'Reason', type: 'textarea', required: true, rows: 4 },
]
