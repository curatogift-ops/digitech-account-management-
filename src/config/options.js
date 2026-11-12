const opts = (pairs) => pairs.map(([value, label]) => ({ value, label }))

export const PRIORITY = opts([
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
  ['urgent', 'Urgent'],
])

export const LEAD_STATUS = opts([
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['discussion', 'Discussion'],
  ['requirement_collected', 'Requirement Collected'],
  ['proposal_sent', 'Proposal Sent'],
  ['negotiation', 'Negotiation'],
  ['confirmed', 'Confirmed'],
  ['lost', 'Lost'],
  ['on_hold', 'On Hold'],
])

export const CLIENT_STATUS = opts([
  ['active', 'Active'],
  ['inactive', 'Inactive'],
  ['on_hold', 'On Hold'],
  ['archived', 'Archived'],
])

export const REQUIREMENT_STATUS = opts([
  ['draft', 'Draft'],
  ['awaiting_approval', 'Awaiting Owner Approval'],
  ['changes_requested', 'Changes Requested'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['superseded', 'Superseded'],
])

export const PROJECT_STATUS = opts([
  ['not_started', 'Not Started'],
  ['planning', 'Planning'],
  ['uiux', 'UI/UX Design'],
  ['design_approval', 'Design Approval'],
  ['development', 'Development'],
  ['internal_testing', 'Internal Testing'],
  ['client_review', 'Client Review'],
  ['revisions', 'Revisions'],
  ['ready_for_launch', 'Ready for Launch'],
  ['completed', 'Completed'],
  ['on_hold', 'On Hold'],
  ['cancelled', 'Cancelled'],
])

export const MILESTONE_STATUS = opts([
  ['pending', 'Pending'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['delayed', 'Delayed'],
])

export const TASK_STATUS = opts([
  ['todo', 'To Do'],
  ['in_progress', 'In Progress'],
  ['review', 'Review'],
  ['done', 'Done'],
  ['blocked', 'Blocked'],
])

export const PENDING_CATEGORY = opts([
  ['client', 'Pending from Client'],
  ['developer', 'Pending from Developer'],
  ['internal', 'Pending Internally'],
  ['owner_approval', 'Pending Owner Approval'],
  ['completed', 'Completed'],
])

export const FOLLOWUP_METHOD = opts([
  ['call', 'Call'],
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp'],
  ['meeting', 'Meeting'],
  ['other', 'Other'],
])

export const FOLLOWUP_STATUS = opts([
  ['scheduled', 'Scheduled'],
  ['completed', 'Completed'],
  ['missed', 'Missed'],
  ['cancelled', 'Cancelled'],
])

export const PAYMENT_STATUS = opts([
  ['pending_verification', 'Pending Verification'],
  ['verified', 'Verified'],
  ['rejected', 'Rejected'],
  ['refunded', 'Refunded'],
])

export const PAYMENT_METHOD = opts([
  ['bank_transfer', 'Bank Transfer'],
  ['upi', 'UPI'],
  ['cash', 'Cash'],
  ['cheque', 'Cheque'],
  ['card', 'Card'],
  ['other', 'Other'],
])

export const EXPENSE_STATUS = opts([
  ['draft', 'Draft'],
  ['submitted', 'Submitted'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['paid', 'Paid'],
])

export const INVOICE_STATUS = opts([
  ['draft', 'Draft'],
  ['sent', 'Sent'],
  ['partially_paid', 'Partially Paid'],
  ['paid', 'Paid'],
  ['overdue', 'Overdue'],
  ['cancelled', 'Cancelled'],
])

export const DOCUMENT_CATEGORY = opts([
  ['client_info', 'Client Information'],
  ['requirements', 'Requirements'],
  ['proposal', 'Proposal'],
  ['quotation', 'Quotation'],
  ['agreement', 'Agreement'],
  ['uiux', 'UI/UX'],
  ['development', 'Development'],
  ['testing', 'Testing'],
  ['invoice', 'Invoice'],
  ['receipt', 'Receipt'],
  ['final_delivery', 'Final Delivery'],
  ['other', 'Other'],
])

export const APPROVAL_STATUS = opts([
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['expired', 'Expired'],
  ['used', 'Used'],
])

export const APPROVAL_ACTION = opts([
  ['export_clients', 'Export Client Database'],
  ['export_financial', 'Export Financial Records'],
  ['export_bulk', 'Export Bulk Client Info'],
  ['delete_record', 'Permanent Deletion'],
  ['edit_verified_payment', 'Edit Verified Payment'],
  ['download_sensitive', 'Download Restricted Document'],
  ['change_permissions', 'Change Permissions'],
  ['access_restricted_report', 'Access Restricted Report'],
  ['other', 'Other Sensitive Action'],
])

export const EXPORT_STATUS = opts([
  ['pending', 'Pending'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['completed', 'Completed'],
])

export const EXPORT_FORMAT = opts([
  ['csv', 'CSV'],
  ['excel', 'Excel'],
  ['pdf', 'PDF'],
])

export const EXPORT_TYPES = opts([
  ['Client database', 'Client database'],
  ['Leads', 'Leads'],
  ['Projects', 'Projects'],
  ['Payments', 'Payments'],
  ['Expenses', 'Expenses'],
  ['Invoices', 'Invoices'],
  ['Activity logs', 'Activity logs'],
])

export const ROLES = opts([
  ['owner', 'Owner / Super Admin'],
  ['project_manager', 'Employee / Project Manager'],
  ['developer', 'Developer'],
])

export const SERVICE_TYPES = opts([
  ['Website', 'Website'],
  ['Mobile App', 'Mobile App'],
  ['Web App', 'Web App'],
  ['E-commerce', 'E-commerce'],
  ['CRM / ERP', 'CRM / ERP'],
  ['UI/UX Design', 'UI/UX Design'],
  ['Digital Marketing', 'Digital Marketing'],
  ['Maintenance', 'Maintenance'],
  ['Other', 'Other'],
])

export const LEAD_SOURCES = opts([
  ['Referral', 'Referral'],
  ['Website', 'Website'],
  ['Social Media', 'Social Media'],
  ['Cold Call', 'Cold Call'],
  ['Walk-in', 'Walk-in'],
  ['Event', 'Event'],
  ['Other', 'Other'],
])

export const EXPENSE_CATEGORIES = opts([
  ['Salaries', 'Salaries'],
  ['Software & Tools', 'Software & Tools'],
  ['Hosting & Domains', 'Hosting & Domains'],
  ['Marketing', 'Marketing'],
  ['Travel', 'Travel'],
  ['Office', 'Office'],
  ['Freelancers', 'Freelancers'],
  ['Other', 'Other'],
])
