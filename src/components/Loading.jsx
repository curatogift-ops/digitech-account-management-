import { Inbox } from 'lucide-react'

export function Spinner({ size = 20 }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />
}

export default function Loading({ label = 'Loading…', block = true }) {
  return (
    <div className={block ? 'loading-block' : 'loading-inline'}>
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', hint, action, icon: Icon = Inbox }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <strong>{title}</strong>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty empty-error">
      <strong>Couldn’t load data</strong>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
