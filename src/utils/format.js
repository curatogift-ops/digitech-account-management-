const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function formatINR(value) {
  const n = Number(value)
  if (value === null || value === undefined || value === '' || Number.isNaN(n)) return '—'
  return inr.format(n)
}

/** Compact ₹ format for big dashboard numbers: ₹12.4 L, ₹1.2 Cr */
export function formatINRCompact(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`
  return inr.format(n)
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(value) {
  if (!value) return ''
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(value)
}

export function titleCase(str) {
  return String(str ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

/** ISO datetime -> value for <input type="datetime-local"> */
export function toInputDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return dateStr < todayISO()
}
