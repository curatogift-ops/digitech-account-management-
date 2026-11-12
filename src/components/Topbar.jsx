import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, LogOut, Menu, Search } from 'lucide-react'
import api, { listAll } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import useDebounce from '../hooks/useDebounce.js'
import { timeAgo, titleCase } from '../utils/format.js'
import { Spinner } from './Loading.jsx'

// Notification links come from the backend (e.g. /requirements/5). Map them to real routes.
function resolveLink(link) {
  if (!link) return null
  const [, first, second] = link.split('?')[0].split('/')
  const hasDetail = ['requirements', 'projects', 'clients'].includes(first)
  if (hasDetail && second) return `/${first}/${second}`
  return first ? `/${first}` : null
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && handler()
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler])
}

function GlobalSearch() {
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 300)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const ref = useRef(null)
  const navigate = useNavigate()
  const close = useCallback(() => setOpen(false), [])
  useOutsideClick(ref, close)

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults(null)
      return undefined
    }
    let alive = true
    setLoading(true)
    api
      .get('/search/', { params: { q: debounced.trim() } })
      .then(({ data }) => alive && setResults(data.results || {}))
      .catch(() => alive && setResults({}))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [debounced])

  const go = (path) => {
    setOpen(false)
    setQ('')
    navigate(path)
  }

  const groups = [
    {
      key: 'clients',
      label: 'Clients',
      items: (results?.clients || []).map((c) => ({
        id: c.id,
        title: c.client_name,
        sub: `${c.client_id}${c.company_name ? ` · ${c.company_name}` : ''}`,
        path: `/clients/${c.id}`,
      })),
    },
    {
      key: 'projects',
      label: 'Projects',
      items: (results?.projects || []).map((p) => ({
        id: p.id,
        title: p.name,
        sub: `${p.project_id} · ${p.client_name}`,
        path: `/projects/${p.id}`,
      })),
    },
    {
      key: 'leads',
      label: 'Leads',
      items: (results?.leads || []).map((l) => ({
        id: l.id,
        title: l.client_name,
        sub: `${l.lead_id} · ${titleCase(l.status)}`,
        path: `/leads?q=${encodeURIComponent(l.lead_id)}`,
      })),
    },
  ].filter((g) => g.items.length)

  return (
    <div className="global-search" ref={ref}>
      <Search size={16} />
      <input
        type="search"
        placeholder="Search clients, projects, leads…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        aria-label="Global search"
      />
      {open && q.trim().length >= 2 && (
        <div className="dropdown search-dropdown">
          {loading && (
            <div className="dropdown-note">
              <Spinner size={14} /> Searching…
            </div>
          )}
          {!loading && !groups.length && <div className="dropdown-note">No results for “{q}”</div>}
          {groups.map((g) => (
            <div key={g.key}>
              <div className="dropdown-heading">{g.label}</div>
              {g.items.map((it) => (
                <button key={`${g.key}-${it.id}`} type="button" className="dropdown-item" onClick={() => go(it.path)}>
                  <strong>{it.title}</strong>
                  <span className="muted">{it.sub}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationBell() {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const close = useCallback(() => setOpen(false), [])
  useOutsideClick(ref, close)

  const load = useCallback(() => {
    listAll('/notifications/')
      .then(setItems)
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  const unread = items.filter((n) => !n.is_read).length

  const markAll = async () => {
    await api.post('/notifications/mark_all_read/').catch(() => {})
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const openItem = async (n) => {
    setOpen(false)
    if (!n.is_read) {
      api.post(`/notifications/${n.id}/mark_read/`).catch(() => {})
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
    }
    const path = resolveLink(n.link)
    if (path) navigate(path)
  }

  return (
    <div className="bell-wrap" ref={ref}>
      <button
        type="button"
        className="icon-btn bell"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) load()
        }}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell size={19} />
        {unread > 0 && <span className="bell-count">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && (
        <div className="dropdown notif-dropdown">
          <div className="dropdown-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="link-btn" onClick={markAll}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {!items.length && <div className="dropdown-note">You’re all caught up.</div>}
            {items.slice(0, 30).map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notif-item${n.is_read ? '' : ' unread'}`}
                onClick={() => openItem(n)}
              >
                <strong>{n.title}</strong>
                {n.message && <span>{n.message}</span>}
                <small className="muted">{timeAgo(n.created_at)}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Topbar({ onMenu }) {
  const { user, isOwner, logout } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setMenu(false), [])
  useOutsideClick(ref, close)

  const initials = (user?.display_name || user?.username || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <GlobalSearch />
      <div className="topbar-right">
        <NotificationBell />
        <div className="user-wrap" ref={ref}>
          <button type="button" className="user-chip" onClick={() => setMenu((m) => !m)}>
            <span className="avatar">{initials}</span>
            <span className="user-meta">
              <strong>{user?.display_name || user?.username}</strong>
              <small>{isOwner ? 'Owner' : titleCase(user?.role)}</small>
            </span>
          </button>
          {menu && (
            <div className="dropdown user-dropdown">
              <Link to="/settings" className="dropdown-item" onClick={() => setMenu(false)}>
                Profile & Settings
              </Link>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}