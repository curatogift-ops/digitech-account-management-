import { useCallback, useEffect, useState } from 'react'
import { Plus, Save } from 'lucide-react'
import api, { errorMessage, listAll } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import Loading from '../components/Loading.jsx'
import Modal from '../components/Modal.jsx'
import { formatDateTime, titleCase } from '../utils/format.js'

function ProfileCard() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await api.patch('/auth/me/', form)
      updateUser(data)
      toast.success('Profile updated')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="card-header"><h3>Profile</h3><span className="muted">@{user?.username} · {titleCase(user?.role)}</span></div>
      <div className="card-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <label className="field"><span className="field-label">First name</span><input className="input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} /></label>
          <label className="field"><span className="field-label">Last name</span><input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} /></label>
          <label className="field"><span className="field-label">Email</span><input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
          <label className="field"><span className="field-label">Phone</span><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
          <label className="field field-full"><span className="field-label">Designation</span><input className="input" value={form.designation} onChange={(e) => set('designation', e.target.value)} /></label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save profile'}</button>
        </div>
      </div>
    </form>
  )
}

function PasswordCard() {
  const toast = useToast()
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.new_password !== form.confirm) {
      setError('New passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await api.post('/auth/change-password/', { old_password: form.old_password, new_password: form.new_password })
      toast.success('Password changed')
      setForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="card-header"><h3>Change password</h3></div>
      <div className="card-body stack">
        {error && <div className="alert alert-error" style={{ marginBottom: 0 }}>{error}</div>}
        <label className="field"><span className="field-label">Current password</span><input className="input" type="password" autoComplete="current-password" value={form.old_password} onChange={(e) => set('old_password', e.target.value)} required /></label>
        <label className="field"><span className="field-label">New password</span><input className="input" type="password" autoComplete="new-password" value={form.new_password} onChange={(e) => set('new_password', e.target.value)} required /></label>
        <label className="field"><span className="field-label">Confirm new password</span><input className="input" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required /></label>
        <div className="form-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </div>
      </div>
    </form>
  )
}

function SettingModal({ setting, onClose, onSaved }) {
  const [key, setKey] = useState(setting?.key || '')
  const [value, setValue] = useState(setting ? JSON.stringify(setting.value, null, 2) : '{}')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    let parsed
    try {
      parsed = JSON.parse(value)
    } catch {
      setError('Value must be valid JSON.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (setting) await api.patch(`/settings/${setting.key}/`, { value: parsed })
      else await api.post('/settings/', { key, value: parsed })
      onSaved()
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal title={setting ? `Edit ${setting.key}` : 'New setting'} size="sm" onClose={onClose}>
      <form onSubmit={submit} className="stack">
        {error && <div className="alert alert-error" style={{ marginBottom: 0 }}>{error}</div>}
        <label className="field">
          <span className="field-label">Key</span>
          <input className="input" value={key} onChange={(e) => setKey(e.target.value)} disabled={Boolean(setting)} required />
        </label>
        <label className="field">
          <span className="field-label">Value (JSON)</span>
          <textarea className="input" rows={6} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <div className="form-actions" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}

function SystemSettings() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit

  const load = useCallback(() => {
    listAll('/settings/').then(setItems).catch((e) => {
      setItems([])
      toast.error(errorMessage(e))
    })
  }, [toast])

  useEffect(load, [load])

  return (
    <div className="card">
      <div className="card-header">
        <h3>System settings</h3>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}><Plus size={14} /> Add setting</button>
      </div>
      <div className="card-body">
        {!items ? <Loading block={false} /> : !items.length ? (
          <p className="muted">No system settings configured.</p>
        ) : (
          <ul className="list-plain">
            {items.map((s) => (
              <li key={s.key}>
                <div style={{ minWidth: 0 }}>
                  <div className="cell-title">{s.key}</div>
                  <div className="cell-sub" style={{ fontFamily: 'ui-monospace, monospace' }}>{JSON.stringify(s.value).slice(0, 90)}</div>
                  <div className="cell-sub">Updated {formatDateTime(s.updated_at)}</div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(s)}>Edit</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {editing !== undefined && (
        <SettingModal
          setting={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined)
            toast.success('Setting saved')
            load()
          }}
        />
      )}
    </div>
  )
}

export default function Settings() {
  const { isOwner } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage your profile, password and workspace preferences.</p>
        </div>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <ProfileCard />
        <PasswordCard />
      </div>
      {isOwner && <SystemSettings />}
    </div>
  )
}
