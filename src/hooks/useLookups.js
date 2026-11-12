import { useEffect, useState } from 'react'
import { listAll } from '../api/client.js'

export const LOOKUPS = {
  clients: {
    path: '/clients/',
    label: (c) => `${c.client_name}${c.company_name ? ` · ${c.company_name}` : ''}`,
  },
  projects: {
    path: '/projects/',
    label: (p) => `${p.project_id} · ${p.name}`,
  },
  employees: {
    path: '/employees/',
    params: { is_active: true },
    label: (u) => u.display_name || u.username,
  },
  leads: {
    path: '/leads/',
    label: (l) => `${l.lead_id} · ${l.client_name}`,
  },
}

let cache = {}

export function clearLookups() {
  cache = {}
}

function load(name) {
  if (!cache[name]) {
    const def = LOOKUPS[name]
    cache[name] = listAll(def.path, def.params || {}).catch((e) => {
      delete cache[name]
      throw e
    })
  }
  return cache[name]
}

export function lookupOptions(name, rows, filterFn) {
  const def = LOOKUPS[name]
  return (rows || [])
    .filter((r) => (filterFn ? filterFn(r) : true))
    .map((r) => ({ value: r.id, label: def.label(r) }))
}

/** Load (and cache) reference lists used by dropdowns. */
export default function useLookups(names) {
  const key = [...new Set(names)].sort().join(',')
  const [state, setState] = useState({ loading: Boolean(key), data: {} })

  useEffect(() => {
    let alive = true
    const list = key ? key.split(',') : []
    if (!list.length) {
      setState({ loading: false, data: {} })
      return undefined
    }
    setState((s) => ({ ...s, loading: true }))
    Promise.all(list.map((n) => load(n).catch(() => [])))
      .then((arr) => {
        if (!alive) return
        setState({ loading: false, data: Object.fromEntries(list.map((n, i) => [n, arr[i]])) })
      })
      .catch(() => alive && setState({ loading: false, data: {} }))
    return () => {
      alive = false
    }
  }, [key])

  return state
}
