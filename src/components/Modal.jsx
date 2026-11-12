import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open = true,
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'md',
  wide = false,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, open])

  if (!open) return null

  const sizeClass = wide ? 'modal-lg' : `modal-${size}`

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${sizeClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
