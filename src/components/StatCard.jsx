import { Link } from 'react-router-dom'

export default function StatCard({ label, value, hint, icon: Icon, tone = 'blue', to, alert }) {
  const body = (
    <>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className={`stat-icon tone-${tone}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </>
  )
  const cls = `stat-card${alert ? ' stat-alert' : ''}${to ? ' stat-link' : ''}`
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
