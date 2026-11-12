import { useState } from 'react'
import Modal from './Modal.jsx'
import { errorMessage } from '../api/client.js'

/**
 * Small modal asking for optional/required notes, then runs `onSubmit(text)`.
 * Used for approve / reject / request-changes style actions.
 */
export default function ActionModal({
  title,
  description,
  label = 'Notes',
  placeholder,
  required = false,
  confirmLabel = 'Confirm',
  tone = 'primary',
  inputType = 'textarea',
  defaultValue = '',
  onSubmit,
  onClose,
}) {
  const [text, setText] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit(text.trim())
      onClose()
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="action-modal-form" className={`btn btn-${tone}`} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <form id="action-modal-form" onSubmit={submit} className="stack">
        {description && <p className="muted">{description}</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {inputType !== 'none' && (
        <label className="field">
          <span className="field-label">
            {label}
            {required && <em className="req">*</em>}
          </span>
          {inputType === 'textarea' ? (
            <textarea
              className="input"
              rows={4}
              value={text}
              placeholder={placeholder}
              required={required}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="input"
              type={inputType}
              value={text}
              placeholder={placeholder}
              required={required}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          )}
        </label>
        )}
      </form>
    </Modal>
  )
}
