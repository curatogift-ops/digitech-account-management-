import { useMemo, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../api/client.js'
import useLookups, { clearLookups, lookupOptions } from '../hooks/useLookups.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toInputDateTime } from '../utils/format.js'

const TEXTY = ['text', 'textarea', 'email', 'tel', 'url', 'password']

/**
 * Generic create/edit form driven by a field config.
 *
 * field: { name, label, type, required, options, lookup, lookupFilter, suggestions,
 *          full, placeholder, step, rows, help, ownerOnly, createOnly, editOnly,
 *          hint(values, ctx) }
 * A `{ section: 'Title' }` entry renders a section heading.
 */
export default function EntityForm({
  fields,
  initial,
  endpoint,
  id,
  onSaved,
  onCancel,
  transform,
  submitLabel,
  extraSubmits = [],
  fixed,
  cancelLabel = 'Cancel',
}) {
  const { isOwner } = useAuth()
  const isEdit = Boolean(id)

  const visible = useMemo(
    () =>
      fields.filter((f) => {
        if (f.ownerOnly && !isOwner) return false
        if (f.createOnly && isEdit) return false
        if (f.editOnly && !isEdit) return false
        return true
      }),
    [fields, isOwner, isEdit],
  )

  const lookupNames = useMemo(() => visible.filter((f) => f.lookup).map((f) => f.lookup), [visible])
  const { data: lookups } = useLookups(lookupNames)

  const [values, setValues] = useState(() => {
    const v = {}
    fields.forEach((f) => {
      if (f.section) return
      let val = initial?.[f.name]
      if (val === undefined || val === null) val = f.default
      if (f.type === 'datetime') val = toInputDateTime(val)
      if (f.type === 'checkbox') val = Boolean(val)
      if (f.type === 'file') val = null
      v[f.name] = val ?? ''
    })
    return v
  })
  const [createdId, setCreatedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const set = (name, val) => {
    setValues((prev) => {
      const next = { ...prev, [name]: val }
      // Clear dependent selects (e.g. project when client changes)
      fields.forEach((f) => {
        if (f.dependsOn === name) next[f.name] = ''
      })
      return next
    })
    setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const buildPayload = () => {
    const payload = {}
    let hasFile = false
    visible.forEach((f) => {
      if (f.section) return
      const v = values[f.name]
      if (f.type === 'file') {
        if (v instanceof File) {
          payload[f.name] = v
          hasFile = true
        }
        return
      }
      if (f.type === 'checkbox') {
        payload[f.name] = Boolean(v)
        return
      }
      if (v === '' || v === undefined || v === null) {
        if (TEXTY.includes(f.type || 'text')) payload[f.name] = ''
        else if (isEdit) payload[f.name] = null
        return
      }
      payload[f.name] = v
    })
    Object.assign(payload, fixed || {})
    const final = transform ? transform(payload, values) : payload
    if (!hasFile) return { body: final, multipart: false }
    const fd = new FormData()
    Object.entries(final).forEach(([k, v]) => {
      if (v === null || v === undefined) return
      fd.append(k, typeof v === 'boolean' ? String(v) : v)
    })
    return { body: fd, multipart: true }
  }

  const save = async (after) => {
    setBusy(true)
    setError('')
    setErrors({})
    try {
      const { body } = buildPayload()
      const effId = id || createdId
      const { data } = effId ? await api.patch(`${endpoint}${effId}/`, body) : await api.post(endpoint, body)
      if (!effId) setCreatedId(data.id) // if a follow-up step fails, a retry updates instead of duplicating
      clearLookups()
      if (after) await after(data)
      onSaved?.(data)
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
      setBusy(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const which = e.nativeEvent.submitter?.dataset?.extra
    const extra = which !== undefined ? extraSubmits[Number(which)] : null
    save(extra?.after)
  }

  const ctx = { values, lookups, isEdit, isOwner }

  const renderControl = (f) => {
    const val = values[f.name]
    const common = {
      id: `f-${f.name}`,
      name: f.name,
      required: f.required || (f.requiredOnCreate && !isEdit),
      disabled: f.disabled,
    }
    const type = f.type || 'text'

    if (type === 'textarea') {
      return (
        <textarea
          {...common}
          className="input"
          rows={f.rows || 3}
          placeholder={f.placeholder}
          value={val}
          onChange={(e) => set(f.name, e.target.value)}
        />
      )
    }
    if (type === 'select') {
      let options = f.options || []
      if (f.lookup) {
        const filterFn = f.lookupFilter ? (row) => f.lookupFilter(row, values) : undefined
        options = lookupOptions(f.lookup, lookups[f.lookup], filterFn)
      }
      return (
        <select {...common} className="input" value={val} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">{f.placeholder || (f.required ? 'Select…' : '— None —')}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    }
    if (type === 'checkbox') {
      return (
        <label className="check">
          <input
            type="checkbox"
            id={common.id}
            name={f.name}
            checked={Boolean(val)}
            onChange={(e) => set(f.name, e.target.checked)}
          />
          <span>{f.checkLabel || f.label}</span>
        </label>
      )
    }
    if (type === 'file') {
      return (
        <input
          {...common}
          className="input"
          type="file"
          accept={f.accept}
          onChange={(e) => set(f.name, e.target.files?.[0] || null)}
        />
      )
    }
    const listId = f.suggestions ? `dl-${f.name}` : undefined
    return (
      <>
        <input
          {...common}
          className="input"
          type={type === 'datetime' ? 'datetime-local' : type}
          step={type === 'number' ? f.step || '0.01' : undefined}
          min={type === 'number' ? (f.min ?? 0) : undefined}
          placeholder={f.placeholder}
          value={val}
          list={listId}
          onChange={(e) => set(f.name, e.target.value)}
        />
        {listId && (
          <datalist id={listId}>
            {f.suggestions.map((o) => (
              <option key={o.value} value={o.value} />
            ))}
          </datalist>
        )}
      </>
    )
  }

  return (
    <form onSubmit={onSubmit} className="entity-form">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-grid">
        {visible.map((f, i) => {
          if (f.section) {
            return (
              <h3 key={`s-${i}`} className="form-section">
                {f.section}
              </h3>
            )
          }
          const hint = f.hint ? f.hint(values, ctx) : null
          return (
            <div key={f.name} className={`field${f.full || f.type === 'textarea' ? ' field-full' : ''}`}>
              {f.type !== 'checkbox' && (
                <label className="field-label" htmlFor={`f-${f.name}`}>
                  {f.label}
                  {f.required && <em className="req">*</em>}
                </label>
              )}
              {renderControl(f)}
              {errors[f.name] && <span className="field-error">{errors[f.name]}</span>}
              {hint && <span className="field-hint">{hint}</span>}
              {f.help && !hint && <span className="field-hint">{f.help}</span>}
            </div>
          )
        })}
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
        )}
        {extraSubmits.map((x, i) => (
          <button
            key={x.label}
            type="submit"
            data-extra={i}
            className={`btn btn-${x.variant || 'secondary'}`}
            disabled={busy}
          >
            {x.label}
          </button>
        ))}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel || (isEdit ? 'Save changes' : 'Create')}
        </button>
      </div>
    </form>
  )
}
